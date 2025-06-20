import React from "react";
import { useList } from "@refinedev/core";
import { Row, Col, Card, Statistic, Progress, Space, Typography, Tag, Table, Button } from "antd";
import {
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  TeamOutlined,
  ShopOutlined,
  GlobalOutlined,
  SettingOutlined,
  SafetyOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { Line, Column, Pie, Area, DualAxes } from "@ant-design/charts";
import dayjs from "dayjs";
import { IEmployee, IStore, ISale, ICustomer, ISystemSettings } from "../../interfaces";

const { Title, Text } = Typography;

interface AdminDashboardProps {
  user: IEmployee;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  // Fetch all stores
  const { data: storesData } = useList<IStore>({
    resource: "stores",
  });

  // Fetch all employees
  const { data: employeesData } = useList<IEmployee>({
    resource: "employees",
  });

  // Fetch system settings
  const { data: settingsData } = useList<ISystemSettings>({
    resource: "systemSettings",
  });

  // Fetch recent sales
  const { data: salesData } = useList<ISale>({
    resource: "sales",
    sorters: [{ field: "createdAt", order: "desc" }],
    pagination: { pageSize: 100 },
  });

  // Fetch customers
  const { data: customersData } = useList<ICustomer>({
    resource: "customers",
  });

  const stores = storesData?.data || [];
  const employees = employeesData?.data || [];
  const sales = salesData?.data || [];
  const customers = customersData?.data || [];
  const settings = settingsData?.data?.[0];

  // Calculate system-wide statistics
  const systemStats = {
    totalRevenue: stores.reduce((sum, store) => sum + (store.performance?.currentSales || 0), 0),
    totalTarget: stores.reduce((sum, store) => sum + (store.performance?.monthlyTarget || 0), 0),
    activeEmployees: employees.filter(emp => emp.status === 'active' || emp.status === 'calling').length,
    totalCustomers: customers.length,
    eliteMembers: customers.filter(c => c.isEliteMember).length,
    totalCalls: employees.reduce((sum, emp) => sum + (emp.performance?.callsToday || 0), 0),
  };

  // Performance by store
  const storePerformanceData = stores.map(store => ({
    name: store.name,
    sales: store.performance?.currentSales || 0,
    target: store.performance?.monthlyTarget || 0,
    percentage: ((store.performance?.currentSales || 0) / (store.performance?.monthlyTarget || 1) * 100).toFixed(1),
  }));

  // Employee distribution by role
  const employeeDistribution = [
    { type: 'Administradores', value: employees.filter(e => e.role === 'admin').length },
    { type: 'Gerentes', value: employees.filter(e => e.role === 'manager').length },
    { type: 'Agentes', value: employees.filter(e => e.role === 'agent').length },
  ];

  // Customer tier distribution
  const customerTierData = [
    { type: 'Oro', value: customers.filter(c => c.tier === 'gold').length },
    { type: 'Plata', value: customers.filter(c => c.tier === 'silver').length },
    { type: 'Bronce', value: customers.filter(c => c.tier === 'bronze').length },
  ];

  // Sales trend (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = dayjs().subtract(29 - i, 'days');
    const daySales = sales.filter(s => dayjs(s.createdAt).isSame(date, 'day'));
    return {
      date: date.format('MM/DD'),
      sales: daySales.reduce((sum, s) => sum + s.amount.total, 0),
      count: daySales.length,
    };
  });

  const salesTrendConfig = {
    data: last30Days,
    xField: 'date',
    yField: ['sales', 'count'],
    geometryOptions: [
      {
        geometry: 'column',
        color: '#5B8FF9',
      },
      {
        geometry: 'line',
        color: '#5AD8A6',
      },
    ],
  };

  const employeeDistributionConfig = {
    data: employeeDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
  };

  const storePerformanceConfig = {
    data: storePerformanceData,
    xField: 'name',
    yField: 'sales',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Dashboard Administrativo</Title>
          <Text type="secondary">Vista completa del sistema</Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<SettingOutlined />} onClick={() => window.location.href = '/admin/settings'}>
              Configuración del Sistema
            </Button>
            <Button icon={<SafetyOutlined />} onClick={() => window.location.href = '/admin/permissions'}>
              Gestionar Permisos
            </Button>
          </Space>
        </Col>
      </Row>

      {/* System-wide KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Ingresos Totales"
              value={systemStats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="USD"
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress 
              percent={(systemStats.totalRevenue / systemStats.totalTarget) * 100} 
              showInfo={false} 
              strokeColor="#52c41a" 
            />
            <Text type="secondary">
              {((systemStats.totalRevenue / systemStats.totalTarget) * 100).toFixed(0)}% del objetivo
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Tiendas"
              value={stores.length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary">
              {stores.filter(s => s.status === 'active').length} activas
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Empleados"
              value={employees.length}
              prefix={<TeamOutlined />}
            />
            <Text type="secondary">
              {systemStats.activeEmployees} en línea ahora
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Clientes"
              value={systemStats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary">
              {systemStats.eliteMembers} Elite
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Llamadas Hoy"
              value={systemStats.totalCalls}
              prefix={<PhoneOutlined />}
            />
            <Text type="secondary">
              Meta diaria: {settings?.dailyCallGoal || 25}/agente
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Tasa Conversión"
              value={15.8}
              suffix="%"
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Space>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <Text type="success">+2.3%</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Store Performance and Employee Distribution */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Rendimiento por Tienda">
            <Table
              dataSource={storePerformanceData}
              rowKey="name"
              columns={[
                {
                  title: 'Tienda',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Ventas',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (value: number) => `$${value.toLocaleString()}`,
                },
                {
                  title: 'Objetivo',
                  dataIndex: 'target',
                  key: 'target',
                  render: (value: number) => `$${value.toLocaleString()}`,
                },
                {
                  title: 'Progreso',
                  key: 'progress',
                  render: (record: any) => (
                    <div style={{ width: 170 }}>
                      <Progress 
                        percent={parseFloat(record.percentage)} 
                        size="small" 
                        status={parseFloat(record.percentage) >= 100 ? 'success' : 'active'}
                      />
                    </div>
                  ),
                },
                {
                  title: 'Estado',
                  key: 'status',
                  render: (record: any) => (
                    <Tag color={parseFloat(record.percentage) >= 100 ? 'green' : parseFloat(record.percentage) >= 80 ? 'orange' : 'red'}>
                      {parseFloat(record.percentage) >= 100 ? 'Superado' : parseFloat(record.percentage) >= 80 ? 'En camino' : 'Bajo'}
                    </Tag>
                  ),
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Distribución de Empleados">
            <Pie {...employeeDistributionConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Sales Trend and Customer Distribution */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Tendencia de Ventas (Últimos 30 días)">
            <DualAxes {...salesTrendConfig} height={300} />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Distribución de Clientes por Nivel">
            <Pie 
              data={customerTierData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: 'outer',
                content: '{name} {percentage}',
              }}
              interactions={[
                {
                  type: 'pie-legend-active',
                },
                {
                  type: 'element-active',
                },
              ]}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* System Configuration Summary */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card 
            title="Configuración del Sistema" 
            extra={<Button type="link" onClick={() => window.location.href = '/admin/settings'}>Editar</Button>}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary">Meta Diaria de Llamadas</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>{settings?.dailyCallGoal || 25} llamadas/agente</Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary">Horario Laboral</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  {settings?.workingHours?.start || '09:00'} - {settings?.workingHours?.end || '18:00'}
                </Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary">Modo Competencia</Text>
                <br />
                <Tag color={settings?.competitionMode ? 'green' : 'red'} style={{ fontSize: 16 }}>
                  {settings?.competitionMode ? 'Activado' : 'Desactivado'}
                </Tag>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary">Asignación Automática</Text>
                <br />
                <Tag color={settings?.autoAssignCustomers ? 'green' : 'red'} style={{ fontSize: 16 }}>
                  {settings?.autoAssignCustomers ? 'Activada' : 'Desactivada'}
                </Tag>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
