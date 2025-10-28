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
  Avatar,
  message
} from 'antd';
import {
  UserDeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import useModeration from '../../hooks/useModeration';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const BlockUserModal = ({ 
  visible, 
  onClose,
  targetUserId,
  targetUser = null
}) => {
  const {
    loading,
    error,
    blockUserAction,
    clearModerationError
  } = useModeration();

  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedReason(null);
    }
  }, [visible, form]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearModerationError();
    }
  }, [error, clearModerationError]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const result = await blockUserAction(
        targetUserId,
        values.reason,
        values.description
      );

      if (result.success) {
        message.success('User blocked successfully');
        form.resetFields();
        onClose();
      } else {
        message.error(result.message || 'Failed to block user');
      }
    } catch (error) {
      message.error('Failed to block user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedReason(null);
    onClose();
  };

  const getBlockReasons = () => {
    return [
      {
        value: 'harassment',
        label: 'Harassment',
        description: 'Bullying, threats, or unwanted behavior',
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        color: '#ff4d4f'
      },
      {
        value: 'spam',
        label: 'Spam',
        description: 'Repetitive or unwanted content',
        icon: <InfoCircleOutlined style={{ color: '#faad14' }} />,
        color: '#faad14'
      },
      {
        value: 'inappropriate_content',
        label: 'Inappropriate Content',
        description: 'Content that violates community guidelines',
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        color: '#ff4d4f'
      },
      {
        value: 'unwanted_contact',
        label: 'Unwanted Contact',
        description: 'Persistent unwanted communication',
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        color: '#ff4d4f'
      },
      {
        value: 'fake_profile',
        label: 'Fake Profile',
        description: 'Impersonation or fake account',
        icon: <InfoCircleOutlined style={{ color: '#faad14' }} />,
        color: '#faad14'
      },
      {
        value: 'other',
        label: 'Other',
        description: 'Other reason not listed above',
        icon: <InfoCircleOutlined style={{ color: '#8c8c8c' }} />,
        color: '#8c8c8c'
      }
    ];
  };

  const getReasonDescription = (reasonValue) => {
    const reason = getBlockReasons().find(r => r.value === reasonValue);
    return reason ? reason.description : '';
  };

  const getReasonIcon = (reasonValue) => {
    const reason = getBlockReasons().find(r => r.value === reasonValue);
    return reason ? reason.icon : <InfoCircleOutlined style={{ color: '#8c8c8c' }} />;
  };

  const getReasonColor = (reasonValue) => {
    const reason = getBlockReasons().find(r => r.value === reasonValue);
    return reason ? reason.color : '#8c8c8c';
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserDeleteOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          <span>Block User</span>
        </div>
      }
      width={500}
      style={{ top: 20 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {targetUser && (
          <Card
            size="small"
            style={{ marginBottom: 24, background: '#fafafa' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={targetUser.avatar}
                size={40}
                style={{ marginRight: 12 }}
              >
                {targetUser.username?.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {targetUser.username}
                </Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {targetUser.email || 'User'}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Alert
          message="Block User"
          description="Blocking this user will prevent them from challenging you to battles, sending messages, or interacting with your content. You can unblock them later if needed."
          type="warning"
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
            label="Reason for blocking"
            rules={[{ required: true, message: 'Please select a reason' }]}
          >
            <Select
              placeholder="Select a reason"
              size="large"
              onChange={setSelectedReason}
            >
              {getBlockReasons().map(reason => (
                <Option key={reason.value} value={reason.value}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {reason.icon}
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
                    {getBlockReasons().find(r => r.value === selectedReason)?.label}
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
              { max: 500, message: 'Description must be less than 500 characters' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Provide additional context about why you're blocking this user..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              Blocked users cannot see your profile, send you messages, or challenge you to battles.
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
                icon={<UserDeleteOutlined />}
              >
                Block User
              </Button>
            </Space>
          </div>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default BlockUserModal;
