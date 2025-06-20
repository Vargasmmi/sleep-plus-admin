import React from "react";
import { Show, DateField } from "@refinedev/antd";
import { Card, Descriptions, Space, Tag, Typography, Divider, Collapse, Badge, Alert } from "antd";
import { ApiOutlined, InfoCircleOutlined, CodeOutlined, FileTextOutlined } from "@ant-design/icons";
import { useShow } from "@refinedev/core";
import { IWebhook } from "../../interfaces/activityLog";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

export const WebhookShow: React.FC = () => {
  const { queryResult } = useShow<IWebhook>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; text: string }> = {
      pending: { color: "processing", text: "Pendiente" },
      processed: { color: "success", text: "Procesado" },
      failed: { color: "error", text: "Fallido" },
      retrying: { color: "warning", text: "Reintentando" },
    };
    return configs[status] || { color: "default", text: status };
  };

  return (
    <Show isLoading={isLoading} title={`Webhook: ${record?.event || ""}`}>
      {record && (
        <>
          <Card>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID">
                <Text code>{record.id}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Estado">
                <Badge 
                  status={getStatusConfig(record.status).color as any} 
                  text={getStatusConfig(record.status).text}
                />
              </Descriptions.Item>
              
              <Descriptions.Item label="Fuente">
                <Tag color={record.source === "shopify" ? "blue" : "default"}>
                  {record.source.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Evento">
                <Tag color="blue">{record.event}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Recibido">
                <DateField value={record.receivedAt} format="DD/MM/YYYY HH:mm:ss" />
              </Descriptions.Item>
              
              <Descriptions.Item label="Procesado">
                {record.processedAt ? (
                  <DateField value={record.processedAt} format="DD/MM/YYYY HH:mm:ss" />
                ) : (
                  <Text type="secondary">No procesado</Text>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Intentos">
                <Space>
                  <Text>{record.attempts}</Text>
                  {record.attempts >= 3 && record.status === "failed" && (
                    <Tag color="red">Máximo alcanzado</Tag>
                  )}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Duración">
                {record.processedAt && (
                  <Text>
                    {((new Date(record.processedAt).getTime() - new Date(record.receivedAt).getTime()) / 1000).toFixed(2)}s
                  </Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Collapse defaultActiveKey={["headers", "payload"]} style={{ marginTop: 16 }}>
            <Panel 
              header={<Space><FileTextOutlined /> Headers</Space>} 
              key="headers"
            >
              <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 4, overflow: "auto" }}>
                {JSON.stringify(record.headers, null, 2)}
              </pre>
            </Panel>

            <Panel 
              header={<Space><CodeOutlined /> Payload</Space>} 
              key="payload"
            >
              <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 4, overflow: "auto" }}>
                {JSON.stringify(record.payload, null, 2)}
              </pre>
            </Panel>

            {record.response && (
              <Panel 
                header={
                  <Space>
                    <InfoCircleOutlined style={{ color: "#52c41a" }} /> 
                    Response (Status: {record.response.status})
                  </Space>
                } 
                key="response"
              >
                <Alert
                  message="Procesado exitosamente"
                  description={record.response.message}
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <pre style={{ background: "#f6ffed", padding: 16, borderRadius: 4, overflow: "auto" }}>
                  {JSON.stringify(record.response, null, 2)}
                </pre>
              </Panel>
            )}

            {record.error && (
              <Panel 
                header={
                  <Space>
                    <InfoCircleOutlined style={{ color: "#ff4d4f" }} /> 
                    Error
                  </Space>
                } 
                key="error"
              >
                <Alert
                  message={`Error: ${record.error.code}`}
                  description={record.error.message}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Descriptions column={1}>
                  <Descriptions.Item label="Código">
                    <Text code>{record.error.code}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mensaje">
                    <Text type="danger">{record.error.message}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Timestamp">
                    <DateField value={record.error.timestamp} format="DD/MM/YYYY HH:mm:ss" />
                  </Descriptions.Item>
                </Descriptions>
              </Panel>
            )}
          </Collapse>
        </>
      )}
    </Show>
  );
};