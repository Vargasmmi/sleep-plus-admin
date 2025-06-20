import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Space,
  Typography,
  Button,
  Tag,
  Alert,
  Switch,
  Divider,
  List,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  BranchesOutlined,
  TagOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { IScript } from "../../interfaces";

const { TextArea } = Input;
const { Title, Text } = Typography;

export const ScriptCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<IScript>();
  const [segments, setSegments] = useState<IScript["segments"]>([
    {
      id: "seg-1",
      type: "opening",
      content: "",
    },
  ]);
  const [variables, setVariables] = useState<string[]>([]);

  const segmentTypes = [
    { value: "opening", label: "Apertura", color: "blue" },
    { value: "discovery", label: "Descubrimiento", color: "purple" },
    { value: "pitch", label: "Propuesta", color: "green" },
    { value: "close", label: "Cierre", color: "gold" },
    { value: "objection", label: "Manejo de objeción", color: "red" },
  ];

  const addSegment = () => {
    const newSegment: IScript["segments"][0] = {
      id: `seg-${segments.length + 1}`,
      type: "discovery",
      content: "",
    };
    setSegments([...segments, newSegment]);
  };

  const removeSegment = (index: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index: number, field: string, value: any) => {
    const updatedSegments = [...segments];
    updatedSegments[index] = { ...updatedSegments[index], [field]: value };
    setSegments(updatedSegments);
  };

  const extractVariables = (content: string) => {
    const regex = /\[([A-Z_]+)\]/g;
    const matches = content.match(regex);
    if (matches) {
      return matches.map((match) => match.slice(1, -1));
    }
    return [];
  };

  const updateVariables = () => {
    const allVariables = new Set<string>();
    segments.forEach((segment) => {
      const vars = extractVariables(segment.content);
      vars.forEach((v) => allVariables.add(v));
    });
    setVariables(Array.from(allVariables));
  };

  return (
    <Create 
      saveButtonProps={{
        ...saveButtonProps,
        onClick: (e) => {
          // Añadir los segmentos y variables al formulario antes de enviar
          formProps.form?.setFieldsValue({
            segments,
            variables,
          });
          saveButtonProps.onClick?.(e);
        },
      }}
    >
      <Form {...formProps} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Información Básica" bordered={false}>
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="Nombre del Script"
                    name="name"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                  >
                    <Input
                      prefix={<FileTextOutlined />}
                      placeholder="Ej: Script de Renovación Elite v2"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item
                    label="Tipo"
                    name="type"
                    rules={[{ required: true, message: "Selecciona un tipo" }]}
                  >
                    <Select placeholder="Seleccionar tipo">
                      <Select.Option value="cold">
                        <Tag color="blue">Llamada fría</Tag>
                      </Select.Option>
                      <Select.Option value="warm">
                        <Tag color="orange">Llamada cálida</Tag>
                      </Select.Option>
                      <Select.Option value="winback">
                        <Tag color="purple">Recuperación</Tag>
                      </Select.Option>
                      <Select.Option value="renewal">
                        <Tag color="green">Renovación</Tag>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} lg={6}>
                  <Form.Item
                    label="Versión"
                    name="version"
                    rules={[{ required: true, message: "Este campo es requerido" }]}
                    initialValue="1.0"
                  >
                    <Input placeholder="1.0" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Estado inicial"
                name="status"
                initialValue="draft"
              >
                <Select>
                  <Select.Option value="draft">Borrador</Select.Option>
                  <Select.Option value="active">Activo</Select.Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          <Col span={24}>
            <Card 
              title="Segmentos del Script"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addSegment}
                >
                  Añadir segmento
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                {segments.map((segment, index) => (
                  <Card
                    key={segment.id}
                    size="small"
                    title={
                      <Space>
                        <Tag color={segmentTypes.find((t) => t.value === segment.type)?.color}>
                          {segmentTypes.find((t) => t.value === segment.type)?.label}
                        </Tag>
                        <Text>Segmento {index + 1}</Text>
                      </Space>
                    }
                    extra={
                      segments.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeSegment(index)}
                        />
                      )
                    }
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Form.Item label="Tipo de segmento">
                        <Select
                          value={segment.type}
                          onChange={(value) => updateSegment(index, "type", value)}
                        >
                          {segmentTypes.map((type) => (
                            <Select.Option key={type.value} value={type.value}>
                              <Tag color={type.color}>{type.label}</Tag>
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item label="Contenido">
                        <TextArea
                          rows={4}
                          value={segment.content}
                          onChange={(e) => updateSegment(index, "content", e.target.value)}
                          onBlur={updateVariables}
                          placeholder="Escribe el contenido del segmento. Usa [VARIABLE] para variables dinámicas."
                        />
                      </Form.Item>

                      <Form.Item label="Condiciones (opcional)">
                        <Space>
                          <Select
                            placeholder="Nivel de cliente"
                            style={{ width: 150 }}
                            onChange={(value) => {
                              const conditions = segment.conditions || {};
                              updateSegment(index, "conditions", {
                                ...conditions,
                                customerTier: value,
                              });
                            }}
                          >
                            <Select.Option value={["gold"]}>Solo Oro</Select.Option>
                            <Select.Option value={["silver"]}>Solo Plata</Select.Option>
                            <Select.Option value={["bronze"]}>Solo Bronce</Select.Option>
                            <Select.Option value={["gold", "silver"]}>Oro y Plata</Select.Option>
                          </Select>

                          <Switch
                            checkedChildren="Con suscripción"
                            unCheckedChildren="Sin suscripción"
                            onChange={(checked) => {
                              const conditions = segment.conditions || {};
                              updateSegment(index, "conditions", {
                                ...conditions,
                                hasSubscription: checked,
                              });
                            }}
                          />
                        </Space>
                      </Form.Item>

                      {segment.type === "objection" && (
                        <Alert
                          message="Consejo para objeciones"
                          description="Este segmento se activará cuando el agente marque una objeción específica durante la llamada."
                          type="info"
                          showIcon
                        />
                      )}
                    </Space>
                  </Card>
                ))}
              </Space>

              <Alert
                style={{ marginTop: 16 }}
                message="Variables detectadas"
                description={
                  variables.length > 0 ? (
                    <Space wrap style={{ marginTop: 8 }}>
                      {variables.map((variable) => (
                        <Tag key={variable} icon={<TagOutlined />}>
                          {variable}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    "No se han detectado variables. Usa [NOMBRE_VARIABLE] en el contenido."
                  )
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Alert
              message="Mejores prácticas para scripts"
              description={
                <List
                  size="small"
                  dataSource={[
                    "Mantén los segmentos cortos y claros (máximo 3-4 oraciones)",
                    "Usa variables para personalizar el script: [CUSTOMER_NAME], [LAST_PRODUCT], etc.",
                    "Incluye pausas naturales para que el cliente pueda responder",
                    "Prepara respuestas para las objeciones más comunes",
                    "Termina siempre con una pregunta clara o llamada a la acción",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              }
              type="info"
              showIcon
            />
          </Col>

          {/* Hidden fields for form submission */}
          <Form.Item name="segments" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="variables" hidden>
            <Input />
          </Form.Item>
        </Row>
      </Form>
    </Create>
  );
};
