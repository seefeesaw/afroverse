import React, { useState } from 'react';
import { useBattle } from '../../hooks/useBattle';
import { useTransform } from '../../hooks/useTransform';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Card from '../common/Card';

const BattleCreation = ({ isOpen, onClose, transformId }) => {
  const {
    challengeMethod,
    challengeTarget,
    challengeMessage,
    isCreatingBattle,
    setChallengeMethod,
    setChallengeTarget,
    setChallengeMessage,
    createBattle,
    clearError
  } = useBattle();
  
  const { transformHistory } = useTransform();
  
  const [selectedTransform, setSelectedTransform] = useState(transformId);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTransform(transformId);
      setChallengeMethod('link');
      setChallengeTarget('');
      setChallengeMessage('Let\'s see who wears it better!');
      setErrors({});
      clearError();
    }
  }, [isOpen, transformId, setChallengeMethod, setChallengeTarget, setChallengeMessage, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!selectedTransform) {
      newErrors.transform = 'Please select a transformation';
    }
    if (!challengeTarget.trim()) {
      newErrors.target = 'Please enter a challenge target';
    }
    if (challengeMethod === 'whatsapp' && !challengeTarget.match(/^\+?[1-9]\d{1,14}$/)) {
      newErrors.target = 'Please enter a valid phone number';
    }
    if (challengeMethod === 'username' && !challengeTarget.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      newErrors.target = 'Please enter a valid username';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await createBattle(
        selectedTransform,
        challengeMethod,
        challengeTarget,
        challengeMessage
      );
      
      // Success - close modal
      onClose();
      
      // You could show a success toast here
      console.log('Battle created:', result);
      
    } catch (error) {
      console.error('Create battle error:', error);
    }
  };

  const handleMethodChange = (method) => {
    setChallengeMethod(method);
    setChallengeTarget('');
    setErrors({ ...errors, target: '' });
  };

  const handleTargetChange = (target) => {
    setChallengeTarget(target);
    setErrors({ ...errors, target: '' });
  };

  const getTargetPlaceholder = () => {
    switch (challengeMethod) {
      case 'whatsapp':
        return '+27841234567';
      case 'username':
        return 'username_123';
      case 'link':
        return 'Link will be generated';
      default:
        return '';
    }
  };

  const getTargetLabel = () => {
    switch (challengeMethod) {
      case 'whatsapp':
        return 'Phone Number';
      case 'username':
        return 'Username';
      case 'link':
        return 'Share Link';
      default:
        return 'Target';
    }
  };

  const getTargetDescription = () => {
    switch (challengeMethod) {
      case 'whatsapp':
        return 'Enter the phone number to send the challenge to';
      case 'username':
        return 'Enter the username to challenge';
      case 'link':
        return 'A shareable link will be generated';
      default:
        return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Create Battle</h2>
          <p className="text-gray-300 text-sm">
            Challenge someone to a transformation battle!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Transform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Transformation
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {transformHistory.map((transform) => (
                <Card
                  key={transform._id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTransform === transform._id
                      ? 'ring-2 ring-purple-500 bg-purple-900/20'
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedTransform(transform._id)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                    <img
                      src={transform.result.url}
                      alt="Transformation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs text-gray-300">
                      {transform.result.style}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {errors.transform && (
              <p className="text-red-400 text-sm mt-2">{errors.transform}</p>
            )}
          </div>

          {/* Challenge Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Challenge Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                { value: 'link', label: 'Link', icon: '🔗' },
                { value: 'username', label: 'Username', icon: '👤' }
              ].map((method) => (
                <Button
                  key={method.value}
                  type="button"
                  onClick={() => handleMethodChange(method.value)}
                  variant={challengeMethod === method.value ? 'primary' : 'outline'}
                  className={`p-3 flex items-center justify-center space-x-2 ${
                    challengeMethod === method.value
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span>{method.icon}</span>
                  <span className="text-sm">{method.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Challenge Target */}
          {challengeMethod !== 'link' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {getTargetLabel()}
              </label>
              <input
                type="text"
                value={challengeTarget}
                onChange={(e) => handleTargetChange(e.target.value)}
                placeholder={getTargetPlaceholder()}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-gray-400 text-sm mt-2">
                {getTargetDescription()}
              </p>
              {errors.target && (
                <p className="text-red-400 text-sm mt-2">{errors.target}</p>
              )}
            </div>
          )}

          {/* Challenge Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Challenge Message
            </label>
            <textarea
              value={challengeMessage}
              onChange={(e) => setChallengeMessage(e.target.value)}
              placeholder="Let's see who wears it better!"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="text-right text-gray-400 text-sm mt-1">
              {challengeMessage.length}/200
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreatingBattle}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              {isCreatingBattle ? 'Creating...' : 'Create Battle'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BattleCreation;
