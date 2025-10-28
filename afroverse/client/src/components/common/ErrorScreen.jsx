import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const ErrorScreen = ({ 
  title = 'Something went wrong',
  message = 'We encountered an error. Please try again.',
  onRetry,
  showContactSupport = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-tribe flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-24 h-24 bg-masai-red/20 border-2 border-masai-red rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">😢</span>
        </div>

        {/* Error Title */}
        <h1 className="font-headline text-3xl text-white mb-4">{title}</h1>

        {/* Error Message */}
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="space-y-4">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full btn-primary"
            >
              🔄 Try Again
            </Button>
          )}

          <Button
            onClick={() => navigate('/')}
            className="w-full btn-outline"
          >
            🏠 Go Home
          </Button>

          {showContactSupport && (
            <button
              onClick={() => navigate('/help')}
              className="w-full text-heritage-orange hover:text-heritage-gold transition-colors font-semibold"
            >
              📧 Contact Support
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg text-left">
          <p className="text-gray-400 text-sm mb-2">
            <strong className="text-white">Common solutions:</strong>
          </p>
          <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
            <li>Check your internet connection</li>
            <li>Clear your browser cache</li>
            <li>Try a different browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;


