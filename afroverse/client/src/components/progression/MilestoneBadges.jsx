import React, { useState, useEffect } from 'react';
import { useProgression } from '../../hooks/useProgression';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

const MilestoneBadges = ({ className = '' }) => {
  const { getMilestones, getStreakStatus } = useProgression();
  
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  
  const milestones = getMilestones();
  const streak = getStreakStatus();
  
  // Get badge data
  const getBadgeData = (milestone) => {
    const badgeData = {
      streak_3: { name: '3-Day Bronze', emoji: '🥉', color: 'orange', description: 'You\'ve maintained a 3-day streak! Keep the momentum going!' },
      streak_7: { name: '7-Day Silver', emoji: '🥈', color: 'gray', description: 'Amazing! You\'ve reached a 7-day streak. You\'re building a habit!' },
      streak_30: { name: '30-Day Gold', emoji: '🥇', color: 'yellow', description: 'Incredible! A 30-day streak shows real dedication. You\'re unstoppable!' },
      streak_100: { name: '100-Day Diamond', emoji: '💎', color: 'blue', description: 'Legendary! 100 days of consistency. You\'re a true champion!' },
      streak_365: { name: '365-Day Mythic', emoji: '🏆', color: 'purple', description: 'Mythical! A full year of dedication. You\'re a legend!' }
    };
    
    return badgeData[milestone.id] || { name: milestone.name, emoji: '🏆', color: 'gray', description: 'Achievement unlocked!' };
  };
  
  // Get badge classes
  const getBadgeClasses = (milestone) => {
    const badgeData = getBadgeData(milestone);
    const isUnlocked = milestone.unlocked;
    
    const baseClasses = 'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer';
    const unlockedClasses = isUnlocked 
      ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg hover:scale-110' 
      : 'bg-gray-700 border-2 border-gray-600 opacity-50';
    
    return `${baseClasses} ${unlockedClasses}`;
  };
  
  // Get badge emoji classes
  const getBadgeEmojiClasses = (milestone) => {
    const isUnlocked = milestone.unlocked;
    const baseClasses = 'text-3xl';
    const unlockedClasses = isUnlocked ? 'animate-pulse' : 'grayscale';
    
    return `${baseClasses} ${unlockedClasses}`;
  };
  
  // Get badge name classes
  const getBadgeNameClasses = (milestone) => {
    const isUnlocked = milestone.unlocked;
    const baseClasses = 'text-center mt-2';
    const unlockedClasses = isUnlocked ? 'text-white font-semibold' : 'text-gray-500';
    
    return `${baseClasses} ${unlockedClasses}`;
  };
  
  // Get badge description classes
  const getBadgeDescriptionClasses = (milestone) => {
    const isUnlocked = milestone.unlocked;
    const baseClasses = 'text-center mt-1 text-xs';
    const unlockedClasses = isUnlocked ? 'text-gray-300' : 'text-gray-600';
    
    return `${baseClasses} ${unlockedClasses}`;
  };
  
  // Handle badge click
  const handleBadgeClick = (milestone) => {
    setSelectedBadge(milestone);
    setShowBadgeModal(true);
  };
  
  // Get badge modal
  const getBadgeModal = () => {
    if (!selectedBadge) return null;
    
    const badgeData = getBadgeData(selectedBadge);
    const isUnlocked = selectedBadge.unlocked;
    
    return (
      <Modal isOpen={showBadgeModal} onClose={() => setShowBadgeModal(false)} size="medium">
        <div className="p-6 text-center">
          {/* Badge Icon */}
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isUnlocked 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg' 
              : 'bg-gray-700 border-2 border-gray-600 opacity-50'
          }`}>
            <span className={`text-6xl ${isUnlocked ? 'animate-pulse' : 'grayscale'}`}>
              {badgeData.emoji}
            </span>
          </div>
          
          {/* Badge Name */}
          <h2 className={`text-2xl font-bold mb-4 ${
            isUnlocked ? 'text-white' : 'text-gray-500'
          }`}>
            {badgeData.name}
          </h2>
          
          {/* Badge Description */}
          <p className={`text-lg mb-6 ${
            isUnlocked ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {badgeData.description}
          </p>
          
          {/* Badge Status */}
          <div className="mb-6">
            {isUnlocked ? (
              <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">✅ Unlocked</div>
                <div className="text-gray-300 text-sm">
                  Earned on {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
                <div className="text-gray-400 font-semibold mb-2">🔒 Locked</div>
                <div className="text-gray-500 text-sm">
                  Reach {selectedBadge.threshold} days to unlock
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {!isUnlocked && (
            <div className="mb-6">
              <div className="text-gray-300 text-sm mb-2">
                Progress: {streak.current} / {selectedBadge.threshold} days
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (streak.current / selectedBadge.threshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Close Button */}
          <Button
            onClick={() => setShowBadgeModal(false)}
            className="bg-gray-600 text-white hover:bg-gray-700 px-8 py-3"
          >
            Close
          </Button>
        </div>
      </Modal>
    );
  };
  
  // Get badge grid
  const getBadgeGrid = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {milestones.map((milestone, index) => {
          const badgeData = getBadgeData(milestone);
          
          return (
            <div key={milestone.id} className="text-center">
              {/* Badge */}
              <div 
                className={getBadgeClasses(milestone)}
                onClick={() => handleBadgeClick(milestone)}
              >
                <span className={getBadgeEmojiClasses(milestone)}>
                  {badgeData.emoji}
                </span>
              </div>
              
              {/* Badge Name */}
              <div className={getBadgeNameClasses(milestone)}>
                {badgeData.name}
              </div>
              
              {/* Badge Description */}
              <div className={getBadgeDescriptionClasses(milestone)}>
                {milestone.unlocked ? 'Unlocked' : `${milestone.threshold} days`}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Get empty state
  const getEmptyState = () => {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Badges Yet</h3>
        <p className="text-gray-300">
          Start your streak to earn your first badge!
        </p>
      </div>
    );
  };
  
  return (
    <div className={className}>
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Milestone Badges</h2>
        
        {milestones.length > 0 ? getBadgeGrid() : getEmptyState()}
      </Card>
      
      {getBadgeModal()}
    </div>
  );
};

export default MilestoneBadges;
