import React from "react";
import { List, useTable, ShowButton, EditButton, CreateButton } from "@refinedev/antd";
import { Table, Tag, Space, Typography, Badge, Progress, Tooltip } from "antd";
import { Link } from "react-router-dom";
import {
  FileTextOutlined,
  UserOutlined,
  PercentageOutlined,
  LineChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { IScript, IEmployee } from "../../interfaces";

// Configurar dayjs
dayjs.extend(relativeTime);

const { Text } = Typography;

export const ScriptList: React.FC = () => {
  const { tableProps } = useTable<IScript>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "updatedAt",
          order: "desc",
        },
      ],
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "cold":
        return "blue";
      case "warm":
        return "orange";
      case "winback":
        return "purple";
      case "renewal":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleOutlined />;
      case "draft":
        return <EditOutlined />;
      case "archived":
        return <FolderOpenOutlined />;
      default:
        return null;
    }
  };

  return (
    <List
      headerButtons={
        <CreateButton type="primary" icon={<FileTextOutlined />}>
          Nuevo Script
        </CreateButton>
      }
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Script"
          dataIndex="name"
          key="name"
          render={(value, record: IScript) => (
            <Space direction="vertical" size={0}>
              <Space>
                <FileTextOutlined />
                <Text strong>{value}</Text>
              </Space>
              <Space>
                <Tag color={getTypeColor(record.type)}>
                  {record.type === "cold"
                    ? "Llamada fría"
                    : record.type === "warm"
                    ? "Llamada cálida"
                    : record.type === "winback"
                    ? "Recuperación"
                    : "Renovación"}
                </Tag>
                <Text type="secondary">v{record.version}</Text>
              </Space>
            </Space>
          )}
        />

        <Table.Column
          title="Estado"
          dataIndex="status"
          key="status"
          render={(value) => (
            <Tag icon={getStatusIcon(value)} color={getStatusColor(value)}>
              {value === "active"
                ? "Activo"
                : value === "draft"
                ? "Borrador"
                : "Archivado"}
            </Tag>
          )}
        />

        <Table.Column
          title="Rendimiento"
          key="performance"
          render={(_, record: IScript) => {
            if (!record.successRate || record.usageCount === 0) {
              return <Text type="secondary">Sin datos</Text>;
            }

            return (
              <Space direction="vertical" size={0} style={{ width: 120 }}>
                <Space>
                  <PercentageOutlined />
                  <Text>{record.successRate}% éxito</Text>
                </Space>
                <Progress
                  percent={record.successRate}
                  size="small"
                  showInfo={false}
                  strokeColor={
                    record.successRate >= 20
                      ? "#52c41a"
                      : record.successRate >= 15
                      ? "#faad14"
                      : "#f5222d"
                  }
                />
              </Space>
            );
          }}
        />

        <Table.Column
          title="Uso"
          dataIndex="usageCount"
          key="usageCount"
          render={(value) => (
            <Space>
              <LineChartOutlined />
              <Text>{value.toLocaleString()} veces</Text>
            </Space>
          )}
          sorter
        />

        <Table.Column
          title="Segmentos"
          dataIndex="segments"
          key="segments"
          render={(segments: IScript["segments"]) => (
            <Badge count={segments.length} style={{ backgroundColor: "#1890ff" }}>
              <Text>{segments.length} segmentos</Text>
            </Badge>
          )}
        />

        <Table.Column
          title="Variables"
          dataIndex="variables"
          key="variables"
          render={(variables: string[]) => (
            <Tooltip
              title={
                <Space direction="vertical" size={0}>
                  {variables.map((v) => (
                    <Text key={v} style={{ color: "white" }}>
                      [{v}]
                    </Text>
                  ))}
                </Space>
              }
            >
              <Text style={{ cursor: "pointer" }}>
                {variables.length} variable{variables.length !== 1 ? "s" : ""}
              </Text>
            </Tooltip>
          )}
        />

        <Table.Column
          title="Creado por"
          dataIndex="createdBy"
          key="createdBy"
          render={(value) => (
            <Space>
              <UserOutlined />
              <Text>{value}</Text>
            </Space>
          )}
        />

        <Table.Column
          title="Última actualización"
          dataIndex="updatedAt"
          key="updatedAt"
          render={(value) => (
            <Space direction="vertical" size={0}>
              <Text>{dayjs(value).format("DD/MM/YYYY")}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(value).fromNow()}
              </Text>
            </Space>
          )}
          sorter
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          fixed="right"
          render={(_, record: IScript) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              {record.status !== "archived" && (
                <EditButton hideText size="small" recordItemId={record.id} />
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
