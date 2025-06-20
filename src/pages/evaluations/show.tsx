import React, { useState } from "react";
import { Show, DateField } from "@refinedev/antd";
import { useShow, useOne, useUpdate } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Descriptions,
  Tag,
  Space,
  Image,
  Progress,
  Button,
  Statistic,
  Alert,
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  notification,
  Divider,
  Timeline,
  Empty,
} from "antd";
import {
  ScanOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileImageOutlined,
  PrinterOutlined,
  CreditCardOutlined,
  CarOutlined,
  HomeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { IEvaluation, ICustomer } from "../../interfaces";

const { Title, Text, Paragraph } = Typography;

export const EvaluationShow: React.FC = () => {
  const { queryResult } = useShow<IEvaluation>();
  const { data, isLoading } = queryResult;
  const evaluation = data?.data;

  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { mutate: updateEvaluation } = useUpdate();

  // Fetch customer data
  const { data: customerData } = useOne<ICustomer>({
    resource: "customers",
    id: evaluation?.customerId || "",
    queryOptions: {
      enabled: !!evaluation?.customerId,
    },
  });

  const customer = customerData?.data;

  const getStatusDetails = (status?: string) => {
    switch (status) {
      case "approved":
        return {
          color: "blue",
          icon: <CheckCircleOutlined />,
          text: "APROBADO",
        };
      case "redeemed":
        return {
          color: "green",
          icon: <DollarOutlined />,
          text: "REDIMIDO",
        };
      case "expired":
        return {
          color: "red",
          icon: <ClockCircleOutlined />,
          text: "EXPIRADO",
        };
      default:
        return {
          color: "default",
          icon: <ScanOutlined />,
          text: "PENDIENTE",
        };
    }
  };

  const statusDetails = getStatusDetails(evaluation?.status);

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case "excellent":
        return "#52c41a";
      case "good":
        return "#1890ff";
      case "fair":
        return "#faad14";
      case "poor":
        return "#f5222d";
      default:
        return "#d9d9d9";
    }
  };

  const handleRedeem = (values: any) => {
    if (values.amountUsed > (evaluation?.creditApproved || 0)) {
      notification.error({
        message: "Error",
        description: "El monto no puede exceder el crédito disponible",
      });
      return;
    }

    updateEvaluation(
      {
        resource: "evaluations",
        id: evaluation?.id || "",
        values: {
          status: "redeemed",
          redeemedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          notification.success({
            message: "Éxito",
            description: "Crédito redimido correctamente",
          });
          setRedeemModalVisible(false);
          form.resetFields();
        },
      }
    );
  };

  const daysUntilExpiry = evaluation?.expiresAt
    ? dayjs(evaluation.expiresAt).diff(dayjs(), "days")
    : 0;

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Space align="center">
                  <ScanOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                  <Space direction="vertical" size={0}>
                    <Title level={3} style={{ margin: 0 }}>
                      Evaluación Trade & Sleep
                    </Title>
                    <Text code copyable style={{ fontSize: 16 }}>
                      {evaluation?.id}
                    </Text>
                  </Space>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" align="center">
                  <Tag
                    color={statusDetails.color}
                    icon={statusDetails.icon}
                    style={{ fontSize: 16, padding: "8px 16px" }}
                  >
                    {statusDetails.text}
                  </Tag>
                  {evaluation?.status === "approved" && daysUntilExpiry > 0 && (
                    <Text type="secondary">{daysUntilExpiry} días para expirar</Text>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Información del Cliente" size="small">
            {customer && (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Nombre">
                  <Space>
                    <UserOutlined />
                    <Text strong>
                      {customer.firstName} {customer.lastName}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  <Text copyable>{customer.phone}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text copyable>{customer.email}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Dirección">
                  <Space direction="vertical" size={0}>
                    <Text>{customer.address?.street}</Text>
                    <Text>
                      {customer.address?.city}, {customer.address?.state} {customer.address?.zipCode}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Tier">
                  <Tag
                    color={
                      customer.tier === "gold"
                        ? "gold"
                        : customer.tier === "silver"
                        ? "default"
                        : "orange"
                    }
                  >
                    {customer.tier?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>

          <Card title="Información del Colchón" size="small" style={{ marginTop: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Marca">
                <Text strong>{evaluation?.mattress.brand?.toUpperCase()}</Text>
              </Descriptions.Item>
              {evaluation?.mattress.model && (
                <Descriptions.Item label="Modelo">
                  {evaluation.mattress.model}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tamaño">
                <Tag>{evaluation?.mattress.size?.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Edad">
                <Text>{evaluation?.mattress.age} años</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Condición">
                <Tag color={getConditionColor(evaluation?.mattress.condition)}>
                  {evaluation?.mattress.condition?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Resultado de la Evaluación">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card type="inner" title="Score Final">
                  <Statistic
                    value={evaluation?.aiEvaluation.finalScore || 0}
                    suffix="/ 100"
                    valueStyle={{ fontSize: 48, color: "#1890ff" }}
                  />
                  <Progress
                    percent={evaluation?.aiEvaluation.finalScore || 0}
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                    showInfo={false}
                  />
                  <Text type="secondary">
                    Confianza: {evaluation?.aiEvaluation.confidence}%
                  </Text>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card type="inner" title="Crédito Aprobado">
                  <Statistic
                    value={evaluation?.creditApproved || 0}
                    prefix="$"
                    valueStyle={{ fontSize: 48, color: "#3f8600" }}
                  />
                  {evaluation?.status === "approved" && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<DollarOutlined />}
                      onClick={() => setRedeemModalVisible(true)}
                      block
                      style={{ marginTop: 16 }}
                    >
                      Redimir Crédito
                    </Button>
                  )}
                  {evaluation?.status === "redeemed" && (
                    <Alert
                      message="Crédito Redimido"
                      description={`Redimido el ${dayjs(evaluation.redeemedAt).format(
                        "DD/MM/YYYY HH:mm"
                      )}`}
                      type="success"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Card size="small" type="inner">
                  <Statistic
                    title="Condición"
                    value={evaluation?.aiEvaluation.conditionScore || 0}
                    suffix="/ 100"
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card size="small" type="inner">
                  <Statistic
                    title="Marca"
                    value={evaluation?.aiEvaluation.brandScore || 0}
                    suffix="/ 100"
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card size="small" type="inner">
                  <Statistic
                    title="Edad"
                    value={evaluation?.aiEvaluation.ageScore || 0}
                    suffix="/ 100"
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card size="small" type="inner">
                  <Statistic
                    title="Tamaño"
                    value={evaluation?.aiEvaluation.sizeScore || 0}
                    suffix="/ 100"
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          <Card title="Fotos del Colchón" style={{ marginTop: 16 }}>
            {evaluation?.photos && evaluation.photos.length > 0 ? (
              <Row gutter={[16, 16]}>
                {evaluation.photos.map((photo, index) => (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <Card
                      hoverable
                      cover={
                        <Image
                          src={photo.url}
                          alt={`Foto ${index + 1}`}
                          style={{ height: 200, objectFit: "cover" }}
                        />
                      }
                    >
                      <Card.Meta
                        title={photo.filename}
                        description={dayjs(photo.uploadDate).format("DD/MM/YYYY HH:mm")}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Sin fotos" />
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Información Adicional">
            <Descriptions>
              <Descriptions.Item label="Creado Por">
                {evaluation?.employeeId || "Sistema"}
              </Descriptions.Item>
              <Descriptions.Item label="Tienda">
                {evaluation?.storeId || "Online"}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Creación">
                <DateField value={evaluation?.createdAt} format="DD/MM/YYYY HH:mm:ss" />
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Expiración">
                <DateField value={evaluation?.expiresAt} format="DD/MM/YYYY HH:mm:ss" />
              </Descriptions.Item>
              {evaluation?.redeemedAt && (
                <Descriptions.Item label="Fecha de Redención">
                  <DateField value={evaluation.redeemedAt} format="DD/MM/YYYY HH:mm:ss" />
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Última Actualización">
                <DateField value={evaluation?.updatedAt} format="DD/MM/YYYY HH:mm:ss" />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Redeem Modal */}
      <Modal
        title="Redimir Crédito Trade & Sleep"
        open={redeemModalVisible}
        onOk={form.submit}
        onCancel={() => setRedeemModalVisible(false)}
        width={600}
      >
        <Alert
          message={`Crédito Disponible: $${evaluation?.creditApproved || 0}`}
          description="Ingresa los detalles de la redención"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={form} layout="vertical" onFinish={handleRedeem}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Monto a Usar"
                name="amountUsed"
                rules={[
                  { required: true, message: "Ingresa el monto" },
                  {
                    max: evaluation?.creditApproved || 0,
                    type: "number",
                    message: "No puede exceder el crédito disponible",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={evaluation?.creditApproved || 0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Total de la Venta"
                name="saleTotal"
                rules={[{ required: true, message: "Ingresa el total" }]}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Tipo de Producto"
            name="productType"
            rules={[{ required: true, message: "Selecciona el tipo de producto" }]}
          >
            <Select placeholder="Seleccionar...">
              <Select.Option value="mattress">Colchón Nuevo</Select.Option>
              <Select.Option value="base">Base Ajustable</Select.Option>
              <Select.Option value="accessories">Accesorios</Select.Option>
              <Select.Option value="protection">Plan de Protección</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Método de Pago Adicional"
            name="paymentMethod"
            rules={[{ required: true, message: "Selecciona el método de pago" }]}
          >
            <Select placeholder="Seleccionar...">
              <Select.Option value="card">Tarjeta de Crédito/Débito</Select.Option>
              <Select.Option value="cash">Efectivo</Select.Option>
              <Select.Option value="finance">Financiamiento</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Notas" name="notes">
            <Input.TextArea rows={3} placeholder="Notas adicionales..." />
          </Form.Item>
        </Form>
      </Modal>
    </Show>
  );
};
