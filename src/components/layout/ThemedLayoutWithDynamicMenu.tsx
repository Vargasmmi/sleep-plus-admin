import React, { useEffect, useState } from "react";
import { ThemedLayoutV2, ThemedSiderV2 } from "@refinedev/antd";
import { useGetIdentity, useResource, useCanAccess } from "@refinedev/core";
import { IEmployee } from "../../interfaces";

export const ThemedLayoutWithDynamicMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: identity } = useGetIdentity<IEmployee>();
  const { resources } = useResource();
  const [filteredResources, setFilteredResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkResourceAccess = async () => {
      if (!identity || !resources) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log("Checking permissions for user:", identity.email, "with role:", identity.role);
      
      // Check permissions for each resource
      const checkedResources = await Promise.all(
        resources.map(async (resource) => {
          // Skip parent/group resources (they don't have list/show)
          if (!resource.list && !resource.show && !resource.create) {
            return { resource, canAccess: true };
          }

          try {
            // First check list permission
            const listResponse = await fetch(`http://localhost:3001/permissions?roleId=role-${identity.role}&resource=${resource.name}&action=list`);
            const listPermissions = await listResponse.json();
            const canList = listPermissions[0]?.allowed || false;

            // Also check view permission for dashboard-like resources
            const viewResponse = await fetch(`http://localhost:3001/permissions?roleId=role-${identity.role}&resource=${resource.name}&action=view`);
            const viewPermissions = await viewResponse.json();
            const canView = viewPermissions[0]?.allowed || false;

            // Check for user-specific overrides
            const overrideResponse = await fetch(`http://localhost:3001/userPermissionOverrides?userId=${identity.id}`);
            const overrides = await overrideResponse.json();
            
            let hasOverride = false;
            if (overrides.length > 0) {
              const userOverride = overrides[0];
              const listOverride = userOverride.permissions.find(
                (p: any) => p.resource === resource.name && p.action === "list"
              );
              const viewOverride = userOverride.permissions.find(
                (p: any) => p.resource === resource.name && p.action === "view"
              );
              
              if (listOverride) {
                hasOverride = true;
                canList = listOverride.allowed;
              }
              if (viewOverride) {
                hasOverride = true;
                canView = viewOverride.allowed;
              }
            }

            const canAccess = canList || canView;
            console.log(`Resource ${resource.name}: canList=${canList}, canView=${canView}, hasOverride=${hasOverride}, canAccess=${canAccess}`);
            
            return { resource, canAccess };
          } catch (error) {
            console.error(`Error checking access for ${resource.name}:`, error);
            return { resource, canAccess: false };
          }
        })
      );

      // Filter resources based on access
      const filtered = checkedResources
        .filter(({ canAccess }) => canAccess)
        .map(({ resource }) => resource);
      
      console.log("Filtered resources:", filtered.map(r => r.name));
      setFilteredResources(filtered);
      setIsLoading(false);
    };

    checkResourceAccess();
    
    // Re-check permissions every 5 seconds to catch updates
    const interval = setInterval(checkResourceAccess, 5000);
    
    return () => clearInterval(interval);
  }, [identity, resources]);

  // Create a custom Sider that uses filtered resources
  const CustomSider: React.FC = () => {
    return (
      <ThemedSiderV2
        render={({ items, logout, collapsed }) => {
          // Filter menu items based on our filtered resources
          const filteredItems = items.filter((item: any) => {
            // Always show logout
            if (item.key === "logout") return true;
            
            // Check if this item is in our filtered resources
            const resourceName = item.key;
            return filteredResources.some(r => r.name === resourceName);
          });

          return (
            <>
              {filteredItems}
              {logout}
            </>
          );
        }}
      />
    );
  };

  // Pass filtered resources to the layout context
  if (isLoading) {
    return (
      <ThemedLayoutV2>
        {children}
      </ThemedLayoutV2>
    );
  }

  return (
    <ThemedLayoutV2 Sider={CustomSider}>
      {children}
    </ThemedLayoutV2>
  );
};
