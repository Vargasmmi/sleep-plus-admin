import React from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Card, Typography, Space, Checkbox, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    login(values);
  };

  const fillCredentials = (email: string, password: string) => {
    form.setFieldsValue({ email, password });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", textAlign: "center" }}
        >
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              Sleep+ Admin
            </Title>
            <Text type="secondary">
              LA Mattress Store Administration System
            </Text>
          </div>

          <Alert
            message="Demo Credentials"
            description={
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div style={{ textAlign: "left" }}>
                  <Text strong>Demo User (Agent):</Text>
                  <br />
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => fillCredentials("demo@lamattressstore.com", "demo123")}
                    style={{ padding: 0 }}
                  >
                    <Text code>demo@lamattressstore.com</Text> / <Text code>demo123</Text>
                  </Button>
                </div>
                <div style={{ textAlign: "left" }}>
                  <Text strong>Manager:</Text>
                  <br />
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => fillCredentials("john.smith@lamattressstore.com", "demo123")}
                    style={{ padding: 0 }}
                  >
                    <Text code>john.smith@lamattressstore.com</Text> / <Text code>demo123</Text>
                  </Button>
                </div>
                <div style={{ textAlign: "left" }}>
                  <Text strong>Administrator:</Text>
                  <br />
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => fillCredentials("admin@lamattressstore.com", "admin123")}
                    style={{ padding: 0 }}
                  >
                    <Text code>admin@lamattressstore.com</Text> / <Text code>admin123</Text>
                  </Button>
                </div>
              </Space>
            }
            type="info"
            showIcon
          />

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "Please enter your email",
                },
                {
                  type: "email",
                  message: "Invalid email",
                },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="your@email.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password",
                },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="••••••••"
              />
            </Form.Item>

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <a style={{ float: "right" }} href="#">
                Forgot password?
              </a>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                block
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
