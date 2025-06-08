import React from 'react';

const PredictOutcomes = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Predict Outcomes</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered game outcome predictions with confidence intervals
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-crystal-ball text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Get AI-generated predictions for upcoming games with detailed analysis and probability scores.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-percentage text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Win Probability</h3>
                <p className="text-gray-600">Detailed win percentage calculations</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-line text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Score Predictions</h3>
                <p className="text-gray-600">Expected final score ranges</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-brain text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-600">Machine learning insights</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-history text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Historical Context</h3>
                <p className="text-gray-600">Past matchup analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictOutcomes;
