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
  Avatar,
  Typography
} from 'antd';
import { 
  EyeOutlined, 
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  BanOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const UserManagement = () => {
  const {
    users,
    isLoading,
    getUsersData,
    setFiltersAction,
    setPaginationAction,
    pagination,
    filters
  } = useAdmin();

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.page, pagination.limit]);

  const loadUsers = async () => {
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        search: searchText
      };
      await getUsersData(params);
    } catch (error) {
      message.error('Failed to load users');
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setFiltersAction({ search: value });
  };

  const handleFilterChange = (key, value) => {
    setFiltersAction({ [key]: value });
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsVisible(true);
  };

  const handleBanUser = async (userId, reason, duration) => {
    try {
      await banUserAction(userId, reason, duration);
      message.success('User banned successfully');
      loadUsers();
    } catch (error) {
      message.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId, reason) => {
    try {
      await unbanUserAction(userId, reason);
      message.success('User unbanned successfully');
      loadUsers();
    } catch (error) {
      message.error('Failed to unban user');
    }
  };

  const handleApplyEnforcement = async (userId, type, scope, reason, expiresAt) => {
    try {
      await applyEnforcementAction(userId, type, scope, reason, expiresAt);
      message.success('Enforcement applied successfully');
      loadUsers();
    } catch (error) {
      message.error('Failed to apply enforcement');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'banned': return 'red';
      case 'shadowbanned': return 'orange';
      case 'suspended': return 'yellow';
      default: return 'default';
    }
  };

  const getTribeColor = (tribe) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'cyan', 'magenta'];
    return colors[tribe?.name?.charCodeAt(0) % colors.length] || 'default';
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'profileImage',
      key: 'avatar',
      width: 60,
      render: (profileImage, record) => (
        <Avatar
          src={profileImage}
          icon={<UserOutlined />}
          size="small"
        />
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (username) => (
        <Text strong>{username}</Text>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (phone) => (
        <Text code>{phone}</Text>
      ),
    },
    {
      title: 'Tribe',
      dataIndex: 'tribe',
      key: 'tribe',
      width: 100,
      render: (tribe) => (
        tribe ? (
          <Tag color={getTribeColor(tribe)}>
            {tribe.name}
          </Tag>
        ) : (
          <Tag color="default">No Tribe</Tag>
        )
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
      title: 'Level',
      dataIndex: 'progression',
      key: 'level',
      width: 80,
      render: (progression) => (
        <Badge count={progression?.level || 1} color="blue" />
      ),
    },
    {
      title: 'Streak',
      dataIndex: 'streak',
      key: 'streak',
      width: 80,
      render: (streak) => (
        <div>
          <FireOutlined style={{ color: '#ff4d4f' }} />
          <Text style={{ marginLeft: 4 }}>{streak?.current || 0}</Text>
        </div>
      ),
    },
    {
      title: 'Points',
      dataIndex: 'tribePoints',
      key: 'points',
      width: 80,
      render: (points) => (
        <div>
          <TrophyOutlined style={{ color: '#faad14' }} />
          <Text style={{ marginLeft: 4 }}>{points || 0}</Text>
        </div>
      ),
    },
    {
      title: 'Transformations',
      dataIndex: 'transformationCount',
      key: 'transformations',
      width: 100,
      render: (count) => (
        <Badge count={count || 0} color="green" />
      ),
    },
    {
      title: 'Battles',
      dataIndex: 'battleCount',
      key: 'battles',
      width: 80,
      render: (count) => (
        <Badge count={count || 0} color="purple" />
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'joined',
      width: 120,
      render: (date) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActiveAt',
      key: 'lastActive',
      width: 120,
      render: (date) => (
        date ? (
          <div>
            <CheckCircleOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            {new Date(date).toLocaleDateString()}
          </div>
        ) : (
          <Tag color="gray">Never</Tag>
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
          {record.status === 'active' && (
            <Tooltip title="Ban User">
              <Button
                type="primary"
                size="small"
                icon={<BanOutlined />}
                danger
              />
            </Tooltip>
          )}
          {record.status === 'banned' && (
            <Tooltip title="Unban User">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="User Profile" size="small">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Avatar
                  src={selectedUser.profileImage}
                  icon={<UserOutlined />}
                  size={80}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong>{selectedUser.username}</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedUser.phone}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Status:</Text>
                <br />
                <Tag color={getStatusColor(selectedUser.status)}>
                  {selectedUser.status.toUpperCase()}
                </Tag>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Tribe:</Text>
                <br />
                {selectedUser.tribe ? (
                  <Tag color={getTribeColor(selectedUser.tribe)}>
                    {selectedUser.tribe.name}
                  </Tag>
                ) : (
                  <Tag color="default">No Tribe</Tag>
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Joined:</Text>
                <br />
                <Text>{new Date(selectedUser.createdAt).toLocaleString()}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Last Active:</Text>
                <br />
                <Text>
                  {selectedUser.lastActiveAt 
                    ? new Date(selectedUser.lastActiveAt).toLocaleString()
                    : 'Never'
                  }
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Stats" size="small">
              <div style={{ marginBottom: 8 }}>
                <Text strong>Level:</Text>
                <br />
                <Badge count={selectedUser.progression?.level || 1} color="blue" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Current Streak:</Text>
                <br />
                <div>
                  <FireOutlined style={{ color: '#ff4d4f' }} />
                  <Text style={{ marginLeft: 4 }}>{selectedUser.streak?.current || 0}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Longest Streak:</Text>
                <br />
                <div>
                  <FireOutlined style={{ color: '#faad14' }} />
                  <Text style={{ marginLeft: 4 }}>{selectedUser.streak?.longest || 0}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Tribe Points:</Text>
                <br />
                <div>
                  <TrophyOutlined style={{ color: '#faad14' }} />
                  <Text style={{ marginLeft: 4 }}>{selectedUser.tribePoints || 0}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Transformations:</Text>
                <br />
                <Badge count={selectedUser.transformationCount || 0} color="green" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Battles:</Text>
                <br />
                <Badge count={selectedUser.battleCount || 0} color="purple" />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Actions" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {selectedUser.status === 'active' && (
                  <>
                    <Button
                      type="primary"
                      danger
                      icon={<BanOutlined />}
                      block
                      onClick={() => handleBanUser(selectedUser._id, 'Admin action', null)}
                    >
                      Ban User
                    </Button>
                    <Button
                      type="default"
                      icon={<ExclamationCircleOutlined />}
                      block
                    >
                      Apply Enforcement
                    </Button>
                  </>
                )}
                {selectedUser.status === 'banned' && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    block
                    onClick={() => handleUnbanUser(selectedUser._id, 'Admin action')}
                  >
                    Unban User
                  </Button>
                )}
                <Button
                  type="default"
                  block
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
              title="Total Users"
              value={users.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Users"
              value={users.filter(u => u.status === 'active').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Banned Users"
              value={users.filter(u => u.status === 'banned').length}
              valueStyle={{ color: '#f5222d' }}
              prefix={<BanOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="User Management" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search users..."
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
              <Option value="active">Active</Option>
              <Option value="banned">Banned</Option>
              <Option value="shadowbanned">Shadowbanned</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by tribe"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('tribe', value)}
              allowClear
            >
              <Option value="maasai">Maasai</Option>
              <Option value="zulu">Zulu</Option>
              <Option value="yoruba">Yoruba</Option>
              <Option value="igbo">Igbo</Option>
              <Option value="hausa">Hausa</Option>
              <Option value="ashanti">Ashanti</Option>
              <Option value="amhara">Amhara</Option>
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
          dataSource={users}
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
        title="User Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        {renderUserDetails()}
      </Modal>
    </div>
  );
};

export default UserManagement;
