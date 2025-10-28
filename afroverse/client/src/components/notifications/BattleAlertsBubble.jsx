import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Tooltip,
  Space,
  Typography,
  Popover,
  List,
  Avatar,
  Divider
} from 'antd';
import {
  BellOutlined,
  TrophyOutlined,
  FireOutlined,
  TeamOutlined,
  CloseOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import useNotification from '../../hooks/useNotification';

const { Text } = Typography;

const BattleAlertsBubble = ({ 
  position = { bottom: 20, right: 20 },
  onNotificationClick 
}) => {
  const {
    notifications,
    unreadCount,
    getNotificationsByType,
    markNotificationAsRead,
    refreshUnreadCount
  } = useNotification();

  const [isVisible, setIsVisible] = useState(true);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const [battleNotifications, setBattleNotifications] = useState([]);

  useEffect(() => {
    // Get battle-related notifications
    const battleTypes = ['battle_challenge', 'battle_live', 'battle_vote', 'battle_result'];
    const battleNotifs = notifications.filter(n => battleTypes.includes(n.type));
    setBattleNotifications(battleNotifs.slice(0, 5)); // Show last 5

    // Refresh unread count periodically
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [notifications, refreshUnreadCount]);

  const handleNotificationClick = async (notification) => {
    if (notification.status !== 'read') {
      await markNotificationAsRead(notification._id);
    }

    setIsPopoverVisible(false);
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      battle_challenge: <TrophyOutlined style={{ color: '#ff4d4f' }} />,
      battle_live: <FireOutlined style={{ color: '#ff4d4f' }} />,
      battle_vote: <TrophyOutlined style={{ color: '#1890ff' }} />,
      battle_result: <TrophyOutlined style={{ color: '#52c41a' }} />
    };
    return icons[type] || <TrophyOutlined />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      battle_challenge: '#ff4d4f',
      battle_live: '#ff4d4f',
      battle_vote: '#1890ff',
      battle_result: '#52c41a'
    };
    return colors[type] || '#1890ff';
  };

  const getNotificationTitle = (type) => {
    const titles = {
      battle_challenge: 'Battle Challenge',
      battle_live: 'Battle Live',
      battle_vote: 'New Vote',
      battle_result: 'Battle Result'
    };
    return titles[type] || 'Battle Alert';
  };

  const popoverContent = (
    <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong style={{ fontSize: 14 }}>Battle Alerts</Text>
      </div>
      
      {battleNotifications.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#8c8c8c' }}>
          <Text>No battle alerts yet</Text>
        </div>
      ) : (
        <List
          dataSource={battleNotifications}
          renderItem={(notification) => {
            const isUnread = notification.status !== 'read';
            
            return (
              <List.Item
                style={{
                  padding: '8px 0',
                  cursor: 'pointer',
                  background: isUnread ? '#f6ffed' : 'transparent',
                  borderRadius: 4,
                  padding: '8px 12px',
                  margin: '4px 0'
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        background: getNotificationColor(notification.type),
                        color: 'white'
                      }}
                      icon={getNotificationIcon(notification.type)}
                      size="small"
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text strong={isUnread} style={{ fontSize: 13 }}>
                        {getNotificationTitle(notification.type)}
                      </Text>
                      {isUnread && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#1890ff'
                          }}
                        />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text style={{ fontSize: 12, color: '#595959' }}>
                        {notification.message}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {moment(notification.createdAt).fromNow()}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
      
      {battleNotifications.length > 0 && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Button type="link" size="small" onClick={() => setIsPopoverVisible(false)}>
              View All Notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // Don't show if no battle notifications
  if (battleNotifications.length === 0 && unreadCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
        style={{
          position: 'fixed',
          bottom: position.bottom,
          right: position.right,
          zIndex: 1000
        }}
      >
        <Popover
          content={popoverContent}
          title={null}
          trigger="click"
          open={isPopoverVisible}
          onOpenChange={setIsPopoverVisible}
          placement="topRight"
          overlayStyle={{ padding: 0 }}
        >
          <Badge count={unreadCount} size="small" offset={[-5, 5]}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<TrophyOutlined />}
                style={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(255, 77, 79, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </motion.div>
          </Badge>
        </Popover>

        {/* Floating notification indicators */}
        {battleNotifications.slice(0, 3).map((notification, index) => {
          const isUnread = notification.status !== 'read';
          if (!isUnread) return null;

          return (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.3,
                type: 'spring',
                stiffness: 200
              }}
              style={{
                position: 'absolute',
                top: -10 - (index * 8),
                right: -10 - (index * 8),
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: getNotificationColor(notification.type),
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              {getNotificationIcon(notification.type)}
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};

export default BattleAlertsBubble;
