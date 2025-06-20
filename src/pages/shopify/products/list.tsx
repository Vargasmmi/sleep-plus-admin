import React, { useState } from "react";
import { List, useTable, EditButton, ShowButton, DeleteButton, TextField, DateField } from "@refinedev/antd";
import { Table, Space, Tag, Button, Image, Typography, InputNumber, message } from "antd";
import { ShoppingOutlined, SyncOutlined, EditOutlined } from "@ant-design/icons";
import { useNotification, useInvalidate } from "@refinedev/core";
import { shopifyService } from "../../../services/shopifyService";

const { Text } = Typography;

interface IShopifyProduct {
  id: string;
  shopifyId: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  status: "active" | "draft" | "archived";
  tags: string[];
  images: Array<{
    id: string;
    src: string;
    alt: string;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    compareAtPrice: string;
    sku: string;
    inventoryQuantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export const ShopifyProductList: React.FC = () => {
  const { tableProps } = useTable<IShopifyProduct>({
    resource: "shopifyProducts",
    sorters: {
      initial: [{ field: "updatedAt", order: "desc" }],
    },
  });

  const { open } = useNotification();
  const invalidate = useInvalidate();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      await shopifyService.syncProducts();
      open({
        type: "success",
        message: "Sincronización completada",
        description: "Los productos se han sincronizado con Shopify",
      });
      // Refrescar la tabla
      invalidate({
        resource: "shopifyProducts",
        invalidates: ["list"],
      });
    } catch (error: any) {
      open({
        type: "error",
        message: "Error al sincronizar",
        description: error.message || "No se pudieron sincronizar los productos",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleQuickPriceUpdate = (productId: string, variantId: string, newPrice: number) => {
    message.success(`Precio actualizado a $${newPrice.toFixed(2)}`);
  };

  const columns = [
    {
      title: "Imagen",
      dataIndex: ["images"],
      key: "images",
      width: 80,
      render: (images: any[]) => (
        images && images.length > 0 ? (
          <Image
            src={images[0].src}
            alt={images[0].alt}
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: 4 }}
            preview={false}
          />
        ) : (
          <div style={{ width: 60, height: 60, backgroundColor: "#f0f0f0", borderRadius: 4 }} />
        )
      ),
    },
    {
      title: "Producto",
      dataIndex: "title",
      key: "title",
      render: (value: string, record: IShopifyProduct) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            SKU: {record.variants?.[0]?.sku || "N/A"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: string) => {
        const colors: Record<string, string> = {
          active: "green",
          draft: "orange",
          archived: "red",
        };
        return (
          <Tag color={colors[value]}>
            {value === "active" ? "Activo" : value === "draft" ? "Borrador" : "Archivado"}
          </Tag>
        );
      },
    },
    {
      title: "Tipo",
      dataIndex: "productType",
      key: "productType",
      width: 150,
    },
    {
      title: "Precio",
      dataIndex: ["variants"],
      key: "price",
      width: 150,
      render: (variants: any[]) => {
        if (!variants || variants.length === 0) return "N/A";
        const variant = variants[0];
        return (
          <Space direction="vertical" size={0}>
            <Text strong>${variant.price}</Text>
            {variant.compareAtPrice && (
              <Text delete type="secondary" style={{ fontSize: 12 }}>
                ${variant.compareAtPrice}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Inventario",
      dataIndex: ["variants"],
      key: "inventory",
      width: 100,
      render: (variants: any[]) => {
        if (!variants || variants.length === 0) return "N/A";
        const totalInventory = variants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);
        return (
          <Tag color={totalInventory > 10 ? "green" : totalInventory > 0 ? "orange" : "red"}>
            {totalInventory}
          </Tag>
        );
      },
    },
    {
      title: "Variantes",
      dataIndex: ["variants"],
      key: "variantsCount",
      width: 100,
      align: "center",
      render: (variants: any[]) => variants?.length || 0,
    },
    {
      title: "Actualizado",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (value: string) => <DateField value={value} format="DD/MM/YYYY HH:mm" />,
    },
    {
      title: "Acciones",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: any, record: IShopifyProduct) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          <EditButton hideText size="small" recordItemId={record.id} />
          <Button
            size="small"
            icon={<ShoppingOutlined />}
            onClick={() => window.open(`https://tu-tienda.myshopify.com/admin/products/${record.shopifyId}`, "_blank")}
          />
        </Space>
      ),
    },
  ];

  return (
    <List
      title="Productos de Shopify"
      headerProps={{
        extra: (
          <Space>
            <Button
              type="primary"
              icon={<SyncOutlined spin={syncLoading} />}
              onClick={handleSync}
              loading={syncLoading}
            >
              Sincronizar con Shopify
            </Button>
          </Space>
        ),
      }}
    >
      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1200 }}
        expandable={{
          expandedRowRender: (record: IShopifyProduct) => (
            <div style={{ padding: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Descripción:</Text>
                  <div dangerouslySetInnerHTML={{ __html: record.description || "Sin descripción" }} />
                </div>
                {record.variants && record.variants.length > 1 && (
                  <div>
                    <Text strong>Variantes:</Text>
                    <Table
                      size="small"
                      pagination={false}
                      dataSource={record.variants}
                      columns={[
                        { title: "Variante", dataIndex: "title", key: "title" },
                        { title: "SKU", dataIndex: "sku", key: "sku" },
                        {
                          title: "Precio",
                          dataIndex: "price",
                          key: "price",
                          render: (price: string, variant: any) => (
                            <InputNumber
                              size="small"
                              prefix="$"
                              defaultValue={parseFloat(price)}
                              min={0}
                              precision={2}
                              onPressEnter={(e: any) => 
                                handleQuickPriceUpdate(record.id, variant.id, e.target.value)
                              }
                            />
                          ),
                        },
                        {
                          title: "Inventario",
                          dataIndex: "inventoryQuantity",
                          key: "inventoryQuantity",
                          render: (value: number) => (
                            <Tag color={value > 10 ? "green" : value > 0 ? "orange" : "red"}>
                              {value}
                            </Tag>
                          ),
                        },
                      ]}
                    />
                  </div>
                )}
                {record.tags && record.tags.length > 0 && (
                  <div>
                    <Text strong>Etiquetas:</Text>
                    <Space wrap>
                      {record.tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                    </Space>
                  </div>
                )}
              </Space>
            </div>
          ),
        }}
      />
    </List>
  );
};
