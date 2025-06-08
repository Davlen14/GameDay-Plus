import React from 'react';

const GamedayGPT = () => {
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">GamedayGPT</h1>
        <div className="bg-white rounded-xl p-12 shadow-lg">
          <i className="fas fa-robot text-6xl icon-gradient mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered college football insights, predictions, and analysis powered by advanced machine learning.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Game Predictions</h3>
              <p className="text-gray-600">AI-powered outcome predictions with confidence intervals</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Ask Questions</h3>
              <p className="text-gray-600">Natural language queries about teams, players, and stats</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">AI Insights</h3>
              <p className="text-gray-600">Deep analysis and trends discovered by machine learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamedayGPT;
