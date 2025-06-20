import React from "react";
import {
  List,
  useTable,
  DateField,
  ShowButton,
  CreateButton,
  FilterDropdown,
  getDefaultSortOrder,
} from "@refinedev/antd";
import { Table, Space, Tag, Input, Select, Progress, Typography, Button, Tooltip } from "antd";
import {
  ScanOutlined,
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useMany } from "@refinedev/core";
import dayjs from "dayjs";
import type { IEvaluation, ICustomer } from "../../interfaces";

const { Text } = Typography;

export const EvaluationList: React.FC = () => {
  const { tableProps, filters, sorters } = useTable<IEvaluation>({
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

  // Fetch customers for evaluations
  const customerIds = tableProps?.dataSource?.map((item) => item.customerId) ?? [];
  const { data: customersData } = useMany<ICustomer>({
    resource: "customers",
    ids: customerIds,
    queryOptions: {
      enabled: customerIds.length > 0,
    },
  });

  const customersMap = React.useMemo(() => {
    const map: Record<string, ICustomer> = {};
    customersData?.data?.forEach((customer) => {
      map[customer.id] = customer;
    });
    return map;
  }, [customersData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "blue";
      case "redeemed":
        return "green";
      case "expired":
        return "red";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleOutlined />;
      case "redeemed":
        return <DollarOutlined />;
      case "expired":
        return <ClockCircleOutlined />;
      default:
        return <ScanOutlined />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "green";
      case "good":
        return "blue";
      case "fair":
        return "orange";
      case "poor":
        return "red";
      default:
        return "default";
    }
  };

  const getMattressSizeIcon = (size: string) => {
    const sizeMap: Record<string, string> = {
      twin: "🛏️",
      full: "🛏️🛏️",
      queen: "👑",
      king: "👑👑",
      "cal-king": "👑🌴",
    };
    return sizeMap[size] || "🛏️";
  };

  return (
    <List
      headerButtons={
        <CreateButton
          type="primary"
          icon={<ScanOutlined />}
        >
          Nueva Evaluación
        </CreateButton>
      }
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="ID Evaluación"
          dataIndex="id"
          key="id"
          render={(id) => (
            <Space>
              <ScanOutlined />
              <Text code copyable style={{ fontSize: 12 }}>
                {id}
              </Text>
            </Space>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="Buscar por ID..." />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Cliente"
          dataIndex="customerId"
          key="customer"
          render={(customerId) => {
            const customer = customersMap[customerId];
            if (!customer) return <Text>-</Text>;

            return (
              <Space>
                <UserOutlined />
                <Space direction="vertical" size={0}>
                  <Text strong>
                    {customer.firstName} {customer.lastName}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {customer.phone}
                  </Text>
                </Space>
              </Space>
            );
          }}
        />

        <Table.Column
          title="Colchón"
          dataIndex="mattress"
          key="mattress"
          render={(mattress) => (
            <Space direction="vertical" size={0}>
              <Space>
                <Text>{getMattressSizeIcon(mattress.size)}</Text>
                <Text strong>
                  {mattress.brand} {mattress.model || ""}
                </Text>
              </Space>
              <Space>
                <Tag>{mattress.size.toUpperCase()}</Tag>
                <Tag>{mattress.age} años</Tag>
                <Tag color={getConditionColor(mattress.condition)}>
                  {mattress.condition}
                </Tag>
              </Space>
            </Space>
          )}
        />

        <Table.Column
          title="Evaluación IA"
          key="aiScore"
          render={(_, record: IEvaluation) => {
            // Verificar si aiEvaluation existe
            if (!record.aiEvaluation) {
              return (
                <Tag color="orange">
                  Pendiente de evaluación
                </Tag>
              );
            }
            
            return (
              <Space direction="vertical" size={0}>
                <Progress
                  percent={record.aiEvaluation.finalScore || 0}
                  size="small"
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                />
                <Space>
                  <Tooltip title="Score de Condición">
                    <Tag>C: {record.aiEvaluation.conditionScore || 0}</Tag>
                  </Tooltip>
                  <Tooltip title="Score de Marca">
                    <Tag>M: {record.aiEvaluation.brandScore || 0}</Tag>
                  </Tooltip>
                  <Tooltip title="Confianza">
                    <Tag color="blue">{record.aiEvaluation.confidence || 0}%</Tag>
                  </Tooltip>
                </Space>
              </Space>
            );
          }}
        />

        <Table.Column
          title="Crédito Aprobado"
          dataIndex="creditApproved"
          key="creditApproved"
          render={(credit) => (
            <Tag color="green" style={{ fontSize: 16, padding: "4px 12px" }}>
              <DollarOutlined /> {credit}
            </Tag>
          )}
          sorter
          defaultSortOrder={getDefaultSortOrder("creditApproved", sorters)}
        />

        <Table.Column
          title="Estado"
          dataIndex="status"
          key="status"
          render={(status) => (
            <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
              {status === "approved" && "APROBADO"}
              {status === "redeemed" && "REDIMIDO"}
              {status === "expired" && "EXPIRADO"}
              {status === "pending" && "PENDIENTE"}
            </Tag>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                placeholder="Seleccionar estado"
                style={{ width: 150 }}
                options={[
                  { value: "approved", label: "Aprobado" },
                  { value: "redeemed", label: "Redimido" },
                  { value: "expired", label: "Expirado" },
                  { value: "pending", label: "Pendiente" },
                ]}
              />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Fotos"
          dataIndex="photos"
          key="photos"
          render={(photos) => (
            <Space>
              <FileImageOutlined />
              <Text>{photos?.length || 0} fotos</Text>
            </Space>
          )}
        />

        <Table.Column
          title="Fecha Creación"
          dataIndex="createdAt"
          key="createdAt"
          render={(date) => <DateField value={date} format="DD/MM/YYYY HH:mm" />}
          sorter
          defaultSortOrder={getDefaultSortOrder("createdAt", sorters)}
        />

        <Table.Column
          title="Expira"
          dataIndex="expiresAt"
          key="expiresAt"
          render={(date, record: IEvaluation) => {
            const daysUntilExpiry = dayjs(date).diff(dayjs(), "days");
            const isExpired = daysUntilExpiry < 0;
            const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 7;

            return (
              <Space direction="vertical" size={0}>
                <DateField value={date} format="DD/MM/YYYY" />
                {record.status === "approved" && (
                  <>
                    {isExpired && (
                      <Tag color="red" style={{ fontSize: 11 }}>
                        Expirado
                      </Tag>
                    )}
                    {isExpiringSoon && (
                      <Tag color="orange" style={{ fontSize: 11 }}>
                        Expira en {daysUntilExpiry} días
                      </Tag>
                    )}
                    {!isExpired && !isExpiringSoon && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {daysUntilExpiry} días restantes
                      </Text>
                    )}
                  </>
                )}
              </Space>
            );
          }}
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          key="actions"
          fixed="right"
          render={(_, record: IEvaluation) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              {record.status === "approved" && (
                <Tooltip title="Redimir crédito">
                  <Button
                    size="small"
                    type="primary"
                    icon={<DollarOutlined />}
                    onClick={() => {
                      // Handle redemption
                    }}
                  >
                    Redimir
                  </Button>
                </Tooltip>
              )}
              {record.status === "pending" && (
                <Tooltip title="Reenviar evaluación">
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      // Handle re-evaluation
                    }}
                  />
                </Tooltip>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
