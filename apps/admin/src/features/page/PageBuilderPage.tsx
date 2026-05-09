import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAuthStore } from "@/stores/authStore";
import { createButton, listButtons, updateButton } from "@/features/button/buttonApi";
import type { ButtonActionType, ButtonStatus, SiteButtonConfig } from "@/features/button/buttonApi";
import {
  createPage,
  createPageBlock,
  listPageBlocks,
  listPages,
  updatePage,
  updatePageBlock
} from "./pageApi";
import type {
  SitePage,
  SitePageBlock,
  SitePageBlockType,
  SitePageStatus,
  SitePageType
} from "./pageApi";
import {
  blockToFormValues,
  buttonToFormValues,
  defaultBlockFormValues,
  defaultButtonFormValues,
  defaultPageFormValues,
  formValuesToBlockPayload,
  formValuesToButtonPayload,
  formValuesToPagePayload,
  pageToFormValues
} from "./pageFormModel";
import type {
  SiteButtonConfigFormValues,
  SitePageBlockFormValues,
  SitePageFormValues
} from "./pageFormModel";

type PageModalState = { mode: "create" } | { mode: "edit"; page: SitePage } | null;
type BlockModalState = { mode: "create" } | { mode: "edit"; block: SitePageBlock } | null;
type ButtonModalState = { mode: "create" } | { mode: "edit"; button: SiteButtonConfig } | null;

const PAGE_TYPE_OPTIONS: Array<{ label: string; value: SitePageType | "ALL" }> = [
  { label: "All page types", value: "ALL" },
  { label: "Home", value: "HOME" },
  { label: "Category", value: "CATEGORY" },
  { label: "Market", value: "MARKET" },
  { label: "Solution", value: "SOLUTION" },
  { label: "Custom", value: "CUSTOM" },
  { label: "Landing", value: "LANDING" }
];

const PAGE_STATUS_OPTIONS: Array<{ label: string; value: SitePageStatus | "ALL" }> = [
  { label: "All statuses", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Offline", value: "OFFLINE" }
];

const BLOCK_TYPE_OPTIONS: Array<{ label: string; value: SitePageBlockType | "ALL" }> = [
  { label: "All block types", value: "ALL" },
  { label: "Hero banner", value: "HERO_BANNER" },
  { label: "Rich text", value: "RICH_TEXT" },
  { label: "Featured products", value: "FEATURED_PRODUCTS" },
  { label: "Category grid", value: "CATEGORY_GRID" },
  { label: "Media gallery", value: "MEDIA_GALLERY" },
  { label: "FAQ", value: "FAQ" },
  { label: "CTA", value: "CTA" },
  { label: "Custom", value: "CUSTOM" }
];

const ACTION_TYPE_OPTIONS: Array<{ label: string; value: ButtonActionType | "ALL" }> = [
  { label: "All actions", value: "ALL" },
  { label: "RFQ", value: "RFQ" },
  { label: "WhatsApp", value: "WHATSAPP" },
  { label: "Download", value: "DOWNLOAD" },
  { label: "AI chat", value: "AI_CHAT" },
  { label: "Link", value: "LINK" }
];

const BUTTON_STATUS_OPTIONS: Array<{ label: string; value: ButtonStatus | "ALL" }> = [
  { label: "All statuses", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" }
];

export function PageBuilderPage() {
  const [pageForm] = Form.useForm<SitePageFormValues>();
  const [blockForm] = Form.useForm<SitePageBlockFormValues>();
  const [buttonForm] = Form.useForm<SiteButtonConfigFormValues>();
  const [pageType, setPageType] = useState<SitePageType | "ALL">("ALL");
  const [pageStatus, setPageStatus] = useState<SitePageStatus | "ALL">("ALL");
  const [pageLocale, setPageLocale] = useState("");
  const [pageKeyword, setPageKeyword] = useState("");
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [blockType, setBlockType] = useState<SitePageBlockType | "ALL">("ALL");
  const [blockVisible, setBlockVisible] = useState<boolean | "ALL">("ALL");
  const [buttonPlacement, setButtonPlacement] = useState("");
  const [buttonActionType, setButtonActionType] = useState<ButtonActionType | "ALL">("ALL");
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus | "ALL">("ALL");
  const [buttonKeyword, setButtonKeyword] = useState("");
  const [pageModal, setPageModal] = useState<PageModalState>(null);
  const [blockModal, setBlockModal] = useState<BlockModalState>(null);
  const [buttonModal, setButtonModal] = useState<ButtonModalState>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const permissions = useAuthStore((state) => state.permissions);
  const canWritePage = permissions.includes("page:write");
  const canWriteButton = permissions.includes("button:write");

  const pagesQuery = useQuery({
    queryKey: ["admin-site-pages", pageType, pageLocale, pageStatus, pageKeyword],
    queryFn: () => listPages({ pageType, locale: pageLocale, status: pageStatus, keyword: pageKeyword })
  });

  const blocksQuery = useQuery({
    queryKey: ["admin-site-page-blocks", selectedPageId, blockType, blockVisible],
    queryFn: () =>
      listPageBlocks({
        pageId: selectedPageId,
        blockType,
        visible: blockVisible,
        locale: selectedPage?.locale ?? ""
      })
  });

  const buttonsQuery = useQuery({
    queryKey: ["admin-site-buttons", buttonPlacement, buttonActionType, buttonStatus, buttonKeyword],
    queryFn: () =>
      listButtons({
        placement: buttonPlacement,
        actionType: buttonActionType,
        status: buttonStatus,
        keyword: buttonKeyword
      })
  });

  const pages = pagesQuery.data ?? [];
  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? null,
    [pages, selectedPageId]
  );
  const pageOptions = useMemo(
    () => pages.map((page) => ({ label: `${page.title} (${page.locale})`, value: page.id })),
    [pages]
  );

  const savePageMutation = useMutation({
    mutationFn: (values: SitePageFormValues) => {
      const payload = formValuesToPagePayload(values);
      return pageModal?.mode === "edit" ? updatePage(pageModal.page.id, payload) : createPage(payload);
    },
    onSuccess: async (page) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-site-pages"] });
      setSelectedPageId(page.id);
      closePageModal();
      message.success("Page saved");
    },
    onError: showError(message, "Unable to save page")
  });

  const saveBlockMutation = useMutation({
    mutationFn: (values: SitePageBlockFormValues) => {
      const payload = formValuesToBlockPayload(values);
      return blockModal?.mode === "edit"
        ? updatePageBlock(blockModal.block.id, payload)
        : createPageBlock(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-site-page-blocks"] });
      closeBlockModal();
      message.success("Block saved");
    },
    onError: showError(message, "Unable to save block")
  });

  const saveButtonMutation = useMutation({
    mutationFn: (values: SiteButtonConfigFormValues) => {
      const payload = formValuesToButtonPayload(values);
      return buttonModal?.mode === "edit"
        ? updateButton(buttonModal.button.id, payload)
        : createButton(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-site-buttons"] });
      closeButtonModal();
      message.success("Button saved");
    },
    onError: showError(message, "Unable to save button")
  });

  function openCreatePage() {
    setPageModal({ mode: "create" });
    pageForm.setFieldsValue(defaultPageFormValues());
  }

  function openEditPage(page: SitePage) {
    setPageModal({ mode: "edit", page });
    pageForm.setFieldsValue(pageToFormValues(page));
  }

  function openCreateBlock() {
    setBlockModal({ mode: "create" });
    blockForm.setFieldsValue(defaultBlockFormValues(selectedPageId));
  }

  function openEditBlock(block: SitePageBlock) {
    setBlockModal({ mode: "edit", block });
    blockForm.setFieldsValue(blockToFormValues(block));
  }

  function openCreateButton() {
    setButtonModal({ mode: "create" });
    buttonForm.setFieldsValue({
      ...defaultButtonFormValues(),
      placement: selectedPage?.slug ? `${selectedPage.slug}_hero` : ""
    });
  }

  function openEditButton(button: SiteButtonConfig) {
    setButtonModal({ mode: "edit", button });
    buttonForm.setFieldsValue(buttonToFormValues(button));
  }

  function closePageModal() {
    setPageModal(null);
    pageForm.resetFields();
  }

  function closeBlockModal() {
    setBlockModal(null);
    blockForm.resetFields();
  }

  function closeButtonModal() {
    setButtonModal(null);
    buttonForm.resetFields();
  }

  const pageColumns: ColumnsType<SitePage> = [
    {
      title: "Page",
      key: "page",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.title}</Typography.Text>
          <Typography.Text type="secondary">{record.slug}</Typography.Text>
        </Space>
      )
    },
    { title: "Type", dataIndex: "pageType", key: "pageType", width: 130 },
    { title: "Locale", dataIndex: "locale", key: "locale", width: 110 },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (value: SitePageStatus) => <Tag color={pageStatusColor(value)}>{value}</Tag>
    },
    {
      title: "Published",
      dataIndex: "publishedAt",
      key: "publishedAt",
      width: 180,
      render: (value: string | null) => (value ? new Date(value).toLocaleString() : "-")
    },
    {
      title: "Actions",
      key: "actions",
      width: 210,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => setSelectedPageId(record.id)}>
            Blocks
          </Button>
          <Button size="small" disabled={!canWritePage} onClick={() => openEditPage(record)}>
            Edit
          </Button>
        </Space>
      )
    }
  ];

  const blockColumns: ColumnsType<SitePageBlock> = [
    {
      title: "Block",
      key: "block",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.blockKey}</Typography.Text>
          <Typography.Text type="secondary">{record.blockType}</Typography.Text>
        </Space>
      )
    },
    { title: "Locale", dataIndex: "locale", key: "locale", width: 110 },
    {
      title: "Visible",
      dataIndex: "visible",
      key: "visible",
      width: 100,
      render: (value: boolean) => <Tag color={value ? "green" : "default"}>{value ? "Visible" : "Hidden"}</Tag>
    },
    { title: "Sort", dataIndex: "sortOrder", key: "sortOrder", width: 90 },
    {
      title: "Actions",
      key: "actions",
      width: 170,
      render: (_, record) => (
        <Button size="small" disabled={!canWritePage} onClick={() => openEditBlock(record)}>
          Edit
        </Button>
      )
    }
  ];

  const buttonColumns: ColumnsType<SiteButtonConfig> = [
    {
      title: "Button",
      key: "button",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.text}</Typography.Text>
          <Typography.Text type="secondary">{record.buttonKey}</Typography.Text>
        </Space>
      )
    },
    { title: "Placement", dataIndex: "placement", key: "placement" },
    { title: "Locale", dataIndex: "locale", key: "locale", width: 110 },
    { title: "Action", dataIndex: "actionType", key: "actionType", width: 130 },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: ButtonStatus) => <Tag color={value === "ACTIVE" ? "green" : "default"}>{value}</Tag>
    },
    { title: "Sort", dataIndex: "sortOrder", key: "sortOrder", width: 90 },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Button size="small" disabled={!canWriteButton} onClick={() => openEditButton(record)}>
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
          <Typography.Title level={3}>Page Builder</Typography.Title>
          <Typography.Text type="secondary">
            Maintain pages, page blocks and reusable call-to-action buttons.
          </Typography.Text>
        </div>
        <Space wrap>
          <Button disabled={!canWritePage} onClick={openCreateBlock}>
            New block
          </Button>
          <Button disabled={!canWriteButton} onClick={openCreateButton}>
            New button
          </Button>
          <Button type="primary" disabled={!canWritePage} onClick={openCreatePage}>
            New page
          </Button>
        </Space>
      </div>

      <Tabs
        items={[
          {
            key: "pages",
            label: "Pages",
            children: (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card bordered={false}>
                  <Space wrap>
                    <Select value={pageType} onChange={setPageType} options={PAGE_TYPE_OPTIONS} style={{ width: 170 }} />
                    <Input
                      allowClear
                      placeholder="Locale"
                      value={pageLocale}
                      onChange={(event) => setPageLocale(event.target.value)}
                      style={{ width: 120 }}
                    />
                    <Select value={pageStatus} onChange={setPageStatus} options={PAGE_STATUS_OPTIONS} style={{ width: 160 }} />
                    <Input.Search
                      allowClear
                      placeholder="Search slug or title"
                      onSearch={setPageKeyword}
                      style={{ width: 260, maxWidth: "72vw" }}
                    />
                  </Space>
                </Card>
                <Table<SitePage>
                  rowKey="id"
                  columns={pageColumns}
                  dataSource={pages}
                  loading={pagesQuery.isLoading}
                  pagination={false}
                  locale={{
                    emptyText: pagesQuery.isError ? (
                      <Empty description={getErrorMessage(pagesQuery.error)} />
                    ) : (
                      <Empty description="No pages" />
                    )
                  }}
                />
              </Space>
            )
          },
          {
            key: "blocks",
            label: "Blocks",
            children: (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card bordered={false}>
                  <Space wrap>
                    <Select
                      allowClear
                      placeholder="Select page"
                      value={selectedPageId}
                      onChange={(value) => setSelectedPageId(value ?? null)}
                      options={pageOptions}
                      style={{ width: 280, maxWidth: "72vw" }}
                    />
                    <Select value={blockType} onChange={setBlockType} options={BLOCK_TYPE_OPTIONS} style={{ width: 190 }} />
                    <Select
                      value={blockVisible}
                      onChange={setBlockVisible}
                      options={[
                        { label: "All visibility", value: "ALL" },
                        { label: "Visible", value: true },
                        { label: "Hidden", value: false }
                      ]}
                      style={{ width: 150 }}
                    />
                  </Space>
                </Card>
                <Table<SitePageBlock>
                  rowKey="id"
                  columns={blockColumns}
                  dataSource={blocksQuery.data ?? []}
                  loading={blocksQuery.isLoading}
                  pagination={false}
                  locale={{
                    emptyText: blocksQuery.isError ? (
                      <Empty description={getErrorMessage(blocksQuery.error)} />
                    ) : (
                      <Empty description="No blocks" />
                    )
                  }}
                />
              </Space>
            )
          },
          {
            key: "buttons",
            label: "Buttons",
            children: (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card bordered={false}>
                  <Space wrap>
                    <Input
                      allowClear
                      placeholder="Placement"
                      value={buttonPlacement}
                      onChange={(event) => setButtonPlacement(event.target.value)}
                      style={{ width: 200 }}
                    />
                    <Select value={buttonActionType} onChange={setButtonActionType} options={ACTION_TYPE_OPTIONS} style={{ width: 160 }} />
                    <Select value={buttonStatus} onChange={setButtonStatus} options={BUTTON_STATUS_OPTIONS} style={{ width: 160 }} />
                    <Input.Search
                      allowClear
                      placeholder="Search key or text"
                      onSearch={setButtonKeyword}
                      style={{ width: 260, maxWidth: "72vw" }}
                    />
                  </Space>
                </Card>
                <Table<SiteButtonConfig>
                  rowKey="id"
                  columns={buttonColumns}
                  dataSource={buttonsQuery.data ?? []}
                  loading={buttonsQuery.isLoading}
                  pagination={false}
                  locale={{
                    emptyText: buttonsQuery.isError ? (
                      <Empty description={getErrorMessage(buttonsQuery.error)} />
                    ) : (
                      <Empty description="No buttons" />
                    )
                  }}
                />
              </Space>
            )
          }
        ]}
      />

      <Modal
        title={pageModal?.mode === "edit" ? "Edit page" : "New page"}
        open={pageModal !== null}
        okText="Save"
        confirmLoading={savePageMutation.isPending}
        onOk={() => pageForm.validateFields().then((values) => savePageMutation.mutate(values))}
        onCancel={closePageModal}
        destroyOnClose
        width={720}
      >
        <PageForm form={pageForm} />
      </Modal>

      <Modal
        title={blockModal?.mode === "edit" ? "Edit block" : "New block"}
        open={blockModal !== null}
        okText="Save"
        confirmLoading={saveBlockMutation.isPending}
        onOk={() => blockForm.validateFields().then((values) => saveBlockMutation.mutate(values))}
        onCancel={closeBlockModal}
        destroyOnClose
        width={760}
      >
        <BlockForm form={blockForm} pageOptions={pageOptions} />
      </Modal>

      <Modal
        title={buttonModal?.mode === "edit" ? "Edit button" : "New button"}
        open={buttonModal !== null}
        okText="Save"
        confirmLoading={saveButtonMutation.isPending}
        onOk={() => buttonForm.validateFields().then((values) => saveButtonMutation.mutate(values))}
        onCancel={closeButtonModal}
        destroyOnClose
        width={760}
      >
        <ButtonConfigForm form={buttonForm} />
      </Modal>
    </section>
  );
}

function PageForm({ form }: { form: ReturnType<typeof Form.useForm<SitePageFormValues>>[0] }) {
  return (
    <Form form={form} layout="vertical">
      <Space align="start" wrap style={{ width: "100%" }}>
        <Form.Item name="pageType" label="Page type" rules={[{ required: true }]}>
          <Select options={PAGE_TYPE_OPTIONS.filter((option) => option.value !== "ALL")} style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="locale" label="Locale" rules={[{ required: true }]}>
          <Input style={{ width: 140 }} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={PAGE_STATUS_OPTIONS.filter((option) => option.value !== "ALL")} style={{ width: 150 }} />
        </Form.Item>
      </Space>
      <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="seoConfigJson" label="SEO config JSON" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item name="pageConfigJson" label="Page config JSON" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
    </Form>
  );
}

function BlockForm({
  form,
  pageOptions
}: {
  form: ReturnType<typeof Form.useForm<SitePageBlockFormValues>>[0];
  pageOptions: Array<{ label: string; value: number }>;
}) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="pageId" label="Page" rules={[{ required: true }]}>
        <Select options={pageOptions} />
      </Form.Item>
      <Space align="start" wrap style={{ width: "100%" }}>
        <Form.Item name="blockKey" label="Block key" rules={[{ required: true }]}>
          <Input style={{ width: 220 }} />
        </Form.Item>
        <Form.Item name="blockType" label="Block type" rules={[{ required: true }]}>
          <Select options={BLOCK_TYPE_OPTIONS.filter((option) => option.value !== "ALL")} style={{ width: 190 }} />
        </Form.Item>
        <Form.Item name="locale" label="Locale" rules={[{ required: true }]}>
          <Input style={{ width: 130 }} />
        </Form.Item>
      </Space>
      <Space align="start" wrap style={{ width: "100%" }}>
        <Form.Item name="visible" label="Visible" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="sortOrder" label="Sort order" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: 140 }} />
        </Form.Item>
      </Space>
      <Form.Item name="contentConfigJson" label="Content config JSON" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item name="styleConfigJson" label="Style config JSON" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
    </Form>
  );
}

function ButtonConfigForm({
  form
}: {
  form: ReturnType<typeof Form.useForm<SiteButtonConfigFormValues>>[0];
}) {
  return (
    <Form form={form} layout="vertical">
      <Space align="start" wrap style={{ width: "100%" }}>
        <Form.Item name="buttonKey" label="Button key" rules={[{ required: true }]}>
          <Input style={{ width: 220 }} />
        </Form.Item>
        <Form.Item name="placement" label="Placement" rules={[{ required: true }]}>
          <Input style={{ width: 220 }} />
        </Form.Item>
        <Form.Item name="locale" label="Locale" rules={[{ required: true }]}>
          <Input style={{ width: 130 }} />
        </Form.Item>
      </Space>
      <Form.Item name="text" label="Text" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Space align="start" wrap style={{ width: "100%" }}>
        <Form.Item name="actionType" label="Action" rules={[{ required: true }]}>
          <Select options={ACTION_TYPE_OPTIONS.filter((option) => option.value !== "ALL")} style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={BUTTON_STATUS_OPTIONS.filter((option) => option.value !== "ALL")} style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="sortOrder" label="Sort order" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: 140 }} />
        </Form.Item>
      </Space>
      <Form.Item name="actionConfigJson" label="Action config JSON" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item name="styleConfigJson" label="Style config JSON" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
    </Form>
  );
}

function pageStatusColor(status: SitePageStatus) {
  if (status === "PUBLISHED") {
    return "green";
  }
  if (status === "DRAFT") {
    return "blue";
  }
  return "default";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load page configuration";
}

function showError(message: ReturnType<typeof App.useApp>["message"], fallback: string) {
  return (error: unknown) => {
    message.error(error instanceof Error ? error.message : fallback);
  };
}
