import React, { useState, useEffect } from 'react';

const FanProphecy = () => {
  const [selectedChallenge, setSelectedChallenge] = useState('weekly');
  const [userStreak, setUserStreak] = useState(7);
  const [userPoints, setUserPoints] = useState(2840);
  const [fanLevel, setFanLevel] = useState('Oracle');
  const [userAccuracy, setUserAccuracy] = useState(73.2);

  // User photos for avatars
  const userPhotos = [
    '/SportsbookLogos/Wedding.jpg',
    '/SportsbookLogos/Mclovin.jpg',
    '/SportsbookLogos/Nick.jpg',
    '/SportsbookLogos/NY.jpg',
    '/SportsbookLogos/SB.jpg',
    '/SportsbookLogos/CLE.jpg'
  ];

  // Modern theme colors - matching EVBettingView's sophisticated system
  const accentColor = 'rgb(204, 0, 28)';
  const metallicGradient = `linear-gradient(135deg, 
    rgb(255, 46, 74), 
    rgb(204, 0, 28), 
    rgb(161, 0, 20), 
    rgb(204, 0, 28), 
    rgb(255, 46, 74)
  )`;
  
  // Professional multi-stop gradient system like EVBettingView
  const professionalGradients = {
    red: `linear-gradient(135deg, 
      rgb(239, 68, 68), 
      rgb(220, 38, 38), 
      rgb(185, 28, 28), 
      rgb(220, 38, 38), 
      rgb(239, 68, 68)
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
      rgb(107, 33, 168), 
      rgb(126, 34, 206), 
      rgb(147, 51, 234)
    )`,
    orange: `linear-gradient(135deg, 
      rgb(251, 146, 60), 
      rgb(249, 115, 22), 
      rgb(234, 88, 12), 
      rgb(249, 115, 22), 
      rgb(251, 146, 60)
    )`
  };
  
  const glassEffect = 'rgba(255, 255, 255, 0.85)';
  const backdropBlur = 'blur(12px)';

  // Enhanced challenge types with modern styling
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
      color: professionalGradients.blue,
      shadowColor: 'rgba(59, 130, 246, 0.3)',
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
      color: professionalGradients.orange,
      shadowColor: 'rgba(251, 146, 60, 0.3)',
      progress: 40,
      type: 'predictions'
    },
    {
      id: 'poll',
      name: 'Heisman Prophet',
      icon: 'fa-trophy',
      description: 'Predict award winners & rankings',
      participants: 23456,
      prize: 'Exclusive Badge',
      difficulty: 'Expert',
      timeLeft: '1w 3d',
      status: 'upcoming',
      color: professionalGradients.gold,
      shadowColor: 'rgba(250, 204, 21, 0.3)',
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
      color: professionalGradients.purple,
      shadowColor: 'rgba(147, 51, 234, 0.3)',
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
      color: professionalGradients.green,
      shadowColor: 'rgba(34, 197, 94, 0.3)',
      progress: 90,
      type: 'polls'
    }
  ];

  const myRecentPredictions = [
    { 
      game: 'Alabama vs Georgia', 
      prediction: 'Alabama -3.5', 
      result: 'correct', 
      points: 150, 
      accuracy: true,
      homeTeam: 'Alabama',
      awayTeam: 'Georgia',
      homelogo: '/team_logos/alabama.png',
      awaylogo: '/team_logos/georgia.png',
      predictor: 'You',
      predictorPhoto: userPhotos[0],
      time: '2 hours ago'
    },
    { 
      game: 'Ohio State vs Michigan', 
      prediction: 'Under 48.5', 
      result: 'correct', 
      points: 120, 
      accuracy: true,
      homeTeam: 'Ohio State',
      awayTeam: 'Michigan',
      homelogo: '/team_logos/ohio_state.png',
      awaylogo: '/team_logos/michigan.png',
      predictor: 'You',
      predictorPhoto: userPhotos[1],
      time: '4 hours ago'
    },
    { 
      game: 'Texas vs Oklahoma', 
      prediction: 'Texas ML', 
      result: 'wrong', 
      points: 0, 
      accuracy: false,
      homeTeam: 'Texas',
      awayTeam: 'Oklahoma',
      homelogo: '/team_logos/texas.png',
      awaylogo: '/team_logos/oklahoma.png',
      predictor: 'You',
      predictorPhoto: userPhotos[2],
      time: '6 hours ago'
    },
    { 
      game: 'Clemson vs FSU', 
      prediction: 'Clemson -14', 
      result: 'correct', 
      points: 100, 
      accuracy: true,
      homeTeam: 'Clemson',
      awayTeam: 'FSU',
      homelogo: '/team_logos/clemson.png',
      awaylogo: '/team_logos/fsu.png',
      predictor: 'You',
      predictorPhoto: userPhotos[3],
      time: '8 hours ago'
    },
    { 
      game: 'Heisman Winner Poll', 
      prediction: 'Caleb Williams', 
      result: 'pending', 
      points: 0, 
      accuracy: null,
      homeTeam: null,
      awayTeam: null,
      homelogo: null,
      awaylogo: null,
      predictor: 'You',
      predictorPhoto: userPhotos[4],
      time: '1 day ago'
    }
  ];

  const leaderboard = [
    { 
      rank: 1, 
      user: 'CFBOracle2025', 
      points: 8945, 
      streak: 12, 
      badge: 'Legendary', 
      accuracy: 89.2,
      userPhoto: userPhotos[0]
    },
    { 
      rank: 2, 
      user: 'UpsetKing', 
      points: 8721, 
      streak: 8, 
      badge: 'Expert', 
      accuracy: 76.8,
      userPhoto: userPhotos[1]
    },
    { 
      rank: 3, 
      user: 'GridironGuru', 
      points: 8456, 
      streak: 15, 
      badge: 'Expert', 
      accuracy: 81.4,
      userPhoto: userPhotos[2]
    },
    { 
      rank: 4, 
      user: 'YOU', 
      points: userPoints, 
      streak: userStreak, 
      badge: fanLevel, 
      accuracy: userAccuracy,
      userPhoto: userPhotos[3]
    },
    { 
      rank: 5, 
      user: 'SECMaster', 
      points: 8102, 
      streak: 6, 
      badge: 'Expert', 
      accuracy: 74.5,
      userPhoto: userPhotos[4]
    }
  ];

  const achievements = [
    { id: 1, name: 'Prophet Initiate', description: 'Made your first prediction', icon: 'fa-star', earned: true },
    { id: 2, name: 'Streak Master', description: '5 correct predictions in a row', icon: 'fa-fire', earned: true },
    { id: 3, name: 'Oracle Vision', description: '75% accuracy over 50 predictions', icon: 'fa-eye', earned: true },
    { id: 4, name: 'Upset Detector', description: 'Correctly predicted 3 major upsets', icon: 'fa-exclamation-triangle', earned: false },
    { id: 5, name: 'Legend Status', description: '90% accuracy over 100 predictions', icon: 'fa-crown', earned: false }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)' }}>
      {/* Hero Section */}
      <div className="relative pt-32 pb-20" style={{ width: '97%', margin: '0 auto' }}>
        <div className="w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-4 mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                style={{
                  background: metallicGradient,
                  boxShadow: '0 8px 32px rgba(255, 46, 74, 0.3)'
                }}
              >
                <i 
                  className="fas fa-crystal-ball text-white text-3xl"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                ></i>
              </div>
              <div>
                <h1 className="text-6xl font-extrabold text-left">
                  <span 
                    className="block"
                    style={{
                      background: metallicGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    FAN
                  </span>
                  <span 
                    className="block"
                    style={{
                      background: 'linear-gradient(135deg, #1f2937, #374151, #4b5563)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    PROPHECY
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Prove your college football knowledge against thousands of fans. Predict games, vote in polls, climb the leaderboards. Glory awaits the bold.
            </p>
            
            {/* Enhanced User Stats */}
            <div 
              className="rounded-xl p-6 border shadow-xl max-w-4xl mx-auto"
              style={{
                background: glassEffect,
                backdropFilter: backdropBlur,
                WebkitBackdropFilter: backdropBlur,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div 
                    className="text-3xl font-black"
                    style={{
                      background: metallicGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {fanLevel}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Prophet Level</div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-3xl font-black"
                    style={{
                      background: professionalGradients.green,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {userPoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Points</div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-3xl font-black"
                    style={{
                      background: professionalGradients.gold,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {userStreak}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Day Streak</div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-3xl font-black"
                    style={{
                      background: professionalGradients.blue,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {userAccuracy}%
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Accuracy</div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-3xl font-black"
                    style={{
                      background: professionalGradients.purple,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    #{leaderboard.findIndex(user => user.user === 'YOU') + 1}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Global Rank</div>
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Categories Filter */}
          <div className="flex justify-center mb-12">
            <div 
              className="rounded-xl p-2 shadow-lg border"
              style={{
                background: glassEffect,
                backdropFilter: backdropBlur,
                WebkitBackdropFilter: backdropBlur,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedChallenge('all')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedChallenge === 'all' 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={selectedChallenge === 'all' ? {
                    background: metallicGradient,
                    boxShadow: '0 4px 12px rgba(255, 46, 74, 0.3)'
                  } : {}}
                >
                  All Challenges
                </button>
                <button 
                  onClick={() => setSelectedChallenge('predictions')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedChallenge === 'predictions' 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={selectedChallenge === 'predictions' ? {
                    background: metallicGradient,
                    boxShadow: '0 4px 12px rgba(255, 46, 74, 0.3)'
                  } : {}}
                >
                  <i className="fas fa-crystal-ball mr-2"></i>
                  Game Predictions
                </button>
                <button 
                  onClick={() => setSelectedChallenge('polls')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedChallenge === 'polls' 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={selectedChallenge === 'polls' ? {
                    background: metallicGradient,
                    boxShadow: '0 4px 12px rgba(255, 46, 74, 0.3)'
                  } : {}}
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
              <h2 
                className="text-3xl font-bold flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #1f2937, #374151, #4b5563)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <i 
                  className="fas fa-bullseye"
                  style={{
                    background: metallicGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                ></i>
                Active Challenges
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="fas fa-users"></i>
                <span className="font-medium">47,215 total participants</span>
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
                  <div 
                    className="rounded-xl shadow-xl hover:shadow-2xl border overflow-hidden h-full"
                    style={{
                      background: glassEffect,
                      backdropFilter: backdropBlur,
                      WebkitBackdropFilter: backdropBlur,
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Challenge Header */}
                    <div 
                      className="relative p-6 text-white"
                      style={{
                        background: challenge.color,
                        boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px ${challenge.shadowColor}`
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <i 
                          className={`fas ${challenge.icon} text-3xl`}
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                          }}
                        ></i>
                        <span 
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            challenge.status === 'active' 
                              ? 'bg-green-400 text-green-900' 
                              : 'bg-yellow-400 text-yellow-900'
                          }`}
                          style={{
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          {challenge.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 
                        className="text-xl font-bold mb-2"
                        style={{
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {challenge.name}
                      </h3>
                      <p 
                        className="text-white/90 text-sm"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        {challenge.description}
                      </p>
                      
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
                          <div 
                            className="text-lg font-bold"
                            style={{
                              background: 'linear-gradient(135deg, #1f2937, #374151)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {challenge.participants.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Participants</div>
                        </div>
                        <div className="text-center">
                          <div 
                            className="text-lg font-bold"
                            style={{
                              background: 'linear-gradient(135deg, #1f2937, #374151)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {challenge.difficulty}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Difficulty</div>
                        </div>
                      </div>
                      
                      {/* Prize */}
                      <div 
                        className="rounded-lg p-3 mb-4 border"
                        style={{
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)'
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <i 
                            className="fas fa-trophy"
                            style={{
                              background: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          ></i>
                          <span 
                            className="text-sm font-medium"
                            style={{
                              background: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            Prize: {challenge.prize}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span className="font-medium">Your Progress</span>
                          <span className="font-bold">{challenge.progress}%</span>
                        </div>
                        <div 
                          className="w-full bg-gray-200 rounded-full h-2"
                          style={{
                            background: 'rgba(229, 231, 235, 0.8)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)'
                          }}
                        >
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${challenge.progress}%`,
                              background: challenge.color,
                              boxShadow: `0 2px 4px ${challenge.shadowColor}`
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        className="w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                        style={{
                          background: challenge.color,
                          boxShadow: `0 4px 12px ${challenge.shadowColor}`
                        }}
                      >
                        {challenge.status === 'active' ? 'Join Challenge' : 'Coming Soon'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Recent Predictions */}
            <div 
              className="rounded-xl shadow-xl border overflow-hidden"
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
                <h3 
                  className="text-2xl font-bold mb-2 flex items-center gap-3"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  <i 
                    className="fas fa-chart-line"
                    style={{
                      background: metallicGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  ></i>
                  My Recent Predictions
                </h3>
                <p 
                  className="text-gray-300"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  Track your latest prophecies
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {myRecentPredictions.map((prediction, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
                      style={{
                        background: 'rgba(249, 250, 251, 0.8)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        {/* User Photo */}
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0">
                          <img 
                            src={prediction.predictorPhoto} 
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

                        {/* Team Logos (if available) */}
                        {prediction.homeTeam && prediction.awayTeam && (
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                              <img 
                                src={prediction.awaylogo} 
                                alt={prediction.awayTeam} 
                                className="w-full h-full object-contain filter drop-shadow-md hover:drop-shadow-lg transition-all duration-300 hover:scale-110"
                                style={{
                                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12)) contrast(1.1) saturate(1.15)',
                                  imageRendering: 'crisp-edges'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div 
                                className="w-8 h-8 flex items-center justify-center rounded-lg"
                                style={{
                                  background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234))',
                                  boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
                                  display: 'none'
                                }}
                              >
                                <i className="fas fa-football-ball text-white text-sm"></i>
                              </div>
                            </div>
                            <div 
                              className="text-xs font-bold px-2 py-1 rounded"
                              style={{
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.2))',
                                color: 'rgb(239, 68, 68)',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                            >
                              VS
                            </div>
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                              <img 
                                src={prediction.homelogo} 
                                alt={prediction.homeTeam} 
                                className="w-full h-full object-contain filter drop-shadow-md hover:drop-shadow-lg transition-all duration-300 hover:scale-110"
                                style={{
                                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12)) contrast(1.1) saturate(1.15)',
                                  imageRendering: 'crisp-edges'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div 
                                className="w-8 h-8 flex items-center justify-center rounded-lg"
                                style={{
                                  background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(245, 158, 11))',
                                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
                                  display: 'none'
                                }}
                              >
                                <i className="fas fa-football-ball text-white text-sm"></i>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex-1">
                          <div 
                            className="font-semibold"
                            style={{
                              background: 'linear-gradient(135deg, #1f2937, #374151)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {prediction.game}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">{prediction.prediction}</div>
                          <div className="text-xs text-gray-500 mt-1">{prediction.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            prediction.result === 'correct' 
                              ? 'bg-green-100 text-green-700' 
                              : prediction.result === 'wrong' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                          style={{
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)'
                          }}
                        >
                          {prediction.result.toUpperCase()}
                        </div>
                        <div 
                          className="text-sm font-bold"
                          style={{
                            background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          +{prediction.points}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div 
              className="rounded-xl shadow-xl border overflow-hidden"
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
                  background: professionalGradients.gold,
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <h3 
                  className="text-2xl font-bold mb-2 flex items-center gap-3"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  <i 
                    className="fas fa-crown"
                    style={{
                      background: professionalGradients.gold,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  ></i>
                  Global Leaderboard
                </h3>
                <p 
                  className="text-yellow-100"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  Top prophets this season
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
                        user.user === 'YOU' 
                          ? 'border-2' 
                          : ''
                      }`}
                      style={{
                        background: user.user === 'YOU' 
                          ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(147, 51, 234, 0.05))'
                          : 'rgba(249, 250, 251, 0.8)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: user.user === 'YOU' 
                          ? '2px solid rgba(147, 51, 234, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            user.rank <= 3 
                              ? 'text-white' 
                              : user.user === 'YOU' 
                                ? 'text-white' 
                                : 'text-gray-700'
                          }`}
                          style={{
                            background: user.rank <= 3 
                              ? 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))'
                              : user.user === 'YOU' 
                                ? 'linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206))'
                                : 'linear-gradient(135deg, rgb(156, 163, 175), rgb(107, 114, 128))',
                            boxShadow: user.rank <= 3 || user.user === 'YOU' 
                              ? '0 2px 8px rgba(0,0,0,0.3)' 
                              : '0 1px 3px rgba(0,0,0,0.2)'
                          }}
                        >
                          #{user.rank}
                        </div>
                        
                        {/* User Photo */}
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0">
                          <img 
                            src={user.userPhoto} 
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
                              background: user.user === 'YOU' 
                                ? 'linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206))'
                                : 'linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234))',
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                              display: 'none'
                            }}
                          >
                            <i className="fas fa-user text-white text-sm"></i>
                          </div>
                        </div>
                        
                        <div>
                          <div 
                            className="font-semibold"
                            style={{
                              background: 'linear-gradient(135deg, #1f2937, #374151)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {user.user}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">{user.accuracy}% accuracy</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #1f2937, #374151)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          {user.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">{user.streak} streak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div 
            className="mt-12 rounded-xl shadow-xl border overflow-hidden"
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
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <h3 
                className="text-2xl font-bold mb-2 flex items-center gap-3"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                <i 
                  className="fas fa-trophy"
                  style={{
                    background: metallicGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                ></i>
                Prophet Achievements
              </h3>
              <p 
                className="text-purple-100"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Unlock badges and titles as you master the art of prediction
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                      achievement.earned ? 'hover:scale-105' : 'opacity-75'
                    }`}
                    style={{
                      background: achievement.earned 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))'
                        : 'rgba(249, 250, 251, 0.6)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: achievement.earned 
                        ? '2px solid rgba(245, 158, 11, 0.3)'
                        : '2px solid rgba(156, 163, 175, 0.3)'
                    }}
                  >
                    <div className="text-center">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                          achievement.earned ? 'text-white' : 'text-gray-600'
                        }`}
                        style={{
                          background: achievement.earned 
                            ? professionalGradients.gold
                            : 'linear-gradient(135deg, rgb(156, 163, 175), rgb(107, 114, 128))',
                          boxShadow: achievement.earned 
                            ? '0 4px 12px rgba(250, 204, 21, 0.4)'
                            : '0 2px 4px rgba(156, 163, 175, 0.3)'
                        }}
                      >
                        <i className={`fas ${achievement.icon}`}></i>
                      </div>
                      <div 
                        className={`font-bold text-sm ${
                          achievement.earned ? '' : 'text-gray-600'
                        }`}
                        style={achievement.earned ? {
                          background: professionalGradients.gold,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        } : {}}
                      >
                        {achievement.name}
                      </div>
                      <div 
                        className={`text-xs mt-1 ${
                          achievement.earned ? '' : 'text-gray-500'
                        }`}
                        style={achievement.earned ? {
                          background: 'linear-gradient(135deg, rgb(217, 119, 6), rgb(180, 83, 9))',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        } : {}}
                      >
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
