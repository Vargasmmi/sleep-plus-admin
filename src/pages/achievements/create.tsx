import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, Row, Col, Card, Switch } from "antd";
import type { IAchievement } from "../../interfaces";

export const AchievementCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<IAchievement>();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información Básica" bordered={false}>
              <Form.Item
                label="Código"
                name="code"
                rules={[
                  { required: true, message: "Este campo es requerido" },
                  { max: 20, message: "Máximo 20 caracteres" },
                ]}
              >
                <Input placeholder="FIRST_SALE" style={{ textTransform: "uppercase" }} />
              </Form.Item>

              <Form.Item
                label="Nombre"
                name="name"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Input placeholder="Primera Venta" />
              </Form.Item>

              <Form.Item
                label="Descripción"
                name="description"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Descripción del logro..."
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ícono"
                    name="icon"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    initialValue="🏆"
                  >
                    <Input placeholder="🏆" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Categoría"
                    name="category"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    initialValue="sales"
                  >
                    <Select
                      options={[
                        { value: "sales", label: "Ventas" },
                        { value: "calls", label: "Llamadas" },
                        { value: "quality", label: "Calidad" },
                        { value: "team", label: "Equipo" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Nivel"
                name="tier"
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue="bronze"
              >
                <Select
                  options={[
                    { value: "bronze", label: "🥉 Bronce" },
                    { value: "silver", label: "🥈 Plata" },
                    { value: "gold", label: "🥇 Oro" },
                    { value: "platinum", label: "💎 Platino" },
                  ]}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Criterios" bordered={false}>
              <Form.Item
                label="Tipo de Criterio"
                name={["criteria", "type"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue="count"
              >
                <Select
                  options={[
                    { value: "count", label: "Cantidad" },
                    { value: "percentage", label: "Porcentaje" },
                    { value: "streak", label: "Racha" },
                    { value: "total", label: "Total" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Métrica"
                name={["criteria", "metric"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Input placeholder="ventas realizadas" />
              </Form.Item>

              <Form.Item
                label="Objetivo"
                name={["criteria", "target"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={1}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Período de Tiempo"
                name={["criteria", "timeframe"]}
              >
                <Select
                  placeholder="Seleccionar período"
                  allowClear
                  options={[
                    { value: "day", label: "Día" },
                    { value: "week", label: "Semana" },
                    { value: "month", label: "Mes" },
                    { value: "all_time", label: "Todo el tiempo" },
                  ]}
                />
              </Form.Item>
            </Card>

            <Card title="Recompensas" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Puntos"
                name={["rewards", "points"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={100}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="100"
                />
              </Form.Item>

              <Form.Item
                label="Bono ($)"
                name={["rewards", "bonus"]}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                />
              </Form.Item>

              <Form.Item
                label="Otorgar Insignia"
                name={["rewards", "badge"]}
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
