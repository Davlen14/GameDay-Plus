import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

const SuccessPopup = ({ 
  isVisible, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully",
  autoCloseDelay = 3000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto close after delay
      if (autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-30' : 'bg-opacity-0'
        }`}
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
      />
      
      {/* Popup Content */}
      <div 
        className={`relative bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_25px_50px_rgba(0,0,0,0.25)] overflow-hidden max-w-sm w-full transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-green-50/30 pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors duration-200 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600 text-sm" />
          </button>
          
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-2xl" />
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 text-center text-sm leading-relaxed">
            {message}
          </p>
          
          {/* Progress bar (visual indicator that it will auto-close) */}
          {autoCloseDelay > 0 && (
            <div className="mt-4">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all ease-linear"
                  style={{
                    width: '100%',
                    animation: `shrink ${autoCloseDelay}ms linear forwards`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessPopup;
