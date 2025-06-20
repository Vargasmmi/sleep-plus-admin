import React from "react";
import { Show, DateField } from "@refinedev/antd";
import { useShow, useOne, useList } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Descriptions,
  Tag,
  Space,
  Timeline,
  Progress,
  Button,
  Statistic,
  Alert,
  Table,
  Modal,
  Form,
  DatePicker,
  Select,
  Input,
} from "antd";
import {
  CreditCardOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  StopOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ISubscription, ICustomer, ISale } from "../../interfaces";

const { Title, Text } = Typography;

export const SubscriptionShow: React.FC = () => {
  const { queryResult } = useShow<ISubscription>();
  const { data, isLoading } = queryResult;
  const subscription = data?.data;

  const [pauseModalVisible, setPauseModalVisible] = React.useState(false);
  const [cancelModalVisible, setCancelModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  // Fetch customer data
  const { data: customerData } = useOne<ICustomer>({
    resource: "customers",
    id: subscription?.customerId || "",
    queryOptions: {
      enabled: !!subscription?.customerId,
    },
  });

  // Fetch related sales
  const { data: salesData } = useList<ISale>({
    resource: "sales",
    filters: [
      {
        field: "subscriptionId",
        operator: "eq",
        value: subscription?.id,
      },
    ],
    queryOptions: {
      enabled: !!subscription?.id,
    },
  });

  const customer = customerData?.data;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "green";
      case "paused":
        return "orange";
      case "cancelled":
        return "red";
      case "pending":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "active":
        return <CheckCircleOutlined />;
      case "paused":
        return <PauseCircleOutlined />;
      case "cancelled":
        return <CloseCircleOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getPlanDetails = (plan?: string) => {
    switch (plan) {
      case "elite":
        return {
          color: "purple",
          name: "ELITE",
          description: "Máxima protección con todos los beneficios",
        };
      case "premium":
        return {
          color: "blue",
          name: "PREMIUM",
          description: "Protección completa para tu colchón",
        };
      case "basic":
        return {
          color: "default",
          name: "BASIC",
          description: "Protección esencial",
        };
      default:
        return {
          color: "default",
          name: "DESCONOCIDO",
          description: "",
        };
    }
  };

  const planDetails = getPlanDetails(subscription?.plan);

  const handlePauseSubscription = (values: any) => {
    console.log("Pausar suscripción:", values);
    setPauseModalVisible(false);
    form.resetFields();
  };

  const handleCancelSubscription = (values: any) => {
    console.log("Cancelar suscripción:", values);
    setCancelModalVisible(false);
    form.resetFields();
  };

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Space direction="vertical" size={0}>
                  <Space align="center">
                    <Title level={3} style={{ margin: 0 }}>
                      Suscripción {planDetails.name}
                    </Title>
                    <Tag
                      color={getStatusColor(subscription?.status)}
                      icon={getStatusIcon(subscription?.status)}
                      style={{ fontSize: 14 }}
                    >
                      {subscription?.status?.toUpperCase()}
                    </Tag>
                  </Space>
                  <Text type="secondary">{planDetails.description}</Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  {subscription?.status === "active" && (
                    <>
                      <Button icon={<EditOutlined />}>Modificar Plan</Button>
                      <Button
                        icon={<PauseCircleOutlined />}
                        onClick={() => setPauseModalVisible(true)}
                      >
                        Pausar
                      </Button>
                      <Button
                        danger
                        icon={<StopOutlined />}
                        onClick={() => setCancelModalVisible(true)}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  {subscription?.status === "paused" && (
                    <Button type="primary" icon={<PlayCircleOutlined />}>
                      Reanudar
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Información del Cliente" size="small">
            {customer && (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Nombre">
                  <Space>
                    <UserOutlined />
                    <Text strong>
                      {customer.firstName} {customer.lastName}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  <Text copyable>{customer.phone}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text copyable>{customer.email}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tier">
                  <Tag color={customer.tier === "gold" ? "gold" : customer.tier === "silver" ? "default" : "orange"}>
                    {customer.tier?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Miembro Elite">
                  {customer.isEliteMember ? (
                    <Tag color="purple">Sí</Tag>
                  ) : (
                    <Tag>No</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>

          <Card title="Información de Facturación" size="small" style={{ marginTop: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Precio">
                <Text strong>
                  ${subscription?.pricing.monthly}/mes
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Frecuencia">
                <Tag>{subscription?.billing.frequency === "monthly" ? "Mensual" : "Anual"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Próximo Cobro">
                <Space direction="vertical" size={0}>
                  <DateField
                    value={subscription?.billing.nextBillingDate}
                    format="DD/MM/YYYY"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    En {dayjs(subscription?.billing.nextBillingDate).diff(dayjs(), "days")} días
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Método de Pago">
                <Space>
                  <CreditCardOutlined />
                  {subscription?.billing.paymentMethod === "card" && "Tarjeta"}
                  {subscription?.billing.paymentMethod === "ach" && "ACH"}
                  {subscription?.billing.paymentMethod === "cash" && "Efectivo"}
                  {subscription?.billing.lastFour && ` ****${subscription.billing.lastFour}`}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Servicios Incluidos">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" type="inner">
                  <Statistic
                    title="Limpiezas"
                    value={subscription?.services.cleaningsUsed || 0}
                    suffix={`/ ${subscription?.services.cleaningsTotal || 0}`}
                  />
                  <Progress
                    percent={
                      ((subscription?.services.cleaningsUsed || 0) /
                        (subscription?.services.cleaningsTotal || 1)) *
                      100
                    }
                    strokeColor="#52c41a"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {(subscription?.services.cleaningsTotal || 0) -
                      (subscription?.services.cleaningsUsed || 0)}{" "}
                    limpiezas disponibles
                  </Text>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card size="small" type="inner">
                  <Statistic
                    title="Inspecciones"
                    value={subscription?.services.inspectionsUsed || 0}
                    suffix={`/ ${subscription?.services.inspectionsTotal || 0}`}
                  />
                  <Progress
                    percent={
                      ((subscription?.services.inspectionsUsed || 0) /
                        (subscription?.services.inspectionsTotal || 1)) *
                      100
                    }
                    strokeColor="#1890ff"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {(subscription?.services.inspectionsTotal || 0) -
                      (subscription?.services.inspectionsUsed || 0)}{" "}
                    inspecciones disponibles
                  </Text>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card size="small" type="inner">
                  <Space direction="vertical">
                    <Text strong>Protección contra Daños</Text>
                    {subscription?.services.protectionActive ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        ACTIVA
                      </Tag>
                    ) : (
                      <Tag color="default" icon={<CloseCircleOutlined />}>
                        NO INCLUIDA
                      </Tag>
                    )}
                  </Space>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card size="small" type="inner">
                  <Space direction="vertical">
                    <Text strong>Créditos Trade & Sleep</Text>
                    <Statistic
                      value={subscription?.credits.accumulated || 0}
                      prefix="$"
                      valueStyle={{ fontSize: 20, color: "#3f8600" }}
                    />
                    {subscription?.credits.expiration && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Expiran: {dayjs(subscription.credits.expiration).format("DD/MM/YYYY")}
                      </Text>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>

          <Card title="Historial de Pagos" style={{ marginTop: 16 }}>
            <Table
              dataSource={salesData?.data || []}
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: "Fecha",
                  dataIndex: "createdAt",
                  render: (date) => <DateField value={date} format="DD/MM/YYYY" />,
                },
                {
                  title: "Tipo",
                  dataIndex: "type",
                  render: (type) => (
                    <Tag>
                      {type === "new" && "Nueva"}
                      {type === "renewal" && "Renovación"}
                      {type === "upgrade" && "Mejora"}
                    </Tag>
                  ),
                },
                {
                  title: "Monto",
                  dataIndex: ["amount", "total"],
                  render: (amount) => <Text strong>${amount}</Text>,
                },
                {
                  title: "Estado",
                  dataIndex: "paymentStatus",
                  render: (status) => (
                    <Tag color={status === "completed" ? "green" : "orange"}>
                      {status === "completed" ? "Pagado" : "Pendiente"}
                    </Tag>
                  ),
                },
                {
                  title: "Acciones",
                  render: (_, record) => (
                    <Button
                      size="small"
                      icon={<FileTextOutlined />}
                      onClick={() => {
                        // Ver recibo
                      }}
                    >
                      Recibo
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Información Adicional">
            <Descriptions>
              <Descriptions.Item label="ID de Suscripción">
                <Text code>{subscription?.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Inicio">
                <DateField value={subscription?.startDate} format="DD/MM/YYYY HH:mm" />
              </Descriptions.Item>
              <Descriptions.Item label="Vendido Por">
                {subscription?.soldBy}
              </Descriptions.Item>
              {subscription?.pausedAt && (
                <Descriptions.Item label="Pausada Desde">
                  <DateField value={subscription.pausedAt} format="DD/MM/YYYY" />
                </Descriptions.Item>
              )}
              {subscription?.cancelledAt && (
                <Descriptions.Item label="Cancelada El">
                  <DateField value={subscription.cancelledAt} format="DD/MM/YYYY" />
                </Descriptions.Item>
              )}
              {subscription?.cancelReason && (
                <Descriptions.Item label="Razón de Cancelación" span={3}>
                  <Text>{subscription.cancelReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Pause Modal */}
      <Modal
        title="Pausar Suscripción"
        open={pauseModalVisible}
        onOk={form.submit}
        onCancel={() => setPauseModalVisible(false)}
        width={500}
      >
        <Alert
          message="La suscripción se pausará temporalmente"
          description="No se realizarán cobros mientras esté pausada. Los servicios no utilizados se mantendrán."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical" onFinish={handlePauseSubscription}>
          <Form.Item
            label="Fecha de Pausa"
            name="pauseDate"
            rules={[{ required: true, message: "Selecciona una fecha" }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            label="Fecha de Reactivación (Opcional)"
            name="resumeDate"
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs()}
            />
          </Form.Item>
          <Form.Item
            label="Razón"
            name="reason"
            rules={[{ required: true, message: "Ingresa una razón" }]}
          >
            <Select>
              <Select.Option value="vacation">Vacaciones</Select.Option>
              <Select.Option value="financial">Razones Financieras</Select.Option>
              <Select.Option value="temporary">Mudanza Temporal</Select.Option>
              <Select.Option value="other">Otra</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title="Cancelar Suscripción"
        open={cancelModalVisible}
        onOk={form.submit}
        onCancel={() => setCancelModalVisible(false)}
        width={500}
        okText="Cancelar Suscripción"
        okButtonProps={{ danger: true }}
      >
        <Alert
          message="¿Estás seguro de cancelar esta suscripción?"
          description="Esta acción no se puede deshacer. El cliente perderá todos los beneficios."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical" onFinish={handleCancelSubscription}>
          <Form.Item
            label="Fecha de Cancelación"
            name="cancelDate"
            rules={[{ required: true, message: "Selecciona una fecha" }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            label="Razón de Cancelación"
            name="cancelReason"
            rules={[{ required: true, message: "Ingresa una razón" }]}
          >
            <Select>
              <Select.Option value="price">Precio muy alto</Select.Option>
              <Select.Option value="no_use">No usa los servicios</Select.Option>
              <Select.Option value="bad_experience">Mala experiencia</Select.Option>
              <Select.Option value="competitor">Se fue a la competencia</Select.Option>
              <Select.Option value="other">Otra razón</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Notas Adicionales"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Detalles adicionales..." />
          </Form.Item>
        </Form>
      </Modal>
    </Show>
  );
};
