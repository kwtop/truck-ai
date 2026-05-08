import { Button, Layout, Menu, Space, Typography } from "antd";
import type { PropsWithChildren } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { canAccessPath, visibleMenuItems } from "@/lib/permissions/menu";
import { useAuthStore } from "@/stores/authStore";

export function AdminLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const menuItems = visibleMenuItems(permissions);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessPath(location.pathname, permissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout className="admin-layout">
      <Layout.Sider className="admin-sider" width={224}>
        <div className="admin-sider-brand">
          <Typography.Text className="brand-kicker">B2B Truck CMS</Typography.Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map((item) => ({
            key: item.path,
            label: item.label
          }))}
          onClick={(event) => navigate(event.key)}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="admin-header">
          <Typography.Title level={2}>Admin Dashboard</Typography.Title>
          <Space>
            <Typography.Text>{user.displayName}</Typography.Text>
            <Button onClick={logout}>Sign out</Button>
          </Space>
        </Layout.Header>
        <Layout.Content className="admin-content">{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
