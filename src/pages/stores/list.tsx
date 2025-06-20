import React from "react";
import { List, useTable } from "@refinedev/antd";
import { Table, Tag, Space, Typography } from "antd";
import {
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { IStore } from "../../interfaces";

const { Text } = Typography;

export const StoreList: React.FC = () => {
  const { tableProps } = useTable<IStore>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Tienda"
          dataIndex="name"
          key="name"
          render={(value, record: IStore) => (
            <Space>
              <ShopOutlined />
              <div>
                <Text strong>{value}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Código: {record.code}
                </Text>
              </div>
            </Space>
          )}
        />

        <Table.Column
          title="Ubicación"
          dataIndex="address"
          key="address"
          render={(address: IStore["address"]) => (
            <Space>
              <EnvironmentOutlined />
              <Text>
                {address.city}, {address.state}
              </Text>
            </Space>
          )}
        />

        <Table.Column
          title="Teléfono"
          dataIndex="phone"
          key="phone"
          render={(value) => (
            <Space>
              <PhoneOutlined />
              <Text>{value}</Text>
            </Space>
          )}
        />

        <Table.Column
          title="Manager"
          dataIndex="managerId"
          key="managerId"
          render={(value) => (
            <Space>
              <UserOutlined />
              <Text>{value}</Text>
            </Space>
          )}
        />

        <Table.Column
          title="Rendimiento"
          key="performance"
          render={(_, record: IStore) => {
            const percentage = (
              (record.performance.currentSales / record.performance.monthlyTarget) *
              100
            ).toFixed(1);
            const color = Number(percentage) >= 100 ? "success" : Number(percentage) >= 80 ? "warning" : "error";
            
            return (
              <div>
                <Tag color={color}>{percentage}% de meta</Tag>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ${record.performance.currentSales.toLocaleString()} / ${record.performance.monthlyTarget.toLocaleString()}
                </Text>
              </div>
            );
          }}
        />

        <Table.Column
          title="Estado"
          dataIndex="status"
          key="status"
          render={(value) => (
            <Tag color={value === "active" ? "green" : "red"}>
              {value === "active" ? "Activa" : "Inactiva"}
            </Tag>
          )}
        />

        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: IStore) => (
            <Space>
              <a href={`/stores/show/${record.id}`}>Ver</a>
              <a href={`/stores/edit/${record.id}`}>Editar</a>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
