import React, { useState, useEffect, Suspense, lazy } from 'react';
import InteractiveForumPost from './InteractiveForumPost';
import MainForumSection from './MainForumSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLandmark, faMagic, faStream, faMedal, faUsers } from '@fortawesome/free-solid-svg-icons';

const TheColosseum = lazy(() => import('./TheColosseum'));
const FanProphecy = lazy(() => import('./FanProphecy'));
const SocialFeed = lazy(() => import('./SocialFeed'));
const FanStats = lazy(() => import('./FanStats'));

const FanHubCentral = () => {
  // Professional gradient system matching other FanHub components
  const professionalGradients = {
    red: 'linear-gradient(135deg, #ff4747 0%, #cc001c 25%, #a10014 50%, #cc001c 75%, #ff4747 100%)',
    blue: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 25%, #1557b0 50%, #1a73e8 75%, #4285f4 100%)',
    green: 'linear-gradient(135deg, #00d084 0%, #00b368 25%, #00965a 50%, #00b368 75%, #00d084 100%)',
    gold: 'linear-gradient(135deg, #ffd700 0%, #ffb300 25%, #ff8c00 50%, #ffb300 75%, #ffd700 100%)',
    purple: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 25%, #6d28d9 50%, #7c3aed 75%, #9333ea 100%)',
    orange: 'linear-gradient(135deg, #ff7f50 0%, #ff6347 25%, #ff4500 50%, #ff6347 75%, #ff7f50 100%)',
    slate: 'linear-gradient(135deg, #475569 0%, #334155 25%, #1e293b 50%, #334155 75%, #475569 100%)'
  };

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

  const [userStats, setUserStats] = useState({
    level: 'Expert',
    points: 2840,
    streak: 7,
    achievements: 12,
    discussions: 34,
    predictions: 89,
    accuracy: 73.2
  });

  // Tab state and hash sync
  // Dashboard tab content (restored)
  function DashboardTab() {
    return (
      <div className="w-full py-12" style={{ width: '97%', margin: '0 auto' }}>
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* The Colosseum Access */}
          <div className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]">
            <div 
              className="rounded-lg shadow-xl hover:shadow-2xl border overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="text-white p-6"
                style={{
                  background: professionalGradients.red,
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">The Colosseum</h3>
                    <p className="text-red-100 text-sm mb-4">Jump into live fan discussions</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="bg-white/20 px-3 py-1 rounded-full">1,247 Fans Online</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full">342 Discussions</span>
                    </div>
                  </div>
                  <div className="text-5xl opacity-30">
                    <i className="fas fa-landmark"></i>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <button 
                    className="w-full py-3 text-white rounded-md font-bold transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: professionalGradients.red,
                      boxShadow: '0 4px 15px rgba(255, 46, 74, 0.3)'
                    }}
                    onClick={() => setShowMainForum(true)}
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Enter Stadium
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Personal Stats */}
          <div className="rounded-lg overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02]"
               style={{ 
                 background: professionalGradients.slate,
                 border: 'none'
               }}>
            <div className="text-white p-6">
              <h3 className="text-2xl font-bold mb-4">🏆 Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{userStats.achievements}</div>
                  <div className="text-sm text-gray-300">Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{userStats.discussions}</div>
                  <div className="text-sm text-gray-300">Discussions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{userStats.predictions}</div>
                  <div className="text-sm text-gray-300">Predictions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{userStats.accuracy}%</div>
                  <div className="text-sm text-gray-300">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* You can add back Recent Activity, Hot Discussions, etc. here as needed */}
      </div>
    );
  }
  const tabList = [
    { key: 'dashboard', label: 'Dashboard', icon: faUsers, component: DashboardTab },
    { key: 'colosseum', label: 'The Colosseum', icon: faLandmark, component: TheColosseum },
    { key: 'prophecy', label: 'Fan Prophecy', icon: faMagic, component: FanProphecy },
    { key: 'social', label: 'Social Feed', icon: faStream, component: SocialFeed },
    { key: 'stats', label: 'Fan Stats', icon: faMedal, component: FanStats },
  ];
  function getTabFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/tab=([a-z]+)/);
    return match ? match[1] : 'colosseum';
  }
  const [activeTab, setActiveTab] = useState(getTabFromHash());
  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const handleTabClick = (key) => {
    window.location.hash = `fanhub-central?tab=${key}`;
    setActiveTab(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Hero Header */}
      <div className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, rgb(31, 41, 55), rgb(55, 65, 81), rgb(75, 85, 99))', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255, 46, 74, 0.1), transparent, rgba(255, 46, 74, 0.1))' }}></div>
        <div className="relative w-full px-6 py-20" style={{ width: '97%', margin: '0 auto' }}>
          <div className="text-center">
            <h1 className="text-6xl font-extrabold mb-6">
              <span style={{ background: professionalGradients.red, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>FANHUB CENTRAL</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: 'rgba(229, 231, 235, 0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              Your personal command center for all GAMEDAY+ fan activities
            </p>
          </div>
          {/* Tabbed Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mt-10 mb-2">
            {tabList.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 focus:outline-none shadow-md hover:scale-105 ${activeTab === tab.key ? 'text-white' : 'text-gray-200 hover:text-white'}`}
                style={activeTab === tab.key ? { background: professionalGradients.red, boxShadow: '0 4px 20px #cc001c44' } : { background: 'rgba(255,255,255,0.08)' }}
              >
                <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Tab Content */}
      <div className="w-full max-w-6xl mx-auto py-8 px-2 md:px-8">
        <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div></div>}>
          {tabList.map(tab => (
            <div key={tab.key} style={{ display: activeTab === tab.key ? 'block' : 'none' }}>
              <tab.component />
            </div>
          ))}
        </Suspense>
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
    </div>
// (Removed legacy dashboard code that was outside the component)
  );
};

export default FanHubCentral;
