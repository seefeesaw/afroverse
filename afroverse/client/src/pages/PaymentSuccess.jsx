import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePayment } from '../../hooks/usePayment';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getSubscriptionStatus } = usePayment();
  
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Fetch updated subscription status
        const result = await getSubscriptionStatus();
        
        if (result.success) {
          setSubscription(result);
        } else {
          setError('Failed to verify subscription status');
        }
      } catch (error) {
        console.error('Error handling payment success:', error);
        setError('An error occurred while processing your payment');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      handlePaymentSuccess();
    } else {
      setError('No session ID found');
      setIsLoading(false);
    }
  }, [sessionId, getSubscriptionStatus]);

  // Handle continue
  const handleContinue = () => {
    navigate('/');
  };

  // Handle view subscription
  const handleViewSubscription = () => {
    navigate('/profile');
  };

  // Render loading
  const renderLoading = () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="p-8 text-center">
          <Loader size="large" />
          <div className="mt-4 text-gray-400">Processing your payment...</div>
        </Card>
      </div>
    );
  };

  // Render error
  const renderError = () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-4">Payment Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button
            onClick={handleContinue}
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
          >
            Continue to App
          </Button>
        </Card>
      </div>
    );
  };

  // Render success
  const renderSuccess = () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-4">Welcome to Warrior Pass!</h1>
          <p className="text-gray-400 mb-6">
            Your subscription is now active. Enjoy unlimited transformations and all Warrior Pass benefits!
          </p>
          
          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="text-gray-300 text-left">
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-green-400">✅</div>
                <div>Unlimited Transformations</div>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-green-400">✅</div>
                <div>Access All Styles</div>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-green-400">✅</div>
                <div>2× Tribe Points</div>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-green-400">✅</div>
                <div>Faster AI Processing</div>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-green-400">✅</div>
                <div>Warrior Badge</div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Start Transforming
            </Button>
            
            <Button
              onClick={handleViewSubscription}
              className="w-full bg-gray-600 text-white hover:bg-gray-700"
            >
              View Subscription
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  return renderSuccess();
};

export default PaymentSuccess;
