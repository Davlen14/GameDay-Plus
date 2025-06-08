import React from 'react';

const TopProspects = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Top Prospects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Top college football prospects and recruiting rankings
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-star text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Discover the top college football prospects and rising stars to watch.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-list-ol text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Prospect Rankings</h3>
                <p className="text-gray-600">Top prospects by position and class</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-line text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Performance Tracking</h3>
                <p className="text-gray-600">Season statistics and highlights</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-eye text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Scout Reports</h3>
                <p className="text-gray-600">Professional evaluations and grades</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-trophy text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Draft Projection</h3>
                <p className="text-gray-600">NFL Draft position estimates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopProspects;
