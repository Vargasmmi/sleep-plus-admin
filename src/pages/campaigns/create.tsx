import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Space,
  Typography,
  InputNumber,
  Checkbox,
  Button,
  Alert,
  Tag,
} from "antd";
import {
  RocketOutlined,
  UserOutlined,
  PercentageOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  TagOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ICampaign } from "../../interfaces";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const CampaignCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<ICampaign>();

  const { selectProps: employeeSelectProps } = useSelect({
    resource: "employees",
    optionLabel: (item) => `${item.firstName} ${item.lastName}`,
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
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Información Básica" bordered={false}>
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="Nombre de la Campaña"
                    name="name"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Input
                      prefix={<RocketOutlined />}
                      placeholder="Ej: Renovación Elite Q2 2024"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item
                    label="Tipo de Campaña"
                    name="type"
                    rules={[{ required: true, message: "Selecciona un tipo" }]}
                  >
                    <Select placeholder="Seleccionar tipo">
                      <Select.Option value="retention">
                        <Tag color="blue">Retención</Tag>
                      </Select.Option>
                      <Select.Option value="winback">
                        <Tag color="purple">Recuperación</Tag>
                      </Select.Option>
                      <Select.Option value="upgrade">
                        <Tag color="gold">Mejora</Tag>
                      </Select.Option>
                      <Select.Option value="seasonal">
                        <Tag color="green">Temporal</Tag>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item
                    label="Estado Inicial"
                    name="status"
                    initialValue="draft"
                  >
                    <Select>
                      <Select.Option value="draft">Borrador</Select.Option>
                      <Select.Option value="active">Activa</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Período de Campaña"
                required
              >
                <Form.Item
                  name={["dates"]}
                  rules={[{ required: true, message: "Selecciona las fechas" }]}
                  getValueProps={(value) => ({
                    value: value ? [dayjs(value[0]), dayjs(value[1])] : undefined,
                  })}
                  getValueFromEvent={(dates) => 
                    dates ? [dates[0].toISOString(), dates[1].toISOString()] : undefined
                  }
                >
                  <RangePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={["Fecha inicio", "Fecha fin"]}
                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                  />
                </Form.Item>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Segmentación de Clientes" bordered={false}>
              <Form.Item
                label="Niveles de Cliente"
                name={["targeting", "customerTiers"]}
                rules={[{ required: true, message: "Selecciona al menos un nivel" }]}
              >
                <Checkbox.Group>
                  <Space direction="vertical">
                    <Checkbox value="gold">
                      <Tag color="gold">Oro</Tag> - Clientes VIP
                    </Checkbox>
                    <Checkbox value="silver">
                      <Tag color="silver">Plata</Tag> - Clientes regulares
                    </Checkbox>
                    <Checkbox value="bronze">
                      <Tag color="bronze">Bronce</Tag> - Clientes nuevos
                    </Checkbox>
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item label="Rango de Última Compra (días)">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={["targeting", "lastPurchaseRange", "min"]}
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Mínimo"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["targeting", "lastPurchaseRange", "max"]}
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Máximo"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item
                label="¿Requiere suscripción activa?"
                name={["targeting", "hasSubscription"]}
                valuePropName="checked"
              >
                <Checkbox>Sí, solo clientes con suscripción</Checkbox>
              </Form.Item>

              <Form.Item
                label="Tipos de Producto (opcional)"
                name={["targeting", "productTypes"]}
              >
                <Select mode="multiple" placeholder="Todos los productos">
                  <Select.Option value="mattress">Colchones</Select.Option>
                  <Select.Option value="pillow">Almohadas</Select.Option>
                  <Select.Option value="protector">Protectores</Select.Option>
                  <Select.Option value="frame">Bases</Select.Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Oferta" bordered={false}>
              <Form.Item
                label="Tipo de Oferta"
                name={["offer", "type"]}
                rules={[{ required: true, message: "Selecciona un tipo de oferta" }]}
              >
                <Select placeholder="Seleccionar tipo">
                  <Select.Option value="percentage">
                    <PercentageOutlined /> Porcentaje de descuento
                  </Select.Option>
                  <Select.Option value="fixed">
                    <DollarOutlined /> Monto fijo
                  </Select.Option>
                  <Select.Option value="freeMonth">
                    <CalendarOutlined /> Mes gratis
                  </Select.Option>
                  <Select.Option value="upgrade">
                    <RocketOutlined /> Mejora de plan
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues?.offer?.type !== currentValues?.offer?.type
                }
              >
                {({ getFieldValue }) => {
                  const offerType = getFieldValue(["offer", "type"]);
                  if (offerType === "percentage" || offerType === "fixed") {
                    return (
                      <Form.Item
                        label={offerType === "percentage" ? "Porcentaje" : "Monto"}
                        name={["offer", "value"]}
                        rules={[{ required: true, message: "Este campo es requerido" }]}
                      >
                        <InputNumber
                          min={0}
                          max={offerType === "percentage" ? 100 : undefined}
                          style={{ width: "100%" }}
                          prefix={offerType === "percentage" ? "" : "$"}
                          suffix={offerType === "percentage" ? "%" : ""}
                        />
                      </Form.Item>
                    );
                  }
                  return null;
                }}
              </Form.Item>

              <Form.Item
                label="Válida hasta"
                name={["offer", "validUntil"]}
                rules={[{ required: true, message: "Selecciona fecha de expiración" }]}
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : undefined,
                })}
                getValueFromEvent={(date) => date?.toISOString()}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Script de Llamada" bordered={false}>
              <Form.Item
                label="Apertura"
                name={["script", "opening"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Ej: Hola [CUSTOMER_NAME], soy [AGENT_NAME] de LA Mattress Store..."
                />
              </Form.Item>

              <Form.Item
                label="Propuestas de Valor"
                name={["script", "valueProps"]}
                rules={[{ required: true, message: "Agrega al menos una propuesta" }]}
              >
                <Select
                  mode="tags"
                  style={{ width: "100%" }}
                  placeholder="Escribe y presiona Enter para agregar"
                  tokenSeparators={[","]}
                />
              </Form.Item>

              <Form.Item
                label="Cierre"
                name={["script", "closing"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <TextArea
                  rows={2}
                  placeholder="Ej: ¿Le gustaría asegurar estos beneficios por otro año?"
                />
              </Form.Item>

              <Alert
                message="Variables disponibles"
                description="Puedes usar: [CUSTOMER_NAME], [AGENT_NAME], [LAST_PRODUCT], [TIME_AGO]"
                type="info"
                showIcon
                icon={<FileTextOutlined />}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Asignación" bordered={false}>
              <Form.Item
                label="Agentes Asignados"
                name="assignedTo"
                rules={[{ required: true, message: "Selecciona al menos un agente" }]}
              >
                <Select
                  {...employeeSelectProps}
                  mode="multiple"
                  placeholder="Seleccionar agentes..."
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
