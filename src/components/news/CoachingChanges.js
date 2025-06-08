import React from 'react';

const CoachingChanges = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Coaching Changes</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest coaching hires, firings, and staff movement across college football
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-users-cog text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Stay updated on all coaching carousel movement and staff changes throughout college football.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-exchange-alt text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Recent Changes</h3>
                <p className="text-gray-600">Latest hiring and firing updates</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-search text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Coaching Search</h3>
                <p className="text-gray-600">Track active coaching searches</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-line text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Impact Analysis</h3>
                <p className="text-gray-600">How changes affect team performance</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-calendar text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Timeline</h3>
                <p className="text-gray-600">Chronological coaching movement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingChanges;
