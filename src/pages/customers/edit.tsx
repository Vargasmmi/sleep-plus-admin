import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch, InputNumber, Row, Col, Card } from "antd";
import type { ICustomer } from "../../interfaces";

export const CustomerEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<ICustomer>();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información Personal" bordered={false}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Nombre"
                    name="firstName"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Input placeholder="Juan" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Apellido"
                    name="lastName"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Input placeholder="Pérez" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Teléfono"
                name="phone"
                rules={[
                  { required: true, message: "Este campo es requerido" },
                  { pattern: /^\(\d{3}\) \d{3}-\d{4}$/, message: "Formato: (555) 123-4567" },
                ]}
              >
                <Input placeholder="(555) 123-4567" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: "email", message: "Email inválido" },
                  { required: true, message: "Este campo es requerido" },
                ]}
              >
                <Input placeholder="cliente@email.com" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Dirección" bordered={false}>
              <Form.Item
                label="Calle"
                name={["address", "street"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Input placeholder="123 Main St" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ciudad"
                    name={["address", "city"]}
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Input placeholder="Los Angeles" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Estado"
                    name={["address", "state"]}
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Select
                      placeholder="CA"
                      options={[
                        { value: "CA", label: "CA" },
                        { value: "NY", label: "NY" },
                        { value: "TX", label: "TX" },
                        { value: "FL", label: "FL" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="ZIP"
                    name={["address", "zipCode"]}
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Input placeholder="90001" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Información de Membresía" bordered={false}>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Tier del Cliente"
                    name="tier"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Select
                      options={[
                        { value: "gold", label: "🥇 Oro" },
                        { value: "silver", label: "🥈 Plata" },
                        { value: "bronze", label: "🥉 Bronce" },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Fuente"
                    name="source"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Select
                      options={[
                        { value: "store", label: "Tienda" },
                        { value: "online", label: "En línea" },
                        { value: "phone", label: "Teléfono" },
                        { value: "referral", label: "Referido" },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Estado de Membresía"
                    name="membershipStatus"
                  >
                    <Select
                      options={[
                        { value: "active", label: "Activo" },
                        { value: "inactive", label: "Inactivo" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Miembro Elite"
                    name="isEliteMember"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="No Llamar"
                    name="doNotCall"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Crédito Actual"
                    name="currentCredit"
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

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item label="Valor de Vida" name="lifetimeValue">
                    <InputNumber
                      min={0}
                      prefix="$"
                      style={{ width: "100%" }}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Total Trades" name="totalTrades">
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Crédito Total Ganado" name="totalCreditEarned">
                    <InputNumber
                      min={0}
                      prefix="$"
                      style={{ width: "100%" }}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Notas" name="notes">
                <Input.TextArea
                  rows={3}
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
