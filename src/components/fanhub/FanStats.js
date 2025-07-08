import React from 'react';

const FanStats = () => {
  // Professional gradient system matching EVBettingView
  const professionalGradients = {
    red: `linear-gradient(135deg, 
      rgb(255, 46, 74), 
      rgb(204, 0, 28), 
      rgb(161, 0, 20), 
      rgb(204, 0, 28), 
      rgb(255, 46, 74)
    )`,
    blue: `linear-gradient(135deg, 
      rgb(59, 130, 246), 
      rgb(37, 99, 235), 
      rgb(29, 78, 216), 
      rgb(37, 99, 235), 
      rgb(59, 130, 246)
    )`,
    green: `linear-gradient(135deg, 
      rgb(34, 197, 94), 
      rgb(22, 163, 74), 
      rgb(15, 118, 54), 
      rgb(22, 163, 74), 
      rgb(34, 197, 94)
    )`,
    gold: `linear-gradient(135deg, 
      rgb(250, 204, 21), 
      rgb(245, 158, 11), 
      rgb(217, 119, 6), 
      rgb(245, 158, 11), 
      rgb(250, 204, 21)
    )`,
    purple: `linear-gradient(135deg, 
      rgb(147, 51, 234), 
      rgb(126, 34, 206), 
      rgb(101, 16, 179), 
      rgb(126, 34, 206), 
      rgb(147, 51, 234)
    )`,
    orange: `linear-gradient(135deg, 
      rgb(251, 146, 60), 
      rgb(249, 115, 22), 
      rgb(234, 88, 12), 
      rgb(249, 115, 22), 
      rgb(251, 146, 60)
    )`,
    gray: `linear-gradient(135deg, 
      rgb(156, 163, 175), 
      rgb(107, 114, 128), 
      rgb(75, 85, 99), 
      rgb(107, 114, 128), 
      rgb(156, 163, 175)
    )`
  };

  // Glass morphism effect for premium cards
  const glassMorphism = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  };

  return (
    <div className="min-h-screen py-20" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-8">
            <span style={{ 
              background: professionalGradients.blue,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Fan Stats</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your fan engagement, prediction accuracy, and achievements on the GAMEDAY+ platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            className="rounded-lg p-8 text-center"
            style={{
              ...glassMorphism,
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
            }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ 
                background: professionalGradients.blue,
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
              }}
            >
              <i className="fas fa-medal text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Achievement System</h3>
            <p className="text-gray-600 mb-6">Unlock badges and achievements for platform engagement.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div 
            className="rounded-lg p-8 text-center"
            style={{
              ...glassMorphism,
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15)'
            }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ 
                background: professionalGradients.green,
                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)'
              }}
            >
              <i className="fas fa-chart-line text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Prediction Accuracy</h3>
            <p className="text-gray-600 mb-6">Track your prediction success rate across different categories.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div 
            className="rounded-lg p-8 text-center"
            style={{
              ...glassMorphism,
              boxShadow: '0 8px 32px rgba(147, 51, 234, 0.15)'
            }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ 
                background: professionalGradients.purple,
                boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)'
              }}
            >
              <i className="fas fa-trophy text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Leaderboards</h3>
            <p className="text-gray-600 mb-6">See where you rank among all GAMEDAY+ users.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div 
            className="rounded-lg p-8 text-center"
            style={{
              ...glassMorphism,
              boxShadow: '0 8px 32px rgba(255, 46, 74, 0.15)'
            }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ 
                background: professionalGradients.red,
                boxShadow: '0 8px 32px rgba(255, 46, 74, 0.3)'
              }}
            >
              <i className="fas fa-heart text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Loyalty Points</h3>
            <p className="text-gray-600 mb-6">Earn points for daily engagement and platform usage.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div 
            className="rounded-lg p-8 text-center"
            style={{
              ...glassMorphism,
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
            }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ 
                background: professionalGradients.blue,
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
              }}
            >
              <i className="fas fa-calendar text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Streak Tracking</h3>
            <p className="text-gray-600 mb-6">Monitor your daily login streaks and consecutive wins.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div 
            className="rounded-lg p-8 text-center"
            style={{
              ...glassMorphism,
              boxShadow: '0 8px 32px rgba(250, 204, 21, 0.15)'
            }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ 
                background: professionalGradients.gold,
                boxShadow: '0 8px 32px rgba(250, 204, 21, 0.3)'
              }}
            >
              <i className="fas fa-star text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Fan Level</h3>
            <p className="text-gray-600 mb-6">Level up your fan profile based on activity and engagement.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>
        </div>

        <div 
          className="rounded-lg p-8 mt-16"
          style={{
            ...glassMorphism,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sample Fan Profile</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="text-center mb-6">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ 
                    background: professionalGradients.purple,
                    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)'
                  }}
                >
                  <i className="fas fa-user text-white text-2xl"></i>
                </div>
                <h4 className="text-xl font-bold text-gray-900">CFB_Expert_2025</h4>
                <p className="text-gray-600">Level 15 Fan • Member since 2023</p>
                <div className="flex items-center justify-center mt-2">
                  <i className="fas fa-star text-yellow-500"></i>
                  <i className="fas fa-star text-yellow-500"></i>
                  <i className="fas fa-star text-yellow-500"></i>
                  <i className="fas fa-star text-yellow-500"></i>
                  <i className="fas fa-star text-gray-300"></i>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prediction Accuracy</span>
                  <span className="font-semibold text-green-600">73.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-blue-600">12 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Loyalty Points</span>
                  <span className="font-semibold text-purple-600">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rank</span>
                  <span className="font-semibold text-orange-600">#1,234</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Recent Achievements</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 bg-yellow-50 p-3 rounded-lg">
                  <i className="fas fa-trophy text-yellow-600"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Prediction Master</p>
                    <p className="text-sm text-gray-600">Achieved 70%+ accuracy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
                  <i className="fas fa-fire text-blue-600"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Hot Streak</p>
                    <p className="text-sm text-gray-600">10 day login streak</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                  <i className="fas fa-comments text-green-600"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Social Butterfly</p>
                    <p className="text-sm text-gray-600">100+ forum posts</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg">
                  <i className="fas fa-poll text-purple-600"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Poll Participant</p>
                    <p className="text-sm text-gray-600">Voted in 50+ polls</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 mt-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Level Up</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-magic text-white"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Make Predictions</h4>
                <p className="text-sm text-gray-600">Earn XP for every prediction</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-comments text-white"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Engage Socially</h4>
                <p className="text-sm text-gray-600">Post, comment, and interact</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-poll text-white"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Vote in Polls</h4>
                <p className="text-sm text-gray-600">Participate in community polls</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-calendar-check text-white"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Daily Login</h4>
                <p className="text-sm text-gray-600">Maintain login streaks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanStats;
