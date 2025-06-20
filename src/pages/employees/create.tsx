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
  Avatar,
  Upload,
  Button,
  Radio,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CameraOutlined,
  ShopOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd/es/upload/interface";
import type { IEmployee } from "../../interfaces";

const { Text } = Typography;

export const EmployeeCreate: React.FC = () => {
  const { formProps, saveButtonProps, onFinish } = useForm<IEmployee>();

  const { selectProps: storeSelectProps } = useSelect({
    resource: "stores",
    optionLabel: "name",
    optionValue: "id",
  });

  const handleSubmit = (values: any) => {
    const employeeData = {
      ...values,
      employeeId: `EMP${String(Date.now()).slice(-6)}`, // Generate employee ID
      status: "active",
      commissions: {
        totalEvaluations: 0,
        totalCommissionEarned: 0,
        currentMonthEvaluations: 0,
        currentMonthCommission: 0,
      },
      performance: {
        callsToday: 0,
        callsTarget: 80,
        conversionsToday: 0,
        conversionRate: 0,
        averageCallDuration: 0,
      },
    };

    onFinish(employeeData);
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    listType: "picture-card",
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información Personal" bordered={false}>
              <Form.Item label="Foto de Perfil" name="avatar">
                <Upload {...uploadProps}>
                  <Space direction="vertical" align="center">
                    <Avatar size={64} icon={<UserOutlined />} />
                    <Button icon={<CameraOutlined />}>Subir Foto</Button>
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
                  {
                    pattern: /@lamattressstore\.com$/,
                    message: "Debe ser un email corporativo (@lamattressstore.com)",
                  },
                ]}
              >
                <Input
                  placeholder="nombre.apellido@lamattressstore.com"
                  prefix={<MailOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Contraseña Temporal"
                name="password"
                rules={[
                  { required: true, message: "Este campo es requerido" },
                  { min: 8, message: "Mínimo 8 caracteres" },
                ]}
                extra="El empleado deberá cambiarla en su primer inicio de sesión"
              >
                <Input.Password
                  placeholder="••••••••"
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
                initialValue="agent"
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
                  prefix={<ShopOutlined />}
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
                label="Turno"
                name="shift"
                rules={[{ required: true, message: "Selecciona un turno" }]}
                initialValue="full"
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
                rules={[{ required: true, message: "Selecciona la fecha" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccionar fecha"
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Configuración Inicial" bordered={false}>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Notificaciones"
                    name={["settings", "notifications"]}
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Radio.Group>
                      <Radio value={true}>Activadas</Radio>
                      <Radio value={false}>Desactivadas</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Auto-marcador"
                    name={["settings", "autoDialer"]}
                    valuePropName="checked"
                    initialValue={true}
                    extra="Marca automáticamente el siguiente número"
                  >
                    <Radio.Group>
                      <Radio value={true}>Activado</Radio>
                      <Radio value={false}>Desactivado</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Script Predeterminado"
                    name={["settings", "defaultScript"]}
                    initialValue="script-001"
                  >
                    <Select>
                      <Select.Option value="script-001">
                        Elite Renewal Script v1.2
                      </Select.Option>
                      <Select.Option value="script-002">
                        Winback Script v1.0
                      </Select.Option>
                      <Select.Option value="script-003">
                        Cold Call Script v2.1
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
