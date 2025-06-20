import React from "react";
import { List, useTable, DateField, ShowButton } from "@refinedev/antd";
import { Table, Tag, Space, Typography, Badge, Tooltip, Card, Row, Col, Statistic } from "antd";
import { UserOutlined, ClockCircleOutlined, DesktopOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { IActivityLog } from "../../interfaces/activityLog";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

export const ActivityLogList: React.FC = () => {
  const { tableProps } = useTable<IActivityLog>({
    resource: "activityLogs",
    sorters: {
      initial: [{ field: "timestamp", order: "desc" }],
    },
  });

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "green",
      update: "blue",
      delete: "red",
      view: "default",
      login: "cyan",
      logout: "orange",
      export: "purple",
      import: "purple",
      sync: "geekblue",
      approve: "green",
      reject: "red",
      change_status: "gold",
    };
    return colors[action] || "default";
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: "Creó",
      update: "Actualizó",
      delete: "Eliminó",
      view: "Vió",
      login: "Inició sesión",
      logout: "Cerró sesión",
      export: "Exportó",
      import: "Importó",
      sync: "Sincronizó",
      approve: "Aprobó",
      reject: "Rechazó",
      change_status: "Cambió estado",
      make_call: "Realizó llamada",
      send_email: "Envió email",
    };
    return labels[action] || action;
  };

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      auth: "Autenticación",
      customers: "Clientes",
      subscriptions: "Suscripciones",
      evaluations: "Evaluaciones",
      employees: "Empleados",
      stores: "Tiendas",
      calls: "Llamadas",
      sales: "Ventas",
      campaigns: "Campañas",
      commissions: "Comisiones",
      achievements: "Logros",
      scripts: "Scripts",
      shopifySettings: "Configuración Shopify",
      shopifyProducts: "Productos Shopify",
      shopifyCustomers: "Clientes Shopify",
      shopifyCoupons: "Cupones Shopify",
    };
    return labels[resource] || resource;
  };

  const columns = [
    {
      title: "Fecha y Hora",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (value: string) => (
        <Space direction="vertical" size={0}>
          <DateField value={value} format="DD/MM/YYYY HH:mm:ss" />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(value).fromNow()}
          </Text>
        </Space>
      ),
    },
    {
      title: "Usuario",
      key: "user",
      width: 200,
      render: (_: any, record: IActivityLog) => (
        <Space>
          <UserOutlined />
          <Space direction="vertical" size={0}>
            <Text>{record.userName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.userEmail}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Acción",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (value: string) => (
        <Tag color={getActionColor(value)}>{getActionLabel(value)}</Tag>
      ),
    },
    {
      title: "Recurso",
      dataIndex: "resource",
      key: "resource",
      width: 150,
      render: (value: string) => (
        <Badge status="processing" text={getResourceLabel(value)} />
      ),
    },
    {
      title: "Detalles",
      key: "details",
      render: (_: any, record: IActivityLog) => {
        if (record.action === "login" && record.details.userAgent) {
          return (
            <Space direction="vertical" size={0}>
              <Space>
                <DesktopOutlined />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {record.details.userAgent.split(" ").slice(-3).join(" ")}
                </Text>
              </Space>
              {record.details.location && (
                <Space>
                  <EnvironmentOutlined />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {record.details.location}
                  </Text>
                </Space>
              )}
            </Space>
          );
        }
        
        if (record.action === "update" && record.details.fields) {
          return (
            <Space direction="vertical" size={0}>
              <Text>Campos modificados:</Text>
              <Space wrap>
                {record.details.fields.map((field: string) => (
                  <Tag key={field} color="blue">
                    {field}
                  </Tag>
                ))}
              </Space>
            </Space>
          );
        }

        if (record.action === "create" && record.details.customerName) {
          return (
            <Text>
              Cliente: <strong>{record.details.customerName}</strong>
            </Text>
          );
        }

        if (record.action === "change_status") {
          return (
            <Space>
              <Tag>{record.details.fromStatus}</Tag>
              <Text>→</Text>
              <Tag color="green">{record.details.toStatus}</Tag>
            </Space>
          );
        }

        if (record.resourceId) {
          return (
            <Text type="secondary">
              ID: {record.resourceId}
            </Text>
          );
        }

        return "-";
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_: any, record: IActivityLog) => (
        <Space>
          <Tooltip title="Ver detalles completos">
            <ShowButton hideText size="small" recordItemId={record.id} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Actividades Hoy"
              value={tableProps.dataSource?.filter(
                (log) => dayjs(log.timestamp).isSame(dayjs(), "day")
              ).length || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Usuarios Activos"
              value={new Set(tableProps.dataSource?.map((log) => log.userId)).size || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Acciones de Modificación"
              value={tableProps.dataSource?.filter(
                (log) => ["create", "update", "delete"].includes(log.action)
              ).length || 0}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Inicios de Sesión Hoy"
              value={tableProps.dataSource?.filter(
                (log) => log.action === "login" && dayjs(log.timestamp).isSame(dayjs(), "day")
              ).length || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <List title="Registro de Actividades">
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} actividades`,
          }}
        />
      </List>
    </>
  );
};