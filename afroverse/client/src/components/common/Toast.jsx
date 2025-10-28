import React, { useEffect, useState } from 'react';

const Toast = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const typeClasses = {
    success: 'bg-green-500 border-green-400',
    error: 'bg-red-500 border-red-400',
    warning: 'bg-yellow-500 border-yellow-400',
    info: 'bg-blue-500 border-blue-400'
  };

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed z-50 max-w-sm w-full ${positionClasses[position]} ${isExiting ? 'animate-slide-out' : 'animate-slide-in'} ${className}`}>
      <div className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 ${typeClasses[type]} text-white`}>
        <div className="flex-shrink-0 mr-3">
          <span className="text-lg">{iconMap[type]}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-white hover:text-gray-200 focus:outline-none focus:text-gray-200"
        >
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
