import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

const SuccessMessage = ({ message, onClose, type = 'success' }) => {
  const bgColor = type === 'success' ? 'from-green-500 to-emerald-600' : 'from-red-500 to-red-600';
  const icon = type === 'success' ? faCheckCircle : faTimes;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="relative bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3),0_25px_50px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 p-6 flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${bgColor} flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className="text-white text-xl" />
          </div>
          
          <div className="flex-1">
            <p className="text-white font-medium">{message}</p>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
          >
            <FontAwesomeIcon icon={faTimes} className="text-white/80 text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
