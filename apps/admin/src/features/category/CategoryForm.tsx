import { Form, Input, InputNumber, Select, TreeSelect } from "antd";
import type { FormInstance } from "antd";
import type { CategoryPayload, VehicleCategory } from "./categoryApi";
import { toCategoryOptions } from "./categoryTree";

type CategoryFormProps = {
  form: FormInstance<CategoryPayload>;
  categories: VehicleCategory[];
  editingCategory?: VehicleCategory | null;
};

export function CategoryForm({ form, categories, editingCategory }: CategoryFormProps) {
  return (
    <Form<CategoryPayload>
      form={form}
      layout="vertical"
      initialValues={{
        parentId: null,
        status: "ACTIVE",
        sortOrder: 0,
        seoConfig: "{}",
        displayConfig: "{}"
      }}
    >
      <Form.Item name="parentId" label="Parent category">
        <TreeSelect
          allowClear
          placeholder="Root category"
          treeData={toCategoryOptions(categories, editingCategory?.id)}
          treeDefaultExpandAll
        />
      </Form.Item>
      <Form.Item name="code" label="Code" rules={[{ required: true, message: "Code is required" }]}>
        <Input placeholder="FUEL_TANK_TRUCK" />
      </Form.Item>
      <Form.Item name="slug" label="Slug" rules={[{ required: true, message: "Slug is required" }]}>
        <Input placeholder="fuel-tank-truck" />
      </Form.Item>
      <Form.Item
        name="defaultName"
        label="Default name"
        rules={[{ required: true, message: "Default name is required" }]}
      >
        <Input placeholder="Fuel Tank Truck" />
      </Form.Item>
      <Form.Item name="defaultDescription" label="Default description">
        <Input.TextArea rows={3} placeholder="Short category description" />
      </Form.Item>
      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: "Status is required" }]}
      >
        <Select
          options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Disabled", value: "DISABLED" }
          ]}
        />
      </Form.Item>
      <Form.Item
        name="sortOrder"
        label="Sort order"
        rules={[{ required: true, message: "Sort order is required" }]}
      >
        <InputNumber min={0} precision={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="seoConfig" label="SEO config">
        <Input.TextArea rows={4} placeholder="{}" />
      </Form.Item>
      <Form.Item name="displayConfig" label="Display config">
        <Input.TextArea rows={4} placeholder="{}" />
      </Form.Item>
    </Form>
  );
}
