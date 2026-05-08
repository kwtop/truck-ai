import { Button, Card, Form, Input, Space, Tag, Typography, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthApiError, login } from "@/features/auth/authApi";
import { useAuthStore } from "@/stores/authStore";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setLoginSession = useAuthStore((state) => state.setLoginSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: ""
    }
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      return;
    }

    try {
      const response = await login(parsed.data);
      setLoginSession(response);
      message.success("Signed in");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const description = error instanceof AuthApiError ? error.message : "Unable to sign in";
      message.error(description);
    }
  });

  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <div>
            <Typography.Text className="brand-kicker">B2B Truck CMS</Typography.Text>
            <Typography.Title id="login-title" level={1}>
              Admin Login
            </Typography.Title>
          </div>
          <Tag color="processing">B5</Tag>
        </div>

        <Card className="login-card" bordered={false}>
          <Form layout="vertical" onFinish={onSubmit} requiredMark={false}>
            <Form.Item
              label="Username"
              validateStatus={errors.username ? "error" : undefined}
              help={errors.username?.message}
            >
              <Controller
                control={control}
                name="username"
                rules={{ required: "Username is required" }}
                render={({ field }) => <Input {...field} autoComplete="username" placeholder="admin" />}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              validateStatus={errors.password ? "error" : undefined}
              help={errors.password?.message}
            >
              <Controller
                control={control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    autoComplete="current-password"
                    placeholder="Password"
                  />
                )}
              />
            </Form.Item>

            <Space direction="vertical" size={14} className="login-actions">
              <Button type="primary" htmlType="submit" loading={isSubmitting} block>
                Sign in
              </Button>
            </Space>
          </Form>
        </Card>
      </section>
    </main>
  );
}
