import { Checkbox, Form, Input, InputNumber, Select, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import type { VehicleAttributeDefinition } from "@/features/attribute/attributeApi";
import type { FlatCategoryOption } from "@/features/attribute/categoryOptions";
import type { ProductFormValues } from "./productFormModel";

type ProductFormProps = {
  form: FormInstance<ProductFormValues>;
  categoryOptions: FlatCategoryOption[];
  attributes: VehicleAttributeDefinition[];
  loadingAttributes?: boolean;
};

export function ProductForm({
  form,
  categoryOptions,
  attributes,
  loadingAttributes = false
}: ProductFormProps) {
  const activeAttributes = attributes.filter((attribute) => attribute.status === "ACTIVE");

  return (
    <Form<ProductFormValues>
      form={form}
      layout="vertical"
      initialValues={{
        status: "DRAFT",
        specs: {},
        seoConfigJson: "{}",
        shippingConfigJson: "{}",
        aiEnabled: true,
        featured: false,
        sortOrder: 0,
        translationLocale: "en-US",
        localizedSpecsJson: "{}"
      }}
    >
      <Typography.Title level={5}>Product</Typography.Title>
      <Form.Item
        name="categoryId"
        label="Category"
        rules={[{ required: true, message: "Category is required" }]}
      >
        <Select options={categoryOptions} placeholder="Select category" />
      </Form.Item>
      <Form.Item name="sku" label="SKU">
        <Input placeholder="SKU-10000L" />
      </Form.Item>
      <Form.Item name="slug" label="Slug" rules={[{ required: true, message: "Slug is required" }]}>
        <Input placeholder="fuel-tank-truck-10000l" />
      </Form.Item>
      <Form.Item
        name="defaultName"
        label="Default name"
        rules={[{ required: true, message: "Default name is required" }]}
      >
        <Input placeholder="10,000L Fuel Tank Truck" />
      </Form.Item>
      <Form.Item name="defaultSummary" label="Default summary">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Space size="large" wrap>
        <Form.Item name="status" label="Status">
          <Select
            style={{ width: 160 }}
            options={[
              { label: "Draft", value: "DRAFT" },
              { label: "Published", value: "PUBLISHED" },
              { label: "Offline", value: "OFFLINE" }
            ]}
          />
        </Form.Item>
        <Form.Item name="sortOrder" label="Sort order">
          <InputNumber min={0} precision={0} style={{ width: 140 }} />
        </Form.Item>
      </Space>
      <Form.Item>
        <Checkbox.Group>
          <Form.Item name="aiEnabled" valuePropName="checked" noStyle>
            <Checkbox>AI enabled</Checkbox>
          </Form.Item>
          <Form.Item name="featured" valuePropName="checked" noStyle>
            <Checkbox>Featured</Checkbox>
          </Form.Item>
        </Checkbox.Group>
      </Form.Item>

      <Typography.Title level={5}>Dynamic specs</Typography.Title>
      {loadingAttributes ? (
        <Typography.Text type="secondary">Loading specs template...</Typography.Text>
      ) : activeAttributes.length === 0 ? (
        <Typography.Text type="secondary">Select a category with active attributes.</Typography.Text>
      ) : (
        activeAttributes.map((attribute) => (
          <Form.Item
            key={attribute.id}
            name={["specs", attribute.code]}
            label={`${attribute.defaultLabel}${attribute.unit ? ` (${attribute.unit})` : ""}`}
            rules={attribute.required ? [{ required: true, message: `${attribute.defaultLabel} is required` }] : []}
          >
            {renderSpecInput(attribute)}
          </Form.Item>
        ))
      )}

      <Typography.Title level={5}>SEO and shipping</Typography.Title>
      <Form.Item name="seoConfigJson" label="SEO config JSON">
        <Input.TextArea rows={4} placeholder='{"title":"Fuel Tank Truck"}' />
      </Form.Item>
      <Form.Item name="shippingConfigJson" label="Shipping config JSON">
        <Input.TextArea rows={3} placeholder='{"container":"40HQ"}' />
      </Form.Item>

      <Typography.Title level={5}>Translation</Typography.Title>
      <Form.Item name="translationLocale" label="Locale">
        <Input placeholder="en-US" />
      </Form.Item>
      <Form.Item name="translationName" label="Localized name">
        <Input placeholder="10,000L Fuel Tank Truck" />
      </Form.Item>
      <Form.Item name="translationSummary" label="Localized summary">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="translationDescription" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item name="translationApplications" label="Applications">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="localizedSpecsJson" label="Localized specs JSON">
        <Input.TextArea rows={3} placeholder='{"tank_capacity":"10000 L"}' />
      </Form.Item>
      <Form.Item name="seoTitle" label="SEO title">
        <Input />
      </Form.Item>
      <Form.Item name="seoDescription" label="SEO description">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="seoKeywords" label="SEO keywords">
        <Input />
      </Form.Item>
      <Form.Item name="canonicalUrl" label="Canonical URL">
        <Input />
      </Form.Item>
      <Form.Item name="ogTitle" label="OG title">
        <Input />
      </Form.Item>
      <Form.Item name="ogDescription" label="OG description">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="ogImage" label="OG image">
        <Input />
      </Form.Item>
    </Form>
  );
}

function renderSpecInput(attribute: VehicleAttributeDefinition) {
  if (attribute.dataType === "number") {
    return <InputNumber style={{ width: "100%" }} />;
  }
  if (attribute.dataType === "boolean") {
    return (
      <Select
        allowClear
        options={[
          { label: "True", value: true },
          { label: "False", value: false }
        ]}
      />
    );
  }
  if (attribute.dataType === "select") {
    return <Select allowClear options={optionValues(attribute)} />;
  }
  if (attribute.dataType === "multi_select") {
    return <Select mode="multiple" allowClear options={optionValues(attribute)} />;
  }
  if (attribute.dataType === "range") {
    return <RangeInput />;
  }
  return <Input />;
}

function RangeInput({ value, onChange }: { value?: unknown; onChange?: (value: unknown) => void }) {
  const range = isRangeValue(value) ? value : {};
  return (
    <Space.Compact style={{ width: "100%" }}>
      <InputNumber
        placeholder="Min"
        value={typeof range.min === "number" ? range.min : null}
        onChange={(next) => onChange?.({ ...range, min: next ?? undefined })}
        style={{ width: "50%" }}
      />
      <InputNumber
        placeholder="Max"
        value={typeof range.max === "number" ? range.max : null}
        onChange={(next) => onChange?.({ ...range, max: next ?? undefined })}
        style={{ width: "50%" }}
      />
    </Space.Compact>
  );
}

function isRangeValue(value: unknown): value is { min?: number; max?: number } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function optionValues(attribute: VehicleAttributeDefinition) {
  try {
    const parsed = JSON.parse(attribute.options || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((value) => ({ label: String(value), value: String(value) }));
  } catch {
    return [];
  }
}
