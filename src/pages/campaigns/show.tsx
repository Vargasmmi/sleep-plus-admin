import React from "react";
import { Show } from "@refinedev/antd";
import { useShow, useMany, useOne } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Statistic,
  Progress,
  Descriptions,
  Alert,
  List,
  Timeline,
  Table,
  Button,
} from "antd";
import { Link } from "react-router-dom";
import {
  RocketOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  PercentageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ICampaign, IEmployee } from "../../interfaces";

const { Title, Text, Paragraph } = Typography;

export const CampaignShow: React.FC = () => {
  const { queryResult } = useShow<ICampaign>();
  const { data, isLoading } = queryResult;
  const campaign = data?.data;

  const { data: employeesData } = useMany<IEmployee>({
    resource: "employees",
    ids: campaign?.assignedTo || [],
    queryOptions: {
      enabled: !!campaign?.assignedTo?.length,
    },
  });

  const { data: creatorData } = useOne<IEmployee>({
    resource: "employees",
    id: campaign?.createdBy || "",
    queryOptions: {
      enabled: !!campaign?.createdBy,
    },
  });

  const employees = employeesData?.data || [];
  const creator = creatorData?.data;

  if (isLoading || !campaign) {
    return <div>Cargando...</div>;
  }

  const calculateConversionRate = () => {
    if (campaign.metrics.contacted === 0) return 0;
    return ((campaign.metrics.converted / campaign.metrics.contacted) * 100).toFixed(1);
  };

  const calculateContactRate = () => {
    if (campaign.metrics.totalCalls === 0) return 0;
    return ((campaign.metrics.contacted / campaign.metrics.totalCalls) * 100).toFixed(1);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "retention":
        return "blue";
      case "winback":
        return "purple";
      case "upgrade":
        return "gold";
      case "seasonal":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "completed":
        return "default";
      case "draft":
        return "default";
      default:
        return "default";
    }
  };

  const isExpired = dayjs(campaign.offer.validUntil).isBefore(dayjs());

  return (
    <Show>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {/* Header */}
          <Card>
            <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
              <Space align="start">
                <RocketOutlined style={{ fontSize: 24 }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {campaign.name}
                  </Title>
                  <Space style={{ marginTop: 8 }}>
                    <Tag color={getTypeColor(campaign.type)}>
                      {campaign.type === "retention"
                        ? "Retención"
                        : campaign.type === "winback"
                        ? "Recuperación"
                        : campaign.type === "upgrade"
                        ? "Mejora"
                        : "Temporal"}
                    </Tag>
                    <Tag color={getStatusColor(campaign.status)}>
                      {campaign.status === "active"
                        ? "Activa"
                        : campaign.status === "paused"
                        ? "Pausada"
                        : campaign.status === "completed"
                        ? "Completada"
                        : "Borrador"}
                    </Tag>
                  </Space>
                </div>
              </Space>
              {campaign.status !== "completed" && (
                <Link to={`/campaigns/edit/${campaign.id}`}>
                  <Button type="primary">
                    Editar Campaña
                  </Button>
                </Link>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {/* Métricas principales */}
          <Card title="Métricas de Rendimiento">
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}>
                <Statistic
                  title="Llamadas Totales"
                  value={campaign.metrics.totalCalls}
                  prefix={<PhoneOutlined />}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Contactados"
                  value={campaign.metrics.contacted}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Conversiones"
                  value={campaign.metrics.converted}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Ingresos Generados"
                  value={campaign.metrics.revenue}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text>Tasa de Contacto</Text>
                  <Progress
                    percent={Number(calculateContactRate())}
                    format={(percent) => `${percent}%`}
                  />
                </div>
                <div>
                  <Text>Tasa de Conversión</Text>
                  <Progress
                    percent={Number(calculateConversionRate())}
                    format={(percent) => `${percent}%`}
                    status={Number(calculateConversionRate()) >= 15 ? "success" : "active"}
                  />
                </div>
              </Space>
            </div>
          </Card>

          {/* Detalles de la campaña */}
          <Card title="Detalles de la Campaña" style={{ marginTop: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Período" span={2}>
                <Space>
                  <CalendarOutlined />
                  {dayjs(campaign.startDate).format("DD/MM/YYYY")} - {dayjs(campaign.endDate).format("DD/MM/YYYY")}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Segmentación" span={2}>
                <Space direction="vertical">
                  <div>
                    <Text strong>Niveles: </Text>
                    {campaign.targeting.customerTiers.map(tier => (
                      <Tag key={tier} color={tier === "gold" ? "gold" : tier === "silver" ? "silver" : "bronze"}>
                        {tier === "gold" ? "Oro" : tier === "silver" ? "Plata" : "Bronce"}
                      </Tag>
                    ))}
                  </div>
                  <div>
                    <Text strong>Última compra: </Text>
                    {campaign.targeting.lastPurchaseRange.min} - {campaign.targeting.lastPurchaseRange.max} días
                  </div>
                  {campaign.targeting.hasSubscription && (
                    <Tag color="blue">Requiere suscripción activa</Tag>
                  )}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Oferta" span={2}>
                <Alert
                  message={
                    <Space>
                      <PercentageOutlined />
                      {campaign.offer.type === "percentage"
                        ? `${campaign.offer.value}% de descuento`
                        : campaign.offer.type === "fixed"
                        ? `$${campaign.offer.value} de descuento`
                        : campaign.offer.type === "freeMonth"
                        ? "Mes gratis"
                        : "Mejora de plan"}
                    </Space>
                  }
                  description={`Válida hasta: ${dayjs(campaign.offer.validUntil).format("DD/MM/YYYY")}`}
                  type={isExpired ? "error" : "info"}
                  showIcon
                />
              </Descriptions.Item>

              <Descriptions.Item label="Creada por" span={1}>
                {creator ? `${creator.firstName} ${creator.lastName}` : campaign.createdBy}
              </Descriptions.Item>

              <Descriptions.Item label="Fecha de creación" span={1}>
                {dayjs(campaign.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Script */}
          <Card title="Script de Llamada" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Title level={5}>Apertura</Title>
                <Paragraph>{campaign.script.opening}</Paragraph>
              </div>

              <div>
                <Title level={5}>Propuestas de Valor</Title>
                <List
                  dataSource={campaign.script.valueProps}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </div>

              <div>
                <Title level={5}>Cierre</Title>
                <Paragraph>{campaign.script.closing}</Paragraph>
              </div>

              {campaign.script.objectionHandlers && (
                <div>
                  <Title level={5}>Manejo de Objeciones</Title>
                  <List
                    dataSource={Object.entries(campaign.script.objectionHandlers)}
                    renderItem={([objection, response]) => (
                      <List.Item>
                        <Space direction="vertical">
                          <Text strong>{objection}:</Text>
                          <Text>{response}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Agentes asignados */}
          <Card title="Equipo Asignado">
            <List
              dataSource={employees}
              renderItem={(employee) => (
                <List.Item>
                  <Space>
                    <UserOutlined />
                    <Link to={`/employees/show/${employee.id}`}>
                      {employee.firstName} {employee.lastName}
                    </Link>
                  </Space>
                </List.Item>
              )}
              footer={
                <Space>
                  <TeamOutlined />
                  <Text strong>{campaign.assignedTo.length} agentes asignados</Text>
                </Space>
              }
            />
          </Card>

          {/* Línea de tiempo */}
          <Card title="Línea de Tiempo" style={{ marginTop: 16 }}>
            <Timeline>
              <Timeline.Item
                dot={<CalendarOutlined style={{ fontSize: "16px" }} />}
                color="gray"
              >
                <Text type="secondary">
                  {dayjs(campaign.createdAt).format("DD/MM/YYYY")}
                </Text>
                <br />
                Campaña creada
              </Timeline.Item>

              <Timeline.Item
                dot={<RocketOutlined style={{ fontSize: "16px" }} />}
                color={dayjs(campaign.startDate).isAfter(dayjs()) ? "gray" : "blue"}
              >
                <Text type="secondary">
                  {dayjs(campaign.startDate).format("DD/MM/YYYY")}
                </Text>
                <br />
                Inicio de campaña
              </Timeline.Item>

              {campaign.status === "active" && (
                <Timeline.Item
                  dot={<ClockCircleOutlined style={{ fontSize: "16px" }} />}
                  color="green"
                >
                  <Text strong>En progreso</Text>
                  <br />
                  {calculateConversionRate()}% de conversión
                </Timeline.Item>
              )}

              <Timeline.Item
                dot={<CheckCircleOutlined style={{ fontSize: "16px" }} />}
                color={campaign.status === "completed" ? "green" : "gray"}
              >
                <Text type="secondary">
                  {dayjs(campaign.endDate).format("DD/MM/YYYY")}
                </Text>
                <br />
                {campaign.status === "completed" ? "Campaña completada" : "Fin programado"}
              </Timeline.Item>
            </Timeline>
          </Card>

          {/* Resumen de rendimiento */}
          <Card title="Resumen de Rendimiento" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Statistic
                title="ROI Estimado"
                value={campaign.metrics.revenue > 0 ? 
                  ((campaign.metrics.revenue / (campaign.metrics.totalCalls * 0.5)) * 100).toFixed(0) : 0
                }
                suffix="%"
                valueStyle={{ color: "#3f8600" }}
              />
              
              <Statistic
                title="Costo por Conversión"
                value={campaign.metrics.converted > 0 ?
                  (campaign.metrics.totalCalls * 0.5 / campaign.metrics.converted).toFixed(2) : 0
                }
                prefix="$"
              />

              <Statistic
                title="Valor Promedio de Venta"
                value={campaign.metrics.converted > 0 ?
                  (campaign.metrics.revenue / campaign.metrics.converted).toFixed(2) : 0
                }
                prefix="$"
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
