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
    key: "categories",
    label: "Categories",
    path: "/categories",
    requiredPermission: "category:read"
  },
  {
    key: "attributes",
    label: "Attributes",
    path: "/attributes",
    requiredPermission: "attribute:read"
  },
  {
    key: "media",
    label: "Media",
    path: "/media",
    requiredPermission: "media:read"
  },
  {
    key: "pages",
    label: "Page Builder",
    path: "/pages",
    requiredPermission: "page:read"
  },
  {
    key: "leads",
    label: "Leads",
    path: "/leads",
    requiredPermission: "lead:read"
  },
  {
    key: "ai-chat-sessions",
    label: "AI Chats",
    path: "/ai/chat-sessions",
    requiredPermission: "ai:read"
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
