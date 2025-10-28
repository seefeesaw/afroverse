import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { 
  Table, 
  Card, 
  Button, 
  Tag, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col,
  Modal,
  message,
  Tooltip,
  Badge,
  Statistic,
  Typography,
  Descriptions
} from 'antd';
import { 
  EyeOutlined, 
  AuditOutlined,
  UserOutlined,
  ClockCircleOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const AuditLog = () => {
  const {
    auditLogs,
    isLoading,
    getAuditLogsData,
    setFiltersAction,
    setPaginationAction,
    pagination,
    filters
  } = useAdmin();

  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [filters, pagination.page, pagination.limit]);

  const loadAuditLogs = async () => {
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        search: searchText
      };
      await getAuditLogsData(params);
    } catch (error) {
      message.error('Failed to load audit logs');
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setFiltersAction({ search: value });
  };

  const handleFilterChange = (key, value) => {
    setFiltersAction({ [key]: value });
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailsVisible(true);
  };

  const handleReverseAction = async (logId, reason) => {
    try {
      await reverseAuditLogAction(logId, reason);
      message.success('Action reversed successfully');
      loadAuditLogs();
    } catch (error) {
      message.error('Failed to reverse action');
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'moderation_decision': return 'blue';
      case 'enforcement': return 'red';
      case 'tribe_edit': return 'green';
      case 'leaderboard_adjust': return 'purple';
      case 'entitlement_change': return 'orange';
      case 'config_update': return 'cyan';
      case 'user_management': return 'magenta';
      case 'fraud_action': return 'red';
      case 'style_management': return 'blue';
      case 'achievement_management': return 'green';
      case 'notification_template_edit': return 'purple';
      case 'admin_auth': return 'gray';
      default: return 'default';
    }
  };

  const getTargetColor = (target) => {
    switch (target) {
      case 'user': return 'blue';
      case 'battle': return 'purple';
      case 'transform': return 'green';
      case 'tribe': return 'orange';
      case 'leaderboard': return 'red';
      case 'config': return 'cyan';
      case 'style': return 'magenta';
      case 'achievement': return 'green';
      case 'notification_template': return 'purple';
      case 'admin_user': return 'gray';
      case 'fraud_detection': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 80,
      render: (id) => (
        <Tooltip title={id}>
          {id.substring(0, 8)}...
        </Tooltip>
      ),
    },
    {
      title: 'Actor',
      dataIndex: 'actor',
      key: 'actor',
      width: 120,
      render: (actor) => (
        <div>
          <UserOutlined style={{ marginRight: 4 }} />
          <Text>{actor.email || 'System'}</Text>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      width: 100,
      render: (target) => (
        <Tag color={getTargetColor(target.type)}>
          {target.type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Target ID',
      dataIndex: 'target',
      key: 'targetId',
      width: 120,
      render: (target) => (
        target.id ? (
          <Text code>{target.id.substring(0, 8)}...</Text>
        ) : (
          <Text type="secondary">N/A</Text>
        )
      ),
    },
    {
      title: 'Target Name',
      dataIndex: 'target',
      key: 'targetName',
      width: 120,
      render: (target) => (
        <Text>{target.name || 'N/A'}</Text>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason) => (
        <Tooltip title={reason}>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {reason || 'N/A'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 100,
      render: (ip) => (
        <Text code>{ip || 'N/A'}</Text>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Reverse Action">
            <Button
              type="default"
              size="small"
              icon={<UndoOutlined />}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderLogDetails = () => {
    if (!selectedLog) return null;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Log Details" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="ID">
                  <Text code>{selectedLog._id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Actor">
                  <div>
                    <UserOutlined style={{ marginRight: 4 }} />
                    <Text>{selectedLog.actor.email || 'System'}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Action">
                  <Tag color={getActionColor(selectedLog.action)}>
                    {selectedLog.action.replace('_', ' ').toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Target Type">
                  <Tag color={getTargetColor(selectedLog.target.type)}>
                    {selectedLog.target.type.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Target ID">
                  <Text code>{selectedLog.target.id || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Target Name">
                  <Text>{selectedLog.target.name || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Reason">
                  <Text>{selectedLog.reason || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="IP Address">
                  <Text code>{selectedLog.ip || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="User Agent">
                  <Text ellipsis style={{ maxWidth: 300 }}>
                    {selectedLog.userAgent || 'N/A'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  <Text>{new Date(selectedLog.createdAt).toLocaleString()}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Changes" size="small">
              {selectedLog.before && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Before:</Text>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 8, 
                    borderRadius: 4,
                    fontSize: 12,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(selectedLog.before, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.after && (
                <div>
                  <Text strong>After:</Text>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 8, 
                    borderRadius: 4,
                    fontSize: 12,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(selectedLog.after, null, 2)}
                  </pre>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Actions" size="small">
              <Space>
                <Button
                  type="default"
                  icon={<UndoOutlined />}
                  danger
                  onClick={() => handleReverseAction(selectedLog._id, 'Admin reversal')}
                >
                  Reverse Action
                </Button>
                <Button
                  type="default"
                  onClick={() => setDetailsVisible(false)}
                >
                  Close
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Logs"
              value={auditLogs.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AuditOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Today's Actions"
              value={auditLogs.filter(log => 
                new Date(log.createdAt).toDateString() === new Date().toDateString()
              ).length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Admin Actions"
              value={auditLogs.filter(log => log.actor.type === 'admin').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Audit Logs" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search logs..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by action"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('action', value)}
              allowClear
            >
              <Option value="moderation_decision">Moderation Decision</Option>
              <Option value="enforcement">Enforcement</Option>
              <Option value="tribe_edit">Tribe Edit</Option>
              <Option value="leaderboard_adjust">Leaderboard Adjust</Option>
              <Option value="entitlement_change">Entitlement Change</Option>
              <Option value="config_update">Config Update</Option>
              <Option value="user_management">User Management</Option>
              <Option value="fraud_action">Fraud Action</Option>
              <Option value="style_management">Style Management</Option>
              <Option value="achievement_management">Achievement Management</Option>
              <Option value="notification_template_edit">Notification Template Edit</Option>
              <Option value="admin_auth">Admin Auth</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by target"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('target', value)}
              allowClear
            >
              <Option value="user">User</Option>
              <Option value="battle">Battle</Option>
              <Option value="transform">Transform</Option>
              <Option value="tribe">Tribe</Option>
              <Option value="leaderboard">Leaderboard</Option>
              <Option value="config">Config</Option>
              <Option value="style">Style</Option>
              <Option value="achievement">Achievement</Option>
              <Option value="notification_template">Notification Template</Option>
              <Option value="admin_user">Admin User</Option>
              <Option value="fraud_detection">Fraud Detection</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={auditLogs}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, pageSize) => {
              setPaginationAction({ page, limit: pageSize });
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Audit Log Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        {renderLogDetails()}
      </Modal>
    </div>
  );
};

export default AuditLog;
