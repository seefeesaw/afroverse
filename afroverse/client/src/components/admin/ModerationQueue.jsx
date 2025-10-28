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
  Badge
} from 'antd';
import { 
  EyeOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import ContentReviewer from './ContentReviewer';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ModerationQueue = () => {
  const {
    moderationQueue,
    isLoading,
    getModerationQueueData,
    setFiltersAction,
    setPaginationAction,
    pagination,
    filters
  } = useAdmin();

  const [selectedJob, setSelectedJob] = useState(null);
  const [reviewerVisible, setReviewerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadModerationQueue();
  }, [filters, pagination.page, pagination.limit]);

  const loadModerationQueue = async () => {
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        search: searchText
      };
      await getModerationQueueData(params);
    } catch (error) {
      message.error('Failed to load moderation queue');
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setFiltersAction({ search: value });
  };

  const handleFilterChange = (key, value) => {
    setFiltersAction({ [key]: value });
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setReviewerVisible(true);
  };

  const handleJobUpdate = (updatedJob) => {
    // Update the job in the queue
    const updatedQueue = moderationQueue.map(job => 
      job._id === updatedJob._id ? updatedJob : job
    );
    // This would typically be handled by Redux state update
    message.success('Job updated successfully');
    setReviewerVisible(false);
    setSelectedJob(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'passed': return 'green';
      case 'blocked': return 'red';
      case 'flagged': return 'purple';
      case 'quarantined': return 'blue';
      case 'needs_review': return 'yellow';
      case 'appealed': return 'cyan';
      case 'resolved': return 'green';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
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
      dataIndex: 'subject',
      key: 'type',
      width: 100,
      render: (subject) => (
        <Tag color="blue">{subject.type}</Tag>
      ),
    },
    {
      title: 'User',
      dataIndex: 'subject',
      key: 'user',
      width: 120,
      render: (subject) => (
        <div>
          <UserOutlined style={{ marginRight: 4 }} />
          {subject.userId?.substring(0, 8)}...
        </div>
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
      title: 'Priority',
      dataIndex: 'escalation',
      key: 'priority',
      width: 80,
      render: (escalation) => (
        <Tag color={getPriorityColor(escalation?.priority)}>
          {escalation?.priority?.toUpperCase() || 'NORMAL'}
        </Tag>
      ),
    },
    {
      title: 'Labels',
      dataIndex: 'labels',
      key: 'labels',
      width: 150,
      render: (labels) => (
        <div>
          {labels?.slice(0, 2).map((label, index) => (
            <Tag key={index} size="small" color="purple">
              {label}
            </Tag>
          ))}
          {labels?.length > 2 && (
            <Tag size="small" color="default">
              +{labels.length - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Scores',
      dataIndex: 'scores',
      key: 'scores',
      width: 120,
      render: (scores) => (
        <div>
          {scores?.nsfw > 0.5 && (
            <Tag size="small" color="red">NSFW: {(scores.nsfw * 100).toFixed(0)}%</Tag>
          )}
          {scores?.violence > 0.5 && (
            <Tag size="small" color="orange">Violence: {(scores.violence * 100).toFixed(0)}%</Tag>
          )}
        </div>
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
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 100,
      render: (assignedTo) => (
        assignedTo ? (
          <Tag color="blue">{assignedTo.name}</Tag>
        ) : (
          <Tag color="default">Unassigned</Tag>
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
              onClick={() => handleViewJob(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                />
              </Tooltip>
              <Tooltip title="Reject">
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

  return (
    <div>
      <Card title="Moderation Queue" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search jobs..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="passed">Passed</Option>
              <Option value="blocked">Blocked</Option>
              <Option value="flagged">Flagged</Option>
              <Option value="quarantined">Quarantined</Option>
              <Option value="needs_review">Needs Review</Option>
              <Option value="appealed">Appealed</Option>
              <Option value="resolved">Resolved</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by type"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('type', value)}
              allowClear
            >
              <Option value="upload">Upload</Option>
              <Option value="transform">Transform</Option>
              <Option value="battle">Battle</Option>
              <Option value="profile">Profile</Option>
              <Option value="comment">Comment</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by priority"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('priority', value)}
              allowClear
            >
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={moderationQueue}
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
        title="Content Reviewer"
        open={reviewerVisible}
        onCancel={() => setReviewerVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        {selectedJob && (
          <ContentReviewer
            job={selectedJob}
            onUpdate={handleJobUpdate}
            onClose={() => setReviewerVisible(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ModerationQueue;
