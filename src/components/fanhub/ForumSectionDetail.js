import React, { useState } from 'react';

const ForumSectionDetail = ({ sectionId }) => {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showReplies, setShowReplies] = useState({});
  const [newPost, setNewPost] = useState('');
  const [newReply, setNewReply] = useState({});

  // User photos for avatars - same as FanForums
  const userPhotos = [
    '/SportsbookLogos/Wedding.jpg',
    '/SportsbookLogos/Mclovin.jpg',
    '/SportsbookLogos/Nick.jpg',
    '/SportsbookLogos/NY.jpg',
    '/SportsbookLogos/SB.jpg',
    '/SportsbookLogos/CLE.jpg',
    '/SportsbookLogos/ASU.jpg',
    '/SportsbookLogos/Allstate.jpg',
    '/SportsbookLogos/Aly.jpg',
    '/SportsbookLogos/Asmith.jpg',
    '/SportsbookLogos/Dan.jpeg',
    '/SportsbookLogos/Erin Dolan.jpg',
    '/SportsbookLogos/Graig.jpg',
    '/SportsbookLogos/JoellKlat.jpg',
    '/SportsbookLogos/Kstate.jpg',
    '/SportsbookLogos/LouisR.jpg',
    '/SportsbookLogos/Michiganfan.jpg',
    '/SportsbookLogos/NIUALUM.jpg',
    '/SportsbookLogos/Patrick.jpg',
    '/SportsbookLogos/UT.jpeg',
    '/SportsbookLogos/annie.jpeg',
    '/SportsbookLogos/leeC.png',
    '/SportsbookLogos/osufan.jpg',
    '/SportsbookLogos/pollack.jpg'
  ];

  // Professional gradient system
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
    silver: `linear-gradient(135deg, 
      rgb(148, 163, 184), 
      rgb(100, 116, 139), 
      rgb(71, 85, 105), 
      rgb(100, 116, 139), 
      rgb(148, 163, 184)
    )`,
    orange: `linear-gradient(135deg, 
      rgb(251, 146, 60), 
      rgb(249, 115, 22), 
      rgb(234, 88, 12), 
      rgb(249, 115, 22), 
      rgb(251, 146, 60)
    )`,
    teal: `linear-gradient(135deg, 
      rgb(20, 184, 166), 
      rgb(13, 148, 136), 
      rgb(15, 118, 110), 
      rgb(13, 148, 136), 
      rgb(20, 184, 166)
    )`,
    bronze: `linear-gradient(135deg, 
      rgb(180, 83, 9), 
      rgb(154, 52, 18), 
      rgb(120, 53, 15), 
      rgb(154, 52, 18), 
      rgb(180, 83, 9)
    )`,
    indigo: `linear-gradient(135deg, 
      rgb(99, 102, 241), 
      rgb(79, 70, 229), 
      rgb(67, 56, 202), 
      rgb(79, 70, 229), 
      rgb(99, 102, 241)
    )`,
    emerald: `linear-gradient(135deg, 
      rgb(16, 185, 129), 
      rgb(5, 150, 105), 
      rgb(4, 120, 87), 
      rgb(5, 150, 105), 
      rgb(16, 185, 129)
    )`
  };

  // Section configurations
  const sectionConfig = {
    main: { 
      name: 'Main Plaza', 
      icon: 'fa-landmark', 
      description: 'General CFB discussion', 
      color: professionalGradients.red,
      shadowColor: 'rgba(239, 68, 68, 0.3)'
    },
    gameweek: { 
      name: 'Game of the Week', 
      icon: 'fa-star', 
      description: 'Weekly marquee matchup talk', 
      color: professionalGradients.gold,
      shadowColor: 'rgba(250, 204, 21, 0.3)'
    },
    betting: { 
      name: 'Betting Insights', 
      icon: 'fa-chart-line', 
      description: 'Lines, spreads & picks', 
      color: professionalGradients.emerald,
      shadowColor: 'rgba(16, 185, 129, 0.3)'
    },
    gameday: { 
      name: 'GameDay Central', 
      icon: 'fa-calendar', 
      description: 'Live game reactions', 
      color: professionalGradients.blue,
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    recruiting: { 
      name: 'Recruiting Hub', 
      icon: 'fa-graduation-cap', 
      description: 'Prospect tracking', 
      color: professionalGradients.green,
      shadowColor: 'rgba(34, 197, 94, 0.3)'
    },
    rivalry: { 
      name: 'Rivalry Corner', 
      icon: 'fa-fire', 
      description: 'Team vs team debates', 
      color: professionalGradients.orange,
      shadowColor: 'rgba(251, 146, 60, 0.3)'
    },
    nostalgia: { 
      name: 'Memory Lane', 
      icon: 'fa-history', 
      description: 'Classic games & moments', 
      color: professionalGradients.silver,
      shadowColor: 'rgba(148, 163, 184, 0.3)'
    },
    playoffs: { 
      name: 'Playoff Central', 
      icon: 'fa-trophy', 
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
    transfer: { 
      name: 'Transfer Portal', 
      icon: 'fa-exchange-alt', 
      description: 'Portal moves & rumors', 
      color: professionalGradients.teal,
      shadowColor: 'rgba(20, 184, 166, 0.3)'
    },
    coaching: { 
      name: 'Coaching Corner', 
      icon: 'fa-chalkboard-teacher', 
      description: 'Coach hires & strategy', 
      color: professionalGradients.bronze,
      shadowColor: 'rgba(180, 83, 9, 0.3)'
    },
    draft: { 
      name: 'NFL Draft Zone', 
      icon: 'fa-football-ball', 
      description: 'Draft prospects & analysis', 
      color: professionalGradients.indigo,
      shadowColor: 'rgba(99, 102, 241, 0.3)'
    },
    impact: { 
      name: 'Impact Players', 
      icon: 'fa-star', 
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
  };

  const currentSection = sectionConfig[sectionId];
  const glassEffect = 'rgba(255, 255, 255, 0.85)';
  const backdropBlur = 'blur(12px)';

  // Mock forum posts data
  const forumPosts = {
    main: [
      {
        id: 1,
        user: '@CFBAnalyst',
        avatar: userPhotos[0],
        time: '2 hours ago',
        content: 'CFP rankings are out - thoughts? I think Oregon got snubbed again. They have one of the best offenses in the country and their only loss came in overtime.',
        likes: 47,
        replies: 23,
        replyData: [
          { user: '@DuckNation', avatar: userPhotos[1], time: '1h ago', content: 'Totally agree! Oregon\'s offense is unstoppable this year!', likes: 12 },
          { user: '@SECFan', avatar: userPhotos[2], time: '45m ago', content: 'Sorry but Oregon hasn\'t played anyone tough this season', likes: 8 },
          { user: '@Pac12Power', avatar: userPhotos[3], time: '30m ago', content: 'Did you see their performance against USC? Pure dominance!', likes: 15 }
        ]
      },
      {
        id: 2,
        user: '@ConferenceKing',
        avatar: userPhotos[4],
        time: '4 hours ago',
        content: 'Which conference is strongest this year? SEC vs Big Ten debate is heating up. Big Ten has been looking really strong with Michigan and Ohio State.',
        likes: 89,
        replies: 45,
        replyData: [
          { user: '@SECDominant', avatar: userPhotos[5], time: '3h ago', content: 'SEC still has the most depth. Alabama, Georgia, LSU all looking strong', likes: 23 },
          { user: '@BigTenBias', avatar: userPhotos[6], time: '2h ago', content: 'Big Ten East is absolutely loaded this year', likes: 18 }
        ]
      }
    ],
    gameday: [
      {
        id: 1,
        user: '@LiveReactions',
        avatar: userPhotos[7],
        time: '15 minutes ago',
        content: 'This interception just changed everything! What a pick by the safety! Game completely flipped in one play. This is why I love college football!',
        likes: 156,
        replies: 67,
        replyData: [
          { user: '@DefenseFirst', avatar: userPhotos[8], time: '10m ago', content: 'Best defensive play I\'ve seen all season!', likes: 34 },
          { user: '@GameChanger', avatar: userPhotos[9], time: '8m ago', content: 'Called that pick coming! QB was staring down his receiver', likes: 22 }
        ]
      }
    ],
    recruiting: [
      {
        id: 1,
        user: '@RecruitTracker',
        avatar: userPhotos[10],
        time: '1 hour ago',
        content: '5-star QB just entered the portal... 👀 This could shake up the entire recruiting landscape. Multiple blue-blood programs already reaching out.',
        likes: 234,
        replies: 89,
        replyData: [
          { user: '@PortalWatch', avatar: userPhotos[11], time: '45m ago', content: 'Which school do you think lands him?', likes: 45 },
          { user: '@RecruitGuru', avatar: userPhotos[12], time: '30m ago', content: 'My sources say it\'s between Texas and Alabama', likes: 67 }
        ]
      }
    ]
  };

  // Generate random replies for other sections
  const generateMockReplies = (count) => {
    const replies = [];
    for (let i = 0; i < count; i++) {
      replies.push({
        user: `@User${Math.floor(Math.random() * 1000)}`,
        avatar: userPhotos[Math.floor(Math.random() * userPhotos.length)],
        time: `${Math.floor(Math.random() * 60) + 1}m ago`,
        content: 'Great point! I totally agree with your analysis.',
        likes: Math.floor(Math.random() * 50) + 1
      });
    }
    return replies;
  };

  // Get posts for current section
  const getCurrentPosts = () => {
    if (forumPosts[sectionId]) {
      return forumPosts[sectionId];
    }
    
    // Generate mock posts for sections without specific data
    return [
      {
        id: 1,
        user: `@${currentSection?.name.replace(/\s+/g, '')}Fan`,
        avatar: userPhotos[Math.floor(Math.random() * userPhotos.length)],
        time: '2 hours ago',
        content: `Great discussion happening in ${currentSection?.name}! What are everyone's thoughts on the latest developments?`,
        likes: Math.floor(Math.random() * 100) + 20,
        replies: Math.floor(Math.random() * 50) + 10,
        replyData: generateMockReplies(3)
      },
      {
        id: 2,
        user: `@Expert${Math.floor(Math.random() * 100)}`,
        avatar: userPhotos[Math.floor(Math.random() * userPhotos.length)],
        time: '4 hours ago',
        content: `Here's my take on the situation... I think we're seeing some interesting trends here.`,
        likes: Math.floor(Math.random() * 80) + 15,
        replies: Math.floor(Math.random() * 30) + 5,
        replyData: generateMockReplies(2)
      }
    ];
  };

  const posts = getCurrentPosts();
  const displayedPosts = showAllPosts ? posts : posts.slice(0, 3);

  const toggleReplies = (postId) => {
    setShowReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleNewReply = (postId) => {
    if (newReply[postId]?.trim()) {
      // Here you would normally send to backend
      console.log('New reply:', newReply[postId]);
      setNewReply(prev => ({ ...prev, [postId]: '' }));
    }
  };

  if (!currentSection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Forum Section Not Found</h1>
          <button 
            onClick={() => window.location.hash = 'fan-forums'}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Forums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)' }}>
      {/* Header with section theme */}
      <div 
        className="relative pt-32 pb-16"
        style={{
          background: currentSection.color,
          boxShadow: `0 8px 32px ${currentSection.shadowColor}`
        }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.hash = 'fan-forums'}
                className="p-3 rounded-lg transition-all duration-200 hover:bg-white/20"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <i 
                className={`fas ${currentSection.icon} text-4xl`}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              ></i>
              <div>
                <h1 
                  className="text-4xl font-bold mb-2"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {currentSection.name}
                </h1>
                <p 
                  className="text-xl text-white/90"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {currentSection.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div 
                className="px-4 py-2 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <i className="fas fa-users mr-2"></i>
                <span className="font-bold">{Math.floor(Math.random() * 500) + 100} Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Create New Post */}
        <div 
          className="rounded-lg shadow-xl border mb-8 overflow-hidden"
          style={{
            background: glassEffect,
            backdropFilter: backdropBlur,
            WebkitBackdropFilter: backdropBlur,
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                <img 
                  src={userPhotos[0]} 
                  alt="Your avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={`What's happening in ${currentSection.name}?`}
                  className="w-full p-4 rounded-lg resize-none focus:outline-none focus:ring-2"
                  style={{
                    background: 'rgba(249, 250, 251, 0.9)',
                    border: '1px solid rgba(209, 213, 219, 0.3)',
                    focusRingColor: currentSection.shadowColor
                  }}
                  rows="3"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <button className="flex items-center space-x-2 hover:text-blue-500">
                      <i className="fas fa-image"></i>
                      <span>Photo</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-blue-500">
                      <i className="fas fa-poll"></i>
                      <span>Poll</span>
                    </button>
                  </div>
                  <button 
                    className="px-6 py-2 text-white rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-105"
                    style={{
                      background: currentSection.color,
                      boxShadow: `0 4px 12px ${currentSection.shadowColor}`
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forum Posts */}
        <div className="space-y-6">
          {displayedPosts.map((post) => (
            <div 
              key={post.id}
              className="rounded-lg shadow-xl border overflow-hidden transition-all duration-200 hover:shadow-2xl"
              style={{
                background: glassEffect,
                backdropFilter: backdropBlur,
                WebkitBackdropFilter: backdropBlur,
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {/* Post Header */}
              <div className="p-6 border-b border-gray-200/30">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                    <img 
                      src={post.avatar} 
                      alt={post.user} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800">{post.user}</span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-500 text-sm">{post.time}</span>
                    </div>
                    <p className="text-gray-700 mt-2 leading-relaxed">{post.content}</p>
                  </div>
                </div>
              </div>

              {/* Post Actions */}
              <div className="px-6 py-4 border-b border-gray-200/30">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                    <i className="far fa-heart"></i>
                    <span className="font-medium">{post.likes}</span>
                  </button>
                  <button 
                    onClick={() => toggleReplies(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    <i className="far fa-comment"></i>
                    <span className="font-medium">{post.replies}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                    <i className="fas fa-share"></i>
                    <span className="font-medium">Share</span>
                  </button>
                </div>
              </div>

              {/* Replies Section */}
              {showReplies[post.id] && (
                <div className="px-6 py-4 bg-gray-50/50">
                  {/* New Reply Input */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                      <img 
                        src={userPhotos[0]} 
                        alt="Your avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newReply[post.id] || ''}
                        onChange={(e) => setNewReply(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Write a reply..."
                        className="w-full p-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(209, 213, 219, 0.3)',
                          focusRingColor: currentSection.shadowColor
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleNewReply(post.id)}
                      />
                    </div>
                  </div>

                  {/* Existing Replies */}
                  <div className="space-y-3">
                    {post.replyData?.slice(0, showReplies[post.id] === 'all' ? undefined : 2).map((reply, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                          <img 
                            src={reply.avatar} 
                            alt={reply.user} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div 
                          className="flex-1 p-3 rounded-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid rgba(209, 213, 219, 0.2)'
                          }}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-sm text-gray-800">{reply.user}</span>
                            <span className="text-xs text-gray-500">{reply.time}</span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500">
                              <i className="far fa-heart"></i>
                              <span>{reply.likes}</span>
                            </button>
                            <button className="text-xs text-gray-500 hover:text-blue-500">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View More Replies */}
                  {post.replyData?.length > 2 && showReplies[post.id] !== 'all' && (
                    <button 
                      onClick={() => setShowReplies(prev => ({ ...prev, [post.id]: 'all' }))}
                      className="mt-3 text-sm font-medium hover:underline"
                      style={{ color: currentSection.color.includes('rgb') ? '#6366f1' : '#4f46e5' }}
                    >
                      View {post.replyData.length - 2} more replies
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View More Posts */}
        {!showAllPosts && posts.length > 3 && (
          <div className="text-center mt-8">
            <button 
              onClick={() => setShowAllPosts(true)}
              className="px-8 py-4 text-white rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{
                background: currentSection.color,
                boxShadow: `0 4px 12px ${currentSection.shadowColor}`
              }}
            >
              <i className="fas fa-chevron-down mr-2"></i>
              Load More Posts
              <i className="fas fa-chevron-down ml-2"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumSectionDetail;
