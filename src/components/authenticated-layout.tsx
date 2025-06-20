import React, { useEffect } from "react";
import { ThemedLayoutV2 } from "@refinedev/antd";
import { Outlet, Navigate } from "react-router-dom";
import { useGetIdentity, useResource } from "@refinedev/core";
import { Layout, Menu } from "antd";
import { Loading } from "../components/loading";
import { CustomHeader } from "./custom-header";
import { IEmployee } from "../interfaces";
import { usePermissions } from "../hooks/usePermissions";
import { Link, useLocation } from "react-router-dom";
import { 
  DashboardOutlined,
  UserOutlined,
  CreditCardOutlined,
  PhoneOutlined,
  DollarOutlined,
  TeamOutlined,
  ShopOutlined,
  RocketOutlined,
  TrophyOutlined,
  FileTextOutlined,
  WalletOutlined,
  ScanOutlined,
  BarChartOutlined,
  SettingOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  ApiOutlined,
  HistoryOutlined,
  ApiOutlined as WebhookOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  CrownOutlined,
  LockOutlined,
} from "@ant-design/icons";

// Map of resource names to their icons
const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  "call-center": <PhoneOutlined />,
  customers: <UserOutlined />,
  subscriptions: <CreditCardOutlined />,
  evaluations: <ScanOutlined />,
  calls: <PhoneOutlined />,
  sales: <DollarOutlined />,
  campaigns: <RocketOutlined />,
  employees: <TeamOutlined />,
  stores: <ShopOutlined />,
  commissions: <WalletOutlined />,
  achievements: <TrophyOutlined />,
  scripts: <FileTextOutlined />,
  reports: <BarChartOutlined />,
  administration: <SettingOutlined />,
  tools: <ToolOutlined />,
  shopify: <ShopOutlined />,
  system: <AuditOutlined />,
  dailyTasks: <CheckSquareOutlined />,
  leaderboard: <CrownOutlined />,
  systemSettings: <SettingOutlined />,
  permissions: <LockOutlined />,
  stripeManagement: <CreditCardOutlined />,
  shopifySettings: <ApiOutlined />,
  shopifyProducts: <ShoppingCartOutlined />,
  shopifyCustomers: <UserOutlined />,
  shopifyCoupons: <TagOutlined />,
  activityLogs: <HistoryOutlined />,
  webhooks: <WebhookOutlined />,
  webhookSettings: <SettingOutlined />,
};

export const AuthenticatedLayout: React.FC = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity<IEmployee>();
  const { resources } = useResource();
  const { can, canAny, isLoading: permissionsLoading } = usePermissions();
  const location = useLocation();

  if (identityLoading) {
    return <Loading />;
  }

  if (!identity) {
    return <Navigate to="/login" />;
  }

  // Build menu items based on permissions
  const buildMenuItems = () => {
    if (!resources || permissionsLoading) return [];

    const menuItems: any[] = [];
    const groupedResources: Record<string, any[]> = {};

    // First pass: organize resources
    resources.forEach((resource) => {
      const parent = resource.meta?.parent;
      
      // Check if user has permission to access this resource
      let hasAccess = false;
      
      if (resource.list || resource.show || resource.create) {
        // Check various permissions
        hasAccess = canAny(resource.name, ["list", "view", "show", "create"]);
      } else if (!parent) {
        // This is a parent/group resource, show it if any child is accessible
        hasAccess = true; // We'll check children later
      }

      if (hasAccess) {
        if (parent) {
          if (!groupedResources[parent]) {
            groupedResources[parent] = [];
          }
          groupedResources[parent].push(resource);
        } else {
          // Top-level resource or group
          if (!resource.list && !resource.show && !resource.create) {
            // This is a group
            groupedResources[resource.name] = groupedResources[resource.name] || [];
          } else {
            // This is a regular resource
            menuItems.push({
              key: resource.name,
              label: <Link to={resource.list || "/"}>{resource.meta?.label || resource.name}</Link>,
              icon: RESOURCE_ICONS[resource.name] || resource.meta?.icon,
            });
          }
        }
      }
    });

    // Second pass: build grouped items
    Object.keys(groupedResources).forEach((groupName) => {
      const children = groupedResources[groupName];
      
      // Only show group if it has accessible children
      if (children.length > 0) {
        const groupResource = resources.find(r => r.name === groupName);
        if (groupResource) {
          menuItems.push({
            key: groupName,
            label: groupResource.meta?.label || groupName,
            icon: RESOURCE_ICONS[groupName] || groupResource.meta?.icon,
            children: children.map(child => ({
              key: child.name,
              label: <Link to={child.list || "/"}>{child.meta?.label || child.name}</Link>,
              icon: RESOURCE_ICONS[child.name] || child.meta?.icon,
            })),
          });
        }
      }
    });

    return menuItems;
  };

  const menuItems = buildMenuItems();

  // Custom Sider component
  const CustomSider = () => (
    <Layout.Sider
      collapsible
      theme="light"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h2 style={{ margin: 0 }}>Sleep Plus</h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname.split("/")[1] || "dashboard"]}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </Layout.Sider>
  );

  return (
    <ThemedLayoutV2 
      initialSiderCollapsed={false}
      Header={CustomHeader}
      Sider={CustomSider}
    >
      <Outlet />
    </ThemedLayoutV2>
  );
};
