import { Checkbox, Form, Input, InputNumber, Select } from "antd";
import type { FormInstance } from "antd";
import type { AttributeFormValues } from "./attributeFormModel";
import type { FlatCategoryOption } from "./categoryOptions";

type AttributeFormProps = {
  form: FormInstance<AttributeFormValues>;
  categoryOptions: FlatCategoryOption[];
};

export function AttributeForm({ form, categoryOptions }: AttributeFormProps) {
  return (
    <Form<AttributeFormValues>
      form={form}
      layout="vertical"
      initialValues={{
        dataType: "text",
        options: "[]",
        validationRules: "{}",
        uiConfig: "{}",
        required: false,
        filterable: false,
        comparable: false,
        sortOrder: 0,
        status: "ACTIVE"
      }}
    >
      <Form.Item
        name="categoryId"
        label="Category"
        rules={[{ required: true, message: "Category is required" }]}
      >
        <Select options={categoryOptions} placeholder="Select category" />
      </Form.Item>
      <Form.Item name="code" label="Code" rules={[{ required: true, message: "Code is required" }]}>
        <Input placeholder="tank_capacity" />
      </Form.Item>
      <Form.Item
        name="defaultLabel"
        label="Default label"
        rules={[{ required: true, message: "Default label is required" }]}
      >
        <Input placeholder="Tank Capacity" />
      </Form.Item>
      <Form.Item
        name="dataType"
        label="Data type"
        rules={[{ required: true, message: "Data type is required" }]}
      >
        <Select
          options={[
            { label: "Number", value: "number" },
            { label: "Text", value: "text" },
            { label: "Select", value: "select" },
            { label: "Multi select", value: "multi_select" },
            { label: "Boolean", value: "boolean" },
            { label: "Range", value: "range" }
          ]}
        />
      </Form.Item>
      <Form.Item name="unit" label="Unit">
        <Input placeholder="L" />
      </Form.Item>
      <Form.Item name="options" label="Options JSON">
        <Input.TextArea rows={4} placeholder={'["Carbon Steel","Stainless Steel"]'} />
      </Form.Item>
      <Form.Item name="validationRules" label="Validation rules JSON">
        <Input.TextArea rows={4} placeholder='{"min":1000,"max":50000}' />
      </Form.Item>
      <Form.Item name="uiConfig" label="UI config JSON">
        <Input.TextArea rows={4} placeholder='{"widget":"number"}' />
      </Form.Item>
      <Form.Item name="sortOrder" label="Sort order">
        <InputNumber min={0} precision={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="status" label="Status">
        <Select
          options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Disabled", value: "DISABLED" }
          ]}
        />
      </Form.Item>
      <Form.Item>
        <Checkbox.Group>
          <Form.Item name="required" valuePropName="checked" noStyle>
            <Checkbox>Required</Checkbox>
          </Form.Item>
          <Form.Item name="filterable" valuePropName="checked" noStyle>
            <Checkbox>Filterable</Checkbox>
          </Form.Item>
          <Form.Item name="comparable" valuePropName="checked" noStyle>
            <Checkbox>Comparable</Checkbox>
          </Form.Item>
        </Checkbox.Group>
      </Form.Item>
    </Form>
  );
}
