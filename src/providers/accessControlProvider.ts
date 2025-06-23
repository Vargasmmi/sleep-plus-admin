import { AccessControlProvider } from "@refinedev/core";

// Define resource actions map
const RESOURCE_ACTIONS = {
  dashboard: ['view'],
  customers: ['list', 'create', 'edit', 'delete', 'show'],
  subscriptions: ['list', 'create', 'edit', 'delete', 'show'],
  evaluations: ['list', 'create', 'edit', 'delete', 'show'],
  employees: ['list', 'create', 'edit', 'delete', 'show'],
  stores: ['list', 'create', 'edit', 'delete', 'show'],
  calls: ['list', 'create', 'edit', 'delete', 'show'],
  sales: ['list', 'create', 'edit', 'delete', 'show'],
  campaigns: ['list', 'create', 'edit', 'delete', 'show'],
  commissions: ['list', 'create', 'edit', 'delete', 'show'],
  achievements: ['list', 'create', 'edit', 'delete', 'show'],
  scripts: ['list', 'create', 'edit', 'delete', 'show'],
  activityLogs: ['list', 'show'],
  webhooks: ['list', 'show'],
  webhookSettings: ['view', 'edit'],
  systemSettings: ['view', 'edit'],
  permissions: ['view', 'edit'],
  roles: ['list', 'create', 'edit', 'delete'],
  dailyGoals: ['list', 'create', 'edit', 'delete', 'show'],
  callTasks: ['list', 'create', 'edit', 'delete', 'show'],
  leaderboard: ['view'],
  stripeManagement: ['view', 'list'],
  dailyTasks: ['view', 'list'],
  shopifySettings: ['view', 'edit'],
  shopifyProducts: ['list', 'create', 'edit', 'delete', 'show'],
  shopifyCustomers: ['list', 'create', 'edit', 'delete', 'show'],
  shopifyCoupons: ['list', 'create', 'edit', 'delete', 'show'],
};

// Helper function to check permissions
const checkPermission = async (
  resource: string,
  action: string,
  userId: string,
  userRole: string
): Promise<{ can: boolean; reason?: string }> => {
  try {
    // First check user permission overrides
    const overridesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/userPermissionOverrides`);
    
    // Check if response is ok and is JSON
    if (!overridesResponse.ok || !overridesResponse.headers.get('content-type')?.includes('application/json')) {
      console.warn("userPermissionOverrides endpoint not available or not returning JSON");
      return getDefaultPermission(resource, action, userRole);
    }
    
    const overrides = await overridesResponse.json();
    
    if (Array.isArray(overrides)) {
      const userOverride = overrides.find((o: any) => o.userId === userId);
      if (userOverride) {
        const overridePermission = userOverride.permissions.find(
          (p: any) => p.resource === resource && p.action === action
        );
        if (overridePermission) {
          return {
          can: overridePermission.allowed,
          reason: overridePermission.allowed ? undefined : "Permission denied by user-specific configuration"
          };
        }
      }
    }

    // Then check role permissions
    const permissionsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/permissions`);
    
    // Check if response is ok and is JSON
    if (!permissionsResponse.ok || !permissionsResponse.headers.get('content-type')?.includes('application/json')) {
      console.warn("permissions endpoint not available or not returning JSON");
      return getDefaultPermission(resource, action, userRole);
    }
    
    const permissions = await permissionsResponse.json();
    
    if (Array.isArray(permissions)) {
      const rolePermission = permissions.find(
        (p: any) => p.resource === resource && p.action === action && p.roleId === `role-${userRole}`
      );

      if (rolePermission) {
        return {
          can: rolePermission.allowed,
          reason: rolePermission.allowed ? undefined : "You don't have permission to perform this action"
        };
      }
    }

    // Default permissions by role if not explicitly defined
    return getDefaultPermission(resource, action, userRole);
  } catch (error) {
    console.error("Error checking permissions:", error);
    // Fallback to default permissions
    return getDefaultPermission(resource, action, userRole);
  }
};

// Default permissions when database is not available
const getDefaultPermission = (
  resource: string,
  action: string,
  role: string
): { can: boolean; reason?: string } => {
  // Admin has full access
  if (role === "admin") {
    return { can: true };
  }

  // Manager permissions
  if (role === "manager") {
    const managerRestricted = {
      stores: ['create', 'delete'],
      systemSettings: ['edit'],
      permissions: ['view', 'edit'],
      roles: ['create', 'edit', 'delete'],
      webhooks: ['list', 'show'],
      webhookSettings: ['view', 'edit'],
    };

    if (managerRestricted[resource as keyof typeof managerRestricted]?.includes(action)) {
      return { can: false, reason: "Only administrators can perform this action" };
    }

    return { can: true };
  }

  // Agent permissions
  if (role === "agent") {
    const agentAllowed = {
      dashboard: ['view'],
      customers: ['list', 'show', 'edit'],
      subscriptions: ['list', 'show'],
      evaluations: ['list', 'show', 'create'],
      calls: ['list', 'show', 'create'],
      sales: ['list', 'show', 'create'],
      campaigns: ['list', 'show'],
      scripts: ['list', 'show'],
      dailyGoals: ['list', 'show'],
      callTasks: ['list', 'show', 'edit'],
      leaderboard: ['view'],
      achievements: ['list', 'show'],
    };

    if (agentAllowed[resource as keyof typeof agentAllowed]?.includes(action)) {
      return { can: true };
    }

    return { can: false, reason: "You don't have permission to access this section" };
  }

  return { can: false, reason: "Unrecognized role" };
};

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      return { can: false, reason: "You are not authenticated" };
    }

    const user = JSON.parse(auth);
    const { id: userId, role } = user;

    // Check permissions
    return checkPermission(resource || '', action || '', userId || '', role || '');
  },
};

// Additional helper functions for UI components
export const canAccessResource = async (resource: string, role: string): Promise<boolean> => {
  const actions = RESOURCE_ACTIONS[resource as keyof typeof RESOURCE_ACTIONS] || ['list'];
  
  for (const action of actions) {
    const permission = await checkPermission(resource, action, '', role);
    if (permission.can) {
      return true;
    }
  }
  
  return false;
};

export const getResourcePermissions = async (
  resource: string,
  userId: string,
  role: string
): Promise<Record<string, boolean>> => {
  const actions = RESOURCE_ACTIONS[resource as keyof typeof RESOURCE_ACTIONS] || ['list', 'create', 'edit', 'delete', 'show'];
  const permissions: Record<string, boolean> = {};

  for (const action of actions) {
    const permission = await checkPermission(resource, action, userId, role);
    permissions[action] = permission.can;
  }

  return permissions;
};

// Function to get all permissions for a user
export const getUserPermissions = async (userId: string, role: string): Promise<any[]> => {
  const allPermissions: any[] = [];

  for (const [resource, actions] of Object.entries(RESOURCE_ACTIONS)) {
    for (const action of actions) {
      const permission = await checkPermission(resource, action, userId, role);
      allPermissions.push({
        resource,
        action,
        allowed: permission.can,
        reason: permission.reason
      });
    }
  }

  return allPermissions;
};
