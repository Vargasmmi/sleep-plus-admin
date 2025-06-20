import React, { useState, useEffect } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, DatePicker, Switch, Button, message, Row, Col, Card, Spin, Alert, Tag, Space, Typography } from "antd";
import { TagOutlined, GiftOutlined, PercentageOutlined, DollarOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { shopifyService } from "@/services/shopifyService";
import { useList } from "@refinedev/core";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface ICouponForm {
  title: string;
  code: string;
  discountType: 'fixed_amount' | 'percentage';
  value: number;
  appliesTo: 'all' | 'specific_products' | 'specific_collections';
  productIds?: string[];
  collectionIds?: string[];
  minimumRequirementType: 'none' | 'minimum_amount' | 'minimum_quantity';
  minimumAmount?: number;
  minimumQuantity?: number;
  customerEligibility: 'all' | 'specific_customers' | 'customer_groups';
  customerIds?: string[];
  usageLimit?: number;
  oncePerCustomer?: boolean;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
}

export const ShopifyCouponCreate: React.FC = () => {
  const navigate = useNavigate();
  const { formProps, form } = useForm<ICouponForm>();
  const [loading, setLoading] = useState(false);
  const [minimumType, setMinimumType] = useState<'none' | 'minimum_amount' | 'minimum_quantity'>('none');
  const [customerEligibility, setCustomerEligibility] = useState<string>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [appliesTo, setAppliesTo] = useState<string>('all');

  // Cargar clientes locales
  const { data: localCustomers } = useList({
    resource: "customers",
    pagination: { pageSize: 1000 },
  });

  // Cargar clientes de Shopify
  const { data: shopifyCustomers } = useList({
    resource: "shopifyCustomers",
    pagination: { pageSize: 1000 },
  });
  
  // Cargar productos de Shopify
  const { data: shopifyProducts } = useList({
    resource: "shopifyProducts",
    pagination: { pageSize: 1000 },
  });

  // Combinar clientes locales y de Shopify
  const allCustomers = React.useMemo(() => {
    const customers: any[] = [];
    
    // Agregar clientes locales
    if (localCustomers?.data) {
      localCustomers.data.forEach((customer: any) => {
        customers.push({
          id: customer.id,
          shopifyId: null,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email || 'Sin email',
          phone: customer.phone,
          source: 'local',
        });
      });
    }
    
    // Agregar clientes de Shopify
    if (shopifyCustomers?.data) {
      shopifyCustomers.data.forEach((customer: any) => {
        customers.push({
          id: customer.id,
          shopifyId: customer.shopifyId,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email || 'Sin email',
          phone: customer.phone || 'Sin teléfono',
          source: 'shopify',
        });
      });
    }
    
    return customers;
  }, [localCustomers?.data, shopifyCustomers?.data]);

  const handleFinish = async (values: ICouponForm) => {
    try {
      setLoading(true);
      
      // Obtener solo los IDs de Shopify de los clientes seleccionados
      const shopifyCustomerIds = values.customerIds?.map(customerId => {
        const customer = allCustomers.find(c => c.id === customerId);
        return customer?.shopifyId;
      }).filter(id => id); // Filtrar nulls
      
      // Validar que hay clientes con ID de Shopify si se seleccionó "specific_customers"
      if (values.customerEligibility === 'specific_customers' && (!shopifyCustomerIds || shopifyCustomerIds.length === 0)) {
        message.error("Debe seleccionar al menos un cliente que tenga ID de Shopify");
        setLoading(false);
        return;
      }
      
      // Preparar datos para la API
      const couponData = {
        title: values.title,
        code: values.code,
        discountType: values.discountType,
        value: values.value,
        appliesTo: values.appliesTo,
        productIds: values.productIds,
        collectionIds: values.collectionIds,
        minimumAmount: minimumType === 'minimum_amount' ? values.minimumAmount : undefined,
        minimumQuantity: minimumType === 'minimum_quantity' ? values.minimumQuantity : undefined,
        customerEligibility: values.customerEligibility,
        customerIds: shopifyCustomerIds, // Usar solo IDs de Shopify
        usageLimit: values.usageLimit,
        oncePerCustomer: values.oncePerCustomer,
        startsAt: values.dateRange ? values.dateRange[0].toISOString() : undefined,
        endsAt: values.dateRange ? values.dateRange[1].toISOString() : undefined,
      };

      // Crear cupón en Shopify
      const result = await shopifyService.createCoupon(couponData);
      
      if (result.success) {
        message.success("¡Cupón creado exitosamente!");
        navigate("/shopify/coupons");
      }
    } catch (error: any) {
      console.error("Error al crear cupón:", error);
      message.error(error.message || "Error al crear el cupón");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ code });
  };

  return (
    <Create title="Crear Cupón de Shopify" saveButtonProps={{ style: { display: 'none' } }}>
      <Spin spinning={loading}>
        <Form {...formProps} layout="vertical" onFinish={handleFinish}>
          <Card title="Información Básica" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Título del Cupón"
                  name="title"
                  rules={[{ required: true, message: "Por favor ingrese el título" }]}
                >
                  <Input 
                    prefix={<TagOutlined />} 
                    placeholder="Ej: Descuento de Verano 2024" 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Código del Cupón"
                  name="code"
                  rules={[
                    { required: true, message: "Por favor ingrese el código" },
                    { pattern: /^[A-Z0-9]+$/, message: "Solo letras mayúsculas y números" }
                  ]}
                >
                  <Input 
                    prefix={<GiftOutlined />} 
                    placeholder="Ej: VERANO2024"
                    addonAfter={
                      <Button size="small" onClick={generateRandomCode}>
                        Generar
                      </Button>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Configuración del Descuento" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tipo de Descuento"
                  name="discountType"
                  rules={[{ required: true, message: "Por favor seleccione el tipo" }]}
                  initialValue="percentage"
                >
                  <Select>
                    <Option value="percentage">
                      <PercentageOutlined /> Porcentaje
                    </Option>
                    <Option value="fixed_amount">
                      <DollarOutlined /> Monto Fijo
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Valor del Descuento"
                  name="value"
                  rules={[
                    { required: true, message: "Por favor ingrese el valor" },
                    { type: 'number', min: 0, message: "Debe ser mayor a 0" }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                    formatter={(value) => {
                      const type = form.getFieldValue('discountType');
                      return type === 'percentage' 
                        ? `${value}%` 
                        : `$${value}`;
                    }}
                    parser={(value) => value!.replace(/[%$]/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Aplica a"
              name="appliesTo"
              rules={[{ required: true, message: "Por favor seleccione una opción" }]}
              initialValue="all"
            >
              <Select onChange={(value) => setAppliesTo(value)}>
                <Option value="all">Todos los productos</Option>
                <Option value="specific_products">Productos específicos</Option>
                <Option value="specific_collections">Colecciones específicas</Option>
              </Select>
            </Form.Item>
            
            {appliesTo === 'specific_products' && (
              <>
                <Form.Item
                  label="Seleccionar Productos"
                  name="productIds"
                  rules={[{ required: true, message: "Por favor seleccione al menos un producto" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Buscar y seleccionar productos"
                    showSearch
                    filterOption={(input, option: any) => {
                      const product = shopifyProducts?.data?.find((p: any) => p.shopifyId === option.value);
                      if (!product) return false;
                      const searchText = `${product.title} ${product.vendor || ''} ${product.productType || ''}`.toLowerCase();
                      return searchText.includes(input.toLowerCase());
                    }}
                    style={{ width: '100%' }}
                    notFoundContent={!shopifyProducts?.data ? "Cargando productos..." : "No se encontraron productos"}
                  >
                  {shopifyProducts?.data?.map((product: any) => (
                    <Option key={product.shopifyId} value={product.shopifyId}>
                      <Space>
                        {product.images && product.images[0] && (
                          <img 
                            src={product.images[0].src} 
                            alt={product.title}
                            style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 4 }}
                          />
                        )}
                        <div>
                          <div>{product.title}</div>
                          {product.variants && product.variants[0] && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              ${product.variants[0].price}
                            </Text>
                          )}
                        </div>
                      </Space>
                    </Option>
                  ))}
                  </Select>
                </Form.Item>
                
                {(!shopifyProducts?.data || shopifyProducts.data.length === 0) && (
                  <Alert
                    message="No hay productos disponibles"
                    description="Sincroniza los productos desde Shopify para poder seleccionarlos."
                    type="info"
                    showIcon
                    action={
                      <Button 
                        size="small"
                        onClick={() => window.open('/shopify/products', '_blank')}
                      >
                        Ir a Productos
                      </Button>
                    }
                  />
                )}
              </>
            )}
            
            {appliesTo === 'specific_collections' && (
              <Alert
                message="Colección no disponible"
                description="La selección de colecciones específicas aún no está implementada. Por favor, selecciona productos específicos o aplica a todos los productos."
                type="warning"
                showIcon
              />
            )}
          </Card>

          <Card title="Requisitos Mínimos" style={{ marginBottom: 16 }}>
            <Form.Item
              label="Tipo de Requisito"
              name="minimumRequirementType"
              initialValue="none"
            >
              <Select onChange={(value) => setMinimumType(value as any)}>
                <Option value="none">Sin requisitos mínimos</Option>
                <Option value="minimum_amount">Monto mínimo de compra</Option>
                <Option value="minimum_quantity">Cantidad mínima de productos</Option>
              </Select>
            </Form.Item>

            {minimumType === 'minimum_amount' && (
              <Form.Item
                label="Monto Mínimo ($)"
                name="minimumAmount"
                rules={[{ required: true, message: "Por favor ingrese el monto mínimo" }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  formatter={(value) => `$${value}`}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            )}

            {minimumType === 'minimum_quantity' && (
              <Form.Item
                label="Cantidad Mínima"
                name="minimumQuantity"
                rules={[{ required: true, message: "Por favor ingrese la cantidad mínima" }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  step={1}
                />
              </Form.Item>
            )}
          </Card>

          <Card title="Elegibilidad de Clientes" style={{ marginBottom: 16 }}>
            <Form.Item
              label="Aplicable a"
              name="customerEligibility"
              rules={[{ required: true, message: "Por favor seleccione una opción" }]}
              initialValue="all"
            >
              <Select onChange={(value) => setCustomerEligibility(value)}>
                <Option value="all">Todos los clientes</Option>
                <Option value="specific_customers">Clientes específicos</Option>
                <Option value="customer_groups">Grupos de clientes</Option>
              </Select>
            </Form.Item>

            {customerEligibility === 'specific_customers' && (
              <Form.Item
                label="Seleccionar Clientes"
                name="customerIds"
                rules={[{ required: true, message: "Por favor seleccione al menos un cliente" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Buscar y seleccionar clientes"
                  showSearch
                  filterOption={(input, option: any) => {
                    const customer = allCustomers.find(c => c.id === option.value);
                    if (!customer) return false;
                    const searchText = `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase();
                    return searchText.includes(input.toLowerCase());
                  }}
                  style={{ width: '100%' }}
                  notFoundContent={allCustomers.length === 0 ? "Cargando clientes..." : "No se encontraron clientes"}
                >
                  {allCustomers.map((customer) => (
                    <Option 
                      key={customer.id} 
                      value={customer.id}
                      disabled={customer.source === 'local' && !customer.shopifyId}
                    >
                      <Space>
                        <UserOutlined />
                        {customer.name}
                        <Tag color={customer.source === 'shopify' ? 'blue' : 'green'}>
                          {customer.source === 'shopify' ? 'Shopify' : 'Local'}
                        </Tag>
                        <Text type="secondary">({customer.email})</Text>
                        {customer.source === 'local' && !customer.shopifyId && (
                          <Text type="danger" style={{ fontSize: 12 }}>(Sin ID de Shopify)</Text>
                        )}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {customerEligibility === 'specific_customers' && (
              <>
                <Alert
                  message="Nota importante"
                  description="Solo los clientes que tienen un ID de Shopify pueden ser asignados al cupón. Los clientes locales sin sincronizar aparecen deshabilitados."
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
                
                {allCustomers.filter(c => c.source === 'shopify' || c.shopifyId).length === 0 && (
                  <Alert
                    message="No hay clientes de Shopify disponibles"
                    description={
                      <Space direction="vertical">
                        <Text>No se encontraron clientes con ID de Shopify. Puedes:</Text>
                        <ul style={{ marginBottom: 8 }}>
                          <li>Sincronizar clientes desde Shopify</li>
                          <li>Crear el cupón para todos los clientes</li>
                        </ul>
                        <Button 
                          size="small" 
                          onClick={() => {
                            window.open('/shopify/customers', '_blank');
                          }}
                        >
                          Ir a Clientes de Shopify
                        </Button>
                      </Space>
                    }
                    type="warning"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </>
            )}
          </Card>

          <Card title="Límites de Uso" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Límite total de usos"
                  name="usageLimit"
                  tooltip="Dejar vacío para uso ilimitado"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="Sin límite"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Una vez por cliente"
                  name="oncePerCustomer"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch checkedChildren="Sí" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Periodo de Validez" style={{ marginBottom: 16 }}>
            <Form.Item
              label="Fecha de inicio y fin"
              name="dateRange"
              rules={[{ required: true, message: "Por favor seleccione las fechas" }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder={['Fecha de inicio', 'Fecha de fin']}
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Card>
          
          {/* Resumen del cupón */}
          <Card title="Resumen del Cupón" style={{ marginBottom: 16, backgroundColor: '#f5f5f5' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Código: </Text>
              <Text code>{form.getFieldValue('code') || 'SIN CÓDIGO'}</Text>
              
              <Text strong>Descuento: </Text>
              <Text>
                {form.getFieldValue('discountType') === 'percentage' 
                  ? `${form.getFieldValue('value') || 0}%` 
                  : `${form.getFieldValue('value') || 0}`}
              </Text>
              
              {customerEligibility === 'specific_customers' && (
                <>
                  <Text strong>Clientes seleccionados: </Text>
                  <Text>{form.getFieldValue('customerIds')?.length || 0} cliente(s)</Text>
                </>
              )}
              
              {appliesTo === 'specific_products' && (
                <>
                  <Text strong>Productos seleccionados: </Text>
                  <Text>{form.getFieldValue('productIds')?.length || 0} producto(s)</Text>
                </>
              )}
            </Space>
          </Card>

          <Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                >
                  Crear Cupón
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  block
                  size="large"
                  onClick={() => navigate("/shopify/coupons")}
                >
                  Cancelar
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Spin>
    </Create>
  );
};
