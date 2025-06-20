import React from "react";
import { Show, TextField, DateField, TagField, NumberField } from "@refinedev/antd";
import { Card, Descriptions, Space, Tag, Image, Table, Typography, Divider, Row, Col } from "antd";
import { useShow } from "@refinedev/core";

const { Title, Text } = Typography;

export const ShopifyProductShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading} title={`Producto: ${record?.title || ""}`}>
      {record && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              {record.images?.length > 0 && (
                <Card>
                  <Image.PreviewGroup>
                    {record.images.map((img: any, index: number) => (
                      <Image
                        key={img.id}
                        src={img.src}
                        alt={img.alt}
                        style={{ 
                          marginBottom: 8, 
                          width: "100%",
                          display: index === 0 ? "block" : "none"
                        }}
                      />
                    ))}
                  </Image.PreviewGroup>
                  {record.images.length > 1 && (
                    <Space wrap style={{ marginTop: 8 }}>
                      {record.images.map((img: any, index: number) => (
                        <Image
                          key={img.id}
                          src={img.src}
                          alt={img.alt}
                          width={60}
                          height={60}
                          style={{ objectFit: "cover", cursor: "pointer" }}
                          preview={false}
                        />
                      ))}
                    </Space>
                  )}
                </Card>
              )}
            </Col>
            
            <Col xs={24} md={16}>
              <Card>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="ID de Shopify">
                    {record.shopifyId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Handle">
                    {record.handle}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vendedor">
                    {record.vendor}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tipo de Producto">
                    {record.productType}
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado">
                    <Tag color={
                      record.status === "active" ? "green" : 
                      record.status === "draft" ? "orange" : "red"
                    }>
                      {record.status === "active" ? "Activo" : 
                       record.status === "draft" ? "Borrador" : "Archivado"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Publicado">
                    <DateField value={record.publishedAt} format="DD/MM/YYYY HH:mm" />
                  </Descriptions.Item>
                  <Descriptions.Item label="Creado">
                    <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />
                  </Descriptions.Item>
                  <Descriptions.Item label="Actualizado">
                    <DateField value={record.updatedAt} format="DD/MM/YYYY HH:mm" />
                  </Descriptions.Item>
                </Descriptions>

                <Divider>Descripción</Divider>
                <div dangerouslySetInnerHTML={{ __html: record.description || "Sin descripción" }} />

                {record.tags?.length > 0 && (
                  <>
                    <Divider>Etiquetas</Divider>
                    <Space wrap>
                      {record.tags.map((tag: string, index: number) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                    </Space>
                  </>
                )}
              </Card>
            </Col>
          </Row>

          <Card style={{ marginTop: 16 }} title="Variantes">
            <Table
              dataSource={record.variants}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: "Variante",
                  dataIndex: "title",
                  key: "title",
                },
                {
                  title: "SKU",
                  dataIndex: "sku",
                  key: "sku",
                },
                {
                  title: "Precio",
                  dataIndex: "price",
                  key: "price",
                  render: (value: string) => `$${value}`,
                },
                {
                  title: "Precio Comparación",
                  dataIndex: "compareAtPrice",
                  key: "compareAtPrice",
                  render: (value: string) => value ? `$${value}` : "-",
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
                {
                  title: "ID de Variante",
                  dataIndex: "id",
                  key: "id",
                },
              ]}
            />
          </Card>
        </>
      )}
    </Show>
  );
};
