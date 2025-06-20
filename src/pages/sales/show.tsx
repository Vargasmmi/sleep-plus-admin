import React from "react";
import { Show } from "@refinedev/antd";
import { useShow, useOne } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Descriptions,
  Statistic,
  Alert,
  Timeline,
  Button,
  Divider,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  GlobalOutlined,
  CreditCardOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ISale, ICustomer, IEmployee, IStore, ISubscription } from "../../interfaces";

const { Title, Text } = Typography;

export const SaleShow: React.FC = () => {
  const { queryResult } = useShow<ISale>();
  const { data, isLoading } = queryResult;
  const sale = data?.data;

  const { data: customerData } = useOne<ICustomer>({
    resource: "customers",
    id: sale?.customerId || "",
    queryOptions: {
      enabled: !!sale?.customerId,
    },
  });

  const { data: employeeData } = useOne<IEmployee>({
    resource: "employees",
    id: sale?.userId || "",
    queryOptions: {
      enabled: !!sale?.userId,
    },
  });

  const { data: storeData } = useOne<IStore>({
    resource: "stores",
    id: sale?.storeId || "",
    queryOptions: {
      enabled: !!sale?.storeId,
    },
  });

  const { data: subscriptionData } = useOne<ISubscription>({
    resource: "subscriptions",
    id: sale?.subscriptionId || "",
    queryOptions: {
      enabled: !!sale?.subscriptionId,
    },
  });

  const customer = customerData?.data;
  const employee = employeeData?.data;
  const store = storeData?.data;
  const subscription = subscriptionData?.data;

  if (isLoading || !sale) {
    return <div>Cargando...</div>;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "new":
        return "success";
      case "renewal":
        return "processing";
      case "upgrade":
        return "gold";
      case "winback":
        return "purple";
      default:
        return "default";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "phone":
        return <PhoneOutlined />;
      case "store":
        return <ShoppingOutlined />;
      case "online":
        return <GlobalOutlined />;
      default:
        return <ShopOutlined />;
    }
  };

  return (
    <Show>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Space align="start">
                  <DollarOutlined style={{ fontSize: 24 }} />
                  <div>
                    <Title level={3} style={{ margin: 0 }}>
                      Venta #{sale.id}
                    </Title>
                    <Space>
                      <Tag color={getTypeColor(sale.type)}>
                        {sale.type === "new"
                          ? "Nueva"
                          : sale.type === "renewal"
                          ? "Renovación"
                          : sale.type === "upgrade"
                          ? "Mejora"
                          : sale.type === "winback"
                          ? "Recuperación"
                          : sale.type}
                      </Tag>
                      <Tag
                        icon={getChannelIcon(sale.channel)}
                        color={
                          sale.channel === "phone"
                            ? "blue"
                            : sale.channel === "store"
                            ? "green"
                            : "purple"
                        }
                      >
                        {sale.channel === "phone"
                          ? "Teléfono"
                          : sale.channel === "store"
                          ? "Tienda"
                          : "Online"}
                      </Tag>
                    </Space>
                  </div>
                </Space>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="Cliente" span={1}>
                  <Space>
                    <UserOutlined />
                    {customer ? (
                      <a href={`/customers/show/${customer.id}`}>
                        {customer.firstName} {customer.lastName}
                      </a>
                    ) : (
                      sale.customerId
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Vendedor" span={1}>
                  <Space>
                    <UserOutlined />
                    {employee ? (
                      <a href={`/employees/show/${employee.id}`}>
                        {employee.firstName} {employee.lastName}
                      </a>
                    ) : (
                      sale.userId
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Tienda" span={1}>
                  <Space>
                    <ShopOutlined />
                    {store ? (
                      <a href={`/stores/show/${store.id}`}>{store.name}</a>
                    ) : (
                      sale.storeId
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Fecha de Venta" span={1}>
                  {dayjs(sale.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>

                {sale.subscriptionId && (
                  <Descriptions.Item label="Suscripción" span={2}>
                    <Space>
                      <CreditCardOutlined />
                      {subscription ? (
                        <a href={`/subscriptions/show/${subscription.id}`}>
                          Plan {subscription.plan} - {subscription.status}
                        </a>
                      ) : (
                        sale.subscriptionId
                      )}
                    </Space>
                  </Descriptions.Item>
                )}

                {sale.callId && (
                  <Descriptions.Item label="Llamada Asociada" span={2}>
                    <Space>
                      <PhoneOutlined />
                      <a href={`/calls/show/${sale.callId}`}>
                        Ver detalles de la llamada
                      </a>
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Card title="Desglose de Montos" size="small">
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Statistic
                      title="Monto Bruto"
                      value={sale.amount.gross}
                      prefix="$"
                      precision={2}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Descuento"
                      value={sale.amount.discount}
                      prefix="-$"
                      precision={2}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Impuesto"
                      value={sale.amount.tax}
                      prefix="$"
                      precision={2}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Total"
                      value={sale.amount.total}
                      prefix="$"
                      precision={2}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                </Row>
              </Card>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Estado de Pago">
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Alert
                message={
                  sale.paymentStatus === "completed"
                    ? "Pago Completado"
                    : sale.paymentStatus === "pending"
                    ? "Pago Pendiente"
                    : sale.paymentStatus === "failed"
                    ? "Pago Fallido"
                    : "Reembolsado"
                }
                type={
                  sale.paymentStatus === "completed"
                    ? "success"
                    : sale.paymentStatus === "pending"
                    ? "warning"
                    : "error"
                }
                icon={
                  sale.paymentStatus === "completed" ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ClockCircleOutlined />
                  )
                }
                showIcon
              />

              <Divider />

              <div>
                <Text strong>Estado del Contrato</Text>
                <br />
                {sale.contract.signed ? (
                  <Space direction="vertical">
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Firmado
                    </Tag>
                    {sale.contract.signedAt && (
                      <Text type="secondary">
                        {dayjs(sale.contract.signedAt).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </Text>
                    )}
                    {sale.contract.documentUrl && (
                      <Button
                        type="link"
                        icon={<FileTextOutlined />}
                        href={sale.contract.documentUrl}
                        target="_blank"
                      >
                        Ver documento
                      </Button>
                    )}
                  </Space>
                ) : (
                  <Tag color="warning">Pendiente de firma</Tag>
                )}
              </div>
            </Space>
          </Card>

          <Card title="Comisiones" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Statistic
                title="Comisión Base"
                value={sale.commission.base}
                prefix="$"
                precision={2}
              />
              <Statistic
                title="Bono"
                value={sale.commission.bonus}
                prefix="$"
                precision={2}
              />
              <Divider />
              <Statistic
                title="Total de Comisión"
                value={sale.commission.total}
                prefix="$"
                precision={2}
                valueStyle={{ color: "#3f8600" }}
              />

              <Alert
                message={
                  sale.commission.status === "paid"
                    ? "Comisión Pagada"
                    : sale.commission.status === "approved"
                    ? "Comisión Aprobada"
                    : "Comisión Pendiente"
                }
                type={
                  sale.commission.status === "paid"
                    ? "success"
                    : sale.commission.status === "approved"
                    ? "info"
                    : "warning"
                }
                showIcon
              />
            </Space>
          </Card>

          <Card title="Línea de Tiempo" style={{ marginTop: 16 }}>
            <Timeline>
              <Timeline.Item
                dot={<DollarOutlined style={{ fontSize: "16px" }} />}
                color="blue"
              >
                <Text type="secondary">
                  {dayjs(sale.createdAt).format("DD/MM HH:mm")}
                </Text>
                <br />
                Venta registrada
              </Timeline.Item>

              {sale.contract.signed && sale.contract.signedAt && (
                <Timeline.Item
                  dot={<FileTextOutlined style={{ fontSize: "16px" }} />}
                  color="green"
                >
                  <Text type="secondary">
                    {dayjs(sale.contract.signedAt).format("DD/MM HH:mm")}
                  </Text>
                  <br />
                  Contrato firmado
                </Timeline.Item>
              )}

              {sale.paymentStatus === "completed" && (
                <Timeline.Item
                  dot={<CheckCircleOutlined style={{ fontSize: "16px" }} />}
                  color="green"
                >
                  <Text type="secondary">
                    {dayjs(sale.updatedAt).format("DD/MM HH:mm")}
                  </Text>
                  <br />
                  Pago completado
                </Timeline.Item>
              )}

              {sale.commission.status === "paid" && (
                <Timeline.Item
                  dot={<DollarOutlined style={{ fontSize: "16px" }} />}
                  color="green"
                >
                  Comisión pagada
                </Timeline.Item>
              )}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
