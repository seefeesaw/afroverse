import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Switch,
  Select,
  TimePicker,
  InputNumber,
  Divider,
  Typography,
  Space,
  Button,
  Card,
  Row,
  Col,
  message,
  Alert
} from 'antd';
import {
  SettingOutlined,
  BellOutlined,
  MobileOutlined,
  MessageOutlined,
  MailOutlined,
  SoundOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import useNotification from '../../hooks/useNotification';

const { Title, Text } = Typography;
const { Option } = Select;

const NotificationSettings = ({ 
  visible, 
  onClose 
}) => {
  const {
    settings,
    loading,
    error,
    fetchSettings,
    updateNotificationSettings,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    registerWhatsApp,
    removeWhatsApp,
    isPushSupported,
    isPushEnabled
  } = useNotification();

  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pushPermissionLoading, setPushPermissionLoading] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');

  useEffect(() => {
    if (visible) {
      fetchSettings();
    }
  }, [visible, fetchSettings]);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        // Push notifications
        pushEnabled: settings.notifications.push.enabled,
        pushBattle: settings.notifications.push.battle,
        pushStreak: settings.notifications.push.streak,
        pushTribe: settings.notifications.push.tribe,
        pushDaily: settings.notifications.push.daily,
        pushCoin: settings.notifications.push.coin,
        pushSystem: settings.notifications.push.system,
        
        // WhatsApp notifications
        whatsappEnabled: settings.notifications.whatsapp.enabled,
        whatsappBattle: settings.notifications.whatsapp.battle,
        whatsappStreak: settings.notifications.whatsapp.streak,
        whatsappTribe: settings.notifications.whatsapp.tribe,
        
        // In-app notifications
        inappEnabled: settings.notifications.inapp.enabled,
        inappBanner: settings.notifications.inapp.banner,
        inappSound: settings.notifications.inapp.sound,
        inappVibration: settings.notifications.inapp.vibration,
        
        // Email notifications
        emailEnabled: settings.notifications.email.enabled,
        emailWeekly: settings.notifications.email.weekly,
        emailSystem: settings.notifications.email.system,
        
        // Timing settings
        timezone: settings.timing.timezone,
        quietHoursEnabled: settings.timing.quietHours.enabled,
        quietHoursStart: moment(settings.timing.quietHours.start, 'HH:mm'),
        quietHoursEnd: moment(settings.timing.quietHours.end, 'HH:mm'),
        dailyReminderEnabled: settings.timing.dailyReminder.enabled,
        dailyReminderTime: moment(settings.timing.dailyReminder.time, 'HH:mm'),
        streakReminderEnabled: settings.timing.streakReminder.enabled,
        streakReminderTime: moment(settings.timing.streakReminder.time, 'HH:mm'),
        
        // Frequency settings
        maxPerDay: settings.frequency.maxPerDay,
        cooldownMinutes: settings.frequency.cooldownMinutes,
        batchSimilar: settings.frequency.batchSimilar
      });
      
      setWhatsappPhone(settings.whatsappPhone || '');
    }
  }, [settings, form]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const updatedSettings = {
        notifications: {
          push: {
            enabled: values.pushEnabled,
            battle: values.pushBattle,
            streak: values.pushStreak,
            tribe: values.pushTribe,
            daily: values.pushDaily,
            coin: values.pushCoin,
            system: values.pushSystem
          },
          whatsapp: {
            enabled: values.whatsappEnabled,
            battle: values.whatsappBattle,
            streak: values.whatsappStreak,
            tribe: values.whatsappTribe
          },
          inapp: {
            enabled: values.inappEnabled,
            banner: values.inappBanner,
            sound: values.inappSound,
            vibration: values.inappVibration
          },
          email: {
            enabled: values.emailEnabled,
            weekly: values.emailWeekly,
            system: values.emailSystem
          }
        },
        timing: {
          timezone: values.timezone,
          quietHours: {
            enabled: values.quietHoursEnabled,
            start: values.quietHoursStart.format('HH:mm'),
            end: values.quietHoursEnd.format('HH:mm')
          },
          dailyReminder: {
            enabled: values.dailyReminderEnabled,
            time: values.dailyReminderTime.format('HH:mm')
          },
          streakReminder: {
            enabled: values.streakReminderEnabled,
            time: values.streakReminderTime.format('HH:mm')
          }
        },
        frequency: {
          maxPerDay: values.maxPerDay,
          cooldownMinutes: values.cooldownMinutes,
          batchSimilar: values.batchSimilar
        }
      };

      await updateNotificationSettings(updatedSettings);
      message.success('Notification settings updated successfully');
      onClose();
    } catch (error) {
      message.error('Failed to update notification settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePushPermission = async () => {
    setPushPermissionLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        // Subscribe to push notifications
        const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
        if (vapidPublicKey) {
          await subscribeToPushNotifications(vapidPublicKey);
          message.success('Push notifications enabled');
        }
      } else {
        message.warning('Push notification permission denied');
      }
    } catch (error) {
      message.error('Failed to enable push notifications');
    } finally {
      setPushPermissionLoading(false);
    }
  };

  const handleWhatsAppRegistration = async () => {
    if (!whatsappPhone) {
      message.error('Please enter a valid phone number');
      return;
    }

    try {
      await registerWhatsApp(whatsappPhone);
      message.success('WhatsApp notifications enabled');
    } catch (error) {
      message.error('Failed to enable WhatsApp notifications');
    }
  };

  const handleWhatsAppRemoval = async () => {
    try {
      await removeWhatsApp();
      setWhatsappPhone('');
      message.success('WhatsApp notifications disabled');
    } catch (error) {
      message.error('Failed to disable WhatsApp notifications');
    }
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Africa/Lagos',
    'Africa/Johannesburg',
    'Africa/Cairo'
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SettingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>Notification Settings</span>
        </div>
      }
      width={700}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          pushEnabled: true,
          whatsappEnabled: true,
          inappEnabled: true,
          emailEnabled: false,
          timezone: 'UTC',
          quietHoursEnabled: false,
          maxPerDay: 10,
          cooldownMinutes: 30,
          batchSimilar: true
        }}
      >
        {/* Push Notifications */}
        <Card title={
          <Space>
            <MobileOutlined style={{ color: '#1890ff' }} />
            <span>Push Notifications</span>
          </Space>
        } style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="pushEnabled"
                valuePropName="checked"
                label="Enable Push Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
            
            {isPushSupported() && !isPushEnabled() && (
              <Col span={24}>
                <Alert
                  message="Push notifications not enabled"
                  description="Click the button below to enable push notifications for this device."
                  type="warning"
                  showIcon
                  action={
                    <Button
                      size="small"
                      type="primary"
                      loading={pushPermissionLoading}
                      onClick={handlePushPermission}
                    >
                      Enable Push
                    </Button>
                  }
                />
              </Col>
            )}
            
            <Col span={12}>
              <Form.Item
                name="pushBattle"
                valuePropName="checked"
                label="Battle Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pushStreak"
                valuePropName="checked"
                label="Streak Reminders"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pushTribe"
                valuePropName="checked"
                label="Tribe Alerts"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pushDaily"
                valuePropName="checked"
                label="Daily Challenges"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pushCoin"
                valuePropName="checked"
                label="Coin Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pushSystem"
                valuePropName="checked"
                label="System Updates"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* WhatsApp Notifications */}
        <Card title={
          <Space>
            <MessageOutlined style={{ color: '#25D366' }} />
            <span>WhatsApp Notifications</span>
          </Space>
        } style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="whatsappEnabled"
                valuePropName="checked"
                label="Enable WhatsApp Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
            
            <Col span={16}>
              <Form.Item label="WhatsApp Phone Number">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="+1234567890"
                  value={whatsappPhone}
                  onChange={setWhatsappPhone}
                  formatter={value => `+${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={value => value.replace(/\+\s?/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Space style={{ marginTop: 30 }}>
                <Button onClick={handleWhatsAppRegistration}>
                  Register
                </Button>
                <Button danger onClick={handleWhatsAppRemoval}>
                  Remove
                </Button>
              </Space>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="whatsappBattle"
                valuePropName="checked"
                label="Battle Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="whatsappStreak"
                valuePropName="checked"
                label="Streak Reminders"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="whatsappTribe"
                valuePropName="checked"
                label="Tribe Alerts"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* In-App Notifications */}
        <Card title={
          <Space>
            <BellOutlined style={{ color: '#faad14' }} />
            <span>In-App Notifications</span>
          </Space>
        } style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="inappEnabled"
                valuePropName="checked"
                label="Enable In-App Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="inappBanner"
                valuePropName="checked"
                label="Show Banner Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="inappSound"
                valuePropName="checked"
                label="Play Notification Sound"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="inappVibration"
                valuePropName="checked"
                label="Vibrate on Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Email Notifications */}
        <Card title={
          <Space>
            <MailOutlined style={{ color: '#8c8c8c' }} />
            <span>Email Notifications</span>
          </Space>
        } style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="emailEnabled"
                valuePropName="checked"
                label="Enable Email Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emailWeekly"
                valuePropName="checked"
                label="Weekly Summary"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emailSystem"
                valuePropName="checked"
                label="System Updates"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Timing Settings */}
        <Card title={
          <Space>
            <ClockCircleOutlined style={{ color: '#722ed1' }} />
            <span>Timing Settings</span>
          </Space>
        } style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="timezone"
                label="Timezone"
              >
                <Select>
                  {timezones.map(tz => (
                    <Option key={tz} value={tz}>{tz}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Divider orientation="left">Quiet Hours</Divider>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="quietHoursEnabled"
                valuePropName="checked"
                label="Enable Quiet Hours"
              >
                <Switch />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="quietHoursStart"
                label="Start Time"
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quietHoursEnd"
                label="End Time"
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Divider orientation="left">Reminders</Divider>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="dailyReminderEnabled"
                valuePropName="checked"
                label="Daily Reminder"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dailyReminderTime"
                label="Daily Reminder Time"
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="streakReminderEnabled"
                valuePropName="checked"
                label="Streak Reminder"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="streakReminderTime"
                label="Streak Reminder Time"
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Frequency Settings */}
        <Card title={
          <Space>
            <SoundOutlined style={{ color: '#13c2c2' }} />
            <span>Frequency Settings</span>
          </Space>
        } style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="maxPerDay"
                label="Maximum Notifications Per Day"
              >
                <InputNumber min={1} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cooldownMinutes"
                label="Cooldown Between Notifications (minutes)"
              >
                <InputNumber min={1} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="batchSimilar"
                valuePropName="checked"
                label="Batch Similar Notifications"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Space>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
            >
              Save Settings
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default NotificationSettings;
