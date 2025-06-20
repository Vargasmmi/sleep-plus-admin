import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Button, Space, Spin, Typography } from 'antd';
import { 
  CreditCardOutlined, 
  UserOutlined, 
  DollarOutlined, 
  TrendingUpOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  SyncOutlined
} from '@ant-design/icons';
import subscriptionService from '../services/subscriptionService';
import stripeService from '../services/stripeService';

const { Title, Text } = Typography;

interface SubscriptionStatsData {
  total: number;
  active: number;
  paused: number;
  cancelled: number;
  withStripe: number;
  revenue: {
    monthly: number;
    annual: number;
  };
}

interface StripeStatsData {
  paymentLinks: {
    total: number;
    active: number;
    completed: number;
  };
  subscriptions: {
    total: number;
    active: number;
    canceled: number;
  };
  webhooks: {
    total: number;
    processed: number;
    today: number;
  };
}

const SubscriptionStats: React.FC = () => {
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStatsData | null>(null);
  const [stripeStats, setStripeStats] = useState<StripeStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [subStats, stripStats] = await Promise.all([
        subscriptionService.getSubscriptionStats(),
        stripeService.getStats()
      ]);
      
      setSubscriptionStats(subStats);
      setStripeStats(stripStats.stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSync = async () => {
    try {
      await subscriptionService.syncWithStripe();
      await loadStats(); // Recargar estadísticas después de sync
    } catch (error) {
      console.error('Error sincronizando:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: '16px' }}>
            Cargando estadísticas...
          </Text>
        </div>
      </Card>
    );
  }

  const totalRevenue = (subscriptionStats?.revenue.monthly || 0) + (subscriptionStats?.revenue.annual || 0);
  const stripeIntegrationRate = subscriptionStats ? 
    Math.round((subscriptionStats.withStripe / subscriptionStats.total) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3}>📊 Dashboard de Suscripciones & Stripe</Title>
        <Button 
          type="primary" 
          icon={<SyncOutlined />} 
          onClick={handleSync}
        >
          Sincronizar con Stripe
        </Button>
      </div>

      {/* Estadísticas Principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Suscripciones"
              value={subscriptionStats?.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ingresos Mensuales"
              value={subscriptionStats?.revenue.monthly || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ingresos Anuales"
              value={subscriptionStats?.revenue.annual || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Con Stripe"
              value={subscriptionStats?.withStripe || 0}
              suffix={`/ ${subscriptionStats?.total || 0}`}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Estados de Suscripciones */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="📈 Estados de Suscripciones" extra={<UserOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Activas:</Text>
                    <Tag color="green">{subscriptionStats?.active || 0}</Tag>
                  </Space>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <PauseCircleOutlined style={{ color: '#fa8c16' }} />
                    <Text>Pausadas:</Text>
                    <Tag color="orange">{subscriptionStats?.paused || 0}</Tag>
                  </Space>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <Text>Canceladas:</Text>
                    <Tag color="red">{subscriptionStats?.cancelled || 0}</Tag>
                  </Space>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <LinkOutlined style={{ color: '#722ed1' }} />
                    <Text>Stripe:</Text>
                    <Tag color="purple">{subscriptionStats?.withStripe || 0}</Tag>
                  </Space>
                </div>
              </Col>
            </Row>
            
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">Integración con Stripe</Text>
              <Progress 
                percent={stripeIntegrationRate} 
                strokeColor="#722ed1"
                format={percent => `${percent}%`}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="💳 Estadísticas de Stripe" extra={<CreditCardOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Payment Links</Text>
                  <div>
                    <Text strong>{stripeStats?.paymentLinks.total || 0}</Text>
                    <Text type="secondary"> total</Text>
                  </div>
                  <div>
                    <Tag color="green" size="small">
                      {stripeStats?.paymentLinks.active || 0} activos
                    </Tag>
                    <Tag color="blue" size="small">
                      {stripeStats?.paymentLinks.completed || 0} completados
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Suscripciones Stripe</Text>
                  <div>
                    <Text strong>{stripeStats?.subscriptions.total || 0}</Text>
                    <Text type="secondary"> total</Text>
                  </div>
                  <div>
                    <Tag color="green" size="small">
                      {stripeStats?.subscriptions.active || 0} activas
                    </Tag>
                    <Tag color="red" size="small">
                      {stripeStats?.subscriptions.canceled || 0} canceladas
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: '16px', padding: '12px', background: '#fafafa', borderRadius: '6px' }}>
              <Text type="secondary">Webhooks</Text>
              <div>
                <Text>{stripeStats?.webhooks.processed || 0}</Text>
                <Text type="secondary"> / {stripeStats?.webhooks.total || 0} procesados</Text>
              </div>
              <div>
                <Tag color="blue" size="small">
                  {stripeStats?.webhooks.today || 0} hoy
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Resumen Financiero */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="💰 Resumen Financiero" extra={<TrendingUpOutlined />}>
            <Row gutter={32}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Ingresos Totales"
                  value={totalRevenue}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Ingreso Promedio por Suscripción"
                  value={subscriptionStats?.total ? totalRevenue / subscriptionStats.total : 0}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Tasa de Retención"
                  value={subscriptionStats?.total ? 
                    Math.round((subscriptionStats.active / subscriptionStats.total) * 100) : 0
                  }
                  suffix="%"
                  valueStyle={{ 
                    color: subscriptionStats?.total && 
                           (subscriptionStats.active / subscriptionStats.total) > 0.8 ? 
                           '#52c41a' : '#fa8c16' 
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SubscriptionStats; 