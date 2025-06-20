import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch, Card, Button, Alert, Space, Tag } from "antd";
import { ShopOutlined, PlusOutlined } from "@ant-design/icons";
import { useShow } from "@refinedev/core";

export const ShopifyCustomerEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();
  const { queryResult } = useShow();
  const record = queryResult?.data?.data;

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      title={`Editar: ${record?.firstName} ${record?.lastName}`}
      headerProps={{
        extra: (
          <Button
            icon={<ShopOutlined />}
            onClick={() => window.open(`https://tu-tienda.myshopify.com/admin/customers/${record?.shopifyId}`, "_blank")}
          >
            Editar en Shopify
          </Button>
        ),
      }}
    >
      <Alert
        message="Edición limitada"
        description="Solo se pueden editar campos locales y etiquetas. Para una edición completa, use el panel de administración de Shopify."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form {...formProps} layout="vertical">
        <Card title="Información Local" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Notas Internas"
            name="internalNotes"
            help="Estas notas son solo para uso interno y no se sincronizan con Shopify"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Agregar notas sobre este cliente..."
            />
          </Form.Item>

          <Form.Item
            label="Etiquetas Locales"
            name="localTags"
            help="Etiquetas adicionales para uso interno"
          >
            <Select
              mode="tags"
              placeholder="Agregar etiquetas..."
              style={{ width: '100%' }}
            >
              <Select.Option value="vip">VIP</Select.Option>
              <Select.Option value="problematico">Problemático</Select.Option>
              <Select.Option value="mayorista">Mayorista</Select.Option>
              <Select.Option value="frecuente">Comprador Frecuente</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Prioridad de Atención"
            name="priority"
          >
            <Select>
              <Select.Option value="low">Baja</Select.Option>
              <Select.Option value="normal">Normal</Select.Option>
              <Select.Option value="high">Alta</Select.Option>
              <Select.Option value="urgent">Urgente</Select.Option>
            </Select>
          </Form.Item>
        </Card>

        <Card title="Sincronización" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Sincronizar Automáticamente"
            name="autoSync"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Fusionar con Cliente Local"
            name="localCustomerId"
            help="Vincular este cliente de Shopify con un cliente existente en el sistema local"
          >
            <Select
              showSearch
              placeholder="Buscar cliente local..."
              optionFilterProp="children"
              allowClear
            >
              {/* Aquí se cargarían los clientes locales */}
            </Select>
          </Form.Item>
        </Card>

        {record && (
          <Card title="Información de Shopify (Solo lectura)">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <strong>Email:</strong> {record.email}
                {record.verifiedEmail && <Tag color="green" style={{ marginLeft: 8 }}>Verificado</Tag>}
              </div>
              <div><strong>Teléfono:</strong> {record.phone || "No registrado"}</div>
              <div><strong>Total Gastado:</strong> {record.currency} {record.totalSpent}</div>
              <div><strong>Número de Órdenes:</strong> {record.ordersCount}</div>
              <div>
                <strong>Estado:</strong>
                <Tag color={
                  record.state === "enabled" ? "green" : 
                  record.state === "disabled" ? "red" : 
                  record.state === "invited" ? "blue" : "orange"
                } style={{ marginLeft: 8 }}>
                  {record.state === "enabled" ? "Activo" : 
                   record.state === "disabled" ? "Desactivado" : 
                   record.state === "invited" ? "Invitado" : "Rechazado"}
                </Tag>
              </div>
            </Space>
          </Card>
        )}
      </Form>
    </Edit>
  );
};
