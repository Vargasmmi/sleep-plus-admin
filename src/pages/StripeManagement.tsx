import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Space, 
  Typography, 
  Tabs, 
  Alert,
  Statistic
} from 'antd';
import { 
  SettingOutlined, 
  LinkOutlined, 
  DollarOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  StripeConfigForm, 
  PaymentLinkGenerator, 
  PaymentLinksList 
} from '../components/stripe';
import StripeSubscriptionsList from '../components/StripeSubscriptionsList';
import StripeSubscriptionModal from '../components/StripeSubscriptionModal';
import stripeService from '../services/stripeService';
import subscriptionService from '../services/subscriptionService';
import { StripeStats } from '../interfaces/stripe';

const { Title, Paragraph } = Typography;

const StripeManagement: React.FC = () => {
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [stats, setStats] = useState<StripeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [checkingNew, setCheckingNew] = useState(false);
  
  // Estado para el modal de detalles de suscripción
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    loadStripeStatus();
  }, []);

  const loadStripeStatus = async () => {
    try {
      setLoading(true);
      
      // Verificar configuración
      const configResponse = await stripeService.getConfig();
      setConfigured(configResponse.success && configResponse.configured);
      
      // Cargar estadísticas si está configurado
      if (configResponse.success && configResponse.configured) {
        try {
          const statsResponse = await stripeService.getStats();
          if (statsResponse.success) {
            setStats(statsResponse.stats);
          }
        } catch (error) {
          // Si hay error en stats, usar valores por defecto
          setStats({
            paymentLinks: { total: 0, active: 0, completed: 0 },
            subscriptions: { total: 0, active: 0, canceled: 0 },
            webhooks: { total: 0, processed: 0, pending: 0, today: 0 }
          });
        }
      }
    } catch (error) {
      console.error('Error cargando estado de Stripe:', error);
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStripe = async () => {
    setSyncLoading(true);
    try {
      const result = await subscriptionService.syncWithStripe();
      if (result.success) {
        alert(`✅ ${result.message}`);
        await loadStripeStatus();
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleImportFromStripe = async () => {
    setImportLoading(true);
    try {
      const result = await subscriptionService.importFromStripe();
      if (result.success) {
        alert(`✅ ${result.message}\n\nDetalles:\n${result.details.map(d => `- ${d.customerEmail} (${d.plan})`).join('\n')}`);
        await loadStripeStatus();
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleCheckNewSubscriptions = async () => {
    setCheckingNew(true);
    try {
      const result = await subscriptionService.checkNewSubscriptions();
      if (result.success) {
        if (result.newCount > 0) {
          alert(`🎉 ¡${result.newCount} nuevas suscripciones encontradas!\n\nDetalles:\n${result.newSubscriptions.map(s => `- ${s.customerEmail} (${s.plan}) - ${s.stripeId}`).join('\n')}`);
          await loadStripeStatus();
        } else {
          alert(`ℹ️ No se encontraron nuevas suscripciones en las últimas 24 horas.`);
        }
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setCheckingNew(false);
    }
  };

  // Función para mostrar detalles de suscripción
  const handleShowSubscriptionDetails = (subscription: any) => {
    setSelectedSubscription(subscription);
    setShowSubscriptionModal(true);
  };

  // Función para cerrar el modal de suscripción
  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionModal(false);
    setSelectedSubscription(null);
  };

  const statsData = stats ? [
    {
      title: 'Payment Links Activos',
      value: stats.paymentLinks.active,
      prefix: <LinkOutlined />,
      suffix: null,
    },
    {
      title: 'Payment Links Total',
      value: stats.paymentLinks.total,
      prefix: <CreditCardOutlined />,
      suffix: null,
    },
    {
      title: 'Webhooks Procesados',
      value: stats.webhooks.processed,
      prefix: <DollarOutlined />,
      suffix: null,
    },
  ] : [
    {
      title: 'Payment Links Activos',
      value: 0,
      prefix: <LinkOutlined />,
      suffix: null,
    },
    {
      title: 'Payment Links Total',
      value: 0,
      prefix: <CreditCardOutlined />,
      suffix: null,
    },
    {
      title: 'Webhooks Procesados',
      value: 0,
      prefix: <DollarOutlined />,
      suffix: null,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Gestión de Stripe</Title>
        <Paragraph>
          Administra los pagos, suscripciones y enlaces de pago de Stripe desde un solo lugar.
        </Paragraph>
      </div>

      {!configured && (
        <Alert
          message="Configuración Requerida"
          description="Para usar las funcionalidades de Stripe, primero debes configurar tus credenciales en la pestaña de Configuración."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Payment Links"
              value={stats?.paymentLinks?.total || 0}
              prefix={<LinkOutlined />}
              suffix={`/ ${stats?.paymentLinks?.active || 0} activos`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Suscripciones"
              value={stats?.subscriptions?.total || 0}
              prefix={<CreditCardOutlined />}
              suffix={`/ ${stats?.subscriptions?.active || 0} activas`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Webhooks"
              value={stats?.webhooks?.total || 0}
              prefix={<DollarOutlined />}
              suffix={`/ ${stats?.webhooks?.processed || 0} procesados`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Estado"
              value={configured ? "Configurado" : "No configurado"}
              prefix={configured ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ExclamationCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      {configured && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card>
              <Space>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  loading={syncLoading}
                  onClick={handleSyncStripe}
                >
                  Sincronizar con Stripe
                </Button>
                
                <Button
                  icon={<DownloadOutlined />}
                  loading={importLoading}
                  onClick={handleImportFromStripe}
                >
                  Importar desde Stripe
                </Button>
                
                <Button
                  icon={<SearchOutlined />}
                  loading={checkingNew}
                  onClick={handleCheckNewSubscriptions}
                >
                  Verificar Nuevas
                </Button>
                
                <Button
                  type="dashed"
                  icon={<ReloadOutlined />}
                  onClick={loadStripeStatus}
                >
                  Actualizar Estadísticas
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      <Tabs 
        defaultActiveKey="subscriptions"
        items={[
          {
            key: 'subscriptions',
            label: (
              <Space>
                <CreditCardOutlined />
                Suscripciones
              </Space>
            ),
            children: configured ? (
              <StripeSubscriptionsList 
                onSubscriptionSelect={handleShowSubscriptionDetails}
              />
            ) : (
              <Alert
                message="Configuración requerida"
                description="Debes configurar Stripe antes de ver las suscripciones."
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )
          },
          {
            key: 'payment-links',
            label: (
              <Space>
                <LinkOutlined />
                Payment Links
              </Space>
            ),
            children: (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<LinkOutlined />}
                      onClick={() => setShowPaymentLinkModal(true)}
                      disabled={!configured}
                    >
                      Crear Payment Link
                    </Button>
                  </Space>
                </div>
                
                <PaymentLinksList />

                <PaymentLinkGenerator
                  visible={showPaymentLinkModal}
                  onClose={() => setShowPaymentLinkModal(false)}
                />
              </>
            )
          },
          {
            key: 'configuration',
            label: (
              <Space>
                <SettingOutlined />
                Configuración
              </Space>
            ),
            children: (
              <StripeConfigForm
                onConfigSaved={() => {
                  setConfigured(true);
                  loadStripeStatus();
                }}
              />
            )
          }
        ]}
      />

      {/* Modal de detalles de suscripción */}
      <StripeSubscriptionModal
        visible={showSubscriptionModal}
        subscription={selectedSubscription}
        onClose={handleCloseSubscriptionModal}
      />
    </div>
  );
};

export default StripeManagement; 