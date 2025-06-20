import React, { useState } from "react";
import { useList, useUpdate, useGetIdentity } from "@refinedev/core";
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  notification,
  Progress,
  Row,
  Col,
  Avatar,
  List,
  Badge,
  Empty,
  Alert,
  Statistic,
  Divider
} from "antd";
import {
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
  FireOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ICallTask, ICustomer, IDailyGoal, IEmployee } from "../../interfaces";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const TasksPage: React.FC = () => {
  const { data: identity } = useGetIdentity<IEmployee>();
  const [selectedTask, setSelectedTask] = useState<ICallTask | null>(null);
  const [notesModal, setNotesModal] = useState(false);
  const [form] = Form.useForm();

  const isManager = identity?.role === 'manager' || identity?.role === 'admin';

  // Fetch today's goal
  const { data: goalsData, refetch: refetchGoals } = useList<IDailyGoal>({
    resource: "dailyGoals",
    filters: isManager 
      ? [{ field: "date", operator: "eq", value: dayjs().format("YYYY-MM-DD") }]
      : [
          { field: "employeeId", operator: "eq", value: identity?.id },
          { field: "date", operator: "eq", value: dayjs().format("YYYY-MM-DD") }
        ],
  });

  // Fetch tasks
  const { data: tasksData, refetch: refetchTasks } = useList<ICallTask>({
    resource: "callTasks",
    filters: isManager
      ? []
      : [{ field: "employeeId", operator: "eq", value: identity?.id }],
    sorters: [{ field: "assignedAt", order: "asc" }],
  });

  // Fetch customers
  const { data: customersData } = useList<ICustomer>({
    resource: "customers",
  });

  // Fetch employees (for managers)
  const { data: employeesData } = useList<IEmployee>({
    resource: "employees",
    filters: [{ field: "role", operator: "eq", value: "agent" }],
  });

  const { mutate: updateTask } = useUpdate<ICallTask>();
  const { mutate: updateGoal } = useUpdate<IDailyGoal>();

  const goals = goalsData?.data || [];
  const tasks = tasksData?.data || [];
  const customers = customersData?.data || [];
  const employees = employeesData?.data || [];

  const myGoal = goals.find(g => g.employeeId === identity?.id);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Handle task completion
  const handleCompleteTask = (task: ICallTask) => {
    setSelectedTask(task);
    setNotesModal(true);
  };

  const handleSubmitNotes = (values: any) => {
    if (!selectedTask || !myGoal) return;

    updateTask(
      {
        resource: "callTasks",
        id: selectedTask.id,
        values: {
          ...selectedTask,
          status: 'completed',
          completedAt: new Date().toISOString(),
          notes: values.notes,
        },
      },
      {
        onSuccess: () => {
          // Update goal
          updateGoal(
            {
              resource: "dailyGoals",
              id: myGoal.id,
              values: {
                ...myGoal,
                completedCalls: myGoal.completedCalls + 1,
                completedCustomers: [...myGoal.completedCustomers, selectedTask.customerId],
                status: myGoal.completedCalls + 1 >= myGoal.targetCalls ? 'completed' : myGoal.status,
                updatedAt: new Date().toISOString(),
              },
            },
            {
              onSuccess: () => {
                notification.success({
                  message: "Tarea completada",
                  description: "La llamada ha sido registrada exitosamente.",
                });
                setNotesModal(false);
                form.resetFields();
                refetchTasks();
                refetchGoals();
              },
            }
          );
        },
      }
    );
  };

  // Calculate progress
  const progress = myGoal ? (myGoal.completedCalls / myGoal.targetCalls) * 100 : 0;

  if (!isManager && myGoal?.status === 'overdue') {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="¡Tienes tareas pendientes!"
          description="Debes completar las llamadas pendientes de días anteriores antes de recibir nuevas tareas."
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          action={
            <Button type="primary" danger>
              Ver tareas pendientes ({pendingTasks.length})
            </Button>
          }
        />
        
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>Tareas Pendientes</Title>
          <List
            dataSource={pendingTasks}
            renderItem={(task) => {
              const customer = customers.find(c => c.id === task.customerId);
              return (
                <List.Item
                  actions={[
                    <Button type="primary" onClick={() => handleCompleteTask(task)}>
                      Marcar como completada
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={customer ? `${customer.firstName} ${customer.lastName}` : `Cliente #${task.customerId}`}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{customer?.phone}</Text>
                        <Text type="warning">
                          Asignada {dayjs(task.assignedAt).fromNow()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <CalendarOutlined /> Tareas Diarias
          </Title>
          <Text type="secondary">
            {isManager ? 'Gestión de tareas del equipo' : 'Mis tareas pendientes y completadas'}
          </Text>
        </Col>
        {!isManager && myGoal && (
          <Col>
            <Card size="small">
              <Statistic
                title="Progreso del día"
                value={myGoal.completedCalls}
                suffix={`/ ${myGoal.targetCalls}`}
                prefix={<FireOutlined />}
                valueStyle={{ color: progress >= 100 ? '#52c41a' : '#000' }}
              />
            </Card>
          </Col>
        )}
      </Row>

      {!isManager && (
        <>
          {/* Progress Overview */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={8}>
                <Progress
                  type="circle"
                  percent={progress}
                  status={progress >= 100 ? 'success' : 'active'}
                  format={() => (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                        {myGoal?.completedCalls || 0}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        de {myGoal?.targetCalls || 25}
                      </div>
                    </div>
                  )}
                />
              </Col>
              <Col xs={24} md={16}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Title level={4}>
                    {progress >= 100 
                      ? '¡Felicidades! Has completado tu meta diaria 🎉' 
                      : `Te faltan ${(myGoal?.targetCalls || 25) - (myGoal?.completedCalls || 0)} llamadas`
                    }
                  </Title>
                  <Progress 
                    percent={progress} 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <Row>
                    <Col span={8}>
                      <Statistic
                        title="Pendientes"
                        value={pendingTasks.length}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Completadas"
                        value={completedTasks.length}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Tasa de avance"
                        value={progress}
                        suffix="%"
                        precision={1}
                      />
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Tasks Lists */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <ClockCircleOutlined />
                    <Text>Tareas Pendientes</Text>
                    <Badge count={pendingTasks.length} />
                  </Space>
                }
              >
                {pendingTasks.length === 0 ? (
                  <Empty description="No tienes tareas pendientes" />
                ) : (
                  <List
                    dataSource={pendingTasks}
                    renderItem={(task) => {
                      const customer = customers.find(c => c.id === task.customerId);
                      return (
                        <List.Item
                          actions={[
                            <Button 
                              type="primary" 
                              icon={<PhoneOutlined />}
                              onClick={() => handleCompleteTask(task)}
                            >
                              Completar
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={customer ? `${customer.firstName} ${customer.lastName}` : `Cliente #${task.customerId}`}
                            description={
                              <Space direction="vertical" size={0}>
                                <Text type="secondary">{customer?.phone}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {customer?.tier && <Tag color={customer.tier === 'gold' ? 'gold' : customer.tier === 'silver' ? 'default' : 'blue'}>{customer.tier}</Tag>}
                                  Asignada {dayjs(task.assignedAt).fromNow()}
                                </Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <CheckCircleOutlined />
                    <Text>Tareas Completadas Hoy</Text>
                    <Badge count={completedTasks.length} style={{ backgroundColor: '#52c41a' }} />
                  </Space>
                }
              >
                {completedTasks.length === 0 ? (
                  <Empty description="Aún no has completado tareas hoy" />
                ) : (
                  <List
                    dataSource={completedTasks}
                    renderItem={(task) => {
                      const customer = customers.find(c => c.id === task.customerId);
                      return (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                            title={customer ? `${customer.firstName} ${customer.lastName}` : `Cliente #${task.customerId}`}
                            description={
                              <Space direction="vertical" size={0}>
                                <Text type="secondary">{customer?.phone}</Text>
                                <Text type="success" style={{ fontSize: 12 }}>
                                  Completada {dayjs(task.completedAt).fromNow()}
                                </Text>
                                {task.notes && (
                                  <Paragraph 
                                    ellipsis={{ rows: 2, expandable: true }} 
                                    style={{ marginBottom: 0, fontSize: 12 }}
                                  >
                                    {task.notes}
                                  </Paragraph>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}

      {isManager && (
        <Card title="Resumen del Equipo">
          <Table
            dataSource={employees}
            columns={[
              {
                title: 'Agente',
                key: 'agent',
                render: (record: IEmployee) => (
                  <Space>
                    <Avatar src={record.avatar} icon={<UserOutlined />} />
                    <Text>{record.firstName} {record.lastName}</Text>
                  </Space>
                ),
              },
              {
                title: 'Meta del día',
                key: 'goal',
                render: (record: IEmployee) => {
                  const goal = goals.find(g => g.employeeId === record.id);
                  if (!goal) return '-';
                  
                  const progress = (goal.completedCalls / goal.targetCalls) * 100;
                  return (
                    <div style={{ width: 200 }}>
                      <Text>{goal.completedCalls} / {goal.targetCalls}</Text>
                      <Progress percent={progress} size="small" />
                    </div>
                  );
                },
              },
              {
                title: 'Estado',
                key: 'status',
                render: (record: IEmployee) => {
                  const goal = goals.find(g => g.employeeId === record.id);
                  if (!goal) return '-';
                  
                  if (goal.status === 'completed') {
                    return <Tag color="green">Completado</Tag>;
                  } else if (goal.status === 'overdue') {
                    return <Tag color="red">Tareas pendientes</Tag>;
                  } else {
                    return <Tag color="blue">En progreso</Tag>;
                  }
                },
              },
              {
                title: 'Tareas pendientes',
                key: 'pending',
                render: (record: IEmployee) => {
                  const employeeTasks = tasks.filter(t => t.employeeId === record.id && t.status === 'pending');
                  return <Badge count={employeeTasks.length} />;
                },
              },
            ]}
          />
        </Card>
      )}

      {/* Notes Modal */}
      <Modal
        title="Completar Tarea"
        visible={notesModal}
        onCancel={() => {
          setNotesModal(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitNotes}
        >
          <Alert
            message="Registra los detalles de la llamada"
            description="Agrega notas sobre la conversación, resultado y próximos pasos."
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="notes"
            label="Notas de la llamada"
            rules={[{ required: true, message: 'Las notas son requeridas' }]}
          >
            <TextArea
              rows={4}
              placeholder="Ej: Cliente interesado en renovación, llamar la próxima semana..."
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setNotesModal(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Completar Tarea
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
