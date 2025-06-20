import React from 'react';
import { 
  Modal, 
  Descriptions, 
  Tag, 
  Space, 
  Typography, 
  Card, 
  Row, 
  Col,
  Divider,
  Button,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  CreditCardOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  LinkOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface StripeSubscriptionModalProps {
  visible: boolean;
  subscription: any;
  onClose: () => void;
}

const StripeSubscriptionModal: React.FC<StripeSubscriptionModalProps> = ({
  visible,
  subscription,
  onClose
}) => {
  if (!subscription) return null;

  // Formatear fecha desde timestamp Unix
  const formatDate = (timestamp: number) => {
    return dayjs.unix(timestamp).format('DD/MM/YYYY HH:mm:ss');
  };

  // Formatear precio
  const formatPrice = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency?.toUpperCase() || 'USD'}`;
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'green',
      'canceled': 'red',
      'past_due': 'orange',
      'incomplete': 'blue',
      'trialing': 'cyan',
      'unpaid': 'red'
    };
    return colors[status] || 'default';
  };

  // Obtener icono del estado
  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'active': <CheckCircleOutlined />,
      'canceled': <CloseCircleOutlined />,
      'past_due': <PauseCircleOutlined />,
      'incomplete': <PauseCircleOutlined />,
      'trialing': <CheckCircleOutlined />,
      'unpaid': <CloseCircleOutlined />
    };
    return icons[status] || <CalendarOutlined />;
  };

  // Copiar ID al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const customer = subscription.customer;
  const price = subscription.items?.data?.[0]?.price;
  const product = price?.product;

  return (
    <Modal
      title={
        <Space>
          <CreditCardOutlined />
          <span>Detalles de Suscripción de Stripe</span>
          <Tag color={getStatusColor(subscription.status)} icon={getStatusIcon(subscription.status)}>
            {subscription.status?.toUpperCase()}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>
      ]}
      width={800}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Información General */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>
            <CreditCardOutlined /> Información General
          </Title>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="ID de Suscripción">
              <Space>
                <Text code>{subscription.id}</Text>
                <Tooltip title="Copiar ID">
                  <Button 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={() => copyToClipboard(subscription.id)}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={getStatusColor(subscription.status)} icon={getStatusIcon(subscription.status)}>
                {subscription.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Creado">
              {formatDate(subscription.created)}
            </Descriptions.Item>
            <Descriptions.Item label="Método de Cobro">
              {subscription.collection_method || 'charge_automatically'}
            </Descriptions.Item>
            {subscription.canceled_at && (
              <Descriptions.Item label="Cancelado">
                {formatDate(subscription.canceled_at)}
              </Descriptions.Item>
            )}
            {subscription.trial_end && (
              <Descriptions.Item label="Fin de Prueba">
                {formatDate(subscription.trial_end)}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Información del Cliente */}
        {customer && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5}>
              <UserOutlined /> Cliente
            </Title>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="ID del Cliente">
                <Space>
                  <Text code>{customer.id}</Text>
                  <Tooltip title="Copiar ID">
                    <Button 
                      size="small" 
                      icon={<CopyOutlined />} 
                      onClick={() => copyToClipboard(customer.id)}
                    />
                  </Tooltip>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Nombre">
                {customer.name || 'Sin nombre'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {customer.email || 'Sin email'}
              </Descriptions.Item>
              <Descriptions.Item label="Teléfono">
                {customer.phone || 'Sin teléfono'}
              </Descriptions.Item>
              <Descriptions.Item label="Creado">
                {customer.created ? formatDate(customer.created) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Moneda">
                {customer.currency || 'USD'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Información del Producto y Precio */}
        {price && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5}>
              <DollarOutlined /> Producto y Precio
            </Title>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Producto">
                {product?.name || 'Sin nombre'}
              </Descriptions.Item>
              <Descriptions.Item label="Descripción">
                {product?.description || 'Sin descripción'}
              </Descriptions.Item>
              <Descriptions.Item label="Precio">
                {formatPrice(price.unit_amount, price.currency)}
              </Descriptions.Item>
              <Descriptions.Item label="Frecuencia">
                {price.recurring?.interval_count || 1} {price.recurring?.interval || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="ID del Precio">
                <Space>
                  <Text code>{price.id}</Text>
                  <Tooltip title="Copiar ID">
                    <Button 
                      size="small" 
                      icon={<CopyOutlined />} 
                      onClick={() => copyToClipboard(price.id)}
                    />
                  </Tooltip>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tipo de Facturación">
                {price.recurring?.usage_type || 'licensed'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Información de Facturación */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>
            <CalendarOutlined /> Facturación
          </Title>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Período Actual - Inicio">
              {formatDate(subscription.current_period_start)}
            </Descriptions.Item>
            <Descriptions.Item label="Período Actual - Fin">
              {formatDate(subscription.current_period_end)}
            </Descriptions.Item>
            <Descriptions.Item label="Cancelar al Final del Período">
              {subscription.cancel_at_period_end ? 'Sí' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Días de Prueba">
              {subscription.trial_period_days || 'Sin prueba'}
            </Descriptions.Item>
            {subscription.latest_invoice && (
              <Descriptions.Item label="Última Factura">
                <Text code>{subscription.latest_invoice}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Método de Pago */}
        {subscription.default_payment_method && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5}>
              <CreditCardOutlined /> Método de Pago
            </Title>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="ID del Método">
                <Text code>{subscription.default_payment_method.id || subscription.default_payment_method}</Text>
              </Descriptions.Item>
              {subscription.default_payment_method.card && (
                <>
                  <Descriptions.Item label="Marca">
                    {subscription.default_payment_method.card.brand?.toUpperCase()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Últimos 4 dígitos">
                    **** {subscription.default_payment_method.card.last4}
                  </Descriptions.Item>
                  <Descriptions.Item label="Expiración">
                    {subscription.default_payment_method.card.exp_month}/{subscription.default_payment_method.card.exp_year}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Metadata */}
        {subscription.metadata && Object.keys(subscription.metadata).length > 0 && (
          <Card size="small">
            <Title level={5}>
              📋 Metadata Personalizada
            </Title>
            <Descriptions column={1} size="small">
              {Object.entries(subscription.metadata).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  <Text code>{String(value)}</Text>
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}

        {/* Enlaces Útiles */}
        <Divider />
        <Space>
          <Button 
            type="link" 
            icon={<LinkOutlined />}
            onClick={() => window.open(`https://dashboard.stripe.com/subscriptions/${subscription.id}`, '_blank')}
          >
            Ver en Stripe Dashboard
          </Button>
          {customer && (
            <Button 
              type="link" 
              icon={<UserOutlined />}
              onClick={() => window.open(`https://dashboard.stripe.com/customers/${customer.id}`, '_blank')}
            >
              Ver Cliente en Stripe
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
};

export default StripeSubscriptionModal; 