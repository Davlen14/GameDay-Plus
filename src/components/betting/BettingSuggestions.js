import React from 'react';

const BettingSuggestions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Betting Suggestions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered betting recommendations and expert picks
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-lightbulb text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Get intelligent betting suggestions powered by advanced analytics and machine learning.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-brain text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
                <p className="text-gray-600">Machine learning-powered picks</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-star text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Confidence Ratings</h3>
                <p className="text-gray-600">Ranked by probability of success</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-trophy text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Track Record</h3>
                <p className="text-gray-600">Historical performance tracking</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-users text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Expert Analysis</h3>
                <p className="text-gray-600">Professional insights and reasoning</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingSuggestions;
