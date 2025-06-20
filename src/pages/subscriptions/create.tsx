import React, { useState } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
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

export const SubscriptionCreate: React.FC = () => {
  const { formProps, saveButtonProps, onFinish } = useForm<ISubscription>();
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "elite">("basic");
  const [billingFrequency, setBillingFrequency] = useState<"monthly" | "annual">("monthly");

  const { selectProps: customerSelectProps } = useSelect({
    resource: "customers",
    optionLabel: (customer) => `${customer.firstName} ${customer.lastName} - ${customer.phone}`,
    optionValue: "id",
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

  const handleSubmit = (values: any) => {
    const pricing = PLAN_PRICING[selectedPlan];
    const services = PLAN_SERVICES[selectedPlan];

    const subscriptionData = {
      ...values,
      plan: selectedPlan,
      status: "active",
      pricing: {
        monthly: pricing.monthly,
        annual: pricing.annual,
        currency: "USD",
      },
      billing: {
        ...values.billing,
        frequency: billingFrequency,
        nextBillingDate: values.billing.nextBillingDate || dayjs().add(1, "month").toISOString(),
      },
      services,
      credits: {
        accumulated: 0,
        used: 0,
      },
      startDate: dayjs().toISOString(),
    };

    onFinish(subscriptionData);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
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
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Plan de Suscripción" bordered={false}>
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
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Información de Facturación" bordered={false}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Frecuencia de Pago">
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

                  {billingFrequency === "annual" && (
                    <Alert
                      message={`Precio anual: $${PLAN_PRICING[selectedPlan].annual}`}
                      description="Ahorra 2 meses con el pago anual"
                      type="success"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Método de Pago"
                    name={["billing", "paymentMethod"]}
                    rules={[{ required: true, message: "Selecciona un método de pago" }]}
                    initialValue="card"
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
                    label="Fecha del Primer Cobro"
                    name={["billing", "nextBillingDate"]}
                    initialValue={dayjs().add(1, "month")}
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
            <Card title="Información Adicional" bordered={false}>
              <Form.Item
                label="Vendido Por"
                name="soldBy"
                rules={[{ required: true, message: "Selecciona el vendedor" }]}
              >
                <Select
                  {...employeeSelectProps}
                  placeholder="Seleccionar empleado..."
                  showSearch
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
