import React, { useState } from "react";
import { useGetIdentity, useUpdate, useOne } from "@refinedev/core";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Typography,
  Tabs,
  Space,
  Divider,
  Switch,
  Select,
  notification,
  Statistic,
  Progress,
  Tag,
  Alert,
  TimePicker,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CameraOutlined,
  SaveOutlined,
  TrophyOutlined,
  PhoneFilled,
  DollarOutlined,
  ClockCircleOutlined,
  BellOutlined,
  SafetyOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { IEmployee } from "../../interfaces";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { data: identity } = useGetIdentity<any>();
  const [passwordForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Get employee data
  const { data: employeeData, isLoading } = useOne<IEmployee>({
    resource: "employees",
    id: identity?.id || "",
    queryOptions: {
      enabled: !!identity?.id,
    },
  });

  const employee = employeeData?.data;
  const { mutate: updateEmployee } = useUpdate();

  const handleProfileUpdate = (values: any) => {
    setLoading(true);
    updateEmployee(
      {
        resource: "employees",
        id: employee?.id || "",
        values: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneExtension: values.phoneExtension,
        },
      },
      {
        onSuccess: () => {
          notification.success({
            message: "Perfil Actualizado",
            description: "Tu información ha sido actualizada correctamente.",
          });
          setLoading(false);
        },
        onError: () => {
          notification.error({
            message: "Error",
            description: "No se pudo actualizar tu perfil.",
          });
          setLoading(false);
        },
      }
    );
  };

  const handlePasswordChange = (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: "Error",
        description: "Las contraseñas no coinciden.",
      });
      return;
    }

    // Aquí normalmente harías una llamada API para cambiar la contraseña
    notification.success({
      message: "Contraseña Actualizada",
      description: "Tu contraseña ha sido cambiada exitosamente.",
    });
    passwordForm.resetFields();
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === "done") {
      notification.success({
        message: "Avatar Actualizado",
        description: "Tu foto de perfil ha sido actualizada.",
      });
    }
  };

  if (isLoading || !employee) {
    return <Card loading={true} />;
  }

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <UserOutlined />
          Información Personal
        </span>
      ),
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={{
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phoneExtension: employee.phoneExtension,
            storeId: employee.storeId,
            shift: employee.shift,
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nombre"
                name="firstName"
                rules={[{ required: true, message: "Ingresa tu nombre" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Apellido"
                name="lastName"
                rules={[{ required: true, message: "Ingresa tu apellido" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Ingresa tu email" },
                  { type: "email", message: "Email inválido" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Extensión Telefónica"
                name="phoneExtension"
              >
                <Input prefix={<PhoneOutlined />} placeholder="101" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tienda" name="storeId">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Turno" name="shift">
                <Select disabled>
                  <Select.Option value="morning">Mañana</Select.Option>
                  <Select.Option value="afternoon">Tarde</Select.Option>
                  <Select.Option value="full">Completo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <LockOutlined />
          Seguridad
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card title="Cambiar Contraseña" type="inner">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Form.Item
                  label="Contraseña Actual"
                  name="currentPassword"
                  rules={[{ required: true, message: "Ingresa tu contraseña actual" }]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                  label="Nueva Contraseña"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Ingresa la nueva contraseña" },
                    { min: 6, message: "Mínimo 6 caracteres" },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  rules={[
                    { required: true, message: "Confirma tu contraseña" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Las contraseñas no coinciden"));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    Cambiar Contraseña
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Configuración de Seguridad" type="inner">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Alert
                  message="Autenticación de Dos Factores"
                  description="Añade una capa extra de seguridad a tu cuenta"
                  type="info"
                  showIcon
                />
                <Space>
                  <Switch />
                  <Text>Habilitar 2FA</Text>
                </Space>
                <Divider />
                <Title level={5}>Sesiones Activas</Title>
                <Text type="secondary">
                  Última actividad: {dayjs().format("DD/MM/YYYY HH:mm")}
                </Text>
                <Button danger>Cerrar Todas las Sesiones</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    ...(employee.role === "agent" ? [{
      key: "3",
      label: (
        <span>
          <TrophyOutlined />
          Mi Rendimiento
        </span>
      ),
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Llamadas Hoy"
                  value={employee.performance?.callsToday || 0}
                  suffix={`/ ${employee.performance?.callsTarget || 0}`}
                  prefix={<PhoneFilled />}
                />
                <Progress
                  percent={
                    ((employee.performance?.callsToday || 0) /
                      (employee.performance?.callsTarget || 1)) *
                    100
                  }
                  showInfo={false}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Conversiones Hoy"
                  value={employee.performance?.conversionsToday || 0}
                  valueStyle={{ color: "#3f8600" }}
                />
                <Text type="secondary">
                  Tasa: {employee.performance?.conversionRate || 0}%
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Comisión del Mes"
                  value={employee.commissions?.currentMonthCommission || 0}
                  prefix="$"
                  valueStyle={{ color: "#cf1322" }}
                />
                <Text type="secondary">
                  {employee.commissions?.currentMonthEvaluations || 0} evaluaciones
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tiempo Promedio"
                  value={employee.performance?.averageCallDuration || 0}
                  suffix="seg"
                  prefix={<ClockCircleOutlined />}
                />
                <Text type="secondary">por llamada</Text>
              </Card>
            </Col>
          </Row>

          <Card title="Estadísticas Totales" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Total de Evaluaciones"
                  value={employee.commissions?.totalEvaluations || 0}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Comisión Total Ganada"
                  value={employee.commissions?.totalCommissionEarned || 0}
                  prefix="$"
                />
              </Col>
            </Row>
          </Card>
        </>
      ),
    }] : []),
    {
      key: "4",
      label: (
        <span>
          <BellOutlined />
          Notificaciones
        </span>
      ),
      children: (
        <Form
          form={notificationForm}
          layout="vertical"
          initialValues={{
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
          }}
        >
          <Card title="Preferencias de Notificación" type="inner">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Form.Item name="emailNotifications" valuePropName="checked">
                <Space>
                  <Switch />
                  <Text>Notificaciones por Email</Text>
                </Space>
              </Form.Item>
              <Form.Item name="smsNotifications" valuePropName="checked">
                <Space>
                  <Switch />
                  <Text>Notificaciones por SMS</Text>
                </Space>
              </Form.Item>
              <Form.Item name="pushNotifications" valuePropName="checked">
                <Space>
                  <Switch />
                  <Text>Notificaciones Push</Text>
                </Space>
              </Form.Item>
            </Space>
          </Card>

          <Card title="Tipos de Notificaciones" type="inner" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Form.Item name="newSaleNotification" valuePropName="checked" initialValue={true}>
                <Space>
                  <Switch />
                  <Text>Nueva Venta Realizada</Text>
                </Space>
              </Form.Item>
              <Form.Item name="commissionNotification" valuePropName="checked" initialValue={true}>
                <Space>
                  <Switch />
                  <Text>Actualización de Comisiones</Text>
                </Space>
              </Form.Item>
              <Form.Item name="achievementNotification" valuePropName="checked" initialValue={true}>
                <Space>
                  <Switch />
                  <Text>Logros Desbloqueados</Text>
                </Space>
              </Form.Item>
              <Form.Item name="campaignNotification" valuePropName="checked" initialValue={false}>
                <Space>
                  <Switch />
                  <Text>Nuevas Campañas</Text>
                </Space>
              </Form.Item>
            </Space>
          </Card>

          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Guardar Preferencias
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Row gutter={24} align="middle">
              <Col>
                <Upload
                  name="avatar"
                  showUploadList={false}
                  action="/api/upload"
                  onChange={handleAvatarChange}
                >
                  <Avatar
                    size={100}
                    src={employee.avatar}
                    icon={<UserOutlined />}
                    style={{ cursor: "pointer" }}
                  />
                  <Button
                    icon={<CameraOutlined />}
                    shape="circle"
                    size="small"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                    }}
                  />
                </Upload>
              </Col>
              <Col flex="auto">
                <Space direction="vertical" size={0}>
                  <Title level={2} style={{ margin: 0 }}>
                    {employee.firstName} {employee.lastName}
                  </Title>
                  <Text type="secondary">{employee.email}</Text>
                  <Space style={{ marginTop: 8 }}>
                    <Tag color={employee.role === "admin" ? "red" : employee.role === "manager" ? "blue" : "green"}>
                      {employee.role === "admin" ? "Administrador" : employee.role === "manager" ? "Gerente" : "Agente"}
                    </Tag>
                    <Tag color={employee.status === "active" ? "green" : "default"}>
                      {employee.status === "active" ? "Activo" : "Inactivo"}
                    </Tag>
                    <Tag>ID: {employee.employeeId}</Tag>
                  </Space>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" align="center">
                  <Text type="secondary">Miembro desde</Text>
                  <Text strong>{dayjs(employee.hiredAt).format("DD/MM/YYYY")}</Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card>
            <Tabs items={tabItems} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
