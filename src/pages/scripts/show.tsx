import React from "react";
import { Show } from "@refinedev/antd";
import { useShow, useOne } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Statistic,
  Progress,
  Timeline,
  Alert,
  List,
  Collapse,
  Descriptions,
  Button,
} from "antd";
import {
  FileTextOutlined,
  LineChartOutlined,
  PercentageOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FolderOpenOutlined,
  CopyOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { IScript, IEmployee } from "../../interfaces";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

export const ScriptShow: React.FC = () => {
  const { queryResult } = useShow<IScript>();
  const { data, isLoading } = queryResult;
  const script = data?.data;

  const { data: creatorData } = useOne<IEmployee>({
    resource: "employees",
    id: script?.createdBy || "",
    queryOptions: {
      enabled: !!script?.createdBy,
    },
  });

  const creator = creatorData?.data;

  if (isLoading || !script) {
    return <div>Cargando...</div>;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "cold":
        return "blue";
      case "warm":
        return "orange";
      case "winback":
        return "purple";
      case "renewal":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleOutlined />;
      case "draft":
        return <EditOutlined />;
      case "archived":
        return <FolderOpenOutlined />;
      default:
        return null;
    }
  };

  const segmentTypes = [
    { value: "opening", label: "Apertura", color: "blue" },
    { value: "discovery", label: "Descubrimiento", color: "purple" },
    { value: "pitch", label: "Propuesta", color: "green" },
    { value: "close", label: "Cierre", color: "gold" },
    { value: "objection", label: "Manejo de objeción", color: "red" },
  ];

  const getSegmentTypeInfo = (type: string) => {
    return segmentTypes.find((t) => t.value === type) || { label: type, color: "default" };
  };

  return (
    <Show>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
              <Space align="start">
                <FileTextOutlined style={{ fontSize: 24 }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {script.name}
                  </Title>
                  <Space style={{ marginTop: 8 }}>
                    <Tag color={getTypeColor(script.type)}>
                      {script.type === "cold"
                        ? "Llamada fría"
                        : script.type === "warm"
                        ? "Llamada cálida"
                        : script.type === "winback"
                        ? "Recuperación"
                        : "Renovación"}
                    </Tag>
                    <Tag icon={getStatusIcon(script.status)} color={getStatusColor(script.status)}>
                      {script.status === "active"
                        ? "Activo"
                        : script.status === "draft"
                        ? "Borrador"
                        : "Archivado"}
                    </Tag>
                    <Text>Versión {script.version}</Text>
                  </Space>
                </div>
              </Space>
              {script.status !== "archived" && (
                <Button type="primary" href={`/scripts/edit/${script.id}`}>
                  Editar Script
                </Button>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {/* Métricas de rendimiento */}
          {script.usageCount > 0 && (
            <Card title="Métricas de Rendimiento">
              <Row gutter={[16, 16]}>
                <Col xs={8}>
                  <Statistic
                    title="Uso total"
                    value={script.usageCount}
                    prefix={<LineChartOutlined />}
                    suffix="veces"
                  />
                </Col>
                <Col xs={8}>
                  <Statistic
                    title="Tasa de éxito"
                    value={script.successRate || 0}
                    suffix="%"
                    prefix={<PercentageOutlined />}
                    valueStyle={{
                      color: (script.successRate || 0) >= 15 ? "#3f8600" : "#cf1322",
                    }}
                  />
                </Col>
                <Col xs={8}>
                  <Progress
                    type="dashboard"
                    percent={script.successRate || 0}
                    format={(percent) => `${percent}%`}
                    strokeColor={{
                      "0%": "#ff4d4f",
                      "50%": "#faad14",
                      "100%": "#52c41a",
                    }}
                  />
                </Col>
              </Row>

              {script.successRate && script.successRate < 15 && (
                <Alert
                  style={{ marginTop: 16 }}
                  message="Rendimiento bajo"
                  description="Este script tiene una tasa de éxito menor al 15%. Considera revisar el contenido o las condiciones de uso."
                  type="warning"
                  showIcon
                />
              )}
            </Card>
          )}

          {/* Segmentos del script */}
          <Card title="Contenido del Script" style={{ marginTop: 16 }}>
            <Collapse defaultActiveKey={["0"]}>
              {script.segments.map((segment, index) => {
                const segmentInfo = getSegmentTypeInfo(segment.type);
                return (
                  <Panel
                    key={segment.id}
                    header={
                      <Space>
                        <Tag color={segmentInfo.color}>{segmentInfo.label}</Tag>
                        <Text>Segmento {index + 1}</Text>
                        {segment.conditions && (
                          <Tag icon={<BranchesOutlined />}>Con condiciones</Tag>
                        )}
                      </Space>
                    }
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Paragraph
                        copyable={{
                          icon: [<CopyOutlined />, <CheckCircleOutlined />],
                          tooltips: ["Copiar texto", "¡Copiado!"],
                        }}
                      >
                        {segment.content}
                      </Paragraph>

                      {segment.conditions && (
                        <Alert
                          message="Condiciones de activación"
                          description={
                            <Space direction="vertical">
                              {segment.conditions.customerTier && (
                                <div>
                                  <Text strong>Niveles de cliente: </Text>
                                  {segment.conditions.customerTier.map((tier) => (
                                    <Tag key={tier} color={tier === "gold" ? "gold" : tier === "silver" ? "silver" : "bronze"}>
                                      {tier === "gold" ? "Oro" : tier === "silver" ? "Plata" : "Bronce"}
                                    </Tag>
                                  ))}
                                </div>
                              )}
                              {segment.conditions.hasSubscription !== undefined && (
                                <div>
                                  <Text strong>Suscripción: </Text>
                                  <Tag color={segment.conditions.hasSubscription ? "green" : "red"}>
                                    {segment.conditions.hasSubscription ? "Requerida" : "No requerida"}
                                  </Tag>
                                </div>
                              )}
                              {segment.conditions.productAge && (
                                <div>
                                  <Text strong>Edad del producto: </Text>
                                  {segment.conditions.productAge.min} - {segment.conditions.productAge.max} meses
                                </div>
                              )}
                            </Space>
                          }
                          type="info"
                          showIcon
                        />
                      )}

                      {segment.branches && segment.branches.length > 0 && (
                        <Alert
                          message="Ramificaciones"
                          description={
                            <List
                              size="small"
                              dataSource={segment.branches}
                              renderItem={(branch) => (
                                <List.Item>
                                  <Space>
                                    <BranchesOutlined />
                                    <Text>
                                      Si la respuesta es <Tag>{branch.condition}</Tag> → 
                                      Ir al segmento <Tag>{branch.nextSegmentId}</Tag>
                                    </Text>
                                  </Space>
                                </List.Item>
                              )}
                            />
                          }
                          type="warning"
                          showIcon
                        />
                      )}
                    </Space>
                  </Panel>
                );
              })}
            </Collapse>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Variables */}
          <Card title="Variables Dinámicas">
            {script.variables.length > 0 ? (
              <Space wrap>
                {script.variables.map((variable) => (
                  <Tag key={variable} icon={<TagOutlined />} color="blue">
                    {variable}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">Este script no usa variables dinámicas</Text>
            )}

            <Alert
              style={{ marginTop: 16 }}
              message="Uso de variables"
              description="Las variables se reemplazan automáticamente con la información del cliente durante la llamada."
              type="info"
              showIcon
            />
          </Card>

          {/* Información del script */}
          <Card title="Información" style={{ marginTop: 16 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="ID">
                <Text copyable>{script.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Creado por">
                {creator ? (
                  <a href={`/employees/show/${creator.id}`}>
                    {creator.firstName} {creator.lastName}
                  </a>
                ) : (
                  script.createdBy
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de creación">
                {dayjs(script.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Última actualización">
                {dayjs(script.updatedAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Acciones rápidas */}
          <Card title="Acciones" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                block
                icon={<PlayCircleOutlined />}
                onClick={() => alert("Función de prueba no implementada")}
              >
                Probar script
              </Button>
              <Button
                block
                icon={<CopyOutlined />}
                onClick={() => alert("Script copiado al portapapeles")}
              >
                Copiar script completo
              </Button>
              {script.status === "active" && (
                <Button
                  block
                  danger
                  onClick={() => alert("Función de archivado no implementada")}
                >
                  Archivar script
                </Button>
              )}
            </Space>
          </Card>

          {/* Consejos de uso */}
          <Alert
            style={{ marginTop: 16 }}
            message="Consejos de uso"
            description={
              <List
                size="small"
                dataSource={[
                  "Lee el script de forma natural, no robotizada",
                  "Personaliza las variables con la información del cliente",
                  "Escucha activamente y adapta el flujo según las respuestas",
                  "Toma notas de las objeciones para mejorar el script",
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            }
            type="success"
            showIcon
          />
        </Col>
      </Row>
    </Show>
  );
};
