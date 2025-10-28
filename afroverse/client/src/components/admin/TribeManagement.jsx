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
  Row, 
  Col,
  Modal,
  message,
  Tooltip,
  Badge,
  Statistic,
  Avatar,
  Typography,
  Progress
} from 'antd';
import { 
  EyeOutlined, 
  TeamOutlined,
  TrophyOutlined,
  CrownOutlined,
  UserOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const TribeManagement = () => {
  const {
    tribes,
    isLoading,
    getTribesData,
    setFiltersAction,
    setPaginationAction,
    pagination,
    filters
  } = useAdmin();

  const [selectedTribe, setSelectedTribe] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadTribes();
  }, [filters, pagination.page, pagination.limit]);

  const loadTribes = async () => {
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        search: searchText
      };
      await getTribesData(params);
    } catch (error) {
      message.error('Failed to load tribes');
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setFiltersAction({ search: value });
  };

  const handleFilterChange = (key, value) => {
    setFiltersAction({ [key]: value });
  };

  const handleViewDetails = (tribe) => {
    setSelectedTribe(tribe);
    setDetailsVisible(true);
  };

  const handleUpdateTribe = async (tribeId, updates) => {
    try {
      await updateTribeData(tribeId, updates);
      message.success('Tribe updated successfully');
      loadTribes();
    } catch (error) {
      message.error('Failed to update tribe');
    }
  };

  const handleChangeCaptain = async (tribeId, newCaptainId, reason) => {
    try {
      await changeCaptain(tribeId, newCaptainId, reason);
      message.success('Tribe captain changed successfully');
      loadTribes();
    } catch (error) {
      message.error('Failed to change tribe captain');
    }
  };

  const getTribeColor = (tribe) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'cyan', 'magenta'];
    return colors[tribe?.name?.charCodeAt(0) % colors.length] || 'default';
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 60,
      render: (avatar, record) => (
        <Avatar
          src={avatar}
          icon={<TeamOutlined />}
          size="small"
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name) => (
        <Text strong>{name}</Text>
      ),
    },
    {
      title: 'Captain',
      dataIndex: 'captain',
      key: 'captain',
      width: 120,
      render: (captain) => (
        captain ? (
          <div>
            <CrownOutlined style={{ marginRight: 4, color: '#faad14' }} />
            <Text>{captain.username}</Text>
          </div>
        ) : (
          <Tag color="default">No Captain</Tag>
        )
      ),
    },
    {
      title: 'Members',
      dataIndex: 'memberCount',
      key: 'members',
      width: 80,
      render: (count) => (
        <Badge count={count || 0} color="blue" />
      ),
    },
    {
      title: 'Points',
      dataIndex: 'totalPoints',
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
      title: 'Weekly Rank',
      dataIndex: 'weeklyRank',
      key: 'weeklyRank',
      width: 100,
      render: (rank) => (
        rank ? (
          <Badge count={`#${rank}`} color="green" />
        ) : (
          <Tag color="default">Unranked</Tag>
        )
      ),
    },
    {
      title: 'All-Time Rank',
      dataIndex: 'allTimeRank',
      key: 'allTimeRank',
      width: 100,
      render: (rank) => (
        rank ? (
          <Badge count={`#${rank}`} color="purple" />
        ) : (
          <Tag color="default">Unranked</Tag>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'created',
      width: 120,
      render: (date) => (
        <Text>{new Date(date).toLocaleDateString()}</Text>
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
          <Tooltip title="Edit Tribe">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
            />
          </Tooltip>
          <Tooltip title="Change Captain">
            <Button
              type="default"
              size="small"
              icon={<CrownOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderTribeDetails = () => {
    if (!selectedTribe) return null;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="Tribe Profile" size="small">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Avatar
                  src={selectedTribe.avatar}
                  icon={<TeamOutlined />}
                  size={80}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong>{selectedTribe.name}</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedTribe.description}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Status:</Text>
                <br />
                <Tag color={selectedTribe.status === 'active' ? 'green' : 'red'}>
                  {selectedTribe.status.toUpperCase()}
                </Tag>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Captain:</Text>
                <br />
                {selectedTribe.captain ? (
                  <div>
                    <CrownOutlined style={{ marginRight: 4, color: '#faad14' }} />
                    <Text>{selectedTribe.captain.username}</Text>
                  </div>
                ) : (
                  <Tag color="default">No Captain</Tag>
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Created:</Text>
                <br />
                <Text>{new Date(selectedTribe.createdAt).toLocaleString()}</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Stats" size="small">
              <div style={{ marginBottom: 8 }}>
                <Text strong>Total Members:</Text>
                <br />
                <Badge count={selectedTribe.memberCount || 0} color="blue" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Total Points:</Text>
                <br />
                <div>
                  <TrophyOutlined style={{ color: '#faad14' }} />
                  <Text style={{ marginLeft: 4 }}>{selectedTribe.totalPoints || 0}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Weekly Rank:</Text>
                <br />
                {selectedTribe.weeklyRank ? (
                  <Badge count={`#${selectedTribe.weeklyRank}`} color="green" />
                ) : (
                  <Tag color="default">Unranked</Tag>
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>All-Time Rank:</Text>
                <br />
                {selectedTribe.allTimeRank ? (
                  <Badge count={`#${selectedTribe.allTimeRank}`} color="purple" />
                ) : (
                  <Tag color="default">Unranked</Tag>
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Weekly Points:</Text>
                <br />
                <div>
                  <TrophyOutlined style={{ color: '#52c41a' }} />
                  <Text style={{ marginLeft: 4 }}>{selectedTribe.weeklyPoints || 0}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Battles Won:</Text>
                <br />
                <Badge count={selectedTribe.battlesWon || 0} color="green" />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Actions" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  block
                  onClick={() => handleUpdateTribe(selectedTribe._id, {})}
                >
                  Edit Tribe
                </Button>
                <Button
                  type="default"
                  icon={<CrownOutlined />}
                  block
                  onClick={() => handleChangeCaptain(selectedTribe._id, null, 'Admin action')}
                >
                  Change Captain
                </Button>
                <Button
                  type="default"
                  icon={<ExclamationCircleOutlined />}
                  block
                >
                  Manage Members
                </Button>
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

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Top Members" size="small">
              <Table
                dataSource={selectedTribe.topMembers || []}
                columns={[
                  {
                    title: 'Rank',
                    dataIndex: 'rank',
                    key: 'rank',
                    width: 60,
                    render: (rank) => <Badge count={rank} color="blue" />,
                  },
                  {
                    title: 'Username',
                    dataIndex: 'username',
                    key: 'username',
                    render: (username) => <Text strong>{username}</Text>,
                  },
                  {
                    title: 'Points',
                    dataIndex: 'points',
                    key: 'points',
                    render: (points) => (
                      <div>
                        <TrophyOutlined style={{ color: '#faad14' }} />
                        <Text style={{ marginLeft: 4 }}>{points}</Text>
                      </div>
                    ),
                  },
                  {
                    title: 'Level',
                    dataIndex: 'level',
                    key: 'level',
                    render: (level) => <Badge count={level} color="green" />,
                  },
                  {
                    title: 'Streak',
                    dataIndex: 'streak',
                    key: 'streak',
                    render: (streak) => (
                      <div>
                        <FireOutlined style={{ color: '#ff4d4f' }} />
                        <Text style={{ marginLeft: 4 }}>{streak}</Text>
                      </div>
                    ),
                  },
                ]}
                pagination={false}
                size="small"
              />
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
              title="Total Tribes"
              value={tribes.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Tribes"
              value={tribes.filter(t => t.status === 'active').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Members"
              value={tribes.reduce((sum, tribe) => sum + (tribe.memberCount || 0), 0)}
              valueStyle={{ color: '#faad14' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Tribe Management" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search tribes..."
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
              <Option value="inactive">Inactive</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by rank"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('rank', value)}
              allowClear
            >
              <Option value="top10">Top 10</Option>
              <Option value="top50">Top 50</Option>
              <Option value="top100">Top 100</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Sort by"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('sortBy', value)}
              allowClear
            >
              <Option value="points">Points</Option>
              <Option value="members">Members</Option>
              <Option value="rank">Rank</Option>
              <Option value="created">Created Date</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={tribes}
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
        title="Tribe Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        {renderTribeDetails()}
      </Modal>
    </div>
  );
};

export default TribeManagement;
