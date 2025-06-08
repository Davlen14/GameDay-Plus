import React from 'react';

const Commitments = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Commitments</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest recruiting commitments and signing day updates
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-pen-fancy text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Track the latest recruiting commitments and national signing day updates.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-calendar text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Recent Commits</h3>
                <p className="text-gray-600">Latest commitment announcements</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-university text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">By School</h3>
                <p className="text-gray-600">Recruiting class breakdowns</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-star text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Top Targets</h3>
                <p className="text-gray-600">Most sought-after uncommitted players</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-bar text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Class Rankings</h3>
                <p className="text-gray-600">National and conference rankings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commitments;
