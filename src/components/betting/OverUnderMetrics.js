import React from 'react';

const OverUnderMetrics = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Over/Under Metrics</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Total points analysis and over/under betting insights
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-balance-scale text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Comprehensive over/under analysis with scoring trends and weather factors.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-bar text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Scoring Trends</h3>
                <p className="text-gray-600">Analyze offensive and defensive patterns</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-cloud-rain text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Weather Impact</h3>
                <p className="text-gray-600">Weather-adjusted total predictions</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-clock text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Pace Analysis</h3>
                <p className="text-gray-600">Game pace and possession metrics</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-target text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Value Bets</h3>
                <p className="text-gray-600">Identify mispriced totals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverUnderMetrics;
