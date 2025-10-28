import React, { useState } from 'react';
import { useBattle } from '../../hooks/useBattle';
import { useTransform } from '../../hooks/useTransform';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Card from '../common/Card';

const BattleAcceptance = ({ isOpen, onClose, battleData }) => {
  const {
    selectedTransformForAcceptance,
    isAcceptingBattle,
    setSelectedTransformForAcceptance,
    acceptBattle,
    clearError
  } = useBattle();
  
  const { transformHistory } = useTransform();
  
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTransformForAcceptance(null);
      setErrors({});
      clearError();
    }
  }, [isOpen, setSelectedTransformForAcceptance, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!selectedTransformForAcceptance) {
      newErrors.transform = 'Please select a transformation';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await acceptBattle(
        battleData.battleId,
        selectedTransformForAcceptance
      );
      
      // Success - close modal
      onClose();
      
      // You could show a success toast here
      console.log('Battle accepted:', result);
      
    } catch (error) {
      console.error('Accept battle error:', error);
    }
  };

  const handleTransformSelect = (transformId) => {
    setSelectedTransformForAcceptance(transformId);
    setErrors({ ...errors, transform: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">⚔️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Battle Challenge!</h2>
          <p className="text-gray-300 text-sm">
            {battleData?.challengerUsername} has challenged you to a transformation battle!
          </p>
        </div>

        {/* Challenger Preview */}
        {battleData && (
          <Card className="mb-6">
            <div className="p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {battleData.challengerUsername}
                </h3>
                <p className="text-gray-400 text-sm">
                  {battleData.challengerTribe}
                </p>
              </div>
              
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 mb-4">
                <img
                  src={battleData.challengerTransformUrl}
                  alt={`${battleData.challengerUsername}'s transformation`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {battleData.message && (
                <div className="text-center">
                  <p className="text-gray-300 text-sm italic">
                    "{battleData.message}"
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          {/* Transform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Your Transformation
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {transformHistory.map((transform) => (
                <Card
                  key={transform._id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTransformForAcceptance === transform._id
                      ? 'ring-2 ring-green-500 bg-green-900/20'
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => handleTransformSelect(transform._id)}
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

          {/* No Transformations Available */}
          {transformHistory.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Transformations Available
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                You need to create a transformation first to accept this battle.
              </p>
              <Button
                onClick={() => {
                  onClose();
                  // Navigate to transform page
                  window.location.href = '/transform';
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Create Transformation
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          {transformHistory.length > 0 && (
            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Decline
              </Button>
              <Button
                type="submit"
                disabled={isAcceptingBattle}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
              >
                {isAcceptingBattle ? 'Accepting...' : 'Accept Challenge'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default BattleAcceptance;
