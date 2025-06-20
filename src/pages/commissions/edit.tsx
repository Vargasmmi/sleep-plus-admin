import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, DatePicker, Row, Col, Card } from "antd";
import type { ICommission, IEmployee } from "../../interfaces";
import dayjs from "dayjs";

export const CommissionEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<ICommission>();

  const { selectProps: employeeSelectProps } = useSelect<IEmployee>({
    resource: "employees",
    optionLabel: (item) => `${item.firstName} ${item.lastName} (${item.employeeId})`,
    optionValue: "id",
  });

  const { selectProps: approverSelectProps } = useSelect<IEmployee>({
    resource: "employees",
    optionLabel: (item) => `${item.firstName} ${item.lastName}`,
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "in",
        value: ["admin", "manager"],
      },
    ],
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form 
        {...formProps} 
        layout="vertical"
        onFinish={(values) => {
          const processedValues = {
            ...values,
            period: {
              ...values.period,
              startDate: values.period.startDate?.format('YYYY-MM-DD'),
              endDate: values.period.endDate?.format('YYYY-MM-DD'),
            },
            paidAt: values.paidAt?.format('YYYY-MM-DD HH:mm:ss'),
          };
          return formProps.onFinish?.(processedValues);
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Información General" bordered={false}>
              <Form.Item
                label="Empleado"
                name="userId"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Select
                  {...employeeSelectProps}
                  showSearch
                  placeholder="Seleccionar empleado"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Card title="Período" bordered={false} type="inner">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Mes"
                      name={["period", "month"]}
                      rules={[{ required: true, message: "Este campo es requerido" }]}
                    >
                      <Select
                        options={[
                          { value: 1, label: "Enero" },
                          { value: 2, label: "Febrero" },
                          { value: 3, label: "Marzo" },
                          { value: 4, label: "Abril" },
                          { value: 5, label: "Mayo" },
                          { value: 6, label: "Junio" },
                          { value: 7, label: "Julio" },
                          { value: 8, label: "Agosto" },
                          { value: 9, label: "Septiembre" },
                          { value: 10, label: "Octubre" },
                          { value: 11, label: "Noviembre" },
                          { value: 12, label: "Diciembre" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Año"
                      name={["period", "year"]}
                      rules={[{ required: true, message: "Este campo es requerido" }]}
                    >
                      <InputNumber
                        min={2020}
                        max={2030}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Fecha de Inicio"
                      name={["period", "startDate"]}
                      rules={[{ required: true, message: "Este campo es requerido" }]}
                      getValueProps={(value) => ({
                        value: value ? dayjs(value) : undefined,
                      })}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Fecha de Fin"
                      name={["period", "endDate"]}
                      rules={[{ required: true, message: "Este campo es requerido" }]}
                      getValueProps={(value) => ({
                        value: value ? dayjs(value) : undefined,
                      })}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <Select
                  options={[
                    { value: "calculating", label: "Calculando" },
                    { value: "pending_approval", label: "Pendiente de Aprobación" },
                    { value: "approved", label: "Aprobado" },
                    { value: "paid", label: "Pagado" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Aprobado por"
                name="approvedBy"
              >
                <Select
                  {...approverSelectProps}
                  placeholder="Seleccionar aprobador"
                  allowClear
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Fecha de Pago"
                    name="paidAt"
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
                    label="Método de Pago"
                    name="paymentMethod"
                  >
                    <Select
                      placeholder="Seleccionar método"
                      options={[
                        { value: "payroll", label: "Nómina" },
                        { value: "direct_deposit", label: "Depósito Directo" },
                        { value: "check", label: "Cheque" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Notas"
                name="notes"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Notas sobre esta comisión..."
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Ganancias" bordered={false}>
              <Form.Item
                label="Ventas Base"
                name={["earnings", "baseSales"]}
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

              <Card title="Bonos" bordered={false} type="inner">
                <Form.Item
                  label="Bono de Conversión"
                  name={["earnings", "bonuses", "conversion"]}
                >
                  <InputNumber
                    min={0}
                    prefix="$"
                    style={{ width: "100%" }}
                    placeholder="0.00"
                    precision={2}
                  />
                </Form.Item>

                <Form.Item
                  label="Bono de Volumen"
                  name={["earnings", "bonuses", "volume"]}
                >
                  <InputNumber
                    min={0}
                    prefix="$"
                    style={{ width: "100%" }}
                    placeholder="0.00"
                    precision={2}
                  />
                </Form.Item>

                <Form.Item
                  label="Bono de Retención"
                  name={["earnings", "bonuses", "retention"]}
                >
                  <InputNumber
                    min={0}
                    prefix="$"
                    style={{ width: "100%" }}
                    placeholder="0.00"
                    precision={2}
                  />
                </Form.Item>

                <Form.Item
                  label="Otros Bonos"
                  name={["earnings", "bonuses", "other"]}
                >
                  <InputNumber
                    min={0}
                    prefix="$"
                    style={{ width: "100%" }}
                    placeholder="0.00"
                    precision={2}
                  />
                </Form.Item>
              </Card>

              <Form.Item
                label="Deducciones"
                name={["earnings", "deductions"]}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Total"
                name={["earnings", "total"]}
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
            </Card>

            <Card title="Ventas" bordered={false} style={{ marginTop: 16 }}>
              <Form.Item
                label="Cantidad de Ventas"
                name={["sales", "count"]}
                rules={[{ required: true, message: "Este campo es requerido" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Form.Item>

              <Form.Item
                label="Ingresos Totales"
                name={["sales", "revenue"]}
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

              <Form.Item
                label="IDs de Ventas"
                name={["sales", "saleIds"]}
              >
                <Select
                  mode="tags"
                  placeholder="Agregar IDs de ventas"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
