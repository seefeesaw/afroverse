import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  color = 'purple',
  showLabel = false,
  label = '',
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const colorClasses = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">
            {label || `${Math.round(percentage)}%`}
          </span>
          <span className="text-sm text-gray-400">
            {value}/{max}
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
        <div
          className={`${colorClasses[color]} transition-all duration-300 ease-out ${sizeClasses[size]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
export { ProgressBar };
