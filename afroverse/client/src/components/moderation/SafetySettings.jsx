import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Switch,
  Select,
  InputNumber,
  Button,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Alert,
  message
} from 'antd';
import {
  SafetyOutlined,
  ShieldOutlined,
  EyeOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import useModeration from '../../hooks/useModeration';

const { Title, Text } = Typography;
const { Option } = Select;

const SafetySettings = ({ 
  userId,
  onSave
}) => {
  const {
    settings,
    serviceStatus,
    updateModerationSettings,
    getModerationStatus
  } = useModeration();

  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const [serviceHealth, setServiceHealth] = useState(null);

  useEffect(() => {
    if (userId) {
      getModerationStatus();
    }
  }, [userId, getModerationStatus]);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        autoModeration: settings.autoModeration,
        strictMode: settings.strictMode,
        reportThreshold: settings.reportThreshold,
        blockThreshold: settings.blockThreshold
      });
    }
  }, [settings, form]);

  useEffect(() => {
    if (serviceStatus) {
      const health = {
        faceDetection: serviceStatus.services?.faceDetection?.initialized || false,
        nsfwDetection: serviceStatus.services?.nsfwDetection?.initialized || false,
        textModeration: serviceStatus.services?.textModeration?.initialized || false,
        rulesEngine: serviceStatus.services?.rulesEngine?.totalRules > 0 || false
      };
      
      const healthyServices = Object.values(health).filter(Boolean).length;
      const totalServices = Object.keys(health).length;
      
      setServiceHealth({
        ...health,
        overall: healthyServices === totalServices,
        score: Math.round((healthyServices / totalServices) * 100)
      });
    }
  }, [serviceStatus]);

  const handleSave = async (values) => {
    setIsSaving(true);
    try {
      updateModerationSettings(values);
      message.success('Safety settings updated successfully');
      if (onSave) {
        onSave(values);
      }
    } catch (error) {
      message.error('Failed to update safety settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getServiceStatusIcon = (isHealthy) => {
    return isHealthy ? (
      <ShieldOutlined style={{ color: '#52c41a' }} />
    ) : (
      <WarningOutlined style={{ color: '#ff4d4f' }} />
    );
  };

  const getServiceStatusText = (isHealthy) => {
    return isHealthy ? 'Operational' : 'Degraded';
  };

  const getServiceStatusColor = (isHealthy) => {
    return isHealthy ? '#52c41a' : '#ff4d4f';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <SafetyOutlined style={{ marginRight: 8, color: '#1890ff', fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>Safety Settings</Title>
        </div>
        <Text type="secondary">
          Configure content moderation and safety preferences for your account.
        </Text>
      </div>

      {/* Service Health Status */}
      {serviceHealth && (
        <Card title="Moderation Service Status" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 8 }}>
                  {getServiceStatusIcon(serviceHealth.faceDetection)}
                </div>
                <Text strong>Face Detection</Text>
                <div>
                  <Text 
                    type="secondary" 
                    style={{ color: getServiceStatusColor(serviceHealth.faceDetection) }}
                  >
                    {getServiceStatusText(serviceHealth.faceDetection)}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 8 }}>
                  {getServiceStatusIcon(serviceHealth.nsfwDetection)}
                </div>
                <Text strong>NSFW Detection</Text>
                <div>
                  <Text 
                    type="secondary" 
                    style={{ color: getServiceStatusColor(serviceHealth.nsfwDetection) }}
                  >
                    {getServiceStatusText(serviceHealth.nsfwDetection)}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 8 }}>
                  {getServiceStatusIcon(serviceHealth.textModeration)}
                </div>
                <Text strong>Text Moderation</Text>
                <div>
                  <Text 
                    type="secondary" 
                    style={{ color: getServiceStatusColor(serviceHealth.textModeration) }}
                  >
                    {getServiceStatusText(serviceHealth.textModeration)}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 8 }}>
                  {getServiceStatusIcon(serviceHealth.rulesEngine)}
                </div>
                <Text strong>Rules Engine</Text>
                <div>
                  <Text 
                    type="secondary" 
                    style={{ color: getServiceStatusColor(serviceHealth.rulesEngine) }}
                  >
                    {getServiceStatusText(serviceHealth.rulesEngine)}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
          
          {!serviceHealth.overall && (
            <Alert
              message="Service Degradation"
              description="Some moderation services are not fully operational. Content moderation may be limited."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      )}

      {/* Safety Settings Form */}
      <Card title="Content Moderation Settings">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            autoModeration: true,
            strictMode: true,
            reportThreshold: 5,
            blockThreshold: 3
          }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Form.Item
                name="autoModeration"
                valuePropName="checked"
                label={
                  <div>
                    <Text strong>Automatic Content Moderation</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Automatically moderate uploaded images and text content
                      </Text>
                    </div>
                  </div>
                }
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="strictMode"
                valuePropName="checked"
                label={
                  <div>
                    <Text strong>Strict Moderation Mode</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Use stricter rules for content moderation (may block more content)
                      </Text>
                    </div>
                  </div>
                }
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="reportThreshold"
                label={
                  <div>
                    <Text strong>Report Threshold</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Number of reports before content is automatically flagged
                      </Text>
                    </div>
                  </div>
                }
              >
                <InputNumber
                  min={1}
                  max={20}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="blockThreshold"
                label={
                  <div>
                    <Text strong>Block Threshold</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Number of violations before user is automatically blocked
                      </Text>
                    </div>
                  </div>
                }
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              These settings affect how content is moderated on your account. Changes take effect immediately.
            </Text>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSaving}
              icon={<SaveOutlined />}
            >
              Save Settings
            </Button>
          </div>
        </Form>
      </Card>

      {/* Safety Information */}
      <Card title="Safety Information" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <EyeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Text strong>Content Monitoring</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              All uploaded images are automatically scanned for inappropriate content, violence, and weapons.
            </Text>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <ShieldOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              <Text strong>Face Detection</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Images must contain exactly one face to ensure proper transformation results.
            </Text>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <WarningOutlined style={{ marginRight: 8, color: '#faad14' }} />
              <Text strong>Text Moderation</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              All text content is checked for toxicity, hate speech, and spam.
            </Text>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
              <Text strong>User Reports</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Users can report inappropriate content, which is reviewed by our moderation team.
            </Text>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};

export default SafetySettings;
