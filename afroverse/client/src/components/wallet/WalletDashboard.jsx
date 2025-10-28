import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col,
  Badge,
  Modal,
  message,
  Spin
} from 'antd';
import { 
  WalletOutlined, 
  GiftOutlined, 
  ShoppingCartOutlined,
  HistoryOutlined,
  PlusOutlined,
  FireOutlined
} from '@ant-design/icons';
import WalletBalance from './WalletBalance';
import WalletHistoryList from './WalletHistoryList';
import RewardsPopup from './RewardsPopup';
import SpendCoinsModal from './SpendCoinsModal';
import CoinStore from './CoinStore';
import EarnMoreCarousel from './EarnMoreCarousel';
import CoinAnimations from './CoinAnimations';
import useWallet from '../../hooks/useWallet';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const WalletDashboard = ({ 
  visible, 
  onClose,
  showEarnMore = false 
}) => {
  const {
    balance,
    history,
    loading,
    error,
    earningOpportunities,
    dailyEarned,
    canEarnToday,
    getWalletData,
    addCoins,
    deductCoins,
    buyCoins,
    loadEarningOpportunities,
    showEarnMore: showEarnMoreAction
  } = useWallet();

  const [activeTab, setActiveTab] = useState('overview');
  const [spendModalVisible, setSpendModalVisible] = useState(false);
  const [spendAction, setSpendAction] = useState(null);
  const [coinStoreVisible, setCoinStoreVisible] = useState(false);
  const [earnMoreVisible, setEarnMoreVisible] = useState(false);
  const [rewardTrigger, setRewardTrigger] = useState(null);
  const [lastReward, setLastReward] = useState(null);

  useEffect(() => {
    if (visible) {
      getWalletData({ limit: 20 });
      loadEarningOpportunities();
    }
  }, [visible, getWalletData, loadEarningOpportunities]);

  const handleEarnCoins = async (reason, metadata = {}, idempotencyKey = null) => {
    try {
      const result = await addCoins(reason, metadata, idempotencyKey);
      
      // Trigger reward animation
      setLastReward({
        amount: result.transaction?.amount || 0,
        reason: reason.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
      });
      setRewardTrigger(Date.now());
      
      message.success(`+${result.transaction?.amount || 0} AF-Coins earned!`);
    } catch (error) {
      message.error(error.message || 'Failed to earn coins');
    }
  };

  const handleSpendCoins = (reason, cost, metadata = {}) => {
    setSpendAction({ reason, cost, metadata });
    setSpendModalVisible(true);
  };

  const handleConfirmSpend = async () => {
    if (!spendAction) return;
    
    try {
      await deductCoins(spendAction.reason, spendAction.metadata);
      message.success(`Successfully spent ${spendAction.cost} AF-Coins!`);
      setSpendModalVisible(false);
      setSpendAction(null);
    } catch (error) {
      message.error(error.message || 'Failed to spend coins');
    }
  };

  const handleBuyCoins = async (packType, price) => {
    try {
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await buyCoins(packType, price, transactionId);
      message.success('Coins purchased successfully!');
      setCoinStoreVisible(false);
    } catch (error) {
      message.error(error.message || 'Failed to purchase coins');
    }
  };

  const quickActions = [
    {
      key: 'streak_save',
      label: 'Save Streak',
      icon: <FireOutlined />,
      cost: 30,
      color: '#ff4d4f',
      description: 'Protect your daily streak'
    },
    {
      key: 'battle_boost',
      label: 'Battle Boost',
      icon: <PlusOutlined />,
      cost: 25,
      color: '#1890ff',
      description: 'Double battle visibility'
    },
    {
      key: 'priority_transformation',
      label: 'Priority AI',
      icon: <GiftOutlined />,
      cost: 20,
      color: '#52c41a',
      description: 'Skip transformation queue'
    }
  ];

  const canAfford = (cost) => balance >= cost;

  if (!visible) return null;

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <WalletOutlined style={{ marginRight: 8, color: '#faad14' }} />
            <span>AF-Coin Wallet</span>
          </div>
        }
        width={800}
        style={{ top: 20 }}
      >
        <Spin spinning={loading}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            style={{ marginTop: 16 }}
          >
            <TabPane 
              tab={
                <span>
                  <WalletOutlined />
                  Overview
                </span>
              } 
              key="overview"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card>
                    <WalletBalance />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card title="Daily Progress">
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Coins earned today</Text>
                        <Text strong>{dailyEarned}/100</Text>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: 8, 
                        background: '#f0f0f0', 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(dailyEarned / 100) * 100}%`,
                          height: '100%',
                          background: dailyEarned >= 100 ? '#52c41a' : '#faad14',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                    
                    {canEarnToday ? (
                      <Button 
                        type="primary" 
                        icon={<GiftOutlined />}
                        onClick={() => setEarnMoreVisible(true)}
                        block
                      >
                        Earn More Coins
                      </Button>
                    ) : (
                      <Text type="secondary">
                        Daily limit reached! Come back tomorrow.
                      </Text>
                    )}
                  </Card>
                </Col>
              </Row>

              <Card title="Quick Actions" style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                  {quickActions.map((action) => (
                    <Col xs={24} sm={8} key={action.key}>
                      <Card
                        size="small"
                        style={{
                          border: `2px solid ${canAfford(action.cost) ? action.color : '#d9d9d9'}`,
                          background: canAfford(action.cost) ? `${action.color}10` : '#f5f5f5'
                        }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, color: action.color, marginBottom: 8 }}>
                            {action.icon}
                          </div>
                          <Title level={5} style={{ marginBottom: 4 }}>
                            {action.label}
                          </Title>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                            {action.description}
                          </Text>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong style={{ color: action.color }}>
                              {action.cost} AF-Coins
                            </Text>
                          </div>
                          <Button
                            size="small"
                            type={canAfford(action.cost) ? 'primary' : 'default'}
                            disabled={!canAfford(action.cost)}
                            onClick={() => handleSpendCoins(action.key, action.cost)}
                            block
                          >
                            {canAfford(action.cost) ? 'Use' : 'Need More Coins'}
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <HistoryOutlined />
                  History
                </span>
              } 
              key="history"
            >
              <WalletHistoryList />
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <ShoppingCartOutlined />
                  Store
                </span>
              } 
              key="store"
            >
              <CoinStore onPurchase={handleBuyCoins} />
            </TabPane>
          </Tabs>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Space>
              <Button onClick={onClose}>
                Close
              </Button>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />}
                onClick={() => setCoinStoreVisible(true)}
              >
                Buy Coins
              </Button>
            </Space>
          </div>
        </Spin>
      </Modal>

      {/* Spend Coins Modal */}
      <SpendCoinsModal
        isOpen={spendModalVisible}
        onClose={() => setSpendModalVisible(false)}
        actionReason={spendAction?.reason}
        cost={spendAction?.cost}
        metadata={spendAction?.metadata}
        onConfirm={handleConfirmSpend}
      />

      {/* Coin Store Modal */}
      <Modal
        open={coinStoreVisible}
        onCancel={() => setCoinStoreVisible(false)}
        footer={null}
        title="AF-Coin Store"
        width={600}
      >
        <CoinStore onPurchase={handleBuyCoins} />
      </Modal>

      {/* Earn More Modal */}
      <EarnMoreCarousel
        visible={earnMoreVisible}
        onClose={() => setEarnMoreVisible(false)}
      />

      {/* Reward Animation */}
      <CoinAnimations
        trigger={rewardTrigger}
        amount={lastReward?.amount}
        reason={lastReward?.reason}
        onComplete={() => setRewardTrigger(null)}
      />
    </>
  );
};

export default WalletDashboard;
