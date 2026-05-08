import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { DashboardPage } from "./DashboardPage";
import { LoginPage } from "./LoginPage";
import { PlaceholderPage } from "./PlaceholderPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/dashboard",
    element: (
      <AdminLayout>
        <DashboardPage />
      </AdminLayout>
    )
  },
  {
    path: "/products",
    element: (
      <AdminLayout>
        <PlaceholderPage title="Products" />
      </AdminLayout>
    )
  },
  {
    path: "/leads",
    element: (
      <AdminLayout>
        <PlaceholderPage title="Leads" />
      </AdminLayout>
    )
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
