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
  Progress,
  Badge,
  Divider,
  Alert,
  message
} from 'antd';
import { 
  GiftOutlined, 
  FireOutlined, 
  TrophyOutlined, 
  TeamOutlined,
  ShareAltOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const EarnMoreCarousel = ({ 
  visible, 
  onClose 
}) => {
  const {
    earningOpportunities,
    dailyEarned,
    canEarnToday,
    isLoading,
    loadEarningOpportunities,
    earnCoins,
    showEarnMore
  } = useWallet();

  const [completedActions, setCompletedActions] = useState(new Set());
  const [isEarning, setIsEarning] = useState(false);

  useEffect(() => {
    if (visible) {
      loadEarningOpportunities();
    }
  }, [visible, loadEarningOpportunities]);

  const handleEarnCoins = async (opportunity) => {
    if (completedActions.has(opportunity.id)) {
      message.info('You\'ve already completed this action today!');
      return;
    }

    setIsEarning(true);
    
    try {
      await earnCoins(opportunity.id);
      setCompletedActions(prev => new Set([...prev, opportunity.id]));
      message.success(`+${opportunity.reward} coins earned!`);
    } catch (error) {
      message.error(error.message || 'Failed to earn coins');
    } finally {
      setIsEarning(false);
    }
  };

  const handleClose = () => {
    setCompletedActions(new Set());
    setIsEarning(false);
    onClose();
  };

  const getOpportunityIcon = (id) => {
    const icons = {
      daily_checkin: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      vote_10_battles: <TrophyOutlined style={{ color: '#1890ff' }} />,
      streak_maintain_3: <FireOutlined style={{ color: '#ff4d4f' }} />,
      share_transformation: <ShareAltOutlined style={{ color: '#13c2c2' }} />,
      referral_join: <UserAddOutlined style={{ color: '#eb2f96' }} />,
    };
    return icons[id] || <GiftOutlined style={{ color: '#faad14' }} />;
  };

  const getOpportunityColor = (id) => {
    const colors = {
      daily_checkin: '#52c41a',
      vote_10_battles: '#1890ff',
      streak_maintain_3: '#ff4d4f',
      share_transformation: '#13c2c2',
      referral_join: '#eb2f96',
    };
    return colors[id] || '#faad14';
  };

  const getProgressValue = (opportunity) => {
    // This would be calculated based on actual user progress
    // For now, we'll show mock progress
    const progressValues = {
      daily_checkin: 100,
      vote_10_battles: 60,
      streak_maintain_3: 80,
      share_transformation: 0,
      referral_join: 0,
    };
    return progressValues[opportunity.id] || 0;
  };

  const getProgressText = (opportunity) => {
    const progressTexts = {
      daily_checkin: 'Completed',
      vote_10_battles: '6/10 votes today',
      streak_maintain_3: '2/3 days',
      share_transformation: 'Not started',
      referral_join: 'Not started',
    };
    return progressTexts[opportunity.id] || 'In progress';
  };

  const isCompleted = (opportunity) => {
    return completedActions.has(opportunity.id) || getProgressValue(opportunity) >= 100;
  };

  const canComplete = (opportunity) => {
    return !isCompleted(opportunity) && canEarnToday;
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <GiftOutlined style={{ marginRight: 8, color: '#faad14' }} />
          <span>Earn More AF-Coins</span>
        </div>
      }
      width={700}
      style={{ top: 20 }}
    >
      <div style={{ marginBottom: 24 }}>
        <Alert
          message="Daily Progress"
          description={
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text>Coins earned today</Text>
                <Text strong>{dailyEarned}/100</Text>
              </div>
              <Progress 
                percent={(dailyEarned / 100) * 100} 
                status={dailyEarned >= 100 ? 'success' : 'active'}
                strokeColor="#faad14"
              />
              {!canEarnToday && (
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                  Daily limit reached! Come back tomorrow for more opportunities.
                </Text>
              )}
            </div>
          }
          type={canEarnToday ? 'info' : 'warning'}
          showIcon
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text>Loading opportunities...</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {earningOpportunities.map((opportunity) => {
            const color = getOpportunityColor(opportunity.id);
            const completed = isCompleted(opportunity);
            const canCompleteAction = canComplete(opportunity);
            
            return (
              <Col xs={24} sm={12} key={opportunity.id}>
                <Card
                  style={{
                    border: completed ? `2px solid ${color}` : '1px solid #d9d9d9',
                    background: completed ? `${color}10` : 'white',
                    position: 'relative',
                    height: '100%'
                  }}
                >
                  {completed && (
                    <Badge
                      count="✓"
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: color,
                        zIndex: 1
                      }}
                    />
                  )}
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>
                      {getOpportunityIcon(opportunity.id)}
                    </div>
                    
                    <Title level={5} style={{ marginBottom: 8 }}>
                      {opportunity.title}
                    </Title>
                    
                    <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: 'block' }}>
                      {opportunity.description}
                    </Text>
                    
                    <div style={{
                      background: `${color}20`,
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 16
                    }}>
                      <Text strong style={{ fontSize: 18, color }}>
                        +{opportunity.reward} AF-Coins
                      </Text>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Progress
                        percent={getProgressValue(opportunity)}
                        size="small"
                        strokeColor={color}
                        showInfo={false}
                      />
                      <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                        {getProgressText(opportunity)}
                      </Text>
                    </div>
                    
                    <Button
                      type="primary"
                      size="small"
                      block
                      loading={isEarning}
                      disabled={!canCompleteAction}
                      onClick={() => handleEarnCoins(opportunity)}
                      style={{
                        background: completed ? '#d9d9d9' : color,
                        borderColor: completed ? '#d9d9d9' : color
                      }}
                    >
                      {completed ? 'Completed' : 'Earn Coins'}
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
        <Title level={5}>Tips to earn more coins</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <FireOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 8 }} />
              <div>
                <Text strong>Maintain Streaks</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Keep your daily streak going for bonus rewards
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <div>
                <Text strong>Be Social</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Share transformations and invite friends
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <TrophyOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
              <div>
                <Text strong>Participate</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Vote in battles and join challenges
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button onClick={handleClose} size="large">
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default EarnMoreCarousel;
