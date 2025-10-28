import React from 'react';
import { usePayment } from '../../hooks/usePayment';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';

const SubscriptionStatus = ({ className = '' }) => {
  const {
    subscription,
    loading,
    errors,
    cancelUserSubscription,
    getSubscriptionStatusDisplay,
    getRenewalDate,
    getDaysUntilExpiry,
    isExpiringSoon,
    formatPrice
  } = usePayment();

  // Handle cancel subscription
  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to all Warrior Pass benefits.')) {
      try {
        await cancelUserSubscription();
        alert('Subscription canceled successfully');
      } catch (error) {
        alert('Failed to cancel subscription. Please try again.');
      }
    }
  };

  // Get status display
  const getStatusDisplay = () => {
    return getSubscriptionStatusDisplay(subscription.status);
  };

  // Render active subscription
  const renderActiveSubscription = () => {
    const statusDisplay = getStatusDisplay();
    const renewalDate = getRenewalDate(subscription.expiresAt);
    const daysUntilExpiry = getDaysUntilExpiry(subscription.expiresAt);
    const isExpiring = isExpiringSoon(subscription.expiresAt, 3);

    return (
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="text-white font-semibold">Warrior Pass</div>
              <div className={`text-sm ${
                statusDisplay.color === '#2ECC71' ? 'text-green-400' :
                statusDisplay.color === '#F39C12' ? 'text-yellow-400' :
                'text-gray-400'
              }`}>
                {statusDisplay.icon} {statusDisplay.text}
              </div>
            </div>
          </div>
          
          {subscription.isTrial && (
            <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
              Trial
            </div>
          )}
        </div>

        {/* Expiry Warning */}
        {isExpiring && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-400/30 rounded-lg">
            <div className="text-yellow-400 text-sm">
              ⚠️ Your subscription expires in {daysUntilExpiry} days
            </div>
          </div>
        )}

        {/* Subscription Details */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Plan</span>
            <span className="text-white">{subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Renews</span>
            <span className="text-white">{renewalDate}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className="text-white">{statusDisplay.text}</span>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="text-gray-400 text-sm">Benefits</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <div className="text-green-400 text-sm">✅</div>
              <div className="text-gray-300 text-sm">Unlimited Transforms</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-green-400 text-sm">✅</div>
              <div className="text-gray-300 text-sm">All Styles</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-green-400 text-sm">✅</div>
              <div className="text-gray-300 text-sm">2× Tribe Points</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-green-400 text-sm">✅</div>
              <div className="text-gray-300 text-sm">AI Priority</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={handleCancel}
            disabled={loading.cancel}
            className="w-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.cancel ? (
              <>
                <Loader size="small" />
                <span className="ml-2">Canceling...</span>
              </>
            ) : (
              'Cancel Subscription'
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Render free user
  const renderFreeUser = () => {
    return (
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🆓</div>
          <div>
            <div className="text-white font-semibold">Free Account</div>
            <div className="text-gray-400 text-sm">Limited features</div>
          </div>
        </div>

        {/* Current Limits */}
        <div className="space-y-3">
          <div className="text-gray-400 text-sm">Current Limits</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Transformations</span>
              <span className="text-white">3 per day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Styles</span>
              <span className="text-white">2 free styles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tribe Points</span>
              <span className="text-white">1× multiplier</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI Processing</span>
              <span className="text-white">Standard queue</span>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={() => window.location.href = '/payment/upgrade'}
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
          >
            Upgrade to Warrior Pass
          </Button>
        </div>
      </div>
    );
  };

  // Render error
  const renderError = () => {
    if (!errors.subscription) return null;
    
    return (
      <div className="p-4 bg-red-900/20 border border-red-400/30 rounded-lg">
        <div className="text-red-400 text-sm">{errors.subscription}</div>
      </div>
    );
  };

  // Render loading
  const renderLoading = () => {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader size="medium" />
        <span className="ml-3 text-gray-400">Loading subscription status...</span>
      </div>
    );
  };

  return (
    <div className={className}>
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Subscription Status</h2>
        
        {loading.subscription ? (
          renderLoading()
        ) : errors.subscription ? (
          renderError()
        ) : subscription.hasSubscription && subscription.isActive ? (
          renderActiveSubscription()
        ) : (
          renderFreeUser()
        )}
      </Card>
    </div>
  );
};

export default SubscriptionStatus;
