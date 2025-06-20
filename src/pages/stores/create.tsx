import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, Row, Col, Card, TimePicker, Switch } from "antd";
import type { IStore, IEmployee } from "../../interfaces";
import dayjs from "dayjs";

export const StoreCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<IStore>();

  const { selectProps: managerSelectProps } = useSelect<IEmployee>({
    resource: "employees",
    optionLabel: (item) => `${item.firstName} ${item.lastName}`,
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "manager",
      },
    ],
  });

  const daysOfWeek = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form 
        {...formProps} 
        layout="vertical"
        onFinish={(values) => {
          // Procesar los horarios
          const hours: any = {};
          daysOfWeek.forEach(day => {
            if (values.hours?.[day.key]) {
              hours[day.key] = {
                open: values.hours[day.key].open?.format('HH:mm') || '',
                close: values.hours[day.key].close?.format('HH:mm') || ''
              };
            }
          });

          const processedValues = {
            ...values,
            hours
          };
          return formProps.onFinish?.(processedValues);
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información General" bordered={false}>
              <Form.Item
                label="Nombre de la Tienda"
                name="name"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Input placeholder="Sleep Plus - Los Angeles Downtown" />
              </Form.Item>

              <Form.Item
                label="Código de Tienda"
                name="code"
                rules={[
                  { required: true, message: "Este campo es requerido" },
                  { max: 10, message: "Máximo 10 caracteres" },
                ]}
              >
                <Input placeholder="LA-DT-001" style={{ textTransform: "uppercase" }} />
              </Form.Item>

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
                label="Gerente"
                name="managerId"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Select
                  {...managerSelectProps}
                  placeholder="Seleccionar gerente"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue="active"
              >
                <Select
                  options={[
                    { value: "active", label: "Activa" },
                    { value: "inactive", label: "Inactiva" },
                  ]}
                />
              </Form.Item>
            </Card>

            <Card title="Dirección" bordered={false} style={{ marginTop: 16 }}>
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
                        { value: "IL", label: "IL" },
                        { value: "WA", label: "WA" },
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

            <Card title="Métricas de Desempeño" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Objetivo Mensual"
                name={["performance", "monthlyTarget"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={50000}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="50000"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                />
              </Form.Item>

              <Form.Item
                label="Ventas Actuales"
                name={["performance", "currentSales"]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Horario de Atención" bordered={false}>
              {daysOfWeek.map(day => (
                <Card 
                  key={day.key} 
                  size="small" 
                  title={day.label} 
                  bordered={false}
                  style={{ marginBottom: 8 }}
                >
                  <Row gutter={16} align="middle">
                    <Col span={11}>
                      <Form.Item
                        name={["hours", day.key, "open"]}
                        noStyle
                      >
                        <TimePicker
                          format="HH:mm"
                          placeholder="Apertura"
                          style={{ width: "100%" }}
                          defaultValue={dayjs('09:00', 'HH:mm')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: 'center' }}>
                      <span>-</span>
                    </Col>
                    <Col span={11}>
                      <Form.Item
                        name={["hours", day.key, "close"]}
                        noStyle
                      >
                        <TimePicker
                          format="HH:mm"
                          placeholder="Cierre"
                          style={{ width: "100%" }}
                          defaultValue={dayjs('18:00', 'HH:mm')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Card>

            <Card title="Área de Servicio" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Radio de Servicio (millas)"
                name={["serviceArea", "radius"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
                initialValue={25}
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="25"
                  addonAfter="millas"
                />
              </Form.Item>

              <Form.Item
                label="Códigos Postales"
                name={["serviceArea", "zipCodes"]}
                rules={[{ required: true, message: "Agregue al menos un código postal" }]}
              >
                <Select
                  mode="tags"
                  placeholder="Agregar códigos postales"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
