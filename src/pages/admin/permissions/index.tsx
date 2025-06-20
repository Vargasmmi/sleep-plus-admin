import React, { useState, useEffect } from "react";
import { useList, useUpdate, useCreate, useDelete } from "@refinedev/core";
import { 
  Card, 
  Table, 
  Switch, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tabs,
  Alert,
  Popconfirm,
  Row,
  Col,
  Divider,
  App
} from "antd";
import {
  SafetyOutlined,
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { IRole, IPermission, IUserPermissionOverride, IEmployee } from "../../../interfaces";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Define all resources and their actions
const RESOURCES = [
  { key: 'dashboard', name: 'Dashboard', actions: ['view'] },
  { key: 'call-center', name: 'Call Center', actions: ['view'] },
  { key: 'customers', name: 'Customers', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'subscriptions', name: 'Subscriptions', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'evaluations', name: 'T&S Evaluations', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'employees', name: 'Employees', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'stores', name: 'Stores', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'calls', name: 'Calls', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'sales', name: 'Sales', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'campaigns', name: 'Campaigns', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'commissions', name: 'Commissions', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'achievements', name: 'Achievements', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'scripts', name: 'Scripts', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'systemSettings', name: 'System Settings', actions: ['view', 'edit'] },
  { key: 'permissions', name: 'Permissions', actions: ['view', 'edit'] },
  { key: 'dailyTasks', name: 'Daily Tasks', actions: ['list', 'view'] },
  { key: 'leaderboard', name: 'Leaderboard', actions: ['view'] },
  { key: 'activityLogs', name: 'Activity Logs', actions: ['list', 'show'] },
  { key: 'webhooks', name: 'Webhooks', actions: ['list', 'show'] },
  { key: 'webhookSettings', name: 'Webhook Settings', actions: ['view', 'edit'] },
  { key: 'shopifySettings', name: 'Shopify Settings', actions: ['view', 'edit'] },
  { key: 'shopifyProducts', name: 'Shopify Products', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'shopifyCustomers', name: 'Shopify Customers', actions: ['list', 'create', 'edit', 'delete', 'show'] },
  { key: 'shopifyCoupons', name: 'Shopify Coupons', actions: ['list', 'create', 'edit', 'delete', 'show'] },
];

export const PermissionsPage: React.FC = () => {
  const { notification } = App.useApp();
  const [activeTab, setActiveTab] = useState("roles");
  const [editingRole, setEditingRole] = useState<IRole | null>(null);
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [overrideModal, setOverrideModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  
  const [roleForm] = Form.useForm();
  const [overrideForm] = Form.useForm();

  // Fetch data
  const { data: rolesData, refetch: refetchRoles } = useList<IRole>({
    resource: "roles",
  });

  const { data: permissionsData, refetch: refetchPermissions } = useList<IPermission>({
    resource: "permissions",
  });

  const { data: overridesData, refetch: refetchOverrides } = useList<IUserPermissionOverride>({
    resource: "userPermissionOverrides",
  });

  const { data: employeesData } = useList<IEmployee>({
    resource: "employees",
  });

  const { mutate: updatePermission } = useUpdate<IPermission>();
  const { mutate: createRole } = useCreate<IRole>();
  const { mutate: updateRole } = useUpdate<IRole>();
  const { mutate: deleteRole } = useDelete<IRole>();
  const { mutate: createOverride } = useCreate<IUserPermissionOverride>();
  const { mutate: deleteOverride } = useDelete<IUserPermissionOverride>();

  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];
  const overrides = overridesData?.data || [];
  const employees = employeesData?.data || [];

  // Handle permission toggle
  const handlePermissionToggle = (roleId: string, resource: string, action: string, checked: boolean) => {
    const permission = permissions.find(
      p => p.roleId === roleId && p.resource === resource && p.action === action
    );

    if (permission) {
      updatePermission(
        {
          resource: "permissions",
          id: permission.id,
          values: { allowed: checked },
          mutationMode: "optimistic",
        },
        {
          onSuccess: () => {
            notification.success({
              message: "Permission Updated",
              description: `Permission has been ${checked ? 'granted' : 'revoked'}.`,
            });
            // Force immediate update of permissions
            refetchPermissions();
            // Reload the page after a short delay to ensure menu updates
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
          onError: (error) => {
            notification.error({
              message: "Error Updating Permission",
              description: error?.message || "Could not update permission",
            });
            refetchPermissions();
          },
        }
      );
    } else {
      notification.warning({
        message: "Permission Not Found",
        description: "Permission not found in database. Run fix-permissions.js script",
      });
    }
  };

  // Create new role
  const handleCreateRole = (values: any) => {
    createRole(
      {
        resource: "roles",
        values: {
          ...values,
          isSystem: false,
          permissions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          notification.success({
            message: "Role Created",
            description: "New role has been created successfully.",
          });
          setCreateRoleModal(false);
          roleForm.resetFields();
          refetchRoles();
        },
      }
    );
  };

  // Delete role
  const handleDeleteRole = (roleId: string) => {
    deleteRole(
      {
        resource: "roles",
        id: roleId,
      },
      {
        onSuccess: () => {
          notification.success({
            message: "Role Deleted",
            description: "Role has been deleted successfully.",
          });
          refetchRoles();
        },
      }
    );
  };

  // Create permission override
  const handleCreateOverride = (values: any) => {
    createOverride(
      {
        resource: "userPermissionOverrides",
        values: {
          ...values,
          createdAt: new Date().toISOString(),
          createdBy: "admin-001", // Should be current user
        },
      },
      {
        onSuccess: () => {
          notification.success({
            message: "Override Created",
            description: "Custom permissions have been applied.",
          });
          setOverrideModal(false);
          overrideForm.resetFields();
          refetchOverrides();
        },
      }
    );
  };

  // Role permissions table columns
  const getPermissionColumns = (roleId: string) => {
    const actionColumns = ['list', 'create', 'edit', 'delete', 'show', 'view'].map(action => ({
      title: action.charAt(0).toUpperCase() + action.slice(1),
      dataIndex: action,
      key: action,
      width: 100,
      align: 'center' as const,
      render: (_: any, record: any) => {
        if (!record.actions.includes(action)) return '-';
        
        const permission = permissions.find(
          p => p.roleId === roleId && p.resource === record.key && p.action === action
        );
        
        return (
          <Switch
            checked={permission?.allowed || false}
            onChange={(checked) => handlePermissionToggle(roleId, record.key, action, checked)}
            size="small"
          />
        );
      },
    }));

    return [
      {
        title: 'Resource',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left' as const,
        width: 200,
      },
      ...actionColumns,
    ];
  };

  const resourcesData = RESOURCES.map(r => ({
    key: r.key,
    name: r.name,
    actions: r.actions,
  }));

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <SafetyOutlined /> Permission Management
          </Title>
          <Text type="secondary">
            Manage system roles and permissions
          </Text>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Roles Tab */}
        <TabPane tab={<span><TeamOutlined /> Roles</span>} key="roles">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateRoleModal(true)}
              >
                Create New Role
              </Button>
            </div>

            {roles.map(role => (
              <Card
                key={role.id}
                title={
                  <Space>
                    <Text strong>{role.displayName}</Text>
                    <Tag color={role.isSystem ? 'blue' : 'green'}>
                      {role.isSystem ? 'System' : 'Custom'}
                    </Tag>
                  </Space>
                }
                extra={
                  !role.isSystem && (
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => setEditingRole(role)}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Are you sure you want to delete this role?"
                        onConfirm={() => handleDeleteRole(role.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    </Space>
                  )
                }
              >
                <Text type="secondary">{role.description}</Text>
                
                <Divider />
                
                <Table
                  dataSource={resourcesData}
                  columns={getPermissionColumns(role.id)}
                  pagination={false}
                  scroll={{ x: 1000 }}
                  size="small"
                />
              </Card>
            ))}
          </Space>
        </TabPane>

        {/* User Overrides Tab */}
        <TabPane tab={<span><UserOutlined /> User Permissions</span>} key="overrides">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message="Custom Permissions"
              description="Here you can grant or revoke specific permissions to individual users, regardless of their role."
              type="info"
              showIcon
            />

            <div style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOverrideModal(true)}
              >
                Add Override
              </Button>
            </div>

            <Table
              dataSource={overrides}
              columns={[
                {
                  title: 'User',
                  key: 'user',
                  render: (record: IUserPermissionOverride) => {
                    const employee = employees.find(e => e.id === record.userId);
                    return (
                      <Space>
                        <UserOutlined />
                        <Text>{employee ? `${employee.firstName} ${employee.lastName}` : record.userId}</Text>
                      </Space>
                    );
                  },
                },
                {
                  title: 'Permissions',
                  key: 'permissions',
                  render: (record: IUserPermissionOverride) => (
                    <Space wrap>
                      {record.permissions.map((perm, index) => (
                        <Tag
                          key={index}
                          color={perm.allowed ? 'green' : 'red'}
                          icon={perm.allowed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        >
                          {perm.resource}.{perm.action}
                        </Tag>
                      ))}
                    </Space>
                  ),
                },
                {
                  title: 'Reason',
                  dataIndex: 'reason',
                  key: 'reason',
                },
                {
                  title: 'Created',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date: string) => new Date(date).toLocaleDateString(),
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (record: IUserPermissionOverride) => (
                    <Popconfirm
                      title="Delete this override?"
                      onConfirm={() => {
                        deleteOverride(
                          {
                            resource: "userPermissionOverrides",
                            id: record.id,
                          },
                          {
                            onSuccess: () => {
                              notification.success({
                                message: "Override deleted",
                              });
                              refetchOverrides();
                            },
                          }
                        );
                      }}
                    >
                      <Button danger size="small" icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>
                  ),
                },
              ]}
            />
          </Space>
        </TabPane>
      </Tabs>

      {/* Create Role Modal */}
      <Modal
        title="Create New Role"
        visible={createRoleModal}
        onCancel={() => {
          setCreateRoleModal(false);
          roleForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleCreateRole}
        >
          <Form.Item
            name="name"
            label="Role Name (internal)"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="example: supervisor" />
          </Form.Item>

          <Form.Item
            name="displayName"
            label="Display Name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="Sales Supervisor" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input.TextArea rows={3} placeholder="Role description and responsibilities" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateRoleModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Role
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Create Override Modal */}
      <Modal
        title="Add Custom Permissions"
        visible={overrideModal}
        onCancel={() => {
          setOverrideModal(false);
          overrideForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={overrideForm}
          layout="vertical"
          onFinish={handleCreateOverride}
        >
          <Form.Item
            name="userId"
            label="User"
            rules={[{ required: true, message: 'Select a user' }]}
          >
            <Select placeholder="Select a user">
              {employees.map(emp => (
                <Option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.role}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Provide a reason' }]}
          >
            <Input.TextArea rows={2} placeholder="Reason for these special permissions" />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Add at least one permission' }]}
          >
            {/* This would be a more complex component in production */}
            <Alert
              message="Coming Soon"
              description="The interface for adding specific permissions will be available soon."
              type="info"
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setOverrideModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Override
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
