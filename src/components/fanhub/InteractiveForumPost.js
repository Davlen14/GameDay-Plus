import React, { useState, useEffect, useRef } from 'react';

const InteractiveForumPost = ({ post, onClose }) => {
  const [reactions, setReactions] = useState({
    heart: Math.floor(Math.random() * 50) + 10,
    fire: Math.floor(Math.random() * 30) + 5,
    cry: Math.floor(Math.random() * 15) + 2,
    football: Math.floor(Math.random() * 25) + 8,
    hundred: Math.floor(Math.random() * 20) + 3,
    lightning: Math.floor(Math.random() * 18) + 4,
    rocket: Math.floor(Math.random() * 12) + 2,
    trophy: Math.floor(Math.random() * 15) + 3
  });

  const [animatingEmojis, setAnimatingEmojis] = useState([]);
  const [comments, setComments] = useState([]);
  const [showingComments, setShowingComments] = useState(false);
  const [liveUsers, setLiveUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showPoll, setShowPoll] = useState(true);
  const [pollVotes, setPollVotes] = useState({
    option1: Math.floor(Math.random() * 150) + 50,
    option2: Math.floor(Math.random() * 120) + 40,
    option3: Math.floor(Math.random() * 80) + 20
  });
  const [userVote, setUserVote] = useState(null);
  const containerRef = useRef(null);

  const reactionEmojis = {
    heart: '❤️',
    fire: '🔥',
    cry: '😭',
    football: '🏈',
    hundred: '💯',
    lightning: '⚡',
    rocket: '🚀',
    trophy: '🏆'
  };

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
    '/SportsbookLogos/Erin Dolan.jpg'
  ];

  const userNames = [
    'CFBLegend', 'GameDayFan', 'RivalryKing', 'TDScorer', 'DefenseGuru',
    'RecruitWatcher', 'CoachAnalyst', 'PlayoffHunter', 'UniformExpert',
    'StatMaster', 'LiveGameFan', 'HotTakeHank', 'BowlExpert', 'ConferenceKing'
  ];

  const sampleComments = [
    "This is exactly what I've been thinking! Great analysis 🔥",
    "Absolutely wild take but I'm here for it 💯",
    "No way this happens, but I love the optimism 😂",
    "The defense is going to be the key factor here 🏈",
    "Can't wait to see how this plays out Saturday! ⚡",
    "This aged well... or did it? 👀",
    "Breaking: Sources confirm this is heating up 🚀",
    "The recruiting implications are HUGE 📈",
    "Coach is going to have something to say about this 🎯",
    "This is why I love college football! 🏆"
  ];

  // Initialize live users and comments
  useEffect(() => {
    const initialUsers = Array.from({ length: Math.floor(Math.random() * 8) + 5 }, (_, i) => ({
      id: i,
      name: userNames[Math.floor(Math.random() * userNames.length)],
      photo: userPhotos[Math.floor(Math.random() * userPhotos.length)],
      online: Math.random() > 0.3
    }));
    setLiveUsers(initialUsers);

    const initialComments = Array.from({ length: Math.floor(Math.random() * 8) + 5 }, (_, i) => ({
      id: i,
      user: userNames[Math.floor(Math.random() * userNames.length)],
      photo: userPhotos[Math.floor(Math.random() * userPhotos.length)],
      text: sampleComments[Math.floor(Math.random() * sampleComments.length)],
      time: `${Math.floor(Math.random() * 60) + 1}m ago`,
      likes: Math.floor(Math.random() * 25) + 1,
      replies: Math.floor(Math.random() * 8),
      hasMedia: Math.random() > 0.7,
      mediaType: Math.random() > 0.5 ? 'image' : 'gif',
      reactions: {
        heart: Math.floor(Math.random() * 15),
        fire: Math.floor(Math.random() * 12),
        laugh: Math.floor(Math.random() * 8),
        wow: Math.floor(Math.random() * 6)
      }
    }));
    setComments(initialComments);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulate real-time activity
  useEffect(() => {
    const intervals = [];

    // New reactions popping up
    intervals.push(setInterval(() => {
      if (Math.random() > 0.7) {
        const reactionTypes = Object.keys(reactions);
        const randomReaction = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
        
        setReactions(prev => ({
          ...prev,
          [randomReaction]: prev[randomReaction] + 1
        }));

        // Add floating animation
        const emoji = reactionEmojis[randomReaction];
        const newAnimatingEmoji = {
          id: Date.now() + Math.random(),
          emoji,
          x: Math.random() * 300 + 50,
          y: Math.random() * 200 + 100
        };
        
        setAnimatingEmojis(prev => [...prev, newAnimatingEmoji]);
        
        setTimeout(() => {
          setAnimatingEmojis(prev => prev.filter(e => e.id !== newAnimatingEmoji.id));
        }, 2000);
      }
    }, 1500));

    // New comments
    intervals.push(setInterval(() => {
      if (Math.random() > 0.8) {
        const newCommentObj = {
          id: Date.now(),
          user: userNames[Math.floor(Math.random() * userNames.length)],
          photo: userPhotos[Math.floor(Math.random() * userPhotos.length)],
          text: sampleComments[Math.floor(Math.random() * sampleComments.length)],
          time: 'Just now',
          likes: 0,
          replies: 0,
          isNew: true
        };
        
        setComments(prev => [newCommentObj, ...prev.slice(0, 19)]);
      }
    }, 4000));

    // Typing indicators
    intervals.push(setInterval(() => {
      if (Math.random() > 0.6) {
        const typingUser = userNames[Math.floor(Math.random() * userNames.length)];
        setTyping(prev => [...prev, typingUser]);
        
        setTimeout(() => {
          setTyping(prev => prev.filter(u => u !== typingUser));
        }, 3000);
      }
    }, 2000));

    // Live poll updates
    intervals.push(setInterval(() => {
      if (Math.random() > 0.7 && showPoll) {
        const options = ['option1', 'option2', 'option3'];
        const randomOption = options[Math.floor(Math.random() * options.length)];
        setPollVotes(prev => ({
          ...prev,
          [randomOption]: prev[randomOption] + 1
        }));
      }
    }, 3000));

    return () => intervals.forEach(clearInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReactionClick = (reactionType) => {
    setReactions(prev => ({
      ...prev,
      [reactionType]: prev[reactionType] + 1
    }));

    // Add haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Create multiple floating emojis for more impact
    const numberOfEmojis = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numberOfEmojis; i++) {
      setTimeout(() => {
        const emoji = reactionEmojis[reactionType];
        const newAnimatingEmoji = {
          id: Date.now() + Math.random() + i,
          emoji,
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 150
        };
        
        setAnimatingEmojis(prev => [...prev, newAnimatingEmoji]);
        
        setTimeout(() => {
          setAnimatingEmojis(prev => prev.filter(e => e.id !== newAnimatingEmoji.id));
        }, 2000);
      }, i * 100);
    }

    // Add screen shake effect
    if (containerRef.current) {
      containerRef.current.style.animation = 'shake 0.3s ease-in-out';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.animation = '';
        }
      }, 300);
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: 'You',
        photo: userPhotos[0],
        text: newComment,
        time: 'Just now',
        likes: 0,
        replies: 0,
        isNew: true,
        isOwn: true
      };
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={containerRef}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Floating Reaction Animations */}
        {animatingEmojis.map(emoji => (
          <div
            key={emoji.id}
            className="absolute pointer-events-none text-2xl animate-bounce"
            style={{
              left: emoji.x,
              top: emoji.y,
              animation: 'floatUp 2s ease-out forwards'
            }}
          >
            {emoji.emoji}
          </div>
        ))}

        {/* Header */}
        <div 
          className="p-6 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #ff2e4a 0%, #cc001c 25%, #a10014 50%, #cc001c 75%, #ff2e4a 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-fire text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{post.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-red-100">
                  <span>{post.section}</span>
                  <span>•</span>
                  <span>{post.replies} replies</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    <span>{liveUsers.filter(u => u.online).length} online</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Live Users Strip */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Live now:</span>
            <div className="flex items-center space-x-2">
              {liveUsers.filter(u => u.online).slice(0, 8).map(user => (
                <div key={user.id} className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-green-300">
                    <img 
                      src={user.photo} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-white bg-red-500 text-xs" style={{ display: 'none' }}>
                      {user.name[0]}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
              ))}
              {liveUsers.filter(u => u.online).length > 8 && (
                <div className="text-sm text-gray-500">+{liveUsers.filter(u => u.online).length - 8} more</div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Original Post */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                <img 
                  src={post.photo} 
                  alt="Post author"
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
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-bold text-gray-900">{post.user || 'CFBFan'}</span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">OP</span>
                </div>
                <p className="text-gray-800 mb-4">{post.title}</p>
                <p className="text-gray-600 mb-4">
                  This is such an important discussion for our community. What do you all think about this situation? 
                  I've been following this closely and there are so many factors to consider. The implications could be huge for the rest of the season!
                </p>
              </div>
            </div>
          </div>

          {/* Live Poll Section */}
          {showPoll && (
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <span className="text-2xl">📊</span>
                  <span>Live Poll</span>
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">LIVE</span>
                </h3>
                <button
                  onClick={() => setShowPoll(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <p className="text-gray-700 mb-4 font-medium">Who do you think will win this matchup?</p>
              
              <div className="space-y-3">
                {[
                  { key: 'option1', label: 'Alabama Crimson Tide', color: 'bg-red-500' },
                  { key: 'option2', label: 'Georgia Bulldogs', color: 'bg-red-600' },
                  { key: 'option3', label: 'Too Close to Call', color: 'bg-gray-500' }
                ].map(option => {
                  const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);
                  const percentage = totalVotes > 0 ? Math.round((pollVotes[option.key] / totalVotes) * 100) : 0;
                  
                  return (
                    <div key={option.key} className="relative">
                      <button
                        onClick={() => {
                          if (!userVote) {
                            setUserVote(option.key);
                            setPollVotes(prev => ({
                              ...prev,
                              [option.key]: prev[option.key] + 1
                            }));
                          }
                        }}
                        disabled={userVote}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-300 ${
                          userVote === option.key 
                            ? 'border-blue-500 bg-blue-50' 
                            : userVote 
                              ? 'border-gray-200 opacity-50' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        } ${!userVote ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900">{option.label}</span>
                            {userVote === option.key && (
                              <span className="text-blue-500 font-bold">✓ Your Vote</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">{percentage}%</span>
                            <span className="text-sm text-gray-500">({pollVotes[option.key]} votes)</span>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                          <div 
                            className={`h-full ${option.color} opacity-20 transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <span className="flex items-center justify-center space-x-2">
                  <i className="fas fa-users"></i>
                  <span>{Object.values(pollVotes).reduce((a, b) => a + b, 0)} total votes</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live updates</span>
                  </div>
                </span>
              </div>
            </div>
          )}

          {/* Reactions Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {Object.entries(reactions).map(([type, count]) => (
                    <button
                      key={type}
                      onClick={() => handleReactionClick(type)}
                      className="reaction-button flex items-center space-x-2 px-3 py-2 rounded-full bg-white hover:bg-gray-100 transition-all transform hover:scale-105 shadow-sm"
                    >
                      <span className="text-lg">{reactionEmojis[type]}</span>
                      <span className="text-sm font-medium text-gray-700">{count}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <i className="fas fa-eye"></i>
                    <span>{Math.floor(Math.random() * 1000) + 500} views</span>
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all">
                    <i className="fas fa-share"></i>
                    <span className="text-sm font-medium">Share</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-full bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-all">
                    <i className="fas fa-bookmark"></i>
                    <span className="text-sm font-medium">Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Comments ({comments.length})</h3>
              <button
                onClick={() => setShowingComments(!showingComments)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                {showingComments ? 'Hide' : 'Show'} Comments
              </button>
            </div>

            {/* Typing Indicators */}
            {typing.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>{typing.join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              </div>
            )}

            {/* Comment Input */}
            <div className="mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                  <img 
                    src={userPhotos[0]} 
                    alt="Your avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-white bg-red-500 text-sm" style={{ display: 'none' }}>
                    Y
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add to the discussion..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      {Object.entries(reactionEmojis).slice(0, 4).map(([type, emoji]) => (
                        <button
                          key={type}
                          onClick={() => setNewComment(prev => prev + emoji)}
                          className="text-xl hover:scale-110 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {showingComments && (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div 
                    key={comment.id} 
                    className={`p-4 rounded-lg transition-all duration-500 ${
                      comment.isNew ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
                    } ${comment.isOwn ? 'bg-green-50 border-l-4 border-green-400' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                        <img 
                          src={comment.photo} 
                          alt={comment.user}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full flex items-center justify-center text-white bg-red-500 text-sm" style={{ display: 'none' }}>
                          {comment.user[0]}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.user}</span>
                          <span className="text-sm text-gray-500">{comment.time}</span>
                          {comment.isNew && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full animate-pulse">
                              New
                            </span>
                          )}
                          {comment.isOwn && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 mb-2">{comment.text}</p>
                        
                        {/* Comment Media */}
                        {comment.hasMedia && (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            {comment.mediaType === 'image' ? (
                              <div className="bg-gray-100 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <i className="fas fa-image text-blue-500"></i>
                                  <span className="text-sm text-gray-600">Shared an image</span>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <i className="fas fa-film text-purple-500"></i>
                                  <span className="text-sm text-gray-600">Shared a GIF</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Comment Reactions */}
                        {comment.reactions && Object.values(comment.reactions).some(count => count > 0) && (
                          <div className="flex items-center space-x-3 mb-2">
                            {comment.reactions.heart > 0 && (
                              <span className="flex items-center space-x-1 text-sm">
                                <span>❤️</span>
                                <span className="text-gray-600">{comment.reactions.heart}</span>
                              </span>
                            )}
                            {comment.reactions.fire > 0 && (
                              <span className="flex items-center space-x-1 text-sm">
                                <span>🔥</span>
                                <span className="text-gray-600">{comment.reactions.fire}</span>
                              </span>
                            )}
                            {comment.reactions.laugh > 0 && (
                              <span className="flex items-center space-x-1 text-sm">
                                <span>😂</span>
                                <span className="text-gray-600">{comment.reactions.laugh}</span>
                              </span>
                            )}
                            {comment.reactions.wow > 0 && (
                              <span className="flex items-center space-x-1 text-sm">
                                <span>😮</span>
                                <span className="text-gray-600">{comment.reactions.wow}</span>
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                            <i className="fas fa-heart"></i>
                            <span>{comment.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                            <i className="fas fa-reply"></i>
                            <span>Reply</span>
                          </button>
                          {comment.replies > 0 && (
                            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                              <i className="fas fa-comment"></i>
                              <span>{comment.replies} replies</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-30px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-60px) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .reaction-button:hover {
          animation: pulse 0.3s ease-in-out;
        }
        
        .comment-new {
          animation: slideInLeft 0.5s ease-out;
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default InteractiveForumPost;
