import React, { useState } from "react";
import { Card, Typography, Space, Tag, Button, message, Alert, Table, Switch, Badge, Tooltip, Row, Col, Divider } from "antd";
import { CopyOutlined, ApiOutlined, CheckCircleOutlined, LinkOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { IWebhookEvent } from "../../interfaces/activityLog";

const { Title, Text, Paragraph } = Typography;

export const WebhookSettings: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Get the current domain
  const baseUrl = window.location.origin;
  const serverUrl = baseUrl.replace('5173', '3001'); // Assuming server runs on 3001
  
  const { data: webhookEventsData, isLoading } = useList<IWebhookEvent>({
    resource: "webhookEvents",
  });

  const webhookEvents = webhookEventsData?.data || [];

  const handleCopy = (url: string, eventId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(eventId);
    message.success('URL copiada al portapapeles');
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const getFullUrl = (endpoint: string) => {
    return `${serverUrl}${endpoint}`;
  };

  const columns = [
    {
      title: "Evento",
      dataIndex: "event",
      key: "event",
      render: (value: string) => (
        <Space>
          <ApiOutlined />
          <Text strong>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      width: 300,
    },
    {
      title: "Estado",
      dataIndex: "enabled",
      key: "enabled",
      width: 100,
      render: (value: boolean) => (
        <Badge 
          status={value ? "success" : "default"} 
          text={value ? "Activo" : "Inactivo"} 
        />
      ),
    },
    {
      title: "URL del Webhook",
      key: "url",
      render: (_: any, record: IWebhookEvent) => {
        const url = getFullUrl(record.endpoint);
        const isCopied = copiedId === record.id;
        
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Text code style={{ fontSize: 12 }}>{url}</Text>
              <Tooltip title={isCopied ? "¡Copiado!" : "Copiar URL"}>
                <Button
                  size="small"
                  icon={isCopied ? <CheckCircleOutlined /> : <CopyOutlined />}
                  onClick={() => handleCopy(url, record.id)}
                  type={isCopied ? "primary" : "default"}
                />
              </Tooltip>
            </Space>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Configuración de Webhooks</Title>
      
      <Alert
        message="Información Importante"
        description={
          <Space direction="vertical">
            <Text>
              Los webhooks permiten que Shopify notifique a tu aplicación cuando ocurren eventos importantes.
              Copia las URLs a continuación y configúralas en tu panel de administración de Shopify.
            </Text>
            <Text type="secondary">
              Nota: Asegúrate de que tu servidor esté accesible desde Internet para recibir webhooks de Shopify.
            </Text>
          </Space>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={4}>URL Base del Servidor</Title>
                <Space>
                  <Text code style={{ fontSize: 16 }}>{serverUrl}</Text>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(serverUrl);
                      message.success('URL base copiada');
                    }}
                  >
                    Copiar
                  </Button>
                </Space>
              </div>

              <Divider />

              <div>
                <Title level={4}>Endpoints de Webhook Disponibles</Title>
                <Table
                  dataSource={webhookEvents}
                  columns={columns}
                  loading={isLoading}
                  rowKey="id"
                  pagination={false}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Cómo configurar en Shopify">
            <ol>
              <li>
                <Text>Ve a tu Admin de Shopify</Text>
              </li>
              <li>
                <Text>Navega a Settings → Notifications</Text>
              </li>
              <li>
                <Text>Desplázate hasta "Webhooks"</Text>
              </li>
              <li>
                <Text>Haz clic en "Create webhook"</Text>
              </li>
              <li>
                <Text>Selecciona el evento que deseas monitorear</Text>
              </li>
              <li>
                <Text>Pega la URL correspondiente de arriba</Text>
              </li>
              <li>
                <Text>Selecciona formato JSON</Text>
              </li>
              <li>
                <Text>Guarda el webhook</Text>
              </li>
            </ol>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Verificación de Webhooks">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Seguridad"
                description="En producción, siempre verifica la firma HMAC de los webhooks para asegurar que provienen de Shopify."
                type="warning"
                showIcon
              />
              
              <div>
                <Title level={5}>Headers importantes:</Title>
                <ul>
                  <li><Text code>X-Shopify-Topic</Text> - El tipo de evento</li>
                  <li><Text code>X-Shopify-Shop-Domain</Text> - Tu dominio de Shopify</li>
                  <li><Text code>X-Shopify-Webhook-Id</Text> - ID único del webhook</li>
                  <li><Text code>X-Shopify-Hmac-Sha256</Text> - Firma para verificación</li>
                </ul>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Endpoint Genérico">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>
                También puedes usar el endpoint genérico para cualquier evento de Shopify:
              </Text>
              <Space>
                <Text code style={{ fontSize: 14 }}>
                  {serverUrl}/api/webhooks/shopify/[NOMBRE_DEL_EVENTO]
                </Text>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    const genericUrl = `${serverUrl}/api/webhooks/shopify/[NOMBRE_DEL_EVENTO]`;
                    navigator.clipboard.writeText(genericUrl);
                    message.success('URL genérica copiada');
                  }}
                />
              </Space>
              <Text type="secondary">
                Reemplaza [NOMBRE_DEL_EVENTO] con el evento que deseas capturar, por ejemplo: orders/create
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Prueba de Webhooks">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>
                Puedes probar los webhooks usando herramientas como:
              </Text>
              <ul>
                <li>
                  <Space>
                    <LinkOutlined />
                    <Text>Postman - Para enviar requests HTTP</Text>
                  </Space>
                </li>
                <li>
                  <Space>
                    <LinkOutlined />
                    <Text>ngrok - Para exponer tu servidor local a Internet</Text>
                  </Space>
                </li>
                <li>
                  <Space>
                    <LinkOutlined />
                    <Text>Webhook.site - Para debugging de webhooks</Text>
                  </Space>
                </li>
              </ul>
              
              <Alert
                message="Tip para desarrollo"
                description="Usa ngrok para exponer tu servidor local: ngrok http 3001"
                type="info"
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};