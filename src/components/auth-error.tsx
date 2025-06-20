import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { LoginOutlined } from "@ant-design/icons";

export const AuthError: React.FC = () => {
  const navigate = useNavigate();

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
      <Result
        status="403"
        title="Unauthorized"
        subTitle="You must sign in to access this page."
        extra={
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate("/login")}
          >
            Go to Sign In
          </Button>
        }
      />
    </div>
  );
};
