import React from 'react';

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white',
    secondary: 'bg-gray-700 text-gray-200',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    outline: 'border border-orange-500 text-orange-500 bg-transparent'
  };
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
