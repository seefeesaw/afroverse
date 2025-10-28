import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Loader from '../common/Loader';

const AutoOnboard = ({ onComplete }) => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Simulate onboarding completion after a short delay
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🎉</span>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Welcome to Afroverse!
          </h1>
          
          <p className="text-gray-300 mb-6">
            Your account has been created successfully. You're now ready to transform your photos and join epic battles!
          </p>
        </div>

        {user && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {user.username?.charAt(0) || 'W'}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">
              {user.username}
            </h3>
            
            <div className="text-sm text-gray-300 space-y-1">
              <p>📱 {user.phone}</p>
              <p>🎨 Free Plan - 3 transforms per day</p>
              <p>🏆 Ready to battle!</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center">
          <Loader size="md" className="mr-3" />
          <span className="text-gray-300">Setting up your profile...</span>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            You can customize your profile and choose your tribe later
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AutoOnboard;
