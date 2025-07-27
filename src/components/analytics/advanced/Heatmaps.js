import React from 'react';
import '../../UI/ComingSoon.css';

const Heatmaps = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Heatmaps</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Visualize player and team performance by field area and play type.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-thermometer-half text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Heatmaps for QBs, RBs, WRs, and more—see where the action happens.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-user text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">QB Heatmap</h3>
                <p className="text-gray-600">Passing zones and completion %</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-running text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">RB Heatmap</h3>
                <p className="text-gray-600">Rushing lanes and yards gained</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-football-ball text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">WR Heatmap</h3>
                <p className="text-gray-600">Target locations and catch rates</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-shield-alt text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Defense Heatmap</h3>
                <p className="text-gray-600">Tackles and coverage by area</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmaps;
