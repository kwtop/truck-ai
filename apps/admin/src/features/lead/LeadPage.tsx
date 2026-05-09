import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Descriptions, Drawer, Empty, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAuthStore } from "@/stores/authStore";
import {
  addLeadFollowUp,
  assignLead,
  exportLeads,
  getLead,
  listLeadFollowUps,
  listLeads,
  updateLeadStatus
} from "./leadApi";
import type { AdminLead, FollowType, LeadStatus } from "./leadApi";
import { contactSummary, leadStatusOptions, requirementRows, sourceSummary, statusColor } from "./leadPresentation";

type FollowUpFormValues = {
  followType: FollowType;
  content: string;
  nextActionAt?: string;
};

export function LeadPage() {
  const [status, setStatus] = useState<LeadStatus | "ALL">("ALL");
  const [country, setCountry] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpForm] = Form.useForm<FollowUpFormValues>();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const permissions = useAuthStore((state) => state.permissions);
  const canAssign = permissions.includes("lead:assign");
  const canWrite = permissions.includes("lead:write");

  const listParams = useMemo(
    () => ({ status, country, assignedTo, keyword, page, pageSize }),
    [status, country, assignedTo, keyword, page, pageSize]
  );

  const leadsQuery = useQuery({
    queryKey: ["admin-leads", listParams],
    queryFn: () => listLeads(listParams)
  });

  const detailQuery = useQuery({
    queryKey: ["admin-lead", selectedLeadId],
    queryFn: () => getLead(selectedLeadId as number),
    enabled: selectedLeadId !== null
  });

  const followUpsQuery = useQuery({
    queryKey: ["admin-lead-follow-ups", selectedLeadId],
    queryFn: () => listLeadFollowUps(selectedLeadId as number),
    enabled: selectedLeadId !== null
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assignedTo }: { id: number; assignedTo: number }) => assignLead(id, assignedTo),
    onSuccess: async () => {
      await invalidateLeadQueries(queryClient);
      message.success("Lead assigned");
    },
    onError: (error) => message.error(error instanceof Error ? error.message : "Unable to assign lead")
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: LeadStatus }) =>
      updateLeadStatus(id, status, { quoted: status === "QUOTED" ? true : undefined, won: status === "WON" ? true : undefined }),
    onSuccess: async () => {
      await invalidateLeadQueries(queryClient);
      message.success("Lead status updated");
    },
    onError: (error) => message.error(error instanceof Error ? error.message : "Unable to update lead status")
  });

  const followUpMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: FollowUpFormValues }) =>
      addLeadFollowUp(id, {
        followType: values.followType,
        content: values.content,
        nextActionAt: values.nextActionAt || null,
        attachments: []
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-lead-follow-ups"] });
      followUpForm.resetFields();
      setFollowUpOpen(false);
      message.success("Follow-up added");
    },
    onError: (error) => message.error(error instanceof Error ? error.message : "Unable to add follow-up")
  });

  const exportMutation = useMutation({
    mutationFn: () => exportLeads(listParams),
    onSuccess: async (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sales-leads.csv";
      link.click();
      URL.revokeObjectURL(url);
      message.success("Lead export started");
    },
    onError: (error) => message.error(error instanceof Error ? error.message : "Unable to export leads")
  });

  const columns: ColumnsType<AdminLead> = [
    {
      title: "Lead",
      dataIndex: "leadNo",
      key: "leadNo",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.leadNo}</Typography.Text>
          <Typography.Text>{record.name}</Typography.Text>
          <Typography.Text type="secondary">{record.companyName ?? record.country ?? "-"}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => contactSummary(record)
    },
    {
      title: "Product",
      key: "product",
      render: (_, record) => record.interestedProductName ?? record.vehicleType ?? "-"
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (value: LeadStatus) => <Tag color={statusColor(value)}>{value}</Tag>
    },
    {
      title: "Assigned",
      dataIndex: "assignedTo",
      key: "assignedTo",
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
      width: 110,
      render: (_, record) => (
        <Button size="small" onClick={() => setSelectedLeadId(record.id)}>
          Detail
        </Button>
      )
    }
  ];

  const selectedLead = detailQuery.data ?? null;

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <Typography.Title level={3}>Leads</Typography.Title>
          <Typography.Text type="secondary">Review RFQ leads, assign owners, update status and record follow-ups.</Typography.Text>
        </div>
        <Button loading={exportMutation.isPending} onClick={() => exportMutation.mutate()}>
          Export CSV
        </Button>
      </div>

      <Card bordered={false}>
        <Space wrap>
          <Select value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={leadStatusOptions} style={{ width: 170 }} />
          <Input.Search allowClear placeholder="Keyword or source" onSearch={(value) => { setKeyword(value); setPage(1); }} style={{ width: 240 }} />
          <Input allowClear placeholder="Country" value={country} onChange={(event) => { setCountry(event.target.value); setPage(1); }} style={{ width: 180 }} />
          <InputNumber placeholder="Assigned to" min={1} value={assignedTo ?? undefined} onChange={(value) => { setAssignedTo(value ?? null); setPage(1); }} style={{ width: 160 }} />
        </Space>
      </Card>

      <Table<AdminLead>
        rowKey="id"
        columns={columns}
        dataSource={leadsQuery.data?.items ?? []}
        loading={leadsQuery.isLoading}
        pagination={{
          current: leadsQuery.data?.page ?? page,
          pageSize: leadsQuery.data?.pageSize ?? pageSize,
          total: leadsQuery.data?.total ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }
        }}
        locale={{
          emptyText: leadsQuery.isError ? <Empty description={errorMessage(leadsQuery.error)} /> : <Empty description="No leads" />
        }}
      />

      <Drawer
        title={selectedLead ? `${selectedLead.leadNo} - ${selectedLead.name}` : "Lead detail"}
        open={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
        width={720}
        destroyOnClose
      >
        {selectedLead ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <LeadDetail lead={selectedLead} />
            <Card title="Actions" size="small">
              <Space wrap>
                <InputNumber
                  placeholder="Assign user id"
                  min={1}
                  disabled={!canAssign}
                  onPressEnter={(event) => {
                    const value = Number((event.target as HTMLInputElement).value);
                    if (Number.isInteger(value) && value > 0) {
                      assignMutation.mutate({ id: selectedLead.id, assignedTo: value });
                    }
                  }}
                />
                <Select
                  value={selectedLead.status}
                  disabled={!canWrite}
                  onChange={(value) => statusMutation.mutate({ id: selectedLead.id, status: value })}
                  options={leadStatusOptions.filter((option) => option.value !== "ALL") as Array<{ label: string; value: LeadStatus }>}
                  style={{ width: 170 }}
                />
                <Button disabled={!canWrite} onClick={() => setFollowUpOpen(true)}>
                  Add follow-up
                </Button>
              </Space>
            </Card>
            <Card title="Follow-ups" size="small">
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={followUpsQuery.data?.items ?? []}
                columns={[
                  { title: "Type", dataIndex: "followType" },
                  { title: "Content", dataIndex: "content" },
                  { title: "Next action", dataIndex: "nextActionAt", render: (value: string | null) => value ?? "-" },
                  { title: "Created by", dataIndex: "createdBy", render: (value: number | null) => value ?? "-" }
                ]}
              />
            </Card>
          </Space>
        ) : detailQuery.isLoading ? (
          <Typography.Text>Loading lead...</Typography.Text>
        ) : (
          <Empty description="Lead not found" />
        )}
      </Drawer>

      <Modal
        title="Add follow-up"
        open={followUpOpen}
        okText="Save"
        confirmLoading={followUpMutation.isPending}
        onOk={async () => {
          if (selectedLeadId === null) {
            return;
          }
          const values = await followUpForm.validateFields();
          followUpMutation.mutate({ id: selectedLeadId, values });
        }}
        onCancel={() => setFollowUpOpen(false)}
        destroyOnClose
      >
        <Form form={followUpForm} layout="vertical" initialValues={{ followType: "EMAIL" }}>
          <Form.Item name="followType" label="Type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Email", value: "EMAIL" },
                { label: "Phone", value: "PHONE" },
                { label: "WhatsApp", value: "WHATSAPP" },
                { label: "Quote", value: "QUOTE" },
                { label: "Note", value: "NOTE" }
              ]}
            />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true, message: "Content is required" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="nextActionAt" label="Next action at">
            <Input placeholder="2026-05-11T09:30:00Z" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

function LeadDetail({ lead }: { lead: AdminLead }) {
  const requirements = requirementRows(lead.requirementDetails);
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="Status"><Tag color={statusColor(lead.status)}>{lead.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="Contact">{contactSummary(lead)}</Descriptions.Item>
        <Descriptions.Item label="Country">{lead.country ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Product">{lead.interestedProductName ?? lead.vehicleType ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Quantity">{lead.quantity ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Source">{sourceSummary(lead.sourceContext)}</Descriptions.Item>
        <Descriptions.Item label="Message">{lead.message ?? "-"}</Descriptions.Item>
      </Descriptions>
      <Card title="Requirements" size="small">
        {requirements.length ? (
          <Descriptions size="small" column={1}>
            {requirements.map((item) => (
              <Descriptions.Item key={item.key} label={item.label}>{item.value}</Descriptions.Item>
            ))}
          </Descriptions>
        ) : (
          <Empty description="No requirement details" />
        )}
      </Card>
    </Space>
  );
}

async function invalidateLeadQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
  await queryClient.invalidateQueries({ queryKey: ["admin-lead"] });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load leads";
}
