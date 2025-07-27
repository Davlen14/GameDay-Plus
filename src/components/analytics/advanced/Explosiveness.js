import React from 'react';
import '../../UI/ComingSoon.css';


const Explosiveness = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Explosiveness Analytics</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Big play rates, explosive runs and passes, and more.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-bolt text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Explosive play analytics and breakdowns for every team.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-running text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Explosive Runs</h3>
                <p className="text-gray-600">20+ yard rushes, breakaway rates</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-football-ball text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Explosive Passes</h3>
                <p className="text-gray-600">20+ yard completions, YAC</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-fire text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Big Play Rate</h3>
                <p className="text-gray-600">% of plays that are explosive</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-bar text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Team Explosiveness</h3>
                <p className="text-gray-600">Compare explosive play rates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explosiveness;
