import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, DatePicker, Row, Col, Card } from "antd";
import type { ICall, ICustomer, IEmployee, IScript } from "../../interfaces";

export const CallCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<ICall>();

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

  const { selectProps: scriptSelectProps } = useSelect<IScript>({
    resource: "scripts",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información de la Llamada" bordered={false}>
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

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tipo"
                    name="type"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    initialValue="outbound"
                  >
                    <Select
                      options={[
                        { value: "outbound", label: "Saliente" },
                        { value: "inbound", label: "Entrante" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Estado"
                    name="status"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    initialValue="completed"
                  >
                    <Select
                      options={[
                        { value: "completed", label: "Completada" },
                        { value: "no_answer", label: "Sin respuesta" },
                        { value: "busy", label: "Ocupado" },
                        { value: "failed", label: "Fallida" },
                        { value: "voicemail", label: "Buzón de voz" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Disposición"
                name="disposition"
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue="other"
              >
                <Select
                  options={[
                    { value: "interested", label: "Interesado" },
                    { value: "not_interested", label: "No interesado" },
                    { value: "callback", label: "Volver a llamar" },
                    { value: "wrong_number", label: "Número equivocado" },
                    { value: "sale", label: "Venta" },
                    { value: "other", label: "Otro" },
                  ]}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Hora de Inicio"
                    name="startTime"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Duración (segundos)"
                    name="duration"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    initialValue={0}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="120"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Detalles del Script" bordered={false}>
              <Form.Item
                label="Script Utilizado"
                name={["script", "id"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Select
                  {...scriptSelectProps}
                  placeholder="Seleccionar script"
                />
              </Form.Item>

              <Form.Item
                label="Versión del Script"
                name={["script", "version"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue="1.0"
              >
                <Input placeholder="1.0" />
              </Form.Item>

              <Form.Item
                label="Objeciones"
                name="objections"
              >
                <Select
                  mode="tags"
                  placeholder="Agregar objeciones encontradas"
                  options={[
                    { value: "precio", label: "Precio muy alto" },
                    { value: "tiempo", label: "No tiene tiempo" },
                    { value: "interes", label: "No le interesa" },
                    { value: "competencia", label: "Ya tiene otro servicio" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Notas"
                name="notes"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Notas adicionales sobre la llamada..."
                />
              </Form.Item>
            </Card>

            <Card title="Siguiente Acción" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Tipo de Acción"
                name={["nextAction", "type"]}
                initialValue="none"
              >
                <Select
                  options={[
                    { value: "callback", label: "Volver a llamar" },
                    { value: "email", label: "Enviar email" },
                    { value: "none", label: "Ninguna" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Programado para"
                name={["nextAction", "scheduledFor"]}
                dependencies={[["nextAction", "type"]]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Notas de Seguimiento"
                name={["nextAction", "notes"]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Notas para el seguimiento..."
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
