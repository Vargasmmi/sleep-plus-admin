import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, DatePicker, Row, Col, Card, Switch } from "antd";
import type { ISale, ICustomer, IEmployee, IStore, ISubscription, ICall } from "../../interfaces";

export const SaleCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<ISale>();

  const { selectProps: customerSelectProps } = useSelect<ICustomer>({
    resource: "customers",
    optionLabel: (item) => `${item.firstName} ${item.lastName} - ${item.phone}`,
    optionValue: "id",
  });

  const { selectProps: employeeSelectProps } = useSelect<IEmployee>({
    resource: "employees",
    optionLabel: (item) => `${item.firstName} ${item.lastName}`,
    optionValue: "id",
  });

  const { selectProps: storeSelectProps } = useSelect<IStore>({
    resource: "stores",
    optionLabel: "name",
    optionValue: "id",
  });

  const { selectProps: subscriptionSelectProps } = useSelect<ISubscription>({
    resource: "subscriptions",
    optionLabel: (item) => `Plan ${item.plan} - ${item.status}`,
    optionValue: "id",
  });

  const { selectProps: callSelectProps } = useSelect<ICall>({
    resource: "calls",
    optionLabel: (item) => `Llamada ${item.type} - ${item.disposition}`,
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información de la Venta" bordered={false}>
              <Form.Item
                label="Cliente"
                name="customerId"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Select
                  {...customerSelectProps}
                  showSearch
                  placeholder="Buscar cliente..."
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Empleado"
                    name="userId"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Select
                      {...employeeSelectProps}
                      placeholder="Seleccionar empleado"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tienda"
                    name="storeId"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Select
                      {...storeSelectProps}
                      placeholder="Seleccionar tienda"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tipo de Venta"
                    name="type"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    initialValue="new"
                  >
                    <Select
                      options={[
                        { value: "new", label: "Nueva" },
                        { value: "renewal", label: "Renovación" },
                        { value: "upgrade", label: "Actualización" },
                        { value: "winback", label: "Recuperación" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Canal"
                    name="channel"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    initialValue="phone"
                  >
                    <Select
                      options={[
                        { value: "phone", label: "Teléfono" },
                        { value: "store", label: "Tienda" },
                        { value: "online", label: "En línea" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Suscripción"
                name="subscriptionId"
              >
                <Select
                  {...subscriptionSelectProps}
                  placeholder="Seleccionar suscripción (opcional)"
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label="Llamada Relacionada"
                name="callId"
              >
                <Select
                  {...callSelectProps}
                  placeholder="Seleccionar llamada (opcional)"
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label="Estado de Pago"
                name="paymentStatus"
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue="pending"
              >
                <Select
                  options={[
                    { value: "pending", label: "Pendiente" },
                    { value: "completed", label: "Completado" },
                    { value: "failed", label: "Fallido" },
                    { value: "refunded", label: "Reembolsado" },
                  ]}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Montos" bordered={false}>
              <Form.Item
                label="Monto Bruto"
                name={["amount", "gross"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Descuento"
                name={["amount", "discount"]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Monto Neto"
                name={["amount", "net"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Impuesto"
                name={["amount", "tax"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Total"
                name={["amount", "total"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>
            </Card>

            <Card title="Comisión" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Comisión Base"
                name={["commission", "base"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Bono"
                name={["commission", "bonus"]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Total de Comisión"
                name={["commission", "total"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Estado de Comisión"
                name={["commission", "status"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue="pending"
              >
                <Select
                  options={[
                    { value: "pending", label: "Pendiente" },
                    { value: "approved", label: "Aprobado" },
                    { value: "paid", label: "Pagado" },
                  ]}
                />
              </Form.Item>
            </Card>

            <Card title="Contrato" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Contrato Firmado"
                name={["contract", "signed"]}
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="URL del Documento"
                name={["contract", "documentUrl"]}
              >
                <Input placeholder="https://..." />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
