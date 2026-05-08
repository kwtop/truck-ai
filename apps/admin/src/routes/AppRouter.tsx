import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { DashboardPage } from "./DashboardPage";
import { LoginPage } from "./LoginPage";

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
    element: <DashboardPage />
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
