import React from 'react';

const PlayerMetrics = () => {
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">Player Metrics</h1>
        <div className="bg-white rounded-xl p-12 shadow-lg">
          <i className="fas fa-running text-6xl icon-gradient mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8">
            Individual player statistics and performance metrics across all positions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerMetrics;
