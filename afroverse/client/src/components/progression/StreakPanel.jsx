import React, { useState, useEffect } from 'react';
import { useStreak } from '../../hooks/useStreak';
import { useProgression } from '../../hooks/useProgression';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { Loader } from '../common/Loader';

const StreakPanel = ({ isOpen, onClose }) => {
  const { 
    getStreakDisplay, 
    getStreakStats, 
    getMotivationalMessage,
    getAtRiskMessage,
    getQuickActionSuggestions,
    useFreeze,
    isLoading
  } = useStreak();
  
  const { 
    getXpStatus, 
    getLevelProgressPercentage,
    getLevelEmoji 
  } = useProgression();
  
  const [isUsingFreeze, setIsUsingFreeze] = useState(false);
  const [freezeError, setFreezeError] = useState(null);
  
  const display = getStreakDisplay();
  const stats = getStreakStats();
  const xp = getXpStatus();
  const levelProgress = getLevelProgressPercentage();
  const levelEmoji = getLevelEmoji();
  const motivationalMessage = getMotivationalMessage();
  const atRiskMessage = getAtRiskMessage();
  const quickActionSuggestions = getQuickActionSuggestions();
  
  // Handle freeze use
  const handleUseFreeze = async () => {
    if (isUsingFreeze) return;
    
    setIsUsingFreeze(true);
    setFreezeError(null);
    
    try {
      const result = await useFreeze(true);
      if (result) {
        // Show success message
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setFreezeError(error.message || 'Failed to use freeze');
    } finally {
      setIsUsingFreeze(false);
    }
  };
  
  // Get streak status message
  const getStreakStatusMessage = () => {
    if (stats.safeToday) {
      return 'You\'re safe today! ✅';
    } else {
      return atRiskMessage;
    }
  };
  
  // Get time until midnight
  const getTimeUntilMidnight = () => {
    const hours = Math.floor(stats.timeToMidnight / 3600);
    const minutes = Math.floor((stats.timeToMidnight % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  // Get streak progress bar
  const getStreakProgressBar = () => {
    const progress = stats.progress;
    const milestone = stats.milestone;
    const nextMilestone = stats.nextMilestone;
    
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>{milestone.emoji} {milestone.name}</span>
          {nextMilestone && (
            <span>{nextMilestone.emoji} {nextMilestone.name} ({nextMilestone.remaining} days)</span>
          )}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };
  
  // Get level progress bar
  const getLevelProgressBar = () => {
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>{levelEmoji} Level {xp.level}</span>
          <span>{xp.value} / {xp.nextLevelXp} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>
    );
  };
  
  // Get quick action buttons
  const getQuickActionButtons = () => {
    return quickActionSuggestions.map((suggestion, index) => (
      <Button
        key={index}
        onClick={() => {
          // Navigate to appropriate action
          if (suggestion.action === 'transform') {
            window.location.href = '/transform';
          } else if (suggestion.action === 'vote') {
            window.location.href = '/feed';
          } else if (suggestion.action === 'battle') {
            window.location.href = '/battles';
          }
        }}
        className="w-full bg-white/10 text-white hover:bg-white/20 p-4 rounded-lg transition-all duration-300 hover:scale-105"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{suggestion.icon}</span>
          <div className="text-left">
            <div className="font-semibold">{suggestion.title}</div>
            <div className="text-sm text-gray-300">{suggestion.description}</div>
          </div>
        </div>
      </Button>
    ));
  };
  
  // Get freeze section
  const getFreezeSection = () => {
    if (stats.freezeAvailable <= 0) {
      return (
        <Card className="p-4 bg-gray-800/50">
          <div className="text-center">
            <div className="text-4xl mb-2">❄️</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Freezes Available</h3>
            <p className="text-gray-300 text-sm mb-4">
              You'll get a free freeze every month, or you can purchase one.
            </p>
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
              Get Freeze
            </Button>
          </div>
        </Card>
      );
    }
    
    return (
      <Card className="p-4 bg-blue-900/20 border-blue-400/30">
        <div className="text-center">
          <div className="text-4xl mb-2">❄️</div>
          <h3 className="text-lg font-semibold text-white mb-2">Freeze Available</h3>
          <p className="text-gray-300 text-sm mb-4">
            You have {stats.freezeAvailable} freeze(s) available. Use one to save your streak if you miss a day.
          </p>
          <Button
            onClick={handleUseFreeze}
            disabled={isUsingFreeze || stats.safeToday}
            className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUsingFreeze ? (
              <>
                <Loader size="small" />
                <span className="ml-2">Using Freeze...</span>
              </>
            ) : (
              'Use Freeze'
            )}
          </Button>
          {freezeError && (
            <p className="text-red-400 text-sm mt-2">{freezeError}</p>
          )}
        </div>
      </Card>
    );
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{display.emoji}</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {display.text}
          </h2>
          <p className="text-gray-300">
            {getStreakStatusMessage()}
          </p>
        </div>
        
        {/* Streak Progress */}
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Streak Progress</h3>
          {getStreakProgressBar()}
        </Card>
        
        {/* Level Progress */}
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Level Progress</h3>
          {getLevelProgressBar()}
        </Card>
        
        {/* Motivational Message */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <p className="text-white text-center text-lg">
            {motivationalMessage}
          </p>
        </Card>
        
        {/* Quick Actions */}
        {quickActionSuggestions.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {getQuickActionButtons()}
            </div>
          </Card>
        )}
        
        {/* Freeze Section */}
        {getFreezeSection()}
        
        {/* Stats */}
        <Card className="p-4 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{stats.current}</div>
              <div className="text-gray-300 text-sm">Current Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.longest}</div>
              <div className="text-gray-300 text-sm">Longest Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.freezeAvailable}</div>
              <div className="text-gray-300 text-sm">Freezes Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{getTimeUntilMidnight()}</div>
              <div className="text-gray-300 text-sm">Time Left</div>
            </div>
          </div>
        </Card>
        
        {/* Close Button */}
        <div className="text-center mt-6">
          <Button
            onClick={onClose}
            className="bg-gray-600 text-white hover:bg-gray-700 px-8 py-3"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StreakPanel;
