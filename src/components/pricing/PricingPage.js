import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faArrowLeft, faArrowRight, faCrown, faStar, faRocket, faGem } from '@fortawesome/free-solid-svg-icons';

const PricingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      subtitle: 'Get Started',
      price: '$0',
      period: 'forever',
      icon: faStar,
      color: 'from-gray-400 to-gray-600',
      popular: false,
      features: [
        'Basic team stats',
        'Weekly game predictions',
        'Access to fan forums',
        'Basic news updates',
        'Mobile responsive design',
        'Community support'
      ],
      limitations: [
        'Limited to 5 predictions per week',
        'Basic analytics only',
        'No premium insights',
        'Standard support'
      ]
    },
    {
      id: 'juco',
      name: 'JUCO Division 3',
      subtitle: 'Base Tier',
      price: '$9.99',
      period: '/month',
      icon: faRocket,
      color: 'from-blue-500 to-blue-700',
      popular: false,
      features: [
        'Everything in Free',
        'Advanced team analytics',
        'Unlimited predictions',
        'Player performance metrics',
        'Injury reports & updates',
        'Coach performance analysis',
        'Historical data access',
        'Email support',
        'Ad-free experience'
      ],
      limitations: [
        'No betting insights',
        'Limited AI predictions',
        'Standard dashboard'
      ]
    },
    {
      id: 'division2',
      name: 'Division 2',
      subtitle: 'Professional',
      price: '$19.99',
      period: '/month',
      icon: faCrown,
      color: 'from-purple-500 to-purple-700',
      popular: true,
      features: [
        'Everything in JUCO Division 3',
        'AI-powered game predictions',
        'Advanced betting analytics',
        'Spread & over/under insights',
        'Arbitrage opportunities',
        'Real-time odds tracking',
        'Custom dashboards',
        'Priority support',
        'Early access to features',
        'Advanced player grades',
        'Transfer portal insights'
      ],
      limitations: [
        'Limited premium AI features',
        'Standard API access'
      ]
    },
    {
      id: 'division1',
      name: 'Division 1',
      subtitle: 'Elite Professional',
      price: '$39.99',
      period: '/month',
      icon: faGem,
      color: 'from-red-500 to-red-700',
      popular: false,
      features: [
        'Everything in Division 2',
        'GamedayGPT Pro with unlimited queries',
        'Advanced AI insights & predictions',
        'Professional betting models',
        'API access for integrations',
        'White-label dashboard options',
        'Dedicated account manager',
        '24/7 premium support',
        'Custom analytics reports',
        'Early insider information',
        'VIP forum access',
        'Mobile app priority features',
        'Data export capabilities'
      ],
      limitations: []
    }
  ];

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % tiers.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + tiers.length) % tiers.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSelectPlan = (tier) => {
    if (tier.id === 'free') {
      // Navigate to signup
      window.location.hash = 'login';
    } else {
      // Handle premium plan selection
      console.log(`Selected plan: ${tier.name}`);
      // Here you would integrate with your payment system
      alert(`Selected ${tier.name} plan! Payment integration coming soon.`);
    }
  };

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-red-600 via-red-700 to-red-900 bg-clip-text text-transparent">
              Choose Your GAMEDAY+ Experience
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From casual fans to professional analysts, we have the perfect tier for your college football needs. 
            Start free and upgrade as you grow!
          </p>
        </div>

        {/* Mobile Card Slider */}
        <div className="lg:hidden mb-8">
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faArrowRight} className="text-gray-700" />
            </button>

            {/* Card */}
            <div className="overflow-hidden px-8">
              <div 
                className={`transition-transform duration-300 ease-in-out ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                <div className="flex">
                  {tiers.map((tier, index) => (
                    <div key={tier.id} className="w-full flex-shrink-0 px-4">
                      <PricingCard tier={tier} onSelect={handleSelectPlan} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {tiers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-gradient-to-r from-red-600 to-red-700' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8">
          {tiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} onSelect={handleSelectPlan} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Need Help Choosing?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our team is here to help you find the perfect plan for your needs. 
            Contact us for personalized recommendations.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-bold shadow-lg">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

const PricingCard = ({ tier, onSelect }) => {
  return (
    <div className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${tier.popular ? 'ring-4 ring-purple-500 ring-opacity-50' : ''}`}>
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-purple-700 text-white text-center py-2 font-bold text-sm">
          MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div className={`p-8 bg-gradient-to-br ${tier.color} text-white ${tier.popular ? 'pt-12' : ''}`}>
        <div className="text-center">
          <FontAwesomeIcon icon={tier.icon} className="text-4xl mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
          <p className="text-sm opacity-90 mb-4">{tier.subtitle}</p>
          <div className="mb-4">
            <span className="text-4xl font-bold">{tier.price}</span>
            <span className="text-sm opacity-90">{tier.period}</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="p-8">
        <div className="space-y-4 mb-8">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>
          ))}
          
          {tier.limitations.length > 0 && (
            <>
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">Limitations:</h4>
                {tier.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-start space-x-3 mb-2">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-500 text-sm">{limitation}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onSelect(tier)}
          className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 ${
            tier.id === 'free'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : tier.popular
              ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 shadow-lg'
              : `bg-gradient-to-r ${tier.color} text-white hover:opacity-90 shadow-lg`
          }`}
        >
          {tier.id === 'free' ? 'Get Started Free' : `Choose ${tier.name}`}
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
