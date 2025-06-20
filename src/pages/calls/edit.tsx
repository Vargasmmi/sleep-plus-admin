import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, DatePicker, Row, Col, Card } from "antd";
import type { ICall, ICustomer, IEmployee, IScript } from "../../interfaces";
import dayjs from "dayjs";

export const CallEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<ICall>();

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
    <Edit saveButtonProps={saveButtonProps}>
      <Form 
        {...formProps} 
        layout="vertical"
        onFinish={(values) => {
          // Convertir las fechas a string si es necesario
          const processedValues = {
            ...values,
            startTime: values.startTime?.format('YYYY-MM-DD HH:mm:ss'),
            endTime: values.endTime?.format('YYYY-MM-DD HH:mm:ss'),
            nextAction: values.nextAction ? {
              ...values.nextAction,
              scheduledFor: values.nextAction.scheduledFor?.format('YYYY-MM-DD HH:mm:ss')
            } : undefined
          };
          return formProps.onFinish?.(processedValues);
        }}
      >
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
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : undefined,
                    })}
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
                    label="Hora de Fin"
                    name="endTime"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : undefined,
                    })}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Duración (segundos)"
                name="duration"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="120"
                />
              </Form.Item>

              <Form.Item
                label="URL de Grabación"
                name="recordingUrl"
              >
                <Input placeholder="https://..." />
              </Form.Item>
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
                label="Nombre del Script"
                name={["script", "name"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Input placeholder="Script de ventas v2" />
              </Form.Item>

              <Form.Item
                label="Versión del Script"
                name={["script", "version"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
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
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : undefined,
                })}
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

            <Card title="Metadata" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Tiempo de Espera (segundos)"
                name={["metadata", "waitTime"]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Form.Item>

              <Form.Item
                label="Transferido a"
                name={["metadata", "transferredTo"]}
              >
                <Input placeholder="ID del empleado" />
              </Form.Item>

              <Form.Item
                label="ID de Campaña"
                name={["metadata", "campaignId"]}
              >
                <Input placeholder="ID de la campaña" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
