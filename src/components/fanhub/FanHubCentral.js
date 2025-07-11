import React, { useState, useEffect } from 'react';
import InteractiveForumPost from './InteractiveForumPost';
import MainForumSection from './MainForumSection';

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

  const [recentActivity, setRecentActivity] = useState([
    { 
      id: 1, 
      type: 'prediction', 
      title: 'Correctly predicted Alabama vs Georgia', 
      points: 150, 
      time: '2 hours ago', 
      icon: 'fa-crystal-ball',
      photo: userPhotos[0], // Wedding.jpg
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
      photo: userPhotos[1], // Mclovin.jpg
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
      photo: userPhotos[2], // Nick.jpg
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
      photo: userPhotos[3], // NY.jpg
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
      photo: userPhotos[4], // SB.jpg
      color: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))',
      shadowColor: 'rgba(239, 68, 68, 0.3)'
    },
    { 
      id: 2, 
      title: '5-star QB just entered the portal...', 
      section: 'Recruiting Hub', 
      replies: 189, 
      heat: 'hot',
      photo: userPhotos[5], // CLE.jpg
      color: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
      shadowColor: 'rgba(245, 158, 11, 0.3)'
    },
    { 
      id: 3, 
      title: 'CFP rankings are out - thoughts?', 
      section: 'Main Plaza', 
      replies: 156, 
      heat: 'trending',
      photo: userPhotos[0], // Wedding.jpg (reusing for variety)
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
        className="relative overflow-hidden text-white"
        style={{
          background: 'linear-gradient(135deg, rgb(31, 41, 55), rgb(55, 65, 81), rgb(75, 85, 99))',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 46, 74, 0.1), transparent, rgba(255, 46, 74, 0.1))'
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
                color: 'rgba(229, 231, 235, 0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Your personal command center for all GAMEDAY+ fan activities
            </p>
            
            {/* Enhanced Quick Stats Bar */}
            <div className="flex justify-center items-center space-x-8 text-sm font-medium mb-6">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>Level {userStats.level}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <i className="fas fa-trophy text-yellow-300"></i>
                <span>{userStats.points.toLocaleString()} Points</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <i className="fas fa-fire text-orange-300"></i>
                <span>{userStats.streak} Day Streak</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <i className="fas fa-bullseye text-blue-300"></i>
                <span>{userStats.accuracy}% Accuracy</span>
              </div>
            </div>
            
            {/* Featured User Photo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white border-opacity-30 shadow-lg">
                <img 
                  src={userPhotos[Math.floor(Math.random() * userPhotos.length)]} 
                  alt="Featured User" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center text-white bg-red-500" style={{ display: 'none' }}>
                  <i className="fas fa-user"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
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

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="rounded-lg overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02]"
               style={{ 
                 background: professionalGradients.blue,
                 border: 'none'
               }}>
            <div className="text-white p-6">
              <h3 className="text-2xl font-bold mb-2">🎯 Recent Activity</h3>
              <p className="text-blue-100">Your latest fan activities and achievements</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer transform hover:shadow-lg"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(8px)'
                    }}
                    onClick={() => {
                      if (activity.type === 'prediction' || activity.type === 'discussion') {
                        setSelectedPost({
                          title: activity.title,
                          section: "The Colosseum - Recent Activity",
                          replies: Math.floor(Math.random() * 100) + 20,
                          photo: activity.photo,
                          user: "@LiveFan"
                        });
                        setShowInteractivePost(true);
                      }
                    }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0"
                         style={{ background: activity.color }}>
                      <img 
                        src={activity.photo} 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-white" style={{ display: 'none' }}>
                        <i className={`fas ${activity.icon} text-sm`}></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{activity.title}</h4>
                      <div className="flex items-center justify-between text-sm text-white text-opacity-80">
                        <span>{activity.time}</span>
                        <span className="text-green-300 font-bold">+{activity.points}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hot Discussions */}
        <div className="rounded-lg overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02]"
             style={{ 
               background: professionalGradients.orange,
               border: 'none'
             }}>
          <div className="text-white p-6">
            <h3 className="text-2xl font-bold mb-2">🔥 Hot Discussions</h3>
            <p className="text-orange-100">Trending topics across The Colosseum</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hotDiscussions.map((discussion) => (
                <div 
                  key={discussion.id} 
                  className="p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer transform hover:shadow-lg"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                  onClick={() => {
                    setSelectedPost({
                      title: discussion.title,
                      section: `The Colosseum - ${discussion.section}`,
                      replies: discussion.replies,
                      photo: discussion.photo,
                      user: `@${discussion.section.replace(' ', '')}Fan`
                    });
                    setShowInteractivePost(true);
                  }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0">
                      <img 
                        src={discussion.photo} 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-white bg-orange-500" style={{ display: 'none' }}>
                        <i className="fas fa-user text-xs"></i>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {discussion.heat === 'fire' && <i className="fas fa-fire text-red-300"></i>}
                      {discussion.heat === 'hot' && <i className="fas fa-flame text-orange-300"></i>}
                      {discussion.heat === 'trending' && <i className="fas fa-trending-up text-blue-300"></i>}
                    </div>
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-2">{discussion.title}</h4>
                  <div className="text-xs text-orange-200 mb-2">{discussion.section}</div>
                  <div className="text-sm text-orange-100">{discussion.replies} replies</div>
                </div>
              ))}
            </div>
          </div>
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
    </div>
  );
};

export default FanHubCentral;
