import React from "react";
import { Show } from "@refinedev/antd";
import { useShow, useMany } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Avatar,
  List,
  Timeline,
  Statistic,
  Progress,
  Empty,
  Badge,
} from "antd";
import {
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  RocketOutlined,
  CrownOutlined,
  TeamOutlined,
  PhoneOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { IAchievement, IEmployee } from "../../interfaces";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

export const AchievementShow: React.FC = () => {
  const { queryResult } = useShow<IAchievement>();
  const { data, isLoading } = queryResult;
  const achievement = data?.data;

  const userIds = achievement?.unlockedBy.map((u) => u.userId) || [];
  const { data: employeesData } = useMany<IEmployee>({
    resource: "employees",
    ids: userIds,
    queryOptions: {
      enabled: userIds.length > 0,
    },
  });

  const employees = employeesData?.data || [];

  if (isLoading || !achievement) {
    return <div>Cargando...</div>;
  }

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

  const formatCriteria = () => {
    const { criteria } = achievement;
    let text = "";

    switch (criteria.type) {
      case "count":
        text = `Alcanzar ${criteria.target} ${criteria.metric}`;
        break;
      case "percentage":
        text = `Lograr ${criteria.target}% en ${criteria.metric}`;
        break;
      case "streak":
        text = `Mantener ${criteria.target} días consecutivos de ${criteria.metric}`;
        break;
      case "total":
        text = `Acumular ${criteria.target} ${criteria.metric} en total`;
        break;
    }

    if (criteria.timeframe) {
      switch (criteria.timeframe) {
        case "day":
          text += " en un solo día";
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

  const completionRate = (achievement.unlockedBy.length / 10) * 100; // Asumiendo 10 empleados totales

  return (
    <Show>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Space align="start" size="large">
              <Avatar
                size={80}
                style={{
                  backgroundColor: getTierColor(achievement.tier),
                  fontSize: 48,
                }}
              >
                {achievement.icon}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Space>
                  <Title level={2} style={{ margin: 0 }}>
                    {achievement.name}
                  </Title>
                  {getTierIcon(achievement.tier)}
                </Space>
                <Space style={{ marginTop: 8 }}>
                  <Tag icon={getCategoryIcon(achievement.category)} color={getCategoryColor(achievement.category)}>
                    {achievement.category === "sales"
                      ? "Ventas"
                      : achievement.category === "calls"
                      ? "Llamadas"
                      : achievement.category === "quality"
                      ? "Calidad"
                      : "Equipo"}
                  </Tag>
                  <Tag
                    color={
                      achievement.tier === "platinum"
                        ? "default"
                        : achievement.tier === "gold"
                        ? "gold"
                        : achievement.tier === "silver"
                        ? "default"
                        : "orange"
                    }
                  >
                    {achievement.tier === "platinum"
                      ? "Platino"
                      : achievement.tier === "gold"
                      ? "Oro"
                      : achievement.tier === "silver"
                      ? "Plata"
                      : "Bronce"}
                  </Tag>
                </Space>
                <Paragraph style={{ marginTop: 16 }}>
                  {achievement.description}
                </Paragraph>
              </div>
            </Space>
          </Card>

          <Card title="Criterio de Obtención" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong style={{ fontSize: 16 }}>
                {formatCriteria()}
              </Text>
              
              <div style={{ marginTop: 16 }}>
                <Text>Tipo de criterio: </Text>
                <Tag>
                  {achievement.criteria.type === "count"
                    ? "Conteo"
                    : achievement.criteria.type === "percentage"
                    ? "Porcentaje"
                    : achievement.criteria.type === "streak"
                    ? "Racha"
                    : "Total acumulado"}
                </Tag>
              </div>

              <div>
                <Text>Métrica: </Text>
                <Text strong>{achievement.criteria.metric}</Text>
              </div>

              <div>
                <Text>Objetivo: </Text>
                <Text strong>{achievement.criteria.target}</Text>
              </div>

              {achievement.criteria.timeframe && (
                <div>
                  <Text>Período: </Text>
                  <Tag>
                    {achievement.criteria.timeframe === "day"
                      ? "Diario"
                      : achievement.criteria.timeframe === "week"
                      ? "Semanal"
                      : achievement.criteria.timeframe === "month"
                      ? "Mensual"
                      : "Todo el tiempo"}
                  </Tag>
                </div>
              )}
            </Space>
          </Card>

          <Card title="Empleados que lo han Desbloqueado" style={{ marginTop: 16 }}>
            {achievement.unlockedBy.length > 0 ? (
              <List
                dataSource={achievement.unlockedBy.sort((a, b) =>
                  dayjs(b.unlockedAt).diff(dayjs(a.unlockedAt))
                )}
                renderItem={(unlock) => {
                  const employee = employees.find((e) => e.id === unlock.userId);
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          employee ? (
                            <a href={`/employees/show/${employee.id}`}>
                              {employee.firstName} {employee.lastName}
                            </a>
                          ) : (
                            unlock.userId
                          )
                        }
                        description={
                          <Space>
                            <CalendarOutlined />
                            <Text type="secondary">
                              {dayjs(unlock.unlockedAt).format("DD/MM/YYYY HH:mm")}
                            </Text>
                            <Text type="secondary">
                              ({dayjs(unlock.unlockedAt).fromNow()})
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="Nadie ha desbloqueado este logro aún" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Recompensas">
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <div>
                <Space>
                  <GiftOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                  <Text strong style={{ fontSize: 16 }}>
                    Puntos
                  </Text>
                </Space>
                <Statistic
                  value={achievement.rewards.points}
                  suffix="puntos"
                  style={{ marginTop: 8 }}
                />
              </div>

              {achievement.rewards.bonus && (
                <div>
                  <Space>
                    <DollarOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                    <Text strong style={{ fontSize: 16 }}>
                      Bono en efectivo
                    </Text>
                  </Space>
                  <Statistic
                    value={achievement.rewards.bonus}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: "#52c41a" }}
                    style={{ marginTop: 8 }}
                  />
                </div>
              )}

              {achievement.rewards.badge && (
                <div>
                  <Space>
                    <Badge
                      status="success"
                      text={
                        <Text strong style={{ fontSize: 16 }}>
                          Insignia especial
                        </Text>
                      }
                    />
                  </Space>
                  <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                    Este logro otorga una insignia especial en el perfil
                  </Text>
                </div>
              )}
            </Space>
          </Card>

          <Card title="Estadísticas" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Statistic
                title="Total de ganadores"
                value={achievement.unlockedBy.length}
                prefix={<UserOutlined />}
              />
              
              <div style={{ marginTop: 16 }}>
                <Text>Tasa de obtención</Text>
                <Progress
                  percent={completionRate}
                  format={(percent) => `${percent?.toFixed(1)}%`}
                />
              </div>

              {achievement.unlockedBy.length > 0 && (
                <>
                  <Statistic
                    title="Último desbloqueado"
                    value={dayjs(
                      achievement.unlockedBy.sort((a, b) =>
                        dayjs(b.unlockedAt).diff(dayjs(a.unlockedAt))
                      )[0].unlockedAt
                    ).fromNow()}
                    valueStyle={{ fontSize: 14 }}
                  />

                  <Statistic
                    title="Primer desbloqueado"
                    value={dayjs(
                      achievement.unlockedBy.sort((a, b) =>
                        dayjs(a.unlockedAt).diff(dayjs(b.unlockedAt))
                      )[0].unlockedAt
                    ).format("DD/MM/YYYY")}
                    valueStyle={{ fontSize: 14 }}
                  />
                </>
              )}
            </Space>
          </Card>

          <Card title="Información" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Código:</Text>
                <br />
                <Text strong>{achievement.code}</Text>
              </div>
              
              <div>
                <Text type="secondary">ID:</Text>
                <br />
                <Text copyable>{achievement.id}</Text>
              </div>

              <div>
                <Text type="secondary">Creado:</Text>
                <br />
                <Text>{dayjs(achievement.createdAt).format("DD/MM/YYYY")}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
