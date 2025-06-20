import React, { useState } from "react";
import { List, useTable, ShowButton, EditButton, DateField, CreateButton } from "@refinedev/antd";
import { Table, Space, Tag, Button, Typography, Progress, Tooltip, Badge } from "antd";
import { TagOutlined, SyncOutlined, CopyOutlined, PercentageOutlined, DollarOutlined, GiftOutlined, PlusOutlined } from "@ant-design/icons";
import { useNotification, useInvalidate } from "@refinedev/core";
import { shopifyService } from "../../../services/shopifyService";

const { Text } = Typography;

interface IShopifyCoupon {
  id: string;
  shopifyId: string;
  title: string;
  code: string;
  status: "active" | "expired" | "disabled";
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  value: string;
  appliesTo: "all_products" | "specific_products" | "specific_collections";
  minimumRequirement: {
    type: "none" | "minimum_amount" | "minimum_quantity";
    value: number;
  };
  customerEligibility: "all" | "specific_customers" | "customer_groups";
  usageLimit: number | null;
  oncePerCustomer: boolean;
  usageCount: number;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  targetSelection: string[];
  targetType: string;
}

export const ShopifyCouponList: React.FC = () => {
  const { tableProps } = useTable<IShopifyCoupon>({
    resource: "shopifyCoupons",
    sorters: {
      initial: [{ field: "createdAt", order: "desc" }],
    },
  });

  const { open } = useNotification();
  const invalidate = useInvalidate();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      await shopifyService.syncCoupons();
      open({
        type: "success",
        message: "Sincronización completada",
        description: "Los cupones se han sincronizado con Shopify",
      });
      // Refrescar la tabla
      invalidate({
        resource: "shopifyCoupons",
        invalidates: ["list"],
      });
    } catch (error: any) {
      open({
        type: "error",
        message: "Error al sincronizar",
        description: error.message || "No se pudieron sincronizar los cupones",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    open({
      type: "success",
      message: "Código copiado",
      description: `El código ${code} se ha copiado al portapapeles`,
    });
  };

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <PercentageOutlined />;
      case "fixed_amount":
        return <DollarOutlined />;
      case "free_shipping":
        return <GiftOutlined />;
      default:
        return <TagOutlined />;
    }
  };

  const columns = [
    {
      title: "Cupón",
      key: "coupon",
      render: (_: any, record: IShopifyCoupon) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.title}</Text>
          <Space size={4}>
            <Tag 
              color="blue" 
              style={{ cursor: "pointer" }}
              onClick={() => handleCopyCode(record.code)}
            >
              <CopyOutlined /> {record.code}
            </Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: "Tipo",
      key: "type",
      width: 150,
      render: (_: any, record: IShopifyCoupon) => (
        <Space>
          {getDiscountIcon(record.discountType)}
          <Text>
            {record.discountType === "percentage" 
              ? `${record.value}%`
              : record.discountType === "fixed_amount"
              ? `$${record.value}`
              : "Envío Gratis"}
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
        const config: Record<string, { color: string; text: string }> = {
          active: { color: "green", text: "Activo" },
          expired: { color: "red", text: "Expirado" },
          disabled: { color: "default", text: "Desactivado" },
        };
        return <Tag color={config[value]?.color}>{config[value]?.text}</Tag>;
      },
    },
    {
      title: "Uso",
      key: "usage",
      width: 150,
      render: (_: any, record: IShopifyCoupon) => {
        if (!record.usageLimit) {
          return (
            <Space direction="vertical" size={0}>
              <Text>{record.usageCount} usos</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>Sin límite</Text>
            </Space>
          );
        }
        const percentage = (record.usageCount / record.usageLimit) * 100;
        return (
          <Tooltip title={`${record.usageCount} de ${record.usageLimit} usos`}>
            <div style={{ width: 100 }}>
              <Progress 
                percent={percentage} 
                size="small" 
                status={percentage >= 90 ? "exception" : "active"}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.usageCount}/{record.usageLimit}
              </Text>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Aplica a",
      dataIndex: "appliesTo",
      key: "appliesTo",
      width: 150,
      render: (value: string) => {
        const labels: Record<string, string> = {
          all_products: "Todos los productos",
          specific_products: "Productos específicos",
          specific_collections: "Colecciones específicas",
        };
        return <Text>{labels[value]}</Text>;
      },
    },
    {
      title: "Requisito",
      key: "requirement",
      width: 150,
      render: (_: any, record: IShopifyCoupon) => {
        if (record.minimumRequirement.type === "none") return "-";
        if (record.minimumRequirement.type === "minimum_amount") {
          return <Text>Mínimo ${record.minimumRequirement.value}</Text>;
        }
        return <Text>Mínimo {record.minimumRequirement.value} items</Text>;
      },
    },
    {
      title: "Vigencia",
      key: "validity",
      width: 200,
      render: (_: any, record: IShopifyCoupon) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Desde: <DateField value={record.startsAt} format="DD/MM/YYYY" />
          </Text>
          {record.endsAt && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hasta: <DateField value={record.endsAt} format="DD/MM/YYYY" />
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: any, record: IShopifyCoupon) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          <EditButton hideText size="small" recordItemId={record.id} />
          <Button
            size="small"
            icon={<TagOutlined />}
            onClick={() => window.open(`https://tu-tienda.myshopify.com/admin/discounts/${record.shopifyId}`, "_blank")}
          />
        </Space>
      ),
    },
  ];

  return (
    <List
      title="Cupones de Shopify"
      headerProps={{
        extra: (
          <Space>
            <CreateButton />
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
        scroll={{ x: 1400 }}
        expandable={{
          expandedRowRender: (record: IShopifyCoupon) => (
            <div style={{ padding: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Elegibilidad de Cliente:</Text>
                  <Text> {
                    record.customerEligibility === "all" ? "Todos los clientes" :
                    record.customerEligibility === "specific_customers" ? "Clientes específicos" :
                    "Grupos de clientes"
                  }</Text>
                </div>
                {record.oncePerCustomer && (
                  <div>
                    <Badge status="warning" text="Una vez por cliente" />
                  </div>
                )}
                {record.targetSelection && record.targetSelection.length > 0 && (
                  <div>
                    <Text strong>Productos/Colecciones objetivo:</Text>
                    <div style={{ marginTop: 8 }}>
                      {record.targetSelection.map((target, index) => (
                        <Tag key={index} style={{ marginBottom: 4 }}>{target}</Tag>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Space>
                    <Text strong>ID de Shopify:</Text>
                    <Text copyable>{record.shopifyId}</Text>
                  </Space>
                </div>
                <div>
                  <Space>
                    <Text strong>Creado:</Text>
                    <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />
                  </Space>
                </div>
              </Space>
            </div>
          ),
        }}
      />
    </List>
  );
};
