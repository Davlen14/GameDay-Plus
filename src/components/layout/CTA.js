import React from 'react';

const CTA = () => {
  return (
    <section className="py-20 px-6 md:px-12 gradient-bg text-white rounded-t-3xl">
      <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Elevate Your Game?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of college football fans who rely on GAMEDAY+ for the most comprehensive insights available.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div 
            className="cta-button-elevated text-xl py-4 px-8 rounded-lg cursor-pointer"
            onClick={() => window.location.hash = 'home-page'}
          >
            <span className="cta-text">Start Free Trial</span>
          </div>
          <a href="#" className="border-2 border-white text-white hover:bg-white hover:text-red-600 transition duration-300 inline-block text-xl font-bold py-4 px-8 rounded-lg">
            View Pricing
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;
