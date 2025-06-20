import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, notification } from 'antd';
import stripeService from '../../services/stripeService';

interface PaymentLinkGeneratorProps {
  visible: boolean;
  onClose: () => void;
}

const PaymentLinkGenerator: React.FC<PaymentLinkGeneratorProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await stripeService.createPaymentLink(values);
      if (response.success) {
        notification.success({ message: 'Payment Link creado exitosamente' });
        onClose();
      }
    } catch (error: any) {
      notification.error({ message: 'Error al crear Payment Link', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Generar Payment Link" open={visible} onCancel={onClose} footer={null}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Cliente ID" name="customerId" rules={[{ required: true }]}>
          <Input placeholder="ID del cliente" />
        </Form.Item>
        
        <Form.Item label="Nombre del Producto" name="productName" rules={[{ required: true }]}>
          <Input placeholder="Nombre del producto" />
        </Form.Item>
        
        <Form.Item label="Descripción" name="description" rules={[{ required: true }]}>
          <Input.TextArea placeholder="Descripción del producto" />
        </Form.Item>
        
        <Form.Item label="Precio" name="amount" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} placeholder="99.99" min={0.5} step={0.01} />
        </Form.Item>
        
        <Button type="primary" htmlType="submit" loading={loading} block>
          Generar Payment Link
        </Button>
      </Form>
    </Modal>
  );
};

export default PaymentLinkGenerator; 