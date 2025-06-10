import React, { useState, useEffect } from 'react';

const GamePredictor = () => {
  const [animateShine, setAnimateShine] = useState(false);

  useEffect(() => {
    setAnimateShine(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center ${animateShine ? 'metallic-3d-logo-enhanced' : ''}`}>
              <i className="fas fa-brain text-3xl icon-gradient"></i>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Game Predictor</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered predictions using machine learning algorithms and comprehensive statistical analysis.
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12" data-aos="fade-up" data-aos-delay="200">
          <div className="relative p-12 text-white gradient-bg">
            {/* Tech Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-12 h-full">
                {[...Array(144)].map((_, i) => (
                  <div key={i} className="border border-white border-opacity-20"></div>
                ))}
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 left-10 w-4 h-4 bg-white rounded-full opacity-30 animate-float"></div>
              <div className="absolute top-32 right-20 w-6 h-6 bg-white rounded-full opacity-20 animate-float-delayed"></div>
              <div className="absolute bottom-32 left-20 w-3 h-3 bg-white rounded-full opacity-40 animate-float"></div>
              <div className="absolute bottom-20 right-32 w-5 h-5 bg-white rounded-full opacity-25 animate-float-delayed"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-8">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-brain text-4xl text-white"></i>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">AI-Powered Predictions</h2>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Next-Generation Game Prediction Engine
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-chart-bar text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Statistical Analysis</h3>
                  <p className="text-sm opacity-80">Deep statistical modeling</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-robot text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Machine Learning</h3>
                  <p className="text-sm opacity-80">Advanced AI algorithms</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                  <i className="fas fa-target text-3xl mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Accuracy Metrics</h3>
                  <p className="text-sm opacity-80">Proven prediction success</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Matchup Predictor */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="300">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 metallic-3d-logo gradient-bg">
              <i className="fas fa-vs text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Matchup Predictor</h3>
            <p className="text-gray-600 mb-6">
              Compare any two teams with detailed win probability analysis, key matchups, and statistical advantages.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Win probability calculation
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Head-to-head comparisons
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Key player matchups
              </div>
            </div>
          </div>

          {/* Weekly Predictions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="400">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 metallic-3d-logo gradient-bg">
              <i className="fas fa-calendar-week text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Weekly Predictions</h3>
            <p className="text-gray-600 mb-6">
              Complete weekly slate predictions with confidence intervals, upset alerts, and game-by-game analysis.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Full week predictions
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Upset probability alerts
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Confidence scoring
              </div>
            </div>
          </div>

          {/* Advanced Models */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="500">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 metallic-3d-logo gradient-bg">
              <i className="fas fa-cogs text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Advanced Models</h3>
            <p className="text-gray-600 mb-6">
              Multiple prediction models including Elo ratings, efficiency metrics, and proprietary algorithms.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Multiple model ensemble
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Elo rating system
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                Efficiency-based metrics
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Accuracy Section */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-16" data-aos="fade-up" data-aos-delay="600">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 gradient-text">Prediction Accuracy</h2>
            <p className="text-gray-600 text-lg">Our models consistently outperform traditional prediction methods</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">85%</div>
              <div className="text-gray-600">Overall Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">92%</div>
              <div className="text-gray-600">Top 25 Games</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">78%</div>
              <div className="text-gray-600">Upset Detection</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">94%</div>
              <div className="text-gray-600">Conference Games</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="700">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <h2 className="text-3xl font-bold mb-4 gradient-text">Revolutionary Predictions</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the future of college football predictions with our advanced AI models. 
              Get early access when we launch!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="gradient-bg text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                <i className="fas fa-rocket mr-2"></i>
                Join Beta Program
              </button>
              <button className="border-2 gradient-text px-8 py-4 rounded-xl font-bold text-lg hover:gradient-bg hover:text-white transform hover:-translate-y-1 transition-all duration-300" style={{borderColor: 'rgb(204,0,28)'}}>
                <i className="fas fa-chart-line mr-2"></i>
                View Sample Predictions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePredictor;
