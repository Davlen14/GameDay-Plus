import React from 'react';

const Features = () => {
  return (
    <section id="features" className="py-20 px-6 md:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Platform Modules</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive modules delivering unparalleled college football intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Teams & Conferences */}
          <div className="feature-card rounded-xl p-8 text-center" data-aos="fade-up" data-aos-delay="100">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <i className="fas fa-users icon-gradient text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Teams & Conferences</h3>
            <p className="text-gray-600 mb-6">Complete team profiles, conference standings, and 2025 outlook for all FBS programs.</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• All 130+ FBS Teams</li>
              <li>• Conference Breakdowns</li>
              <li>• 2025 Team Outlook</li>
            </ul>
          </div>

          {/* Analytics */}
          <div className="feature-card rounded-xl p-8 text-center" data-aos="fade-up" data-aos-delay="200">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <i className="fas fa-chart-line icon-gradient text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Advanced Analytics</h3>
            <p className="text-gray-600 mb-6">Deep statistical analysis with integrated GamedayGPT AI assistance.</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Team & Player Metrics</li>
              <li>• GamedayGPT AI Insights</li>
              <li>• Predictive Analytics</li>
            </ul>
          </div>

          {/* Betting */}
          <div className="feature-card rounded-xl p-8 text-center" data-aos="fade-up" data-aos-delay="300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <i className="fas fa-chart-bar icon-gradient text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Betting Intelligence</h3>
            <p className="text-gray-600 mb-6">Advanced betting models, spread analysis, and arbitrage opportunities.</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Betting Models & EV</li>
              <li>• Spread Analysis</li>
              <li>• Arbitrage Detection</li>
            </ul>
          </div>

          {/* News & Media */}
          <div className="feature-card rounded-xl p-8 text-center" data-aos="fade-up" data-aos-delay="400">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <i className="fas fa-newspaper icon-gradient text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">News & Media</h3>
            <p className="text-gray-600 mb-6">Real-time updates, video content, and comprehensive media coverage.</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Breaking News & Updates</li>
              <li>• Video Highlights</li>
              <li>• Press Conferences</li>
            </ul>
          </div>

          {/* FanHub */}
          <div className="feature-card rounded-xl p-8 text-center" data-aos="fade-up" data-aos-delay="500">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <i className="fas fa-comments icon-gradient text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">FanHub</h3>
            <p className="text-gray-600 mb-6">Connect with fellow fans through forums, predictions, and social features.</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Fan Forums</li>
              <li>• Predictions & Polls</li>
              <li>• Social Feed</li>
            </ul>
          </div>

          {/* Premium Features */}
          <div className="feature-card rounded-xl p-8 text-center" data-aos="fade-up" data-aos-delay="600">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <i className="fas fa-crown icon-gradient text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Premium Access</h3>
            <p className="text-gray-600 mb-6">Exclusive features and advanced tools for serious college football fans.</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Advanced Filtering</li>
              <li>• Custom Alerts</li>
              <li>• Priority Support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
