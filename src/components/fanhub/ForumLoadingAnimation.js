import React from 'react';

const ForumLoadingAnimation = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Forum...</h3>
          <p className="text-gray-600">Preparing your interactive experience</p>
          
          {/* Animated emojis */}
          <div className="flex justify-center space-x-4 mt-6 text-2xl">
            <span className="animate-pulse">🏈</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🔥</span>
            <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>⚡</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>💯</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumLoadingAnimation;
