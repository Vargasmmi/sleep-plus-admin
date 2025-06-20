import React, { useState } from "react";
import { List, useTable, DateField, ShowButton } from "@refinedev/antd";
import { Table, Tag, Space, Typography, Badge, Button, Card, Row, Col, Statistic, Progress, Tooltip } from "antd";
import { 
  ApiOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  SyncOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { IWebhook } from "../../interfaces/activityLog";
import { webhookService } from "../../services/webhookService";
import { useNotification, useNavigation } from "@refinedev/core";
import dayjs from "dayjs";

const { Text } = Typography;

export const WebhookList: React.FC = () => {
  const { tableProps, tableQueryResult } = useTable<IWebhook>({
    resource: "webhooks",
    sorters: {
      initial: [{ field: "receivedAt", order: "desc" }],
    },
  });

  const { open } = useNotification();
  const { push } = useNavigation();
  const [retryingIds, setRetryingIds] = useState<string[]>([]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      pending: { 
        color: "processing", 
        icon: <ClockCircleOutlined />, 
        text: "Pending" 
      },
      processed: { 
        color: "success", 
        icon: <CheckCircleOutlined />, 
        text: "Processed" 
      },
      failed: { 
        color: "error", 
        icon: <CloseCircleOutlined />, 
        text: "Failed" 
      },
      retrying: { 
        color: "warning", 
        icon: <SyncOutlined spin />, 
        text: "Retrying" 
      },
    };
    return configs[status] || { color: "default", icon: null, text: status };
  };

  const getEventColor = (event: string) => {
    if (event.includes("create")) return "green";
    if (event.includes("update")) return "blue";
    if (event.includes("delete")) return "red";
    return "default";
  };

  const handleRetry = async (webhookId: string) => {
    setRetryingIds([...retryingIds, webhookId]);
    try {
      await webhookService.retryWebhook(webhookId);
      open({
        type: "success",
        message: "Webhook resent",
        description: "The webhook is being processed again",
      });
      tableQueryResult.refetch();
    } catch (error: any) {
      open({
        type: "error",
        message: "Error resending",
        description: error.message || "Could not resend the webhook",
      });
    } finally {
      setRetryingIds(retryingIds.filter(id => id !== webhookId));
    }
  };

  // Calculate statistics
  const webhooks = tableProps.dataSource || [];
  const stats = {
    total: webhooks.length,
    processed: webhooks.filter(w => w.status === "processed").length,
    failed: webhooks.filter(w => w.status === "failed").length,
    pending: webhooks.filter(w => w.status === "pending").length,
  };
  const successRate = stats.total > 0 ? (stats.processed / stats.total) * 100 : 0;

  const columns = [
    {
      title: "Date",
      dataIndex: "receivedAt",
      key: "receivedAt",
      width: 180,
      render: (value: string) => (
        <Space direction="vertical" size={0}>
          <DateField value={value} format="DD/MM/YYYY HH:mm:ss" />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(value).fromNow()}
          </Text>
        </Space>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 100,
      render: (value: string) => (
        <Tag color={value === "shopify" ? "blue" : "default"}>
          {value.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Event",
      dataIndex: "event",
      key: "event",
      width: 200,
      render: (value: string) => (
        <Tag color={getEventColor(value)}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (value: string) => {
        const config = getStatusConfig(value);
        return (
          <Badge 
            status={config.color as any} 
            text={
              <Space>
                {config.icon}
                {config.text}
              </Space>
            } 
          />
        );
      },
    },
    {
      title: "Attempts",
      dataIndex: "attempts",
      key: "attempts",
      width: 100,
      render: (value: number, record: IWebhook) => (
        <Space>
          <Text>{value}</Text>
          {record.status === "failed" && value >= 3 && (
            <Tooltip title="Maximum attempts reached">
              <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Processed",
      dataIndex: "processedAt",
      key: "processedAt",
      width: 180,
      render: (value: string | null) => 
        value ? <DateField value={value} format="DD/MM/YYYY HH:mm:ss" /> : "-",
    },
    {
      title: "Response/Error",
      key: "response",
      render: (_: any, record: IWebhook) => {
        if (record.response) {
          return (
            <Space direction="vertical" size={0}>
              <Tag color="green">HTTP {record.response.status}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.response.message}
              </Text>
            </Space>
          );
        }
        if (record.error) {
          return (
            <Space direction="vertical" size={0}>
              <Tag color="red">{record.error.code}</Tag>
              <Text type="danger" style={{ fontSize: 12 }}>
                {record.error.message}
              </Text>
            </Space>
          );
        }
        return "-";
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: any, record: IWebhook) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          {record.status === "failed" && record.attempts < 3 && (
            <Button
              size="small"
              icon={<ReloadOutlined spin={retryingIds.includes(record.id)} />}
              onClick={() => handleRetry(record.id)}
              loading={retryingIds.includes(record.id)}
            >
              Retry
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Webhooks"
              value={stats.total}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Processed"
              value={stats.processed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Failed"
              value={stats.failed}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text>Success Rate</Text>
              <Progress 
                percent={Number(successRate.toFixed(1))} 
                status={successRate >= 90 ? "success" : successRate >= 70 ? "normal" : "exception"}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <List title="Webhook History"
        headerProps={{
          extra: (
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => push("/webhooks/settings")}
            >
              Configure Webhooks
            </Button>
          ),
        }}
      >
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1400 }}
          rowClassName={(record) => {
            if (record.status === "failed") return "webhook-failed-row";
            if (record.status === "pending") return "webhook-pending-row";
            return "";
          }}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} webhooks`,
          }}
        />
      </List>

      <style jsx>{`
        .webhook-failed-row {
          background-color: #fff1f0;
        }
        .webhook-pending-row {
          background-color: #fff7e6;
        }
      `}</style>
    </>
  );
};