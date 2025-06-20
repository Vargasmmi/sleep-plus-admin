import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
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
  Avatar,
  Upload,
  Button,
  Radio,
  Switch,
  Divider,
  InputNumber,
  Statistic,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CameraOutlined,
  ShopOutlined,
  IdcardOutlined,
  TrophyOutlined,
  PhoneFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { UploadProps } from "antd/es/upload/interface";
import type { IEmployee } from "../../interfaces";

const { Text, Title } = Typography;

export const EmployeeEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IEmployee>();
  const employeeData = queryResult?.data?.data;

  const { selectProps: storeSelectProps } = useSelect({
    resource: "stores",
    optionLabel: "name",
    optionValue: "id",
    defaultValue: employeeData?.storeId,
  });

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    listType: "picture-card",
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información Personal" bordered={false}>
              <Form.Item label="Foto de Perfil" name="avatar">
                <Upload {...uploadProps}>
                  <Space direction="vertical" align="center">
                    <Avatar
                      size={64}
                      src={employeeData?.avatar}
                      icon={<UserOutlined />}
                    >
                      {employeeData?.firstName?.[0]}{employeeData?.lastName?.[0]}
                    </Avatar>
                    <Button icon={<CameraOutlined />}>Cambiar Foto</Button>
                  </Space>
                </Upload>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Nombre"
                    name="firstName"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Input placeholder="Juan" prefix={<UserOutlined />} />
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
                label="Email Corporativo"
                name="email"
                rules={[
                  { required: true, message: "Este campo es requerido" },
                  { type: "email", message: "Email inválido" },
                ]}
              >
                <Input
                  placeholder="nombre.apellido@lamattressstore.com"
                  prefix={<MailOutlined />}
                  disabled
                />
              </Form.Item>

              <Form.Item
                label="ID de Empleado"
                name="employeeId"
              >
                <Input
                  prefix={<IdcardOutlined />}
                  disabled
                />
              </Form.Item>

              <Form.Item
                label="Cambiar Contraseña"
                name="newPassword"
                extra="Dejar en blanco para mantener la contraseña actual"
              >
                <Input.Password
                  placeholder="Nueva contraseña"
                  prefix={<LockOutlined />}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Información Laboral" bordered={false}>
              <Form.Item
                label="Rol"
                name="role"
                rules={[{ required: true, message: "Selecciona un rol" }]}
              >
                <Select>
                  <Select.Option value="agent">
                    <Space>
                      <UserOutlined />
                      Agente de Ventas
                    </Space>
                  </Select.Option>
                  <Select.Option value="manager">
                    <Space>
                      <IdcardOutlined />
                      Manager de Tienda
                    </Space>
                  </Select.Option>
                  <Select.Option value="admin">
                    <Space>
                      <IdcardOutlined />
                      Administrador
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Tienda Asignada"
                name="storeId"
                rules={[{ required: true, message: "Selecciona una tienda" }]}
              >
                <Select
                  {...storeSelectProps}
                  placeholder="Seleccionar tienda..."
                />
              </Form.Item>

              <Form.Item
                label="Extensión Telefónica"
                name="phoneExtension"
                rules={[
                  { pattern: /^\d{3,4}$/, message: "Ingresa 3 o 4 dígitos" },
                ]}
              >
                <Input
                  placeholder="101"
                  prefix={<PhoneOutlined />}
                  maxLength={4}
                />
              </Form.Item>

              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true, message: "Selecciona un estado" }]}
              >
                <Select>
                  <Select.Option value="active">Activo</Select.Option>
                  <Select.Option value="inactive">Inactivo</Select.Option>
                  <Select.Option value="break">En descanso</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Turno"
                name="shift"
                rules={[{ required: true, message: "Selecciona un turno" }]}
              >
                <Radio.Group buttonStyle="solid" style={{ width: "100%" }}>
                  <Radio.Button value="morning" style={{ width: "33.33%" }}>
                    Mañana
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      8:00 - 14:00
                    </Text>
                  </Radio.Button>
                  <Radio.Button value="afternoon" style={{ width: "33.33%" }}>
                    Tarde
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      14:00 - 20:00
                    </Text>
                  </Radio.Button>
                  <Radio.Button value="full" style={{ width: "33.33%" }}>
                    Completo
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      8:00 - 20:00
                    </Text>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Fecha de Contratación"
                name="hiredAt"
                getValueProps={(value) => ({
                  value: value ? dayjs(value) : undefined,
                })}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabled
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Rendimiento y Comisiones" bordered={false}>
              <Title level={5}>Rendimiento del Día</Title>
              <Row gutter={16}>
                <Col xs={12} md={6}>
                  <Statistic
                    title="Llamadas Hoy"
                    value={employeeData?.performance?.callsToday || 0}
                    prefix={<PhoneFilled />}
                    suffix={`/ ${employeeData?.performance?.callsTarget || 0}`}
                  />
                  <Form.Item
                    label="Meta de Llamadas"
                    name={["performance", "callsTarget"]}
                    style={{ marginTop: 16 }}
                  >
                    <InputNumber
                      min={0}
                      max={200}
                      style={{ width: "100%" }}
                      placeholder="80"
                    />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Statistic
                    title="Conversiones Hoy"
                    value={employeeData?.performance?.conversionsToday || 0}
                    prefix={<TrophyOutlined />}
                  />
                  <Text type="secondary">
                    Tasa: {employeeData?.performance?.conversionRate || 0}%
                  </Text>
                </Col>

                <Col xs={12} md={6}>
                  <Statistic
                    title="Tiempo Promedio de Llamada"
                    value={employeeData?.performance?.averageCallDuration || 0}
                    suffix="min"
                  />
                </Col>

                <Col xs={12} md={6}>
                  <Statistic
                    title="Estado Actual"
                    value={employeeData?.status || "inactive"}
                    valueStyle={{
                      color: employeeData?.status === "active" ? "#52c41a" : 
                             employeeData?.status === "calling" ? "#1890ff" : "#d9d9d9"
                    }}
                  />
                </Col>
              </Row>

              <Divider />

              <Title level={5}>Comisiones</Title>
              <Row gutter={16}>
                <Col xs={12} md={6}>
                  <Statistic
                    title="Evaluaciones Totales"
                    value={employeeData?.commissions?.totalEvaluations || 0}
                  />
                </Col>

                <Col xs={12} md={6}>
                  <Statistic
                    title="Comisión Total"
                    value={employeeData?.commissions?.totalCommissionEarned || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>

                <Col xs={12} md={6}>
                  <Statistic
                    title="Evaluaciones Este Mes"
                    value={employeeData?.commissions?.currentMonthEvaluations || 0}
                  />
                </Col>

                <Col xs={12} md={6}>
                  <Statistic
                    title="Comisión Este Mes"
                    value={employeeData?.commissions?.currentMonthCommission || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
