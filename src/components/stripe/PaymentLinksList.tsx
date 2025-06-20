import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Card, Typography, notification } from 'antd';
import { LinkOutlined, CopyOutlined } from '@ant-design/icons';
import stripeService from '../../services/stripeService';
import { PaymentLink } from '../../interfaces/stripe';

const { Title } = Typography;

const PaymentLinksList: React.FC = () => {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentLinks();
  }, []);

  const loadPaymentLinks = async () => {
    setLoading(true);
    try {
      const response = await stripeService.getPaymentLinks();
      if (response.success) {
        setPaymentLinks(response.paymentLinks);
      }
    } catch (error: any) {
      notification.error({
        message: 'Error al cargar Payment Links',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notification.success({ message: 'Enlace copiado al portapapeles' });
    } catch (err) {
      notification.error({ message: 'Error al copiar el enlace' });
    }
  };

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Cliente',
      dataIndex: 'customerEmail',
      key: 'customerEmail',
    },
    {
      title: 'Precio',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: PaymentLink) => 
        stripeService.formatCurrency(amount, record.currency),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={stripeService.getStatusColor(status)}>
          {stripeService.getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => stripeService.formatDate(date),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record: PaymentLink) => (
        <Space>
          <Button
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(record.url)}
            title="Copiar enlace"
          />
          <Button
            icon={<LinkOutlined />}
            onClick={() => window.open(record.url, '_blank')}
            title="Abrir enlace"
          />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>Payment Links</Title>
      <Table
        columns={columns}
        dataSource={paymentLinks}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default PaymentLinksList; 