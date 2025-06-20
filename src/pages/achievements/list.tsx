import React from "react";
import { List, useTable } from "@refinedev/antd";
import { Table, Tag, Space, Typography, Badge, Avatar, Tooltip } from "antd";
import {
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  RocketOutlined,
  CrownOutlined,
  TeamOutlined,
  PhoneOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { IAchievement } from "../../interfaces";

const { Text } = Typography;

export const AchievementList: React.FC = () => {
  const { tableProps } = useTable<IAchievement>({
    syncWithLocation: true,
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sales":
        return <DollarOutlined />;
      case "calls":
        return <PhoneOutlined />;
      case "quality":
        return <StarOutlined />;
      case "team":
        return <TeamOutlined />;
      default:
        return <TrophyOutlined />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "sales":
        return "green";
      case "calls":
        return "blue";
      case "quality":
        return "gold";
      case "team":
        return "purple";
      default:
        return "default";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "platinum":
        return <CrownOutlined style={{ color: "#e5e4e2" }} />;
      case "gold":
        return <TrophyOutlined style={{ color: "#ffd700" }} />;
      case "silver":
        return <StarOutlined style={{ color: "#c0c0c0" }} />;
      case "bronze":
        return <FireOutlined style={{ color: "#cd7f32" }} />;
      default:
        return <TrophyOutlined />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "#e5e4e2";
      case "gold":
        return "#ffd700";
      case "silver":
        return "#c0c0c0";
      case "bronze":
        return "#cd7f32";
      default:
        return "#d9d9d9";
    }
  };

  const formatCriteria = (achievement: IAchievement) => {
    const { criteria } = achievement;
    let text = "";

    switch (criteria.type) {
      case "count":
        text = `${criteria.target} ${criteria.metric}`;
        break;
      case "percentage":
        text = `${criteria.target}% ${criteria.metric}`;
        break;
      case "streak":
        text = `${criteria.target} días consecutivos`;
        break;
      case "total":
        text = `${criteria.target} total`;
        break;
    }

    if (criteria.timeframe) {
      switch (criteria.timeframe) {
        case "day":
          text += " en un día";
          break;
        case "week":
          text += " en una semana";
          break;
        case "month":
          text += " en un mes";
          break;
        case "all_time":
          text += " de todos los tiempos";
          break;
      }
    }

    return text;
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Logro"
          dataIndex="name"
          key="name"
          render={(value, record: IAchievement) => (
            <Space>
              <Avatar
                size={40}
                style={{
                  backgroundColor: getTierColor(record.tier),
                  fontSize: 24,
                }}
              >
                {record.icon}
              </Avatar>
              <div>
                <Text strong>{value}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {record.code}
                </Text>
              </div>
            </Space>
          )}
        />

        <Table.Column
          title="Descripción"
          dataIndex="description"
          key="description"
          render={(value) => (
            <Text ellipsis style={{ maxWidth: 300 }}>
              {value}
            </Text>
          )}
        />

        <Table.Column
          title="Categoría"
          dataIndex="category"
          key="category"
          render={(value) => (
            <Tag icon={getCategoryIcon(value)} color={getCategoryColor(value)}>
              {value === "sales"
                ? "Ventas"
                : value === "calls"
                ? "Llamadas"
                : value === "quality"
                ? "Calidad"
                : "Equipo"}
            </Tag>
          )}
        />

        <Table.Column
          title="Nivel"
          dataIndex="tier"
          key="tier"
          render={(value) => (
            <Space>
              {getTierIcon(value)}
              <Tag
                color={
                  value === "platinum"
                    ? "default"
                    : value === "gold"
                    ? "gold"
                    : value === "silver"
                    ? "default"
                    : "orange"
                }
              >
                {value === "platinum"
                  ? "Platino"
                  : value === "gold"
                  ? "Oro"
                  : value === "silver"
                  ? "Plata"
                  : "Bronce"}
              </Tag>
            </Space>
          )}
        />

        <Table.Column
          title="Criterio"
          key="criteria"
          render={(_, record: IAchievement) => (
            <Text>{formatCriteria(record)}</Text>
          )}
        />

        <Table.Column
          title="Recompensas"
          dataIndex="rewards"
          key="rewards"
          render={(rewards: IAchievement["rewards"]) => (
            <Space direction="vertical" size={0}>
              <Text>{rewards.points} puntos</Text>
              {rewards.bonus && (
                <Text type="success">${rewards.bonus} bono</Text>
              )}
              {rewards.badge && (
                <Badge status="success" text="Insignia" />
              )}
            </Space>
          )}
        />

        <Table.Column
          title="Desbloqueado por"
          dataIndex="unlockedBy"
          key="unlockedBy"
          render={(unlockedBy: IAchievement["unlockedBy"]) => {
            const count = unlockedBy.length;
            if (count === 0) {
              return <Text type="secondary">Nadie aún</Text>;
            }

            const recentUnlocks = unlockedBy
              .sort((a, b) => dayjs(b.unlockedAt).diff(dayjs(a.unlockedAt)))
              .slice(0, 3);

            return (
              <Space direction="vertical" size={0}>
                <Text>{count} empleado{count !== 1 ? "s" : ""}</Text>
                <Tooltip
                  title={
                    <Space direction="vertical" size={0}>
                      {recentUnlocks.map((unlock) => (
                        <Text key={unlock.userId} style={{ color: "white" }}>
                          {dayjs(unlock.unlockedAt).format("DD/MM/YYYY")}
                        </Text>
                      ))}
                    </Space>
                  }
                >
                  <Text type="secondary" style={{ fontSize: 12, cursor: "pointer" }}>
                    Ver últimos
                  </Text>
                </Tooltip>
              </Space>
            );
          }}
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: IAchievement) => (
            <a href={`/achievements/show/${record.id}`}>Ver detalles</a>
          )}
        />
      </Table>
    </List>
  );
};
