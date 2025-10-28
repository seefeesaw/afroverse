import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Space,
  Typography,
  Icon,
  message
} from 'antd';
import {
  CloseOutlined,
  FireOutlined,
  TrophyOutlined,
  TeamOutlined,
  GiftOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  BellOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import useNotification from '../../hooks/useNotification';

const { Text } = Typography;

const NotificationBanner = ({ 
  notification,
  onClose,
  onAction 
}) => {
  const { markNotificationAsRead } = useNotification();
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsClosing(false);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleAction = async () => {
    try {
      if (notification.status !== 'read') {
        await markNotificationAsRead(notification._id);
      }

      // Handle action URL if available
      if (notification.actionUrl) {
        if (onAction) {
          onAction(notification.actionUrl);
        } else {
          window.open(notification.actionUrl, '_blank');
        }
      }

      handleClose();
    } catch (error) {
      message.error('Failed to process notification');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      battle_challenge: <TrophyOutlined />,
      battle_live: <FireOutlined />,
      battle_vote: <TrophyOutlined />,
      battle_result: <TrophyOutlined />,
      streak_reminder: <FireOutlined />,
      streak_saved: <FireOutlined />,
      tribe_alert: <TeamOutlined />,
      tribe_weekly_reset: <TeamOutlined />,
      daily_challenge: <GiftOutlined />,
      coin_earned: <DollarOutlined />,
      coin_low: <ExclamationCircleOutlined />,
      referral_join: <GiftOutlined />,
      system_update: <BellOutlined />,
      moderation_action: <ExclamationCircleOutlined />
    };
    return icons[type] || <BellOutlined />;
  };

  const getNotificationType = (type) => {
    const types = {
      battle_challenge: 'error',
      battle_live: 'error',
      battle_vote: 'info',
      battle_result: 'success',
      streak_reminder: 'warning',
      streak_saved: 'success',
      tribe_alert: 'info',
      tribe_weekly_reset: 'info',
      daily_challenge: 'info',
      coin_earned: 'success',
      coin_low: 'error',
      referral_join: 'success',
      system_update: 'info',
      moderation_action: 'error'
    };
    return types[type] || 'info';
  };

  const getNotificationColor = (type) => {
    const colors = {
      battle_challenge: '#ff4d4f',
      battle_live: '#ff4d4f',
      battle_vote: '#1890ff',
      battle_result: '#52c41a',
      streak_reminder: '#faad14',
      streak_saved: '#52c41a',
      tribe_alert: '#722ed1',
      tribe_weekly_reset: '#722ed1',
      daily_challenge: '#13c2c2',
      coin_earned: '#faad14',
      coin_low: '#ff4d4f',
      referral_join: '#eb2f96',
      system_update: '#8c8c8c',
      moderation_action: '#ff4d4f'
    };
    return colors[type] || '#8c8c8c';
  };

  if (!notification || !isVisible) return null;

  const alertType = getNotificationType(notification.type);
  const iconColor = getNotificationColor(notification.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: '8px 16px',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderBottom: `3px solid ${iconColor}`
        }}
      >
        <Alert
          type={alertType}
          showIcon
          icon={
            <Icon
              component={() => getNotificationIcon(notification.type)}
              style={{ color: iconColor, fontSize: 16 }}
            />
          }
          message={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 14, color: '#262626' }}>
                  {notification.title}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 13, color: '#595959' }}>
                    {notification.message}
                  </Text>
                </div>
              </div>
              <Space style={{ marginLeft: 16 }}>
                {notification.actionUrl && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleAction}
                    style={{
                      background: iconColor,
                      borderColor: iconColor
                    }}
                  >
                    {notification.actionText || 'View'}
                  </Button>
                )}
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={handleClose}
                  style={{ color: '#8c8c8c' }}
                />
              </Space>
            </div>
          }
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationBanner;
