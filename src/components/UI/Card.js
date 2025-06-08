import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6', 
  shadow = 'shadow-lg',
  border = true,
  gradient = false 
}) => {
  const baseClasses = 'bg-gray-900 rounded-lg';
  const borderClasses = border ? 'border border-gray-700' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-gray-900 to-gray-800' : '';
  
  return (
    <div 
      className={`${baseClasses} ${borderClasses} ${gradientClasses} ${shadow} ${padding} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
