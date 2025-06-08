import React from 'react';

const InjuryReports = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Injury Reports</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time injury updates and availability status for college football players
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-hospital text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Stay informed with comprehensive injury reports and player availability updates.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-heartbeat text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                <p className="text-gray-600">Live injury status tracking</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-pie text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Impact Analysis</h3>
                <p className="text-gray-600">How injuries affect team performance</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-calendar-alt text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Return Timeline</h3>
                <p className="text-gray-600">Expected recovery schedules</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-bell text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Notifications</h3>
                <p className="text-gray-600">Instant alerts for key players</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InjuryReports;
