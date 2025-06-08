import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-orange-500',
    secondary: 'border-gray-600',
    white: 'border-white'
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div 
        className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
