import React, { useState, useEffect } from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import { 
  Card, 
  Table, 
  Space, 
  Typography, 
  Tag, 
  Avatar,
  Row,
  Col,
  Statistic,
  Progress,
  Tabs,
  Select,
  Badge,
} from "antd";
import {
  TrophyOutlined,
  CrownOutlined,
  FireOutlined,
  RiseOutlined,
  TeamOutlined,
  DollarOutlined,
  PhoneOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { IEmployee, ISale, ICall, IDailyGoal } from "../../interfaces";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export const LeaderboardPage: React.FC = () => {
  const { data: identity } = useGetIdentity<IEmployee>();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedStore, setSelectedStore] = useState<string>('all');

  // Fetch employees
  const { data: employeesData } = useList<IEmployee>({
    resource: "employees",
    filters: [{ field: "role", operator: "eq", value: "agent" }],
  });

  // Fetch sales
  const { data: salesData } = useList<ISale>({
    resource: "sales",
    pagination: { pageSize: 1000 },
  });

  // Fetch calls
  const { data: callsData } = useList<ICall>({
    resource: "calls",
    pagination: { pageSize: 1000 },
  });

  // Fetch daily goals
  const { data: goalsData } = useList<IDailyGoal>({
    resource: "dailyGoals",
    filters: [
      { field: "date", operator: "eq", value: dayjs().format("YYYY-MM-DD") }
    ],
  });

  const employees = employeesData?.data || [];
  const sales = salesData?.data || [];
  const calls = callsData?.data || [];
  const goals = goalsData?.data || [];

  // Calculate rankings based on period
  const calculateRankings = () => {
    const now = dayjs();
    let startDate: dayjs.Dayjs;

    switch (selectedPeriod) {
      case 'daily':
        startDate = now.startOf('day');
        break;
      case 'weekly':
        startDate = now.startOf('week');
        break;
      case 'monthly':
        startDate = now.startOf('month');
        break;
    }

    return employees.map(employee => {
      // Filter data by period
      const periodSales = sales.filter(s => 
        s.userId === employee.id && 
        dayjs(s.createdAt).isAfter(startDate)
      );

      const periodCalls = calls.filter(c => 
        c.userId === employee.id && 
        dayjs(c.createdAt).isAfter(startDate)
      );

      const completedCalls = periodCalls.filter(c => c.status === 'completed').length;
      const conversions = periodSales.length;
      const conversionRate = completedCalls > 0 ? (conversions / completedCalls) * 100 : 0;
      const totalRevenue = periodSales.reduce((sum, sale) => sum + sale.amount.total, 0);
      const totalCommission = periodSales.reduce((sum, sale) => sum + sale.commission.total, 0);

      // Get today's goal progress
      const todayGoal = goals.find(g => g.employeeId === employee.id);
      const goalProgress = todayGoal ? (todayGoal.completedCalls / todayGoal.targetCalls) * 100 : 0;

      return {
        ...employee,
        completedCalls,
        conversions,
        conversionRate,
        totalRevenue,
        totalCommission,
        goalProgress,
        score: conversions * 100 + completedCalls * 10 + conversionRate * 5, // Scoring algorithm
      };
    }).sort((a, b) => b.score - a.score);
  };

  const rankings = calculateRankings();

  // Get podium (top 3)
  const podium = rankings.slice(0, 3);

  // Get my rank
  const myRank = rankings.findIndex(r => r.id === identity?.id) + 1;
  const myStats = rankings.find(r => r.id === identity?.id);

  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 80,
      render: (_: any, __: any, index: number) => {
        const rank = index + 1;
        if (rank === 1) return <Text style={{ fontSize: 24 }}>🥇</Text>;
        if (rank === 2) return <Text style={{ fontSize: 24 }}>🥈</Text>;
        if (rank === 3) return <Text style={{ fontSize: 24 }}>🥉</Text>;
        return <Text strong style={{ fontSize: 18 }}>{rank}</Text>;
      },
    },
    {
      title: 'Agente',
      key: 'agent',
      render: (record: any) => (
        <Space>
          <Avatar src={record.avatar} icon={<TeamOutlined />} />
          <div>
            <Text strong={record.id === identity?.id}>
              {record.firstName} {record.lastName}
            </Text>
            {record.id === identity?.id && <Tag color="blue" style={{ marginLeft: 8 }}>Tú</Tag>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Llamadas',
      dataIndex: 'completedCalls',
      key: 'calls',
      sorter: (a: any, b: any) => a.completedCalls - b.completedCalls,
      render: (value: number) => (
        <Space>
          <PhoneOutlined />
          <Text>{value}</Text>
        </Space>
      ),
    },
    {
      title: 'Ventas',
      dataIndex: 'conversions',
      key: 'conversions',
      sorter: (a: any, b: any) => a.conversions - b.conversions,
      render: (value: number) => (
        <Tag color="green">
          <TrophyOutlined /> {value}
        </Tag>
      ),
    },
    {
      title: 'Tasa Conv.',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      sorter: (a: any, b: any) => a.conversionRate - b.conversionRate,
      render: (value: number) => (
        <Space>
          <PercentageOutlined />
          <Text type={value > 20 ? 'success' : value > 15 ? 'warning' : 'danger'}>
            {value.toFixed(1)}%
          </Text>
        </Space>
      ),
    },
    {
      title: 'Ingresos',
      dataIndex: 'totalRevenue',
      key: 'revenue',
      sorter: (a: any, b: any) => a.totalRevenue - b.totalRevenue,
      render: (value: number) => (
        <Space>
          <DollarOutlined />
          <Text>${value.toFixed(2)}</Text>
        </Space>
      ),
    },
    {
      title: 'Meta Diaria',
      key: 'dailyGoal',
      render: (record: any) => {
        if (selectedPeriod !== 'daily') return '-';
        return (
          <Progress
            percent={record.goalProgress}
            size="small"
            status={record.goalProgress >= 100 ? 'success' : 'active'}
            format={(percent) => `${percent?.toFixed(0)}%`}
          />
        );
      },
    },
    {
      title: 'Puntos',
      dataIndex: 'score',
      key: 'score',
      sorter: (a: any, b: any) => a.score - b.score,
      render: (value: number) => (
        <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
          {value.toFixed(0)}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <TrophyOutlined /> Tabla de Líderes
          </Title>
          <Text type="secondary">Competencia y rankings del equipo</Text>
        </Col>
        <Col>
          <Space>
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              style={{ width: 120 }}
            >
              <Option value="daily">Hoy</Option>
              <Option value="weekly">Esta Semana</Option>
              <Option value="monthly">Este Mes</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {/* My Stats Card */}
      {myStats && (
        <Card style={{ marginBottom: 24, borderColor: '#1890ff', borderWidth: 2 }}>
          <Row gutter={[24, 0]} align="middle">
            <Col xs={24} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <Title level={1} style={{ marginBottom: 0 }}>
                  #{myRank}
                </Title>
                <Text type="secondary">Tu posición</Text>
              </div>
            </Col>
            <Col xs={24} sm={18}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Llamadas"
                    value={myStats.completedCalls}
                    prefix={<PhoneOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Ventas"
                    value={myStats.conversions}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Conversión"
                    value={myStats.conversionRate}
                    suffix="%"
                    precision={1}
                    prefix={<PercentageOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Puntos"
                    value={myStats.score}
                    prefix={<FireOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      )}

      {/* Podium */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 2nd Place */}
        <Col xs={24} sm={8}>
          {podium[1] && (
            <Card
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                marginTop: 40,
              }}
            >
              <Avatar size={80} src={podium[1].avatar} icon={<TeamOutlined />} />
              <Title level={3} style={{ marginTop: 16 }}>
                🥈 2° Lugar
              </Title>
              <Text strong>{podium[1].firstName} {podium[1].lastName}</Text>
              <br />
              <Text type="secondary">{podium[1].conversions} ventas</Text>
              <br />
              <Text style={{ fontSize: 20, color: '#595959', fontWeight: 'bold' }}>
                {podium[1].score.toFixed(0)} pts
              </Text>
            </Card>
          )}
        </Col>

        {/* 1st Place */}
        <Col xs={24} sm={8}>
          {podium[0] && (
            <Card
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fff3b8 0%, #ffd700 100%)',
                border: '2px solid #ffd700',
              }}
            >
              <CrownOutlined style={{ fontSize: 48, color: '#faad14' }} />
              <br />
              <Avatar size={100} src={podium[0].avatar} icon={<TeamOutlined />} />
              <Title level={2} style={{ marginTop: 16 }}>
                🥇 1° Lugar
              </Title>
              <Text strong style={{ fontSize: 18 }}>
                {podium[0].firstName} {podium[0].lastName}
              </Text>
              <br />
              <Text type="secondary">{podium[0].conversions} ventas</Text>
              <br />
              <Text style={{ fontSize: 24, color: '#faad14', fontWeight: 'bold' }}>
                {podium[0].score.toFixed(0)} pts
              </Text>
            </Card>
          )}
        </Col>

        {/* 3rd Place */}
        <Col xs={24} sm={8}>
          {podium[2] && (
            <Card
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffebe0 0%, #cd7f32 100%)',
                marginTop: 60,
              }}
            >
              <Avatar size={80} src={podium[2].avatar} icon={<TeamOutlined />} />
              <Title level={3} style={{ marginTop: 16 }}>
                🥉 3° Lugar
              </Title>
              <Text strong>{podium[2].firstName} {podium[2].lastName}</Text>
              <br />
              <Text type="secondary">{podium[2].conversions} ventas</Text>
              <br />
              <Text style={{ fontSize: 20, color: '#8b4513', fontWeight: 'bold' }}>
                {podium[2].score.toFixed(0)} pts
              </Text>
            </Card>
          )}
        </Col>
      </Row>

      {/* Full Rankings Table */}
      <Card title="Ranking Completo">
        <Table
          dataSource={rankings}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowClassName={(record) => record.id === identity?.id ? 'highlight-row' : ''}
        />
      </Card>

      <style>{`
        .highlight-row {
          background-color: #e6f7ff;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};
