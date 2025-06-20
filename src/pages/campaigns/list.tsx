import React from "react";
import { List, useTable } from "@refinedev/antd";
import { Table, Tag, Space, Typography, Progress, Statistic } from "antd";
import { Link } from "react-router-dom";
import {
  RocketOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ICampaign } from "../../interfaces";

const { Text } = Typography;

export const CampaignList: React.FC = () => {
  const { tableProps } = useTable<ICampaign>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "startDate",
          order: "desc",
        },
      ],
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "retention":
        return "blue";
      case "winback":
        return "purple";
      case "upgrade":
        return "gold";
      case "seasonal":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "completed":
        return "default";
      case "draft":
        return "default";
      default:
        return "default";
    }
  };

  const calculateConversionRate = (campaign: ICampaign) => {
    if (campaign.metrics.contacted === 0) return 0;
    return ((campaign.metrics.converted / campaign.metrics.contacted) * 100).toFixed(1);
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Campaña"
          dataIndex="name"
          key="name"
          render={(value, record: ICampaign) => (
            <Space direction="vertical" size={0}>
              <Space>
                <RocketOutlined />
                <Text strong>{value}</Text>
              </Space>
              <Space>
                <Tag color={getTypeColor(record.type)}>
                  {record.type === "retention"
                    ? "Retención"
                    : record.type === "winback"
                    ? "Recuperación"
                    : record.type === "upgrade"
                    ? "Mejora"
                    : "Temporal"}
                </Tag>
                <Tag color={getStatusColor(record.status)}>
                  {record.status === "active"
                    ? "Activa"
                    : record.status === "paused"
                    ? "Pausada"
                    : record.status === "completed"
                    ? "Completada"
                    : "Borrador"}
                </Tag>
              </Space>
            </Space>
          )}
        />

        <Table.Column
          title="Período"
          key="period"
          render={(_, record: ICampaign) => (
            <Space direction="vertical" size={0}>
              <Text>{dayjs(record.startDate).format("DD/MM/YYYY")}</Text>
              <Text type="secondary">
                al {dayjs(record.endDate).format("DD/MM/YYYY")}
              </Text>
            </Space>
          )}
          sorter
        />

        <Table.Column
          title="Segmentación"
          dataIndex="targeting"
          key="targeting"
          render={(targeting: ICampaign["targeting"]) => (
            <Space direction="vertical" size={0}>
              <Text>
                Niveles:{" "}
                {targeting.customerTiers.map(tier => 
                  tier === "gold" ? "Oro" : 
                  tier === "silver" ? "Plata" : 
                  "Bronce"
                ).join(", ")}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Última compra: {targeting.lastPurchaseRange.min}-{targeting.lastPurchaseRange.max} días
              </Text>
            </Space>
          )}
        />

        <Table.Column
          title="Oferta"
          dataIndex="offer"
          key="offer"
          render={(offer: ICampaign["offer"]) => (
            <Space>
              <PercentageOutlined />
              <Text strong>
                {offer.type === "percentage"
                  ? `${offer.value}%`
                  : offer.type === "fixed"
                  ? `$${offer.value}`
                  : offer.type === "freeMonth"
                  ? "Mes gratis"
                  : "Mejora"}
              </Text>
            </Space>
          )}
        />

        <Table.Column
          title="Métricas"
          key="metrics"
          render={(_, record: ICampaign) => (
            <Space direction="vertical" size={0} style={{ width: 120 }}>
              <Space>
                <PhoneOutlined />
                <Text>{record.metrics.totalCalls} llamadas</Text>
              </Space>
              <Space>
                <UserOutlined />
                <Text>{record.metrics.contacted} contactados</Text>
              </Space>
              <Progress
                percent={Number(calculateConversionRate(record))}
                size="small"
                format={(percent) => `${percent}%`}
              />
            </Space>
          )}
        />

        <Table.Column
          title="Resultados"
          key="results"
          render={(_, record: ICampaign) => (
            <Space direction="vertical" size={0}>
              <Statistic
                value={record.metrics.converted}
                prefix={<UserOutlined />}
                suffix="conversiones"
                valueStyle={{ fontSize: 14 }}
              />
              <Statistic
                value={record.metrics.revenue}
                prefix="$"
                precision={2}
                valueStyle={{ fontSize: 14, color: "#3f8600" }}
              />
            </Space>
          )}
        />

        <Table.Column
          title="Asignados"
          dataIndex="assignedTo"
          key="assignedTo"
          render={(assignedTo: string[]) => (
            <Space>
              <TeamOutlined />
              <Text>{assignedTo.length} agentes</Text>
            </Space>
          )}
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: ICampaign) => (
            <Space direction="vertical" size={0}>
              <Link to={`/campaigns/show/${record.id}`}>Ver detalles</Link>
              {record.status !== "completed" && (
                <Link to={`/campaigns/edit/${record.id}`}>Editar</Link>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
