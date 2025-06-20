import React from "react";
import { Show, DateField } from "@refinedev/antd";
import { Card, Descriptions, Space, Tag, Typography, Divider, Timeline, Badge } from "antd";
import { UserOutlined, ClockCircleOutlined, DesktopOutlined, ApiOutlined } from "@ant-design/icons";
import { useShow } from "@refinedev/core";
import { IActivityLog } from "../../interfaces/activityLog";

const { Title, Text, Paragraph } = Typography;

export const ActivityLogShow: React.FC = () => {
  const { queryResult } = useShow<IActivityLog>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

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
    };
    return colors[action] || "default";
  };

  const renderDetails = () => {
    if (!record?.details) return null;

    return (
      <Card title="Detalles de la Actividad" style={{ marginTop: 16 }}>
        {record.action === "login" && (
          <Descriptions column={1}>
            {record.details.userAgent && (
              <Descriptions.Item label="Navegador">
                <Text>{record.details.userAgent}</Text>
              </Descriptions.Item>
            )}
            {record.details.ip && (
              <Descriptions.Item label="Dirección IP">
                <Text code>{record.details.ip}</Text>
              </Descriptions.Item>
            )}
            {record.details.location && (
              <Descriptions.Item label="Ubicación">
                <Text>{record.details.location}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}

        {record.action === "update" && record.details.changes && (
          <>
            <Title level={5}>Cambios Realizados</Title>
            <Timeline>
              {Object.entries(record.details.changes).map(([field, change]: [string, any]) => (
                <Timeline.Item key={field}>
                  <Space direction="vertical">
                    <Text strong>{field}</Text>
                    <Space>
                      <Tag color="red">{change.from || "vacío"}</Tag>
                      <Text>→</Text>
                      <Tag color="green">{change.to || "vacío"}</Tag>
                    </Space>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </>
        )}

        {record.action === "create" && record.details.data && (
          <>
            <Title level={5}>Datos Creados</Title>
            <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 4 }}>
              {JSON.stringify(record.details.data, null, 2)}
            </pre>
          </>
        )}

        {record.action === "delete" && record.details.deletedData && (
          <>
            <Title level={5}>Datos Eliminados</Title>
            <pre style={{ background: "#fff1f0", padding: 16, borderRadius: 4 }}>
              {JSON.stringify(record.details.deletedData, null, 2)}
            </pre>
          </>
        )}
      </Card>
    );
  };

  const renderMetadata = () => {
    if (!record?.metadata || Object.keys(record.metadata).length === 0) return null;

    return (
      <Card title="Metadata Adicional" style={{ marginTop: 16 }}>
        <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 4 }}>
          {JSON.stringify(record.metadata, null, 2)}
        </pre>
      </Card>
    );
  };

  return (
    <Show isLoading={isLoading} title="Detalle de Actividad">
      {record && (
        <>
          <Card>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID">
                <Text code>{record.id}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Fecha y Hora">
                <DateField value={record.timestamp} format="DD/MM/YYYY HH:mm:ss" />
              </Descriptions.Item>
              
              <Descriptions.Item label="Usuario">
                <Space>
                  <UserOutlined />
                  <Space direction="vertical" size={0}>
                    <Text strong>{record.userName}</Text>
                    <Text type="secondary">{record.userEmail}</Text>
                  </Space>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="ID de Usuario">
                <Text code>{record.userId}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Acción">
                <Tag color={getActionColor(record.action)} style={{ fontSize: 14 }}>
                  {record.action.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Recurso">
                <Badge status="processing" text={record.resource} />
              </Descriptions.Item>
              
              {record.resourceId && (
                <Descriptions.Item label="ID del Recurso" span={2}>
                  <Text code>{record.resourceId}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {renderDetails()}
          {renderMetadata()}
        </>
      )}
    </Show>
  );
};