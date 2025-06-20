import React from "react";
import {
  List,
  useTable,
  DateField,
  ShowButton,
  EditButton,
  DeleteButton,
  FilterDropdown,
  getDefaultSortOrder,
} from "@refinedev/antd";
import { Table, Space, Tag, Input, Select, Button, Card, Typography, Tooltip, Avatar } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, DollarOutlined } from "@ant-design/icons";
import { useMany } from "@refinedev/core";
import type { ICustomer } from "../../interfaces";

const { Text } = Typography;

export const CustomerList: React.FC = () => {
  const { tableProps, filters, sorters } = useTable<ICustomer>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
  });

  // Fetch subscriptions for customers
  const customerIds = tableProps?.dataSource?.map((item) => item.id) ?? [];
  const { data: subscriptionsData } = useMany({
    resource: "subscriptions",
    ids: customerIds,
    queryOptions: {
      enabled: customerIds.length > 0,
    },
  });

  const subscriptionsByCustomer = React.useMemo(() => {
    const map: Record<string, any> = {};
    subscriptionsData?.data?.forEach((sub: any) => {
      if (!map[sub.customerId]) {
        map[sub.customerId] = [];
      }
      map[sub.customerId].push(sub);
    });
    return map;
  }, [subscriptionsData]);

  const getTierColor = (tier: string) => {
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

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "gold":
        return "🥇";
      case "silver":
        return "🥈";
      case "bronze":
        return "🥉";
      default:
        return "👤";
    }
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Cliente"
          dataIndex="firstName"
          key="customer"
          render={(_, record: ICustomer) => (
            <Space>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }}>
                {record.firstName?.[0]}{record.lastName?.[0]}
              </Avatar>
              <Space direction="vertical" size={0}>
                <Text strong>
                  {record.firstName} {record.lastName}
                </Text>
                <Space size="small">
                  <Tag color={getTierColor(record.tier)}>
                    {getTierIcon(record.tier)} {record.tier?.toUpperCase()}
                  </Tag>
                  {record.isEliteMember && <Tag color="purple">Elite</Tag>}
                </Space>
              </Space>
            </Space>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="Buscar por nombre..." />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Contacto"
          key="contact"
          render={(_, record: ICustomer) => (
            <Space direction="vertical" size={0}>
              <Space>
                <PhoneOutlined />
                <Text>{record.phone}</Text>
              </Space>
              <Space>
                <MailOutlined />
                <Text type="secondary">{record.email}</Text>
              </Space>
            </Space>
          )}
        />

        <Table.Column
          title="Ubicación"
          dataIndex={["address", "city"]}
          key="location"
          render={(city, record: ICustomer) => (
            <Text>
              {city}, {record.address?.state}
            </Text>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                placeholder="Seleccionar ciudad"
                style={{ width: 200 }}
                options={[
                  { value: "Los Angeles", label: "Los Angeles" },
                  { value: "Studio City", label: "Studio City" },
                  { value: "Santa Monica", label: "Santa Monica" },
                ]}
              />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Valor de Vida"
          dataIndex="lifetimeValue"
          key="lifetimeValue"
          render={(value) => (
            <Tooltip title="Total gastado en la tienda">
              <Space>
                <DollarOutlined />
                <Text strong>${value?.toLocaleString() || 0}</Text>
              </Space>
            </Tooltip>
          )}
          sorter
          defaultSortOrder={getDefaultSortOrder("lifetimeValue", sorters)}
        />

        <Table.Column
          title="Última Compra"
          dataIndex="lastPurchaseDate"
          key="lastPurchaseDate"
          render={(value) => <DateField value={value} format="DD/MM/YYYY" />}
          sorter
          defaultSortOrder={getDefaultSortOrder("lastPurchaseDate", sorters)}
        />

        <Table.Column
          title="Crédito Actual"
          dataIndex="currentCredit"
          key="currentCredit"
          render={(value) => (
            <Tag color={value > 0 ? "green" : "default"}>
              ${value || 0}
            </Tag>
          )}
        />

        <Table.Column
          title="Suscripción"
          key="subscription"
          render={(_, record: ICustomer) => {
            const subs = subscriptionsByCustomer[record.id] || [];
            const activeSub = subs.find((s: any) => s.status === "active");
            
            if (activeSub) {
              return (
                <Tag color="blue">
                  {activeSub.plan.toUpperCase()}
                </Tag>
              );
            }
            return <Tag>Sin suscripción</Tag>;
          }}
        />

        <Table.Column
          title="Estado"
          dataIndex="membershipStatus"
          key="status"
          render={(status) => (
            <Tag color={status === "active" ? "green" : "red"}>
              {status === "active" ? "Activo" : "Inactivo"}
            </Tag>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                placeholder="Seleccionar estado"
                style={{ width: 150 }}
                options={[
                  { value: "active", label: "Activo" },
                  { value: "inactive", label: "Inactivo" },
                ]}
              />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          key="actions"
          fixed="right"
          render={(_, record) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
