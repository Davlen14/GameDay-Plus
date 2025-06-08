import React from 'react';

const BettingModels = () => {
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">Betting Models</h1>
        <div className="bg-white rounded-xl p-12 shadow-lg">
          <i className="fas fa-chart-line text-6xl icon-gradient mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8">
            Advanced betting models with expected value calculations and line movement analysis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Expected Value</h3>
              <p className="text-gray-600">Calculate EV for spreads, totals, and moneylines</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2 gradient-text">Line Movement</h3>
              <p className="text-gray-600">Track and analyze betting line changes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingModels;
