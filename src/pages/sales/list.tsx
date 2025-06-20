import React from "react";
import { List, useTable } from "@refinedev/antd";
import { useMany } from "@refinedev/core";
import { Table, Tag, Space, Typography, Statistic } from "antd";
import {
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ISale, ICustomer, IEmployee, IStore } from "../../interfaces";

const { Text } = Typography;

export const SaleList: React.FC = () => {
  const { tableProps } = useTable<ISale>({
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

  const customerIds = tableProps?.dataSource?.map((item) => item.customerId) ?? [];
  const { data: customersData } = useMany<ICustomer>({
    resource: "customers",
    ids: customerIds,
    queryOptions: {
      enabled: customerIds.length > 0,
    },
  });

  const userIds = tableProps?.dataSource?.map((item) => item.userId) ?? [];
  const { data: employeesData } = useMany<IEmployee>({
    resource: "employees",
    ids: userIds,
    queryOptions: {
      enabled: userIds.length > 0,
    },
  });

  const storeIds = tableProps?.dataSource?.map((item) => item.storeId) ?? [];
  const { data: storesData } = useMany<IStore>({
    resource: "stores",
    ids: storeIds,
    queryOptions: {
      enabled: storeIds.length > 0,
    },
  });

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Fecha"
          dataIndex="createdAt"
          key="createdAt"
          render={(value) => (
            <Space direction="vertical" size={0}>
              <Text>{dayjs(value).format("DD/MM/YYYY")}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(value).format("HH:mm")}
              </Text>
            </Space>
          )}
          sorter
        />

        <Table.Column
          title="Cliente"
          dataIndex="customerId"
          key="customerId"
          render={(value) => {
            const customer = customersData?.data?.find((c) => c.id === value);
            return (
              <Space>
                <UserOutlined />
                <a href={`/customers/show/${value}`}>
                  {customer
                    ? `${customer.firstName} ${customer.lastName}`
                    : value}
                </a>
              </Space>
            );
          }}
        />

        <Table.Column
          title="Vendedor"
          dataIndex="userId"
          key="userId"
          render={(value) => {
            const employee = employeesData?.data?.find((e) => e.id === value);
            return (
              <Space>
                <UserOutlined />
                {employee
                  ? `${employee.firstName} ${employee.lastName}`
                  : value}
              </Space>
            );
          }}
        />

        <Table.Column
          title="Tienda"
          dataIndex="storeId"
          key="storeId"
          render={(value) => {
            const store = storesData?.data?.find((s) => s.id === value);
            return (
              <Space>
                <ShopOutlined />
                {store ? store.name : value}
              </Space>
            );
          }}
        />

        <Table.Column
          title="Tipo"
          dataIndex="type"
          key="type"
          render={(value) => (
            <Tag color={getTypeColor(value)}>
              {value === "new"
                ? "Nueva"
                : value === "renewal"
                ? "Renovación"
                : value === "upgrade"
                ? "Mejora"
                : value === "winback"
                ? "Recuperación"
                : value}
            </Tag>
          )}
        />

        <Table.Column
          title="Canal"
          dataIndex="channel"
          key="channel"
          render={(value) => (
            <Space>
              {getChannelIcon(value)}
              <Text>
                {value === "phone"
                  ? "Teléfono"
                  : value === "store"
                  ? "Tienda"
                  : value === "online"
                  ? "Online"
                  : value}
              </Text>
            </Space>
          )}
        />

        <Table.Column
          title="Total"
          dataIndex={["amount", "total"]}
          key="total"
          render={(value) => (
            <Statistic
              value={value}
              prefix="$"
              precision={2}
              valueStyle={{ fontSize: 14 }}
            />
          )}
          sorter
        />

        <Table.Column
          title="Comisión"
          dataIndex={["commission", "total"]}
          key="commission"
          render={(value, record: ISale) => (
            <Space direction="vertical" size={0}>
              <Text strong>${value}</Text>
              <Tag
                color={
                  record.commission.status === "paid"
                    ? "success"
                    : record.commission.status === "approved"
                    ? "processing"
                    : "warning"
                }
              >
                {record.commission.status === "paid"
                  ? "Pagada"
                  : record.commission.status === "approved"
                  ? "Aprobada"
                  : "Pendiente"}
              </Tag>
            </Space>
          )}
        />

        <Table.Column
          title="Estado de Pago"
          dataIndex="paymentStatus"
          key="paymentStatus"
          render={(value) => (
            <Tag
              icon={
                value === "completed" ? (
                  <CheckCircleOutlined />
                ) : value === "pending" ? (
                  <ClockCircleOutlined />
                ) : value === "failed" ? (
                  <ClockCircleOutlined />
                ) : (
                  <SyncOutlined />
                )
              }
              color={getPaymentStatusColor(value)}
            >
              {value === "completed"
                ? "Completado"
                : value === "pending"
                ? "Pendiente"
                : value === "failed"
                ? "Fallido"
                : value === "refunded"
                ? "Reembolsado"
                : value}
            </Tag>
          )}
        />

        <Table.Column
          title="Contrato"
          dataIndex={["contract", "signed"]}
          key="contract"
          render={(signed, record: ISale) => (
            <Tag color={signed ? "success" : "warning"}>
              {signed ? "Firmado" : "Pendiente"}
            </Tag>
          )}
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: ISale) => (
            <Space>
              <a href={`/sales/show/${record.id}`}>Ver detalles</a>
              {record.callId && (
                <a href={`/calls/show/${record.callId}`}>Ver llamada</a>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
