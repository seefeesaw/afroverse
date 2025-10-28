import React, { useEffect, useState } from 'react';
import { Modal, Typography, Button, Space, Badge } from 'antd';
import { 
  GiftOutlined, 
  FireOutlined, 
  TrophyOutlined, 
  StarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const RewardsPopup = ({ 
  visible, 
  rewardData, 
  onClose,
  showAnimation = true 
}) => {
  const [animationVisible, setAnimationVisible] = useState(false);
  const [coinsVisible, setCoinsVisible] = useState(false);

  useEffect(() => {
    if (visible && showAnimation) {
      // Start animation sequence
      setAnimationVisible(true);
      
      // Show coins after a short delay
      setTimeout(() => {
        setCoinsVisible(true);
      }, 300);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  }, [visible, showAnimation]);

  const handleClose = () => {
    setAnimationVisible(false);
    setCoinsVisible(false);
    onClose();
  };

  const getRewardIcon = (reason) => {
    const icons = {
      daily_checkin: '🎯',
      streak_maintain_3: '🔥',
      streak_maintain_7: '🔥',
      streak_maintain_14: '🔥',
      streak_maintain_30: '🔥',
      streak_maintain_90: '🔥',
      battle_win: '⚔️',
      battle_participation: '👥',
      vote_10_battles: '🗳️',
      share_transformation: '📤',
      referral_join: '👥',
      tribe_win: '🏆',
      level_up: '⬆️',
      achievement_unlock: '🏅',
      first_transformation: '✨',
      first_battle: '⚔️',
      weekly_challenge: '📅',
      monthly_challenge: '📅',
      purchase: '💰'
    };
    
    return icons[reason] || '🎁';
  };

  const getRewardColor = (reason) => {
    const colors = {
      daily_checkin: '#52c41a',
      streak_maintain_3: '#ff4d4f',
      streak_maintain_7: '#ff4d4f',
      streak_maintain_14: '#ff4d4f',
      streak_maintain_30: '#ff4d4f',
      streak_maintain_90: '#ff4d4f',
      battle_win: '#1890ff',
      battle_participation: '#722ed1',
      vote_10_battles: '#fa8c16',
      share_transformation: '#13c2c2',
      referral_join: '#eb2f96',
      tribe_win: '#faad14',
      level_up: '#52c41a',
      achievement_unlock: '#faad14',
      first_transformation: '#722ed1',
      first_battle: '#1890ff',
      weekly_challenge: '#52c41a',
      monthly_challenge: '#faad14',
      purchase: '#faad14'
    };
    
    return colors[reason] || '#1890ff';
  };

  const getRewardTitle = (reason) => {
    const titles = {
      daily_checkin: 'Daily Check-in Bonus!',
      streak_maintain_3: '3-Day Streak Bonus!',
      streak_maintain_7: '7-Day Streak Bonus!',
      streak_maintain_14: '14-Day Streak Bonus!',
      streak_maintain_30: '30-Day Streak Bonus!',
      streak_maintain_90: '90-Day Streak Bonus!',
      battle_win: 'Battle Victory!',
      battle_participation: 'Battle Participation!',
      vote_10_battles: 'Voting Milestone!',
      share_transformation: 'Transformation Shared!',
      referral_join: 'Friend Referral!',
      tribe_win: 'Tribe Victory!',
      level_up: 'Level Up Bonus!',
      achievement_unlock: 'Achievement Unlocked!',
      first_transformation: 'First Transformation!',
      first_battle: 'First Battle!',
      weekly_challenge: 'Weekly Challenge!',
      monthly_challenge: 'Monthly Challenge!',
      purchase: 'Coins Purchased!'
    };
    
    return titles[reason] || 'Reward Earned!';
  };

  if (!visible || !rewardData) return null;

  const { amount, reason, description, icon } = rewardData;
  const rewardIcon = icon || getRewardIcon(reason);
  const rewardColor = getRewardColor(reason);
  const rewardTitle = getRewardTitle(reason);

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      centered
      closable={false}
      maskClosable={false}
      width={400}
      style={{
        top: '20%'
      }}
      bodyStyle={{
        padding: '40px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        color: 'white'
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Animated coins */}
        {showAnimation && animationVisible && (
          <div style={{
            position: 'absolute',
            top: -50,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10
          }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: (i - 2.5) * 30,
                  animation: `coinFall ${1 + i * 0.1}s ease-out forwards`,
                  opacity: coinsVisible ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
              >
                <span style={{ fontSize: 24 }}>💰</span>
              </div>
            ))}
          </div>
        )}

        {/* Reward icon */}
        <div style={{ 
          fontSize: 64, 
          marginBottom: 16,
          animation: showAnimation && animationVisible ? 'bounce 0.6s ease-out' : 'none'
        }}>
          {rewardIcon}
        </div>

        {/* Reward title */}
        <Title 
          level={2} 
          style={{ 
            color: 'white', 
            marginBottom: 8,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {rewardTitle}
        </Title>

        {/* Reward description */}
        <Text 
          style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: 16,
            marginBottom: 24,
            display: 'block'
          }}
        >
          {description}
        </Text>

        {/* Coin amount */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 12,
          padding: '16px 24px',
          marginBottom: 24,
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ 
            fontSize: 36, 
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            animation: showAnimation && coinsVisible ? 'pulse 0.5s ease-out' : 'none'
          }}>
            +{amount.toLocaleString()} AF-Coins
          </div>
        </div>

        {/* Action button */}
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Awesome!
        </Button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes coinFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </Modal>
  );
};

export default RewardsPopup;
