import React, { useState, useEffect } from 'react';

const FanProphecy = () => {
  const [selectedChallenge, setSelectedChallenge] = useState('all');
  const [userStreak, setUserStreak] = useState(7);
  const [userPoints, setUserPoints] = useState(2840);
  const [fanLevel, setFanLevel] = useState('Oracle');
  const [userAccuracy, setUserAccuracy] = useState(73.2);

  // Enhanced challenge types with polls integration
  const challenges = [
    {
      id: 'weekly',
      name: 'Weekly Gauntlet',
      icon: 'fa-calendar-week',
      description: 'Predict 5 key games + weekly polls',
      participants: 15847,
      prize: '500 Fan Points',
      difficulty: 'Medium',
      timeLeft: '2d 14h',
      status: 'active',
      color: 'from-blue-500 to-blue-600',
      progress: 60,
      type: 'predictions'
    },
    {
      id: 'upset',
      name: 'Upset Alert Oracle',
      icon: 'fa-exclamation-triangle',
      description: 'Spot upsets + vote on biggest surprises',
      participants: 8234,
      prize: '1000 Fan Points',
      difficulty: 'Hard',
      timeLeft: '4d 22h',
      status: 'active',
      color: 'from-orange-500 to-orange-600',
      progress: 40,
      type: 'predictions'
    },
    {
      id: 'heisman',
      name: 'Heisman Prophet',
      icon: 'fa-trophy',
      description: 'Predict award winners & rankings',
      participants: 23456,
      prize: 'Exclusive Badge',
      difficulty: 'Expert',
      timeLeft: '1w 3d',
      status: 'active',
      color: 'from-yellow-500 to-yellow-600',
      progress: 80,
      type: 'polls'
    },
    {
      id: 'playoff',
      name: 'Playoff Prophet',
      icon: 'fa-crown',
      description: 'Predict entire CFP bracket + champion',
      participants: 45678,
      prize: 'Season Champion Title',
      difficulty: 'Legendary',
      timeLeft: '2w 1d',
      status: 'upcoming',
      color: 'from-purple-500 to-purple-600',
      progress: 20,
      type: 'predictions'
    },
    {
      id: 'ranking',
      name: 'Ranking Sage',
      icon: 'fa-list-ol',
      description: 'Predict final AP Poll rankings',
      participants: 12456,
      prize: '750 Fan Points',
      difficulty: 'Hard',
      timeLeft: '5d 8h',
      status: 'active',
      color: 'from-green-500 to-green-600',
      progress: 90,
      type: 'polls'
    }
  ];

  const myRecentPredictions = [
    { game: 'Alabama vs Georgia', prediction: 'Alabama -3.5', result: 'correct', points: 150, accuracy: true },
    { game: 'Ohio State vs Michigan', prediction: 'Under 48.5', result: 'correct', points: 120, accuracy: true },
    { game: 'Texas vs Oklahoma', prediction: 'Texas ML', result: 'wrong', points: 0, accuracy: false },
    { game: 'Clemson vs FSU', prediction: 'Clemson -14', result: 'correct', points: 100, accuracy: true },
    { game: 'Heisman Winner Poll', prediction: 'Caleb Williams', result: 'pending', points: 0, accuracy: null }
  ];

  const leaderboard = [
    { rank: 1, user: 'CFBOracle2025', points: 8945, streak: 12, badge: 'Legendary', accuracy: 89.2 },
    { rank: 2, user: 'UpsetKing', points: 8721, streak: 8, badge: 'Expert', accuracy: 76.8 },
    { rank: 3, user: 'GridironGuru', points: 8456, streak: 15, badge: 'Expert', accuracy: 81.4 },
    { rank: 4, user: 'YOU', points: userPoints, streak: userStreak, badge: fanLevel, accuracy: userAccuracy },
    { rank: 5, user: 'SECMaster', points: 8102, streak: 6, badge: 'Expert', accuracy: 74.5 }
  ];

  const achievements = [
    { id: 1, name: 'Prophet Initiate', description: 'Made your first prediction', icon: 'fa-star', earned: true },
    { id: 2, name: 'Streak Master', description: '5 correct predictions in a row', icon: 'fa-fire', earned: true },
    { id: 3, name: 'Oracle Vision', description: '75% accuracy over 50 predictions', icon: 'fa-eye', earned: true },
    { id: 4, name: 'Upset Detector', description: 'Correctly predicted 3 major upsets', icon: 'fa-exclamation-triangle', earned: false },
    { id: 5, name: 'Legend Status', description: '90% accuracy over 100 predictions', icon: 'fa-crown', earned: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                <i className="fas fa-crystal-ball text-white text-3xl"></i>
              </div>
              <div>
                <h1 className="text-6xl font-extrabold text-left">
                  <span className="gradient-text">FAN</span>
                  <span className="block text-gray-800">PROPHECY</span>
                </h1>
              </div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Prove your college football knowledge against thousands of fans. Predict games, vote in polls, climb the leaderboards. Glory awaits the bold.
            </p>
            
            {/* Enhanced User Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-xl max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black gradient-text">{fanLevel}</div>
                  <div className="text-sm text-gray-600 font-medium">Prophet Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-green-600">{userPoints.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-orange-600">{userStreak}</div>
                  <div className="text-sm text-gray-600 font-medium">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-600">{userAccuracy}%</div>
                  <div className="text-sm text-gray-600 font-medium">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-600">#{leaderboard.findIndex(user => user.user === 'YOU') + 1}</div>
                  <div className="text-sm text-gray-600 font-medium">Global Rank</div>
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Categories Filter */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedChallenge('all')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedChallenge === 'all' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Challenges
                </button>
                <button 
                  onClick={() => setSelectedChallenge('predictions')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedChallenge === 'predictions' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-crystal-ball mr-2"></i>
                  Game Predictions
                </button>
                <button 
                  onClick={() => setSelectedChallenge('polls')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedChallenge === 'polls' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-poll mr-2"></i>
                  Fan Polls
                </button>
              </div>
            </div>
          </div>

          {/* Active Challenges */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">🎯 Active Challenges</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="fas fa-users"></i>
                <span>47,215 total participants</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.filter(challenge => 
                selectedChallenge === 'all' || 
                selectedChallenge === challenge.type || 
                selectedChallenge === challenge.id
              ).map((challenge) => (
                <div 
                  key={challenge.id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-gray-100 overflow-hidden h-full">
                    {/* Challenge Header */}
                    <div className={`relative p-6 bg-gradient-to-br ${challenge.color} text-white`}>
                      <div className="flex items-center justify-between mb-3">
                        <i className={`fas ${challenge.icon} text-3xl`}></i>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          challenge.status === 'active' ? 'bg-green-400 text-green-900' :
                          'bg-yellow-400 text-yellow-900'
                        }`}>
                          {challenge.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{challenge.name}</h3>
                      <p className="text-white/90 text-sm">{challenge.description}</p>
                      
                      {/* Time remaining */}
                      <div className="mt-3 flex items-center space-x-2 text-sm">
                        <i className="fas fa-clock"></i>
                        <span>{challenge.timeLeft} remaining</span>
                      </div>
                    </div>

                    {/* Challenge Stats */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800">{challenge.participants.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Participants</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800">{challenge.difficulty}</div>
                          <div className="text-sm text-gray-600">Difficulty</div>
                        </div>
                      </div>
                      
                      {/* Prize */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-trophy text-yellow-600"></i>
                          <span className="text-sm font-medium text-yellow-800">Prize: {challenge.prize}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Your Progress</span>
                          <span>{challenge.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${challenge.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${challenge.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className={`w-full py-3 bg-gradient-to-r ${challenge.color} text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200`}>
                        {challenge.status === 'active' ? 'Join Challenge' : 'Coming Soon'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* My Recent Predictions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                <h3 className="text-2xl font-bold mb-2">📈 My Recent Predictions</h3>
                <p className="text-purple-100">Track your prophecy accuracy</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {myRecentPredictions.map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{prediction.game}</div>
                        <div className="text-sm text-gray-600">{prediction.prediction}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          prediction.result === 'correct' ? 'bg-green-100 text-green-700' :
                          prediction.result === 'wrong' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {prediction.result.toUpperCase()}
                        </div>
                        <div className="text-sm font-bold text-green-600">+{prediction.points}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Global Leaderboard */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
                <h3 className="text-2xl font-bold mb-2">🏆 Prophet Leaderboard</h3>
                <p className="text-yellow-100">Top oracles this season</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                      user.user === 'YOU' ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          user.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                          user.user === 'YOU' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          #{user.rank}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{user.user}</div>
                          <div className="text-xs text-gray-600">{user.accuracy}% accuracy • {user.badge}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{user.points.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">{user.streak} streak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <h3 className="text-2xl font-bold mb-2">🏅 Prophet Achievements</h3>
              <p className="text-indigo-100">Unlock legendary titles through your prediction mastery</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    achievement.earned 
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 hover:shadow-lg transform hover:scale-105' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        achievement.earned 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        <i className={`fas ${achievement.icon}`}></i>
                      </div>
                      <div className={`font-bold text-sm ${achievement.earned ? 'text-yellow-800' : 'text-gray-600'}`}>
                        {achievement.name}
                      </div>
                      <div className={`text-xs mt-1 ${achievement.earned ? 'text-yellow-700' : 'text-gray-500'}`}>
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanProphecy;
