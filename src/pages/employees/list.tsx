import React from "react";
import {
  List,
  useTable,
  DateField,
  ShowButton,
  EditButton,
  FilterDropdown,
  getDefaultSortOrder,
} from "@refinedev/antd";
import { Table, Space, Tag, Input, Select, Avatar, Typography, Progress } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TrophyOutlined,
  PhoneFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { useMany } from "@refinedev/core";
import type { IEmployee, IStore } from "../../interfaces";

const { Text } = Typography;

export const EmployeeList: React.FC = () => {
  const { tableProps, filters, sorters } = useTable<IEmployee>({
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

  // Fetch stores for employees
  const storeIds = tableProps?.dataSource?.map((item) => item.storeId) ?? [];
  const { data: storesData } = useMany<IStore>({
    resource: "stores",
    ids: [...new Set(storeIds)], // Remove duplicates
    queryOptions: {
      enabled: storeIds.length > 0,
    },
  });

  const storesMap = React.useMemo(() => {
    const map: Record<string, IStore> = {};
    storesData?.data?.forEach((store) => {
      map[store.id] = store;
    });
    return map;
  }, [storesData]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "red";
      case "manager":
        return "gold";
      case "agent":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleOutlined />;
      case "break":
        return <PauseCircleOutlined />;
      case "calling":
        return <PhoneFilled />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "break":
        return "orange";
      case "calling":
        return "blue";
      case "inactive":
        return "red";
      default:
        return "default";
    }
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Empleado"
          dataIndex="firstName"
          key="employee"
          render={(_, record: IEmployee) => (
            <Space>
              <Avatar src={record.avatar} icon={<UserOutlined />} size={40}>
                {record.firstName?.[0]}{record.lastName?.[0]}
              </Avatar>
              <Space direction="vertical" size={0}>
                <Text strong>
                  {record.firstName} {record.lastName}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ID: {record.employeeId}
                </Text>
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
          render={(_, record: IEmployee) => (
            <Space direction="vertical" size={0}>
              <Space>
                <MailOutlined />
                <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
              </Space>
              {record.phoneExtension && (
                <Space>
                  <PhoneOutlined />
                  <Text type="secondary" style={{ fontSize: 12 }}>Ext: {record.phoneExtension}</Text>
                </Space>
              )}
            </Space>
          )}
        />

        <Table.Column
          title="Rol"
          dataIndex="role"
          key="role"
          render={(role) => (
            <Tag color={getRoleColor(role)}>
              {role === "admin" && "Administrador"}
              {role === "manager" && "Manager"}
              {role === "agent" && "Agente"}
            </Tag>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                placeholder="Seleccionar rol"
                style={{ width: 150 }}
                options={[
                  { value: "admin", label: "Administrador" },
                  { value: "manager", label: "Manager" },
                  { value: "agent", label: "Agente" },
                ]}
              />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Tienda"
          dataIndex="storeId"
          key="store"
          render={(storeId) => {
            const store = storesMap[storeId];
            return store ? (
              <Text>{store.name}</Text>
            ) : (
              <Text type="secondary">-</Text>
            );
          }}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                placeholder="Seleccionar tienda"
                style={{ width: 150 }}
                options={
                  storesData?.data?.map((store) => ({
                    value: store.id,
                    label: store.name,
                  })) || []
                }
              />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Estado"
          dataIndex="status"
          key="status"
          render={(status) => (
            <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
              {status === "active" && "Activo"}
              {status === "inactive" && "Inactivo"}
              {status === "break" && "En descanso"}
              {status === "calling" && "En llamada"}
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
                  { value: "break", label: "En descanso" },
                  { value: "calling", label: "En llamada" },
                ]}
              />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Rendimiento Hoy"
          key="performance"
          render={(_, record: IEmployee) => {
            const performance = record.performance;
            if (!performance) return <Text type="secondary">-</Text>;

            const callsProgress = (performance.callsToday / performance.callsTarget) * 100;
            
            return (
              <Space direction="vertical" size="small">
                <Space>
                  <PhoneFilled />
                  <Text>{performance.callsToday}/{performance.callsTarget} llamadas</Text>
                </Space>
                <Progress
                  percent={callsProgress}
                  size="small"
                  strokeColor={callsProgress >= 100 ? "#52c41a" : "#1890ff"}
                  showInfo={false}
                />
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Conversión: {performance.conversionRate}%
                  </Text>
                </Space>
              </Space>
            );
          }}
        />

        <Table.Column
          title="Comisiones"
          key="commissions"
          render={(_, record: IEmployee) => {
            const commissions = record.commissions;
            if (!commissions) return <Text type="secondary">-</Text>;

            return (
              <Space direction="vertical" size={0}>
                <Text strong>${commissions.currentMonthCommission}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Este mes ({commissions.currentMonthEvaluations} ventas)
                </Text>
                <Tag color="green" style={{ fontSize: 11 }}>
                  Total: ${commissions.totalCommissionEarned}
                </Tag>
              </Space>
            );
          }}
          sorter
        />

        <Table.Column
          title="Turno"
          dataIndex="shift"
          key="shift"
          render={(shift) => (
            <Tag>
              {shift === "morning" && "Mañana"}
              {shift === "afternoon" && "Tarde"}
              {shift === "full" && "Completo"}
            </Tag>
          )}
        />

        <Table.Column
          title="Antigüedad"
          dataIndex="hiredAt"
          key="hiredAt"
          render={(date) => <DateField value={date} format="DD/MM/YYYY" />}
          sorter
          defaultSortOrder={getDefaultSortOrder("hiredAt", sorters)}
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
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
