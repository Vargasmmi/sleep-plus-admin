import React from "react";
import { List, useTable } from "@refinedev/antd";
import { useMany } from "@refinedev/core";
import { Table, Tag, Space, Typography, Tooltip } from "antd";
import {
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
  AudioOutlined,
  PhoneFilled,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import type { ICall, ICustomer, IEmployee } from "../../interfaces";

dayjs.extend(duration);

const { Text } = Typography;

export const CallList: React.FC = () => {
  const { tableProps } = useTable<ICall>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "startTime",
          order: "desc",
        },
      ],
    },
  });

  const callIds = tableProps?.dataSource?.map((item) => item.customerId) ?? [];
  const { data: customersData } = useMany<ICustomer>({
    resource: "customers",
    ids: callIds,
    queryOptions: {
      enabled: callIds.length > 0,
    },
  });

  const userIds = tableProps?.dataSource?.map((item) => item.userId) ?? [];
  const { data: employeesData } = useMany<IEmployee>({
    resource: "employees",
    ids: userIds,
    queryOptions: {
      enabled: userIds.length > 0,
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <PhoneFilled style={{ color: "#52c41a" }} />;
      case "no_answer":
        return <CloseCircleOutlined style={{ color: "#faad14" }} />;
      case "busy":
      case "failed":
        return <CloseCircleOutlined style={{ color: "#f5222d" }} />;
      case "voicemail":
        return <AudioOutlined style={{ color: "#1890ff" }} />;
      default:
        return <PhoneOutlined />;
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

  const formatDuration = (seconds: number) => {
    const duration = dayjs.duration(seconds, "seconds");
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${duration.minutes()}m ${duration.seconds()}s`;
    } else {
      return `${duration.hours()}h ${duration.minutes()}m`;
    }
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Fecha/Hora"
          dataIndex="startTime"
          key="startTime"
          render={(value) => (
            <Space direction="vertical" size={0}>
              <Text>{dayjs(value).format("DD/MM/YYYY")}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(value).format("HH:mm:ss")}
              </Text>
            </Space>
          )}
          sorter
        />

        <Table.Column
          title="Cliente"
          dataIndex="customerId"
          key="customerId"
          render={(value) => {
            const customer = customersData?.data?.find((c) => c.id === value);
            return (
              <Space>
                <UserOutlined />
                <a href={`/customers/show/${value}`}>
                  {customer
                    ? `${customer.firstName} ${customer.lastName}`
                    : value}
                </a>
              </Space>
            );
          }}
        />

        <Table.Column
          title="Agente"
          dataIndex="userId"
          key="userId"
          render={(value) => {
            const employee = employeesData?.data?.find((e) => e.id === value);
            return (
              <Space>
                <UserOutlined />
                {employee
                  ? `${employee.firstName} ${employee.lastName}`
                  : value}
              </Space>
            );
          }}
        />

        <Table.Column
          title="Tipo"
          dataIndex="type"
          key="type"
          render={(value) => (
            <Tag color={value === "outbound" ? "blue" : "green"}>
              {value === "outbound" ? "Saliente" : "Entrante"}
            </Tag>
          )}
        />

        <Table.Column
          title="Estado"
          dataIndex="status"
          key="status"
          render={(value, record: ICall) => (
            <Space>
              {getStatusIcon(value)}
              <Text>
                {value === "completed"
                  ? "Completada"
                  : value === "no_answer"
                  ? "Sin respuesta"
                  : value === "busy"
                  ? "Ocupado"
                  : value === "failed"
                  ? "Fallida"
                  : value === "voicemail"
                  ? "Buzón de voz"
                  : value}
              </Text>
            </Space>
          )}
        />

        <Table.Column
          title="Disposición"
          dataIndex="disposition"
          key="disposition"
          render={(value) => (
            <Tag color={getDispositionColor(value)}>
              {value === "sale"
                ? "Venta"
                : value === "interested"
                ? "Interesado"
                : value === "callback"
                ? "Llamar después"
                : value === "not_interested"
                ? "No interesado"
                : value === "wrong_number"
                ? "Número equivocado"
                : value}
            </Tag>
          )}
        />

        <Table.Column
          title="Duración"
          dataIndex="duration"
          key="duration"
          render={(value) => (
            <Space>
              <ClockCircleOutlined />
              <Text>{formatDuration(value)}</Text>
            </Space>
          )}
          sorter
        />

        <Table.Column
          title="Script"
          dataIndex="script"
          key="script"
          render={(script: ICall["script"]) => (
            <Tooltip title={`Versión ${script.version}`}>
              <Text ellipsis style={{ maxWidth: 150 }}>
                {script.name}
              </Text>
            </Tooltip>
          )}
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: ICall) => (
            <Space>
              <a href={`/calls/show/${record.id}`}>Ver detalles</a>
              {record.recordingUrl && (
                <a href={record.recordingUrl} target="_blank" rel="noreferrer">
                  <AudioOutlined /> Escuchar
                </a>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
