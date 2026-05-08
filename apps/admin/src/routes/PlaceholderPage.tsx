import { Typography } from "antd";

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="dashboard-section">
      <Typography.Title level={3}>{title}</Typography.Title>
    </section>
  );
}
