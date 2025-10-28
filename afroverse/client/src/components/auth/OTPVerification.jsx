import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Toast from '../common/Toast';

const OTPVerification = ({ onNext, onBack }) => {
  const { verifyAuth, isLoading, error, clearError, phone, formatPhoneNumber } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showToast, setShowToast] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Show error toast
  useEffect(() => {
    if (error) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Start resend cooldown
  useEffect(() => {
    setResendCooldown(30);
    setCanResend(false);
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePaste(e.clipboardData.getData('text'));
    }
  };

  const handlePaste = (pastedData) => {
    const cleanedData = pastedData.replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < cleanedData.length; i++) {
      newOtp[i] = cleanedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus last filled input
    const lastFilledIndex = cleanedData.length - 1;
    if (lastFilledIndex < 5) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    
    try {
      await verifyAuth(otpCode);
      onNext();
    } catch (error) {
      console.error('Verify auth error:', error);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      // In a real app, you'd call the resend API
      setResendCooldown(30);
      setCanResend(false);
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Enter verification code</h1>
          <p className="text-gray-300 text-sm">
            We sent a code to WhatsApp at{' '}
            <span className="font-medium text-white">
              {formatPhoneNumber(phone)}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
              Verification Code
            </label>
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(e.clipboardData.getData('text'))}
                  className="w-12 h-12 text-center text-xl font-bold bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={1}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isOtpComplete || isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader size="sm" className="mr-2" />
                Verifying...
              </div>
            ) : (
              'Verify'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`text-sm ${
              canResend 
                ? 'text-purple-400 hover:text-purple-300' 
                : 'text-gray-500 cursor-not-allowed'
            }`}
          >
            {canResend ? 'Resend code' : `Resend in ${resendCooldown}s`}
          </button>
          
          <button
            type="button"
            onClick={onBack}
            className="block text-sm text-gray-400 hover:text-gray-300 mx-auto"
          >
            ← Change phone number
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Having trouble? Try{' '}
            <button className="text-purple-400 hover:text-purple-300 underline">
              SMS instead
            </button>
          </p>
        </div>
      </Card>

      {showToast && error && (
        <Toast
          message={error}
          type="error"
          onClose={() => {
            setShowToast(false);
            clearError();
          }}
        />
      )}
    </div>
  );
};

export default OTPVerification;
