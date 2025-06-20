import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, DatePicker, Row, Col, Card, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { IEvaluation, ICustomer, IEmployee, IStore } from "../../interfaces";
import dayjs from "dayjs";

export const EvaluationEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IEvaluation>();

  const { selectProps: customerSelectProps } = useSelect<ICustomer>({
    resource: "customers",
    optionLabel: (item) => `${item.firstName} ${item.lastName} - ${item.phone}`,
    optionValue: "id",
  });

  const { selectProps: employeeSelectProps } = useSelect<IEmployee>({
    resource: "employees",
    optionLabel: (item) => `${item.firstName} ${item.lastName}`,
    optionValue: "id",
  });

  const { selectProps: storeSelectProps } = useSelect<IStore>({
    resource: "stores",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form 
        {...formProps} 
        layout="vertical"
        onFinish={(values) => {
          const processedValues = {
            ...values,
            expiresAt: values.expiresAt?.format('YYYY-MM-DD HH:mm:ss'),
            redeemedAt: values.redeemedAt?.format('YYYY-MM-DD HH:mm:ss'),
          };
          return formProps.onFinish?.(processedValues);
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información General" bordered={false}>
              <Form.Item
                label="Cliente"
                name="customerId"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Select
                  {...customerSelectProps}
                  showSearch
                  placeholder="Buscar cliente..."
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Empleado"
                    name="employeeId"
                  >
                    <Select
                      {...employeeSelectProps}
                      placeholder="Seleccionar empleado"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tienda"
                    name="storeId"
                  >
                    <Select
                      {...storeSelectProps}
                      placeholder="Seleccionar tienda"
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Select
                  options={[
                    { value: "pending", label: "Pendiente" },
                    { value: "approved", label: "Aprobado" },
                    { value: "redeemed", label: "Canjeado" },
                    { value: "expired", label: "Expirado" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Crédito Aprobado"
                name="creditApproved"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Fecha de Expiración"
                    name="expiresAt"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : undefined,
                    })}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Fecha de Canje"
                    name="redeemedAt"
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : undefined,
                    })}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Información del Colchón" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Marca"
                name={["mattress", "brand"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Input placeholder="Sealy, Tempur-Pedic, etc." />
              </Form.Item>

              <Form.Item
                label="Modelo"
                name={["mattress", "model"]}
              >
                <Input placeholder="Modelo del colchón" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tamaño"
                    name={["mattress", "size"]}
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Select
                      options={[
                        { value: "twin", label: "Twin" },
                        { value: "twin_xl", label: "Twin XL" },
                        { value: "full", label: "Full" },
                        { value: "queen", label: "Queen" },
                        { value: "king", label: "King" },
                        { value: "california_king", label: "California King" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Edad (años)"
                    name={["mattress", "age"]}
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <InputNumber
                      min={0}
                      max={50}
                      style={{ width: "100%" }}
                      placeholder="5"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Condición"
                name={["mattress", "condition"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Select
                  options={[
                    { value: "excellent", label: "Excelente" },
                    { value: "good", label: "Buena" },
                    { value: "fair", label: "Regular" },
                    { value: "poor", label: "Mala" },
                  ]}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Evaluación de IA" bordered={false}>
              <Form.Item
                label="Puntuación de Condición"
                name={["aiEvaluation", "conditionScore"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="85"
                />
              </Form.Item>

              <Form.Item
                label="Puntuación de Marca"
                name={["aiEvaluation", "brandScore"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="90"
                />
              </Form.Item>

              <Form.Item
                label="Puntuación de Edad"
                name={["aiEvaluation", "ageScore"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="75"
                />
              </Form.Item>

              <Form.Item
                label="Puntuación de Tamaño"
                name={["aiEvaluation", "sizeScore"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="100"
                />
              </Form.Item>

              <Form.Item
                label="Puntuación Final"
                name={["aiEvaluation", "finalScore"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="88"
                />
              </Form.Item>

              <Form.Item
                label="Confianza (%)"
                name={["aiEvaluation", "confidence"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="95"
                  formatter={(value) => `${value}%`}
                  parser={(value) => Number(value?.replace('%', ''))}
                />
              </Form.Item>
            </Card>

            <Card title="Fotos" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Fotos del Colchón"
                name="photos"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <Upload
                  listType="picture-card"
                  multiple
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Subir Foto</Button>
                </Upload>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
