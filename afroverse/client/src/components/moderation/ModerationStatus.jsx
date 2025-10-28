import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Progress,
  Statistic,
  Alert,
  Space,
  Button,
  Tooltip,
  Badge
} from 'antd';
import {
  ShieldOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import useModeration from '../../hooks/useModeration';

const { Title, Text } = Typography;

const ModerationStatus = ({ 
  userId,
  showDetails = false,
  onRefresh
}) => {
  const {
    moderationHistory,
    userReports,
    reportsAgainst,
    stats,
    serviceStatus,
    loading,
    getModerationHistory,
    getUserReports,
    getReportsAgainst,
    getModerationStats,
    getServiceHealth
  } = useModeration();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      getModerationHistory({ limit: 10 });
      getUserReports({ limit: 10 });
      getReportsAgainst({ limit: 10 });
      getModerationStats('7d');
    }
  }, [userId, getModerationHistory, getUserReports, getReportsAgainst, getModerationStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        getModerationHistory({ limit: 10 }),
        getUserReports({ limit: 10 }),
        getReportsAgainst({ limit: 10 }),
        getModerationStats('7d')
      ]);
      if (onRefresh) {
        onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const getServiceHealth = () => {
    const services = serviceStatus.services || {};
    const health = {
      faceDetection: services.faceDetection?.initialized || false,
      nsfwDetection: services.nsfwDetection?.initialized || false,
      textModeration: services.textModeration?.initialized || false,
      rulesEngine: services.rulesEngine?.totalRules > 0 || false
    };
    
    const healthyServices = Object.values(health).filter(Boolean).length;
    const totalServices = Object.keys(health).length;
    
    return {
      ...health,
      overall: healthyServices === totalServices,
      score: Math.round((healthyServices / totalServices) * 100)
    };
  };

  const getActiveModerationActions = () => {
    return moderationHistory.filter(action => !action.resolvedAt);
  };

  const getPendingReports = () => {
    return userReports.filter(report => report.status === 'pending');
  };

  const getResolvedReports = () => {
    return userReports.filter(report => report.status === 'resolved');
  };

  const getHighPriorityReports = () => {
    return userReports.filter(report => report.priority === 'high' || report.priority === 'urgent');
  };

  const getModerationActionsBySeverity = (severity) => {
    return moderationHistory.filter(action => action.severity === severity);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'low': '#52c41a',
      'medium': '#faad14',
      'high': '#ff4d4f',
      'critical': '#722ed1'
    };
    return colors[severity] || '#8c8c8c';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      'low': <CheckCircleOutlined />,
      'medium': <ExclamationCircleOutlined />,
      'high': <WarningOutlined />,
      'critical': <ExclamationCircleOutlined />
    };
    return icons[severity] || <InfoCircleOutlined />;
  };

  const getActionColor = (action) => {
    const colors = {
      'warning': '#faad14',
      'soft_block': '#ff4d4f',
      'hard_ban': '#ff4d4f',
      'user_banned': '#722ed1',
      'blocked_image': '#ff4d4f',
      'blocked_text': '#faad14'
    };
    return colors[action] || '#8c8c8c';
  };

  const health = getServiceHealth();
  const activeActions = getActiveModerationActions();
  const pendingReports = getPendingReports();
  const resolvedReports = getResolvedReports();
  const highPriorityReports = getHighPriorityReports();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ShieldOutlined style={{ marginRight: 8, color: '#1890ff', fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>Moderation Status</Title>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={isRefreshing}
          size="small"
        >
          Refresh
        </Button>
      </div>

      {/* Service Health */}
      <Card title="Service Health" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Progress
                type="circle"
                percent={health.score}
                size={80}
                strokeColor={health.overall ? '#52c41a' : '#faad14'}
              />
              <div style={{ marginLeft: 16 }}>
                <Text strong style={{ fontSize: 16 }}>
                  Overall Health: {health.score}%
                </Text>
                <div>
                  <Text type="secondary">
                    {health.overall ? 'All services operational' : 'Some services may be degraded'}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 8 }}>
                {health.faceDetection ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                )}
              </div>
              <Text strong>Face Detection</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 8 }}>
                {health.nsfwDetection ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                )}
              </div>
              <Text strong>NSFW Detection</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 8 }}>
                {health.textModeration ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                )}
              </div>
              <Text strong>Text Moderation</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 8 }}>
                {health.rulesEngine ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                )}
              </div>
              <Text strong>Rules Engine</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Moderation Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Actions"
              value={activeActions.length}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Reports"
              value={pendingReports.length}
              prefix={<EyeOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Resolved Reports"
              value={resolvedReports.length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="High Priority"
              value={highPriorityReports.length}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Active Moderation Actions */}
      {activeActions.length > 0 && (
        <Card title="Active Moderation Actions" style={{ marginBottom: 16 }}>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {activeActions.map((action, index) => (
              <motion.div
                key={action._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  style={{
                    padding: '12px 0',
                    borderBottom: index < activeActions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Tag
                      color={getSeverityColor(action.severity)}
                      icon={getSeverityIcon(action.severity)}
                      style={{ marginRight: 12 }}
                    >
                      {action.action.replace('_', ' ').toUpperCase()}
                    </Tag>
                    <div>
                      <Text strong style={{ fontSize: 14 }}>
                        {action.reason}
                      </Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(action.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <Tag color={getActionColor(action.action)}>
                    {action.category}
                  </Tag>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Reports */}
      {userReports.length > 0 && (
        <Card title="Recent Reports" style={{ marginBottom: 16 }}>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {userReports.slice(0, 5).map((report, index) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  style={{
                    padding: '12px 0',
                    borderBottom: index < Math.min(userReports.length, 5) - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: 14 }}>
                      {report.reason.replace('_', ' ').toUpperCase()}
                    </Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {report.targetType} • {new Date(report.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                  <Badge
                    status={
                      report.status === 'pending' ? 'processing' :
                      report.status === 'resolved' ? 'success' :
                      report.status === 'dismissed' ? 'default' : 'warning'
                    }
                    text={report.status}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Service Status Alert */}
      {!health.overall && (
        <Alert
          message="Service Degradation"
          description="Some moderation services are not fully operational. Content moderation may be limited."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default ModerationStatus;
