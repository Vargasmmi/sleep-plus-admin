import React from "react";
import { Show, DateField } from "@refinedev/antd";
import { useShow, useOne, useList } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Descriptions,
  Tag,
  Space,
  Avatar,
  Progress,
  Statistic,
  Timeline,
  Table,
  Tabs,
  Button,
  Badge,
  List,
  Tooltip,
  Divider,
  Empty,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TrophyOutlined,
  DollarOutlined,
  PhoneFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  StarFilled,
  FireOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import type { IEmployee, IStore, ICall, ISale, IAchievement, ICommission } from "../../interfaces";

const { Title, Text } = Typography;

export const EmployeeShow: React.FC = () => {
  const { queryResult } = useShow<IEmployee>();
  const { data, isLoading } = queryResult;
  const employee = data?.data;

  // Fetch store data
  const { data: storeData } = useOne<IStore>({
    resource: "stores",
    id: employee?.storeId || "",
    queryOptions: {
      enabled: !!employee?.storeId,
    },
  });

  // Fetch recent calls
  const { data: callsData } = useList<ICall>({
    resource: "calls",
    filters: [{ field: "userId", operator: "eq", value: employee?.id }],
    sorters: [{ field: "startTime", order: "desc" }],
    pagination: { pageSize: 10 },
    queryOptions: { enabled: !!employee?.id },
  });

  // Fetch recent sales
  const { data: salesData } = useList<ISale>({
    resource: "sales",
    filters: [{ field: "userId", operator: "eq", value: employee?.id }],
    sorters: [{ field: "createdAt", order: "desc" }],
    pagination: { pageSize: 10 },
    queryOptions: { enabled: !!employee?.id },
  });

  // Fetch all achievements to filter manually
  const { data: achievementsData } = useList<IAchievement>({
    resource: "achievements",
    pagination: { pageSize: 100 },
    queryOptions: { enabled: !!employee?.id },
  });

  // Filter achievements unlocked by this employee
  const employeeAchievements = React.useMemo(() => {
    if (!achievementsData?.data || !employee?.id) return [];
    return achievementsData.data.filter((achievement) =>
      achievement.unlockedBy.some((unlock) => unlock.userId === employee.id)
    );
  }, [achievementsData?.data, employee?.id]);

  // Fetch commissions
  const { data: commissionsData } = useList<ICommission>({
    resource: "commissions",
    filters: [{ field: "userId", operator: "eq", value: employee?.id }],
    sorters: [{ field: "createdAt", order: "desc" }],
    pagination: { pageSize: 12 },
    queryOptions: { enabled: !!employee?.id },
  });

  const store = storeData?.data;

  const getStatusDetails = (status?: string) => {
    switch (status) {
      case "active":
        return { color: "green", icon: <CheckCircleOutlined />, text: "Activo" };
      case "break":
        return { color: "orange", icon: <ClockCircleOutlined />, text: "En descanso" };
      case "calling":
        return { color: "blue", icon: <PhoneFilled />, text: "En llamada" };
      case "inactive":
        return { color: "red", icon: <CloseCircleOutlined />, text: "Inactivo" };
      default:
        return { color: "default", icon: <UserOutlined />, text: "Desconocido" };
    }
  };

  const statusDetails = getStatusDetails(employee?.status);

  // Mock data for performance chart
  const performanceData = [
    { day: "Lun", calls: 78, conversions: 12 },
    { day: "Mar", calls: 82, conversions: 15 },
    { day: "Mié", calls: 75, conversions: 11 },
    { day: "Jue", calls: 80, conversions: 14 },
    { day: "Vie", calls: 67, conversions: 12 },
  ];

  const conversionRate = employee?.performance?.conversionRate || 0;
  const isPerformingWell = conversionRate >= 15;

  return (
    <Show isLoading={isLoading}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col>
                <Avatar size={80} src={employee?.avatar} icon={<UserOutlined />}>
                  {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                </Avatar>
              </Col>
              <Col flex="auto">
                <Space direction="vertical" size={0}>
                  <Title level={3} style={{ margin: 0 }}>
                    {employee?.firstName} {employee?.lastName}
                  </Title>
                  <Space>
                    <Tag color={employee?.role === "admin" ? "red" : employee?.role === "manager" ? "gold" : "blue"}>
                      {employee?.role === "admin" && "Administrador"}
                      {employee?.role === "manager" && "Manager"}
                      {employee?.role === "agent" && "Agente de Ventas"}
                    </Tag>
                    <Tag color={statusDetails.color} icon={statusDetails.icon}>
                      {statusDetails.text}
                    </Tag>
                    <Text type="secondary">ID: {employee?.employeeId}</Text>
                  </Space>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" align="end">
                  <Statistic
                    title="Comisión del Mes"
                    value={employee?.commissions?.currentMonthCommission || 0}
                    prefix="$"
                    valueStyle={{ color: "#3f8600" }}
                  />
                  <Text type="secondary">
                    {employee?.commissions?.currentMonthEvaluations || 0} ventas
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Información Personal" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  <Text copyable>{employee?.email}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Extensión">
                <Space>
                  <PhoneOutlined />
                  <Text>{employee?.phoneExtension || "-"}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tienda">
                <Text>{store?.name || "-"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Turno">
                <Tag>
                  {employee?.shift === "morning" && "Mañana (8:00-14:00)"}
                  {employee?.shift === "afternoon" && "Tarde (14:00-20:00)"}
                  {employee?.shift === "full" && "Completo (8:00-20:00)"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Ingreso">
                <DateField value={employee?.hiredAt} format="DD/MM/YYYY" />
              </Descriptions.Item>
              <Descriptions.Item label="Antigüedad">
                <Text>
                  {employee?.hiredAt
                    ? `${dayjs().diff(dayjs(employee.hiredAt), "years")} años, ${
                        dayjs().diff(dayjs(employee.hiredAt), "months") % 12
                      } meses`
                    : "-"}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Rendimiento del Día" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Llamadas</Text>
                <Progress
                  percent={
                    ((employee?.performance?.callsToday || 0) /
                      (employee?.performance?.callsTarget || 80)) *
                    100
                  }
                  format={() =>
                    `${employee?.performance?.callsToday || 0}/${
                      employee?.performance?.callsTarget || 80
                    }`
                  }
                />
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Conversiones"
                    value={employee?.performance?.conversionsToday || 0}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tasa de Conversión"
                    value={conversionRate}
                    suffix="%"
                    prefix={isPerformingWell ? <RiseOutlined /> : <FallOutlined />}
                    valueStyle={{
                      color: isPerformingWell ? "#3f8600" : "#cf1322",
                    }}
                  />
                </Col>
              </Row>

              <Statistic
                title="Duración Promedio de Llamada"
                value={employee?.performance?.averageCallDuration || 0}
                suffix="segundos"
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Tabs
              items={[
                {
                  key: "performance",
                  label: "Rendimiento",
                  children: (
                    <>
                      <Title level={5}>Rendimiento Semanal</Title>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line
                            type="monotone"
                            dataKey="calls"
                            stroke="#1890ff"
                            name="Llamadas"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="conversions"
                            stroke="#52c41a"
                            name="Conversiones"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>

                      <Row gutter={16} style={{ marginTop: 24 }}>
                        <Col xs={24} md={8}>
                          <Card size="small">
                            <Statistic
                              title="Total Evaluaciones"
                              value={employee?.commissions?.totalEvaluations || 0}
                              prefix={<TrophyOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small">
                            <Statistic
                              title="Comisión Total Ganada"
                              value={employee?.commissions?.totalCommissionEarned || 0}
                              prefix="$"
                              valueStyle={{ color: "#3f8600" }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small">
                            <Statistic
                              title="Promedio por Venta"
                              value={
                                employee?.commissions?.totalEvaluations
                                  ? (
                                      (employee?.commissions?.totalCommissionEarned || 0) /
                                      employee.commissions.totalEvaluations
                                    ).toFixed(2)
                                  : 0
                              }
                              prefix="$"
                            />
                          </Card>
                        </Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: "achievements",
                  label: (
                    <Badge count={employeeAchievements.length || 0}>
                      Logros
                    </Badge>
                  ),
                  children: (
                    <Row gutter={[16, 16]}>
                      {employeeAchievements.map((achievement) => {
                        const unlockedDate = achievement.unlockedBy.find(
                          (u) => u.userId === employee?.id
                        )?.unlockedAt;

                        return (
                          <Col xs={24} sm={12} md={8} key={achievement.id}>
                            <Card
                              hoverable
                              style={{ textAlign: "center" }}
                            >
                              <div style={{ margin: "0 auto 16px" }}>
                                <span style={{ fontSize: 40 }}>{achievement.icon}</span>
                              </div>
                              <Title level={5}>{achievement.name}</Title>
                              <Text type="secondary">{achievement.description}</Text>
                              <Divider />
                              <Space direction="vertical" size="small">
                                <Tag color={
                                  achievement.tier === "platinum" ? "purple" :
                                  achievement.tier === "gold" ? "gold" :
                                  achievement.tier === "silver" ? "default" : "orange"
                                }>
                                  {achievement.tier.toUpperCase()}
                                </Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Desbloqueado: {dayjs(unlockedDate).format("DD/MM/YYYY")}
                                </Text>
                              </Space>
                            </Card>
                          </Col>
                        );
                      })}
                      {employeeAchievements.length === 0 && (
                        <Col span={24}>
                          <Empty description="Sin logros desbloqueados aún" />
                        </Col>
                      )}
                    </Row>
                  ),
                },
                {
                  key: "calls",
                  label: "Llamadas Recientes",
                  children: (
                    <Table
                      dataSource={callsData?.data || []}
                      pagination={{ pageSize: 5 }}
                      columns={[
                        {
                          title: "Fecha/Hora",
                          dataIndex: "startTime",
                          render: (date) => (
                            <DateField value={date} format="DD/MM HH:mm" />
                          ),
                        },
                        {
                          title: "Tipo",
                          dataIndex: "type",
                          render: (type) => (
                            <Tag>{type === "outbound" ? "Saliente" : "Entrante"}</Tag>
                          ),
                        },
                        {
                          title: "Duración",
                          dataIndex: "duration",
                          render: (duration) => `${duration}s`,
                        },
                        {
                          title: "Resultado",
                          dataIndex: "disposition",
                          render: (disposition) => (
                            <Tag
                              color={
                                disposition === "sale"
                                  ? "green"
                                  : disposition === "interested"
                                  ? "blue"
                                  : "default"
                              }
                            >
                              {disposition}
                            </Tag>
                          ),
                        },
                        {
                          title: "Estado",
                          dataIndex: "status",
                          render: (status) => (
                            <Tag
                              color={status === "completed" ? "green" : "orange"}
                            >
                              {status}
                            </Tag>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "sales",
                  label: "Ventas Recientes",
                  children: (
                    <Table
                      dataSource={salesData?.data || []}
                      pagination={{ pageSize: 5 }}
                      columns={[
                        {
                          title: "Fecha",
                          dataIndex: "createdAt",
                          render: (date) => (
                            <DateField value={date} format="DD/MM/YYYY" />
                          ),
                        },
                        {
                          title: "Tipo",
                          dataIndex: "type",
                          render: (type) => (
                            <Tag>
                              {type === "new" && "Nueva"}
                              {type === "renewal" && "Renovación"}
                              {type === "upgrade" && "Mejora"}
                              {type === "winback" && "Recuperación"}
                            </Tag>
                          ),
                        },
                        {
                          title: "Canal",
                          dataIndex: "channel",
                          render: (channel) => (
                            <Tag>
                              {channel === "phone" && "Teléfono"}
                              {channel === "store" && "Tienda"}
                              {channel === "online" && "Online"}
                            </Tag>
                          ),
                        },
                        {
                          title: "Total",
                          dataIndex: ["amount", "total"],
                          render: (amount) => <Text strong>${amount}</Text>,
                        },
                        {
                          title: "Comisión",
                          dataIndex: ["commission", "total"],
                          render: (commission) => (
                            <Text style={{ color: "#3f8600" }}>${commission}</Text>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "commissions",
                  label: "Historial de Comisiones",
                  children: (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={commissionsData?.data?.map((commission) => ({
                          month: `${commission.period.month}/${commission.period.year}`,
                          total: commission.earnings.total,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="total" fill="#52c41a" name="Comisión Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Información Adicional">
            <Descriptions bordered>
              <Descriptions.Item label="ID del Empleado" span={3}>
                <Text copyable>{employee?.employeeId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={3}>
                <Text copyable>{employee?.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Creado" span={3}>
                <DateField
                  value={employee?.createdAt}
                  format="DD/MM/YYYY HH:mm:ss"
                />
              </Descriptions.Item>
              <Descriptions.Item label="Última Actualización" span={3}>
                <DateField
                  value={employee?.updatedAt}
                  format="DD/MM/YYYY HH:mm:ss"
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
