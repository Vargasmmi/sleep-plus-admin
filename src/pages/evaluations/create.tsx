import React, { useState } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
  Space,
  Typography,
  Upload,
  Button,
  Alert,
  Slider,
  Radio,
  Divider,
  notification,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  CameraOutlined,
  ScanOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import type { IEvaluation } from "../../interfaces";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const MATTRESS_BRANDS = [
  { value: "tempur-pedic", label: "Tempur-Pedic", score: 95 },
  { value: "sealy", label: "Sealy", score: 85 },
  { value: "serta", label: "Serta", score: 80 },
  { value: "beautyrest", label: "Beautyrest", score: 80 },
  { value: "casper", label: "Casper", score: 75 },
  { value: "purple", label: "Purple", score: 75 },
  { value: "tuft-needle", label: "Tuft & Needle", score: 70 },
  { value: "saatva", label: "Saatva", score: 85 },
  { value: "other", label: "Otra marca", score: 50 },
];

const MATTRESS_SIZES = [
  { value: "twin", label: "Twin", icon: "🛏️" },
  { value: "full", label: "Full", icon: "🛏️" },
  { value: "queen", label: "Queen", icon: "👑" },
  { value: "king", label: "King", icon: "👑" },
  { value: "cal-king", label: "California King", icon: "🌴" },
];

export const EvaluationCreate: React.FC = () => {
  const { formProps, saveButtonProps, onFinish } = useForm<IEvaluation>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [estimatedCredit, setEstimatedCredit] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [mattressAge, setMattressAge] = useState(3);
  const [mattressCondition, setMattressCondition] = useState<string>("good");

  const { selectProps: customerSelectProps } = useSelect({
    resource: "customers",
    optionLabel: (customer) => `${customer.firstName} ${customer.lastName} - ${customer.phone}`,
    optionValue: "id",
    filters: [
      {
        field: "membershipStatus",
        operator: "eq",
        value: "active",
      },
    ],
  });

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        notification.error({
          message: "Error",
          description: "Solo puedes subir imágenes",
        });
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        notification.error({
          message: "Error",
          description: "La imagen debe ser menor a 5MB",
        });
        return false;
      }

      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    listType: "picture-card",
  };

  // Calculate estimated credit based on inputs
  React.useEffect(() => {
    if (selectedBrand && mattressCondition) {
      const brand = MATTRESS_BRANDS.find((b) => b.value === selectedBrand);
      const brandScore = brand?.score || 50;

      const conditionScores: Record<string, number> = {
        excellent: 95,
        good: 80,
        fair: 60,
        poor: 30,
      };
      const conditionScore = conditionScores[mattressCondition] || 50;

      const ageScore = Math.max(20, 100 - (mattressAge - 2) * 10);

      const finalScore = Math.round(
        conditionScore * 0.4 + brandScore * 0.3 + ageScore * 0.3
      );

      const baseCredit = 200;
      const credit = Math.min(400, Math.max(25, Math.round(baseCredit * (finalScore / 100))));

      setEstimatedCredit(credit);
    }
  }, [selectedBrand, mattressAge, mattressCondition]);

  const handleSubmit = (values: any) => {
    if (fileList.length < 3) {
      notification.error({
        message: "Error",
        description: "Debes subir al menos 3 fotos del colchón",
      });
      return;
    }

    // Simulate AI evaluation
    const aiEvaluation = {
      conditionScore: mattressCondition === "excellent" ? 95 : mattressCondition === "good" ? 80 : mattressCondition === "fair" ? 60 : 30,
      brandScore: MATTRESS_BRANDS.find((b) => b.value === selectedBrand)?.score || 50,
      ageScore: Math.max(20, 100 - (mattressAge - 2) * 10),
      sizeScore: 85,
      finalScore: Math.round(estimatedCredit / 2),
      confidence: Math.min(95, 70 + fileList.length * 5),
    };

    const evaluationData = {
      ...values,
      photos: fileList.map((file) => ({
        filename: file.name,
        url: `/uploads/${file.name}`,
        uploadDate: new Date().toISOString(),
      })),
      aiEvaluation,
      creditApproved: estimatedCredit,
      status: "approved",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    onFinish(evaluationData);
  };

  return (
    <Create saveButtonProps={{ ...saveButtonProps, onClick: () => formProps.form?.submit() }}>
      <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Información del Cliente" bordered={false}>
              <Alert
                message="Verificación de Compra Previa"
                description="Solo los clientes que hayan comprado un colchón hace más de 2 años pueden participar en Trade & Sleep"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                label="Cliente"
                name="customerId"
                rules={[{ required: true, message: "Selecciona un cliente" }]}
              >
                <Select
                  {...customerSelectProps}
                  placeholder="Buscar cliente por nombre o teléfono..."
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Información del Colchón" bordered={false}>
              <Form.Item
                label="Marca del Colchón"
                name={["mattress", "brand"]}
                rules={[{ required: true, message: "Selecciona la marca" }]}
              >
                <Select
                  placeholder="Seleccionar marca..."
                  onChange={setSelectedBrand}
                  options={MATTRESS_BRANDS.map((brand) => ({
                    ...brand,
                    label: (
                      <Space>
                        {brand.label}
                        <Tag color={brand.score >= 80 ? "green" : brand.score >= 60 ? "blue" : "default"}>
                          Score: {brand.score}
                        </Tag>
                      </Space>
                    ),
                  }))}
                />
              </Form.Item>

              <Form.Item label="Modelo (Opcional)" name={["mattress", "model"]}>
                <Input placeholder="Ej: ProAdapt, Posturepedic, etc." />
              </Form.Item>

              <Form.Item
                label="Tamaño"
                name={["mattress", "size"]}
                rules={[{ required: true, message: "Selecciona el tamaño" }]}
                initialValue="queen"
              >
                <Radio.Group buttonStyle="solid" style={{ width: "100%" }}>
                  <Row gutter={8}>
                    {MATTRESS_SIZES.map((size) => (
                      <Col span={8} key={size.value}>
                        <Radio.Button value={size.value} style={{ width: "100%", textAlign: "center" }}>
                          <Space>
                            <span style={{ fontSize: 20 }}>{size.icon}</span>
                            {size.label}
                          </Space>
                        </Radio.Button>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    Edad del Colchón
                    <Text type="secondary">({mattressAge} años)</Text>
                  </Space>
                }
                name={["mattress", "age"]}
                rules={[{ required: true, message: "Indica la edad del colchón" }]}
                initialValue={3}
              >
                <Slider
                  min={2}
                  max={15}
                  marks={{
                    2: "2",
                    5: "5",
                    10: "10",
                    15: "15+",
                  }}
                  value={mattressAge}
                  onChange={setMattressAge}
                />
              </Form.Item>

              <Form.Item
                label="Condición del Colchón"
                name={["mattress", "condition"]}
                rules={[{ required: true, message: "Selecciona la condición" }]}
                initialValue="good"
              >
                <Radio.Group
                  onChange={(e) => setMattressCondition(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Card
                        hoverable
                        className={mattressCondition === "excellent" ? "ant-card-active" : ""}
                        onClick={() => setMattressCondition("excellent")}
                      >
                        <Radio value="excellent">
                          <Space direction="vertical">
                            <Text strong>Excelente</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Como nuevo, sin manchas ni hundimientos
                            </Text>
                          </Space>
                        </Radio>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        hoverable
                        className={mattressCondition === "good" ? "ant-card-active" : ""}
                        onClick={() => setMattressCondition("good")}
                      >
                        <Radio value="good">
                          <Space direction="vertical">
                            <Text strong>Bueno</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Uso normal, manchas mínimas
                            </Text>
                          </Space>
                        </Radio>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        hoverable
                        className={mattressCondition === "fair" ? "ant-card-active" : ""}
                        onClick={() => setMattressCondition("fair")}
                      >
                        <Radio value="fair">
                          <Space direction="vertical">
                            <Text strong>Regular</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Algunas manchas, ligero hundimiento
                            </Text>
                          </Space>
                        </Radio>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        hoverable
                        className={mattressCondition === "poor" ? "ant-card-active" : ""}
                        onClick={() => setMattressCondition("poor")}
                      >
                        <Radio value="poor">
                          <Space direction="vertical">
                            <Text strong>Malo</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Manchas severas, hundimientos notables
                            </Text>
                          </Space>
                        </Radio>
                      </Card>
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Fotos del Colchón" bordered={false}>
              <Alert
                message="Requisitos de Fotos"
                description="Sube al menos 3 fotos claras: vista general, etiqueta de marca, y cualquier daño visible"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                name="photos"
                rules={[
                  {
                    validator: (_, value) => {
                      if (fileList.length < 3) {
                        return Promise.reject("Debes subir al menos 3 fotos");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <CameraOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                  </p>
                  <p className="ant-upload-text">
                    Haz clic o arrastra fotos aquí
                  </p>
                  <p className="ant-upload-hint">
                    Sube al menos 3 fotos del colchón. Máximo 5MB por imagen.
                  </p>
                </Dragger>
              </Form.Item>

              {fileList.length > 0 && (
                <Alert
                  message={`${fileList.length} fotos cargadas`}
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>

            <Card
              title="Crédito Estimado"
              bordered={false}
              style={{ marginTop: 16 }}
              extra={
                <InfoCircleOutlined
                  style={{ fontSize: 16, color: "#1890ff" }}
                />
              }
            >
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Title level={1} style={{ color: "#52c41a", margin: 0 }}>
                  ${estimatedCredit}
                </Title>
                <Text type="secondary">
                  Crédito estimado basado en la información proporcionada
                </Text>
              </div>

              <Divider />

              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                <InfoCircleOutlined /> El crédito final será determinado por nuestro sistema de IA
                después de analizar las fotos. Este estimado es solo una referencia.
              </Paragraph>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Información Adicional" bordered={false}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Empleado"
                    name="employeeId"
                    rules={[{ required: true, message: "Selecciona el empleado" }]}
                  >
                    <Select placeholder="Seleccionar empleado...">
                      <Select.Option value="emp-001">María García</Select.Option>
                      <Select.Option value="emp-002">John Smith</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tienda"
                    name="storeId"
                    rules={[{ required: true, message: "Selecciona la tienda" }]}
                  >
                    <Select placeholder="Seleccionar tienda...">
                      <Select.Option value="store-001">Studio City</Select.Option>
                      <Select.Option value="store-002">Santa Monica</Select.Option>
                      <Select.Option value="online">Online</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
