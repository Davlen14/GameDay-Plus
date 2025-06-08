import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  className = '',
  icon = null,
  loading = false,
  type = 'button'
}) => {
  const baseClasses = 'font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 focus:ring-orange-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white focus:ring-orange-500',
    ghost: 'text-orange-500 hover:bg-orange-500 hover:bg-opacity-10 focus:ring-orange-500'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };
  
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className} flex items-center gap-2 justify-center`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
