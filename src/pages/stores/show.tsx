import React from "react";
import { Show } from "@refinedev/antd";
import { useShow, useOne } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Statistic,
  Progress,
  List,
  Timeline,
} from "antd";
import {
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { IStore, IEmployee } from "../../interfaces";

const { Title, Text } = Typography;

export const StoreShow: React.FC = () => {
  const { queryResult } = useShow<IStore>();
  const { data, isLoading } = queryResult;
  const store = data?.data;

  const { data: managerData } = useOne<IEmployee>({
    resource: "employees",
    id: store?.managerId || "",
    queryOptions: {
      enabled: !!store?.managerId,
    },
  });

  const manager = managerData?.data;

  const weekDays = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  if (isLoading || !store) {
    return <div>Cargando...</div>;
  }

  const performancePercentage = (
    (store.performance.currentSales / store.performance.monthlyTarget) * 100
  ).toFixed(1);

  return (
    <Show>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Space>
                  <ShopOutlined style={{ fontSize: 24 }} />
                  <div>
                    <Title level={3} style={{ margin: 0 }}>
                      {store.name}
                    </Title>
                    <Text type="secondary">Código: {store.code}</Text>
                  </div>
                </Space>
                <Tag
                  color={store.status === "active" ? "green" : "red"}
                  style={{ marginLeft: 16 }}
                >
                  {store.status === "active" ? "Activa" : "Inactiva"}
                </Tag>
              </div>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Space>
                    <EnvironmentOutlined />
                    <div>
                      <Text strong>Dirección</Text>
                      <br />
                      <Text>{store.address.street}</Text>
                      <br />
                      <Text>
                        {store.address.city}, {store.address.state}{" "}
                        {store.address.zipCode}
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space>
                    <PhoneOutlined />
                    <div>
                      <Text strong>Teléfono</Text>
                      <br />
                      <Text>{store.phone}</Text>
                    </div>
                  </Space>
                </Col>
              </Row>

              <div>
                <Space>
                  <UserOutlined />
                  <div>
                    <Text strong>Manager</Text>
                    <br />
                    {manager ? (
                      <Text>
                        {manager.firstName} {manager.lastName}
                      </Text>
                    ) : (
                      <Text type="secondary">No asignado</Text>
                    )}
                  </div>
                </Space>
              </div>
            </Space>
          </Card>

          <Card title="Horario de Atención" style={{ marginTop: 16 }}>
            <List
              dataSource={weekDays}
              renderItem={(day) => {
                const hours = store.hours[day.key];
                return (
                  <List.Item>
                    <Text strong style={{ width: 100 }}>
                      {day.label}:
                    </Text>
                    {hours ? (
                      <Space>
                        <ClockCircleOutlined />
                        <Text>
                          {hours.open} - {hours.close}
                        </Text>
                      </Space>
                    ) : (
                      <Text type="secondary">Cerrado</Text>
                    )}
                  </List.Item>
                );
              }}
            />
          </Card>

          <Card title="Área de Servicio" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Radio de Servicio:</Text> {store.serviceArea.radius}{" "}
                millas
              </div>
              <div>
                <Text strong>Códigos Postales:</Text>
                <br />
                <Space wrap>
                  {store.serviceArea.zipCodes.map((zip) => (
                    <Tag key={zip}>{zip}</Tag>
                  ))}
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Rendimiento del Mes">
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <div style={{ textAlign: "center" }}>
                <Progress
                  type="dashboard"
                  percent={Number(performancePercentage)}
                  format={(percent) => `${percent}%`}
                  status={
                    Number(performancePercentage) >= 100
                      ? "success"
                      : Number(performancePercentage) >= 80
                      ? "active"
                      : "exception"
                  }
                />
              </div>

              <Statistic
                title="Ventas Actuales"
                value={store.performance.currentSales}
                prefix="$"
                precision={2}
                valueStyle={{ color: "#3f8600" }}
              />

              <Statistic
                title="Meta Mensual"
                value={store.performance.monthlyTarget}
                prefix="$"
                precision={2}
              />

              <Statistic
                title="Diferencia"
                value={
                  store.performance.monthlyTarget -
                  store.performance.currentSales
                }
                prefix="$"
                precision={2}
                valueStyle={{
                  color:
                    store.performance.currentSales >=
                    store.performance.monthlyTarget
                      ? "#3f8600"
                      : "#cf1322",
                }}
              />
            </Space>
          </Card>

          <Card title="Actividad Reciente" style={{ marginTop: 16 }}>
            <Timeline>
              <Timeline.Item
                dot={<CheckCircleOutlined style={{ fontSize: "16px" }} />}
                color="green"
              >
                <Text type="secondary">Hace 2 horas</Text>
                <br />
                Nueva venta registrada
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Text type="secondary">Hoy 10:00 AM</Text>
                <br />
                Apertura de tienda
              </Timeline.Item>
              <Timeline.Item>
                <Text type="secondary">Ayer</Text>
                <br />
                Meta diaria alcanzada
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
