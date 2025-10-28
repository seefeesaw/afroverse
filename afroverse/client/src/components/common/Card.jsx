import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'lg',
  rounded = 'lg',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };

  return (
    <div
      className={`
        bg-gray-900
        border border-gray-700
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${roundedClasses[rounded]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
export { Card };
