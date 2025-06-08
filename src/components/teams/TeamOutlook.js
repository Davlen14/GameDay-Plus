import React from 'react';

const TeamOutlook = () => {
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">2025 Team Outlook</h1>
        <div className="bg-white rounded-xl p-12 shadow-lg">
          <i className="fas fa-chart-line text-6xl icon-gradient mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive 2025 season outlook for all college football teams with predictions and analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamOutlook;
