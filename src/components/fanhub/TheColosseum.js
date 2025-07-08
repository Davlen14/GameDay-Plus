import React, { useState, useEffect } from 'react';

const TheColosseum = () => {
  // Professional gradient system matching EVBettingView
  const professionalGradients = {
    red: `linear-gradient(135deg, 
      rgb(255, 46, 74), 
      rgb(204, 0, 28), 
      rgb(161, 0, 20), 
      rgb(204, 0, 28), 
      rgb(255, 46, 74)
    )`,
    blue: `linear-gradient(135deg, 
      rgb(59, 130, 246), 
      rgb(37, 99, 235), 
      rgb(29, 78, 216), 
      rgb(37, 99, 235), 
      rgb(59, 130, 246)
    )`,
    green: `linear-gradient(135deg, 
      rgb(34, 197, 94), 
      rgb(22, 163, 74), 
      rgb(15, 118, 54), 
      rgb(22, 163, 74), 
      rgb(34, 197, 94)
    )`,
    gold: `linear-gradient(135deg, 
      rgb(250, 204, 21), 
      rgb(245, 158, 11), 
      rgb(217, 119, 6), 
      rgb(245, 158, 11), 
      rgb(250, 204, 21)
    )`,
    purple: `linear-gradient(135deg, 
      rgb(147, 51, 234), 
      rgb(126, 34, 206), 
      rgb(101, 16, 179), 
      rgb(126, 34, 206), 
      rgb(147, 51, 234)
    )`,
    orange: `linear-gradient(135deg, 
      rgb(251, 146, 60), 
      rgb(249, 115, 22), 
      rgb(234, 88, 12), 
      rgb(249, 115, 22), 
      rgb(251, 146, 60)
    )`,
    gray: `linear-gradient(135deg, 
      rgb(156, 163, 175), 
      rgb(107, 114, 128), 
      rgb(75, 85, 99), 
      rgb(107, 114, 128), 
      rgb(156, 163, 175)
    )`
  };

  // Glass morphism effect for premium cards
  const glassMorphism = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  };

  const [selectedSection, setSelectedSection] = useState('main');
  const [fanCount, setFanCount] = useState(1247);
  const [userPoints, setUserPoints] = useState(2840);
  const [liveActivity, setLiveActivity] = useState([]);

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
      description: 'General CFB discussion & hot takes', 
      background: professionalGradients.red,
      shadowColor: 'rgba(255, 46, 74, 0.3)',
      posts: 1234,
      activeNow: 45
    },
    { 
      id: 'gameday', 
      name: 'GameDay Central', 
      icon: 'fa-tv', 
      fans: 234, 
      description: 'Live game reactions & commentary', 
      background: professionalGradients.blue,
      shadowColor: 'rgba(59, 130, 246, 0.3)',
      posts: 892,
      activeNow: 28
    },
    { 
      id: 'recruiting', 
      name: 'Recruiting Hub', 
      icon: 'fa-graduation-cap', 
      fans: 189, 
      description: 'Prospect tracking & transfer portal', 
      background: professionalGradients.green,
      shadowColor: 'rgba(34, 197, 94, 0.3)',
      posts: 567,
      activeNow: 19
    },
    { 
      id: 'rivalry', 
      name: 'Rivalry Corner', 
      icon: 'fa-fire', 
      fans: 167, 
      description: 'Team vs team heated debates', 
      background: professionalGradients.orange,
      shadowColor: 'rgba(251, 146, 60, 0.3)',
      posts: 2341,
      activeNow: 67
    },
    { 
      id: 'nostalgia', 
      name: 'Memory Lane', 
      icon: 'fa-history', 
      fans: 134, 
      description: 'Classic games & legendary moments', 
      background: professionalGradients.purple,
      shadowColor: 'rgba(147, 51, 234, 0.3)',
      posts: 445,
      activeNow: 12
    },
    { 
      id: 'playoffs', 
      name: 'Playoff Central', 
      icon: 'fa-trophy', 
      fans: 289, 
      description: 'Championship talk & CFP predictions', 
      background: professionalGradients.gold,
      shadowColor: 'rgba(250, 204, 21, 0.3)',
      posts: 1567,
      activeNow: 34
    }
  ];

  const mockFanActivity = [
    { 
      user: '@CrimsonTide2025', 
      action: 'Started heated debate about CFP rankings', 
      time: '2m ago', 
      avatar: 'fa-user', 
      points: '+25',
      section: 'Main Plaza',
      likes: 12
    },
    { 
      user: '@GeorgiaDawg', 
      action: 'Predicted upset in Rivalry Corner', 
      time: '5m ago', 
      avatar: 'fa-user-circle', 
      points: '+15',
      section: 'Rivalry Corner',
      likes: 8
    },
    { 
      user: '@TexasLonghorn', 
      action: 'Shared legendary 2005 Rose Bowl memory', 
      time: '8m ago', 
      avatar: 'fa-user-astronaut', 
      points: '+10',
      section: 'Memory Lane',
      likes: 24
    },
    { 
      user: '@OhioStateFan', 
      action: 'Posted recruiting analysis in Main Plaza', 
      time: '12m ago', 
      avatar: 'fa-user-graduate', 
      points: '+20',
      section: 'Recruiting Hub',
      likes: 15
    },
    { 
      user: '@AlabamaFan', 
      action: 'Won weekly prediction challenge', 
      time: '15m ago', 
      avatar: 'fa-user-ninja', 
      points: '+100',
      section: 'Playoff Central',
      likes: 45
    }
  ];

  const hotTopics = [
    { 
      title: 'Alabama vs Georgia: Who has the better defense?', 
      section: 'Rivalry Corner', 
      replies: 234, 
      heat: 'fire',
      lastPost: '3m ago',
      starter: '@CrimsonAnalyst'
    },
    { 
      title: '5-star QB just entered the portal...', 
      section: 'Recruiting Hub', 
      replies: 189, 
      heat: 'hot',
      lastPost: '7m ago',
      starter: '@RecruitingGuru'
    },
    { 
      title: 'CFP rankings are out - complete robbery!', 
      section: 'Main Plaza', 
      replies: 156, 
      heat: 'trending',
      lastPost: '12m ago',
      starter: '@CFBAnalyst'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)' }}>
      {/* Hero Section */}
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
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-6xl font-extrabold mb-6">
              <span style={{ 
                background: professionalGradients.red,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                THE COLOSSEUM
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Step into virtual stadium sections where passionate fans gather to debate, celebrate, and share the pure emotion of college football.
            </p>
            
            {/* Live Stats Bar */}
            <div className="flex justify-center items-center space-x-8 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>{fanCount.toLocaleString()} Fans Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-comments text-red-200"></i>
                <span>Live Discussions</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-trophy text-yellow-300"></i>
                <span>{userPoints.toLocaleString()} Your Points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stadium Sections Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span style={{ 
                background: professionalGradients.red,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Stadium Sections</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose your arena - each section brings unique energy and discussion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stadiumSections.map((section) => (
              <div 
                key={section.id}
                className={`group relative overflow-hidden rounded-xl border-2 border-gray-100 hover:border-red-300 transition-all duration-300 cursor-pointer transform hover:scale-105 ${selectedSection === section.id ? 'ring-4 ring-red-500 ring-opacity-50' : ''}`}
                style={{
                  ...glassMorphism,
                  boxShadow: selectedSection === section.id ? `0 8px 32px ${section.shadowColor}` : '0 8px 32px rgba(0,0,0,0.1)'
                }}
                onClick={() => setSelectedSection(section.id)}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ background: section.background }}
                ></div>
                
                <div className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ 
                        background: section.background,
                        boxShadow: `0 4px 15px ${section.shadowColor}`
                      }}
                    >
                      <i className={`fas ${section.icon} text-lg`}></i>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Active Now</div>
                      <div className="text-lg font-bold" style={{ 
                        background: section.background,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>{section.activeNow}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2" style={{ 
                    background: section.background,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>{section.name}</h3>
                  <p className="text-gray-600 mb-4">{section.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-users"></i>
                      <span>{section.fans.toLocaleString()} fans</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-comment"></i>
                      <span>{section.posts.toLocaleString()} posts</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity & Hot Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Activity Feed */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text flex items-center">
                <i className="fas fa-bolt text-yellow-500 mr-3"></i>
                Live Activity
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Real-time updates</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {mockFanActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white">
                    <i className={`fas ${activity.avatar} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">{activity.user}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-bold">{activity.points}</span>
                        <span className="text-gray-400 text-sm">{activity.time}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1">{activity.action}</p>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                      <span className="bg-gray-200 px-2 py-1 rounded">{activity.section}</span>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-heart text-red-400"></i>
                        <span>{activity.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Topics */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-bold gradient-text mb-6 flex items-center">
              <i className="fas fa-fire text-orange-500 mr-3"></i>
              Hot Topics
            </h3>
            
            <div className="space-y-4">
              {hotTopics.map((topic, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-transparent rounded-lg border border-red-100 hover:border-red-300 transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">{topic.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-gray-200 px-2 py-1 rounded">{topic.section}</span>
                        <div className="flex items-center space-x-1">
                          <i className="fas fa-comments"></i>
                          <span>{topic.replies} replies</span>
                        </div>
                        <span>by {topic.starter}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      {topic.heat === 'fire' && <i className="fas fa-fire text-red-500"></i>}
                      {topic.heat === 'hot' && <i className="fas fa-flame text-orange-500"></i>}
                      {topic.heat === 'trending' && <i className="fas fa-trending-up text-blue-500"></i>}
                      <span className="text-sm text-gray-400">{topic.lastPost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gamification Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold gradient-text mb-4">⚡ Earn Points for Every Action</h3>
            <p className="text-gray-600 text-lg">Level up your fan status and unlock exclusive rewards</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">+10</div>
              <div className="text-sm text-gray-600">New Post</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">+5</div>
              <div className="text-sm text-gray-600">Reply/Like</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">+25</div>
              <div className="text-sm text-gray-600">Start Debate</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600 mb-2">+100</div>
              <div className="text-sm text-gray-600">Win Challenge</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheColosseum;
