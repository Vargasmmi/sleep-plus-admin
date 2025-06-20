import React from "react";
import { Show } from "@refinedev/antd";
import { useShow, useOne, useMany } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Statistic,
  Descriptions,
  Table,
  Timeline,
  Alert,
  List,
  Progress,
  Divider,
} from "antd";
import {
  WalletOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ShoppingOutlined,
  PercentageOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ICommission, IEmployee, ISale } from "../../interfaces";

const { Title, Text } = Typography;

export const CommissionShow: React.FC = () => {
  const { queryResult } = useShow<ICommission>();
  const { data, isLoading } = queryResult;
  const commission = data?.data;

  const { data: employeeData } = useOne<IEmployee>({
    resource: "employees",
    id: commission?.userId || "",
    queryOptions: {
      enabled: !!commission?.userId,
    },
  });

  const { data: salesData } = useMany<ISale>({
    resource: "sales",
    ids: commission?.sales.saleIds || [],
    queryOptions: {
      enabled: !!commission?.sales.saleIds?.length,
    },
  });

  const { data: approverData } = useOne<IEmployee>({
    resource: "employees",
    id: commission?.approvedBy || "",
    queryOptions: {
      enabled: !!commission?.approvedBy,
    },
  });

  const employee = employeeData?.data;
  const sales = salesData?.data || [];
  const approver = approverData?.data;

  if (isLoading || !commission) {
    return <div>Cargando...</div>;
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "approved":
        return "processing";
      case "pending_approval":
        return "warning";
      case "calculating":
        return "default";
      default:
        return "default";
    }
  };

  const totalBonuses = 
    commission.earnings.bonuses.conversion +
    commission.earnings.bonuses.volume +
    commission.earnings.bonuses.retention +
    commission.earnings.bonuses.other;

  const bonusPercentage = (totalBonuses / commission.earnings.total) * 100;

  return (
    <Show>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
              <Space align="start">
                <WalletOutlined style={{ fontSize: 24 }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    Comisión - {monthNames[commission.period.month - 1]} {commission.period.year}
                  </Title>
                  <Space style={{ marginTop: 8 }}>
                    <Tag color={getStatusColor(commission.status)}>
                      {commission.status === "paid"
                        ? "Pagada"
                        : commission.status === "approved"
                        ? "Aprobada"
                        : commission.status === "pending_approval"
                        ? "Pendiente de aprobación"
                        : "Calculando"}
                    </Tag>
                    {employee && (
                      <Space>
                        <UserOutlined />
                        <a href={`/employees/show/${employee.id}`}>
                          {employee.firstName} {employee.lastName}
                        </a>
                      </Space>
                    )}
                  </Space>
                </div>
              </Space>
              <Statistic
                title="Total a Pagar"
                value={commission.earnings.total}
                prefix="$"
                precision={2}
                valueStyle={{ color: "#3f8600", fontSize: 24 }}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {/* Desglose de ganancias */}
          <Card title="Desglose de Ganancias">
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}>
                <Statistic
                  title="Ventas Base"
                  value={commission.earnings.baseSales}
                  prefix="$"
                  precision={2}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Bono por Conversión"
                  value={commission.earnings.bonuses.conversion}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Bono por Volumen"
                  value={commission.earnings.bonuses.volume}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Bono por Retención"
                  value={commission.earnings.bonuses.retention}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text>Total de Bonos</Text>
                  <Statistic
                    value={totalBonuses}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: "#3f8600" }}
                  />
                  <Progress
                    percent={bonusPercentage}
                    format={(percent) => `${percent?.toFixed(1)}% del total`}
                  />
                </Space>
              </Col>
              <Col span={8}>
                <Statistic
                  title="Deducciones"
                  value={commission.earnings.deductions}
                  prefix="-$"
                  precision={2}
                  valueStyle={{ color: commission.earnings.deductions > 0 ? "#cf1322" : undefined }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Final"
                  value={commission.earnings.total}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                />
              </Col>
            </Row>
          </Card>

          {/* Ventas del período */}
          <Card title="Ventas del Período" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Total de Ventas"
                    value={commission.sales.count}
                    prefix={<ShoppingOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Ingresos Generados"
                    value={commission.sales.revenue}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Ticket Promedio"
                    value={commission.sales.count > 0 ? commission.sales.revenue / commission.sales.count : 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
              </Row>
            </Space>

            <Table
              dataSource={sales}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: "Fecha",
                  dataIndex: "createdAt",
                  render: (value) => dayjs(value).format("DD/MM/YYYY"),
                },
                {
                  title: "Tipo",
                  dataIndex: "type",
                  render: (value) => (
                    <Tag color={
                      value === "new" ? "success" :
                      value === "renewal" ? "processing" :
                      value === "upgrade" ? "gold" : "purple"
                    }>
                      {value === "new" ? "Nueva" :
                       value === "renewal" ? "Renovación" :
                       value === "upgrade" ? "Mejora" : "Recuperación"}
                    </Tag>
                  ),
                },
                {
                  title: "Total",
                  dataIndex: ["amount", "total"],
                  render: (value) => `$${value.toFixed(2)}`,
                },
                {
                  title: "Comisión",
                  dataIndex: ["commission", "total"],
                  render: (value) => `$${value.toFixed(2)}`,
                },
                {
                  title: "Acciones",
                  render: (_, record) => (
                    <a href={`/sales/show/${record.id}`}>Ver venta</a>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Información del período */}
          <Card title="Información del Período">
            <Descriptions column={1}>
              <Descriptions.Item label="Período">
                {monthNames[commission.period.month - 1]} {commission.period.year}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de inicio">
                {dayjs(commission.period.startDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de fin">
                {dayjs(commission.period.endDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={getStatusColor(commission.status)}>
                  {commission.status === "paid"
                    ? "Pagada"
                    : commission.status === "approved"
                    ? "Aprobada"
                    : commission.status === "pending_approval"
                    ? "Pendiente de aprobación"
                    : "Calculando"}
                </Tag>
              </Descriptions.Item>
              {commission.paymentMethod && (
                <Descriptions.Item label="Método de pago">
                  {commission.paymentMethod === "payroll"
                    ? "Nómina"
                    : commission.paymentMethod === "direct_deposit"
                    ? "Depósito directo"
                    : "Cheque"}
                </Descriptions.Item>
              )}
              {commission.paidAt && (
                <Descriptions.Item label="Fecha de pago">
                  {dayjs(commission.paidAt).format("DD/MM/YYYY")}
                </Descriptions.Item>
              )}
              {approver && (
                <Descriptions.Item label="Aprobado por">
                  <a href={`/employees/show/${approver.id}`}>
                    {approver.firstName} {approver.lastName}
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Notas */}
          {commission.notes && (
            <Card title="Notas" style={{ marginTop: 16 }}>
              <Text>{commission.notes}</Text>
            </Card>
          )}

          {/* Timeline */}
          <Card title="Línea de Tiempo" style={{ marginTop: 16 }}>
            <Timeline>
              <Timeline.Item
                dot={<CalendarOutlined style={{ fontSize: "16px" }} />}
                color="blue"
              >
                <Text type="secondary">
                  {dayjs(commission.createdAt).format("DD/MM/YYYY")}
                </Text>
                <br />
                Período iniciado
              </Timeline.Item>

              <Timeline.Item>
                <Text type="secondary">
                  {dayjs(commission.period.endDate).format("DD/MM/YYYY")}
                </Text>
                <br />
                Período finalizado
              </Timeline.Item>

              {commission.status !== "calculating" && (
                <Timeline.Item
                  dot={<PercentageOutlined style={{ fontSize: "16px" }} />}
                >
                  <Text type="secondary">
                    {dayjs(commission.updatedAt).format("DD/MM/YYYY")}
                  </Text>
                  <br />
                  Comisión calculada
                </Timeline.Item>
              )}

              {commission.status === "approved" && (
                <Timeline.Item
                  dot={<CheckCircleOutlined style={{ fontSize: "16px" }} />}
                  color="green"
                >
                  Comisión aprobada
                  {approver && (
                    <>
                      <br />
                      <Text type="secondary">
                        Por {approver.firstName} {approver.lastName}
                      </Text>
                    </>
                  )}
                </Timeline.Item>
              )}

              {commission.status === "paid" && commission.paidAt && (
                <Timeline.Item
                  dot={<DollarOutlined style={{ fontSize: "16px" }} />}
                  color="green"
                >
                  <Text type="secondary">
                    {dayjs(commission.paidAt).format("DD/MM/YYYY")}
                  </Text>
                  <br />
                  Pago realizado
                </Timeline.Item>
              )}
            </Timeline>
          </Card>

          {/* Métricas de rendimiento */}
          <Card title="Métricas de Rendimiento" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Statistic
                title="Comisión promedio por venta"
                value={commission.sales.count > 0 ? commission.earnings.total / commission.sales.count : 0}
                prefix="$"
                precision={2}
              />
              
              <Statistic
                title="Tasa de comisión"
                value={commission.sales.revenue > 0 ? (commission.earnings.total / commission.sales.revenue) * 100 : 0}
                suffix="%"
                precision={2}
              />

              {bonusPercentage > 0 && (
                <Alert
                  message={`Los bonos representan el ${bonusPercentage.toFixed(1)}% de tus ganancias totales`}
                  type="success"
                  icon={<TrophyOutlined />}
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
