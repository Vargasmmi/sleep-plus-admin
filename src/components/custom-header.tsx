import React from "react";
import { 
  Layout, 
  Avatar, 
  Space, 
  Dropdown, 
  Typography, 
  Button,
  theme,
  Badge,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";

const { Header } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed?: boolean;
  onCollapsed?: (collapsed: boolean) => void;
}

export const CustomHeader: React.FC<HeaderProps> = ({ collapsed, onCollapsed }) => {
  const { token } = theme.useToken();
  const { data: user } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  const items: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
      onClick: () => {
        logout();
      },
    },
  ];

  return (
    <Header
      style={{
        backgroundColor: token.colorBgContainer,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
        height: 64,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapsed?.(!collapsed)}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />

      <Space size="middle">
        <Badge count={5} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 20 }} />}
            style={{ width: 40, height: 40 }}
          />
        </Badge>

        <Dropdown menu={{ items }} placement="bottomRight" arrow>
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              size="default"
              icon={<UserOutlined />}
              src={user?.avatar}
              style={{ backgroundColor: token.colorPrimary }}
            />
            <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: 14 }}>
                {user?.name || user?.firstName || "User"}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user?.role === "admin"
                  ? "Administrator"
                  : user?.role === "manager"
                  ? "Manager"
                  : "Agent"}
              </Text>
            </Space>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};
