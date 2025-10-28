import React, { useEffect, useState } from 'react';
import {
  Modal,
  List,
  Avatar,
  Typography,
  Button,
  Space,
  Badge,
  Empty,
  Spin,
  Tag,
  Divider,
  Tooltip,
  message
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  SettingOutlined,
  FireOutlined,
  TrophyOutlined,
  TeamOutlined,
  GiftOutlined,
  DollarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import useNotification from '../../hooks/useNotification';

const { Title, Text } = Typography;

const NotificationInbox = ({ 
  visible, 
  onClose,
  onSettingsClick 
}) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotifications
  } = useNotification();

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    if (visible) {
      getNotifications({ limit: 50 });
    }
  }, [visible, getNotifications]);

  const getNotificationIcon = (type) => {
    const icons = {
      battle_challenge: <TrophyOutlined style={{ color: '#ff4d4f' }} />,
      battle_live: <FireOutlined style={{ color: '#ff4d4f' }} />,
      battle_vote: <TrophyOutlined style={{ color: '#1890ff' }} />,
      battle_result: <TrophyOutlined style={{ color: '#52c41a' }} />,
      streak_reminder: <FireOutlined style={{ color: '#faad14' }} />,
      streak_saved: <FireOutlined style={{ color: '#52c41a' }} />,
      tribe_alert: <TeamOutlined style={{ color: '#722ed1' }} />,
      tribe_weekly_reset: <TeamOutlined style={{ color: '#722ed1' }} />,
      daily_challenge: <GiftOutlined style={{ color: '#13c2c2' }} />,
      coin_earned: <DollarOutlined style={{ color: '#faad14' }} />,
      coin_low: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      referral_join: <GiftOutlined style={{ color: '#eb2f96' }} />,
      system_update: <BellOutlined style={{ color: '#8c8c8c' }} />,
      moderation_action: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    };
    return icons[type] || <BellOutlined style={{ color: '#8c8c8c' }} />;
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

  const getPriorityTag = (priority) => {
    const tags = {
      urgent: { color: 'red', text: 'Urgent' },
      high: { color: 'orange', text: 'High' },
      normal: { color: 'blue', text: 'Normal' },
      low: { color: 'default', text: 'Low' }
    };
    return tags[priority] || tags.normal;
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status !== 'read') {
      await markNotificationAsRead(notification._id);
    }

    // Handle action URL if available
    if (notification.actionUrl) {
      // Use your app's routing system here
      // For example, with React Router:
      // history.push(notification.actionUrl);
      
      // Or open in new tab:
      window.open(notification.actionUrl, '_blank');
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      message.success('All notifications marked as read');
    } catch (error) {
      message.error('Failed to mark all notifications as read');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const unreadNotifications = getUnreadNotifications();

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BellOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ marginLeft: 8 }} />
            )}
          </div>
          <Space>
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={onSettingsClick}
            />
            {unreadCount > 0 && (
              <Button
                type="text"
                onClick={handleMarkAllAsRead}
                loading={isMarkingAll}
              >
                Mark All Read
              </Button>
            )}
          </Space>
        </div>
      }
      width={500}
      style={{ top: 20 }}
    >
      <Spin spinning={loading}>
        {error && (
          <div style={{ textAlign: 'center', padding: 20, color: '#ff4d4f' }}>
            <Text>Failed to load notifications</Text>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications yet"
            style={{ padding: 40 }}
          />
        )}

        {!loading && notifications.length > 0 && (
          <List
            dataSource={notifications}
            renderItem={(notification) => {
              const isUnread = notification.status !== 'read';
              const isSelected = selectedNotifications.includes(notification._id);
              const priorityTag = getPriorityTag(notification.priority);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <List.Item
                    style={{
                      background: isUnread ? '#f6ffed' : 'white',
                      borderLeft: isUnread ? `4px solid ${getNotificationColor(notification.type)}` : '4px solid transparent',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderRadius: 8,
                      marginBottom: 8,
                      border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0'
                    }}
                    onClick={() => handleNotificationClick(notification)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isUnread ? '#e6f7ff' : '#fafafa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isUnread ? '#f6ffed' : 'white';
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            background: getNotificationColor(notification.type),
                            color: 'white'
                          }}
                          icon={getNotificationIcon(notification.type)}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text strong={isUnread} style={{ fontSize: 14 }}>
                            {notification.title}
                          </Text>
                          <Space size={4}>
                            {notification.priority === 'urgent' && (
                              <Tag color={priorityTag.color} size="small">
                                {priorityTag.text}
                              </Tag>
                            )}
                            {isUnread && (
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: '#1890ff'
                                }}
                              />
                            )}
                          </Space>
                        </div>
                      }
                      description={
                        <div>
                          <Text
                            style={{
                              color: isUnread ? '#262626' : '#8c8c8c',
                              fontSize: 13,
                              lineHeight: 1.4
                            }}
                          >
                            {notification.message}
                          </Text>
                          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {moment(notification.createdAt).fromNow()}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {notification.channel.toUpperCase()}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                </motion.div>
              );
            }}
          />
        )}
      </Spin>

      {notifications.length > 0 && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button type="link" onClick={() => getNotifications({ limit: 50, skip: notifications.length })}>
            Load More
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default NotificationInbox;
