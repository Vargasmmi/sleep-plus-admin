import React from "react";
import { Show } from "@refinedev/antd";
import { useShow, useOne } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Timeline,
  Alert,
  Descriptions,
  Button,
  List,
} from "antd";
import {
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
  AudioOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import type { ICall, ICustomer, IEmployee } from "../../interfaces";

dayjs.extend(duration);

const { Title, Text, Paragraph } = Typography;

export const CallShow: React.FC = () => {
  const { queryResult } = useShow<ICall>();
  const { data, isLoading } = queryResult;
  const call = data?.data;

  const { data: customerData } = useOne<ICustomer>({
    resource: "customers",
    id: call?.customerId || "",
    queryOptions: {
      enabled: !!call?.customerId,
    },
  });

  const { data: employeeData } = useOne<IEmployee>({
    resource: "employees",
    id: call?.userId || "",
    queryOptions: {
      enabled: !!call?.userId,
    },
  });

  const customer = customerData?.data;
  const employee = employeeData?.data;

  if (isLoading || !call) {
    return <div>Cargando...</div>;
  }

  const formatDuration = (seconds: number) => {
    const dur = dayjs.duration(seconds, "seconds");
    if (seconds < 60) {
      return `${seconds} segundos`;
    } else if (seconds < 3600) {
      return `${dur.minutes()} minutos ${dur.seconds()} segundos`;
    } else {
      return `${dur.hours()} horas ${dur.minutes()} minutos`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "no_answer":
        return "warning";
      case "busy":
      case "failed":
        return "error";
      case "voicemail":
        return "processing";
      default:
        return "default";
    }
  };

  const getDispositionColor = (disposition: string) => {
    switch (disposition) {
      case "sale":
        return "success";
      case "interested":
        return "processing";
      case "callback":
        return "warning";
      case "not_interested":
        return "error";
      case "wrong_number":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Show>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Space align="start">
                  <PhoneOutlined style={{ fontSize: 24 }} />
                  <div>
                    <Title level={3} style={{ margin: 0 }}>
                      Llamada {call.type === "outbound" ? "Saliente" : "Entrante"}
                    </Title>
                    <Space>
                      <Tag color={getStatusColor(call.status)}>
                        {call.status === "completed"
                          ? "Completada"
                          : call.status === "no_answer"
                          ? "Sin respuesta"
                          : call.status === "busy"
                          ? "Ocupado"
                          : call.status === "failed"
                          ? "Fallida"
                          : call.status === "voicemail"
                          ? "Buzón de voz"
                          : call.status}
                      </Tag>
                      <Tag color={getDispositionColor(call.disposition)}>
                        {call.disposition === "sale"
                          ? "Venta"
                          : call.disposition === "interested"
                          ? "Interesado"
                          : call.disposition === "callback"
                          ? "Llamar después"
                          : call.disposition === "not_interested"
                          ? "No interesado"
                          : call.disposition === "wrong_number"
                          ? "Número equivocado"
                          : call.disposition}
                      </Tag>
                    </Space>
                  </div>
                </Space>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="Cliente" span={1}>
                  <Space>
                    <UserOutlined />
                    {customer ? (
                      <a href={`/customers/show/${customer.id}`}>
                        {customer.firstName} {customer.lastName}
                      </a>
                    ) : (
                      call.customerId
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Agente" span={1}>
                  <Space>
                    <UserOutlined />
                    {employee ? (
                      <a href={`/employees/show/${employee.id}`}>
                        {employee.firstName} {employee.lastName}
                      </a>
                    ) : (
                      call.userId
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Inicio" span={1}>
                  <Space>
                    <CalendarOutlined />
                    {dayjs(call.startTime).format("DD/MM/YYYY HH:mm:ss")}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Fin" span={1}>
                  <Space>
                    <CalendarOutlined />
                    {dayjs(call.endTime).format("DD/MM/YYYY HH:mm:ss")}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Duración" span={2}>
                  <Space>
                    <ClockCircleOutlined />
                    {formatDuration(call.duration)}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Script Utilizado" span={2}>
                  <Space>
                    <FileTextOutlined />
                    {call.script.name} (v{call.script.version})
                  </Space>
                </Descriptions.Item>
              </Descriptions>

              {call.notes && (
                <Card title="Notas de la Llamada" size="small">
                  <Paragraph>{call.notes}</Paragraph>
                </Card>
              )}

              {call.objections && call.objections.length > 0 && (
                <Card title="Objeciones Encontradas" size="small">
                  <List
                    dataSource={call.objections}
                    renderItem={(objection) => (
                      <List.Item>
                        <Space>
                          <ExclamationCircleOutlined />
                          {objection}
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              )}

              {call.recordingUrl && (
                <Alert
                  message="Grabación Disponible"
                  description={
                    <Space>
                      <AudioOutlined />
                      <a
                        href={call.recordingUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Escuchar grabación de la llamada
                      </a>
                    </Space>
                  }
                  type="info"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Próxima Acción">
            {call.nextAction ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Alert
                  message={
                    call.nextAction.type === "callback"
                      ? "Llamada de Seguimiento"
                      : call.nextAction.type === "email"
                      ? "Enviar Email"
                      : "Sin acción requerida"
                  }
                  type={call.nextAction.type === "none" ? "success" : "warning"}
                  showIcon
                  icon={
                    call.nextAction.type === "none" ? (
                      <CheckCircleOutlined />
                    ) : (
                      <InfoCircleOutlined />
                    )
                  }
                />

                {call.nextAction.scheduledFor && (
                  <div>
                    <Text strong>Programada para:</Text>
                    <br />
                    <Text>
                      {dayjs(call.nextAction.scheduledFor).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Text>
                  </div>
                )}

                {call.nextAction.notes && (
                  <div>
                    <Text strong>Notas:</Text>
                    <br />
                    <Text>{call.nextAction.notes}</Text>
                  </div>
                )}
              </Space>
            ) : (
              <Alert
                message="Sin acción de seguimiento"
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            )}
          </Card>

          <Card title="Información de Campaña" style={{ marginTop: 16 }}>
            {call.metadata?.campaignId ? (
              <Space direction="vertical">
                <Text strong>ID de Campaña:</Text>
                <a href={`/campaigns/show/${call.metadata.campaignId}`}>
                  {call.metadata.campaignId}
                </a>
              </Space>
            ) : (
              <Text type="secondary">No asociada a campaña</Text>
            )}

            {call.metadata?.waitTime && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Tiempo de Espera:</Text>
                <br />
                <Text>{call.metadata.waitTime} segundos</Text>
              </div>
            )}

            {call.metadata?.transferredTo && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Transferida a:</Text>
                <br />
                <Text>{call.metadata.transferredTo}</Text>
              </div>
            )}
          </Card>

          <Card title="Línea de Tiempo" style={{ marginTop: 16 }}>
            <Timeline>
              <Timeline.Item
                dot={<PhoneOutlined style={{ fontSize: "16px" }} />}
                color="blue"
              >
                <Text type="secondary">
                  {dayjs(call.startTime).format("HH:mm:ss")}
                </Text>
                <br />
                Llamada iniciada
              </Timeline.Item>

              {call.metadata?.waitTime && (
                <Timeline.Item>
                  <Text type="secondary">Tiempo de espera</Text>
                  <br />
                  {call.metadata.waitTime} segundos
                </Timeline.Item>
              )}

              <Timeline.Item
                dot={
                  call.status === "completed" ? (
                    <CheckCircleOutlined style={{ fontSize: "16px" }} />
                  ) : (
                    <ExclamationCircleOutlined style={{ fontSize: "16px" }} />
                  )
                }
                color={call.status === "completed" ? "green" : "red"}
              >
                <Text type="secondary">
                  {dayjs(call.endTime).format("HH:mm:ss")}
                </Text>
                <br />
                Llamada finalizada
              </Timeline.Item>

              {call.disposition === "sale" && (
                <Timeline.Item
                  dot={<CheckCircleOutlined style={{ fontSize: "16px" }} />}
                  color="green"
                >
                  Venta realizada
                </Timeline.Item>
              )}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
