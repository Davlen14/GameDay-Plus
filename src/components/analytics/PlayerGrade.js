import React from 'react';

const PlayerGrade = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Player Grade</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive player grading system with AI-powered analysis
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-star text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Our advanced grading system will provide detailed player evaluations and performance scores.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-medal text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Overall Grades</h3>
                <p className="text-gray-600">Comprehensive player performance scores</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-chart-pie text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Category Breakdown</h3>
                <p className="text-gray-600">Detailed skill-specific evaluations</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-trophy text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Performance Tracking</h3>
                <p className="text-gray-600">Season-long grade progression</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-balance-scale text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Comparison Tools</h3>
                <p className="text-gray-600">Compare players across positions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerGrade;
