import React from 'react';

const SocialFeed = () => {
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
            }}>Social Feed</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay connected with the college football community through real-time social updates and fan interactions.
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
              <i className="fas fa-stream text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Live Feed</h3>
            <p className="text-gray-600 mb-6">Real-time updates from fans, analysts, and official team accounts.</p>
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
              <i className="fas fa-hashtag text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trending Topics</h3>
            <p className="text-gray-600 mb-6">Follow trending hashtags and hot discussions in college football.</p>
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
              <i className="fas fa-heart text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Fan Reactions</h3>
            <p className="text-gray-600 mb-6">Share reactions, celebrate wins, and connect with fellow fans.</p>
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
              <i className="fas fa-photo-video text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Media Sharing</h3>
            <p className="text-gray-600 mb-6">Share photos, videos, and memes from gameday experiences.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Fan Groups</h3>
            <p className="text-gray-600 mb-6">Join team-specific groups and connect with like-minded fans.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-fire text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Hot Takes</h3>
            <p className="text-gray-600 mb-6">Share and debate bold predictions and controversial opinions.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sample Social Feed</h3>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900">@CFBFanatic2025</span>
                    <span className="text-gray-500 text-sm">2h ago</span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    🏈 GAME DAY! Nothing beats the atmosphere of college football Saturday. Who's your pick for upset of the week? #CFB #CollegeFootball
                  </p>
                  <div className="flex items-center space-x-6 text-gray-500 text-sm">
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <i className="fas fa-heart"></i>
                      <span>42</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <i className="fas fa-comment"></i>
                      <span>15</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <i className="fas fa-retweet"></i>
                      <span>8</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900">@GeorgiaDawgFan</span>
                    <span className="text-gray-500 text-sm">4h ago</span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    That defensive stand in the 4th quarter was INCREDIBLE! 🔥 Our defense is looking elite this season. #GoDawgs #CFBPlayoffs
                  </p>
                  <div className="flex items-center space-x-6 text-gray-500 text-sm">
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <i className="fas fa-heart"></i>
                      <span>127</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <i className="fas fa-comment"></i>
                      <span>23</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <i className="fas fa-retweet"></i>
                      <span>34</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900">@CollegeFootballGuru</span>
                    <span className="text-gray-500 text-sm">6h ago</span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    📊 Week 12 Power Rankings are here! Some major shakeups after yesterday's games. Do you agree with our top 10? Link in comments. #CFBRankings
                  </p>
                  <div className="flex items-center space-x-6 text-gray-500 text-sm">
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <i className="fas fa-heart"></i>
                      <span>89</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <i className="fas fa-comment"></i>
                      <span>67</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <i className="fas fa-retweet"></i>
                      <span>45</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-3 gradient-bg text-white rounded-lg hover:opacity-90 transition duration-300 font-bold">
            Join the Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
