import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Descriptions, Drawer, Empty, Input, Select, Space, Table, Tag, Timeline, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { getAiChatSession, listAiChatSessions } from "./aiChatApi";
import type { AiChatMessage, AiChatSessionSummary } from "./aiChatApi";
import { messageRoleColor, sessionLeadLabel, toolNames } from "./aiChatPresentation";

export function AiChatSessionPage() {
  const [keyword, setKeyword] = useState("");
  const [locale, setLocale] = useState<string | undefined>();
  const [hasLead, setHasLead] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const listParams = useMemo(
    () => ({ keyword, locale, hasLead, page, pageSize }),
    [keyword, locale, hasLead, page, pageSize]
  );

  const sessionsQuery = useQuery({
    queryKey: ["ai-chat-sessions", listParams],
    queryFn: () => listAiChatSessions(listParams)
  });

  const detailQuery = useQuery({
    queryKey: ["ai-chat-session", selectedSessionId],
    queryFn: () => getAiChatSession(selectedSessionId as number),
    enabled: selectedSessionId !== null
  });

  const columns: ColumnsType<AiChatSessionSummary> = [
    {
      title: "Session",
      dataIndex: "sessionNo",
      key: "sessionNo",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.sessionNo}</Typography.Text>
          <Typography.Text type="secondary">{record.visitorId ?? "-"}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Locale",
      dataIndex: "locale",
      key: "locale",
      width: 110,
      render: (value: string) => <Tag>{value}</Tag>
    },
    {
      title: "Lead",
      key: "lead",
      render: (_, record) => sessionLeadLabel(record)
    },
    {
      title: "Messages",
      dataIndex: "messageCount",
      key: "messageCount",
      width: 110
    },
    {
      title: "Source",
      dataIndex: "sourcePage",
      key: "sourcePage",
      render: (value: string | null) => value ?? "-"
    },
    {
      title: "Last message",
      dataIndex: "lastMessageAt",
      key: "lastMessageAt",
      width: 190,
      render: (value: string | null) => (value ? new Date(value).toLocaleString() : "-")
    }
  ];

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div>
        <Typography.Title level={3}>AI chat sessions</Typography.Title>
        <Typography.Text type="secondary">Review assistant conversations, tool payloads, and linked sales leads.</Typography.Text>
      </div>

      <Card bordered={false}>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Session, visitor, lead, source"
            onSearch={(value) => {
              setKeyword(value);
              setPage(1);
            }}
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="Locale"
            value={locale}
            onChange={(value) => {
              setLocale(value);
              setPage(1);
            }}
            options={[
              { label: "en-US", value: "en-US" },
              { label: "es-MX", value: "es-MX" },
              { label: "fr-DZ", value: "fr-DZ" }
            ]}
            style={{ width: 140 }}
          />
          <Select
            value={hasLead === null ? "ALL" : String(hasLead)}
            onChange={(value) => {
              setHasLead(value === "ALL" ? null : value === "true");
              setPage(1);
            }}
            options={[
              { label: "All sessions", value: "ALL" },
              { label: "With lead", value: "true" },
              { label: "No lead", value: "false" }
            ]}
            style={{ width: 150 }}
          />
        </Space>
      </Card>

      <Table<AiChatSessionSummary>
        rowKey="id"
        columns={columns}
        dataSource={sessionsQuery.data?.items ?? []}
        loading={sessionsQuery.isLoading}
        onRow={(record) => ({ onClick: () => setSelectedSessionId(record.id) })}
        pagination={{
          current: sessionsQuery.data?.page ?? page,
          pageSize: sessionsQuery.data?.pageSize ?? pageSize,
          total: sessionsQuery.data?.total ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }
        }}
        locale={{
          emptyText: sessionsQuery.isError ? <Empty description={errorMessage(sessionsQuery.error)} /> : <Empty description="No AI chat sessions" />
        }}
      />

      <Drawer
        title={detailQuery.data?.session.sessionNo ?? "AI chat detail"}
        open={selectedSessionId !== null}
        onClose={() => setSelectedSessionId(null)}
        width={760}
        destroyOnClose
      >
        {detailQuery.data ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <SessionSummary session={detailQuery.data.session} />
            <Card title="Messages" size="small">
              <Timeline
                items={detailQuery.data.messages.map((message) => ({
                  color: message.role === "USER" ? "blue" : "green",
                  children: <MessageDetail message={message} />
                }))}
              />
            </Card>
          </Space>
        ) : detailQuery.isLoading ? (
          <Typography.Text>Loading chat session...</Typography.Text>
        ) : (
          <Empty description="Chat session not found" />
        )}
      </Drawer>
    </section>
  );
}

function SessionSummary({ session }: { session: AiChatSessionSummary }) {
  return (
    <Descriptions bordered size="small" column={1}>
      <Descriptions.Item label="Locale">{session.locale}</Descriptions.Item>
      <Descriptions.Item label="Visitor">{session.visitorId ?? "-"}</Descriptions.Item>
      <Descriptions.Item label="Source">{session.sourcePage ?? "-"}</Descriptions.Item>
      <Descriptions.Item label="Lead">{sessionLeadLabel(session)}</Descriptions.Item>
      <Descriptions.Item label="Messages">{session.messageCount}</Descriptions.Item>
      <Descriptions.Item label="Status">{session.status}</Descriptions.Item>
    </Descriptions>
  );
}

function MessageDetail({ message }: { message: AiChatMessage }) {
  const tools = toolNames(message.toolPayload);
  return (
    <Space direction="vertical" size={6} style={{ width: "100%" }}>
      <Space>
        <Tag color={messageRoleColor(message.role)}>{message.role}</Tag>
        <Typography.Text type="secondary">{new Date(message.createdAt).toLocaleString()}</Typography.Text>
        {message.toolName ? <Tag color="cyan">{message.toolName}</Tag> : null}
      </Space>
      <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>{message.content}</Typography.Paragraph>
      {tools.length ? (
        <Space wrap>
          {tools.map((tool) => (
            <Tag key={tool} color="geekblue">
              {tool}
            </Tag>
          ))}
        </Space>
      ) : null}
    </Space>
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load AI chat sessions";
}
