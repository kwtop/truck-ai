export type AdminMenuItem = {
  key: string;
  label: string;
  path: string;
  requiredPermission: string | null;
};

export const adminMenuItems: AdminMenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    requiredPermission: "dashboard:read"
  },
  {
    key: "products",
    label: "Products",
    path: "/products",
    requiredPermission: "product:read"
  },
  {
    key: "leads",
    label: "Leads",
    path: "/leads",
    requiredPermission: "lead:read"
  }
];

export function hasPermission(userPermissions: string[], requiredPermission: string | null) {
  return requiredPermission === null || userPermissions.includes(requiredPermission);
}

export function visibleMenuItems(userPermissions: string[]) {
  return adminMenuItems.filter((item) => hasPermission(userPermissions, item.requiredPermission));
}

export function findMenuItemByPath(pathname: string) {
  return adminMenuItems.find((item) => item.path === pathname) ?? null;
}

export function canAccessPath(pathname: string, userPermissions: string[]) {
  const item = findMenuItemByPath(pathname);
  return item === null || hasPermission(userPermissions, item.requiredPermission);
}
