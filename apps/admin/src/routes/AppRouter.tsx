import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
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
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
