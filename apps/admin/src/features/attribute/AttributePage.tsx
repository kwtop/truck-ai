import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Empty, Form, Modal, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { listCategories } from "@/features/category/categoryApi";
import { useAuthStore } from "@/stores/authStore";
import { AttributeForm } from "./AttributeForm";
import { createAttribute, listAttributes, updateAttribute } from "./attributeApi";
import type { AttributePayload, VehicleAttributeDefinition } from "./attributeApi";
import {
  attributeToFormValues,
  defaultAttributeFormValues,
  formValuesToPayload
} from "./attributeFormModel";
import type { AttributeFormValues } from "./attributeFormModel";
import { flattenCategoryOptions } from "./categoryOptions";

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; attribute: VehicleAttributeDefinition }
  | null;

export function AttributePage() {
  const [form] = Form.useForm<AttributeFormValues>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const permissions = useAuthStore((state) => state.permissions);
  const canWrite = permissions.includes("attribute:write");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", "attribute-selector"],
    queryFn: () => listCategories({ status: "ALL" })
  });

  const categoryOptions = useMemo(
    () => flattenCategoryOptions(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  );

  const attributesQuery = useQuery({
    queryKey: ["admin-attributes", selectedCategoryId],
    queryFn: () => listAttributes(selectedCategoryId as number),
    enabled: selectedCategoryId !== null
  });

  const saveMutation = useMutation({
    mutationFn: (payload: AttributePayload) => {
      if (modalState?.mode === "edit") {
        return updateAttribute(modalState.attribute.id, payload);
      }
      return createAttribute(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-attributes"] });
      setModalState(null);
      form.resetFields();
      message.success("Attribute saved");
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "Unable to save attribute");
    }
  });

  function openCreate() {
    if (selectedCategoryId === null) {
      message.warning("Select a category first");
      return;
    }

    setModalState({ mode: "create" });
    form.setFieldsValue(defaultAttributeFormValues(selectedCategoryId));
  }

  function openEdit(attribute: VehicleAttributeDefinition) {
    setModalState({ mode: "edit", attribute });
    form.setFieldsValue(attributeToFormValues(attribute));
  }

  async function saveForm() {
    const values = await form.validateFields();
    try {
      saveMutation.mutate(formValuesToPayload(values));
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Invalid attribute form");
    }
  }

  const columns: ColumnsType<VehicleAttributeDefinition> = [
    {
      title: "Attribute",
      dataIndex: "defaultLabel",
      key: "defaultLabel",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.defaultLabel}</Typography.Text>
          <Typography.Text type="secondary">{record.code}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Type",
      dataIndex: "dataType",
      key: "dataType",
      width: 140
    },
    {
      title: "Flags",
      key: "flags",
      render: (_, record) => (
        <Space wrap>
          {record.required ? <Tag color="blue">Required</Tag> : null}
          {record.filterable ? <Tag color="green">Filter</Tag> : null}
          {record.comparable ? <Tag color="purple">Compare</Tag> : null}
        </Space>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value) => <Tag color={value === "ACTIVE" ? "green" : "default"}>{value}</Tag>
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
      width: 120,
      render: (_, record) => (
        <Button size="small" disabled={!canWrite} onClick={() => openEdit(record)}>
          Edit
        </Button>
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
          <Typography.Title level={3}>Attribute Templates</Typography.Title>
          <Typography.Text type="secondary">
            Configure dynamic specs for each vehicle category.
          </Typography.Text>
        </div>
        <Button type="primary" disabled={!canWrite || selectedCategoryId === null} onClick={openCreate}>
          New attribute
        </Button>
      </div>

      <Card bordered={false}>
        <Space wrap>
          <Select
            loading={categoriesQuery.isLoading}
            placeholder="Select category"
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            options={categoryOptions}
            style={{ width: 320, maxWidth: "72vw" }}
          />
          <Typography.Text type="secondary">
            {selectedCategoryId === null ? "Select a category to edit its parameters" : "Category selected"}
          </Typography.Text>
        </Space>
      </Card>

      <Table<VehicleAttributeDefinition>
        rowKey="id"
        columns={columns}
        dataSource={attributesQuery.data ?? []}
        loading={attributesQuery.isLoading}
        pagination={false}
        locale={{
          emptyText:
            selectedCategoryId === null ? (
              <Empty description="Select a category" />
            ) : attributesQuery.isError ? (
              <Empty description={getErrorMessage(attributesQuery.error)} />
            ) : (
              <Empty description="No attributes" />
            )
        }}
      />

      <Modal
        title={modalState?.mode === "edit" ? "Edit attribute" : "New attribute"}
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
        <AttributeForm form={form} categoryOptions={categoryOptions} />
      </Modal>
    </section>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load attributes";
}
