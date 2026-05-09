import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Empty, Form, Input, Modal, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { listAttributes } from "@/features/attribute/attributeApi";
import { flattenCategoryOptions } from "@/features/attribute/categoryOptions";
import { listCategories } from "@/features/category/categoryApi";
import { useAuthStore } from "@/stores/authStore";
import { ProductForm } from "./ProductForm";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  upsertProductTranslation
} from "./productApi";
import type { Product, ProductPayload, ProductStatus } from "./productApi";
import {
  productCategoryLabel,
  productEmptyDescription,
  productFlagLabels,
  productStatusColor
} from "./productTablePresentation";
import {
  defaultProductFormValues,
  formValuesToProductPayload,
  formValuesToTranslationPayload,
  productToFormValues
} from "./productFormModel";
import type { ProductFormValues } from "./productFormModel";

type ModalState = { mode: "create" } | { mode: "edit"; product: Product } | null;

export function ProductPage() {
  const [form] = Form.useForm<ProductFormValues>();
  const selectedFormCategoryId = Form.useWatch("categoryId", form);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<ProductStatus | "ALL">("ALL");
  const [modalState, setModalState] = useState<ModalState>(null);
  const queryClient = useQueryClient();
  const { message, modal } = App.useApp();
  const permissions = useAuthStore((state) => state.permissions);
  const canWrite = permissions.includes("product:write");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", "product-selector"],
    queryFn: () => listCategories({ status: "ALL" })
  });

  const categoryOptions = useMemo(
    () => flattenCategoryOptions(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  );

  const productsQuery = useQuery({
    queryKey: ["admin-products", categoryId, keyword, status],
    queryFn: () => listProducts({ categoryId, keyword, status })
  });

  const attributesQuery = useQuery({
    queryKey: ["admin-attributes", selectedFormCategoryId],
    queryFn: () => listAttributes(selectedFormCategoryId as number),
    enabled: modalState !== null && selectedFormCategoryId !== null && selectedFormCategoryId !== undefined
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: ProductPayload) => {
      const product =
        modalState?.mode === "edit"
          ? await updateProduct(modalState.product.id, payload)
          : await createProduct(payload);

      const values = form.getFieldsValue(true);
      const translationPayload = formValuesToTranslationPayload(values);
      if (translationPayload && values.translationLocale.trim()) {
        await upsertProductTranslation(product.id, values.translationLocale.trim(), translationPayload);
      }

      return product;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setModalState(null);
      form.resetFields();
      message.success("Product saved");
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "Unable to save product");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      message.success("Product deleted");
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "Unable to delete product");
    }
  });

  function openCreate() {
    setModalState({ mode: "create" });
    setProductFormValues(defaultProductFormValues(categoryId), form);
  }

  function openEdit(product: Product) {
    setModalState({ mode: "edit", product });
    setProductFormValues(productToFormValues(product), form);
  }

  async function saveForm() {
    const values = await form.validateFields();
    try {
      saveMutation.mutate(formValuesToProductPayload(values));
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Invalid product form");
    }
  }

  function confirmDelete(product: Product) {
    modal.confirm({
      title: "Delete product",
      content: `Delete ${product.defaultName}?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(product.id)
    });
  }

  const categoryNameById = useMemo(() => {
    return new Map(categoryOptions.map((option) => [option.value, option.label.trim()]));
  }, [categoryOptions]);

  const columns: ColumnsType<Product> = [
    {
      title: "Product",
      dataIndex: "defaultName",
      key: "defaultName",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.defaultName}</Typography.Text>
          <Typography.Text type="secondary">{record.sku || record.slug}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (value: number) => productCategoryLabel(categoryNameById, value)
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (value: ProductStatus) => (
        <Tag color={productStatusColor(value)}>{value}</Tag>
      )
    },
    {
      title: "Flags",
      key: "flags",
      width: 180,
      render: (_, record) => (
        <Space wrap>
          {productFlagLabels(record).map((flag) => (
            <Tag key={flag.label} color={flag.color}>
              {flag.label}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: "Sort",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 90
    },
    {
      title: "Actions",
      key: "actions",
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" disabled={!canWrite} onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Button size="small" danger disabled={!canWrite} onClick={() => confirmDelete(record)}>
            Delete
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
          <Typography.Title level={3}>Products</Typography.Title>
          <Typography.Text type="secondary">
            Manage product drafts, publishing, dynamic specs, translations and SEO defaults.
          </Typography.Text>
        </div>
        <Button type="primary" disabled={!canWrite} onClick={openCreate}>
          New product
        </Button>
      </div>

      <Card bordered={false}>
        <Space wrap>
          <Select
            allowClear
            loading={categoriesQuery.isLoading}
            placeholder="All categories"
            value={categoryId}
            onChange={(value) => setCategoryId(value ?? null)}
            options={categoryOptions}
            style={{ width: 280, maxWidth: "72vw" }}
          />
          <Input.Search
            allowClear
            placeholder="Search SKU, slug or name"
            onSearch={setKeyword}
            style={{ width: 280, maxWidth: "72vw" }}
          />
          <Select
            value={status}
            onChange={setStatus}
            style={{ width: 160 }}
            options={[
              { label: "All statuses", value: "ALL" },
              { label: "Draft", value: "DRAFT" },
              { label: "Published", value: "PUBLISHED" },
              { label: "Offline", value: "OFFLINE" }
            ]}
          />
        </Space>
      </Card>

      <Table<Product>
        rowKey="id"
        columns={columns}
        dataSource={productsQuery.data ?? []}
        loading={productsQuery.isLoading}
        pagination={false}
        locale={{
          emptyText: productsQuery.isError ? (
            <Empty description={productEmptyDescription(productsQuery.error)} />
          ) : (
            <Empty description={productEmptyDescription(null)} />
          )
        }}
      />

      <Modal
        title={modalState?.mode === "edit" ? "Edit product" : "New product"}
        open={modalState !== null}
        okText="Save"
        confirmLoading={saveMutation.isPending}
        onOk={saveForm}
        onCancel={() => {
          setModalState(null);
          form.resetFields();
        }}
        destroyOnClose
        width={760}
      >
        <ProductForm
          form={form}
          categoryOptions={categoryOptions}
          attributes={attributesQuery.data ?? []}
          loadingAttributes={attributesQuery.isLoading}
        />
      </Modal>
    </section>
  );
}

function setProductFormValues(values: ProductFormValues, form: ReturnType<typeof Form.useForm<ProductFormValues>>[0]) {
  // Ant Design narrows nested object fields too aggressively for dynamic spec keys.
  form.setFieldsValue(values as Parameters<typeof form.setFieldsValue>[0]);
}
