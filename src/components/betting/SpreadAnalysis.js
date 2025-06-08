import React from 'react';

const SpreadAnalysis = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Spread Analysis</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced point spread analysis and betting line insights
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-chart-area text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Comprehensive spread analysis with historical data and betting trends.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-line text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Line Movement</h3>
                <p className="text-gray-600">Track betting line changes over time</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-history text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Historical Performance</h3>
                <p className="text-gray-600">Against the spread statistics</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-bullseye text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Value Identification</h3>
                <p className="text-gray-600">Find favorable betting opportunities</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-balance-scale text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Market Analysis</h3>
                <p className="text-gray-600">Compare across sportsbooks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpreadAnalysis;
