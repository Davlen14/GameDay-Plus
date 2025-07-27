import React from 'react';
import '../../UI/ComingSoon.css';

const Situational = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold gradient-text mb-4">Situational Analytics</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Analytics for 3rd/4th down, red zone, and other key situations.
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <i className="fas fa-layer-group text-6xl icon-gradient mb-4"></i>
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
          <p className="text-lg text-gray-600 mb-6">
            Deep situational breakdowns for every team and player.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <i className="fas fa-stopwatch text-3xl icon-gradient mb-3"></i>
              <h3 className="text-xl font-semibold mb-2">3rd Down</h3>
              <p className="text-gray-600">Conversion rates and play types</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <i className="fas fa-flag-checkered text-3xl icon-gradient mb-3"></i>
              <h3 className="text-xl font-semibold mb-2">Red Zone</h3>
              <p className="text-gray-600">Efficiency and scoring rates</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <i className="fas fa-exclamation-triangle text-3xl icon-gradient mb-3"></i>
              <h3 className="text-xl font-semibold mb-2">Critical Situations</h3>
              <p className="text-gray-600">High-leverage play analysis</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <i className="fas fa-random text-3xl icon-gradient mb-3"></i>
              <h3 className="text-xl font-semibold mb-2">Special Teams</h3>
              <p className="text-gray-600">Key moments and outcomes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Situational;
