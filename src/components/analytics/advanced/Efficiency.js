import React from 'react';
import '../../UI/ComingSoon.css';

const Efficiency = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Efficiency Analytics</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced efficiency metrics and breakdowns for teams and players.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-tachometer-alt text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Comprehensive efficiency analytics for deeper football insights.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-bolt text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Offensive Efficiency</h3>
                <p className="text-gray-600">Points per play, drive, and more</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-shield-alt text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Defensive Efficiency</h3>
                <p className="text-gray-600">Yards allowed, stops, and more</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-percentage text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Success Rate</h3>
                <p className="text-gray-600">Down-by-down success breakdowns</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-pie text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Situational Efficiency</h3>
                <p className="text-gray-600">Red zone, 3rd/4th down, and more</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Efficiency;
