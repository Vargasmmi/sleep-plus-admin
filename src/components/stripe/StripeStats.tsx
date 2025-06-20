import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { 
  LinkOutlined, 
  CreditCardOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { StripeStats as StripeStatsInterface } from '../../interfaces/stripe';

interface StripeStatsProps {
  stats: StripeStatsInterface;
  loading?: boolean;
}

const StripeStats: React.FC<StripeStatsProps> = ({ stats, loading = false }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Payment Links Activos"
            value={stats.paymentLinks.active}
            prefix={<LinkOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Payment Links Completados"
            value={stats.paymentLinks.completed}
            prefix={<CheckCircleOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Total Payment Links"
            value={stats.paymentLinks.total}
            prefix={<CreditCardOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Suscripciones Activas"
            value={stats.subscriptions.active}
            prefix={<CheckCircleOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Suscripciones Canceladas"
            value={stats.subscriptions.canceled}
            prefix={<CloseCircleOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Webhooks Procesados"
            value={stats.webhooks.processed}
            prefix={<SyncOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StripeStats; 