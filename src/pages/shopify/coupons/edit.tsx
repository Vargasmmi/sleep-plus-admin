import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch, Card, Button, Alert, Space, DatePicker, InputNumber } from "antd";
import { ShopOutlined, TagOutlined } from "@ant-design/icons";
import { useShow } from "@refinedev/core";
import dayjs from "dayjs";

export const ShopifyCouponEdit: React.FC = () => {
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
            onClick={() => window.open(`https://tu-tienda.myshopify.com/admin/discounts/${record?.shopifyId}`, "_blank")}
          >
            Editar en Shopify
          </Button>
        ),
      }}
    >
      <Alert
        message="Edición limitada"
        description="Solo se pueden editar campos de seguimiento local. Para modificar el cupón (valor, código, etc.), use el panel de administración de Shopify."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form {...formProps} layout="vertical">
        <Card title="Seguimiento Local" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Nombre para Reportes"
            name="reportName"
            help="Nombre interno para identificar el cupón en reportes"
          >
            <Input placeholder="Ej: Descuento Verano 2024" />
          </Form.Item>

          <Form.Item
            label="Categoría de Campaña"
            name="campaignCategory"
          >
            <Select placeholder="Seleccione una categoría">
              <Select.Option value="seasonal">Temporada</Select.Option>
              <Select.Option value="clearance">Liquidación</Select.Option>
              <Select.Option value="loyalty">Fidelización</Select.Option>
              <Select.Option value="acquisition">Adquisición</Select.Option>
              <Select.Option value="retention">Retención</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Notas Internas"
            name="internalNotes"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Notas sobre el rendimiento del cupón, observaciones, etc."
            />
          </Form.Item>

          <Form.Item
            label="Objetivo de Uso"
            name="usageTarget"
            help="Meta de usos para este cupón"
          >
            <InputNumber 
              min={0} 
              style={{ width: "100%" }}
              placeholder="Ej: 100"
            />
          </Form.Item>
        </Card>

        <Card title="Alertas y Notificaciones" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Notificar cuando queden pocos usos"
            name="lowUsageAlert"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Umbral de alerta (%)"
            name="alertThreshold"
            help="Notificar cuando el uso alcance este porcentaje del límite"
          >
            <InputNumber 
              min={0} 
              max={100} 
              formatter={value => `${value}%`}
              parser={value => value!.replace('%', '')}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Notificar antes de expirar"
            name="expirationAlert"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Días antes de expiración"
            name="expirationAlertDays"
          >
            <InputNumber 
              min={1} 
              max={30}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Card>

        {record && (
          <Card title="Información de Shopify (Solo lectura)">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <strong>Código:</strong> 
                <TagOutlined style={{ marginLeft: 8, marginRight: 4 }} />
                {record.code}
              </div>
              <div>
                <strong>Tipo de Descuento:</strong> {
                  record.discountType === "percentage" ? `${record.value}% de descuento` :
                  record.discountType === "fixed_amount" ? `$${record.value} de descuento` :
                  "Envío gratuito"
                }
              </div>
              <div><strong>Usos:</strong> {record.usageCount} {record.usageLimit && `de ${record.usageLimit}`}</div>
              <div>
                <strong>Vigencia:</strong> 
                {record.startsAt && ` Desde ${dayjs(record.startsAt).format("DD/MM/YYYY")}`}
                {record.endsAt && ` hasta ${dayjs(record.endsAt).format("DD/MM/YYYY")}`}
                {!record.endsAt && " (Sin fecha de fin)"}
              </div>
              <div>
                <strong>Estado:</strong> 
                <span style={{ 
                  marginLeft: 8,
                  color: record.status === "active" ? "#52c41a" : 
                         record.status === "expired" ? "#f5222d" : "#8c8c8c"
                }}>
                  {record.status === "active" ? "Activo" : 
                   record.status === "expired" ? "Expirado" : "Desactivado"}
                </span>
              </div>
            </Space>
          </Card>
        )}
      </Form>
    </Edit>
  );
};
