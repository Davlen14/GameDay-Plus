import React from 'react';

const ArbitrageEV = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Arbitrage EV</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expected value calculations and arbitrage opportunities
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-dollar-sign text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Advanced expected value calculations and arbitrage opportunity detection.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-calculator text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">EV Calculator</h3>
                <p className="text-gray-600">Real-time expected value calculations</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-exchange-alt text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Arbitrage Detection</h3>
                <p className="text-gray-600">Find guaranteed profit opportunities</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-pie text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Portfolio Management</h3>
                <p className="text-gray-600">Optimize your betting portfolio</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-bell text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Real-time Alerts</h3>
                <p className="text-gray-600">Instant notifications for opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArbitrageEV;
