import React, { useState, useEffect } from 'react';

const TheColosseum = () => {
  const [selectedTeam, setSelectedTeam] = useState('Alabama');
  const [activeStadium, setActiveStadium] = useState('main');
  const [fanCount, setFanCount] = useState(1247);
  const [liveEvents, setLiveEvents] = useState([]);

  // Simulate live fan activity
  useEffect(() => {
    const interval = setInterval(() => {
      setFanCount(prev => prev + Math.floor(Math.random() * 5 - 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stadiumSections = [
    { id: 'main', name: 'Main Plaza', icon: 'fa-landmark', fans: 456, description: 'General CFB discussion', color: 'from-red-500 to-red-600' },
    { id: 'gameday', name: 'GameDay Central', icon: 'fa-tv', fans: 234, description: 'Live game reactions', color: 'from-blue-500 to-blue-600' },
    { id: 'recruiting', name: 'Recruiting Hub', icon: 'fa-graduation-cap', fans: 189, description: 'Prospect tracking', color: 'from-green-500 to-green-600' },
    { id: 'rivalry', name: 'Rivalry Corner', icon: 'fa-fire', fans: 167, description: 'Team vs team debates', color: 'from-orange-500 to-orange-600' },
    { id: 'nostalgia', name: 'Memory Lane', icon: 'fa-history', fans: 134, description: 'Classic games & moments', color: 'from-purple-500 to-purple-600' },
    { id: 'playoffs', name: 'Playoff Central', icon: 'fa-trophy', fans: 289, description: 'Championship talk', color: 'from-yellow-500 to-yellow-600' }
  ];

  const mockFanActivity = [
    { user: '@CrimsonTide2025', action: 'Started heated debate about CFP rankings', time: '2m ago', avatar: 'fa-user', points: '+25' },
    { user: '@GeorgiaDawg', action: 'Predicted upset in Rivalry Corner', time: '5m ago', avatar: 'fa-user-circle', points: '+15' },
    { user: '@TexasLonghorn', action: 'Shared legendary 2005 Rose Bowl memory', time: '8m ago', avatar: 'fa-user-astronaut', points: '+10' },
    { user: '@OhioStateFan', action: 'Posted recruiting analysis in Main Plaza', time: '12m ago', avatar: 'fa-user-graduate', points: '+20' },
    { user: '@AlabamaFan', action: 'Won weekly prediction challenge', time: '15m ago', avatar: 'fa-user-ninja', points: '+100' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-extrabold mb-6">
              <span className="gradient-text">THE</span>
              <span className="block text-gray-800">COLOSSEUM</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
              Step into virtual stadium sections where passionate fans gather to debate, celebrate, and share the pure emotion of college football.
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-bold gradient-text mb-4">🎯 EARN POINTS FOR EVERY ACTION</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-green-600 font-bold">+25</div>
                  <div className="text-gray-600">Start Discussion</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">+15</div>
                  <div className="text-gray-600">Quality Reply</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">+10</div>
                  <div className="text-gray-600">Share Memory</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">+5</div>
                  <div className="text-gray-600">React/Like</div>
                </div>
              </div>
            </div>
            
            {/* Live Stats Bar */}
            <div className="mt-8 flex justify-center items-center space-x-8 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">{fanCount.toLocaleString()} Fans Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-comments text-red-500"></i>
                <span className="text-gray-700">342 Active Discussions</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-fire text-orange-500"></i>
                <span className="text-gray-700">89 Hot Takes</span>
              </div>
            </div>
          </div>

          {/* Stadium Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {stadiumSections.map((section) => (
              <div 
                key={section.id}
                onClick={() => setActiveStadium(section.id)}
                className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  activeStadium === section.id ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden">
                  {/* Section Header */}
                  <div className={`relative p-6 bg-gradient-to-br ${section.color} text-white`}>
                    <div className="flex items-center justify-between mb-3">
                      <i className={`fas ${section.icon} text-3xl`}></i>
                      <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                        <i className="fas fa-users"></i>
                        <span>{section.fans}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{section.name}</h3>
                    <p className="text-white/90 text-sm">{section.description}</p>
                    
                    {/* Activity Indicator */}
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Section Preview */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Sample Discussion Topics */}
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">Latest Hot Topic</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {section.id === 'rivalry' ? '"Alabama vs Georgia: Who has the better defense?"' :
                             section.id === 'recruiting' ? '"5-star QB just entered the portal..."' :
                             section.id === 'gameday' ? '"This interception just changed everything!"' :
                             section.id === 'playoffs' ? '"Playoff expansion thoughts?"' :
                             section.id === 'nostalgia' ? '"Remember the 2019 LSU season?"' :
                             '"CFP rankings are out - thoughts?"'}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>34 replies</span>
                            <span>12 reactions</span>
                            <span className="text-green-600 font-medium">+15 points</span>
                          </div>
                        </div>
                      </div>

                      {/* Join Button */}
                      <button className={`w-full py-3 bg-gradient-to-r ${section.color} text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 group`}>
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

          {/* Live Fan Activity Feed */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">🔥 Live Fan Activity</h3>
                  <p className="text-gray-300">Real-time fan movements across the Colosseum</p>
                </div>
                <div className="flex items-center space-x-2 bg-green-500 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">LIVE</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {mockFanActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <i className={`fas ${activity.avatar} text-white`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">{activity.user}</span>
                      <span className="text-gray-600">{activity.action}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-green-600">{activity.points}</span>
                    <button className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors">
                      Follow
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-center pt-4">
                <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
                  <i className="fas fa-plus mr-2"></i>
                  Start Your Own Discussion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheColosseum;
