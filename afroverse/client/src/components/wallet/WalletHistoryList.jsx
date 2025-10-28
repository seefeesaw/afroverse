import React, { useEffect, useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { 
  List, 
  Card, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Empty, 
  Spin,
  Pagination,
  Select,
  DatePicker,
  Input
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const WalletHistoryList = ({ 
  limit = 10, 
  showPagination = true,
  showFilters = true,
  showTitle = true 
}) => {
  const {
    transactions,
    transactionHistory,
    isLoading,
    loadTransactionHistory,
    clearError
  } = useWallet();

  const [filters, setFilters] = useState({
    page: 1,
    limit,
    type: null,
    reason: null,
    startDate: null,
    endDate: null,
    search: ''
  });

  useEffect(() => {
    loadTransactionHistory(filters);
  }, [filters, loadTransactionHistory]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleRefresh = () => {
    loadTransactionHistory(filters);
  };

  const getTransactionIcon = (transaction) => {
    if (transaction.type === 'earn' || transaction.type === 'purchase') {
      return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    } else if (transaction.type === 'spend') {
      return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
    }
    return <ReloadOutlined style={{ color: '#1890ff' }} />;
  };

  const getTransactionColor = (transaction) => {
    if (transaction.type === 'earn' || transaction.type === 'purchase') {
      return '#52c41a';
    } else if (transaction.type === 'spend') {
      return '#ff4d4f';
    }
    return '#1890ff';
  };

  const getTransactionTag = (transaction) => {
    const colors = {
      earn: 'green',
      spend: 'red',
      purchase: 'blue',
      refund: 'orange',
      bonus: 'purple'
    };
    
    return (
      <Tag color={colors[transaction.type] || 'default'}>
        {transaction.type.toUpperCase()}
      </Tag>
    );
  };

  const formatAmount = (amount) => {
    const isPositive = amount > 0;
    return (
      <Text 
        style={{ 
          color: isPositive ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}
      >
        {isPositive ? '+' : ''}{amount.toLocaleString()}
      </Text>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTransactionItem = (transaction) => (
    <List.Item
      key={transaction.id}
      style={{ padding: '12px 0' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <div style={{ marginRight: 12, fontSize: 18 }}>
          {transaction.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong style={{ fontSize: 14 }}>
                {transaction.description}
              </Text>
              <div style={{ marginTop: 4 }}>
                {getTransactionTag(transaction)}
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  {formatDate(transaction.createdAt)}
                </Text>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                {formatAmount(transaction.amount)}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Balance: {transaction.balanceAfter.toLocaleString()}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </List.Item>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="Filter by type"
            style={{ width: 120 }}
            value={filters.type}
            onChange={(value) => handleFilterChange('type', value)}
            allowClear
          >
            <Option value="earn">Earn</Option>
            <Option value="spend">Spend</Option>
            <Option value="purchase">Purchase</Option>
            <Option value="refund">Refund</Option>
            <Option value="bonus">Bonus</Option>
          </Select>

          <Select
            placeholder="Filter by reason"
            style={{ width: 150 }}
            value={filters.reason}
            onChange={(value) => handleFilterChange('reason', value)}
            allowClear
          >
            <Option value="daily_checkin">Daily Check-in</Option>
            <Option value="streak_maintain_3">3-Day Streak</Option>
            <Option value="streak_maintain_7">7-Day Streak</Option>
            <Option value="battle_win">Battle Win</Option>
            <Option value="battle_participation">Battle Participation</Option>
            <Option value="share_transformation">Share Transformation</Option>
            <Option value="referral_join">Referral</Option>
            <Option value="streak_save">Streak Save</Option>
            <Option value="battle_boost">Battle Boost</Option>
            <Option value="priority_transformation">Priority Processing</Option>
            <Option value="retry_transformation">Retry Transformation</Option>
            <Option value="premium_filter">Premium Filter</Option>
            <Option value="tribe_support">Tribe Support</Option>
          </Select>

          <RangePicker
            size="small"
            onChange={(dates) => {
              handleFilterChange('startDate', dates?.[0]);
              handleFilterChange('endDate', dates?.[1]);
            }}
          />

          <Search
            placeholder="Search transactions"
            style={{ width: 200 }}
            size="small"
            onSearch={(value) => handleFilterChange('search', value)}
            allowClear
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
        </Space>
      </Card>
    );
  };

  return (
    <div>
      {showTitle && (
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>Transaction History</Title>
        </div>
      )}

      {renderFilters()}

      <Card>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : transactions.length === 0 ? (
          <Empty
            description="No transactions found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <List
              dataSource={transactions}
              renderItem={renderTransactionItem}
              split={false}
            />
            
            {showPagination && transactionHistory.pages > 1 && (
              <div style={{ 
                marginTop: 16, 
                textAlign: 'center',
                borderTop: '1px solid #f0f0f0',
                paddingTop: 16
              }}>
                <Pagination
                  current={transactionHistory.page}
                  total={transactionHistory.total}
                  pageSize={transactionHistory.limit}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} of ${total} transactions`
                  }
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default WalletHistoryList;
