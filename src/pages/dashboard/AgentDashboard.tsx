import React, { useState, useEffect } from "react";
import { useList } from "@refinedev/core";
import { Row, Col, Card, Statistic, Progress, Space, Typography, Tag, Alert, Button, List, Avatar, Badge } from "antd";
import {
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  RiseOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Line, Column, Gauge } from "@ant-design/charts";
import dayjs from "dayjs";
import { IDailyGoal, IEmployee, ICallTask, ICustomer } from "../../interfaces";

const { Title, Text, Paragraph } = Typography;

interface AgentDashboardProps {
  user: IEmployee;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ user }) => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Fetch today's goal
  const { data: goalsData, isLoading: goalsLoading } = useList<IDailyGoal>({
    resource: "dailyGoals",
    filters: [
      { field: "employeeId", operator: "eq", value: user.id },
      { field: "date", operator: "eq", value: dayjs().format("YYYY-MM-DD") }
    ],
  });

  // Fetch pending tasks
  const { data: tasksData, isLoading: tasksLoading } = useList<ICallTask>({
    resource: "callTasks",
    filters: [
      { field: "employeeId", operator: "eq", value: user.id },
      { field: "status", operator: "eq", value: "pending" }
    ],
  });

  // Fetch other employees' performance for competition
  const { data: employeesData } = useList<IEmployee>({
    resource: "employees",
    filters: [
      { field: "role", operator: "eq", value: "agent" },
      { field: "storeId", operator: "eq", value: user.storeId }
    ],
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const todayGoal = goalsData?.data?.[0];
  const pendingTasks = tasksData?.data || [];

  // Calculate progress
  const progress = todayGoal ? (todayGoal.completedCalls / todayGoal.targetCalls) * 100 : 0;
  const isOverdue = todayGoal?.status === 'overdue';

  // Mock data for call performance chart
  const callPerformanceData = [
    { hour: '9:00', calls: 3 },
    { hour: '10:00', calls: 5 },
    { hour: '11:00', calls: 4 },
    { hour: '12:00', calls: 2 },
    { hour: '13:00', calls: 0 },
    { hour: '14:00', calls: 4 },
    { hour: '15:00', calls: 3 },
    { hour: '16:00', calls: 2 },
  ];

  const callPerformanceConfig = {
    data: callPerformanceData,
    xField: 'hour',
    yField: 'calls',
    smooth: true,
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const gaugeConfig = {
    percent: progress / 100,
    range: {
      color: progress >= 100 ? '#52c41a' : progress >= 80 ? '#faad14' : '#ff4d4f',
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
        },
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '36px',
          lineHeight: '36px',
        },
        formatter: () => `${todayGoal?.completedCalls || 0}/${todayGoal?.targetCalls || 25}`,
      },
    },
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>¡Hola, {user.firstName}! 👋</Title>
          <Text type="secondary">{currentTime.format('dddd, D [de] MMMM [de] YYYY')}</Text>
        </Col>
        <Col>
          <Space>
            <Badge status={user.status === 'active' ? 'success' : 'default'} />
            <Text>{user.status === 'active' ? 'En línea' : 'Desconectado'}</Text>
          </Space>
        </Col>
      </Row>

      {/* Daily Goal Status */}
      {isOverdue && (
        <Alert
          message="¡Meta diaria pendiente!"
          description="No completaste tu meta de ayer. Completa las llamadas pendientes para recibir nuevos clientes."
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary">
              Ver tareas pendientes
            </Button>
          }
        />
      )}

      {/* Main Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Llamadas Hoy"
              value={todayGoal?.completedCalls || 0}
              suffix={`/ ${todayGoal?.targetCalls || 25}`}
              prefix={<PhoneOutlined />}
              valueStyle={{ color: progress >= 100 ? '#3f8600' : '#000' }}
            />
            <Progress 
              percent={progress} 
              status={progress >= 100 ? 'success' : 'active'}
              strokeColor={isOverdue ? '#ff4d4f' : undefined}
            />
            {progress >= 100 ? (
              <Text type="success">¡Meta completada! 🎉</Text>
            ) : (
              <Text type="secondary">Faltan {(todayGoal?.targetCalls || 25) - (todayGoal?.completedCalls || 0)} llamadas</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Conversiones Hoy"
              value={user.performance?.conversionsToday || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary">Tasa: {user.performance?.conversionRate || 0}%</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Comisión del Mes"
              value={user.commissions?.currentMonthCommission || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
            <Space>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <Text type="success">+15% vs mes anterior</Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Mi Ranking"
              value={3}
              suffix="/ 10"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Text type="secondary">Top 30% del equipo</Text>
          </Card>
        </Col>
      </Row>

      {/* Progress and Tasks */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Mi Progreso Diario" extra={<Tag color={progress >= 100 ? 'success' : 'processing'}>En progreso</Tag>}>
            <Gauge {...gaugeConfig} height={200} />
            <Paragraph style={{ textAlign: 'center', marginTop: 16 }}>
              {progress >= 100 
                ? "¡Excelente trabajo! Has completado tu meta diaria 🎯"
                : `Mantén el ritmo, vas muy bien. ¡Tú puedes! 💪`
              }
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Clientes Pendientes" 
            extra={<Badge count={pendingTasks.length} />}
            bodyStyle={{ height: 300, overflow: 'auto' }}
          >
            <List
              dataSource={pendingTasks.slice(0, 5)}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">Llamar</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={`Cliente #${task.customerId}`}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Asignado {dayjs(task.assignedAt).fromNow()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
            {pendingTasks.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Button type="link">Ver todos ({pendingTasks.length})</Button>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Ranking del Equipo Hoy" extra={<FireOutlined style={{ color: '#ff4d4f' }} />}>
            <List
              dataSource={employeesData?.data?.slice(0, 5) || []}
              renderItem={(employee, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#f0f0f0' 
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <Text strong={employee.id === user.id}>
                          {employee.firstName} {employee.lastName}
                        </Text>
                        {employee.id === user.id && <Tag color="blue">Tú</Tag>}
                      </Space>
                    }
                    description={
                      <Space>
                        <Text>{employee.performance?.callsToday || 0} llamadas</Text>
                        <Text type="secondary">•</Text>
                        <Text type="success">{employee.performance?.conversionsToday || 0} ventas</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Chart */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Mi Rendimiento por Hora">
            <Line {...callPerformanceConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Acciones Rápidas">
            <Space wrap>
              <Button type="primary" icon={<PhoneOutlined />} size="large">
                Registrar Llamada
              </Button>
              <Button icon={<CheckCircleOutlined />} size="large">
                Marcar Tarea Completada
              </Button>
              <Button icon={<UserOutlined />} size="large">
                Ver Mis Clientes
              </Button>
              <Button icon={<TrophyOutlined />} size="large">
                Ver Mis Logros
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
