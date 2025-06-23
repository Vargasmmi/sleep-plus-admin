import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  notificationProvider,
  ErrorComponent,
} from "@refinedev/antd";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { customDataProvider } from "./providers/dataProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App as AntdApp, ConfigProvider } from "antd";
import "@refinedev/antd/dist/reset.css";
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

// Import custom providers
import { authProvider } from "./providers/authProvider";
import { accessControlProvider } from "./providers/accessControlProvider";

// Import pages
import { DashboardPage } from "./pages/dashboard";
import { CallCenterPage } from "./pages/call-center";
import { Login } from "./pages/login";
import { ProfilePage } from "./pages/profile";
import { AuthenticatedLayout } from "./components/authenticated-layout";

// Import customer pages
import {
  CustomerList,
  CustomerCreate,
  CustomerEdit,
  CustomerShow,
} from "./pages/customers";

// Import subscription pages
import {
  SubscriptionList,
  SubscriptionCreate,
  SubscriptionEdit,
  SubscriptionShow,
} from "./pages/subscriptions";

// Import evaluation pages
import {
  EvaluationList,
  EvaluationShow,
  EvaluationCreate,
  EvaluationEdit,
} from "./pages/evaluations";

// Import employee pages
import {
  EmployeeList,
  EmployeeCreate,
  EmployeeEdit,
  EmployeeShow,
} from "./pages/employees";

// Import store pages
import { StoreList, StoreCreate, StoreEdit, StoreShow } from "./pages/stores";

// Import call pages
import { CallList, CallShow, CallCreate, CallEdit } from "./pages/calls";

// Import sale pages
import { SaleList, SaleShow, SaleCreate, SaleEdit } from "./pages/sales";

// Import campaign pages
import {
  CampaignList,
  CampaignCreate,
  CampaignEdit,
  CampaignShow,
} from "./pages/campaigns";

// Import commission pages
import { CommissionList, CommissionShow, CommissionCreate, CommissionEdit } from "./pages/commissions";

// Import achievement pages
import { AchievementList, AchievementShow, AchievementCreate, AchievementEdit } from "./pages/achievements";

// Import script pages
import {
  ScriptList,
  ScriptCreate,
  ScriptEdit,
  ScriptShow,
} from "./pages/scripts";

// Import activity log pages
import { ActivityLogList, ActivityLogShow } from "./pages/activity-logs";

// Import webhook pages
import { WebhookList, WebhookShow, WebhookSettings } from "./pages/webhooks";

// Import admin pages
import { SystemSettingsPage } from "./pages/admin/settings";
import { PermissionsPage } from "./pages/admin/permissions";

// Import tasks and leaderboard pages
import { TasksPage } from "./pages/tasks";
import { LeaderboardPage } from "./pages/leaderboard";

// Import Shopify pages
import { ShopifySettingsPage } from "./pages/shopify/settings";
import {
  ShopifyProductList,
  ShopifyProductCreate,
  ShopifyProductEdit,
  ShopifyProductShow,
} from "./pages/shopify/products";
import {
  ShopifyCustomerList,
  ShopifyCustomerCreate,
  ShopifyCustomerEdit,
  ShopifyCustomerShow,
} from "./pages/shopify/customers";
import {
  ShopifyCouponList,
  ShopifyCouponCreate,
  ShopifyCouponEdit,
  ShopifyCouponShow,
} from "./pages/shopify/coupons";

// Import Stripe pages
import StripeManagement from "./pages/StripeManagement";



function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#1890ff",
              colorSuccess: "#52c41a",
              colorWarning: "#faad14",
              colorError: "#f5222d",
              colorInfo: "#1890ff",
              colorTextBase: "#000000",
              colorBgBase: "#ffffff",
              borderRadius: 6,
            },
          }}
        >
          <AntdApp>
            <Refine
              dataProvider={customDataProvider}
              authProvider={authProvider}
              accessControlProvider={accessControlProvider}
              routerProvider={routerBindings}
              notificationProvider={notificationProvider}
              resources={[
                // Navigation groups
                {
                  name: "reports",
                  meta: {
                    label: "Reportes",
                    icon: <BarChartOutlined />,
                  },
                },
                {
                  name: "administration",
                  meta: {
                    label: "Administración",
                    icon: <SettingOutlined />,
                  },
                },
                {
                  name: "tools",
                  meta: {
                    label: "Herramientas",
                    icon: <ToolOutlined />,
                  },
                },
                {
                  name: "shopify",
                  meta: {
                    label: "Tienda Shopify",
                    icon: <ShopOutlined />,
                  },
                },
                {
                  name: "system",
                  meta: {
                    label: "Sistema",
                    icon: <AuditOutlined />,
                  },
                },
                {
                  name: "dailyTasks",
                  list: "/tasks",
                  meta: {
                    label: "Tareas Diarias",
                    icon: <CheckSquareOutlined />,
                  },
                },
                {
                  name: "leaderboard",
                  list: "/leaderboard",
                  meta: {
                    label: "Tabla de Líderes",
                    icon: <CrownOutlined />,
                  },
                },
                {
                  name: "systemSettings",
                  list: "/admin/settings",
                  meta: {
                    label: "Configuración",
                    icon: <SettingOutlined />,
                    parent: "administration",
                  },
                },
                {
                  name: "permissions",
                  list: "/admin/permissions",
                  meta: {
                    label: "Permisos",
                    icon: <LockOutlined />,
                    parent: "administration",
                  },
                },
                {
                  name: "dashboard",
                  list: "/",
                  meta: {
                    label: "Panel Principal",
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: "call-center",
                  list: "/call-center",
                  meta: {
                    label: "Centro de Llamadas",
                    icon: <PhoneOutlined />,
                  },
                },
                {
                  name: "customers",
                  list: "/customers",
                  create: "/customers/create",
                  edit: "/customers/edit/:id",
                  show: "/customers/show/:id",
                  meta: {
                    label: "Clientes",
                    icon: <UserOutlined />,
                  },
                },
                {
                  name: "subscriptions",
                  list: "/subscriptions",
                  create: "/subscriptions/create",
                  edit: "/subscriptions/edit/:id",
                  show: "/subscriptions/show/:id",
                  meta: {
                    label: "Suscripciones",
                    icon: <CreditCardOutlined />,
                  },
                },
                {
                  name: "evaluations",
                  list: "/evaluations",
                  create: "/evaluations/create",
                  edit: "/evaluations/edit/:id",
                  show: "/evaluations/show/:id",
                  meta: {
                    label: "Evaluaciones T&S",
                    icon: <ScanOutlined />,
                  },
                },
                {
                  name: "calls",
                  list: "/calls",
                  create: "/calls/create",
                  edit: "/calls/edit/:id",
                  show: "/calls/show/:id",
                  meta: {
                    label: "Llamadas",
                    icon: <PhoneOutlined />,
                    parent: "reports",
                  },
                },
                {
                  name: "sales",
                  list: "/sales",
                  create: "/sales/create",
                  edit: "/sales/edit/:id",
                  show: "/sales/show/:id",
                  meta: {
                    label: "Ventas",
                    icon: <DollarOutlined />,
                    parent: "reports",
                  },
                },
                {
                  name: "campaigns",
                  list: "/campaigns",
                  create: "/campaigns/create",
                  edit: "/campaigns/edit/:id",
                  show: "/campaigns/show/:id",
                  meta: {
                    label: "Campañas",
                    icon: <RocketOutlined />,
                  },
                },
                {
                  name: "employees",
                  list: "/employees",
                  create: "/employees/create",
                  edit: "/employees/edit/:id",
                  show: "/employees/show/:id",
                  meta: {
                    label: "Empleados",
                    icon: <TeamOutlined />,
                    parent: "administration",
                  },
                },
                {
                  name: "stores",
                  list: "/stores",
                  create: "/stores/create",
                  edit: "/stores/edit/:id",
                  show: "/stores/show/:id",
                  meta: {
                    label: "Tiendas",
                    icon: <ShopOutlined />,
                    parent: "administration",
                  },
                },
                {
                  name: "commissions",
                  list: "/commissions",
                  create: "/commissions/create",
                  edit: "/commissions/edit/:id",
                  show: "/commissions/show/:id",
                  meta: {
                    label: "Comisiones",
                    icon: <WalletOutlined />,
                    parent: "administration",
                  },
                },
                {
                  name: "achievements",
                  list: "/achievements",
                  create: "/achievements/create",
                  edit: "/achievements/edit/:id",
                  show: "/achievements/show/:id",
                  meta: {
                    label: "Logros",
                    icon: <TrophyOutlined />,
                    parent: "administration",
                  },
                },
                {
                  name: "scripts",
                  list: "/scripts",
                  create: "/scripts/create",
                  edit: "/scripts/edit/:id",
                  show: "/scripts/show/:id",
                  meta: {
                    label: "Guiones",
                    icon: <FileTextOutlined />,
                    parent: "tools",
                  },
                },
                // Stripe Resources
                {
                  name: "stripeManagement",
                  list: "/stripe",
                  meta: {
                    label: "Gestión de Stripe",
                    icon: <CreditCardOutlined />,
                    parent: "tools",
                  },
                },
                // Shopify Resources
                {
                  name: "shopifySettings",
                  list: "/shopify/settings",
                  meta: {
                    label: "Configuración",
                    icon: <ApiOutlined />,
                    parent: "shopify",
                  },
                },
                {
                  name: "shopifyProducts",
                  list: "/shopify/products",
                  create: "/shopify/products/create",
                  edit: "/shopify/products/edit/:id",
                  show: "/shopify/products/show/:id",
                  meta: {
                    label: "Productos",
                    icon: <ShoppingCartOutlined />,
                    parent: "shopify",
                  },
                },
                {
                  name: "shopifyCustomers",
                  list: "/shopify/customers",
                  create: "/shopify/customers/create",
                  edit: "/shopify/customers/edit/:id",
                  show: "/shopify/customers/show/:id",
                  meta: {
                    label: "Clientes",
                    icon: <UserOutlined />,
                    parent: "shopify",
                  },
                },
                {
                  name: "shopifyCoupons",
                  list: "/shopify/coupons",
                  create: "/shopify/coupons/create",
                  edit: "/shopify/coupons/edit/:id",
                  show: "/shopify/coupons/show/:id",
                  meta: {
                    label: "Cupones",
                    icon: <TagOutlined />,
                    parent: "shopify",
                  },
                },
                // System Resources
                {
                  name: "activityLogs",
                  list: "/activity-logs",
                  show: "/activity-logs/show/:id",
                  meta: {
                    label: "Registro de Actividades",
                    icon: <HistoryOutlined />,
                    parent: "system",
                  },
                },
                {
                  name: "webhooks",
                  list: "/webhooks",
                  show: "/webhooks/show/:id",
                  meta: {
                    label: "Webhooks",
                    icon: <WebhookOutlined />,
                    parent: "system",
                  },
                },
                {
                  name: "webhookSettings",
                  list: "/webhooks/settings",
                  meta: {
                    label: "Configuración de Webhooks",
                    icon: <SettingOutlined />,
                    parent: "system",
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "sleep-plus-elite",
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<AuthenticatedLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="/call-center" element={<CallCenterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Customers */}
                  <Route path="/customers">
                    <Route index element={<CustomerList />} />
                    <Route path="create" element={<CustomerCreate />} />
                    <Route path="edit/:id" element={<CustomerEdit />} />
                    <Route path="show/:id" element={<CustomerShow />} />
                  </Route>

                  {/* Subscriptions */}
                  <Route path="/subscriptions">
                    <Route index element={<SubscriptionList />} />
                    <Route path="create" element={<SubscriptionCreate />} />
                    <Route path="edit/:id" element={<SubscriptionEdit />} />
                    <Route path="show/:id" element={<SubscriptionShow />} />
                  </Route>

                  {/* Evaluations */}
                  <Route path="/evaluations">
                    <Route index element={<EvaluationList />} />
                    <Route path="create" element={<EvaluationCreate />} />
                    <Route path="edit/:id" element={<EvaluationEdit />} />
                    <Route path="show/:id" element={<EvaluationShow />} />
                  </Route>

                  {/* Calls */}
                  <Route path="/calls">
                    <Route index element={<CallList />} />
                    <Route path="create" element={<CallCreate />} />
                    <Route path="edit/:id" element={<CallEdit />} />
                    <Route path="show/:id" element={<CallShow />} />
                  </Route>

                  {/* Sales */}
                  <Route path="/sales">
                    <Route index element={<SaleList />} />
                    <Route path="create" element={<SaleCreate />} />
                    <Route path="edit/:id" element={<SaleEdit />} />
                    <Route path="show/:id" element={<SaleShow />} />
                  </Route>

                  {/* Campaigns */}
                  <Route path="/campaigns">
                    <Route index element={<CampaignList />} />
                    <Route path="create" element={<CampaignCreate />} />
                    <Route path="edit/:id" element={<CampaignEdit />} />
                    <Route path="show/:id" element={<CampaignShow />} />
                  </Route>

                  {/* Employees */}
                  <Route path="/employees">
                    <Route index element={<EmployeeList />} />
                    <Route path="create" element={<EmployeeCreate />} />
                    <Route path="edit/:id" element={<EmployeeEdit />} />
                    <Route path="show/:id" element={<EmployeeShow />} />
                  </Route>

                  {/* Stores */}
                  <Route path="/stores">
                    <Route index element={<StoreList />} />
                    <Route path="create" element={<StoreCreate />} />
                    <Route path="edit/:id" element={<StoreEdit />} />
                    <Route path="show/:id" element={<StoreShow />} />
                  </Route>

                  {/* Commissions */}
                  <Route path="/commissions">
                    <Route index element={<CommissionList />} />
                    <Route path="create" element={<CommissionCreate />} />
                    <Route path="edit/:id" element={<CommissionEdit />} />
                    <Route path="show/:id" element={<CommissionShow />} />
                  </Route>

                  {/* Achievements */}
                  <Route path="/achievements">
                    <Route index element={<AchievementList />} />
                    <Route path="create" element={<AchievementCreate />} />
                    <Route path="edit/:id" element={<AchievementEdit />} />
                    <Route path="show/:id" element={<AchievementShow />} />
                  </Route>

                  {/* Scripts */}
                  <Route path="/scripts">
                    <Route index element={<ScriptList />} />
                    <Route path="create" element={<ScriptCreate />} />
                    <Route path="edit/:id" element={<ScriptEdit />} />
                    <Route path="show/:id" element={<ScriptShow />} />
                  </Route>

                  {/* Stripe */}
                  <Route path="/stripe" element={<StripeManagement />} />

                  {/* Shopify */}
                  <Route path="/shopify">
                    <Route path="settings" element={<ShopifySettingsPage />} />
                    
                    <Route path="products">
                      <Route index element={<ShopifyProductList />} />
                      <Route path="create" element={<ShopifyProductCreate />} />
                      <Route path="edit/:id" element={<ShopifyProductEdit />} />
                      <Route path="show/:id" element={<ShopifyProductShow />} />
                    </Route>

                    <Route path="customers">
                      <Route index element={<ShopifyCustomerList />} />
                      <Route path="create" element={<ShopifyCustomerCreate />} />
                      <Route path="edit/:id" element={<ShopifyCustomerEdit />} />
                      <Route path="show/:id" element={<ShopifyCustomerShow />} />
                    </Route>

                    <Route path="coupons">
                      <Route index element={<ShopifyCouponList />} />
                      <Route path="create" element={<ShopifyCouponCreate />} />
                      <Route path="edit/:id" element={<ShopifyCouponEdit />} />
                      <Route path="show/:id" element={<ShopifyCouponShow />} />
                    </Route>
                  </Route>

                  {/* Activity Logs */}
                  <Route path="/activity-logs">
                    <Route index element={<ActivityLogList />} />
                    <Route path="show/:id" element={<ActivityLogShow />} />
                  </Route>

                  {/* Webhooks */}
                  <Route path="/webhooks">
                    <Route index element={<WebhookList />} />
                    <Route path="show/:id" element={<WebhookShow />} />
                    <Route path="settings" element={<WebhookSettings />} />
                  </Route>

                  {/* Tasks and Leaderboard */}
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin">
                    <Route path="settings" element={<SystemSettingsPage />} />
                    <Route path="permissions" element={<PermissionsPage />} />
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ConfigProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
