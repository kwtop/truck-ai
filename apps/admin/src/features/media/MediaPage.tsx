import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Empty, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Typography, Upload } from "antd";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import type { ColumnsType } from "antd/es/table";
import { useAuthStore } from "@/stores/authStore";
import { listMedia, uploadMedia } from "./mediaApi";
import type { MediaAsset, MediaType } from "./mediaApi";
import { formatFileSize, inferMediaType, previewUrl } from "./mediaPresentation";

type UploadValues = {
  mediaType: MediaType | "AUTO";
};

const MEDIA_TYPE_OPTIONS: Array<{ label: string; value: MediaType | "ALL" }> = [
  { label: "All types", value: "ALL" },
  { label: "Images", value: "IMAGE" },
  { label: "Videos", value: "VIDEO" },
  { label: "PDF", value: "PDF" }
];

export function MediaPage() {
  const [uploadForm] = Form.useForm<UploadValues>();
  const [mediaType, setMediaType] = useState<MediaType | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [uploadedBy, setUploadedBy] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [previewMedia, setPreviewMedia] = useState<MediaAsset | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  const permissions = useAuthStore((state) => state.permissions);
  const canWrite = permissions.includes("media:write");
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const mediaQuery = useQuery({
    queryKey: ["admin-media", mediaType, keyword, uploadedBy, page, pageSize],
    queryFn: () => listMedia({ mediaType, keyword, uploadedBy, page, pageSize })
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, mediaType }: { file: File; mediaType?: MediaType }) => uploadMedia(file, mediaType),
    onSuccess: async (media) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setSelectedMedia(media);
      message.success("Media uploaded");
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "Unable to upload media");
    }
  });

  async function copyUrl(media: MediaAsset) {
    const url = media.publicUrl ?? "";
    if (!url) {
      message.warning("No public URL available");
      return;
    }
    await navigator.clipboard.writeText(url);
    message.success("URL copied");
  }

  function uploadRequest(option: UploadRequestOption) {
    const file = option.file as File;
    const configuredType = uploadForm.getFieldValue("mediaType");
    const resolvedType = configuredType === "AUTO" ? inferMediaType(file) : configuredType;

    uploadMutation.mutate(
      { file, mediaType: resolvedType },
      {
        onSuccess: (media) => option.onSuccess?.(media),
        onError: (error) => option.onError?.(error instanceof Error ? error : new Error("Upload failed"))
      }
    );
  }

  const columns: ColumnsType<MediaAsset> = [
    {
      title: "Asset",
      dataIndex: "fileName",
      key: "fileName",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.fileName}</Typography.Text>
          <Typography.Text type="secondary">{record.objectKey}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Type",
      dataIndex: "mediaType",
      key: "mediaType",
      width: 110,
      render: (value: MediaType) => <Tag color={tagColor(value)}>{value}</Tag>
    },
    {
      title: "Size",
      dataIndex: "sizeBytes",
      key: "sizeBytes",
      width: 110,
      render: (value: number) => formatFileSize(value)
    },
    {
      title: "Uploaded by",
      dataIndex: "uploadedBy",
      key: "uploadedBy",
      width: 120,
      render: (value: number | null) => value ?? "-"
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => setPreviewMedia(record)}>
            Preview
          </Button>
          <Button size="small" onClick={() => void copyUrl(record)}>
            Copy URL
          </Button>
          <Button size="small" type={selectedMedia?.id === record.id ? "primary" : "default"} onClick={() => setSelectedMedia(record)}>
            Select
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
          <Typography.Title level={3}>Media Library</Typography.Title>
          <Typography.Text type="secondary">
            Upload product images, videos and PDF brochures, then preview and reuse public URLs.
          </Typography.Text>
        </div>
        {selectedMedia ? (
          <Tag color="blue">Selected: {selectedMedia.fileName}</Tag>
        ) : null}
      </div>

      <Card bordered={false}>
        <Space align="start" wrap>
          <Form form={uploadForm} layout="inline" initialValues={{ mediaType: "AUTO" }}>
            <Form.Item name="mediaType" label="Upload type">
              <Select
                style={{ width: 150 }}
                options={[
                  { label: "Auto detect", value: "AUTO" },
                  { label: "Image", value: "IMAGE" },
                  { label: "Video", value: "VIDEO" },
                  { label: "PDF", value: "PDF" }
                ]}
              />
            </Form.Item>
          </Form>
          <Upload
            accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.pdf"
            customRequest={uploadRequest}
            disabled={!canWrite || uploadMutation.isPending}
            showUploadList={false}
          >
            <Button type="primary" disabled={!canWrite} loading={uploadMutation.isPending}>
              Upload file
            </Button>
          </Upload>
        </Space>
      </Card>

      <Card bordered={false}>
        <Space wrap>
          <Select
            value={mediaType}
            onChange={(value) => {
              setMediaType(value);
              setPage(1);
            }}
            style={{ width: 160 }}
            options={MEDIA_TYPE_OPTIONS}
          />
          <Input.Search
            allowClear
            placeholder="Search file name"
            onSearch={(value) => {
              setKeyword(value);
              setPage(1);
            }}
            style={{ width: 260, maxWidth: "72vw" }}
          />
          <InputNumber
            placeholder="Uploaded by"
            min={1}
            value={uploadedBy ?? undefined}
            onChange={(value) => {
              setUploadedBy(value ?? null);
              setPage(1);
            }}
            style={{ width: 160 }}
          />
        </Space>
      </Card>

      <Table<MediaAsset>
        rowKey="id"
        columns={columns}
        dataSource={mediaQuery.data?.items ?? []}
        loading={mediaQuery.isLoading}
        pagination={{
          current: mediaQuery.data?.page ?? page,
          pageSize: mediaQuery.data?.pageSize ?? pageSize,
          total: mediaQuery.data?.total ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }
        }}
        locale={{
          emptyText: mediaQuery.isError ? (
            <Empty description={getErrorMessage(mediaQuery.error)} />
          ) : (
            <Empty description="No media assets" />
          )
        }}
      />

      <Modal
        title={previewMedia?.fileName ?? "Preview"}
        open={previewMedia !== null}
        footer={previewMedia ? (
          <Space>
            <Button onClick={() => void copyUrl(previewMedia)}>Copy URL</Button>
            <Button type="primary" onClick={() => setSelectedMedia(previewMedia)}>
              Select
            </Button>
          </Space>
        ) : null}
        onCancel={() => setPreviewMedia(null)}
        width={760}
        destroyOnClose
      >
        {previewMedia ? <Preview media={previewMedia} /> : null}
      </Modal>
    </section>
  );
}

function Preview({ media }: { media: MediaAsset }) {
  const url = previewUrl(media);
  if (!url) {
    return <Empty description="No preview URL" />;
  }
  if (media.mediaType === "IMAGE") {
    return <img src={url} alt={media.altText ?? media.fileName} style={{ width: "100%", maxHeight: 520, objectFit: "contain" }} />;
  }
  if (media.mediaType === "VIDEO") {
    return <video src={url} controls style={{ width: "100%", maxHeight: 520 }} />;
  }
  return (
    <Space direction="vertical" size={12}>
      <Typography.Text>{media.fileName}</Typography.Text>
      <Button href={url} target="_blank" rel="noreferrer">
        Open PDF
      </Button>
    </Space>
  );
}

function tagColor(mediaType: MediaType) {
  if (mediaType === "IMAGE") {
    return "green";
  }
  if (mediaType === "VIDEO") {
    return "purple";
  }
  return "blue";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load media";
}
