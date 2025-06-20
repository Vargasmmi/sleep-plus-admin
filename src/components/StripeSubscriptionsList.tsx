import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Select, 
  Input, 
  Tooltip, 
  message,
  Row,
  Col,
  Typography,
  Alert
} from 'antd';
import { 
  SyncOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import stripeService from '../services/stripeService';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Search } = Input;

interface StripeSubscriptionsListProps {
  onSubscriptionSelect?: (subscription: any) => void;
}

const StripeSubscriptionsList: React.FC<StripeSubscriptionsListProps> = ({ 
  onSubscriptionSelect 
}) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    customer: '',
    limit: 50
  });
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Cargar suscripciones desde Stripe
  const loadSubscriptions = async (showMessage = true) => {
    setLoading(true);
    try {
      const result = await stripeService.getStripeSubscriptions({
        status: filters.status,
        customer: filters.customer || undefined,
        limit: filters.limit,
        expand: true
      });

      if (result.success) {
        setSubscriptions(result.subscriptions);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
        
        if (showMessage) {
          message.success(`✅ ${result.subscriptions.length} suscripciones cargadas desde Stripe`);
        }
      }
    } catch (error: any) {
      message.error(`Error: ${error.message}`);
      console.error('Error cargando suscripciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    loadSubscriptions(false);
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSubscriptions(false);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return dayjs.unix(timestamp).format('DD/MM/YYYY HH:mm');
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

  // Columnas de la tabla
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {id.substring(0, 12)}...
        </Text>
      ),
    },
    {
      title: 'Cliente',
      key: 'customer',
      width: 200,
      render: (record: any) => {
        const customer = record.customer;
        return (
          <Space direction="vertical" size={0}>
            <Text strong>
              <UserOutlined /> {customer?.name || 'Sin nombre'}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {customer?.email || 'Sin email'}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Producto',
      key: 'product',
      width: 180,
      render: (record: any) => {
        const price = record.items?.data?.[0]?.price;
        const product = price?.product;
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>
              <CreditCardOutlined /> {product?.name || 'Sin nombre'}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {price ? formatPrice(price.unit_amount, price.currency) : 'N/A'}
              {price?.recurring?.interval && ` / ${price.recurring.interval}`}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Fechas',
      key: 'dates',
      width: 200,
      render: (record: any) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            <CalendarOutlined /> Creado: {formatDate(record.created)}
          </Text>
          <Text style={{ fontSize: '12px' }}>
            🔄 Período: {formatDate(record.current_period_start)} - {formatDate(record.current_period_end)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (record: any) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button 
              size="small" 
              onClick={() => onSubscriptionSelect?.(record)}
            >
              Ver
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              📋 Suscripciones de Stripe
            </Title>
            <Text type="secondary">
              Mostrando {subscriptions.length} suscripciones
              {hasMore && ' (hay más disponibles)'}
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => loadSubscriptions(true)}
                loading={loading}
              >
                Actualizar
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Filtros */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Select
            placeholder="Estado"
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            style={{ width: '100%' }}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'active', label: 'Activas' },
              { value: 'canceled', label: 'Canceladas' },
              { value: 'past_due', label: 'Vencidas' },
              { value: 'incomplete', label: 'Incompletas' },
              { value: 'trialing', label: 'En prueba' },
            ]}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Search
            placeholder="Buscar por email del cliente"
            value={filters.customer}
            onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8}>
          <Select
            placeholder="Cantidad"
            value={filters.limit}
            onChange={(value) => setFilters(prev => ({ ...prev, limit: value }))}
            style={{ width: '100%' }}
            options={[
              { value: 10, label: '10 suscripciones' },
              { value: 25, label: '25 suscripciones' },
              { value: 50, label: '50 suscripciones' },
              { value: 100, label: '100 suscripciones' },
            ]}
          />
        </Col>
      </Row>

      {/* Información de uso de Stripe API */}
      <Alert
        message="Datos en tiempo real desde Stripe"
        description="Esta lista obtiene datos directamente desde la API de Stripe usando expansiones optimizadas para mejor rendimiento."
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />

      {/* Tabla */}
      <Table
        dataSource={subscriptions}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: filters.limit,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} de ${total} suscripciones`
        }}
        scroll={{ x: 1000 }}
        size="small"
      />
    </Card>
  );
};

export default StripeSubscriptionsList; 