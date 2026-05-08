import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CategoryPayload, CategoryStatus, VehicleCategory } from "./categoryApi";
import { createCategory, listCategories, updateCategory } from "./categoryApi";
import { CategoryForm } from "./CategoryForm";
import { countCategories } from "./categoryTree";
import { useAuthStore } from "@/stores/authStore";

type ModalState =
  | { mode: "create"; parent?: VehicleCategory | null }
  | { mode: "edit"; category: VehicleCategory }
  | null;

export function CategoryPage() {
  const [form] = Form.useForm<CategoryPayload>();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<CategoryStatus | "ALL">("ALL");
  const [modalState, setModalState] = useState<ModalState>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const permissions = useAuthStore((state) => state.permissions);
  const canWrite = permissions.includes("category:write");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", keyword, status],
    queryFn: () => listCategories({ keyword, status })
  });

  const saveMutation = useMutation({
    mutationFn: (payload: CategoryPayload) => {
      if (modalState?.mode === "edit") {
        return updateCategory(modalState.category.id, payload);
      }
      return createCategory(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setModalState(null);
      form.resetFields();
      message.success("Category saved");
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "Unable to save category");
    }
  });

  const categories = categoriesQuery.data ?? [];
  const categoryCount = useMemo(() => countCategories(categories), [categories]);

  function openCreate(parent?: VehicleCategory | null) {
    setModalState({ mode: "create", parent });
    form.setFieldsValue({
      parentId: parent?.id ?? null,
      code: "",
      slug: "",
      defaultName: "",
      defaultDescription: "",
      status: "ACTIVE",
      sortOrder: 0,
      seoConfig: "{}",
      displayConfig: "{}"
    });
  }

  function openEdit(category: VehicleCategory) {
    setModalState({ mode: "edit", category });
    form.setFieldsValue(toFormValues(category));
  }

  function toggleStatus(category: VehicleCategory) {
    saveMutation.mutate({
      ...toFormValues(category),
      status: category.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
    });
  }

  function moveSortOrder(category: VehicleCategory, delta: number) {
    saveMutation.mutate({
      ...toFormValues(category),
      sortOrder: Math.max(0, category.sortOrder + delta)
    });
  }

  async function saveForm() {
    const values = await form.validateFields();
    saveMutation.mutate({
      ...values,
      parentId: values.parentId ?? null,
      defaultDescription: values.defaultDescription ?? "",
      seoConfig: values.seoConfig || "{}",
      displayConfig: values.displayConfig || "{}"
    });
  }

  const columns: ColumnsType<VehicleCategory> = [
    {
      title: "Category",
      dataIndex: "defaultName",
      key: "defaultName",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.defaultName}</Typography.Text>
          <Typography.Text type="secondary">{record.code}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug"
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: CategoryStatus) => (
        <Tag color={value === "ACTIVE" ? "green" : "default"}>{value}</Tag>
      )
    },
    {
      title: "Sort",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 180,
      render: (_, record) => (
        <Space>
          <Typography.Text>{record.sortOrder}</Typography.Text>
          <Button size="small" disabled={!canWrite} onClick={() => moveSortOrder(record, -10)}>
            Up
          </Button>
          <Button size="small" disabled={!canWrite} onClick={() => moveSortOrder(record, 10)}>
            Down
          </Button>
        </Space>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" disabled={!canWrite} onClick={() => openCreate(record)}>
            Add child
          </Button>
          <Button size="small" disabled={!canWrite} onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Button size="small" disabled={!canWrite} onClick={() => toggleStatus(record)}>
            {record.status === "ACTIVE" ? "Disable" : "Enable"}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap"
        }}
      >
        <div>
          <Typography.Title level={3}>Categories</Typography.Title>
          <Typography.Text type="secondary">
            Maintain vehicle category tree, SEO defaults, display config, status and sorting.
          </Typography.Text>
        </div>
        <Button type="primary" disabled={!canWrite} onClick={() => openCreate(null)}>
          New root category
        </Button>
      </div>

      <Card bordered={false}>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Search code, slug or name"
            onSearch={setKeyword}
            style={{ width: 320, maxWidth: "72vw" }}
          />
          <Select
            value={status}
            onChange={setStatus}
            style={{ width: 160 }}
            options={[
              { label: "All statuses", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Disabled", value: "DISABLED" }
            ]}
          />
          <Typography.Text type="secondary">{categoryCount} categories</Typography.Text>
        </Space>
      </Card>

      <Table<VehicleCategory>
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={categoriesQuery.isLoading}
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
        locale={{
          emptyText: categoriesQuery.isError ? (
            <Empty description={getErrorMessage(categoriesQuery.error)} />
          ) : (
            <Empty description="No categories" />
          )
        }}
      />

      <Modal
        title={modalState?.mode === "edit" ? "Edit category" : "New category"}
        open={modalState !== null}
        okText="Save"
        confirmLoading={saveMutation.isPending}
        onOk={saveForm}
        onCancel={() => {
          setModalState(null);
          form.resetFields();
        }}
        destroyOnClose
      >
        <CategoryForm
          form={form}
          categories={categories}
          editingCategory={modalState?.mode === "edit" ? modalState.category : null}
        />
      </Modal>
    </section>
  );
}

function toFormValues(category: VehicleCategory): CategoryPayload {
  return {
    parentId: category.parentId,
    code: category.code,
    slug: category.slug,
    defaultName: category.defaultName,
    defaultDescription: category.defaultDescription ?? "",
    status: category.status,
    sortOrder: category.sortOrder,
    seoConfig: category.seoConfig || "{}",
    displayConfig: category.displayConfig || "{}"
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load categories";
}
