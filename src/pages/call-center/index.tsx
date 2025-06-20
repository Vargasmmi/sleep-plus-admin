import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Space,
  Typography,
  Tag,
  List,
  Avatar,
  Badge,
  Progress,
  Statistic,
  Table,
  Input,
  Select,
  Tabs,
  Timeline,
  Alert,
  Modal,
  Form,
  Radio,
  Descriptions,
} from "antd";
import {
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  FireOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface Agent {
  id: string;
  name: string;
  status: "available" | "calling" | "break" | "offline";
  callsToday: number;
  conversionsToday: number;
  avgCallTime: string;
}

interface Call {
  id: string;
  customerName: string;
  phone: string;
  status: "waiting" | "active" | "completed";
  duration: string;
  agent?: string;
  startTime?: string;
}

export const CallCenterPage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [dispositionModalVisible, setDispositionModalVisible] = useState(false);

  // Datos de ejemplo
  const agents: Agent[] = [
    {
      id: "1",
      name: "María García",
      status: "calling",
      callsToday: 45,
      conversionsToday: 8,
      avgCallTime: "4:23",
    },
    {
      id: "2",
      name: "Carlos López",
      status: "available",
      callsToday: 38,
      conversionsToday: 6,
      avgCallTime: "5:12",
    },
    {
      id: "3",
      name: "Ana Martínez",
      status: "break",
      callsToday: 42,
      conversionsToday: 7,
      avgCallTime: "4:45",
    },
    {
      id: "4",
      name: "Juan Pérez",
      status: "available",
      callsToday: 36,
      conversionsToday: 5,
      avgCallTime: "4:58",
    },
  ];

  const callQueue: Call[] = [
    {
      id: "1",
      customerName: "Roberto Sánchez",
      phone: "(555) 123-4567",
      status: "waiting",
      duration: "0:00",
    },
    {
      id: "2",
      customerName: "Laura Jiménez",
      phone: "(555) 987-6543",
      status: "waiting",
      duration: "0:00",
    },
    {
      id: "3",
      customerName: "Pedro Ramírez",
      phone: "(555) 456-7890",
      status: "active",
      duration: "3:45",
      agent: "María García",
      startTime: "14:23",
    },
  ];

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "available":
        return "success";
      case "calling":
        return "processing";
      case "break":
        return "warning";
      case "offline":
        return "default";
    }
  };

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "available":
        return <CheckCircleOutlined />;
      case "calling":
        return <PhoneOutlined />;
      case "break":
        return <PauseCircleOutlined />;
      case "offline":
        return <CloseCircleOutlined />;
    }
  };

  const handleStartCall = (customer: any) => {
    setSelectedCustomer(customer);
    setCallModalVisible(true);
  };

  const handleEndCall = () => {
    setCallModalVisible(false);
    setDispositionModalVisible(true);
  };

  const handleDisposition = (values: any) => {
    console.log("Disposition:", values);
    setDispositionModalVisible(false);
    setSelectedCustomer(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Centro de Llamadas</Title>

      {/* Estadísticas generales */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Agentes Activos"
              value={2}
              suffix={`/ ${agents.length}`}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="En Cola"
              value={callQueue.filter((c) => c.status === "waiting").length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Llamadas Hoy"
              value={161}
              prefix={<PhoneOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tasa de Conversión"
              value={16.4}
              suffix="%"
              prefix={<FireOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Panel de Agentes */}
        <Col xs={24} lg={8}>
          <Card title="Agentes">
            <List
              dataSource={agents}
              renderItem={(agent) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={
                          agent.status === "available"
                            ? "success"
                            : agent.status === "calling"
                            ? "processing"
                            : agent.status === "break"
                            ? "warning"
                            : "default"
                        }
                        dot
                      >
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={agent.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Tag icon={getStatusIcon(agent.status)} color={getStatusColor(agent.status)}>
                          {agent.status === "available"
                            ? "Disponible"
                            : agent.status === "calling"
                            ? "En llamada"
                            : agent.status === "break"
                            ? "En descanso"
                            : "Offline"}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {agent.callsToday} llamadas • {agent.conversionsToday} ventas
                        </Text>
                      </Space>
                    }
                  />
                  <div style={{ textAlign: "right" }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Promedio
                    </Text>
                    <br />
                    <Text strong>{agent.avgCallTime}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Cola de Llamadas */}
        <Col xs={24} lg={16}>
          <Card
            title="Cola de Llamadas"
            extra={
              <Space>
                <Button icon={<PlayCircleOutlined />} type="primary">
                  Auto-asignar
                </Button>
              </Space>
            }
          >
            <Table
              dataSource={callQueue}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: "Cliente",
                  dataIndex: "customerName",
                  key: "customerName",
                  render: (text, record) => (
                    <Space>
                      <UserOutlined />
                      <div>
                        <Text strong>{text}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {record.phone}
                        </Text>
                      </div>
                    </Space>
                  ),
                },
                {
                  title: "Estado",
                  dataIndex: "status",
                  key: "status",
                  render: (status, record) => {
                    if (status === "active") {
                      return (
                        <Space direction="vertical" size={0}>
                          <Tag color="processing" icon={<PhoneOutlined />}>
                            En llamada
                          </Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            con {record.agent}
                          </Text>
                        </Space>
                      );
                    }
                    return (
                      <Tag color="warning" icon={<ClockCircleOutlined />}>
                        En espera
                      </Tag>
                    );
                  },
                },
                {
                  title: "Duración",
                  dataIndex: "duration",
                  key: "duration",
                  render: (duration, record) => (
                    <Space direction="vertical" size={0}>
                      <Text>{duration}</Text>
                      {record.startTime && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Inicio: {record.startTime}
                        </Text>
                      )}
                    </Space>
                  ),
                },
                {
                  title: "Acciones",
                  key: "actions",
                  render: (_, record) => {
                    if (record.status === "waiting") {
                      return (
                        <Button
                          type="primary"
                          icon={<PhoneOutlined />}
                          onClick={() => handleStartCall(record)}
                        >
                          Tomar llamada
                        </Button>
                      );
                    }
                    if (record.status === "active") {
                      return (
                        <Button danger onClick={handleEndCall}>
                          Finalizar
                        </Button>
                      );
                    }
                    return null;
                  },
                },
              ]}
            />
          </Card>

          {/* Campañas Activas */}
          <Card title="Campañas Activas" style={{ marginTop: 16 }}>
            <List
              dataSource={[
                {
                  name: "Renovación Elite Q2",
                  progress: 65,
                  calls: 450,
                  conversions: 72,
                },
                {
                  name: "Recuperación 90 días",
                  progress: 40,
                  calls: 280,
                  conversions: 35,
                },
              ]}
              renderItem={(campaign) => (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <Space
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong>{campaign.name}</Text>
                      <Text type="secondary">
                        {campaign.calls} llamadas • {campaign.conversions} conversiones
                      </Text>
                    </Space>
                    <Progress percent={campaign.progress} size="small" />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal de Llamada */}
      <Modal
        title={`Llamada con ${selectedCustomer?.customerName}`}
        visible={callModalVisible}
        onCancel={() => setCallModalVisible(false)}
        footer={[
          <Button key="end" danger onClick={handleEndCall}>
            Finalizar Llamada
          </Button>,
        ]}
        width={800}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Script",
              children: (
                <Timeline>
                  <Timeline.Item color="green">
                    <Text strong>Apertura</Text>
                    <br />
                    <Text>
                      "Hola [NOMBRE], soy [TU_NOMBRE] de LA Mattress Store. Le llamo
                      porque veo que su suscripción Elite está por renovarse y tenemos
                      una oferta especial para usted..."
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>Beneficios</Text>
                    <br />
                    <Text>
                      "Con la renovación anticipada, puede ahorrar $400 este año y
                      mantener todos sus beneficios..."
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>Cierre</Text>
                    <br />
                    <Text>
                      "¿Le gustaría aprovechar esta oferta exclusiva hoy?"
                    </Text>
                  </Timeline.Item>
                </Timeline>
              ),
            },
            {
              key: "2",
              label: "Información del Cliente",
              children: (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Nombre">
                    {selectedCustomer?.customerName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Teléfono">
                    {selectedCustomer?.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nivel">
                    <Tag color="gold">Oro</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Última compra">
                    Hace 8 meses
                  </Descriptions.Item>
                  <Descriptions.Item label="Productos" span={2}>
                    Tempur-Pedic ProAdapt Queen
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: "3",
              label: "Notas",
              children: (
                <Form.Item label="Notas de la llamada">
                  <Input.TextArea rows={6} placeholder="Escribe las notas aquí..." />
                </Form.Item>
              ),
            },
          ]}
        />
      </Modal>

      {/* Modal de Disposición */}
      <Modal
        title="Disposición de Llamada"
        visible={dispositionModalVisible}
        onCancel={() => setDispositionModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleDisposition} layout="vertical">
          <Form.Item
            name="disposition"
            label="Resultado de la llamada"
            rules={[{ required: true, message: "Selecciona un resultado" }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="sale">Venta realizada</Radio>
                <Radio value="interested">Interesado - Llamar después</Radio>
                <Radio value="not_interested">No interesado</Radio>
                <Radio value="no_answer">No contestó</Radio>
                <Radio value="wrong_number">Número equivocado</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="notes" label="Notas adicionales">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Guardar
              </Button>
              <Button onClick={() => setDispositionModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
