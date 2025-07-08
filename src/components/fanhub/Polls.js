import React from 'react';

const Polls = () => {
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
              background: professionalGradients.purple,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Polls & Voting</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Participate in fan polls, vote on key topics, and see what the community thinks about college football.
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
              <i className="fas fa-poll text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Weekly Polls</h3>
            <p className="text-gray-600 mb-6">Vote on top teams, best players, and biggest storylines each week.</p>
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
              <i className="fas fa-vote-yea text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Fan Rankings</h3>
            <p className="text-gray-600 mb-6">Create your own team rankings and compare with other fans.</p>
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
              <i className="fas fa-chart-pie text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Results</h3>
            <p className="text-gray-600 mb-6">See live poll results and voting breakdowns by demographics.</p>
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
              <i className="fas fa-trophy text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Award Voting</h3>
            <p className="text-gray-600 mb-6">Vote for Heisman Trophy, Coach of the Year, and other awards.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-question-circle text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Hot Topics</h3>
            <p className="text-gray-600 mb-6">Vote on controversial topics and trending discussions.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Voice</h3>
            <p className="text-gray-600 mb-6">Submit your own poll questions for the community to vote on.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 mt-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">This Week's Hot Polls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Who will win the National Championship?</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Georgia</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded mr-2">
                        <div className="w-3/5 h-2 bg-blue-600 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-500">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Alabama</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded mr-2">
                        <div className="w-1/2 h-2 bg-blue-600 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-500">28%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Texas</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded mr-2">
                        <div className="w-1/4 h-2 bg-blue-600 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-500">22%</span>
                    </div>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Vote Now
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Best College Football Rivalry?</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ohio State vs Michigan</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded mr-2">
                        <div className="w-2/5 h-2 bg-green-600 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-500">42%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Auburn vs Alabama</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded mr-2">
                        <div className="w-1/3 h-2 bg-green-600 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-500">31%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Army vs Navy</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded mr-2">
                        <div className="w-1/5 h-2 bg-green-600 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-500">27%</span>
                    </div>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                  Vote Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Polls;
