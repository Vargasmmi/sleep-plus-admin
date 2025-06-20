import React, { useEffect } from "react";
import { useOne, useUpdate, useGetIdentity } from "@refinedev/core";
import { Form, Input, InputNumber, Switch, TimePicker, Button, Card, Row, Col, Space, Typography, Divider, notification, Spin } from "antd";
import { SaveOutlined, ClockCircleOutlined, TeamOutlined, TrophyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ISystemSettings, IEmployee } from "../../../interfaces";

const { Title, Text } = Typography;

export const SystemSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { data: user } = useGetIdentity<IEmployee>();
  
  const { data: settingsData, isLoading } = useOne<ISystemSettings>({
    resource: "systemSettings",
    id: "settings-001",
  });

  const { mutate: updateSettings, isLoading: isUpdating } = useUpdate<ISystemSettings>();

  const settings = settingsData?.data;

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        ...settings,
        workingHours: {
          start: dayjs(settings.workingHours.start, 'HH:mm'),
          end: dayjs(settings.workingHours.end, 'HH:mm'),
        },
        overdueNotificationTime: dayjs(settings.overdueNotificationTime, 'HH:mm'),
      });
    }
  }, [settings, form]);

  const handleSubmit = (values: any) => {
    const updatedSettings = {
      ...values,
      workingHours: {
        start: values.workingHours.start.format('HH:mm'),
        end: values.workingHours.end.format('HH:mm'),
      },
      overdueNotificationTime: values.overdueNotificationTime.format('HH:mm'),
      updatedAt: new Date().toISOString(),
      updatedBy: user?.id,
    };

    updateSettings(
      {
        resource: "systemSettings",
        id: "settings-001",
        values: updatedSettings,
      },
      {
        onSuccess: () => {
          notification.success({
            message: "Configuración Actualizada",
            description: "Los cambios se han guardado exitosamente.",
          });
        },
        onError: () => {
          notification.error({
            message: "Error",
            description: "No se pudieron guardar los cambios.",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Configuración del Sistema</Title>
      <Text type="secondary">
        Administra la configuración global del sistema de gestión
      </Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 24 }}
      >
        <Row gutter={[24, 24]}>
          {/* Configuración de Metas */}
          <Col xs={24} lg={12}>
            <Card title={<Space><TeamOutlined /> Configuración de Metas</Space>}>
              <Form.Item
                name="dailyCallGoal"
                label="Meta Diaria de Llamadas por Agente"
                rules={[
                  { required: true, message: "Este campo es requerido" },
                  { type: "number", min: 1, message: "Debe ser mayor a 0" },
                ]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="25"
                  addonAfter="llamadas"
                />
              </Form.Item>

              <Form.Item
                name="autoAssignCustomers"
                label="Asignación Automática de Clientes"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Activada"
                  unCheckedChildren="Desactivada"
                />
              </Form.Item>
              <Text type="secondary">
                Cuando está activada, el sistema asignará automáticamente nuevos clientes a los agentes cuando completen su meta diaria.
              </Text>
            </Card>
          </Col>

          {/* Horarios y Notificaciones */}
          <Col xs={24} lg={12}>
            <Card title={<Space><ClockCircleOutlined /> Horarios y Notificaciones</Space>}>
              <Form.Item label="Horario Laboral">
                <Space>
                  <Form.Item
                    name={['workingHours', 'start']}
                    noStyle
                    rules={[{ required: true, message: "Requerido" }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="Inicio"
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  <Text>a</Text>
                  <Form.Item
                    name={['workingHours', 'end']}
                    noStyle
                    rules={[{ required: true, message: "Requerido" }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="Fin"
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item
                name="overdueNotificationTime"
                label="Hora de Notificación de Tareas Vencidas"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: '100%' }}
                  placeholder="14:00"
                />
              </Form.Item>
              <Text type="secondary">
                Los agentes recibirán una notificación a esta hora si no han completado su meta diaria.
              </Text>
            </Card>
          </Col>

          {/* Gamificación */}
          <Col xs={24}>
            <Card title={<Space><TrophyOutlined /> Gamificación y Competencia</Space>}>
              <Form.Item
                name="competitionMode"
                label="Modo de Competencia entre Agentes"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Activado"
                  unCheckedChildren="Desactivado"
                />
              </Form.Item>
              <Text type="secondary">
                Cuando está activado, los agentes pueden ver el ranking y desempeño de sus compañeros para fomentar la competencia sana.
              </Text>

              <Divider />

              <Title level={5}>Próximamente</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary">• Sistema de puntos y badges</Text>
                <Text type="secondary">• Premios mensuales automáticos</Text>
                <Text type="secondary">• Tabla de líderes histórica</Text>
                <Text type="secondary">• Metas personalizadas por agente</Text>
              </Space>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button 
              onClick={() => form.resetFields()} 
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isUpdating}
              icon={<SaveOutlined />}
            >
              Guardar Cambios
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};
