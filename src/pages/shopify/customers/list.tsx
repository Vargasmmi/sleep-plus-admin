import React, { useState } from "react";
import { List, useTable, ShowButton, EditButton, DateField } from "@refinedev/antd";
import { Table, Space, Tag, Button, Avatar, Typography, Badge } from "antd";
import { UserOutlined, SyncOutlined, MailOutlined, PhoneOutlined, DollarOutlined } from "@ant-design/icons";
import { useNotification, useInvalidate } from "@refinedev/core";
import { shopifyService } from "../../../services/shopifyService";

const { Text } = Typography;

interface IShopifyCustomer {
  id: string;
  shopifyId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  acceptsMarketing: boolean;
  totalSpent: string;
  ordersCount: number;
  state: "enabled" | "disabled" | "invited" | "declined";
  tags: string[];
  note: string;
  verifiedEmail: boolean;
  taxExempt: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
  lastOrderId: string;
  lastOrderName: string;
  addresses: Array<{
    id: string;
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string;
    default: boolean;
  }>;
}

export const ShopifyCustomerList: React.FC = () => {
  const { tableProps } = useTable<IShopifyCustomer>({
    resource: "shopifyCustomers",
    sorters: {
      initial: [{ field: "updatedAt", order: "desc" }],
    },
  });

  const { open } = useNotification();
  const invalidate = useInvalidate();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      await shopifyService.syncCustomers();
      open({
        type: "success",
        message: "Sincronización completada",
        description: "Los clientes se han sincronizado con Shopify",
      });
      // Refrescar la tabla
      invalidate({
        resource: "shopifyCustomers",
        invalidates: ["list"],
      });
    } catch (error: any) {
      open({
        type: "error",
        message: "Error al sincronizar",
        description: error.message || "No se pudieron sincronizar los clientes",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleMergeWithLocal = (shopifyCustomer: IShopifyCustomer) => {
    open({
      type: "info",
      message: "Función en desarrollo",
      description: "La fusión de clientes estará disponible próximamente",
    });
  };

  const columns = [
    {
      title: "Cliente",
      key: "customer",
      render: (_: any, record: IShopifyCustomer) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }}>
            {record.firstName?.[0]}{record.lastName?.[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>
              {record.firstName} {record.lastName}
            </Text>
            <Space size={4}>
              <MailOutlined style={{ fontSize: 12, color: "#8c8c8c" }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.email}
              </Text>
              {record.verifiedEmail && (
                <Tag color="green" style={{ fontSize: 10, padding: "0 4px" }}>
                  Verificado
                </Tag>
              )}
            </Space>
          </Space>
        </Space>
      ),
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      render: (value: string) => value ? (
        <Space size={4}>
          <PhoneOutlined style={{ fontSize: 12, color: "#8c8c8c" }} />
          <Text>{value}</Text>
        </Space>
      ) : "-",
    },
    {
      title: "Estado",
      dataIndex: "state",
      key: "state",
      width: 120,
      render: (value: string) => {
        const config: Record<string, { color: string; text: string }> = {
          enabled: { color: "green", text: "Activo" },
          disabled: { color: "red", text: "Desactivado" },
          invited: { color: "blue", text: "Invitado" },
          declined: { color: "orange", text: "Rechazado" },
        };
        return <Tag color={config[value]?.color}>{config[value]?.text}</Tag>;
      },
    },
    {
      title: "Órdenes",
      key: "orders",
      width: 120,
      render: (_: any, record: IShopifyCustomer) => (
        <Space direction="vertical" size={0} style={{ textAlign: "center" }}>
          <Badge count={record.ordersCount} showZero style={{ backgroundColor: "#1890ff" }} />
          <Text type="secondary" style={{ fontSize: 12 }}>órdenes</Text>
        </Space>
      ),
    },
    {
      title: "Total Gastado",
      key: "totalSpent",
      width: 150,
      render: (_: any, record: IShopifyCustomer) => (
        <Space size={4}>
          <DollarOutlined style={{ color: "#52c41a" }} />
          <Text strong>{record.currency} {record.totalSpent}</Text>
        </Space>
      ),
    },
    {
      title: "Marketing",
      dataIndex: "acceptsMarketing",
      key: "acceptsMarketing",
      width: 100,
      align: "center",
      render: (value: boolean) => (
        <Tag color={value ? "green" : "default"}>
          {value ? "Sí" : "No"}
        </Tag>
      ),
    },
    {
      title: "Última Orden",
      dataIndex: "lastOrderName",
      key: "lastOrderName",
      width: 120,
      render: (value: string) => value || "-",
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (value: string) => <DateField value={value} format="DD/MM/YYYY" />,
    },
    {
      title: "Acciones",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_: any, record: IShopifyCustomer) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          <EditButton hideText size="small" recordItemId={record.id} />
          <Button
            size="small"
            onClick={() => handleMergeWithLocal(record)}
          >
            Fusionar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <List
      title="Clientes de Shopify"
      headerProps={{
        extra: (
          <Space>
            <Button
              type="primary"
              icon={<SyncOutlined spin={syncLoading} />}
              onClick={handleSync}
              loading={syncLoading}
            >
              Sincronizar con Shopify
            </Button>
          </Space>
        ),
      }}
    >
      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1400 }}
        expandable={{
          expandedRowRender: (record: IShopifyCustomer) => (
            <div style={{ padding: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                {record.note && (
                  <div>
                    <Text strong>Notas:</Text>
                    <Text> {record.note}</Text>
                  </div>
                )}
                {record.tags && record.tags.length > 0 && (
                  <div>
                    <Text strong>Etiquetas:</Text>
                    <Space wrap style={{ marginLeft: 8 }}>
                      {record.tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                    </Space>
                  </div>
                )}
                {record.addresses && record.addresses.length > 0 && (
                  <div>
                    <Text strong>Direcciones:</Text>
                    {record.addresses.map((addr, index) => (
                      <div key={addr.id} style={{ marginTop: 8, marginLeft: 16 }}>
                        <Tag color={addr.default ? "green" : "default"}>
                          {addr.default ? "Principal" : `Dirección ${index + 1}`}
                        </Tag>
                        <Text>{addr.address1}</Text>
                        {addr.address2 && <Text>, {addr.address2}</Text>}
                        <br />
                        <Text>{addr.city}, {addr.province} {addr.zip}, {addr.country}</Text>
                        {addr.phone && (
                          <>
                            <br />
                            <PhoneOutlined /> {addr.phone}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <Space>
                    <Text strong>ID de Shopify:</Text>
                    <Text copyable>{record.shopifyId}</Text>
                  </Space>
                </div>
              </Space>
            </div>
          ),
        }}
      />
    </List>
  );
};
