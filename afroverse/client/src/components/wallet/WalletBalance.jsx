import React, { useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Card, Typography, Button, Space, Badge, Tooltip } from 'antd';
import { 
  WalletOutlined, 
  PlusOutlined, 
  GiftOutlined,
  FireOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const WalletBalance = ({ 
  showActions = true, 
  size = 'default',
  showDetails = false,
  onShowCoinStore,
  onShowEarnMore 
}) => {
  const {
    balance,
    totalEarned,
    totalSpent,
    dailyEarned,
    canEarnToday,
    isLoading,
    loadWallet,
    showCoinStore,
    showEarnMore
  } = useWallet();

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleShowCoinStore = () => {
    if (onShowCoinStore) {
      onShowCoinStore();
    } else {
      showCoinStore();
    }
  };

  const handleShowEarnMore = () => {
    if (onShowEarnMore) {
      onShowEarnMore();
    } else {
      showEarnMore();
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          titleSize: 4,
          balanceSize: 2,
          showIcon: false,
          compact: true
        };
      case 'large':
        return {
          titleSize: 2,
          balanceSize: 1,
          showIcon: true,
          compact: false
        };
      default:
        return {
          titleSize: 3,
          balanceSize: 1.5,
          showIcon: true,
          compact: false
        };
    }
  };

  const config = getSizeConfig();

  if (isLoading) {
    return (
      <Card loading style={{ minHeight: 120 }}>
        <div style={{ height: 60 }} />
      </Card>
    );
  }

  return (
    <Card
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        color: 'white'
      }}
      bodyStyle={{ padding: config.compact ? 12 : 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            {config.showIcon && (
              <WalletOutlined 
                style={{ 
                  fontSize: config.titleSize === 2 ? 24 : 20, 
                  marginRight: 8,
                  color: 'white'
                }} 
              />
            )}
            <Title 
              level={config.titleSize} 
              style={{ 
                color: 'white', 
                margin: 0,
                fontSize: config.titleSize === 2 ? 24 : config.titleSize === 3 ? 20 : 16
              }}
            >
              AF-Coins
            </Title>
          </div>
          
          <div style={{ marginBottom: showDetails ? 12 : 0 }}>
            <Text 
              style={{ 
                fontSize: config.balanceSize === 1 ? 32 : config.balanceSize === 1.5 ? 24 : 20,
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {balance.toLocaleString()}
            </Text>
          </div>

          {showDetails && (
            <div style={{ marginBottom: 12 }}>
              <Space size="small" wrap>
                <Tooltip title="Total earned">
                  <Badge 
                    count={totalEarned} 
                    style={{ backgroundColor: '#52c41a' }}
                    prefix={<TrophyOutlined />}
                  />
                </Tooltip>
                <Tooltip title="Total spent">
                  <Badge 
                    count={totalSpent} 
                    style={{ backgroundColor: '#ff4d4f' }}
                  />
                </Tooltip>
                <Tooltip title="Daily earned">
                  <Badge 
                    count={dailyEarned} 
                    style={{ backgroundColor: '#faad14' }}
                    prefix={<FireOutlined />}
                  />
                </Tooltip>
                {!canEarnToday && (
                  <Badge 
                    count="Limit Reached" 
                    style={{ backgroundColor: '#d9d9d9', color: '#666' }}
                  />
                )}
              </Space>
            </div>
          )}
        </div>

        {showActions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button
              type="primary"
              size={config.compact ? 'small' : 'default'}
              icon={<PlusOutlined />}
              onClick={handleShowCoinStore}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white'
              }}
            >
              {config.compact ? 'Buy' : 'Buy Coins'}
            </Button>
            
            <Button
              type="default"
              size={config.compact ? 'small' : 'default'}
              icon={<GiftOutlined />}
              onClick={handleShowEarnMore}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white'
              }}
            >
              {config.compact ? 'Earn' : 'Earn More'}
            </Button>
          </div>
        )}
      </div>

      {showDetails && (
        <div style={{ 
          marginTop: 12, 
          paddingTop: 12, 
          borderTop: '1px solid rgba(255,255,255,0.2)' 
        }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
            {canEarnToday 
              ? `You can earn ${100 - dailyEarned} more coins today`
              : 'Daily earning limit reached'
            }
          </Text>
        </div>
      )}
    </Card>
  );
};

export default WalletBalance;
