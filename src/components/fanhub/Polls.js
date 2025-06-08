import React from 'react';

const Polls = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold gradient-text mb-8">Polls & Voting</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Participate in fan polls, vote on key topics, and see what the community thinks about college football.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-poll text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Weekly Polls</h3>
            <p className="text-gray-600 mb-6">Vote on top teams, best players, and biggest storylines each week.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-vote-yea text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Fan Rankings</h3>
            <p className="text-gray-600 mb-6">Create your own team rankings and compare with other fans.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-chart-pie text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Results</h3>
            <p className="text-gray-600 mb-6">See live poll results and voting breakdowns by demographics.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
