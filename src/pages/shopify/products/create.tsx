import React from "react";
import { Create } from "@refinedev/antd";
import { Alert, Button, Space } from "antd";
import { ShopOutlined } from "@ant-design/icons";

export const ShopifyProductCreate: React.FC = () => {
  return (
    <Create title="Crear Producto">
      <Alert
        message="Crear productos en Shopify"
        description="Los productos deben crearse directamente en el panel de administración de Shopify para mantener la integridad de los datos."
        type="info"
        showIcon
        action={
          <Space direction="vertical">
            <Button 
              type="primary" 
              icon={<ShopOutlined />}
              onClick={() => window.open("https://tu-tienda.myshopify.com/admin/products/new", "_blank")}
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
