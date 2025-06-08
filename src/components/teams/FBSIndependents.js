import React from 'react';

const FBSIndependents = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold gradient-text mb-8">FBS Independents</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive coverage of FBS Independent teams, stats, and analysis coming soon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-flag text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Independent Rankings</h3>
            <p className="text-gray-600 mb-6">Track independent teams in national rankings.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-calendar text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Schedule Strength</h3>
            <p className="text-gray-600 mb-6">Analyze strength of schedule for independent programs.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-trophy text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Playoff Chances</h3>
            <p className="text-gray-600 mb-6">Track College Football Playoff opportunities.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-chart-bar text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance Metrics</h3>
            <p className="text-gray-600 mb-6">Advanced analytics for independent programs.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-star text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">National Recognition</h3>
            <p className="text-gray-600 mb-6">Track awards and national honors for independent players.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-bullseye text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Bowl Projections</h3>
            <p className="text-gray-600 mb-6">Bowl game projections and at-large bid chances.</p>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">FBS Independent Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Army', 'BYU', 'Liberty', 'Navy',
              'Notre Dame', 'UMass', 'UConn'
            ].map((team) => (
              <div key={team} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-football-ball text-white text-xl"></i>
                  </div>
                  <p className="font-semibold text-gray-800">{team}</p>
                  <span className="text-sm text-gray-500">Coming Soon</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 mt-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Independent Advantages</h3>
            <p className="text-gray-600 mb-6">
              FBS Independent programs have unique scheduling flexibility and often face challenging strength of schedule requirements for playoff consideration.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <i className="fas fa-calendar-alt text-3xl text-blue-600 mb-3"></i>
                <h4 className="font-semibold text-gray-800">Flexible Scheduling</h4>
                <p className="text-sm text-gray-600">Independent programs can schedule opponents strategically</p>
              </div>
              <div className="text-center">
                <i className="fas fa-trophy text-3xl text-blue-600 mb-3"></i>
                <h4 className="font-semibold text-gray-800">At-Large Bids</h4>
                <p className="text-sm text-gray-600">Compete for at-large bowl and playoff berths</p>
              </div>
              <div className="text-center">
                <i className="fas fa-chart-line text-3xl text-blue-600 mb-3"></i>
                <h4 className="font-semibold text-gray-800">National Recognition</h4>
                <p className="text-sm text-gray-600">Build national brand without conference ties</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FBSIndependents;
