import React from 'react';

const TeamMetrics = () => {
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">Team Metrics</h1>
        <div className="bg-white rounded-xl p-12 shadow-lg">
          <i className="fas fa-chart-bar text-6xl icon-gradient mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8">
            Advanced team analytics including offensive/defensive efficiency, strength of schedule, and predictive metrics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Offensive Analytics</h3>
              <p className="text-gray-600">Yards per play, red zone efficiency, turnover metrics</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Defensive Analytics</h3>
              <p className="text-gray-600">Points allowed, third down defense, pressure rates</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Special Teams</h3>
              <p className="text-gray-600">Field goal percentage, punt returns, kickoff coverage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMetrics;
