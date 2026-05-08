import { Space, Tag, Typography } from "antd";
import { useAuthStore } from "@/stores/authStore";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);

  return (
    <section className="dashboard-section">
      <Typography.Title level={3}>Signed in as {user?.username}</Typography.Title>
      <Space size={[8, 8]} wrap>
        {permissions.map((permission) => (
          <Tag key={permission} color="processing">
            {permission}
          </Tag>
        ))}
      </Space>
    </section>
  );
}
