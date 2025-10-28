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
  Progress
} from 'antd';
import { 
  EyeOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SecurityScanOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FraudCenter = () => {
  const {
    fraudDetections,
    isLoading,
    getFraudDetectionsData,
    setFiltersAction,
    setPaginationAction,
    pagination,
    filters
  } = useAdmin();

  const [selectedDetection, setSelectedDetection] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadFraudDetections();
  }, [filters, pagination.page, pagination.limit]);

  const loadFraudDetections = async () => {
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        search: searchText
      };
      await getFraudDetectionsData(params);
    } catch (error) {
      message.error('Failed to load fraud detections');
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setFiltersAction({ search: value });
  };

  const handleFilterChange = (key, value) => {
    setFiltersAction({ [key]: value });
  };

  const handleViewDetails = (detection) => {
    setSelectedDetection(detection);
    setDetailsVisible(true);
  };

  const handleReviewDetection = async (detectionId, action, notes) => {
    try {
      await reviewFraud(detectionId, action, notes);
      message.success('Fraud detection reviewed successfully');
      setDetailsVisible(false);
      setSelectedDetection(null);
      loadFraudDetections();
    } catch (error) {
      message.error('Failed to review fraud detection');
    }
  };

  const handleShadowbanUser = async (userId, reason) => {
    try {
      await shadowban(userId, reason);
      message.success('User shadowbanned successfully');
    } catch (error) {
      message.error('Failed to shadowban user');
    }
  };

  const handleLiftShadowban = async (userId, reason) => {
    try {
      await liftShadowbanAction(userId, reason);
      message.success('Shadowban lifted successfully');
    } catch (error) {
      message.error('Failed to lift shadowban');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'flagged': return 'red';
      case 'resolved': return 'green';
      case 'dismissed': return 'gray';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'vote_fraud': return 'red';
      case 'multi_account': return 'purple';
      case 'nsfw_content': return 'pink';
      case 'spam_battle': return 'orange';
      case 'ai_abuse': return 'blue';
      case 'suspicious_activity': return 'yellow';
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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'user',
      width: 120,
      render: (userId) => (
        <div>
          <UserOutlined style={{ marginRight: 4 }} />
          {userId?.substring(0, 8)}...
        </div>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      render: (score) => (
        <Progress
          percent={score}
          size="small"
          status={score > 80 ? 'exception' : score > 60 ? 'active' : 'success'}
        />
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 80,
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Evidence',
      dataIndex: 'evidence',
      key: 'evidence',
      width: 150,
      render: (evidence) => (
        <div>
          {evidence?.reason && (
            <Tag size="small" color="blue">
              {evidence.reason}
            </Tag>
          )}
          {evidence?.battleId && (
            <Tag size="small" color="purple">
              Battle: {evidence.battleId.substring(0, 8)}...
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Detected',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      width: 120,
      render: (date) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Resolved',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      width: 120,
      render: (date) => (
        date ? (
          <div>
            <CheckOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            {new Date(date).toLocaleDateString()}
          </div>
        ) : (
          <Tag color="orange">Pending</Tag>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
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
          {record.status === 'flagged' && (
            <>
              <Tooltip title="Resolve">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                />
              </Tooltip>
              <Tooltip title="Dismiss">
                <Button
                  type="primary"
                  size="small"
                  icon={<CloseOutlined />}
                  danger
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const renderFraudDetails = () => {
    if (!selectedDetection) return null;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Detection Details" size="small">
              <div style={{ marginBottom: 8 }}>
                <Text strong>ID:</Text>
                <br />
                <Text code>{selectedDetection._id}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Type:</Text>
                <br />
                <Tag color={getTypeColor(selectedDetection.type)}>
                  {selectedDetection.type.replace('_', ' ').toUpperCase()}
                </Tag>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>User ID:</Text>
                <br />
                <Text code>{selectedDetection.userId}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Score:</Text>
                <br />
                <Progress
                  percent={selectedDetection.score}
                  status={selectedDetection.score > 80 ? 'exception' : 'success'}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Severity:</Text>
                <br />
                <Tag color={getSeverityColor(selectedDetection.severity)}>
                  {selectedDetection.severity.toUpperCase()}
                </Tag>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Status:</Text>
                <br />
                <Tag color={getStatusColor(selectedDetection.status)}>
                  {selectedDetection.status.toUpperCase()}
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Evidence" size="small">
              <div style={{ marginBottom: 8 }}>
                <Text strong>Reason:</Text>
                <br />
                <Text>{selectedDetection.evidence?.reason || 'N/A'}</Text>
              </div>
              {selectedDetection.evidence?.battleId && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Battle ID:</Text>
                  <br />
                  <Text code>{selectedDetection.evidence.battleId}</Text>
                </div>
              )}
              {selectedDetection.evidence?.fingerprint && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Fingerprint:</Text>
                  <br />
                  <Text code>{selectedDetection.evidence.fingerprint}</Text>
                </div>
              )}
              {selectedDetection.evidence?.ip && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>IP Address:</Text>
                  <br />
                  <Text code>{selectedDetection.evidence.ip}</Text>
                </div>
              )}
              {selectedDetection.evidence?.associatedUsers && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Associated Users:</Text>
                  <br />
                  {selectedDetection.evidence.associatedUsers.map((userId, index) => (
                    <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
                      {userId.substring(0, 8)}...
                    </Tag>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Timeline" size="small">
              <div style={{ marginBottom: 8 }}>
                <Text strong>Detected At:</Text>
                <br />
                <Text>{new Date(selectedDetection.detectedAt).toLocaleString()}</Text>
              </div>
              {selectedDetection.resolvedAt && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Resolved At:</Text>
                  <br />
                  <Text>{new Date(selectedDetection.resolvedAt).toLocaleString()}</Text>
                </div>
              )}
              {selectedDetection.resolvedBy && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Resolved By:</Text>
                  <br />
                  <Text>{selectedDetection.resolvedBy.name}</Text>
                </div>
              )}
              {selectedDetection.notes && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Notes:</Text>
                  <br />
                  <Text>{selectedDetection.notes}</Text>
                </div>
              )}
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
              title="Pending Detections"
              value={fraudDetections.filter(d => d.status === 'pending').length}
              valueStyle={{ color: '#f5222d' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Flagged Detections"
              value={fraudDetections.filter(d => d.status === 'flagged').length}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Resolved Detections"
              value={fraudDetections.filter(d => d.status === 'resolved').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Fraud Detections" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search detections..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by type"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('type', value)}
              allowClear
            >
              <Option value="vote_fraud">Vote Fraud</Option>
              <Option value="multi_account">Multi Account</Option>
              <Option value="nsfw_content">NSFW Content</Option>
              <Option value="spam_battle">Spam Battle</Option>
              <Option value="ai_abuse">AI Abuse</Option>
              <Option value="suspicious_activity">Suspicious Activity</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="flagged">Flagged</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="dismissed">Dismissed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by severity"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('severity', value)}
              allowClear
            >
              <Option value="critical">Critical</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={fraudDetections}
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
        title="Fraud Detection Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        {renderFraudDetails()}
      </Modal>
    </div>
  );
};

export default FraudCenter;
