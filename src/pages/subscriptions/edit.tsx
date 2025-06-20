import React, { useState, useEffect } from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Card,
  Space,
  Typography,
  Divider,
  Alert,
  Radio,
  Switch,
} from "antd";
import { CreditCardOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { ISubscription } from "../../interfaces";

const { Text } = Typography;

const PLAN_PRICING = {
  basic: { monthly: 4.99, annual: 49.99 },
  premium: { monthly: 7.99, annual: 79.99 },
  elite: { monthly: 9.99, annual: 99.99 },
};

const PLAN_SERVICES = {
  basic: {
    cleaningsTotal: 4,
    inspectionsTotal: 1,
    protectionActive: false,
  },
  premium: {
    cleaningsTotal: 8,
    inspectionsTotal: 2,
    protectionActive: true,
  },
  elite: {
    cleaningsTotal: 12,
    inspectionsTotal: 4,
    protectionActive: true,
  },
};

export const SubscriptionEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<ISubscription>();
  const subscriptionData = queryResult?.data?.data;
  
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "elite">(
    subscriptionData?.plan || "basic"
  );
  const [billingFrequency, setBillingFrequency] = useState<"monthly" | "annual">(
    subscriptionData?.billing?.frequency || "monthly"
  );

  useEffect(() => {
    if (subscriptionData) {
      setSelectedPlan(subscriptionData.plan);
      setBillingFrequency(subscriptionData.billing.frequency);
    }
  }, [subscriptionData]);

  const { selectProps: customerSelectProps } = useSelect({
    resource: "customers",
    optionLabel: (customer) => `${customer.firstName} ${customer.lastName} - ${customer.phone}`,
    optionValue: "id",
    defaultValue: subscriptionData?.customerId,
  });

  const { selectProps: employeeSelectProps } = useSelect({
    resource: "employees",
    optionLabel: (employee) => `${employee.firstName} ${employee.lastName}`,
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "in",
        value: ["agent", "manager"],
      },
    ],
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Información del Cliente" bordered={false}>
              <Form.Item
                label="Cliente"
                name="customerId"
                rules={[{ required: true, message: "Selecciona un cliente" }]}
              >
                <Select
                  {...customerSelectProps}
                  placeholder="Buscar cliente por nombre o teléfono..."
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  disabled
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Plan de Suscripción" bordered={false}>
              <Form.Item name="plan" initialValue={selectedPlan}>
                <Radio.Group
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Card
                        hoverable
                        className={selectedPlan === "basic" ? "ant-card-active" : ""}
                        onClick={() => setSelectedPlan("basic")}
                      >
                        <Radio value="basic">
                          <Space direction="vertical" size="small">
                            <Text strong style={{ fontSize: 18 }}>
                              BASIC
                            </Text>
                            <Text type="secondary">Protección esencial</Text>
                            <Divider style={{ margin: "8px 0" }} />
                            <Text>✓ 4 limpiezas al año</Text>
                            <Text>✓ 1 inspección anual</Text>
                            <Text type="secondary">✗ Sin protección contra daños</Text>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space>
                              <Text strong style={{ fontSize: 20 }}>
                                ${PLAN_PRICING.basic.monthly}
                              </Text>
                              <Text type="secondary">/mes</Text>
                            </Space>
                          </Space>
                        </Radio>
                      </Card>
                    </Col>

                    <Col xs={24} md={8}>
                      <Card
                        hoverable
                        className={selectedPlan === "premium" ? "ant-card-active" : ""}
                        onClick={() => setSelectedPlan("premium")}
                      >
                        <Radio value="premium">
                          <Space direction="vertical" size="small">
                            <Text strong style={{ fontSize: 18 }}>
                              PREMIUM
                            </Text>
                            <Text type="secondary">Más popular</Text>
                            <Divider style={{ margin: "8px 0" }} />
                            <Text>✓ 8 limpiezas al año</Text>
                            <Text>✓ 2 inspecciones anuales</Text>
                            <Text>✓ Protección contra daños</Text>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space>
                              <Text strong style={{ fontSize: 20 }}>
                                ${PLAN_PRICING.premium.monthly}
                              </Text>
                              <Text type="secondary">/mes</Text>
                            </Space>
                          </Space>
                        </Radio>
                      </Card>
                    </Col>

                    <Col xs={24} md={8}>
                      <Card
                        hoverable
                        style={{
                          borderColor: selectedPlan === "elite" ? "#722ed1" : undefined,
                        }}
                        onClick={() => setSelectedPlan("elite")}
                      >
                        <Radio value="elite">
                          <Space direction="vertical" size="small">
                            <Text strong style={{ fontSize: 18, color: "#722ed1" }}>
                              ELITE
                            </Text>
                            <Text type="secondary">Máxima protección</Text>
                            <Divider style={{ margin: "8px 0" }} />
                            <Text>✓ 12 limpiezas al año</Text>
                            <Text>✓ 4 inspecciones anuales</Text>
                            <Text>✓ Protección total</Text>
                            <Text>✓ Trade & Sleep incluido</Text>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space>
                              <Text strong style={{ fontSize: 20 }}>
                                ${PLAN_PRICING.elite.monthly}
                              </Text>
                              <Text type="secondary">/mes</Text>
                            </Space>
                          </Space>
                        </Radio>
                      </Card>
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>

              {selectedPlan !== subscriptionData?.plan && (
                <Alert
                  message="Cambio de Plan Detectado"
                  description="Los servicios se ajustarán automáticamente al nuevo plan seleccionado."
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Estado de la Suscripción" bordered={false}>
              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true, message: "Selecciona un estado" }]}
              >
                <Select>
                  <Select.Option value="active">Activa</Select.Option>
                  <Select.Option value="paused">Pausada</Select.Option>
                  <Select.Option value="cancelled">Cancelada</Select.Option>
                  <Select.Option value="pending">Pendiente</Select.Option>
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Fecha de Pausa"
                    name="pausedAt"
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : undefined,
                    })}
                  >
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Fecha de Cancelación"
                    name="cancelledAt"
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : undefined,
                    })}
                  >
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Razón de Cancelación" name="cancelReason">
                <Input.TextArea rows={2} placeholder="Si aplica..." />
              </Form.Item>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Información de Facturación" bordered={false}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Frecuencia de Pago"
                    name={["billing", "frequency"]}
                  >
                    <Radio.Group
                      value={billingFrequency}
                      onChange={(e) => setBillingFrequency(e.target.value)}
                      buttonStyle="solid"
                      style={{ width: "100%" }}
                    >
                      <Radio.Button value="monthly" style={{ width: "50%" }}>
                        Mensual
                      </Radio.Button>
                      <Radio.Button value="annual" style={{ width: "50%" }}>
                        Anual (Ahorra 20%)
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Método de Pago"
                    name={["billing", "paymentMethod"]}
                    rules={[{ required: true, message: "Selecciona un método de pago" }]}
                  >
                    <Select>
                      <Select.Option value="card">
                        <Space>
                          <CreditCardOutlined />
                          Tarjeta de Crédito/Débito
                        </Space>
                      </Select.Option>
                      <Select.Option value="ach">
                        <Space>
                          <CreditCardOutlined />
                          Transferencia Bancaria (ACH)
                        </Space>
                      </Select.Option>
                      <Select.Option value="cash">
                        <Space>
                          <CreditCardOutlined />
                          Efectivo en Tienda
                        </Space>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Últimos 4 Dígitos"
                    name={["billing", "lastFour"]}
                    rules={[
                      { pattern: /^\d{4}$/, message: "Ingresa 4 dígitos" },
                    ]}
                  >
                    <Input placeholder="1234" maxLength={4} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Próximo Cobro"
                    name={["billing", "nextBillingDate"]}
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : undefined,
                    })}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      disabledDate={(current) => current && current < dayjs().startOf("day")}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Servicios y Créditos" bordered={false}>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Limpiezas Usadas"
                    name={["services", "cleaningsUsed"]}
                  >
                    <InputNumber
                      min={0}
                      max={PLAN_SERVICES[selectedPlan].cleaningsTotal}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Inspecciones Usadas"
                    name={["services", "inspectionsUsed"]}
                  >
                    <InputNumber
                      min={0}
                      max={PLAN_SERVICES[selectedPlan].inspectionsTotal}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Protección Activa"
                    name={["services", "protectionActive"]}
                    valuePropName="checked"
                  >
                    <Switch disabled={!PLAN_SERVICES[selectedPlan].protectionActive} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Créditos Acumulados"
                    name={["credits", "accumulated"]}
                  >
                    <InputNumber
                      min={0}
                      prefix="$"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Créditos Usados"
                    name={["credits", "used"]}
                  >
                    <InputNumber
                      min={0}
                      prefix="$"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Expiración de Créditos"
                    name={["credits", "expiration"]}
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : undefined,
                    })}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
