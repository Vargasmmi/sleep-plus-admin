import React, { useState, useEffect } from "react";
import {
  List,
  useTable,
  DateField,
  ShowButton,
  EditButton,
  FilterDropdown,
  getDefaultSortOrder,
} from "@refinedev/antd";
import { Table, Space, Tag, Input, Select, Button, Progress, Tooltip, Typography, Card, Row, Col, message } from "antd";
import { 
  CreditCardOutlined, 
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  BankOutlined,
  LinkOutlined,
  SyncOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
  BellOutlined
} from "@ant-design/icons";
import { useMany, useNotification } from "@refinedev/core";
import dayjs from "dayjs";
import type { ISubscription, ICustomer } from "../../interfaces";
import subscriptionService from "../../services/subscriptionService";
import SubscriptionStripeDashboard from '../../components/SubscriptionStripeDashboard';
import StripeSubscriptionsList from '../../components/StripeSubscriptionsList';
import stripeService from '../../services/stripeService';

const { Text } = Typography;

export const SubscriptionList: React.FC = () => {
  const { open } = useNotification();
  const { tableProps, filters, sorters, tableQueryResult } = useTable<ISubscription>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
  });

  const [syncLoading, setSyncLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [checkingNew, setCheckingNew] = useState(false);
  const [autoPolling, setAutoPolling] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [showStripeView, setShowStripeView] = useState(false);

  // Fetch customers for subscriptions
  const customerIds = tableProps?.dataSource?.map((item) => item.customerId) ?? [];
  const { data: customersData } = useMany<ICustomer>({
    resource: "customers",
    ids: customerIds,
    queryOptions: {
      enabled: customerIds.length > 0,
    },
  });

  const customersMap = React.useMemo(() => {
    const map: Record<string, ICustomer> = {};
    customersData?.data?.forEach((customer) => {
      map[customer.id] = customer;
    });
    return map;
  }, [customersData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "paused":
        return "orange";
      case "cancelled":
        return "red";
      case "pending":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleOutlined />;
      case "paused":
        return <PauseCircleOutlined />;
      case "cancelled":
        return <CloseCircleOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "elite":
        return "purple";
      case "premium":
        return "blue";
      case "basic":
        return "default";
      default:
        return "default";
    }
  };

  const getPaymentMethodIcon = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "stripe":
        return <CreditCardOutlined style={{ color: "#635bff" }} />;
      case "card":
        return <CreditCardOutlined />;
      case "ach":
        return <BankOutlined />;
      case "cash":
        return <DollarOutlined />;
      default:
        return <CreditCardOutlined />;
    }
  };

  const getPaymentMethodLabel = (paymentMethod: string) => {
    return subscriptionService.getPaymentMethodLabel(paymentMethod);
  };

  const isStripeSubscription = (subscription: ISubscription) => {
    return subscriptionService.isStripeSubscription(subscription);
  };

  // Función para verificar nuevas suscripciones
  const checkNewSubscriptions = async (showMessage = true) => {
    try {
      setCheckingNew(true);
      const result = await subscriptionService.checkNewSubscriptions();
      
      if (result.success) {
        setLastCheck(new Date());
        
        if (result.newCount > 0) {
          if (showMessage) {
            message.success(`🎉 ¡${result.newCount} nuevas suscripciones encontradas!`);
          }
          // Refrescar la tabla
          tableQueryResult.refetch();
        } else if (showMessage) {
          message.info('No se encontraron nuevas suscripciones');
        }
      }
    } catch (error: any) {
      if (showMessage) {
        message.error(`Error: ${error.message}`);
      }
      console.error('Error verificando nuevas suscripciones:', error);
    } finally {
      setCheckingNew(false);
    }
  };

  // Polling automático cada 2 minutos
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoPolling) {
      // Verificar inmediatamente al cargar
      checkNewSubscriptions(false);
      
      // Configurar intervalo
      interval = setInterval(() => {
        console.log('🔄 [AUTO-POLLING] Verificando nuevas suscripciones...');
        checkNewSubscriptions(false);
      }, 2 * 60 * 1000); // 2 minutos
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoPolling]);

  const handleSyncStripe = async () => {
    setSyncLoading(true);
    try {
      const result = await subscriptionService.syncWithStripe();
      if (result.success) {
        message.success(result.message);
        tableQueryResult.refetch();
      }
    } catch (error: any) {
      message.error(`Error: ${error.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleImportFromStripe = async () => {
    setImportLoading(true);
    try {
      const result = await subscriptionService.importFromStripe();
      if (result.success) {
        message.success(`${result.message}\n\nDetalles:\n${result.details.map(d => `- ${d.customerEmail} (${d.plan})`).join('\n')}`);
        tableQueryResult.refetch();
      }
    } catch (error: any) {
      message.error(`Error: ${error.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleCheckNewSubscriptions = async () => {
    await checkNewSubscriptions(true);
  };

  const toggleAutoPolling = () => {
    setAutoPolling(!autoPolling);
    message.info(autoPolling ? 'Verificación automática desactivada' : 'Verificación automática activada');
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    try {
      await subscriptionService.pauseSubscription(subscriptionId, 'Pausado por usuario');
      message.success('Suscripción pausada exitosamente');
      tableQueryResult.refetch();
    } catch (error: any) {
      message.error(`Error pausando suscripción: ${error.message}`);
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      await subscriptionService.resumeSubscription(subscriptionId);
      message.success('Suscripción reactivada exitosamente');
      tableQueryResult.refetch();
    } catch (error: any) {
      message.error(`Error reactivando suscripción: ${error.message}`);
    }
  };

  return (
    <div>
      {/* Dashboard de Estadísticas */}
      <div style={{ marginBottom: '24px' }}>
        <SubscriptionStripeDashboard />
      </div>

      {/* Lista de Suscripciones */}
      {showStripeView ? (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Space align="center">
              <LinkOutlined style={{ color: '#1890ff' }} />
              <Text strong>Vista en Tiempo Real desde Stripe</Text>
              <Tag color="blue">API Optimizada</Tag>
            </Space>
          </Card>
          <StripeSubscriptionsList 
            onSubscriptionSelect={(subscription) => {
              console.log('Suscripción de Stripe seleccionada:', subscription);
            }}
          />
        </>
      ) : (
        <List
        headerButtons={[
          <Button
            key="toggle-view"
            type={showStripeView ? "default" : "primary"}
            icon={<LinkOutlined />}
            onClick={() => setShowStripeView(!showStripeView)}
          >
            {showStripeView ? 'Vista Local' : 'Vista Stripe'}
          </Button>,
          <Button
            key="sync-stripe"
            type="primary"
            icon={<SyncOutlined />}
            loading={syncLoading}
            onClick={handleSyncStripe}
          >
            Sincronizar con Stripe
          </Button>
        ]}
      >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Cliente"
          dataIndex="customerId"
          key="customer"
          render={(customerId) => {
            const customer = customersMap[customerId];
            if (!customer) return <Text>-</Text>;
            
            return (
              <Space>
                <UserOutlined />
                <Space direction="vertical" size={0}>
                  <Text strong>
                    {customer.firstName} {customer.lastName}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {customer.phone}
                  </Text>
                </Space>
              </Space>
            );
          }}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="Buscar cliente..." />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Plan"
          dataIndex="plan"
          key="plan"
          render={(plan) => (
            <Tag color={getPlanColor(plan)} icon={<CreditCardOutlined />}>
              {plan?.toUpperCase()}
            </Tag>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                placeholder="Seleccionar plan"
                style={{ width: 150 }}
                options={[
                  { value: "basic", label: "Basic" },
                  { value: "premium", label: "Premium" },
                  { value: "elite", label: "Elite" },
                ]}
              />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Estado"
          dataIndex="status"
          key="status"
          render={(status) => (
            <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
              {status?.toUpperCase()}
            </Tag>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                placeholder="Seleccionar estado"
                style={{ width: 150 }}
                options={[
                  { value: "active", label: "Activo" },
                  { value: "paused", label: "Pausado" },
                  { value: "cancelled", label: "Cancelado" },
                  { value: "pending", label: "Pendiente" },
                ]}
              />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Precio"
          key="pricing"
          render={(_, record: ISubscription) => {
            if (!record.pricing) {
              return <Text>-</Text>;
            }
            
            return (
              <Space direction="vertical" size={0}>
                <Text strong>
                  ${record.pricing.monthly || 0}/mes
                </Text>
                {record.billing?.frequency === "annual" && record.pricing.annual && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ${record.pricing.annual}/año
                  </Text>
                )}
              </Space>
            );
          }}
          sorter
        />

        <Table.Column
          title="Método de Pago"
          key="paymentMethod"
          render={(_, record: ISubscription) => {
            if (!record.billing?.paymentMethod) {
              return <Text>-</Text>;
            }
            
            const isStripe = isStripeSubscription(record);
            
            return (
              <Space direction="vertical" size={0}>
                <Space>
                  {getPaymentMethodIcon(record.billing.paymentMethod)}
                  <Text>{getPaymentMethodLabel(record.billing.paymentMethod)}</Text>
                                     {isStripe && (
                     <Tag color="purple" style={{ fontSize: '11px' }}>
                       <LinkOutlined /> Stripe
                     </Tag>
                   )}
                </Space>
                {record.billing.lastFour && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ****{record.billing.lastFour}
                  </Text>
                )}
                {isStripe && record.billing.stripeSubscriptionId && (
                  <Tooltip title={`ID Stripe: ${record.billing.stripeSubscriptionId}`}>
                    <Text type="secondary" style={{ fontSize: 10, fontFamily: 'monospace' }}>
                      {record.billing.stripeSubscriptionId.substring(0, 12)}...
                    </Text>
                  </Tooltip>
                )}
              </Space>
            );
          }}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                placeholder="Método de pago"
                style={{ width: 150 }}
                options={[
                  { value: "stripe", label: "Stripe" },
                  { value: "card", label: "Tarjeta" },
                  { value: "ach", label: "ACH" },
                  { value: "cash", label: "Efectivo" },
                ]}
              />
            </FilterDropdown>
          )}
        />

        <Table.Column
          title="Próximo Cobro"
          dataIndex={["billing", "nextBillingDate"]}
          key="nextBilling"
          render={(date) => {
            const daysUntil = dayjs(date).diff(dayjs(), "days");
            return (
              <Space direction="vertical" size={0}>
                <DateField value={date} format="DD/MM/YYYY" />
                {daysUntil >= 0 && daysUntil <= 7 && (
                  <Tag color="warning" style={{ fontSize: 11 }}>
                    En {daysUntil} días
                  </Tag>
                )}
              </Space>
            );
          }}
          sorter
          defaultSortOrder={getDefaultSortOrder("billing.nextBillingDate", sorters)}
        />

        <Table.Column
          title="Servicios"
          key="services"
          render={(_, record: ISubscription) => {
            if (!record.services) {
              return <Text>-</Text>;
            }
            
            return (
              <Space direction="vertical" size="small">
                <Tooltip title="Limpiezas utilizadas">
                  <Space>
                    <Text>Limpiezas:</Text>
                    <Progress
                      percent={(record.services.cleaningsUsed / record.services.cleaningsTotal) * 100}
                      steps={record.services.cleaningsTotal}
                      size="small"
                      showInfo={false}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {record.services.cleaningsUsed}/{record.services.cleaningsTotal}
                    </Text>
                  </Space>
                </Tooltip>
                {record.services.inspectionsTotal > 0 && (
                  <Tooltip title="Inspecciones utilizadas">
                    <Space>
                      <Text>Inspecciones:</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.services.inspectionsUsed}/{record.services.inspectionsTotal}
                      </Text>
                    </Space>
                  </Tooltip>
                )}
              </Space>
            );
          }}
        />

        <Table.Column
          title="Créditos"
          key="credits"
          render={(_, record: ISubscription) => {
            if (!record.credits) {
              return <Text>-</Text>;
            }
            
            return (
              <Space direction="vertical" size={0}>
                <Tooltip title="Créditos acumulados">
                  <Tag color="green">
                    <DollarOutlined /> {record.credits.accumulated || 0}
                  </Tag>
                </Tooltip>
                {record.credits.expiration && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Exp: {dayjs(record.credits.expiration).format("DD/MM/YY")}
                  </Text>
                )}
              </Space>
            );
          }}
        />

        <Table.Column
          title="Inicio"
          dataIndex="startDate"
          key="startDate"
          render={(date) => <DateField value={date} format="DD/MM/YYYY" />}
          sorter
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          key="actions"
          fixed="right"
          render={(_, record) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              {record.status === "active" && (
                <Tooltip title="Pausar suscripción">
                  <Button
                    size="small"
                    icon={<PauseCircleOutlined />}
                    onClick={() => handlePauseSubscription(record.id)}
                  />
                </Tooltip>
              )}
              {record.status === "paused" && (
                <Tooltip title="Reanudar suscripción">
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleResumeSubscription(record.id)}
                  />
                </Tooltip>
              )}
              {isStripeSubscription(record as ISubscription) && (
                <Tooltip title="Sincronizar con Stripe">
                  <Button
                    size="small"
                    icon={<SyncOutlined />}
                    onClick={handleSyncStripe}
                  />
                </Tooltip>
              )}
            </Space>
          )}
        />
      </Table>
      </List>
      )}

      {!showStripeView && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Space>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
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
                  type={autoPolling ? "primary" : "default"}
                  icon={<BellOutlined />}
                  onClick={toggleAutoPolling}
                  style={{ 
                    backgroundColor: autoPolling ? '#52c41a' : undefined,
                    borderColor: autoPolling ? '#52c41a' : undefined
                  }}
                >
                  Auto-Verificación {autoPolling ? 'ON' : 'OFF'}
                </Button>
                
                <Button
                  type="dashed"
                  icon={<ReloadOutlined />}
                  onClick={() => tableQueryResult.refetch()}
                >
                  Actualizar Lista
                </Button>
              </Space>
            </Col>
            
            <Col>
              <Space direction="vertical" size="small" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {autoPolling ? (
                    <>
                      🔄 Verificación automática activa
                      <br />
                      {lastCheck && `Última verificación: ${lastCheck.toLocaleTimeString()}`}
                    </>
                  ) : (
                    '⏸️ Verificación automática pausada'
                  )}
                </div>
              </Space>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};
