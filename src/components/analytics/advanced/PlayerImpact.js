import React from 'react';
import '../../UI/ComingSoon.css';

const PlayerImpact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Player Impact</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced player impact metrics and win probability added.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-user-shield text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Player value, clutch performance, and impact breakdowns.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-trophy text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Win Probability Added</h3>
                <p className="text-gray-600">Impact on game outcomes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-bolt text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Clutch Performance</h3>
                <p className="text-gray-600">Key plays in critical moments</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-users text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Player Grades</h3>
                <p className="text-gray-600">Overall and situational grades</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-bar text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Impact Metrics</h3>
                <p className="text-gray-600">EPA, WPA, and more</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerImpact;
