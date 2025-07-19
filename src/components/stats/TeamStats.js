import React from 'react';

const TeamStats = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center relative overflow-hidden pt-8 pb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {/* Floating gradient orbs with modern red gradient */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-red-600/10 to-red-800/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-red-600/8 to-red-800/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/6 right-1/3 w-20 h-20 bg-gradient-to-r from-red-600/12 to-red-800/12 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-gradient-to-r from-red-600/12 to-red-800/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative w-full max-w-4xl mx-4 animate-fade-in z-10">
        {/* Glass Container */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_25px_50px_rgba(239,68,68,0.15)] overflow-hidden">
          {/* Gradient overlay for glass effect */}
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-red-50/30 pointer-events-none"></div>
          
          {/* Content */}
          <div className="relative z-10 p-12 text-center">
            {/* Icon */}
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-full h-full bg-white/60 backdrop-blur-lg border border-white/40 rounded-full flex items-center justify-center shadow-lg">
                <i className="fas fa-users text-6xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"></i>
              </div>
            </div>

            {/* Coming Soon Text */}
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-6">
              Coming Soon
            </h1>
            
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Team Stats Dashboard
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Dive deep into team performance with comprehensive statistics, comparative analysis, 
              and advanced metrics covering all aspects of college football team dynamics.
            </p>

            {/* Feature Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-chart-bar text-2xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Analytics</h3>
                <p className="text-gray-600 text-sm">Offensive, defensive, and special teams metrics</p>
              </div>

              <div className="bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-balance-scale text-2xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Comparisons</h3>
                <p className="text-gray-600 text-sm">Head-to-head analysis and rankings</p>
              </div>

              <div className="bg-white/60 backdrop-blur-lg border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-chart-area text-2xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Trend Analysis</h3>
                <p className="text-gray-600 text-sm">Season progression and performance trends</p>
              </div>
            </div>

            {/* Notify Button */}
            <button className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group">
              <span className="relative z-10 flex items-center space-x-2">
                <i className="fas fa-bell"></i>
                <span>Notify Me When Available</span>
              </span>
              <div className="absolute inset-0 -top-full group-hover:top-0 bg-gradient-to-b from-white/20 to-transparent transition-all duration-500"></div>
            </button>

            {/* Coming Soon Badge */}
            <div className="mt-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-red-600/10 to-red-800/10 text-red-700 border border-red-200">
                <i className="fas fa-clock mr-2"></i>
                Expected Launch: Q3 2025
              </span>
            </div>
          </div>
        </div>

        {/* Decorative glass elements */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 -right-4 w-12 h-12 bg-gradient-to-r from-red-600/25 to-red-800/25 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 -left-4 w-16 h-16 bg-gradient-to-r from-red-600/18 to-red-800/18 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};

export default TeamStats;
