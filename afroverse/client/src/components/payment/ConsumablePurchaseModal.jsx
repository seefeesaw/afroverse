import React, { useState } from 'react';
import { usePayment } from '../../hooks/usePayment';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';

const ConsumablePurchaseModal = ({ 
  isOpen, 
  onClose, 
  type, 
  onSuccess 
}) => {
  const {
    loading,
    errors,
    createConsumablePayment,
    confirmPayment,
    createPaymentMethod,
    getConsumableInfo,
    formatPrice,
    clearAllErrors
  } = usePayment();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Get consumable info
  const info = getConsumableInfo(type);

  // Handle purchase
  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      clearAllErrors();
      
      // Create payment intent
      const result = await createConsumablePayment(type);
      
      if (result.success) {
        // In a real implementation, you would:
        // 1. Create a payment method using Stripe Elements
        // 2. Confirm the payment intent
        // 3. Handle success/error
        
        // For now, we'll simulate success
        setTimeout(() => {
          setIsProcessing(false);
          onSuccess && onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      setIsProcessing(false);
    }
  };

  // Handle close
  const handleClose = () => {
    onClose();
  };

  // Render error message
  const renderError = () => {
    if (!errors.payment) return null;
    
    return (
      <div className="mb-4 p-3 bg-red-900/20 border border-red-400/30 rounded-lg">
        <div className="text-red-400 text-sm">{errors.payment}</div>
      </div>
    );
  };

  // Render payment form
  const renderPaymentForm = () => {
    return (
      <div className="space-y-4">
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Payment Method
          </label>
          <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg">
            <div className="text-gray-400 text-sm">
              💳 Card ending in •••• 4242
            </div>
            <div className="text-gray-500 text-xs mt-1">
              Test card for demo purposes
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Billing Address
          </label>
          <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg">
            <div className="text-gray-400 text-sm">
              123 Test Street, Test City, TC 12345
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{info.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{info.name}</h2>
          <p className="text-gray-400">{info.description}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-white">{formatPrice(info.price)}</div>
          <div className="text-gray-400">One-time purchase</div>
        </div>

        {/* Payment Form */}
        {renderPaymentForm()}

        {/* Error Message */}
        {renderError()}

        {/* CTA Buttons */}
        <div className="space-y-3 mt-6">
          <Button
            onClick={handlePurchase}
            disabled={isProcessing || loading.payment}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            {isProcessing || loading.payment ? (
              <>
                <Loader size="small" />
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              `Purchase ${info.name}`
            )}
          </Button>
          
          <Button
            onClick={handleClose}
            className="w-full bg-gray-600 text-white hover:bg-gray-700 py-3"
          >
            Cancel
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <div className="text-gray-500 text-xs">
            🔒 Secure payment powered by Stripe
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Instant activation • No recurring charges
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConsumablePurchaseModal;
