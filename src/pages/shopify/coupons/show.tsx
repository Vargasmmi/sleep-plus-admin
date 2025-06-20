import React from "react";
import { Show, DateField } from "@refinedev/antd";
import { Card, Descriptions, Space, Tag, Typography, Progress, Badge, Divider, Statistic, Row, Col } from "antd";
import { TagOutlined, PercentageOutlined, DollarOutlined, GiftOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useShow } from "@refinedev/core";

const { Title, Text } = Typography;

export const ShopifyCouponShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const getDiscountDisplay = () => {
    if (!record) return null;
    
    switch (record.discountType) {
      case "percentage":
        return (
          <Statistic
            title="Descuento"
            value={record.value}
            suffix="%"
            prefix={<PercentageOutlined />}
          />
        );
      case "fixed_amount":
        return (
          <Statistic
            title="Descuento"
            value={record.value}
            prefix="$"
          />
        );
      case "free_shipping":
        return (
          <Statistic
            title="Descuento"
            value="Envío Gratis"
            prefix={<GiftOutlined />}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Show isLoading={isLoading} title={`Cupón: ${record?.title || ""}`}>
      {record && (
        <>
          <Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false}>
                  <Space direction="vertical" align="center" style={{ width: "100%" }}>
                    <TagOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                    <Text strong style={{ fontSize: 18 }}>{record.code}</Text>
                    <Tag color={
                      record.status === "active" ? "green" : 
                      record.status === "expired" ? "red" : "default"
                    }>
                      {record.status === "active" ? "Activo" : 
                       record.status === "expired" ? "Expirado" : "Desactivado"}
                    </Tag>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                {getDiscountDisplay()}
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Usos"
                  value={record.usageCount}
                  suffix={record.usageLimit ? `/ ${record.usageLimit}` : ""}
                />
                {record.usageLimit && (
                  <Progress 
                    percent={(record.usageCount / record.usageLimit) * 100} 
                    size="small"
                    showInfo={false}
                  />
                )}
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Tasa de Uso"
                  value={record.usageLimit ? ((record.usageCount / record.usageLimit) * 100).toFixed(1) : "∞"}
                  suffix={record.usageLimit ? "%" : ""}
                />
              </Col>
            </Row>
          </Card>

          <Card style={{ marginTop: 16 }} title="Detalles del Cupón">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID de Shopify" span={2}>
                {record.shopifyId}
              </Descriptions.Item>
              
              <Descriptions.Item label="Aplica a">
                {record.appliesTo === "all_products" ? "Todos los productos" :
                 record.appliesTo === "specific_products" ? "Productos específicos" :
                 "Colecciones específicas"}
              </Descriptions.Item>
              
              <Descriptions.Item label="Elegibilidad">
                {record.customerEligibility === "all" ? "Todos los clientes" :
                 record.customerEligibility === "specific_customers" ? "Clientes específicos" :
                 "Grupos de clientes"}
              </Descriptions.Item>
              
              <Descriptions.Item label="Requisito Mínimo">
                {record.minimumRequirement.type === "none" ? "Sin requisitos" :
                 record.minimumRequirement.type === "minimum_amount" ? `Compra mínima $${record.minimumRequirement.value}` :
                 `Mínimo ${record.minimumRequirement.value} productos`}
              </Descriptions.Item>
              
              <Descriptions.Item label="Una vez por cliente">
                {record.oncePerCustomer ? (
                  <Badge status="success" text="Sí" />
                ) : (
                  <Badge status="default" text="No" />
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Fecha de Inicio">
                <DateField value={record.startsAt} format="DD/MM/YYYY HH:mm" />
              </Descriptions.Item>
              
              <Descriptions.Item label="Fecha de Fin">
                {record.endsAt ? (
                  <DateField value={record.endsAt} format="DD/MM/YYYY HH:mm" />
                ) : (
                  <Text type="secondary">Sin fecha de fin</Text>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Creado">
                <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />
              </Descriptions.Item>
              
              <Descriptions.Item label="Actualizado">
                <DateField value={record.updatedAt} format="DD/MM/YYYY HH:mm" />
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {record.targetSelection && record.targetSelection.length > 0 && (
            <Card style={{ marginTop: 16 }} title="Aplicación Específica">
              <Space wrap>
                {record.targetSelection.map((target: string, index: number) => (
                  <Tag key={index} color="blue">{target}</Tag>
                ))}
              </Space>
            </Card>
          )}

          <Card style={{ marginTop: 16 }} title="Estadísticas de Uso">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card bordered={false} style={{ textAlign: "center" }}>
                  <Statistic
                    title="Total de Usos"
                    value={record.usageCount}
                    prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false} style={{ textAlign: "center" }}>
                  <Statistic
                    title="Usos Restantes"
                    value={record.usageLimit ? record.usageLimit - record.usageCount : "∞"}
                    prefix={record.usageLimit && record.usageLimit - record.usageCount <= 0 ? 
                      <CloseCircleOutlined style={{ color: "#f5222d" }} /> : undefined}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </Show>
  );
};
