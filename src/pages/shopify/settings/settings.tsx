import React, { useState } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Switch, Card, Button, Space, Tag, Divider, InputNumber, Typography, Alert } from "antd";
import { ShopOutlined, ApiOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, TagOutlined } from "@ant-design/icons";
import { useOne, useUpdate, useNotification } from "@refinedev/core";
import { shopifyService } from "../../../services/shopifyService";
import { addShopifyExampleData } from "../../../services/shopifyExampleData";
import { addShopifyExampleCoupons } from "../../../services/shopifyExampleCoupons";

const { Title, Text, Paragraph } = Typography;

export const ShopifySettingsPage: React.FC = () => {
  const { mutate: update } = useUpdate();
  const { open } = useNotification();
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data, isLoading } = useOne({
    resource: "shopifySettings",
    id: "shop-001",
  });

  const { formProps, saveButtonProps, form } = useForm({
    resource: "shopifySettings",
    id: "shop-001",
    action: "edit",
    redirect: false,
    onMutationSuccess: () => {
      open({
        type: "success",
        message: "Configuración guardada",
        description: "La configuración de Shopify se ha actualizado correctamente",
      });
    },
  });

  const handleTestConnection = async () => {
    const values = form.getFieldsValue();
    
    if (!values.shopifyDomain || !values.accessToken) {
      open({
        type: "error",
        message: "Campos requeridos",
        description: "Por favor, complete el dominio de Shopify y el Access Token antes de probar la conexión",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Primero guardar la configuración actual
      await form.validateFields();
      await update({
        resource: "shopifySettings",
        id: "shop-001",
        values: form.getFieldsValue(),
      });

      // Luego probar la conexión
      const result = await shopifyService.testConnection();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "Error al probar la conexión",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      // Sincronizar todo
      open({
        type: "info",
        message: "Sincronización iniciada",
        description: "Sincronizando productos...",
      });
      await shopifyService.syncProducts();
      
      open({
        type: "info",
        message: "Progreso de sincronización",
        description: "Sincronizando clientes...",
      });
      await shopifyService.syncCustomers();
      
      open({
        type: "info",
        message: "Progreso de sincronización",
        description: "Sincronizando cupones...",
      });
      await shopifyService.syncCoupons();
      
      // Actualizar fecha de última sincronización
      await update({
        resource: "shopifySettings",
        id: "shop-001",
        values: {
          ...form.getFieldsValue(),
          lastSync: new Date().toISOString(),
        },
      });
      
      open({
        type: "success",
        message: "Sincronización completada",
        description: "Todos los datos se han sincronizado con Shopify",
      });
    } catch (error: any) {
      open({
        type: "error",
        message: "Error al sincronizar",
        description: error.message || "No se pudieron sincronizar todos los datos",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddExampleData = async () => {
    try {
      await addShopifyExampleData();
      open({
        type: "success",
        message: "Datos de ejemplo agregados",
        description: "Se han agregado datos de ejemplo para probar la integración",
      });
    } catch (error: any) {
      open({
        type: "error",
        message: "Error al agregar datos",
        description: error.message || "No se pudieron agregar los datos de ejemplo",
      });
    }
  };

  const handleAddExampleCoupons = async () => {
    try {
      await addShopifyExampleCoupons();
      open({
        type: "success",
        message: "Cupones de ejemplo agregados",
        description: "Se han agregado 5 cupones de ejemplo para probar la funcionalidad",
      });
    } catch (error: any) {
      open({
        type: "error",
        message: "Error al agregar cupones",
        description: error.message || "No se pudieron agregar los cupones de ejemplo",
      });
    }
  };

  return (
    <Edit
      isLoading={isLoading}
      saveButtonProps={saveButtonProps}
      title="Configuración de Shopify"
      headerProps={{
        extra: (
          <Space>
            <Button
              type="primary"
              icon={<ApiOutlined />}
              onClick={handleTestConnection}
              loading={isTesting}
            >
              Probar Conexión
            </Button>
          </Space>
        ),
      }}
    >
      <Form {...formProps} layout="vertical">
        <Card
          title={
            <Space>
              <ShopOutlined />
              <span>Información de la Tienda</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            label="Nombre de la Tienda"
            name="storeName"
            rules={[{ required: true, message: "El nombre de la tienda es requerido" }]}
          >
            <Input placeholder="Ej: LA Mattress Store" />
          </Form.Item>

          <Form.Item
            label="Dominio de Shopify"
            name="shopifyDomain"
            rules={[
              { required: true, message: "El dominio de Shopify es requerido" },
              { 
                pattern: /^[a-zA-Z0-9-]+\.myshopify\.com$/,
                message: "El dominio debe tener el formato: tu-tienda.myshopify.com"
              }
            ]}
            extra="Formato: tu-tienda.myshopify.com"
          >
            <Input placeholder="tu-tienda.myshopify.com" />
          </Form.Item>
        </Card>

        <Card
          title={
            <Space>
              <ApiOutlined />
              <span>Credenciales de API</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Alert
            message="Información importante"
            description="Para obtener estas credenciales, debe crear una App Privada en su panel de administración de Shopify."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: true, message: "La API Key es requerida" }]}
          >
            <Input.Password placeholder="Ingrese su API Key" />
          </Form.Item>

          <Form.Item
            label="API Secret Key"
            name="apiSecretKey"
            rules={[{ required: true, message: "La API Secret Key es requerida" }]}
          >
            <Input.Password placeholder="Ingrese su API Secret Key" />
          </Form.Item>

          <Form.Item
            label="Access Token"
            name="accessToken"
            rules={[{ required: true, message: "El Access Token es requerido" }]}
            extra="Token de acceso para la API Admin de Shopify"
          >
            <Input.Password placeholder="Ingrese su Access Token" />
          </Form.Item>

          <Form.Item
            label="Versión de API"
            name="webhookApiVersion"
            initialValue="2024-01"
          >
            <Input disabled />
          </Form.Item>
        </Card>

        <Card
          title={
            <Space>
              <SyncOutlined />
              <span>Configuración de Sincronización</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            label="Estado de la Integración"
            name="isActive"
            valuePropName="checked"
          >
            <Switch
              checkedChildren={<CheckCircleOutlined />}
              unCheckedChildren={<CloseCircleOutlined />}
            />
          </Form.Item>

          <Divider>Sincronización Automática</Divider>

          <Form.Item
            label="Sincronizar Productos"
            name={["syncSettings", "autoSyncProducts"]}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Sincronizar Clientes"
            name={["syncSettings", "autoSyncCustomers"]}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Sincronizar Órdenes"
            name={["syncSettings", "autoSyncOrders"]}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Intervalo de Sincronización (minutos)"
            name={["syncSettings", "syncInterval"]}
            rules={[
              { required: true, message: "El intervalo es requerido" },
              { type: "number", min: 5, message: "El intervalo mínimo es 5 minutos" }
            ]}
          >
            <InputNumber min={5} max={1440} style={{ width: "100%" }} />
          </Form.Item>
        </Card>

        {testResult && (
          <Alert
            message={testResult.success ? "Conexión Exitosa" : "Error de Conexión"}
            description={testResult.message}
            type={testResult.success ? "success" : "error"}
            showIcon
            closable
            onClose={() => setTestResult(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        {data?.data?.lastSync && (
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">
                Última sincronización: {new Date(data.data.lastSync).toLocaleString()}
              </Text>
              <Button 
                icon={<SyncOutlined spin={isSyncing} />} 
                onClick={handleSyncAll}
                loading={isSyncing}
              >
                Sincronizar Todo Ahora
              </Button>
            </Space>
          </Card>
        )}
        
        <Card style={{ marginTop: 16 }} title="Herramientas de Desarrollo">
          <Alert
            message="Datos de Ejemplo"
            description="Puedes agregar datos de ejemplo para probar la integración sin necesidad de conectar con Shopify."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Space>
            <Button 
              icon={<PlusOutlined />}
              onClick={handleAddExampleData}
            >
              Agregar Datos de Ejemplo
            </Button>
            <Button 
              icon={<TagOutlined />}
              onClick={handleAddExampleCoupons}
            >
              Agregar Cupones de Ejemplo
            </Button>
          </Space>
        </Card>
      </Form>
    </Edit>
  );
};
