import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Switch,
  Space,
  Alert,
  Typography,
  Row,
  Col,
  Divider
} from 'antd';
import { useNotification } from '@refinedev/core';
import { SaveOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import stripeService from '../../services/stripeService';
import { StripeConfig } from '../../interfaces/stripe';

const { Title, Text, Paragraph } = Typography;

interface StripeConfigFormProps {
  onConfigSaved?: (config: StripeConfig) => void;
}

const StripeConfigForm: React.FC<StripeConfigFormProps> = ({ onConfigSaved }) => {
  const { open } = useNotification();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<StripeConfig | null>(null);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const response = await stripeService.getConfig();
      if (response.success && response.configured && response.config) {
        setCurrentConfig(response.config);
        setConfigured(true);
        
        form.setFieldsValue({
          publicKey: response.config.publicKey,
          secretKey: '',
          webhookSecret: '',
          testMode: response.config.testMode,
          currency: response.config.currency,
          paymentLinks: response.config.enabledFeatures.paymentLinks,
          subscriptions: response.config.enabledFeatures.subscriptions,
          oneTimePayments: response.config.enabledFeatures.oneTimePayments,
          webhooks: response.config.enabledFeatures.webhooks,
        });
      }
    } catch (error: any) {
      console.error('Error cargando configuración:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      const configData = {
        publicKey: values.publicKey,
        secretKey: values.secretKey,
        webhookSecret: values.webhookSecret || '',
        testMode: values.testMode || true,
        currency: values.currency || 'USD',
        enabledFeatures: {
          paymentLinks: values.paymentLinks || true,
          subscriptions: values.subscriptions || true,
          oneTimePayments: values.oneTimePayments || true,
          webhooks: values.webhooks || true,
        }
      };

      const response = await stripeService.saveConfig(configData);
      
      if (response.success) {
        open?.({ 
          type: 'success',
          message: '¡Configuración guardada!',
          description: response.message,
        });
        
        setConfigured(true);
        await loadCurrentConfig();
        
        if (onConfigSaved && currentConfig) {
          onConfigSaved(currentConfig);
        }
      }
    } catch (error: any) {
      open?.({ 
        type: 'error',
        message: 'Error al guardar configuración',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    const publicKey = form.getFieldValue('publicKey');
    const secretKey = form.getFieldValue('secretKey');
    
    if (!publicKey || !secretKey) {
      open?.({ 
        type: 'warning',
        message: 'Campos requeridos',
        description: 'Por favor ingresa las claves de Stripe antes de probar la conexión',
      });
      return;
    }

    setTesting(true);
    
    try {
      const response = await stripeService.saveConfig({
        publicKey,
        secretKey,
        testMode: true
      });
      
      if (response.success) {
        open?.({ 
          type: 'success',
          message: '¡Conexión exitosa!',
          description: 'La conexión con Stripe ha sido establecida correctamente',
        });
      }
    } catch (error: any) {
      open?.({ 
        type: 'error',
        message: 'Error de conexión',
        description: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>
            <Space>
              Configuración de Stripe
              {configured && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
            </Space>
          </Title>
          <Paragraph type="secondary">
            Configura las credenciales de Stripe para habilitar los pagos y suscripciones.
          </Paragraph>
        </div>

        {configured && currentConfig && (
          <Alert
            message="Stripe configurado correctamente"
            description={`Modo: ${currentConfig.testMode ? 'Prueba' : 'Producción'} | Moneda: ${currentConfig.currency}`}
            type="success"
            showIcon
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            testMode: true,
            currency: 'USD',
            paymentLinks: true,
            subscriptions: true,
            oneTimePayments: true,
            webhooks: true,
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Stripe Public Key"
                name="publicKey"
                rules={[
                  { required: true, message: 'El Public Key es requerido' },
                  { pattern: /^pk_(test_|live_)/, message: 'Debe comenzar con pk_test_ o pk_live_' }
                ]}
              >
                <Input.Password placeholder="pk_test_51..." visibilityToggle />
              </Form.Item>
            </Col>
            
            <Col xs={24} lg={12}>
              <Form.Item
                label="Stripe Secret Key"
                name="secretKey"
                rules={[
                  { required: true, message: 'El Secret Key es requerido' },
                  { pattern: /^sk_(test_|live_)/, message: 'Debe comenzar con sk_test_ o sk_live_' }
                ]}
              >
                <Input.Password placeholder="sk_test_51..." visibilityToggle />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Webhook Secret (Opcional)"
                name="webhookSecret"
                help="Secret para verificar webhooks de Stripe"
              >
                <Input.Password placeholder="whsec_..." visibilityToggle />
              </Form.Item>
            </Col>
            
            <Col xs={24} lg={12}>
              <Form.Item label="Moneda" name="currency">
                <Input placeholder="USD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Modo de Prueba"
                name="testMode"
                valuePropName="checked"
              >
                <Switch checkedChildren="Prueba" unCheckedChildren="Producción" defaultChecked />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Funcionalidades Habilitadas</Divider>

          <Row gutter={24}>
            <Col xs={24} lg={6}>
              <Form.Item label="Payment Links" name="paymentLinks" valuePropName="checked">
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            
            <Col xs={24} lg={6}>
              <Form.Item label="Suscripciones" name="subscriptions" valuePropName="checked">
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            
            <Col xs={24} lg={6}>
              <Form.Item label="Pagos Únicos" name="oneTimePayments" valuePropName="checked">
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            
            <Col xs={24} lg={6}>
              <Form.Item label="Webhooks" name="webhooks" valuePropName="checked">
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              Guardar Configuración
            </Button>
            
            <Button
              onClick={testConnection}
              loading={testing}
              size="large"
            >
              Probar Conexión
            </Button>
          </Space>
        </Form>

        {!configured && (
          <Alert
            message="¡Importante!"
            description={
              <div>
                <p>Para configurar Stripe necesitarás:</p>
                <ul>
                  <li>Una cuenta de Stripe (gratuita en stripe.com)</li>
                  <li>Las claves API de tu dashboard de Stripe</li>
                  <li>Para producción, configurar también el webhook secret</li>
                </ul>
              </div>
            }
            type="info"
            showIcon
            icon={<WarningOutlined />}
          />
        )}
      </Space>
    </Card>
  );
};

export default StripeConfigForm; 