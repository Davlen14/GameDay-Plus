import React from 'react';

const Analysis = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Analysis</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert video analysis and tactical breakdowns
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-chart-line text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              In-depth video analysis from college football experts and former coaches.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-clipboard-list text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Game Breakdowns</h3>
                <p className="text-gray-600">Tactical analysis of key games</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-eye text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Film Study</h3>
                <p className="text-gray-600">Detailed play-by-play analysis</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-users text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Expert Commentary</h3>
                <p className="text-gray-600">Professional insights and opinions</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-cogs text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Strategy Deep Dives</h3>
                <p className="text-gray-600">Coaching strategies explained</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
