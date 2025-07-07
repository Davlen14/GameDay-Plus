import React, { useState, useEffect } from 'react';

const FanHubCentral = () => {
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
    { id: 1, type: 'prediction', title: 'Correctly predicted Alabama vs Georgia', points: 150, time: '2 hours ago', icon: 'fa-crystal-ball' },
    { id: 2, type: 'discussion', title: 'Started debate in Rivalry Corner', points: 25, time: '4 hours ago', icon: 'fa-comments' },
    { id: 3, type: 'achievement', title: 'Unlocked "Prophet" badge', points: 500, time: '1 day ago', icon: 'fa-trophy' },
    { id: 4, type: 'prediction', title: 'Joined CFP Bracket Challenge', points: 0, time: '2 days ago', icon: 'fa-users' }
  ]);

  const [favoritePredictions, setFavoritePredictions] = useState([
    { id: 1, title: 'Weekly Gauntlet', participants: 15847, prize: '500 Fan Points', timeLeft: '2d 14h', progress: 60 },
    { id: 2, title: 'Upset Alert', participants: 8234, prize: '1000 Fan Points', timeLeft: '4d 22h', progress: 40 },
    { id: 3, title: 'Playoff Prophet', participants: 45678, prize: 'Season Champion Title', timeLeft: '1w 3d', progress: 80 }
  ]);

  const [hotDiscussions, setHotDiscussions] = useState([
    { id: 1, title: 'Alabama vs Georgia: Who has the better defense?', section: 'Rivalry Corner', replies: 234, heat: 'fire' },
    { id: 2, title: '5-star QB just entered the portal...', section: 'Recruiting Hub', replies: 189, heat: 'hot' },
    { id: 3, title: 'CFP rankings are out - thoughts?', section: 'Main Plaza', replies: 156, heat: 'trending' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/50 via-transparent to-red-600/50"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                FANHUB CENTRAL
              </span>
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto mb-8">
              Your personal command center for all GAMEDAY+ fan activities
            </p>
            
            {/* Enhanced Quick Stats Bar */}
            <div className="flex justify-center items-center space-x-8 text-sm font-medium">
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
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* The Colosseum Access */}
          <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
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
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    onClick={() => window.location.hash = 'the-colosseum'}
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Enter Stadium
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fan Prophecy Access */}
          <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Fan Prophecy</h3>
                    <p className="text-purple-100 text-sm mb-4">Test your prediction skills</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="bg-white/20 px-3 py-1 rounded-full">7 Active</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full">73% Accuracy</span>
                    </div>
                  </div>
                  <div className="text-5xl opacity-30">
                    <i className="fas fa-crystal-ball"></i>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <button 
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                    onClick={() => window.location.hash = 'fan-prophecy'}
                  >
                    <i className="fas fa-magic mr-2"></i>
                    Make Predictions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Stats */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
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

        {/* Activity & Predictions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
              <h3 className="text-2xl font-bold mb-2">🎯 Recent Activity</h3>
              <p className="text-gray-300">Your latest fan activities and achievements</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white">
                      <i className={`fas ${activity.icon} text-sm`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{activity.time}</span>
                        <span className="text-green-600 font-bold">+{activity.points}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Predictions */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
              <h3 className="text-2xl font-bold mb-2">🔮 Active Predictions</h3>
              <p className="text-purple-100">Your current prediction challenges</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {favoritePredictions.map((pred) => (
                  <div key={pred.id} className="p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{pred.title}</h4>
                      <span className="text-sm text-purple-600 font-bold">{pred.timeLeft}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{pred.participants.toLocaleString()} participants</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300" style={{width: `${pred.progress}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hot Discussions */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6">
            <h3 className="text-2xl font-bold mb-2">🔥 Hot Discussions</h3>
            <p className="text-orange-100">Trending topics across The Colosseum</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hotDiscussions.map((discussion) => (
                <div key={discussion.id} className="p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-orange-200 hover:border-orange-300 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm">{discussion.title}</h4>
                    {discussion.heat === 'fire' && <i className="fas fa-fire text-red-500"></i>}
                    {discussion.heat === 'hot' && <i className="fas fa-flame text-orange-500"></i>}
                    {discussion.heat === 'trending' && <i className="fas fa-trending-up text-blue-500"></i>}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{discussion.section}</div>
                  <div className="text-sm text-gray-600">{discussion.replies} replies</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanHubCentral;
