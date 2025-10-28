import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Divider,
  Card,
  Row,
  Col,
  message
} from 'antd';
import {
  FlagOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import useModeration from '../../hooks/useModeration';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ReportModal = ({ 
  visible, 
  onClose,
  targetUserId,
  targetType = 'profile',
  targetId,
  targetName = 'this user'
}) => {
  const {
    reportReasons,
    loading,
    error,
    getReportReasons,
    reportContent,
    clearModerationError
  } = useModeration();

  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);

  useEffect(() => {
    if (visible) {
      getReportReasons();
      form.resetFields();
      setSelectedReason(null);
    }
  }, [visible, getReportReasons, form]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearModerationError();
    }
  }, [error, clearModerationError]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const result = await reportContent({
        targetUserId,
        targetType,
        targetId,
        reason: values.reason,
        description: values.description
      });

      if (result.success) {
        message.success('Report submitted successfully');
        form.resetFields();
        onClose();
      } else {
        message.error(result.message || 'Failed to submit report');
      }
    } catch (error) {
      message.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedReason(null);
    onClose();
  };

  const getReasonDescription = (reasonValue) => {
    const reason = reportReasons.find(r => r.value === reasonValue);
    return reason ? reason.description : '';
  };

  const getReasonIcon = (reasonValue) => {
    const iconMap = {
      'inappropriate_content': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'harassment': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'spam': <InfoCircleOutlined style={{ color: '#faad14' }} />,
      'fake_profile': <InfoCircleOutlined style={{ color: '#faad14' }} />,
      'underage': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'violence': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'hate_speech': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'nudity': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'scam': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'copyright_violation': <InfoCircleOutlined style={{ color: '#faad14' }} />,
      'other': <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
    };
    return iconMap[reasonValue] || <InfoCircleOutlined style={{ color: '#8c8c8c' }} />;
  };

  const getReasonColor = (reasonValue) => {
    const colorMap = {
      'inappropriate_content': '#ff4d4f',
      'harassment': '#ff4d4f',
      'spam': '#faad14',
      'fake_profile': '#faad14',
      'underage': '#ff4d4f',
      'violence': '#ff4d4f',
      'hate_speech': '#ff4d4f',
      'nudity': '#ff4d4f',
      'scam': '#ff4d4f',
      'copyright_violation': '#faad14',
      'other': '#8c8c8c'
    };
    return colorMap[reasonValue] || '#8c8c8c';
  };

  const getTargetDisplayName = () => {
    const typeMap = {
      'profile': 'user',
      'image': 'image',
      'battle': 'battle',
      'transformation': 'transformation',
      'comment': 'comment',
      'message': 'message'
    };
    return typeMap[targetType] || 'content';
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FlagOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          <span>Report {getTargetDisplayName()}</span>
        </div>
      }
      width={600}
      style={{ top: 20 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert
          message="Report Content"
          description={`You are reporting ${targetName}. Please select a reason and provide additional details if needed.`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            reason: null,
            description: ''
          }}
        >
          <Form.Item
            name="reason"
            label="Reason for reporting"
            rules={[{ required: true, message: 'Please select a reason' }]}
          >
            <Select
              placeholder="Select a reason"
              size="large"
              onChange={setSelectedReason}
            >
              {reportReasons.map(reason => (
                <Option key={reason.value} value={reason.value}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {getReasonIcon(reason.value)}
                    <span style={{ marginLeft: 8 }}>{reason.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedReason && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <Card
                size="small"
                style={{
                  marginBottom: 16,
                  borderLeft: `4px solid ${getReasonColor(selectedReason)}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  {getReasonIcon(selectedReason)}
                  <Text strong style={{ marginLeft: 8, color: getReasonColor(selectedReason) }}>
                    {reportReasons.find(r => r.value === selectedReason)?.label}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {getReasonDescription(selectedReason)}
                </Text>
              </Card>
            </motion.div>
          )}

          <Form.Item
            name="description"
            label="Additional details (optional)"
            rules={[
              { max: 1000, message: 'Description must be less than 1000 characters' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Provide additional context about why you're reporting this content..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              Reports are reviewed by our moderation team. False reports may result in account restrictions.
            </Text>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={isSubmitting}
                icon={<FlagOutlined />}
              >
                Submit Report
              </Button>
            </Space>
          </div>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default ReportModal;
