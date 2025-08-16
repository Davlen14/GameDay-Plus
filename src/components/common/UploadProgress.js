import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';

const UploadProgress = ({ 
  isVisible, 
  progress = 0, 
  fileName = "Profile Photo",
  status = "uploading" // "uploading", "processing", "complete"
}) => {
  if (!isVisible) return null;

  const getStatusText = () => {
    switch (status) {
      case "uploading":
        return `Uploading ${fileName}...`;
      case "processing":
        return "Processing image...";
      case "complete":
        return "Upload complete!";
      default:
        return "Uploading...";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "uploading":
        return faCloudUploadAlt;
      case "processing":
        return faSpinner;
      case "complete":
        return faCloudUploadAlt;
      default:
        return faCloudUploadAlt;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30"
        style={{ backdropFilter: 'blur(4px)' }}
      />
      
      {/* Progress Content */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_25px_50px_rgba(0,0,0,0.25)] overflow-hidden max-w-sm w-full">
        {/* Background gradient overlay */}
        <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-red-50/30 pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Upload Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))'}}>
              <FontAwesomeIcon 
                icon={getStatusIcon()} 
                className={`text-white text-2xl ${status === 'processing' ? 'animate-spin' : ''}`} 
              />
            </div>
          </div>
          
          {/* Status Text */}
          <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
            {getStatusText()}
          </h3>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-800">
                {progress < 1 ? "Starting..." : `${Math.round(progress)}%`}
              </span>
            </div>
            
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out relative"
                style={{ 
                  width: `${Math.max(progress, 2)}%`, // Minimum 2% width to show activity
                  background: 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))'
                }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                
                {/* Show pulsing effect when progress is very low */}
                {progress < 5 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/50 to-red-600/50 animate-pulse" />
                )}
              </div>
            </div>
          </div>
          
          {/* File size or additional info */}
          {progress > 0 && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {progress < 100 ? "Please don't close this window..." : "Finalizing upload..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;
