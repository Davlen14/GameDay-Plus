import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faArrowLeft, faArrowRight, faCrown, faStar, faRocket, faGem, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const PricingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

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
        background: 
          radial-gradient(circle at 20% 20%, rgba(196, 30, 58, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(245, 158, 11, 0.03) 0%, transparent 50%),
          linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
        min-height: 100vh;
        position: relative;
      }

      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E") repeat;
        pointer-events: none;
        z-index: 1;
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
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.06),
          0 2px 8px rgba(0, 0, 0, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
      }

      .tier-card:hover {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(25px);
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.08),
          0 8px 24px rgba(0, 0, 0, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.95);
        transform: translateY(-8px) scale(1.02);
        border: 1px solid rgba(255, 255, 255, 0.9);
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

      /* Enhanced Glass Effects */
      .glass-content {
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(15px);
        border-top: 1px solid rgba(255, 255, 255, 0.6);
      }

      .glass-enhanced {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      .billing-toggle {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: 16px;
        padding: 6px;
        display: inline-flex;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.08),
          0 2px 8px rgba(0, 0, 0, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
        position: relative;
        overflow: hidden;
      }

      .billing-toggle::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, 
          rgba(196, 30, 58, 0.05) 0%, 
          rgba(16, 185, 129, 0.05) 50%, 
          rgba(245, 158, 11, 0.05) 100%);
        border-radius: 16px;
        z-index: -1;
      }

      .billing-option {
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 14px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 120px;
        text-align: center;
      }

      .billing-option.active {
        background: linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28));
        color: white;
        box-shadow: 
          0 4px 16px rgba(196, 30, 58, 0.4),
          0 2px 8px rgba(196, 30, 58, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      .billing-option.active::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: shine 3s infinite;
        pointer-events: none;
      }

      .billing-option:not(.active) {
        color: #6b7280;
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .billing-option:not(.active):hover {
        background: rgba(255, 255, 255, 0.8);
        color: #374151;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      /* Clean Header-Style Gradients */
      .clean-gradient-red {
        background: linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28));
      }

      .clean-gradient-silver {
        background: linear-gradient(135deg, rgb(156,163,175), rgb(107,114,128), rgb(75,85,99), rgb(107,114,128), rgb(156,163,175));
      }

      .clean-gradient-green {
        background: linear-gradient(135deg, rgb(16,185,129), rgb(5,150,105), rgb(4,120,87), rgb(5,150,105), rgb(16,185,129));
      }

      .clean-gradient-gold {
        background: linear-gradient(135deg, rgb(245,158,11), rgb(217,119,6), rgb(180,83,9), rgb(217,119,6), rgb(245,158,11));
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
      yearlyPrice: '$0',
      period: '/forever',
      icon: faStar,
      gradientClass: 'clean-gradient-silver',
      textGradientClass: 'silver-text-gradient',
      popular: false,
      trial: 'Always Free',
      features: [
        'Basic team stats & rankings',
        '5 game predictions per week',
        'Access to community forums',
        'Basic news updates',
        'Mobile responsive design',
        'Email support',
        'Weekly newsletter',
        'AP, Coaches, CFP rankings',
        'Conference standings',
        'Team schedules & scores',
        'Basic game highlights',
        'Fan prediction contests',
        'Social media feeds integration'
      ],
      allFeatures: [
        'Basic team stats & rankings',
        '5 game predictions per week',
        'Access to community forums',
        'Basic news updates',
        'Mobile responsive design',
        'Email support',
        'Weekly newsletter',
        'AP, Coaches, CFP rankings',
        'Conference standings',
        'Team schedules & scores',
        'Basic game highlights',
        'Fan prediction contests',
        'Social media feeds integration',
        'Basic player profiles',
        'Team comparison tool',
        'Recent game results',
        'Conference tournament brackets',
        'Bowl game predictions',
        'Season outlook summaries'
      ],
      limitations: [
        'Includes advertisements',
        'Limited predictions (5/week)',
        'Basic analytics only',
        'No betting insights',
        'Standard support only'
      ]
    },
    {
      id: 'juco',
      name: 'Division 3',
      subtitle: 'Base Premium',
      price: '$9.99',
      yearlyPrice: '$8.99',
      period: '/month',
      icon: faRocket,
      gradientClass: 'clean-gradient-green',
      textGradientClass: 'green-text-gradient',
      popular: false,
      trial: '7 days free',
      features: [
        'Everything in Free (ad-free)',
        'Unlimited game predictions',
        'Advanced team analytics',
        'Player performance metrics',
        'Injury reports & updates',
        'Coach performance analysis',
        'Historical data access (3 years)',
        'Priority email support',
        'Weekly prediction accuracy reports',
        'Basic recruiting insights'
      ],
      allFeatures: [
        'Everything in Free (ad-free)',
        'Unlimited game predictions',
        'Advanced team analytics',
        'Player performance metrics',
        'Injury reports & updates',
        'Coach performance analysis',
        'Historical data access (3 years)',
        'Priority email support (12hr response)',
        'Weekly prediction accuracy reports',
        'Basic recruiting insights',
        'Transfer portal tracking',
        'Team depth charts',
        'Advanced statistical models',
        'Weather impact analysis',
        'Home field advantage metrics',
        'Strength of schedule analysis',
        'Conference power rankings',
        'Player efficiency ratings',
        'Coaching staff analysis',
        'Team trend analysis',
        'Custom alert notifications',
        'Export basic data (CSV)',
        'Premium forum access',
        'Ad-free mobile experience',
        'Push notifications',
        'Offline data access',
        'Multi-device sync'
      ],
      limitations: [
        'No live betting odds',
        'Limited AI predictions',
        'Standard dashboard themes',
        'No API access'
      ]
    },
    {
      id: 'division2',
      name: 'Division 2',
      subtitle: 'Professional',
      price: '$19.99',
      yearlyPrice: '$16.99',
      period: '/month',
      icon: faCrown,
      gradientClass: 'clean-gradient-gold',
      textGradientClass: 'gold-text-gradient',
      popular: true,
      trial: '7 days free',
      features: [
        'Everything in Division 3',
        'AI-powered game predictions',
        'Live betting odds tracking',
        'Spread & over/under insights',
        'Arbitrage opportunities',
        'Real-time line movement alerts',
        'Custom prediction models',
        'Advanced analytics dashboard',
        'Transfer portal insights',
        'Recruiting database access'
      ],
      allFeatures: [
        'Everything in Division 3',
        'AI-powered game predictions',
        'Live betting odds tracking (15+ sportsbooks)',
        'Spread & over/under insights',
        'Arbitrage opportunities detection',
        'Real-time line movement alerts',
        'Custom prediction models',
        'Advanced analytics dashboard',
        'Transfer portal insights',
        'Recruiting database access',
        'Discord community access',
        'Weekly profit/loss tracking',
        'GamedayGPT AI Assistant (50 queries/day)',
        'Professional betting models',
        'Expected value calculations',
        'Sharp vs public money tracking',
        'Consensus betting data',
        'Weather-adjusted predictions',
        'Injury impact modeling',
        'Live game probability updates',
        'Bankroll management tools',
        'ROI performance tracking',
        'Multi-sportsbook comparison',
        'Line shopping recommendations',
        'Automated bet suggestions',
        'Risk assessment tools',
        'Hedge betting calculator',
        'Kelly criterion calculator',
        'Steam move detection',
        'Reverse line movement alerts',
        'Custom betting strategies',
        'Portfolio analytics',
        'Advanced data exports'
      ],
      limitations: [
        'Limited GamedayGPT queries (50/day)',
        'Standard API rate limits',
        'No white-label options'
      ]
    },
    {
      id: 'division1',
      name: 'Division 1',
      subtitle: 'Elite Professional',
      price: '$39.99',
      yearlyPrice: '$33.99',
      period: '/month',
      icon: faGem,
      gradientClass: 'clean-gradient-red',
      textGradientClass: 'pricing-text-gradient',
      popular: false,
      trial: '7 days free',
      features: [
        'Everything in Division 2',
        'GamedayGPT Pro (unlimited queries)',
        'Professional betting models',
        'Live game probability tracking',
        'API access for integrations',
        'White-label dashboard options',
        'Dedicated account manager',
        '24/7 priority support',
        'Custom analytics reports',
        'Early insider information'
      ],
      allFeatures: [
        'Everything in Division 2',
        'GamedayGPT Pro (unlimited queries)',
        'Professional betting models',
        'Live game probability tracking',
        'API access for integrations',
        'White-label dashboard options',
        'Dedicated account manager',
        '24/7 priority support',
        'Custom analytics reports',
        'Early insider information',
        'VIP forum access',
        'Mobile app beta features',
        'Data export capabilities (all formats)',
        'Sportsbook comparison tools',
        'Automated bet tracking',
        'Advanced machine learning models',
        'Ensemble prediction algorithms',
        'Real-time data streaming',
        'Custom dashboard creation',
        'Personalized betting strategies',
        'Institutional-grade analytics',
        'Professional research reports',
        'Direct analyst access',
        'Custom alert systems',
        'Advanced visualization tools',
        'Third-party integrations',
        'Webhook notifications',
        'Advanced backtesting tools',
        'Portfolio optimization',
        'Risk management suite',
        'Compliance reporting',
        'Data lake access',
        'Machine learning APIs',
        'Custom model training',
        'A/B testing framework',
        'Advanced attribution modeling',
        'Predictive injury analytics',
        'Recruiting prediction models',
        'Transfer portal predictions',
        'Coaching change impact analysis',
        'Media sentiment analysis',
        'Social media monitoring',
        'Insider trading detection',
        'Market manipulation alerts'
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
      
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-4">
            <span className="pricing-text-gradient">
              The Smart Side of Saturday.
            </span>
          </h1>
          <p className="text-2xl font-bold text-green-500 mb-8">
            Get 7 days on us.
          </p>
          
          {/* Billing Toggle */}
          <div className="billing-toggle mb-8">
            <div 
              className={`billing-option ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </div>
            <div 
              className={`billing-option ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="text-green-500 text-sm ml-2">Save 15%</span>
            </div>
          </div>
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
                      <PricingCard tier={tier} onSelect={handleSelectPlan} billingCycle={billingCycle} />
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
        <div className="hidden lg:grid lg:grid-cols-4 gap-6 w-full">
          {tiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} onSelect={handleSelectPlan} billingCycle={billingCycle} />
          ))}
        </div>

        {/* Value Proposition Section */}
        <div className="mt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="pricing-text-gradient">Why Choose GAMEDAY+ FanHub?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're the only platform that combines the analytics of PFF, the arbitrage detection of OddsJam, 
              the community of Reddit, and the coverage of ESPN into one comprehensive college football ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 pricing-glass rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full clean-gradient-red flex items-center justify-center">
                <i className="fas fa-dollar-sign text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">Unmatched Value</h3>
              <p className="text-gray-600 mb-4">
                Our Division 2 tier ($19.99) includes arbitrage detection that OddsJam charges $79-199/month for, 
                plus comprehensive college football coverage competitors don't offer.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Save 60-75%</strong> vs buying separate tools
              </div>
            </div>

            <div className="text-center p-8 pricing-glass rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full clean-gradient-gold flex items-center justify-center">
                <i className="fas fa-brain text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">AI-Powered Intelligence</h3>
              <p className="text-gray-600 mb-4">
                GamedayGPT is the only AI assistant specifically trained on college football data. 
                No other platform offers natural language queries for college football analytics.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Exclusive Feature</strong> - Not available anywhere else
              </div>
            </div>

            <div className="text-center p-8 pricing-glass rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full clean-gradient-green flex items-center justify-center">
                <i className="fas fa-mobile-alt text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">Mobile-First Design</h3>
              <p className="text-gray-600 mb-4">
                Our completed mobile app provides full platform access while competitors charge extra 
                for mobile features or lack mobile apps entirely.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Mobile App Included</strong> in all paid tiers
              </div>
            </div>
          </div>
        </div>

        {/* Competitive Comparison Table */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">
              <span className="pricing-text-gradient">How We Compare</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See why GAMEDAY+ FanHub offers more value than any competitor in the college football space.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full pricing-glass rounded-2xl p-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-bold text-gray-800">Features</th>
                    <th className="text-center py-4 px-4 font-bold">
                      <div className="flex flex-col items-center space-y-2">
                        <img src="/GDPLUS.png" alt="GAMEDAY+" className="w-16 h-16 rounded-xl object-contain bg-white p-2" />
                        <span className="pricing-text-gradient">GAMEDAY+</span>
                        <span className="text-xs text-gray-500">$19.99/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 font-bold text-gray-600">
                      <div className="flex flex-col items-center space-y-2">
                        <img src="/oddsjam.jpg" alt="OddsJam" className="w-12 h-12 rounded-xl object-contain bg-white p-2" />
                        <span>OddsJam</span>
                        <span className="text-xs text-gray-500">$79/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 font-bold text-gray-600">
                      <div className="flex flex-col items-center space-y-2">
                        <img src="/espn-logo.png" alt="ESPN+" className="w-20 h-20 rounded-lg object-contain bg-white p-2" />
                        <span>ESPN+</span>
                        <span className="text-xs text-gray-500">$10.99/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 font-bold text-gray-600">
                      <div className="flex flex-col items-center space-y-2">
                        <img src="/247SportsCompanyLogo.png" alt="247Sports" className="w-20 h-20 rounded-lg object-contain bg-white p-2" />
                        <span>247Sports</span>
                        <span className="text-xs text-gray-500">$9.95/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 font-bold text-gray-600">
                      <div className="flex flex-col items-center space-y-2">
                        <img src="/Pff.jpg" alt="PFF" className="w-20 h-20 rounded-lg object-contain bg-white p-2" />
                        <span>PFF</span>
                        <span className="text-xs text-gray-500">$39.99/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 font-bold text-gray-600">
                      <div className="flex flex-col items-center space-y-2">
                        <img src="/action-logo.png" alt="Action Network" className="w-20 h-20 rounded-lg object-contain bg-white p-2" />
                        <span>Action Network</span>
                        <span className="text-xs text-gray-500">$39/mo</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">Arbitrage Detection</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">AI-Powered Predictions</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">College Football Specialization</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">Live Betting Odds</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">Fan Community & Forums</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">Transfer Portal Tracking</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">Recruiting Database</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">Advanced Analytics</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">Mobile App Included</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-yellow-500">~</span></td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-6 font-medium">Weather Impact Analysis</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 font-medium">GamedayGPT AI Assistant</td>
                    <td className="text-center py-3 px-4"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                    <td className="text-center py-3 px-4"><span className="text-red-500">✗</span></td>
                  </tr>
                </tbody>
              </table>
              
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-8 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-600">Full Feature</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500 font-bold">~</span>
                    <span className="text-gray-600">Limited/Basic</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-600">Not Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unique Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">
              <span className="pricing-text-gradient">Exclusive Features Nobody Else Has</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These game-changing features are only available on GAMEDAY+ FanHub.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 pricing-glass rounded-xl">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full clean-gradient-red flex items-center justify-center">
                <i className="fas fa-robot text-white"></i>
              </div>
              <h3 className="font-bold mb-2 gradient-text">GamedayGPT</h3>
              <p className="text-sm text-gray-600">AI assistant trained specifically on college football data</p>
            </div>

            <div className="text-center p-6 pricing-glass rounded-xl">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full clean-gradient-gold flex items-center justify-center">
                <i className="fas fa-exchange-alt text-white"></i>
              </div>
              <h3 className="font-bold mb-2 gradient-text">CFB Arbitrage</h3>
              <p className="text-sm text-gray-600">College football specific arbitrage detection across 15+ sportsbooks</p>
            </div>

            <div className="text-center p-6 pricing-glass rounded-xl">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full clean-gradient-green flex items-center justify-center">
                <i className="fas fa-cloud-rain text-white"></i>
              </div>
              <h3 className="font-bold mb-2 gradient-text">Weather Analytics</h3>
              <p className="text-sm text-gray-600">Advanced weather impact modeling for game predictions</p>
            </div>

            <div className="text-center p-6 pricing-glass rounded-xl">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full clean-gradient-silver flex items-center justify-center">
                <i className="fas fa-users text-white"></i>
              </div>
              <h3 className="font-bold mb-2 gradient-text">The Colosseum</h3>
              <p className="text-sm text-gray-600">Advanced fan engagement platform with prediction contests</p>
            </div>
          </div>
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
          <button className="px-8 py-3 clean-gradient-red text-white rounded-lg hover:opacity-90 transition-all duration-300 font-bold shadow-lg">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

const PricingCard = ({ tier, onSelect, billingCycle }) => {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const currentPrice = billingCycle === 'yearly' ? tier.yearlyPrice : tier.price;
  const originalPrice = tier.price;
  
  const displayFeatures = showAllFeatures ? tier.allFeatures : tier.features.slice(0, 8);
  const remainingFeatures = tier.allFeatures ? tier.allFeatures.length - 8 : tier.features.length - 8;
  
  return (
    <div className={`relative tier-card rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl metallic-shine flex flex-col h-full glass-enhanced ${tier.popular ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''}`}>
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute top-0 left-0 right-0 popular-badge text-white text-center py-2 font-bold text-sm">
          MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div className={`p-6 ${tier.gradientClass} text-white ${tier.popular ? 'pt-10' : ''}`}>
        <div className="text-center">
          <FontAwesomeIcon icon={tier.icon} className="text-3xl mb-3 opacity-90" />
          <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
          <p className="text-xs opacity-90 mb-3">{tier.subtitle}</p>
          <div className="mb-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold">{currentPrice}</span>
              {billingCycle === 'yearly' && currentPrice !== originalPrice && (
                <span className="text-sm opacity-70 line-through">{originalPrice}</span>
              )}
            </div>
            <span className="text-xs opacity-90">{tier.period}</span>
          </div>
          <div className="text-xs font-semibold bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">
            {tier.trial}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="p-6 flex-grow flex flex-col glass-content">
        <div className="space-y-3 mb-6 flex-grow">
          {displayFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-2">
              <FontAwesomeIcon icon={faCheck} className="feature-check mt-0.5 flex-shrink-0 text-sm text-green-600" />
              <span className="text-gray-700 text-xs leading-relaxed">{feature}</span>
            </div>
          ))}
          
          {/* Show More/Less Button */}
          {tier.allFeatures && tier.allFeatures.length > 8 && (
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="flex items-center space-x-2 text-xs font-medium transition-colors mt-2"
            >
              <span className={tier.textGradientClass}>
                {showAllFeatures ? 'Show Less' : `+${remainingFeatures} More Features`}
              </span>
              <FontAwesomeIcon 
                icon={showAllFeatures ? 'fa-chevron-up' : 'fa-chevron-down'} 
                className={`text-xs transform transition-transform duration-200 ${tier.textGradientClass}`}
              />
            </button>
          )}
          
          {tier.limitations.length > 0 && (
            <>
              <div className="border-t pt-3 mt-3">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">Limitations:</h4>
                {tier.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-start space-x-2 mb-1">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0 text-xs">•</span>
                    <span className="text-gray-500 text-xs">{limitation}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onSelect(tier)}
          className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 mt-auto text-white hover:opacity-90 shadow-lg text-sm ${
            tier.id === 'free'
              ? 'clean-gradient-silver'
              : tier.id === 'juco'
              ? 'clean-gradient-green'
              : tier.popular
              ? 'clean-gradient-gold'
              : 'clean-gradient-red'
          }`}
        >
          {tier.id === 'free' ? 'Get Started Free' : `Try ${tier.trial}`}
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
