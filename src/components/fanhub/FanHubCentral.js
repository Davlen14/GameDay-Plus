import React, { useState, useEffect, lazy, Suspense } from 'react';
import InteractiveForumPost from './InteractiveForumPost';
import MainForumSection from './MainForumSection';

// Lazy load tab components for better performance
const TheColosseum = lazy(() => import('./TheColosseum'));
const FanProphecy = lazy(() => import('./FanProphecy'));
const SocialFeed = lazy(() => import('./SocialFeed'));
const FanStats = lazy(() => import('./FanStats'));
const Polls = lazy(() => import('./Polls'));

const FanHubCentral = () => {
  // Professional gradient system matching other FanHub components
  const professionalGradients = {
    red: 'linear-gradient(135deg, #ff2e4a 0%, #cc001c 25%, #a10014 50%, #cc001c 75%, #ff2e4a 100%)',
    blue: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 25%, #1557b0 50%, #1a73e8 75%, #4285f4 100%)',
    green: 'linear-gradient(135deg, #00d084 0%, #00b368 25%, #00965a 50%, #00b368 75%, #00d084 100%)',
    gold: 'linear-gradient(135deg, #ffd700 0%, #ffb300 25%, #ff8c00 50%, #ffb300 75%, #ffd700 100%)',
    purple: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 25%, #6d28d9 50%, #7c3aed 75%, #9333ea 100%)',
    orange: 'linear-gradient(135deg, #ff7f50 0%, #ff6347 25%, #ff4500 50%, #ff6347 75%, #ff7f50 100%)',
    slate: 'linear-gradient(135deg, #475569 0%, #334155 25%, #1e293b 50%, #334155 75%, #475569 100%)'
  };

  // Tab system state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Tabs configuration
  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'fa-home',
      description: 'Your personal fan hub overview'
    },
    {
      id: 'colosseum',
      name: 'The Colosseum',
      icon: 'fa-landmark',
      description: 'Forums & discussions'
    },
    {
      id: 'prophecy',
      name: 'Fan Prophecy',
      icon: 'fa-crystal-ball',
      description: 'Predictions & competitions'
    },
    {
      id: 'social',
      name: 'Social Feed',
      icon: 'fa-stream',
      description: 'Live fan activity'
    },
    {
      id: 'myteams',
      name: 'My Teams',
      icon: 'fa-heart',
      description: 'Your favorite teams'
    },
    {
      id: 'tailgate',
      name: 'Tailgate',
      icon: 'fa-fire',
      description: 'Game day meetups'
    },
    {
      id: 'polls',
      name: 'Polls',
      icon: 'fa-poll',
      description: 'Community voting'
    },
    {
      id: 'stats',
      name: 'Fan Stats',
      icon: 'fa-chart-line',
      description: 'Your achievements'
    }
  ];

  // User photos for avatars
  const userPhotos = [
    '/SportsbookLogos/Wedding.jpg',
    '/SportsbookLogos/Mclovin.jpg',
    '/SportsbookLogos/Nick.jpg',
    '/SportsbookLogos/NY.jpg',
    '/SportsbookLogos/SB.jpg',
    '/SportsbookLogos/CLE.jpg'
  ];

  const glassEffect = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  // Handle tab scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to top when switching tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading component for lazy-loaded tabs
  const TabLoadingSpinner = () => (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center space-y-4">
        <div 
          className="w-12 h-12 rounded-full animate-spin"
          style={{
            background: `conic-gradient(from 0deg, ${professionalGradients.red}, transparent, ${professionalGradients.red})`,
            mask: 'radial-gradient(circle at center, transparent 40%, black 41%)'
          }}
        ></div>
        <p className="text-gray-600 font-medium">Loading fan content...</p>
      </div>
    </div>
  );

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardContent 
            professionalGradients={professionalGradients}
          />
        );
      case 'colosseum':
        return (
          <ColosseumTabContent 
            userPhotos={userPhotos}
            professionalGradients={professionalGradients}
            setSelectedPost={setSelectedPost}
            setShowInteractivePost={setShowInteractivePost}
            setShowMainForum={setShowMainForum}
          />
        );
      case 'prophecy':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <FanProphecy />
          </Suspense>
        );
      case 'social':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <SocialFeed />
          </Suspense>
        );
      case 'myteams':
        return (
          <MyTeamsContent 
            professionalGradients={professionalGradients}
          />
        );
      case 'tailgate':
        return (
          <TailgateContent 
            professionalGradients={professionalGradients}
          />
        );
      case 'polls':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <Polls />
          </Suspense>
        );
      case 'stats':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <FanStats />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const [userStats, setUserStats] = useState({
    level: 'Expert',
    points: 2840,
    streak: 7,
    achievements: 12,
    discussions: 34,
    predictions: 89,
    accuracy: 73.2
  });

  const [recentActivity, setRecentActivity] = useState([
    { 
      id: 1, 
      type: 'prediction', 
      title: 'Correctly predicted Alabama vs Georgia', 
      points: 150, 
      time: '2 hours ago', 
      icon: 'fa-crystal-ball',
      photo: userPhotos[0],
      color: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
      shadowColor: 'rgba(34, 197, 94, 0.3)'
    },
    { 
      id: 2, 
      type: 'discussion', 
      title: 'Started debate in Rivalry Corner', 
      points: 25, 
      time: '4 hours ago', 
      icon: 'fa-comments',
      photo: userPhotos[1],
      color: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))',
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    { 
      id: 3, 
      type: 'achievement', 
      title: 'Unlocked "Prophet" badge', 
      points: 500, 
      time: '1 day ago', 
      icon: 'fa-trophy',
      photo: userPhotos[2],
      color: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
      shadowColor: 'rgba(245, 158, 11, 0.3)'
    },
    { 
      id: 4, 
      type: 'prediction', 
      title: 'Joined CFP Bracket Challenge', 
      points: 0, 
      time: '2 days ago', 
      icon: 'fa-users',
      photo: userPhotos[3],
      color: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206))',
      shadowColor: 'rgba(147, 51, 234, 0.3)'
    }
  ]);

  const [favoritePredictions, setFavoritePredictions] = useState([
    { 
      id: 1, 
      title: 'Weekly Gauntlet', 
      participants: 15847, 
      prize: '500 Fan Points', 
      timeLeft: '2d 14h', 
      progress: 60,
      color: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))',
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    { 
      id: 2, 
      title: 'Upset Alert', 
      participants: 8234, 
      prize: '1000 Fan Points', 
      timeLeft: '4d 22h', 
      progress: 40,
      color: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
      shadowColor: 'rgba(245, 158, 11, 0.3)'
    },
    { 
      id: 3, 
      title: 'Playoff Prophet', 
      participants: 45678, 
      prize: 'Season Champion Title', 
      timeLeft: '1w 3d', 
      progress: 80,
      color: professionalGradients.red,
      shadowColor: 'rgba(255, 46, 74, 0.3)'
    }
  ]);

  const [hotDiscussions, setHotDiscussions] = useState([
    { 
      id: 1, 
      title: 'Alabama vs Georgia: Who has the better defense?', 
      section: 'Rivalry Corner', 
      replies: 234, 
      heat: 'fire',
      photo: userPhotos[4],
      color: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))',
      shadowColor: 'rgba(239, 68, 68, 0.3)'
    },
    { 
      id: 2, 
      title: '5-star QB just entered the portal...', 
      section: 'Recruiting Hub', 
      replies: 189, 
      heat: 'hot',
      photo: userPhotos[5],
      color: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
      shadowColor: 'rgba(245, 158, 11, 0.3)'
    },
    { 
      id: 3, 
      title: 'CFP rankings are out - thoughts?', 
      section: 'Main Plaza', 
      replies: 156, 
      heat: 'trending',
      photo: userPhotos[0],
      color: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
      shadowColor: 'rgba(34, 197, 94, 0.3)'
    }
  ]);

  const [showInteractivePost, setShowInteractivePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMainForum, setShowMainForum] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)' }}>
      {/* Hero Header */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 46, 74, 0.05), transparent, rgba(255, 46, 74, 0.05))'
          }}
        ></div>
        <div className="relative w-full px-6 py-20" style={{ width: '97%', margin: '0 auto' }}>
          <div className="text-center">
            <h1 className="text-6xl font-extrabold mb-6">
              <span 
                style={{
                  background: professionalGradients.red,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                FANHUB CENTRAL
              </span>
            </h1>
            <p 
              className="text-xl max-w-3xl mx-auto mb-8"
              style={{
                color: 'rgba(55, 65, 81, 0.8)',
                textShadow: 'none'
              }}
            >
              Your personal command center for all GAMEDAY+ fan activities
            </p>
            
            {/* Enhanced Quick Stats Bar */}
            <div className="flex justify-center items-center space-x-8 text-sm font-medium mb-6">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30" style={{ color: 'rgb(55, 65, 81)' }}>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>Level {userStats.level}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30" style={{ color: 'rgb(55, 65, 81)' }}>
                <i className="fas fa-trophy text-yellow-500"></i>
                <span>{userStats.points.toLocaleString()} Points</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30" style={{ color: 'rgb(55, 65, 81)' }}>
                <i className="fas fa-fire text-orange-500"></i>
                <span>{userStats.streak} Day Streak</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30" style={{ color: 'rgb(55, 65, 81)' }}>
                <i className="fas fa-bullseye text-blue-500"></i>
                <span>{userStats.accuracy}% Accuracy</span>
              </div>
            </div>
            
            {/* Featured User Photo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-gray-300 border-opacity-50 shadow-lg">
                <img 
                  src={userPhotos[Math.floor(Math.random() * userPhotos.length)]} 
                  alt="Featured User" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-200" style={{ display: 'none' }}>
                  <i className="fas fa-user"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div 
        className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'}`}
        style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}
      >
        <div className="w-full" style={{ width: '97%', margin: '0 auto' }}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 group ${
                    activeTab === tab.id 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  style={{
                    background: activeTab === tab.id ? professionalGradients.red : 'transparent'
                  }}
                >
                  <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}></i>
                  <span className="hidden sm:inline">{tab.name}</span>
                  {activeTab === tab.id && (
                    <div 
                      className="absolute inset-0 rounded-lg opacity-20"
                      style={{
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.3), transparent)',
                        pointerEvents: 'none'
                      }}
                    ></div>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>1,247 fans online</span>
              </div>
              <button 
                className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                style={{
                  background: professionalGradients.red,
                  boxShadow: '0 4px 15px rgba(255, 46, 74, 0.3)'
                }}
                onClick={() => handleTabChange('colosseum')}
              >
                <i className="fas fa-plus"></i>
                <span>Start Discussion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full" style={{ width: '97%', margin: '0 auto' }}>
        <div className="transition-all duration-300">
          {renderTabContent()}
        </div>
      </div>

      {/* Interactive Forum Modal */}
      {showInteractivePost && selectedPost && (
        <InteractiveForumPost 
          post={selectedPost}
          onClose={() => {
            setShowInteractivePost(false);
            setSelectedPost(null);
          }}
        />
      )}

      {/* Main Forum Section */}
      {showMainForum && (
        <MainForumSection 
          onClose={() => setShowMainForum(false)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .tab-content {
          animation: fadeIn 0.3s ease-out;
        }
        
        .tab-enter {
          opacity: 0;
          transform: translateX(10px);
        }
        
        .tab-enter-active {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 300ms, transform 300ms;
        }
        
        .tab-exit {
          opacity: 1;
        }
        
        .tab-exit-active {
          opacity: 0;
          transition: opacity 300ms;
        }
      `}</style>
    </div>
  );
};

// Complete Colosseum Tab Content with ALL original functionality
const ColosseumTabContent = ({ 
  userPhotos,
  professionalGradients,
  setSelectedPost,
  setShowInteractivePost,
  setShowMainForum
}) => {
  const [activeStadium, setActiveStadium] = useState('main');
  const [fanCount, setFanCount] = useState(1247);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);

  // Modern theme colors - matching your original sophisticated system
  const metallicGradient = `linear-gradient(135deg, 
    rgb(255, 46, 74), 
    rgb(204, 0, 28), 
    rgb(161, 0, 20), 
    rgb(204, 0, 28), 
    rgb(255, 46, 74)
  )`;
  
  const glassEffect = 'rgba(255, 255, 255, 0.85)';
  const backdropBlur = 'blur(12px)';

  // Simulate live fan activity
  useEffect(() => {
    const interval = setInterval(() => {
      setFanCount(prev => prev + Math.floor(Math.random() * 5 - 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stadiumSections = [
    { 
      id: 'main', 
      name: 'Main Plaza', 
      icon: 'fa-landmark', 
      fans: 456, 
      description: 'General CFB discussion', 
      color: professionalGradients.red,
      shadowColor: 'rgba(239, 68, 68, 0.3)'
    },
    { 
      id: 'gameweek', 
      name: 'Game of the Week', 
      icon: 'fa-star', 
      fans: 312, 
      description: 'Weekly marquee matchup talk', 
      color: professionalGradients.gold,
      shadowColor: 'rgba(250, 204, 21, 0.3)'
    },
    { 
      id: 'betting', 
      name: 'Betting Insights', 
      icon: 'fa-chart-line', 
      fans: 201, 
      description: 'Lines, spreads & picks', 
      color: professionalGradients.green,
      shadowColor: 'rgba(16, 185, 129, 0.3)'
    },
    { 
      id: 'gameday', 
      name: 'GameDay Central', 
      icon: 'fa-calendar', 
      fans: 234, 
      description: 'Live game reactions', 
      color: professionalGradients.blue,
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    { 
      id: 'recruiting', 
      name: 'Recruiting Hub', 
      icon: 'fa-graduation-cap', 
      fans: 189, 
      description: 'Prospect tracking', 
      color: professionalGradients.green,
      shadowColor: 'rgba(34, 197, 94, 0.3)'
    },
    { 
      id: 'rivalry', 
      name: 'Rivalry Corner', 
      icon: 'fa-fire', 
      fans: 167, 
      description: 'Team vs team debates', 
      color: professionalGradients.orange,
      shadowColor: 'rgba(251, 146, 60, 0.3)'
    },
    { 
      id: 'nostalgia', 
      name: 'Memory Lane', 
      icon: 'fa-history', 
      fans: 134, 
      description: 'Classic games & moments', 
      color: professionalGradients.slate,
      shadowColor: 'rgba(148, 163, 184, 0.3)'
    },
    { 
      id: 'playoffs', 
      name: 'Playoff Central', 
      icon: 'fa-trophy', 
      fans: 289, 
      description: 'Championship talk', 
      color: `linear-gradient(135deg, 
        rgb(168, 85, 247), 
        rgb(139, 69, 219), 
        rgb(124, 58, 193), 
        rgb(139, 69, 219), 
        rgb(168, 85, 247)
      )`,
      shadowColor: 'rgba(168, 85, 247, 0.3)'
    },
    { 
      id: 'transfer', 
      name: 'Transfer Portal', 
      icon: 'fa-exchange-alt', 
      fans: 156, 
      description: 'Portal moves & rumors', 
      color: `linear-gradient(135deg, 
        rgb(20, 184, 166), 
        rgb(13, 148, 136), 
        rgb(15, 118, 110), 
        rgb(13, 148, 136), 
        rgb(20, 184, 166)
      )`,
      shadowColor: 'rgba(20, 184, 166, 0.3)'
    },
    { 
      id: 'coaching', 
      name: 'Coaching Corner', 
      icon: 'fa-chalkboard-teacher', 
      fans: 124, 
      description: 'Coach hires & strategy', 
      color: `linear-gradient(135deg, 
        rgb(180, 83, 9), 
        rgb(154, 52, 18), 
        rgb(120, 53, 15), 
        rgb(154, 52, 18), 
        rgb(180, 83, 9)
      )`,
      shadowColor: 'rgba(180, 83, 9, 0.3)'
    },
    { 
      id: 'draft', 
      name: 'NFL Draft Zone', 
      icon: 'fa-football-ball', 
      fans: 98, 
      description: 'Draft prospects & analysis', 
      color: `linear-gradient(135deg, 
        rgb(99, 102, 241), 
        rgb(79, 70, 229), 
        rgb(67, 56, 202), 
        rgb(79, 70, 229), 
        rgb(99, 102, 241)
      )`,
      shadowColor: 'rgba(99, 102, 241, 0.3)'
    },
    { 
      id: 'impact', 
      name: 'Impact Players', 
      icon: 'fa-star', 
      fans: 267, 
      description: 'Breakout stars & standouts', 
      color: `linear-gradient(135deg, 
        rgb(244, 63, 94), 
        rgb(225, 29, 72), 
        rgb(190, 18, 60), 
        rgb(225, 29, 72), 
        rgb(244, 63, 94)
      )`,
      shadowColor: 'rgba(244, 63, 94, 0.3)'
    }
  ];

  // Hot Topics Data for each section
  const hotTopicsData = {
    main: [
      { topic: '"CFP rankings are out - thoughts?"', replies: 34, reactions: 12, user: '@CFBAnalyst' },
      { topic: '"Which conference is strongest this year?"', replies: 89, reactions: 45, user: '@ConferenceKing' },
      { topic: '"Best uniform combinations this season"', replies: 67, reactions: 23, user: '@UniformGuru' },
      { topic: '"Most overrated teams in the top 25"', replies: 156, reactions: 78, user: '@HotTakeHank' },
      { topic: '"Predictions for bowl game matchups"', replies: 43, reactions: 19, user: '@BowlExpert' }
    ],
    gameday: [
      { topic: '"This interception just changed everything!"', replies: 34, reactions: 12, user: '@LiveReactions' },
      { topic: '"Did anyone see that incredible catch?!"', replies: 78, reactions: 45, user: '@GameWatcher' },
      { topic: '"Referee missed that obvious call"', replies: 234, reactions: 156, user: '@RefWatch' },
      { topic: '"Overtime predictions - who takes it?"', replies: 56, reactions: 23, user: '@OTPredictor' },
      { topic: '"Weather delay affecting the game plan"', replies: 34, reactions: 12, user: '@WeatherFan' }
    ],
    recruiting: [
      { topic: '"5-star QB just entered the portal..."', replies: 34, reactions: 12, user: '@RecruitTracker' },
      { topic: '"Top 2025 recruits still uncommitted"', replies: 89, reactions: 67, user: '@RecruitScout' },
      { topic: '"NIL deals changing the recruiting game"', replies: 123, reactions: 89, user: '@NILExpert' },
      { topic: '"Surprise commitment flips coming soon?"', replies: 45, reactions: 23, user: '@FlipWatch' },
      { topic: '"Junior college transfers to watch"', replies: 67, reactions: 34, user: '@JUCOExpert' }
    ],
    rivalry: [
      { topic: '"Alabama vs Georgia: Who has the better defense?"', replies: 34, reactions: 12, user: '@DefenseDebate' },
      { topic: '"Texas vs Oklahoma - Red River predictions"', replies: 156, reactions: 89, user: '@RedRiverFan' },
      { topic: '"Michigan vs Ohio State trash talk thread"', replies: 234, reactions: 123, user: '@RivalryKing' },
      { topic: '"Iron Bowl predictions - Auburn can win"', replies: 78, reactions: 45, user: '@IronBowlFan' },
      { topic: '"Clemson vs South Carolina - who wants it more?"', replies: 56, reactions: 23, user: '@PalmettoState' }
    ]
  };

  const mockFanActivity = [
    { user: '@CrimsonTide2025', action: 'Started heated debate about CFP rankings', time: '2m ago', avatar: 'fa-user', photo: userPhotos[0], points: '+25' },
    { user: '@GeorgiaDawg', action: 'Predicted upset in Rivalry Corner', time: '5m ago', avatar: 'fa-user-circle', photo: userPhotos[1], points: '+15' },
    { user: '@TexasLonghorn', action: 'Shared legendary 2005 Rose Bowl memory', time: '8m ago', avatar: 'fa-user-astronaut', photo: userPhotos[2], points: '+10' },
    { user: '@OhioStateFan', action: 'Posted recruiting analysis in Main Plaza', time: '12m ago', avatar: 'fa-user-graduate', photo: userPhotos[3], points: '+20' },
    { user: '@AlabamaFan', action: 'Won weekly prediction challenge', time: '15m ago', avatar: 'fa-user-ninja', photo: userPhotos[4], points: '+100' }
  ];

  return (
    <div className="py-12 tab-content">
      {/* Stadium Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {(showAllSections ? stadiumSections : stadiumSections.slice(0, 6)).map((section) => (
          <div 
            key={section.id}
            onClick={() => setActiveStadium(section.id)}
            className={`group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] ${
              activeStadium === section.id ? 'scale-[1.05] shadow-2xl' : 'hover:shadow-2xl'
            }`}
            style={{
              filter: activeStadium === section.id ? `drop-shadow(0 8px 24px ${section.shadowColor})` : 'none'
            }}
          >
            <div 
              className="rounded-lg shadow-xl hover:shadow-2xl border overflow-hidden"
              style={{
                background: glassEffect,
                backdropFilter: backdropBlur,
                WebkitBackdropFilter: backdropBlur,
                border: activeStadium === section.id ? 
                  `2px solid rgba(255, 255, 255, 0.6)` : 
                  '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: activeStadium === section.id ? 
                  `0 12px 40px ${section.shadowColor}, 0 0 0 1px rgba(255, 255, 255, 0.5)` : 
                  '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Section Header */}
              <div 
                className="relative p-6 text-white"
                style={{
                  background: section.color,
                  boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px ${section.shadowColor}`
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <i 
                    className={`fas ${section.icon} text-3xl`}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  ></i>
                  <div 
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <i className="fas fa-users"></i>
                    <span>{section.fans}</span>
                  </div>
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {section.name}
                </h3>
                <p 
                  className="text-white/90 text-sm"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {section.description}
                </p>
                
                {/* Activity Indicator */}
                <div className="absolute top-4 right-4">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                      boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)'
                    }}
                  ></div>
                </div>
              </div>

              {/* Section Preview */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Sample Discussion Topics */}
                  <div 
                    className="flex items-start space-x-3 p-4 rounded-md transition-all duration-200 hover:shadow-md cursor-pointer"
                    style={{
                      background: 'rgba(249, 250, 251, 0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0">
                      <img 
                        src={userPhotos[Math.floor(Math.random() * userPhotos.length)]} 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-full h-full flex items-center justify-center shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234))',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                          display: 'none'
                        }}
                      >
                        <i className="fas fa-user text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div 
                        className="text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #1f2937, #374151)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        Latest Hot Topic
                      </div>
                      <div className="text-xs text-gray-600 mt-1 font-medium">
                        {hotTopicsData[section.id] ? hotTopicsData[section.id][0].topic : 
                         section.id === 'rivalry' ? '"Alabama vs Georgia: Who has the better defense?"' :
                         section.id === 'recruiting' ? '"5-star QB just entered the portal..."' :
                         section.id === 'gameday' ? '"This interception just changed everything!"' :
                         section.id === 'playoffs' ? '"Playoff expansion thoughts?"' :
                         section.id === 'nostalgia' ? '"Remember the 2019 LSU season?"' :
                         '"CFP rankings are out - thoughts?"'}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <span className="text-gray-500 font-medium">
                          {hotTopicsData[section.id] ? hotTopicsData[section.id][0].replies : 34} replies
                        </span>
                        <span className="text-gray-500 font-medium">
                          {hotTopicsData[section.id] ? hotTopicsData[section.id][0].reactions : 12} reactions
                        </span>
                        <span 
                          className="font-bold"
                          style={{
                            background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          +15 points
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSection(section);
                        setShowTopicsModal(true);
                      }}
                      className="py-2 px-3 text-sm rounded-md font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.9), rgba(255, 255, 255, 0.8))',
                        border: `1px solid ${section.shadowColor}`,
                        color: section.color.includes('250, 204, 21') ? '#b45309' : 
                               section.color.includes('239, 68, 68') ? '#dc2626' :
                               section.color.includes('59, 130, 246') ? '#2563eb' :
                               section.color.includes('34, 197, 94') ? '#16a34a' :
                               section.color.includes('251, 146, 60') ? '#ea580c' :
                               section.color.includes('147, 51, 234') ? '#9333ea' :
                               section.color.includes('20, 184, 166') ? '#0d9488' :
                               section.color.includes('236, 72, 153') ? '#db2777' :
                               section.color.includes('99, 102, 241') ? '#6366f1' : '#059669'
                      }}
                    >
                      <i className="fas fa-list mr-2"></i>
                      <span>View More Topics</span>
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSection(section);
                        setShowCreateTopicModal(true);
                      }}
                      className="py-2 px-3 text-sm text-white rounded-md font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
                      style={{
                        background: section.color,
                        boxShadow: `0 2px 8px ${section.shadowColor}`
                      }}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      <span>New Topic</span>
                    </button>
                  </div>

                  {/* Join Button */}
                  <button 
                    onClick={() => window.location.hash = `forum-section-${section.id}`}
                    className="w-full py-3 text-white rounded-md font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
                    style={{
                      background: section.color,
                      boxShadow: `0 4px 12px ${section.shadowColor}`
                    }}
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    <span>Enter {section.name}</span>
                    <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      {!showAllSections && stadiumSections.length > 6 && (
        <div className="text-center mb-16">
          <button 
            onClick={() => setShowAllSections(true)}
            className="px-8 py-4 text-white rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
            style={{
              background: metallicGradient,
              boxShadow: '0 4px 12px rgba(255, 46, 74, 0.3)'
            }}
          >
            <i className="fas fa-chevron-down mr-2"></i>
            <span>View More Forum Sections ({stadiumSections.length - 6} more)</span>
            <i className="fas fa-chevron-down ml-2 group-hover:translate-y-1 transition-transform duration-300"></i>
          </button>
        </div>
      )}

      {/* Show Less Button */}
      {showAllSections && (
        <div className="text-center mb-16">
          <button 
            onClick={() => setShowAllSections(false)}
            className="px-8 py-4 text-gray-700 rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
            style={{
              background: 'rgba(249, 250, 251, 0.9)',
              border: '1px solid rgba(209, 213, 219, 0.5)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <i className="fas fa-chevron-up mr-2"></i>
            <span>Show Less</span>
            <i className="fas fa-chevron-up ml-2 group-hover:-translate-y-1 transition-transform duration-300"></i>
          </button>
        </div>
      )}

      {/* Live Fan Activity Feed */}
      <div 
        className="rounded-lg shadow-xl border overflow-hidden mb-16"
        style={{
          background: glassEffect,
          backdropFilter: backdropBlur,
          WebkitBackdropFilter: backdropBlur,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div 
          className="text-white p-6"
          style={{
            background: metallicGradient,
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 
                className="text-2xl font-bold mb-2 flex items-center gap-3"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                <i 
                  className="fas fa-fire text-white"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                ></i>
                Live Fan Activity
              </h3>
              <p 
                className="text-gray-300"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Real-time fan movements across the Colosseum
              </p>
            </div>
            <div 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium"
              style={{
                background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              <div 
                className="w-2 h-2 bg-white rounded-full animate-pulse"
                style={{
                  boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
                }}
              ></div>
              <span className="text-sm font-bold">LIVE</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {mockFanActivity.map((activity, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-4 p-4 rounded-md transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.01]"
              style={{
                background: 'rgba(249, 250, 251, 0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0">
                <img 
                  src={activity.photo} 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-full h-full flex items-center justify-center shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(245, 158, 11))',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                    display: 'none'
                  }}
                >
                  <i className={`fas ${activity.avatar} text-white`}></i>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span 
                    className="font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #1f2937, #374151)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {activity.user}
                  </span>
                  <span className="text-gray-600 font-medium">{activity.action}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{activity.time}</div>
              </div>
              <div className="flex items-center space-x-3">
                <span 
                  className="text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {activity.points}
                </span>
                <button 
                  className="px-3 py-1 text-xs rounded-md font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.2))',
                    color: 'rgb(239, 68, 68)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Follow
                </button>
              </div>
            </div>
          ))}

          <div className="text-center pt-4">
            <button 
              className="px-6 py-3 text-white rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              style={{
                background: metallicGradient,
                boxShadow: '0 4px 12px rgba(255, 46, 74, 0.3)'
              }}
            >
              <i className="fas fa-plus mr-2"></i>
              Start Your Own Discussion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Content Component  
const DashboardContent = ({ 
  professionalGradients
}) => {
  return (
    <div className="py-12 tab-content">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div 
          className="rounded-lg shadow-xl border overflow-hidden max-w-2xl w-full mx-4"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div 
            className="text-white p-8 text-center"
            style={{
              background: professionalGradients.red,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="mb-6">
              <i className="fas fa-rocket text-6xl mb-4 opacity-90"></i>
              <h2 
                className="text-4xl font-bold mb-4"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Coming Soon
              </h2>
              <div 
                className="w-24 h-1 mx-auto rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3), rgba(255,255,255,0.6))'
                }}
              ></div>
            </div>
          </div>
          
          <div className="p-8">
            <p className="text-xl text-gray-700 mb-8 text-center font-medium">
              Your personalized dashboard is being crafted with exciting features
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))' }}
                >
                  <i className="fas fa-play-circle text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Live Games</h4>
                  <p className="text-sm text-gray-600">Real-time scores & updates</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))' }}
                >
                  <i className="fas fa-poll text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Polls</h4>
                  <p className="text-sm text-gray-600">Fan voting & predictions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))' }}
                >
                  <i className="fas fa-chart-line text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Betting Tips</h4>
                  <p className="text-sm text-gray-600">Expert insights & analysis</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206))' }}
                >
                  <i className="fas fa-plus text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">And More</h4>
                  <p className="text-sm text-gray-600">Personalized content</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="font-medium">Under Development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// My Teams Content Component - Coming Soon
const MyTeamsContent = ({ 
  professionalGradients
}) => {
  return (
    <div className="py-12 tab-content">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div 
          className="rounded-lg shadow-xl border overflow-hidden max-w-2xl w-full mx-4"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div 
            className="text-white p-8 text-center"
            style={{
              background: professionalGradients.red,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="mb-6">
              <i className="fas fa-heart text-6xl mb-4 opacity-90"></i>
              <h2 
                className="text-4xl font-bold mb-4"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Coming Soon
              </h2>
              <div 
                className="w-24 h-1 mx-auto rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3), rgba(255,255,255,0.6))'
                }}
              ></div>
            </div>
          </div>
          
          <div className="p-8">
            <p className="text-xl text-gray-700 mb-8 text-center font-medium">
              Follow your favorite teams and get personalized updates
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))' }}
                >
                  <i className="fas fa-plus text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Add Teams</h4>
                  <p className="text-sm text-gray-600">Follow your favorites</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))' }}
                >
                  <i className="fas fa-bell text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Notifications</h4>
                  <p className="text-sm text-gray-600">Game updates & news</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))' }}
                >
                  <i className="fas fa-chart-line text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Team Stats</h4>
                  <p className="text-sm text-gray-600">Performance tracking</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206))' }}
                >
                  <i className="fas fa-calendar text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Schedule</h4>
                  <p className="text-sm text-gray-600">Upcoming games</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="font-medium">Under Development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tailgate Content Component - Coming Soon with Map
const TailgateContent = ({ 
  professionalGradients
}) => {
  // Mock stadium locations for the map
  const stadiumLocations = [
    { name: "Memorial Stadium", lat: 40.0956, lng: -89.2831, team: "Illinois" },
    { name: "Kinnick Stadium", lat: 41.6580, lng: -91.5527, team: "Iowa" },
    { name: "Northwestern Medicine Field", lat: 42.0668, lng: -87.6921, team: "Northwestern" },
    { name: "Camp Randall Stadium", lat: 43.0700, lng: -89.4124, team: "Wisconsin" },
    { name: "TCF Bank Stadium", lat: 44.9765, lng: -93.2243, team: "Minnesota" }
  ];

  return (
    <div className="py-12 tab-content">
      {/* Coming Soon Card */}
      <div className="flex items-center justify-center min-h-[60vh] mb-8">
        <div 
          className="rounded-lg shadow-xl border overflow-hidden max-w-2xl w-full mx-4"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div 
            className="text-white p-8 text-center"
            style={{
              background: professionalGradients.orange,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="mb-6">
              <i className="fas fa-fire text-6xl mb-4 opacity-90"></i>
              <h2 
                className="text-4xl font-bold mb-4"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Coming Soon
              </h2>
              <div 
                className="w-24 h-1 mx-auto rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3), rgba(255,255,255,0.6))'
                }}
              ></div>
            </div>
          </div>
          
          <div className="p-8">
            <p className="text-xl text-gray-700 mb-8 text-center font-medium">
              See who's at the game, meet fans, find tailgates, see how your squad shows up when it matters for away games
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))' }}
                >
                  <i className="fas fa-map-marker-alt text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Find Tailgates</h4>
                  <p className="text-sm text-gray-600">Locate game day parties</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))' }}
                >
                  <i className="fas fa-users text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Meet Fans</h4>
                  <p className="text-sm text-gray-600">Connect with your squad</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))' }}
                >
                  <i className="fas fa-road text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Away Games</h4>
                  <p className="text-sm text-gray-600">Squad travel tracking</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206))' }}
                >
                  <i className="fas fa-bullhorn text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Game Day</h4>
                  <p className="text-sm text-gray-600">Live fan activity</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="font-medium">Under Development</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassy Map Preview - Mirroring Big Ten Design */}
      <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Map Header */}
        <div className="relative z-10 p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4" style={{ 
              background: 'linear-gradient(135deg, #ff7f50, #ff6347, #ff4500)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              backgroundClip: 'text' 
            }}>
              Tailgate Map Preview
            </h3>
            <p className="text-gray-600">Interactive map coming soon - Find tailgates, fans, and game day events</p>
          </div>
          
          {/* Mock Map Container with Glass Effect */}
          <div 
            className="relative h-96 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,127,80,0.1), rgba(255,99,71,0.05), rgba(255,69,0,0.1))',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.2), 0 8px 25px rgba(0,0,0,0.1)'
            }}
          >
            {/* Glass highlight overlay */}
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            
            {/* Map placeholder content */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                }}>
                  <i className="fas fa-map text-3xl" style={{
                    background: 'linear-gradient(135deg, #ff7f50, #ff6347, #ff4500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}></i>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Interactive Stadium Map</h4>
                <p className="text-gray-600 max-w-md mx-auto">Discover tailgate spots, fan meetups, and live game day activity around every stadium</p>
                
                {/* Mock location pins */}
                <div className="mt-8 flex justify-center space-x-8">
                  {stadiumLocations.slice(0, 3).map((stadium, index) => (
                    <div key={index} className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center animate-pulse" style={{
                        background: 'rgba(255, 127, 80, 0.8)',
                        boxShadow: '0 0 15px rgba(255, 127, 80, 0.6)'
                      }}>
                        <i className="fas fa-map-pin text-white text-sm"></i>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{stadium.team}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Map controls preview */}
            <div className="absolute top-4 right-4 space-y-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}>
                <i className="fas fa-plus text-gray-700"></i>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}>
                <i className="fas fa-minus text-gray-700"></i>
              </div>
            </div>
            
            {/* Legend preview */}
            <div className="absolute bottom-4 left-4 p-4 rounded-xl" style={{
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
              <h5 className="font-bold text-gray-800 text-sm mb-2">Map Legend</h5>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-700">Tailgate Spots</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">Fan Meetups</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">Stadium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanHubCentral;
