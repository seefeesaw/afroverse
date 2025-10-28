import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { 
  Modal, 
  Typography, 
  Button, 
  Space, 
  Card, 
  Row, 
  Col, 
  Alert,
  Input,
  message
} from 'antd';
import { 
  WalletOutlined, 
  FireOutlined, 
  ThunderboltOutlined, 
  ReloadOutlined,
  CrownOutlined,
  GiftOutlined,
  TeamOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SpendCoinsModal = ({ 
  visible, 
  spendData, 
  onClose,
  onSuccess 
}) => {
  const {
    balance,
    isLoading,
    spendCoins,
    saveStreak,
    battleBoost,
    priorityTransformation,
    retryTransformation,
    tribeSupport,
    canAfford,
    getSpendingCost
  } = useWallet();

  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const spendingOptions = {
    streak_save: {
      title: 'Save Streak',
      description: 'Protect your streak from breaking',
      cost: 30,
      icon: <FireOutlined style={{ color: '#ff4d4f' }} />,
      color: '#ff4d4f',
      action: 'saveStreak'
    },
    battle_boost: {
      title: 'Battle Boost',
      description: 'Double your battle visibility',
      cost: 25,
      icon: <ThunderboltOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
      action: 'battleBoost'
    },
    priority_transformation: {
      title: 'Priority Processing',
      description: 'Skip the queue for faster results',
      cost: 20,
      icon: <CrownOutlined style={{ color: '#faad14' }} />,
      color: '#faad14',
      action: 'priorityTransformation'
    },
    retry_transformation: {
      title: 'Retry Transformation',
      description: 'Try again with the same photo',
      cost: 15,
      icon: <ReloadOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
      action: 'retryTransformation'
    },
    premium_filter: {
      title: 'Premium Filter',
      description: 'Unlock premium filters for 24 hours',
      cost: 50,
      icon: <StarOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1',
      action: 'premiumFilter'
    },
    tribe_support: {
      title: 'Tribe Support',
      description: 'Add 50 points to your tribe',
      cost: 40,
      icon: <TeamOutlined style={{ color: '#13c2c2' }} />,
      color: '#13c2c2',
      action: 'tribeSupport'
    },
    rematch_battle: {
      title: 'Battle Rematch',
      description: 'Challenge the same opponent again',
      cost: 20,
      icon: <ReloadOutlined style={{ color: '#fa8c16' }} />,
      color: '#fa8c16',
      action: 'rematchBattle'
    }
  };

  const handleSpend = async () => {
    if (!spendData) return;

    const option = spendingOptions[spendData.action];
    if (!option) {
      message.error('Invalid spending action');
      return;
    }

    if (!canAfford(option.cost)) {
      message.error('Insufficient coins');
      return;
    }

    setIsProcessing(true);

    try {
      let result;
      
      switch (spendData.action) {
        case 'streak_save':
          result = await saveStreak(reason || 'User requested streak save');
          break;
        case 'battle_boost':
          result = await battleBoost(spendData.battleId);
          break;
        case 'priority_transformation':
          result = await priorityTransformation(spendData.transformationId);
          break;
        case 'retry_transformation':
          result = await retryTransformation(spendData.transformationId);
          break;
        case 'tribe_support':
          result = await tribeSupport(spendData.tribeId);
          break;
        default:
          result = await spendCoins(spendData.action, spendData.metadata || {});
      }

      message.success(`${option.title} activated successfully!`);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      onClose();
    } catch (error) {
      message.error(error.message || 'Failed to spend coins');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setIsProcessing(false);
    onClose();
  };

  if (!visible || !spendData) return null;

  const option = spendingOptions[spendData.action];
  if (!option) return null;

  const canAffordAction = canAfford(option.cost);

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      onOk={handleSpend}
      okText={`Spend ${option.cost} Coins`}
      cancelText="Cancel"
      confirmLoading={isProcessing}
      okButtonProps={{
        disabled: !canAffordAction,
        style: {
          background: option.color,
          borderColor: option.color
        }
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WalletOutlined style={{ marginRight: 8, color: option.color }} />
          <span>Spend AF-Coins</span>
        </div>
      }
      width={500}
    >
      <div style={{ marginBottom: 24 }}>
        <Card
          style={{
            border: `2px solid ${option.color}`,
            background: `linear-gradient(135deg, ${option.color}15, ${option.color}05)`
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {option.icon}
            </div>
            
            <Title level={3} style={{ marginBottom: 8 }}>
              {option.title}
            </Title>
            
            <Text type="secondary" style={{ fontSize: 16, marginBottom: 16, display: 'block' }}>
              {option.description}
            </Text>
            
            <div style={{
              background: 'rgba(0,0,0,0.05)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16
            }}>
              <Text strong style={{ fontSize: 18 }}>
                Cost: {option.cost} AF-Coins
              </Text>
            </div>
          </div>
        </Card>
      </div>

      {/* Current balance */}
      <div style={{ marginBottom: 16 }}>
        <Alert
          message={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Your Balance</span>
              <span style={{ fontWeight: 'bold', fontSize: 16 }}>
                {balance.toLocaleString()} AF-Coins
              </span>
            </div>
          }
          type={canAffordAction ? 'success' : 'error'}
          showIcon
        />
      </div>

      {/* Reason input (for streak save) */}
      {spendData.action === 'streak_save' && (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>
            Reason (Optional)
          </Text>
          <TextArea
            placeholder="Why do you need to save your streak?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
      )}

      {/* Insufficient funds warning */}
      {!canAffordAction && (
        <Alert
          message="Insufficient Coins"
          description="You don't have enough AF-Coins for this action. Buy more coins or earn them through daily activities."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Action details */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: 12, 
        borderRadius: 8,
        marginBottom: 16
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {spendData.action === 'streak_save' && 'This will protect your current streak from breaking.'}
          {spendData.action === 'battle_boost' && 'Your battle will be featured prominently in the feed.'}
          {spendData.action === 'priority_transformation' && 'Your transformation will be processed immediately.'}
          {spendData.action === 'retry_transformation' && 'You can retry the same transformation with the same photo.'}
          {spendData.action === 'premium_filter' && 'Premium filters will be available for 24 hours.'}
          {spendData.action === 'tribe_support' && '50 points will be added to your tribe\'s total.'}
          {spendData.action === 'rematch_battle' && 'You can challenge the same opponent again.'}
        </Text>
      </div>
    </Modal>
  );
};

export default SpendCoinsModal;
