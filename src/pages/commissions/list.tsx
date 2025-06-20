import React from "react";
import { List, useTable } from "@refinedev/antd";
import { useMany } from "@refinedev/core";
import { Table, Tag, Space, Typography, Statistic, Progress } from "antd";
import {
  WalletOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ICommission, IEmployee } from "../../interfaces";

const { Text } = Typography;

export const CommissionList: React.FC = () => {
  const { tableProps } = useTable<ICommission>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "period.year",
          order: "desc",
        },
        {
          field: "period.month",
          order: "desc",
        },
      ],
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "approved":
        return "processing";
      case "pending_approval":
        return "warning";
      case "calculating":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircleOutlined />;
      case "approved":
        return <CheckCircleOutlined />;
      case "pending_approval":
        return <ClockCircleOutlined />;
      case "calculating":
        return <SyncOutlined spin />;
      default:
        return null;
    }
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Período"
          key="period"
          render={(_, record: ICommission) => (
            <Space direction="vertical" size={0}>
              <Text strong>
                {monthNames[record.period.month - 1]} {record.period.year}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(record.period.startDate).format("DD/MM")} - {dayjs(record.period.endDate).format("DD/MM")}
              </Text>
            </Space>
          )}
          sorter
        />

        <Table.Column
          title="Empleado"
          dataIndex="userId"
          key="userId"
          render={(value) => {
            const employee = employeesData?.data?.find((e) => e.id === value);
            return (
              <Space>
                <UserOutlined />
                {employee ? (
                  <a href={`/employees/show/${value}`}>
                    {employee.firstName} {employee.lastName}
                  </a>
                ) : (
                  value
                )}
              </Space>
            );
          }}
        />

        <Table.Column
          title="Ventas"
          key="sales"
          render={(_, record: ICommission) => (
            <Space direction="vertical" size={0}>
              <Text strong>{record.sales.count} ventas</Text>
              <Text type="secondary">
                ${record.sales.revenue.toLocaleString()}
              </Text>
            </Space>
          )}
        />

        <Table.Column
          title="Ganancias Base"
          dataIndex={["earnings", "baseSales"]}
          key="baseSales"
          render={(value) => (
            <Statistic
              value={value}
              prefix="$"
              precision={2}
              valueStyle={{ fontSize: 14 }}
            />
          )}
        />

        <Table.Column
          title="Bonos"
          key="bonuses"
          render={(_, record: ICommission) => {
            const totalBonuses = 
              record.earnings.bonuses.conversion +
              record.earnings.bonuses.volume +
              record.earnings.bonuses.retention +
              record.earnings.bonuses.other;

            return (
              <Space direction="vertical" size={0}>
                <Statistic
                  value={totalBonuses}
                  prefix="$"
                  precision={2}
                  valueStyle={{ fontSize: 14, color: "#3f8600" }}
                />
                <Progress
                  percent={(totalBonuses / record.earnings.total) * 100}
                  size="small"
                  showInfo={false}
                />
              </Space>
            );
          }}
        />

        <Table.Column
          title="Deducciones"
          dataIndex={["earnings", "deductions"]}
          key="deductions"
          render={(value) => (
            <Statistic
              value={value}
              prefix="-$"
              precision={2}
              valueStyle={{ fontSize: 14, color: value > 0 ? "#cf1322" : undefined }}
            />
          )}
        />

        <Table.Column
          title="Total"
          dataIndex={["earnings", "total"]}
          key="total"
          render={(value) => (
            <Statistic
              value={value}
              prefix="$"
              precision={2}
              valueStyle={{ fontSize: 16, fontWeight: "bold", color: "#3f8600" }}
            />
          )}
          sorter
        />

        <Table.Column
          title="Estado"
          dataIndex="status"
          key="status"
          render={(value) => (
            <Tag icon={getStatusIcon(value)} color={getStatusColor(value)}>
              {value === "paid"
                ? "Pagada"
                : value === "approved"
                ? "Aprobada"
                : value === "pending_approval"
                ? "Pendiente de aprobación"
                : "Calculando"}
            </Tag>
          )}
        />

        <Table.Column
          title="Método de Pago"
          dataIndex="paymentMethod"
          key="paymentMethod"
          render={(value, record: ICommission) => {
            if (record.status !== "paid") return "-";
            return (
              <Text>
                {value === "payroll"
                  ? "Nómina"
                  : value === "direct_deposit"
                  ? "Depósito directo"
                  : value === "check"
                  ? "Cheque"
                  : value}
              </Text>
            );
          }}
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: ICommission) => (
            <Space>
              <a href={`/commissions/show/${record.id}`}>Ver detalles</a>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
