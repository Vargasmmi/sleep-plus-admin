import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, Space, Card, Button, Alert } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { useShow } from "@refinedev/core";

export const ShopifyProductEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();
  const { queryResult } = useShow();
  const record = queryResult?.data?.data;

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      title={`Editar: ${record?.title || ""}`}
      headerProps={{
        extra: (
          <Button
            icon={<ShopOutlined />}
            onClick={() => window.open(`https://tu-tienda.myshopify.com/admin/products/${record?.shopifyId}`, "_blank")}
          >
            Editar en Shopify
          </Button>
        ),
      }}
    >
      <Alert
        message="Edición limitada"
        description="Solo se pueden editar algunos campos locales. Para una edición completa, use el panel de administración de Shopify."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form {...formProps} layout="vertical">
        <Card title="Información Básica" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Título"
            name="title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Estado Local"
            name="status"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="active">Activo</Select.Option>
              <Select.Option value="draft">Borrador</Select.Option>
              <Select.Option value="archived">Archivado</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Notas Internas"
            name="internalNotes"
          >
            <Input.TextArea rows={4} placeholder="Notas para uso interno del equipo" />
          </Form.Item>
        </Card>

        <Card title="Configuración de Sincronización">
          <Form.Item
            label="Sincronizar Automáticamente"
            name="autoSync"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Prioridad de Sincronización"
            name="syncPriority"
          >
            <InputNumber min={1} max={10} />
          </Form.Item>
        </Card>
      </Form>
    </Edit>
  );
};
