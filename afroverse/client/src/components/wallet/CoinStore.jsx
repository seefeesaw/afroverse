import React, { useEffect, useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { 
  Modal, 
  Typography, 
  Button, 
  Space, 
  Card, 
  Row, 
  Col, 
  Badge,
  Divider,
  Alert,
  message
} from 'antd';
import { 
  WalletOutlined, 
  ShoppingCartOutlined, 
  GiftOutlined,
  CrownOutlined,
  StarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const CoinStore = ({ 
  visible, 
  onClose 
}) => {
  const {
    balance,
    coinPacks,
    isLoading,
    loadCoinPacks,
    purchaseCoins,
    showCoinStore
  } = useWallet();

  const [selectedPack, setSelectedPack] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCoinPacks();
    }
  }, [visible, loadCoinPacks]);

  const handlePurchase = async (pack) => {
    setIsPurchasing(true);
    
    try {
      // In a real app, this would integrate with Stripe or another payment processor
      // For now, we'll simulate a successful payment
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await purchaseCoins(pack.type, paymentId);
      
      message.success(`${pack.coins} coins purchased successfully!`);
      onClose();
    } catch (error) {
      message.error(error.message || 'Failed to purchase coins');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => {
    setSelectedPack(null);
    setIsPurchasing(false);
    onClose();
  };

  const getPackIcon = (type) => {
    const icons = {
      small: '💰',
      medium: '💰💰',
      large: '💰💰💰',
      mega: '👑'
    };
    return icons[type] || '💰';
  };

  const getPackColor = (type) => {
    const colors = {
      small: '#52c41a',
      medium: '#1890ff',
      large: '#722ed1',
      mega: '#faad14'
    };
    return colors[type] || '#1890ff';
  };

  const getPackTitle = (type) => {
    const titles = {
      small: 'Starter Pack',
      medium: 'Popular Pack',
      large: 'Power Pack',
      mega: 'Mega Pack'
    };
    return titles[type] || 'Coin Pack';
  };

  const getPackDescription = (type) => {
    const descriptions = {
      small: 'Perfect for trying out premium features',
      medium: 'Great value for regular users',
      large: 'Best for power users and frequent spenders',
      mega: 'Ultimate pack with bonus coins!'
    };
    return descriptions[type] || 'Get more AF-Coins';
  };

  const getValueMultiplier = (pack) => {
    // Calculate value compared to small pack
    const smallPack = coinPacks.find(p => p.type === 'small');
    if (!smallPack) return 1;
    
    const smallValuePerCoin = smallPack.price / smallPack.coins;
    const packValuePerCoin = pack.price / pack.coins;
    
    return (smallValuePerCoin / packValuePerCoin).toFixed(1);
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartOutlined style={{ marginRight: 8, color: '#faad14' }} />
          <span>AF-Coins Store</span>
        </div>
      }
      width={800}
      style={{ top: 20 }}
    >
      <div style={{ marginBottom: 24 }}>
        <Alert
          message="Current Balance"
          description={
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
              <WalletOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              <Text strong style={{ fontSize: 18 }}>
                {balance.toLocaleString()} AF-Coins
              </Text>
            </div>
          }
          type="info"
          showIcon
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text>Loading coin packs...</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {coinPacks.map((pack) => {
            const color = getPackColor(pack.type);
            const isSelected = selectedPack?.type === pack.type;
            const valueMultiplier = getValueMultiplier(pack);
            
            return (
              <Col xs={24} sm={12} lg={6} key={pack.type}>
                <Card
                  hoverable
                  style={{
                    border: isSelected ? `2px solid ${color}` : '1px solid #d9d9d9',
                    background: isSelected ? `${color}10` : 'white',
                    position: 'relative',
                    height: '100%'
                  }}
                  onClick={() => setSelectedPack(pack)}
                >
                  {pack.bonus && (
                    <Badge
                      count="Best Value!"
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: '#faad14'
                      }}
                    />
                  )}
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>
                      {getPackIcon(pack.type)}
                    </div>
                    
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {getPackTitle(pack.type)}
                    </Title>
                    
                    <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: 'block' }}>
                      {getPackDescription(pack.type)}
                    </Text>
                    
                    <div style={{
                      background: `${color}20`,
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 16
                    }}>
                      <Text strong style={{ fontSize: 24, color }}>
                        {pack.coins.toLocaleString()}
                      </Text>
                      <Text style={{ fontSize: 14, marginLeft: 4 }}>
                        AF-Coins
                      </Text>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong style={{ fontSize: 20 }}>
                        {pack.priceFormatted}
                      </Text>
                      {valueMultiplier > 1 && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {valueMultiplier}x better value
                          </Text>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={isPurchasing && selectedPack?.type === pack.type}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(pack);
                      }}
                      style={{
                        background: color,
                        borderColor: color
                      }}
                    >
                      <ShoppingCartOutlined style={{ marginRight: 4 }} />
                      Buy Now
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Divider />

      <div style={{ textAlign: 'center' }}>
        <Title level={5}>What can you do with AF-Coins?</Title>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <FireOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 8 }} />
              <div>
                <Text strong>Save Streak</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>30 coins</Text>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <CrownOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <div>
                <Text strong>Battle Boost</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>25 coins</Text>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <StarOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
              <div>
                <Text strong>Premium Filter</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>50 coins</Text>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <GiftOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
              <div>
                <Text strong>Tribe Support</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>40 coins</Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button onClick={handleClose} size="large">
          Maybe Later
        </Button>
      </div>
    </Modal>
  );
};

export default CoinStore;
