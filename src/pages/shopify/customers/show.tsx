import React from "react";
import { Show, DateField } from "@refinedev/antd";
import { Card, Descriptions, Space, Tag, Typography, Table, Divider, Avatar, Badge } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, DollarOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useShow } from "@refinedev/core";

const { Title, Text } = Typography;

export const ShopifyCustomerShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading} title={`Cliente: ${record?.firstName} ${record?.lastName}`}>
      {record && (
        <>
          <Card>
            <Space align="start" size={24}>
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }}>
                {record.firstName?.[0]}{record.lastName?.[0]}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {record.firstName} {record.lastName}
                </Title>
                <Space direction="vertical" size={4}>
                  <Space>
                    <MailOutlined />
                    <Text>{record.email}</Text>
                    {record.verifiedEmail && <Tag color="green">Email Verificado</Tag>}
                  </Space>
                  {record.phone && (
                    <Space>
                      <PhoneOutlined />
                      <Text>{record.phone}</Text>
                    </Space>
                  )}
                </Space>
              </div>
              <Space direction="vertical" align="center">
                <Badge count={record.ordersCount} style={{ backgroundColor: "#1890ff" }}>
                  <ShoppingOutlined style={{ fontSize: 24 }} />
                </Badge>
                <Text type="secondary">Órdenes</Text>
              </Space>
              <Space direction="vertical" align="center">
                <DollarOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                <Text strong>{record.currency} {record.totalSpent}</Text>
                <Text type="secondary">Total Gastado</Text>
              </Space>
            </Space>
          </Card>

          <Card style={{ marginTop: 16 }} title="Información del Cliente">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID de Shopify">
                {record.shopifyId}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={
                  record.state === "enabled" ? "green" : 
                  record.state === "disabled" ? "red" : 
                  record.state === "invited" ? "blue" : "orange"
                }>
                  {record.state === "enabled" ? "Activo" : 
                   record.state === "disabled" ? "Desactivado" : 
                   record.state === "invited" ? "Invitado" : "Rechazado"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Acepta Marketing">
                <Tag color={record.acceptsMarketing ? "green" : "default"}>
                  {record.acceptsMarketing ? "Sí" : "No"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Exento de Impuestos">
                <Tag color={record.taxExempt ? "orange" : "default"}>
                  {record.taxExempt ? "Sí" : "No"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Última Orden">
                {record.lastOrderName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Moneda">
                {record.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Cliente Desde">
                <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />
              </Descriptions.Item>
              <Descriptions.Item label="Última Actualización">
                <DateField value={record.updatedAt} format="DD/MM/YYYY HH:mm" />
              </Descriptions.Item>
            </Descriptions>

            {record.note && (
              <>
                <Divider>Notas</Divider>
                <Text>{record.note}</Text>
              </>
            )}

            {record.tags?.length > 0 && (
              <>
                <Divider>Etiquetas</Divider>
                <Space wrap>
                  {record.tags.map((tag: string, index: number) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </Space>
              </>
            )}
          </Card>

          {record.addresses?.length > 0 && (
            <Card style={{ marginTop: 16 }} title="Direcciones">
              <Table
                dataSource={record.addresses}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: "Tipo",
                    key: "type",
                    render: (_, record: any) => (
                      <Tag color={record.default ? "green" : "default"}>
                        {record.default ? "Principal" : "Alternativa"}
                      </Tag>
                    ),
                  },
                  {
                    title: "Dirección",
                    key: "address",
                    render: (_, record: any) => (
                      <Space direction="vertical" size={0}>
                        <Text>{record.address1}</Text>
                        {record.address2 && <Text type="secondary">{record.address2}</Text>}
                      </Space>
                    ),
                  },
                  {
                    title: "Ciudad",
                    dataIndex: "city",
                    key: "city",
                  },
                  {
                    title: "Provincia/Estado",
                    dataIndex: "province",
                    key: "province",
                  },
                  {
                    title: "Código Postal",
                    dataIndex: "zip",
                    key: "zip",
                  },
                  {
                    title: "País",
                    dataIndex: "country",
                    key: "country",
                  },
                  {
                    title: "Teléfono",
                    dataIndex: "phone",
                    key: "phone",
                    render: (value: string) => value || "-",
                  },
                ]}
              />
            </Card>
          )}
        </>
      )}
    </Show>
  );
};
