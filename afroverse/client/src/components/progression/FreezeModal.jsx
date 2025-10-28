import React, { useState, useEffect } from 'react';
import { useStreak } from '../../hooks/useStreak';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { Loader } from '../common/Loader';

const FreezeModal = ({ isOpen, onClose }) => {
  const { 
    getStreakStats, 
    useFreeze, 
    isLoading 
  } = useStreak();
  
  const [isUsingFreeze, setIsUsingFreeze] = useState(false);
  const [freezeError, setFreezeError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const stats = getStreakStats();
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFreezeError(null);
      setShowSuccess(false);
    }
  }, [isOpen]);
  
  // Handle freeze use
  const handleUseFreeze = async () => {
    if (isUsingFreeze) return;
    
    setIsUsingFreeze(true);
    setFreezeError(null);
    
    try {
      const result = await useFreeze(true);
      if (result) {
        setShowSuccess(true);
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
  
  // Get freeze status
  const getFreezeStatus = () => {
    if (stats.freezeAvailable <= 0) {
      return {
        status: 'none',
        title: 'No Freezes Available',
        message: 'You don\'t have any freezes available. You\'ll get a free freeze every month, or you can purchase one.',
        icon: '❄️',
        color: 'gray'
      };
    }
    
    if (stats.safeToday) {
      return {
        status: 'safe',
        title: 'Streak is Safe',
        message: 'Your streak is safe today! You don\'t need to use a freeze.',
        icon: '✅',
        color: 'green'
      };
    }
    
    return {
      status: 'available',
      title: 'Freeze Available',
      message: `You have ${stats.freezeAvailable} freeze(s) available. Use one to save your streak if you miss a day.`,
      icon: '❄️',
      color: 'blue'
    };
  };
  
  // Get freeze content
  const getFreezeContent = () => {
    const freezeStatus = getFreezeStatus();
    
    if (showSuccess) {
      return (
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">Freeze Used Successfully!</h2>
          <p className="text-gray-300 mb-6">
            Your streak has been restored! You now have {stats.freezeAvailable - 1} freeze(s) remaining.
          </p>
          <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
            <div className="text-green-400 font-semibold">
              Streak Restored to {stats.current + 1} days!
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-center">
        {/* Freeze Icon */}
        <div className={`text-6xl mb-4 ${
          freezeStatus.color === 'blue' ? 'text-blue-400' :
          freezeStatus.color === 'green' ? 'text-green-400' :
          'text-gray-400'
        }`}>
          {freezeStatus.icon}
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">
          {freezeStatus.title}
        </h2>
        
        {/* Message */}
        <p className="text-gray-300 mb-6">
          {freezeStatus.message}
        </p>
        
        {/* Freeze Info */}
        <Card className="p-4 mb-6 bg-gray-800/50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{stats.freezeAvailable}</div>
              <div className="text-gray-300 text-sm">Freezes Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.current}</div>
              <div className="text-gray-300 text-sm">Current Streak</div>
            </div>
          </div>
        </Card>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {freezeStatus.status === 'available' && (
            <Button
              onClick={handleUseFreeze}
              disabled={isUsingFreeze}
              className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed py-3"
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
          )}
          
          {freezeStatus.status === 'none' && (
            <Button
              onClick={() => {
                // Navigate to purchase page or show purchase modal
                console.log('Navigate to purchase freeze');
              }}
              className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3"
            >
              Get Freeze
            </Button>
          )}
          
          <Button
            onClick={onClose}
            className="w-full bg-gray-600 text-white hover:bg-gray-700 py-3"
          >
            Close
          </Button>
        </div>
        
        {/* Error Message */}
        {freezeError && (
          <div className="mt-4 bg-red-900/20 border border-red-400/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{freezeError}</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="p-6">
        {getFreezeContent()}
      </div>
    </Modal>
  );
};

export default FreezeModal;
