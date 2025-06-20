import React from "react";
import { useList } from "@refinedev/core";
import { Row, Col, Card, Statistic, Progress, Space, Typography, Tag, Table, List, Badge, Avatar, Button } from "antd";
import {
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { Line, Column, Pie, Area } from "@ant-design/charts";
import dayjs from "dayjs";
import { IEmployee, IDailyGoal, ISale, IStore } from "../../interfaces";

const { Title, Text } = Typography;

interface ManagerDashboardProps {
  user: IEmployee;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user }) => {
  // Fetch store data
  const { data: storeData } = useList<IStore>({
    resource: "stores",
    filters: [{ field: "id", operator: "eq", value: user.storeId }],
  });

  // Fetch team members
  const { data: employeesData } = useList<IEmployee>({
    resource: "employees",
    filters: [
      { field: "storeId", operator: "eq", value: user.storeId },
      { field: "role", operator: "eq", value: "agent" }
    ],
  });

  // Fetch today's goals for the team
  const { data: goalsData } = useList<IDailyGoal>({
    resource: "dailyGoals",
    filters: [
      { field: "date", operator: "eq", value: dayjs().format("YYYY-MM-DD") }
    ],
  });

  // Fetch recent sales
  const { data: salesData } = useList<ISale>({
    resource: "sales",
    filters: [
      { field: "storeId", operator: "eq", value: user.storeId }
    ],
    sorters: [{ field: "createdAt", order: "desc" }],
    pagination: { pageSize: 10 },
  });

  const store = storeData?.data?.[0];
  const teamMembers = employeesData?.data || [];
  const todayGoals = goalsData?.data || [];

  // Calculate team statistics
  const teamStats = {
    totalCalls: teamMembers.reduce((sum, emp) => sum + (emp.performance?.callsToday || 0), 0),
    totalConversions: teamMembers.reduce((sum, emp) => sum + (emp.performance?.conversionsToday || 0), 0),
    averageConversionRate: teamMembers.length > 0 
      ? teamMembers.reduce((sum, emp) => sum + (emp.performance?.conversionRate || 0), 0) / teamMembers.length 
      : 0,
    activeAgents: teamMembers.filter(emp => emp.status === 'active' || emp.status === 'calling').length,
  };

  // Mock data for charts
  const salesTrendData = [
    { date: '2024-06-01', sales: 45000 },
    { date: '2024-06-05', sales: 52000 },
    { date: '2024-06-10', sales: 48000 },
    { date: '2024-06-15', sales: 61000 },
    { date: '2024-06-20', sales: 58000 },
    { date: '2024-06-25', sales: 67000 },
    { date: '2024-06-30', sales: store?.performance.currentSales || 42350 },
  ];

  const teamPerformanceData = teamMembers.map(emp => ({
    name: `${emp.firstName} ${emp.lastName}`,
    calls: emp.performance?.callsToday || 0,
    conversions: emp.performance?.conversionsToday || 0,
    conversionRate: emp.performance?.conversionRate || 0,
  }));

  const salesTrendConfig = {
    data: salesTrendData,
    xField: 'date',
    yField: 'sales',
    smooth: true,
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
      },
    },
  };

  const teamPerformanceConfig = {
    data: teamPerformanceData,
    xField: 'name',
    yField: 'calls',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
  };

  // Identify employees with overdue tasks
  const employeesWithOverdue = todayGoals.filter(goal => goal.status === 'overdue');

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Dashboard de Gerente - {store?.name}</Title>
          <Text type="secondary">Gestión y supervisión del equipo</Text>
        </Col>
        <Col>
          <Space>
            <Badge status="processing" text={`${teamStats.activeAgents} agentes activos`} />
          </Space>
        </Col>
      </Row>

      {/* Alerts for overdue tasks */}
      {employeesWithOverdue.length > 0 && (
        <Card style={{ marginBottom: 16, borderColor: '#ff4d4f' }}>
          <Space>
            <AlertOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
            <Text strong>
              {employeesWithOverdue.length} empleados con tareas pendientes del día anterior
            </Text>
          </Space>
        </Card>
      )}

      {/* Main KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ventas del Mes"
              value={store?.performance.currentSales || 0}
              prefix={<DollarOutlined />}
              suffix="USD"
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress 
              percent={(store?.performance.currentSales || 0) / (store?.performance.monthlyTarget || 1) * 100} 
              showInfo={false} 
              strokeColor="#52c41a" 
            />
            <Text type="secondary">
              {((store?.performance.currentSales || 0) / (store?.performance.monthlyTarget || 1) * 100).toFixed(0)}% de ${store?.performance.monthlyTarget || 0}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Llamadas del Equipo Hoy"
              value={teamStats.totalCalls}
              prefix={<PhoneOutlined />}
            />
            <Space>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <Text type="success">Meta grupal: {teamMembers.length * 25}</Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Conversiones Hoy"
              value={teamStats.totalConversions}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text>Tasa promedio: {teamStats.averageConversionRate.toFixed(1)}%</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Agentes Activos"
              value={teamStats.activeAgents}
              suffix={`/ ${teamMembers.length}`}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary">En línea ahora</Text>
          </Card>
        </Col>
      </Row>

      {/* Team Performance Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Rendimiento del Equipo" 
            extra={
              <Space>
                <Tag color="green">En tiempo real</Tag>
              </Space>
            }
          >
            <Table
              dataSource={teamMembers}
              columns={[
                {
                  title: 'Agente',
                  key: 'agent',
                  render: (record: IEmployee) => (
                    <Space>
                      <Avatar src={record.avatar} icon={<UserOutlined />} />
                      <div>
                        <Text strong>{record.firstName} {record.lastName}</Text>
                        <br />
                        <Badge 
                          status={record.status === 'active' ? 'success' : record.status === 'calling' ? 'processing' : 'default'} 
                          text={record.status} 
                        />
                      </div>
                    </Space>
                  ),
                },
                {
                  title: 'Llamadas',
                  key: 'calls',
                  render: (record: IEmployee) => {
                    const goal = todayGoals.find(g => g.employeeId === record.id);
                    const progress = goal ? (goal.completedCalls / goal.targetCalls) * 100 : 0;
                    return (
                      <div>
                        <Text>{goal?.completedCalls || 0} / {goal?.targetCalls || 25}</Text>
                        <Progress percent={progress} size="small" showInfo={false} />
                      </div>
                    );
                  },
                },
                {
                  title: 'Conversiones',
                  dataIndex: ['performance', 'conversionsToday'],
                  key: 'conversions',
                  render: (value: number) => <Tag color="green">{value || 0}</Tag>,
                },
                {
                  title: 'Tasa Conv.',
                  dataIndex: ['performance', 'conversionRate'],
                  key: 'conversionRate',
                  render: (value: number) => (
                    <Text type={value > 15 ? 'success' : value > 10 ? 'warning' : 'danger'}>
                      {value || 0}%
                    </Text>
                  ),
                },
                {
                  title: 'Estado',
                  key: 'status',
                  render: (record: IEmployee) => {
                    const goal = todayGoals.find(g => g.employeeId === record.id);
                    if (goal?.status === 'overdue') {
                      return <Tag color="red">Tareas pendientes</Tag>;
                    } else if (goal?.status === 'completed') {
                      return <Tag color="green">Meta completada</Tag>;
                    } else {
                      return <Tag color="blue">En progreso</Tag>;
                    }
                  },
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Top Vendedores del Mes">
            <List
              dataSource={teamMembers.sort((a, b) => 
                (b.commissions?.currentMonthCommission || 0) - (a.commissions?.currentMonthCommission || 0)
              ).slice(0, 5)}
              renderItem={(employee, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#f0f0f0' 
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    }
                    title={`${employee.firstName} ${employee.lastName}`}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>${employee.commissions?.currentMonthCommission || 0} en comisiones</Text>
                        <Text type="secondary">{employee.commissions?.currentMonthEvaluations || 0} ventas</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Sales Trend */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Tendencia de Ventas del Mes">
            <Area {...salesTrendConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Actividad Reciente" extra={<Button type="link">Ver todo</Button>}>
            <List
              dataSource={salesData?.data?.slice(0, 5) || []}
              renderItem={(sale: ISale) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ShoppingCartOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                    title={
                      <Space>
                        <Text>Nueva venta: ${sale.amount.total}</Text>
                        <Tag color={sale.type === 'new' ? 'green' : sale.type === 'renewal' ? 'blue' : 'orange'}>
                          {sale.type}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary">
                          Por {teamMembers.find(e => e.id === sale.userId)?.firstName || 'Agente'}
                        </Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">{dayjs(sale.createdAt).fromNow()}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
