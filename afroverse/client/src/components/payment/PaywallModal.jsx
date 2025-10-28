import React, { useState } from 'react';
import { usePayment } from '../../hooks/usePayment';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';

const PaywallModal = ({ isOpen, onClose, feature = 'transform' }) => {
  const {
    paywall,
    loading,
    errors,
    createCheckout,
    redirectToCheckout,
    createConsumablePayment,
    showPaywallModal,
    hidePaywallModal,
    getValueProposition,
    getConsumableInfo,
    formatPrice,
    clearAllErrors
  } = usePayment();
  
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // Handle upgrade
  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      clearAllErrors();
      
      if (paywall.type === 'warrior_pass') {
        // Create checkout session for subscription
        const result = await createCheckout(selectedPlan);
        
        if (result.success) {
          // Redirect to Stripe Checkout
          await redirectToCheckout(result.sessionId);
        }
      } else {
        // Create payment intent for consumable
        const result = await createConsumablePayment(paywall.type);
        
        if (result.success) {
          // Handle consumable payment
          // This would integrate with Stripe Elements for card payment
          console.log('Consumable payment created:', result);
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle close
  const handleClose = () => {
    hidePaywallModal();
    onClose();
  };

  // Get paywall content
  const getPaywallContent = () => {
    if (paywall.type === 'warrior_pass') {
      const proposition = getValueProposition(selectedPlan);
      
      return {
        title: '🔥 Warrior Pass',
        subtitle: proposition.subtitle,
        price: proposition.price,
        period: proposition.period,
        savings: proposition.savings,
        features: proposition.features,
        cta: 'Upgrade Now'
      };
    } else {
      const info = getConsumableInfo(paywall.type);
      
      return {
        title: info.name,
        subtitle: info.description,
        price: formatPrice(info.price),
        period: 'one-time',
        savings: null,
        features: [info.description],
        cta: `Purchase ${info.name}`
      };
    }
  };

  const content = getPaywallContent();

  // Render plan selector for warrior pass
  const renderPlanSelector = () => {
    if (paywall.type !== 'warrior_pass') return null;
    
    return (
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handlePlanSelect('monthly')}
          className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
            selectedPlan === 'monthly'
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 bg-gray-800/50'
          }`}
        >
          <div className="text-center">
            <div className="text-white font-semibold">Monthly</div>
            <div className="text-gray-400 text-sm">$4.99/month</div>
            <div className="text-green-400 text-xs mt-1">Save 17%</div>
          </div>
        </button>
        
        <button
          onClick={() => handlePlanSelect('weekly')}
          className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
            selectedPlan === 'weekly'
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 bg-gray-800/50'
          }`}
        >
          <div className="text-center">
            <div className="text-white font-semibold">Weekly</div>
            <div className="text-gray-400 text-sm">$1.99/week</div>
            <div className="text-blue-400 text-xs mt-1">Try first</div>
          </div>
        </button>
      </div>
    );
  };

  // Render features list
  const renderFeatures = () => {
    return (
      <div className="space-y-3 mb-6">
        {content.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="text-green-400 text-lg">✅</div>
            <div className="text-gray-300">{feature}</div>
          </div>
        ))}
      </div>
    );
  };

  // Render error message
  const renderError = () => {
    const error = errors.checkout || errors.payment;
    if (!error) return null;
    
    return (
      <div className="mb-4 p-3 bg-red-900/20 border border-red-400/30 rounded-lg">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">
            {paywall.type === 'warrior_pass' ? '🔥' : getConsumableInfo(paywall.type).icon}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{content.title}</h2>
          <p className="text-gray-400">{content.subtitle}</p>
        </div>

        {/* Plan Selector */}
        {renderPlanSelector()}

        {/* Price */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-white">{content.price}</div>
          <div className="text-gray-400">{content.period}</div>
          {content.savings && (
            <div className="text-green-400 text-sm mt-1">{content.savings}</div>
          )}
        </div>

        {/* Features */}
        {renderFeatures()}

        {/* Error Message */}
        {renderError()}

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleUpgrade}
            disabled={isProcessing || loading.checkout || loading.payment}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            {isProcessing || loading.checkout || loading.payment ? (
              <>
                <Loader size="small" />
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              content.cta
            )}
          </Button>
          
          <Button
            onClick={handleClose}
            className="w-full bg-gray-600 text-white hover:bg-gray-700 py-3"
          >
            Maybe Later
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <div className="text-gray-500 text-xs">
            🔒 Secure payment powered by Stripe
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Cancel anytime • No hidden fees
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaywallModal;
