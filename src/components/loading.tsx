import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export const Loading: React.FC = () => {
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
      <div style={{ textAlign: "center" }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          size="large"
        />
        <div style={{ marginTop: 16, color: "#666" }}>Loading...</div>
      </div>
    </div>
  );
};
