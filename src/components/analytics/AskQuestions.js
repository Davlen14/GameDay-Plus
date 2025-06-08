import React from 'react';

const AskQuestions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Ask Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive AI assistant for all your college football questions
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <i className="fas fa-question-circle text-6xl icon-gradient mb-4"></i>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Ask GamedayGPT anything about college football and get intelligent, data-driven answers.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-comments text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Natural Language</h3>
                <p className="text-gray-600">Ask questions in plain English</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-database text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Data-Driven</h3>
                <p className="text-gray-600">Answers backed by real statistics</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-bolt text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Instant Responses</h3>
                <p className="text-gray-600">Get answers in real-time</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <i className="fas fa-lightbulb text-3xl icon-gradient mb-3"></i>
                <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
                <p className="text-gray-600">Contextual analysis and explanations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestions;
