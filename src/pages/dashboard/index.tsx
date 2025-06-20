import React, { useEffect, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { Row, Col, Card, Statistic, Progress, Space, Typography, Tag, Alert, Button, List, Avatar } from "antd";
import {
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { Line, Column, Pie, Gauge } from "@ant-design/charts";
import dayjs from "dayjs";
import { IDailyGoal, IEmployee } from "../../interfaces";

const { Title, Text } = Typography;

// Import role-specific dashboards
import { AdminDashboard } from "./AdminDashboard";
import { ManagerDashboard } from "./ManagerDashboard";
import { AgentDashboard } from "./AgentDashboard";

export const DashboardPage: React.FC = () => {
  const { data: identity } = useGetIdentity<IEmployee>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (identity) {
      setLoading(false);
    }
  }, [identity]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text>Loading dashboard...</Text>
      </div>
    );
  }

  if (!identity) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error"
          description="Could not load user information"
          type="error"
        />
      </div>
    );
  }

  // Render role-specific dashboard
  switch (identity.role) {
    case 'admin':
      return <AdminDashboard user={identity} />;
    case 'manager':
      return <ManagerDashboard user={identity} />;
    case 'agent':
      return <AgentDashboard user={identity} />;
    default:
      return (
        <div style={{ padding: 24 }}>
          <Alert
            message="Unrecognized Role"
            description={`The role "${identity.role}" does not have a configured dashboard`}
            type="warning"
          />
        </div>
      );
  }
};
