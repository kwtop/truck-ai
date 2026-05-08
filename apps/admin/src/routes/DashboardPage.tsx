import { Button, Layout, Space, Tag, Typography } from "antd";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout className="admin-layout">
      <Layout.Header className="admin-header">
        <div>
          <Typography.Text className="brand-kicker">B2B Truck CMS</Typography.Text>
          <Typography.Title level={2}>Admin Dashboard</Typography.Title>
        </div>
        <Space>
          <Typography.Text>{user.displayName}</Typography.Text>
          <Button onClick={logout}>Sign out</Button>
        </Space>
      </Layout.Header>
      <Layout.Content className="admin-content">
        <section className="dashboard-section">
          <Typography.Title level={3}>Signed in as {user.username}</Typography.Title>
          <Space size={[8, 8]} wrap>
            {permissions.map((permission) => (
              <Tag key={permission} color="processing">
                {permission}
              </Tag>
            ))}
          </Space>
        </section>
      </Layout.Content>
    </Layout>
  );
}
