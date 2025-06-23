import { useState, useEffect } from "react";
import { useGetIdentity } from "@refinedev/core";
import { IEmployee } from "../interfaces";

interface PermissionCheck {
  resource: string;
  action: string;
  allowed: boolean;
}

export const usePermissions = () => {
  const { data: identity } = useGetIdentity<IEmployee>();
  const [permissions, setPermissions] = useState<PermissionCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchPermissions = async () => {
    if (!identity) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch all permissions for this role
      const rolePermissionsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/permissions?roleId=role-${identity.role}`
      );
      const rolePermissions = await rolePermissionsResponse.json();

      // Fetch user-specific overrides
      const overridesResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/userPermissionOverrides?userId=${identity.id}`
      );
      const overridesData = await overridesResponse.json();

      // Create a map of permissions
      const permissionMap = new Map<string, boolean>();

      // First, add all role permissions
      rolePermissions.forEach((perm: any) => {
        const key = `${perm.resource}:${perm.action}`;
        permissionMap.set(key, perm.allowed);
      });

      // Then, apply user overrides
      if (overridesData.length > 0) {
        const userOverride = overridesData[0];
        userOverride.permissions.forEach((override: any) => {
          const key = `${override.resource}:${override.action}`;
          permissionMap.set(key, override.allowed);
        });
      }

      // Convert map to array
      const permissionsArray: PermissionCheck[] = [];
      permissionMap.forEach((allowed, key) => {
        const [resource, action] = key.split(":");
        permissionsArray.push({ resource, action, allowed });
      });

      setPermissions(permissionsArray);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    // Removed the interval - only fetch once when component mounts
  }, [identity?.id, identity?.role]);

  const can = (resource: string, action: string): boolean => {
    const permission = permissions.find(
      p => p.resource === resource && p.action === action
    );
    return permission?.allowed || false;
  };

  const canAny = (resource: string, actions: string[]): boolean => {
    return actions.some(action => can(resource, action));
  };

  const refreshPermissions = () => {
    fetchPermissions();
  };

  return {
    permissions,
    can,
    canAny,
    isLoading,
    lastUpdate,
    refreshPermissions,
  };
};
