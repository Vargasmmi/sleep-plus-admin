import React from "react";
import { Show, NumberField, TextField, DateField } from "@refinedev/antd";
import { useShow, useList } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Descriptions,
  Tag,
  Space,
  Timeline,
  Table,
  Button,
  Avatar,
  Tabs,
  Statistic,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  PhoneFilled,
  StarFilled,
  ScanOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ICustomer, ISubscription, IEvaluation, ICall, ISale } from "../../interfaces";

const { Title, Text } = Typography;

export const CustomerShow: React.FC = () => {
  const { queryResult } = useShow<ICustomer>();
  const { data, isLoading } = queryResult;
  const customer = data?.data;

  // Fetch related data
  const { data: subscriptions } = useList<ISubscription>({
    resource: "subscriptions",
    filters: [{ field: "customerId", operator: "eq", value: customer?.id }],
    queryOptions: { enabled: !!customer?.id },
  });

  const { data: evaluations } = useList<IEvaluation>({
    resource: "evaluations",
    filters: [{ field: "customerId", operator: "eq", value: customer?.id }],
    queryOptions: { enabled: !!customer?.id },
  });

  const { data: calls } = useList<ICall>({
    resource: "calls",
    filters: [{ field: "customerId", operator: "eq", value: customer?.id }],
    sorters: [{ field: "startTime", order: "desc" }],
    pagination: { pageSize: 10 },
    queryOptions: { enabled: !!customer?.id },
  });

  const { data: sales } = useList<ISale>({
    resource: "sales",
    filters: [{ field: "customerId", operator: "eq", value: customer?.id }],
    sorters: [{ field: "createdAt", order: "desc" }],
    queryOptions: { enabled: !!customer?.id },
  });

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "gold":
        return "gold";
      case "silver":
        return "default";
      case "bronze":
        return "orange";
      default:
        return "default";
    }
  };

  const activeSubscription = subscriptions?.data?.find((sub) => sub.status === "active");

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col>
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }}>
                  {customer?.firstName?.[0]}{customer?.lastName?.[0]}
                </Avatar>
              </Col>
              <Col flex="auto">
                <Space direction="vertical" size={0}>
                  <Title level={3} style={{ margin: 0 }}>
                    {customer?.firstName} {customer?.lastName}
                  </Title>
                  <Space>
                    <Tag color={getTierColor(customer?.tier)}>
                      {customer?.tier?.toUpperCase()} TIER
                    </Tag>
                    {customer?.isEliteMember && <Tag color="purple">ELITE MEMBER</Tag>}
                    <Tag color={customer?.membershipStatus === "active" ? "green" : "red"}>
                      {customer?.membershipStatus?.toUpperCase()}
                    </Tag>
                  </Space>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" align="center">
                  <Statistic
                    title="Crédito Disponible"
                    value={customer?.currentCredit || 0}
                    prefix="$"
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Información de Contacto" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<><PhoneOutlined /> Teléfono</>}>
                <Text copyable>{customer?.phone}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                <Text copyable>{customer?.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<><HomeOutlined /> Dirección</>}>
                {customer?.address && (
                  <Space direction="vertical" size={0}>
                    <Text>{customer.address.street}</Text>
                    <Text>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</Text>
                  </Space>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Métricas del Cliente" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Statistic
                title="Valor de Vida"
                value={customer?.lifetimeValue || 0}
                prefix="$"
                suffix="USD"
              />
              <Statistic
                title="Total Trades"
                value={customer?.totalTrades || 0}
                suffix="intercambios"
              />
              <Statistic
                title="Crédito Total Ganado"
                value={customer?.totalCreditEarned || 0}
                prefix="$"
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Tabs
              items={[
                {
                  key: "subscriptions",
                  label: <><CreditCardOutlined /> Suscripciones</>,
                  children: (
                    <Table
                      dataSource={subscriptions?.data || []}
                      pagination={false}
                      columns={[
                        {
                          title: "Plan",
                          dataIndex: "plan",
                          render: (plan) => <Tag color="blue">{plan?.toUpperCase()}</Tag>,
                        },
                        {
                          title: "Estado",
                          dataIndex: "status",
                          render: (status) => (
                            <Tag color={status === "active" ? "green" : "red"}>
                              {status?.toUpperCase()}
                            </Tag>
                          ),
                        },
                        {
                          title: "Precio",
                          render: (_, record) => (
                            <Text>
                              ${record.pricing.monthly}/mes
                            </Text>
                          ),
                        },
                        {
                          title: "Próximo Cobro",
                          dataIndex: ["billing", "nextBillingDate"],
                          render: (date) => <DateField value={date} format="DD/MM/YYYY" />,
                        },
                        {
                          title: "Servicios",
                          render: (_, record) => (
                            <Space>
                              <Tag>
                                Limpiezas: {record.services.cleaningsUsed}/{record.services.cleaningsTotal}
                              </Tag>
                              <Tag>
                                Inspecciones: {record.services.inspectionsUsed}/{record.services.inspectionsTotal}
                              </Tag>
                            </Space>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "evaluations",
                  label: <><ScanOutlined /> Evaluaciones T&S</>,
                  children: (
                    <Table
                      dataSource={evaluations?.data || []}
                      pagination={false}
                      columns={[
                        {
                          title: "ID",
                          dataIndex: "id",
                          render: (id) => <Text code>{id}</Text>,
                        },
                        {
                          title: "Colchón",
                          dataIndex: "mattress",
                          render: (mattress) => (
                            <Space direction="vertical" size={0}>
                              <Text>{mattress.brand} - {mattress.size}</Text>
                              <Text type="secondary">{mattress.age} años - {mattress.condition}</Text>
                            </Space>
                          ),
                        },
                        {
                          title: "Crédito",
                          dataIndex: "creditApproved",
                          render: (credit) => <Tag color="green">${credit}</Tag>,
                        },
                        {
                          title: "Estado",
                          dataIndex: "status",
                          render: (status) => (
                            <Tag color={
                              status === "approved" ? "blue" :
                              status === "redeemed" ? "green" :
                              status === "expired" ? "red" : "default"
                            }>
                              {status?.toUpperCase()}
                            </Tag>
                          ),
                        },
                        {
                          title: "Fecha",
                          dataIndex: "createdAt",
                          render: (date) => <DateField value={date} format="DD/MM/YYYY HH:mm" />,
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "calls",
                  label: <><PhoneFilled /> Historial de Llamadas</>,
                  children: (
                    <Timeline
                      items={calls?.data?.map((call) => ({
                        color: call.disposition === "sale" ? "green" : "blue",
                        children: (
                          <Space direction="vertical" size={0}>
                            <Space>
                              <Text strong>{call.type === "outbound" ? "Saliente" : "Entrante"}</Text>
                              <Tag>{call.disposition}</Tag>
                              <Text type="secondary">{call.duration}s</Text>
                            </Space>
                            {call.notes && <Text type="secondary">{call.notes}</Text>}
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(call.startTime).format("DD/MM/YYYY HH:mm")}
                            </Text>
                          </Space>
                        ),
                      })) || []}
                    />
                  ),
                },
                {
                  key: "purchases",
                  label: <><ShoppingCartOutlined /> Historial de Compras</>,
                  children: (
                    <Table
                      dataSource={sales?.data || []}
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
                          render: (type) => <Tag>{type}</Tag>,
                        },
                        {
                          title: "Canal",
                          dataIndex: "channel",
                          render: (channel) => <Tag>{channel}</Tag>,
                        },
                        {
                          title: "Total",
                          dataIndex: ["amount", "total"],
                          render: (total) => <Text strong>${total}</Text>,
                        },
                        {
                          title: "Estado",
                          dataIndex: "paymentStatus",
                          render: (status) => (
                            <Tag color={status === "completed" ? "green" : "orange"}>
                              {status}
                            </Tag>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
