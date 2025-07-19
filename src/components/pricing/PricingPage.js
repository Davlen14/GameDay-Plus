import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faArrowLeft, faArrowRight, faCrown, faStar, faRocket, faGem } from '@fortawesome/free-solid-svg-icons';

const PricingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Add custom styles for modern gradients
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --gameday-red: #C41E3A;
        --gameday-dark-red: #8B0000;
        --gameday-light-red: #FF6B6B;
        --gameday-glass: rgba(196, 30, 58, 0.1);
        --gameday-glass-hover: rgba(196, 30, 58, 0.2);
        --gameday-gradient: linear-gradient(135deg, #DC143C 0%, #B22222 25%, #8B0000 50%, #654321 75%, #DC143C 100%);
        --gameday-light-gradient: linear-gradient(135deg, rgba(220, 20, 60, 0.2) 0%, rgba(178, 34, 34, 0.15) 25%, rgba(139, 0, 0, 0.1) 50%, rgba(101, 67, 33, 0.05) 75%, rgba(220, 20, 60, 0.1) 100%);
        --gameday-metallic: linear-gradient(135deg, #FF4444 0%, #CC001C 10%, #AA0015 20%, #880011 30%, #FF2222 40%, #CC001C 50%, #AA0015 60%, #880011 70%, #FF4444 80%, #CC001C 90%, #AA0015 100%);
        --gameday-chrome: linear-gradient(135deg, #FF6B6B 0%, #DC143C 15%, #B22222 30%, #8B0000 45%, #654321 60%, #8B0000 75%, #B22222 85%, #DC143C 95%, #FF6B6B 100%);
        
        /* Gray/Silver Gradients */
        --silver-metallic: linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 10%, #9CA3AF 20%, #6B7280 30%, #E5E7EB 40%, #D1D5DB 50%, #9CA3AF 60%, #6B7280 70%, #E5E7EB 80%, #D1D5DB 90%, #9CA3AF 100%);
        --silver-chrome: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 15%, #D1D5DB 30%, #9CA3AF 45%, #6B7280 60%, #9CA3AF 75%, #D1D5DB 85%, #E5E7EB 95%, #F3F4F6 100%);
        
        /* Green Gradients */
        --green-metallic: linear-gradient(135deg, #10B981 0%, #059669 10%, #047857 20%, #065F46 30%, #10B981 40%, #059669 50%, #047857 60%, #065F46 70%, #10B981 80%, #059669 90%, #047857 100%);
        --green-chrome: linear-gradient(135deg, #34D399 0%, #10B981 15%, #059669 30%, #047857 45%, #065F46 60%, #047857 75%, #059669 85%, #10B981 95%, #34D399 100%);
        
        /* Gold Gradients */
        --gold-metallic: linear-gradient(135deg, #F59E0B 0%, #D97706 10%, #B45309 20%, #92400E 30%, #F59E0B 40%, #D97706 50%, #B45309 60%, #92400E 70%, #F59E0B 80%, #D97706 90%, #B45309 100%);
        --gold-chrome: linear-gradient(135deg, #FCD34D 0%, #F59E0B 15%, #D97706 30%, #B45309 45%, #92400E 60%, #B45309 75%, #D97706 85%, #F59E0B 95%, #FCD34D 100%);
      }

      body { 
        font-family: 'Orbitron', monospace;
        background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
        min-height: 100vh;
      }

      .pricing-gradient {
        background: var(--gameday-metallic);
        box-shadow: 
          0 4px 15px rgba(220, 20, 60, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }

      .silver-gradient {
        background: var(--silver-metallic);
        box-shadow: 
          0 4px 15px rgba(156, 163, 175, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }

      .green-gradient {
        background: var(--green-metallic);
        box-shadow: 
          0 4px 15px rgba(16, 185, 129, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }

      .gold-gradient {
        background: var(--gold-metallic);
        box-shadow: 
          0 4px 15px rgba(245, 158, 11, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }

      .pricing-text-gradient {
        background: var(--gameday-chrome);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 1px 2px rgba(220, 20, 60, 0.3));
      }

      .silver-text-gradient {
        background: var(--silver-chrome);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 1px 2px rgba(156, 163, 175, 0.3));
      }

      .green-text-gradient {
        background: var(--green-chrome);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 1px 2px rgba(16, 185, 129, 0.3));
      }

      .gold-text-gradient {
        background: var(--gold-chrome);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.3));
      }

      .pricing-glass {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(196, 30, 58, 0.1);
        box-shadow: 
          0 10px 30px rgba(196, 30, 58, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .tier-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .tier-card:hover {
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 
          0 15px 40px rgba(196, 30, 58, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transform: translateY(-3px);
      }

      .popular-badge {
        background: var(--gameday-metallic);
        animation: pulseGlow 3s ease-in-out infinite;
      }

      .metallic-shine {
        position: relative;
        overflow: hidden;
      }

      .metallic-shine::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: shine 3s infinite;
      }

      @keyframes shine {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        50% { transform: translateX(0) translateY(0) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
      }

      @keyframes pulseGlow {
        0%, 100% { 
          box-shadow: 
            0 0 20px rgba(196, 30, 58, 0.3),
            0 0 40px rgba(220, 20, 60, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        50% { 
          box-shadow: 
            0 0 40px rgba(196, 30, 58, 0.6),
            0 0 80px rgba(220, 20, 60, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
      }

      .feature-check {
        color: var(--gameday-red);
      }

      .floating-orb {
        position: absolute;
        border-radius: 50%;
        background: var(--gameday-light-gradient);
        filter: blur(40px);
        animation: float 6s ease-in-out infinite;
      }

      .floating-orb:nth-child(1) {
        width: 200px;
        height: 200px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }

      .floating-orb:nth-child(2) {
        width: 150px;
        height: 150px;
        top: 70%;
        right: 15%;
        animation-delay: 2s;
      }

      .floating-orb:nth-child(3) {
        width: 100px;
        height: 100px;
        top: 40%;
        right: 40%;
        animation-delay: 4s;
      }

      @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(20px, -20px) rotate(90deg); }
        50% { transform: translate(-10px, 20px) rotate(180deg); }
        75% { transform: translate(-20px, -10px) rotate(270deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      subtitle: 'Get Started',
      price: '$0',
      period: 'forever',
      icon: faStar,
      gradientClass: 'green-gradient',
      textGradientClass: 'green-text-gradient',
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
      name: 'Division 3',
      subtitle: 'Base Tier',
      price: '$9.99',
      period: '/month',
      icon: faRocket,
      gradientClass: 'green-gradient',
      textGradientClass: 'green-text-gradient',
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
      gradientClass: 'gold-gradient',
      textGradientClass: 'gold-text-gradient',
      popular: true,
      features: [
        'Everything in Division 2',
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
      gradientClass: 'pricing-gradient',
      textGradientClass: 'pricing-text-gradient',
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
    <div className="min-h-screen bg-white py-20 relative overflow-hidden">
      {/* Floating Background Orbs */}
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6">
            <span className="pricing-text-gradient">
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pricing-glass rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 pricing-glass rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-300"
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
                      ? 'pricing-gradient' 
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
        <div className="text-center mt-16 p-8 pricing-glass rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Need Help Choosing?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our team is here to help you find the perfect plan for your needs. 
            Contact us for personalized recommendations.
          </p>
          <button className="px-8 py-3 pricing-gradient text-white rounded-lg hover:opacity-90 transition-all duration-300 font-bold shadow-lg metallic-shine">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

const PricingCard = ({ tier, onSelect }) => {
  return (
    <div className={`relative tier-card rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl metallic-shine flex flex-col h-full ${tier.popular ? 'ring-4 ring-yellow-500 ring-opacity-50' : ''}`}>
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute top-0 left-0 right-0 popular-badge text-white text-center py-2 font-bold text-sm">
          MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div className={`p-8 ${tier.gradientClass} text-white ${tier.popular ? 'pt-12' : ''}`}>
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
      <div className="p-8 flex-grow flex flex-col">
        <div className="space-y-4 mb-8 flex-grow">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <FontAwesomeIcon icon={faCheck} className="feature-check mt-0.5 flex-shrink-0" />
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
          className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 metallic-shine mt-auto ${
            tier.id === 'free'
              ? 'silver-gradient text-white hover:opacity-90 shadow-lg'
              : tier.popular
              ? 'gold-gradient text-white hover:opacity-90 shadow-lg'
              : `${tier.gradientClass} text-white hover:opacity-90 shadow-lg`
          }`}
        >
          {tier.id === 'free' ? 'Get Started Free' : `Choose ${tier.name}`}
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
