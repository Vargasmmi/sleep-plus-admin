import React from "react";
import { Create } from "@refinedev/antd";
import { Alert, Button, Space } from "antd";
import { ShopOutlined } from "@ant-design/icons";

export const ShopifyCustomerCreate: React.FC = () => {
  return (
    <Create title="Crear Cliente">
      <Alert
        message="Crear clientes en Shopify"
        description="Los clientes deben crearse directamente en el panel de administración de Shopify para mantener la integridad de los datos."
        type="info"
        showIcon
        action={
          <Space direction="vertical">
            <Button 
              type="primary" 
              icon={<ShopOutlined />}
              onClick={() => window.open("https://tu-tienda.myshopify.com/admin/customers/new", "_blank")}
            >
              Ir a Shopify Admin
            </Button>
            <Button type="link" onClick={() => window.history.back()}>
              Volver
            </Button>
          </Space>
        }
      />
    </Create>
  );
};
