import React from 'react';

const MountainWest = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold gradient-text mb-8">Mountain West Conference</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive coverage of Mountain West teams, stats, and analysis coming soon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-mountain text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Mountain Division</h3>
            <p className="text-gray-600 mb-6">Track Mountain Division standings and playoff race.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-water text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">West Division</h3>
            <p className="text-gray-600 mb-6">Monitor West Division competition and rankings.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-trophy text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Championship Game</h3>
            <p className="text-gray-600 mb-6">Mountain West Championship Game predictions.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-chart-line text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Conference Metrics</h3>
            <p className="text-gray-600 mb-6">Advanced analytics for Mountain West teams.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-star text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Player Honors</h3>
            <p className="text-gray-600 mb-6">All-Mountain West team selections and awards.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-bullseye text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Bowl Outlook</h3>
            <p className="text-gray-600 mb-6">Bowl game projections and playoff chances.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Mountain West Teams</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Air Force', 'Boise State', 'Colorado State', 'Fresno State',
              'Hawaii', 'Nevada', 'New Mexico', 'San Diego State',
              'San Jose State', 'UNLV', 'Utah State', 'Wyoming'
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

export default MountainWest;
