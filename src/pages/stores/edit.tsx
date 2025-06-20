import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  InputNumber,
  TimePicker,
  Space,
  Typography,
  Tag,
} from "antd";
import {
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { IStore } from "../../interfaces";

const { Text } = Typography;

export const StoreEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IStore>();
  const storeData = queryResult?.data?.data;

  const { selectProps: managerSelectProps } = useSelect({
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

  const weekDays = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información Básica" bordered={false}>
              <Form.Item
                label="Nombre de la Tienda"
                name="name"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Input prefix={<ShopOutlined />} placeholder="Studio City" />
              </Form.Item>

              <Form.Item
                label="Código de Tienda"
                name="code"
                rules={[
                  { required: true, message: "Este campo es requerido" },
                  { pattern: /^[A-Z]{2}\d{3}$/, message: "Formato: XX999" },
                ]}
              >
                <Input placeholder="SC001" maxLength={5} />
              </Form.Item>

              <Form.Item
                label="Teléfono"
                name="phone"
                rules={[
                  { required: true, message: "Este campo es requerido" },
                  {
                    pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
                    message: "Formato: (555) 123-4567",
                  },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="(555) 123-4567" />
              </Form.Item>

              <Form.Item
                label="Manager de Tienda"
                name="managerId"
                rules={[{ required: true, message: "Selecciona un manager" }]}
              >
                <Select
                  {...managerSelectProps}
                  placeholder="Seleccionar manager..."
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true, message: "Selecciona un estado" }]}
              >
                <Select>
                  <Select.Option value="active">
                    <Tag color="green">Activa</Tag>
                  </Select.Option>
                  <Select.Option value="inactive">
                    <Tag color="red">Inactiva</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Card>

            <Card
              title="Dirección"
              bordered={false}
              style={{ marginTop: 16 }}
            >
              <Form.Item
                label="Calle"
                name={["address", "street"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Input
                  prefix={<EnvironmentOutlined />}
                  placeholder="123 Main Street"
                />
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
                    <Input placeholder="CA" maxLength={2} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Código Postal"
                    name={["address", "zipCode"]}
                    rules={[
                      { required: true, message: "Requerido" },
                      { pattern: /^\d{5}$/, message: "5 dígitos" },
                    ]}
                  >
                    <Input placeholder="90001" maxLength={5} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Horario de Atención" bordered={false}>
              {weekDays.map((day) => (
                <Form.Item key={day.key} label={day.label}>
                  <Space>
                    <Form.Item
                      name={["hours", day.key, "open"]}
                      noStyle
                      getValueProps={(value) => ({
                        value: value ? dayjs(value, "HH:mm") : undefined,
                      })}
                      getValueFromEvent={(time) =>
                        time ? time.format("HH:mm") : undefined
                      }
                    >
                      <TimePicker
                        format="HH:mm"
                        placeholder="Apertura"
                        style={{ width: 120 }}
                      />
                    </Form.Item>
                    <Text>-</Text>
                    <Form.Item
                      name={["hours", day.key, "close"]}
                      noStyle
                      getValueProps={(value) => ({
                        value: value ? dayjs(value, "HH:mm") : undefined,
                      })}
                      getValueFromEvent={(time) =>
                        time ? time.format("HH:mm") : undefined
                      }
                    >
                      <TimePicker
                        format="HH:mm"
                        placeholder="Cierre"
                        style={{ width: 120 }}
                      />
                    </Form.Item>
                  </Space>
                </Form.Item>
              ))}
            </Card>

            <Card
              title="Rendimiento y Metas"
              bordered={false}
              style={{ marginTop: 16 }}
            >
              <Form.Item
                label="Meta Mensual"
                name={["performance", "monthlyTarget"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>

              <Form.Item label="Ventas Actuales">
                <InputNumber
                  value={storeData?.performance?.currentSales || 0}
                  disabled
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>

              <Form.Item label="Área de Servicio">
                <Form.Item
                  label="Radio de Servicio (millas)"
                  name={["serviceArea", "radius"]}
                  rules={[{ required: true, message: "Este campo es requerido" }]}
                >
                  <InputNumber
                    min={1}
                    max={50}
                    style={{ width: "100%" }}
                    suffix="millas"
                  />
                </Form.Item>

                <Form.Item
                  label="Códigos Postales"
                  name={["serviceArea", "zipCodes"]}
                  help="Separa múltiples códigos con comas"
                >
                  <Input.TextArea
                    placeholder="90001, 90002, 90003"
                    rows={3}
                  />
                </Form.Item>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
