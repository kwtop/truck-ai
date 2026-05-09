import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { AttributePage } from "@/features/attribute/AttributePage";
import { CategoryPage } from "@/features/category/CategoryPage";
import { MediaPage } from "@/features/media/MediaPage";
import { PageBuilderPage } from "@/features/page/PageBuilderPage";
import { ProductPage } from "@/features/product/ProductPage";
import { LeadPage } from "@/features/lead/LeadPage";
import { AiChatSessionPage } from "@/features/ai/AiChatSessionPage";
import { AdminLayout } from "./AdminLayout";
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
        <ProductPage />
      </AdminLayout>
    )
  },
  {
    path: "/categories",
    element: (
      <AdminLayout>
        <CategoryPage />
      </AdminLayout>
    )
  },
  {
    path: "/attributes",
    element: (
      <AdminLayout>
        <AttributePage />
      </AdminLayout>
    )
  },
  {
    path: "/media",
    element: (
      <AdminLayout>
        <MediaPage />
      </AdminLayout>
    )
  },
  {
    path: "/pages",
    element: (
      <AdminLayout>
        <PageBuilderPage />
      </AdminLayout>
    )
  },
  {
    path: "/leads",
    element: (
      <AdminLayout>
        <LeadPage />
      </AdminLayout>
    )
  },
  {
    path: "/ai/chat-sessions",
    element: (
      <AdminLayout>
        <AiChatSessionPage />
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
