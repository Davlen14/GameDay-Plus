import React from 'react';

const Pac12 = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold gradient-text mb-8">Pac-12 Conference</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive coverage of Pac-12 teams, stats, and analysis coming soon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-chart-line text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Conference Rankings</h3>
            <p className="text-gray-600 mb-6">Real-time rankings and performance metrics for Pac-12 teams.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-running text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Player Performance</h3>
            <p className="text-gray-600 mb-6">Advanced player metrics and statistical analysis.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-trophy text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Championship Race</h3>
            <p className="text-gray-600 mb-6">Track the race for the Pac-12 Championship Game.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-gamepad text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Game Predictions</h3>
            <p className="text-gray-600 mb-6">AI-powered predictions for upcoming Pac-12 matchups.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-star text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Draft Prospects</h3>
            <p className="text-gray-600 mb-6">NFL Draft prospects and scouting reports from the Pac-12.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-newspaper text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Conference News</h3>
            <p className="text-gray-600 mb-6">Latest news, transfers, and updates from around the Pac-12.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Pac-12 Teams</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Arizona', 'Arizona State', 'California', 'Colorado',
              'Oregon', 'Oregon State', 'Stanford', 'UCLA',
              'USC', 'Utah', 'Washington', 'Washington State'
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

export default Pac12;
