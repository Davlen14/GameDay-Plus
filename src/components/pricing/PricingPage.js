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
        
        /* Gray Gradients */
        --gray-metallic: linear-gradient(135deg, #6B7280 0%, #4B5563 10%, #374151 20%, #1F2937 30%, #6B7280 40%, #4B5563 50%, #374151 60%, #1F2937 70%, #6B7280 80%, #4B5563 90%, #374151 100%);
        --gray-chrome: linear-gradient(135deg, #9CA3AF 0%, #6B7280 15%, #4B5563 30%, #374151 45%, #1F2937 60%, #374151 75%, #4B5563 85%, #6B7280 95%, #9CA3AF 100%);
        
        /* Blue Gradients */
        --blue-metallic: linear-gradient(135deg, #3B82F6 0%, #2563EB 10%, #1D4ED8 20%, #1E40AF 30%, #3B82F6 40%, #2563EB 50%, #1D4ED8 60%, #1E40AF 70%, #3B82F6 80%, #2563EB 90%, #1D4ED8 100%);
        --blue-chrome: linear-gradient(135deg, #60A5FA 0%, #3B82F6 15%, #2563EB 30%, #1D4ED8 45%, #1E40AF 60%, #1D4ED8 75%, #2563EB 85%, #3B82F6 95%, #60A5FA 100%);
        
        /* Purple Gradients */
        --purple-metallic: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 10%, #6D28D9 20%, #5B21B6 30%, #8B5CF6 40%, #7C3AED 50%, #6D28D9 60%, #5B21B6 70%, #8B5CF6 80%, #7C3AED 90%, #6D28D9 100%);
        --purple-chrome: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 15%, #7C3AED 30%, #6D28D9 45%, #5B21B6 60%, #6D28D9 75%, #7C3AED 85%, #8B5CF6 95%, #A78BFA 100%);
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

      .gray-gradient {
        background: var(--gray-metallic);
        box-shadow: 
          0 4px 15px rgba(107, 114, 128, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }

      .blue-gradient {
        background: var(--blue-metallic);
        box-shadow: 
          0 4px 15px rgba(59, 130, 246, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }

      .purple-gradient {
        background: var(--purple-metallic);
        box-shadow: 
          0 4px 15px rgba(139, 92, 246, 0.4),
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

      .gray-text-gradient {
        background: var(--gray-chrome);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 1px 2px rgba(107, 114, 128, 0.3));
      }

      .blue-text-gradient {
        background: var(--blue-chrome);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 1px 2px rgba(59, 130, 246, 0.3));
      }

      .purple-text-gradient {
        background: var(--purple-chrome);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 1px 2px rgba(139, 92, 246, 0.3));
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
      gradientClass: 'gray-gradient',
      textGradientClass: 'gray-text-gradient',
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
      gradientClass: 'blue-gradient',
      textGradientClass: 'blue-text-gradient',
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
      gradientClass: 'purple-gradient',
      textGradientClass: 'purple-text-gradient',
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
    <div className={`relative tier-card rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl metallic-shine ${tier.popular ? 'ring-4 ring-purple-500 ring-opacity-50' : ''}`}>
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
      <div className="p-8">
        <div className="space-y-4 mb-8">
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
          className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 metallic-shine ${
            tier.id === 'free'
              ? 'gray-gradient text-white hover:opacity-90 shadow-lg'
              : tier.popular
              ? 'purple-gradient text-white hover:opacity-90 shadow-lg'
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
