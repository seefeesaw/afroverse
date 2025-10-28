import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Toast from '../common/Toast';

const PhoneEntry = ({ onNext }) => {
  const { startAuth, isLoading, error, clearError, validatePhoneNumber, formatPhoneNumber } = useAuth();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+27'); // Default to South Africa
  const [isValid, setIsValid] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-detect country code based on IP (simplified)
  useEffect(() => {
    // In a real app, you'd use a geolocation service
    // For now, we'll default to South Africa
    setCountryCode('+27');
  }, []);

  // Validate phone number
  useEffect(() => {
    const fullPhone = countryCode + phone.replace(/\D/g, '');
    const valid = validatePhoneNumber(fullPhone);
    setIsValid(valid);
  }, [phone, countryCode, validatePhoneNumber]);

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

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValid) return;
    
    try {
      const fullPhone = countryCode + phone;
      await startAuth(fullPhone);
      onNext();
    } catch (error) {
      console.error('Start auth error:', error);
    }
  };

  const formatDisplayPhone = () => {
    if (!phone) return '';
    
    // Add spaces for readability
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ 
        backgroundColor: '#0E0B16' // Background Dark from color system
      }}
    >
      {/* African Pattern Overlay - 10% opacity */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236F2CFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Gradient Glow Background Effect */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #6F2CFF 0%, #BA36FF 45%, #F5B63F 100%)'
        }}
      />

      <div 
        className="w-full max-w-md relative z-10 animate-fade-in"
        style={{
          animation: 'fadeSlideIn 300ms ease-out'
        }}
      >
        <Card 
          className="rounded-2xl border border-opacity-10 shadow-2xl"
          style={{
            backgroundColor: '#1B1528', // Surface Card
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 60px rgba(111, 44, 255, 0.25)'
          }}
        >
          <div className="p-8">
            {/* Header Section */}
            <div className="text-center mb-10">
              {/* Icon with Glow */}
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #6F2CFF 0%, #BA36FF 100%)',
                  boxShadow: '0 0 30px rgba(111, 44, 255, 0.5), 0 0 60px rgba(111, 44, 255, 0.25)'
                }}
              >
                <span className="text-4xl">👑</span>
                {/* Pulse Ring Animation */}
                <div 
                  className="absolute inset-0 rounded-full animate-pulse-ring"
                  style={{
                    border: '2px solid rgba(111, 44, 255, 0.5)',
                    animation: 'pulseRing 1500ms ease-in-out infinite'
                  }}
                />
              </div>

              {/* Title - Montserrat Black */}
              <h1 
                className="text-3xl font-black mb-3 tracking-tight"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#FFFFFF', // Text Primary
                  fontWeight: 900
                }}
              >
                Rise, Warrior
              </h1>

              {/* Subtitle - Inter Regular */}
              <p 
                className="text-base"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255, 255, 255, 0.7)', // Text Secondary
                  fontWeight: 400
                }}
              >
                Enter your number to join the battle
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 600
                  }}
                >
                  Phone Number
                </label>
                
                <div className="flex gap-2">
                  {/* Country Code Selector */}
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-4 py-4 rounded-2xl focus:outline-none transition-all duration-300"
                    style={{
                      backgroundColor: '#0E0B16',
                      border: `2px solid ${isFocused ? '#6F2CFF' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      boxShadow: isFocused ? '0 0 20px rgba(111, 44, 255, 0.35)' : 'none'
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  >
                    <option value="+27">🇿🇦 +27</option>
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+254">🇰🇪 +254</option>
                    <option value="+233">🇬🇭 +233</option>
                    <option value="+256">🇺🇬 +256</option>
                    <option value="+250">🇷🇼 +250</option>
                    <option value="+255">🇹🇿 +255</option>
                    <option value="+260">🇿🇲 +260</option>
                    <option value="+263">🇿🇼 +263</option>
                  </select>

                  {/* Phone Input */}
                  <input
                    type="tel"
                    value={formatDisplayPhone()}
                    onChange={handlePhoneChange}
                    placeholder="84 123 4567"
                    className="flex-1 px-4 py-4 rounded-2xl focus:outline-none transition-all duration-300"
                    style={{
                      backgroundColor: '#0E0B16',
                      border: `2px solid ${isFocused ? '#6F2CFF' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '16px',
                      boxShadow: isFocused ? '0 0 20px rgba(111, 44, 255, 0.35)' : 'none'
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    maxLength={15}
                  />
                </div>

                {/* Validation Error */}
                {phone && !isValid && (
                  <p 
                    className="text-xs mt-2 animate-fade-in"
                    style={{ 
                      color: '#FF4D6D', // Accent Red
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500
                    }}
                  >
                    ⚠️ Please enter a valid phone number
                  </p>
                )}
              </div>

              {/* Primary Button */}
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-103 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: isValid && !isLoading 
                    ? 'linear-gradient(135deg, #6F2CFF 0%, #BA36FF 45%, #F5B63F 100%)'
                    : 'rgba(111, 44, 255, 0.3)',
                  color: '#FFFFFF',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  boxShadow: isValid && !isLoading 
                    ? '0 4px 20px rgba(111, 44, 255, 0.4), 0 0 30px rgba(245, 182, 63, 0.2)'
                    : 'none',
                  transform: 'scale(1)',
                  border: 'none'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader size="sm" />
                    <span>Sending Code...</span>
                  </div>
                ) : (
                  <span>Continue to Battle 🔥</span>
                )}
              </Button>
            </form>

            {/* Footer Text */}
            <div className="mt-8 text-center">
              <p 
                className="text-xs leading-relaxed"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400
                }}
              >
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </Card>

        {/* Brand Badge */}
        <div className="text-center mt-6">
          <p 
            className="text-sm font-semibold tracking-wide"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              textShadow: '0 0 20px rgba(111, 44, 255, 0.5)'
            }}
          >
            AFRO! AFRO!
          </p>
        </div>
      </div>

      {/* Toast Notification */}
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

      {/* Add Custom Animations */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeSlideIn 300ms ease-out;
        }

        .animate-pulse-ring {
          animation: pulseRing 1500ms ease-in-out infinite;
        }

        .hover\:scale-103:hover {
          transform: scale(1.03);
        }

        /* Custom scrollbar for select dropdown */
        select::-webkit-scrollbar {
          width: 8px;
        }

        select::-webkit-scrollbar-track {
          background: #0E0B16;
        }

        select::-webkit-scrollbar-thumb {
          background: #6F2CFF;
          border-radius: 4px;
        }

        select::-webkit-scrollbar-thumb:hover {
          background: #BA36FF;
        }
      `}</style>
    </div>
  );
};

export default PhoneEntry;