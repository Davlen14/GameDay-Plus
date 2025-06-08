import React from 'react';

const AIInsights = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">AI Insights</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI-generated insights and analysis for college football
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-lightbulb text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Discover hidden patterns and trends with our AI-powered insights engine.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-search text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Pattern Recognition</h3>
                <p className="text-gray-600">Identify trends and patterns in data</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-area text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Predictive Analytics</h3>
                <p className="text-gray-600">Future performance predictions</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-eye text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Hidden Insights</h3>
                <p className="text-gray-600">Discover non-obvious correlations</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-cogs text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Custom Analysis</h3>
                <p className="text-gray-600">Tailored insights for your needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
