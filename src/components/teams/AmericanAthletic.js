import React from 'react';

const AmericanAthletic = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold gradient-text mb-8">American Athletic Conference</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive coverage of American Athletic Conference teams, stats, and analysis coming soon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-chart-bar text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Team Analytics</h3>
            <p className="text-gray-600 mb-6">Advanced metrics and performance analysis for AAC teams.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Player Tracking</h3>
            <p className="text-gray-600 mb-6">Individual player statistics and development tracking.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-trophy text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Conference Race</h3>
            <p className="text-gray-600 mb-6">Track standings and championship predictions.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-football-ball text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Game Analysis</h3>
            <p className="text-gray-600 mb-6">In-depth game breakdowns and tactical analysis.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-bullseye text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Recruiting Intel</h3>
            <p className="text-gray-600 mb-6">Latest recruiting news and commitment updates.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-calendar text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Schedule Power</h3>
            <p className="text-gray-600 mb-6">Strength of schedule analysis and predictions.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">AAC Teams</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Cincinnati', 'East Carolina', 'Houston', 'Memphis',
              'Navy', 'SMU', 'South Florida', 'Temple',
              'Tulane', 'Tulsa', 'UCF', 'Wichita State'
            ].map((team) => (
              <div key={team} className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-football-ball text-white"></i>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{team}</p>
                  <span className="text-xs text-gray-500">Coming Soon</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmericanAthletic;
