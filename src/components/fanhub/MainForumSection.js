import React, { useState, useEffect, useRef } from 'react';
import InteractiveForumPost from './InteractiveForumPost';

const MainForumSection = ({ onClose }) => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showInteractivePost, setShowInteractivePost] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ text: '', type: 'text', media: null });
  const [sortBy, setSortBy] = useState('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const professionalGradients = {
    red: 'linear-gradient(135deg, #ff2e4a 0%, #cc001c 25%, #a10014 50%, #cc001c 75%, #ff2e4a 100%)',
    blue: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 25%, #1557b0 50%, #1a73e8 75%, #4285f4 100%)',
    green: 'linear-gradient(135deg, #00d084 0%, #00b368 25%, #00965a 50%, #00b368 75%, #00d084 100%)',
    gold: 'linear-gradient(135deg, #ffd700 0%, #ffb300 25%, #ff8c00 50%, #ffb300 75%, #ffd700 100%)',
    purple: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 25%, #6d28d9 50%, #7c3aed 75%, #9333ea 100%)',
    orange: 'linear-gradient(135deg, #ff7f50 0%, #ff6347 25%, #ff4500 50%, #ff6347 75%, #ff7f50 100%)'
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
    'StatMaster', 'LiveGameFan', 'HotTakeHank', 'BowlExpert', 'ConferenceKing',
    'TouchdownTerry', 'FieldGoalPhil', 'BlitzBob', 'RedZoneRick', 'EndZoneEric'
  ];

  const samplePosts = [
    {
      title: "🔥 Alabama vs Georgia: Defense comparison breakdown",
      content: "After watching film all week, here's my take on who has the better defense going into Saturday's game...",
      type: "text",
      section: "Rivalry Corner",
      reactions: { heart: 45, fire: 89, football: 34, hundred: 23 },
      comments: Math.floor(Math.random() * 50) + 20,
      time: "2h ago",
      isHot: true
    },
    {
      title: "🏈 GAME CHANGING INTERCEPTION! Did you see this?!",
      content: "This pick-six completely changed the momentum of the game!",
      type: "image",
      media: "/photos/football.avif",
      section: "Live Game Thread",
      reactions: { fire: 156, lightning: 67, rocket: 23, heart: 89 },
      comments: Math.floor(Math.random() * 100) + 50,
      time: "45m ago",
      isHot: true
    },
    {
      title: "🎯 5-Star QB commits to surprise school!",
      content: "Nobody saw this coming! The #1 QB in the nation just flipped his commitment...",
      type: "text",
      section: "Recruiting Hub",
      reactions: { rocket: 234, fire: 123, lightning: 67, hundred: 45 },
      comments: Math.floor(Math.random() * 200) + 100,
      time: "1h ago",
      isHot: true
    },
    {
      title: "📊 Updated College Football Playoff rankings",
      content: "The committee just dropped the new rankings. Here's how I think they got it wrong...",
      type: "text",
      section: "Main Plaza",
      reactions: { heart: 67, fire: 45, cry: 23, hundred: 34 },
      comments: Math.floor(Math.random() * 80) + 30,
      time: "3h ago"
    },
    {
      title: "🎵 Pump-up music for game day!",
      content: "What's everyone listening to before the big games? Here's my playlist...",
      type: "audio",
      section: "Fan Zone",
      reactions: { fire: 78, heart: 56, rocket: 23, hundred: 12 },
      comments: Math.floor(Math.random() * 40) + 15,
      time: "4h ago"
    },
    {
      title: "😭 Heartbreaking missed field goal costs the game",
      content: "I can't believe they missed a 25-yarder with 2 seconds left...",
      type: "text",
      section: "Game Reactions",
      reactions: { cry: 145, heart: 89, fire: 23, football: 67 },
      comments: Math.floor(Math.random() * 120) + 60,
      time: "5h ago"
    },
    {
      title: "🏆 Best college football traditions by conference",
      content: "Let's rank the top traditions from each conference. SEC bias incoming...",
      type: "text",
      section: "Nostalgia Lane",
      reactions: { heart: 234, fire: 123, trophy: 89, hundred: 45 },
      comments: Math.floor(Math.random() * 150) + 80,
      time: "6h ago"
    },
    {
      title: "⚡ LIGHTNING DELAY - Game thread",
      content: "Weather delay is affecting the game plan. What adjustments do you think coaches are making?",
      type: "text",
      section: "Live Game Thread",
      reactions: { lightning: 89, fire: 45, football: 67, rocket: 23 },
      comments: Math.floor(Math.random() * 90) + 40,
      time: "7h ago"
    },
    {
      title: "🎬 Epic touchdown celebration GIF",
      content: "This celebration is going viral! The creativity is off the charts!",
      type: "gif",
      section: "Highlights",
      reactions: { fire: 345, rocket: 123, hundred: 89, heart: 156 },
      comments: Math.floor(Math.random() * 200) + 120,
      time: "8h ago",
      isHot: true
    },
    {
      title: "🔍 Film breakdown: Why this play call was genius",
      content: "Breaking down the X's and O's of the game-winning touchdown. The setup was perfect...",
      type: "text",
      section: "Analysis Corner",
      reactions: { heart: 123, fire: 67, trophy: 45, hundred: 34 },
      comments: Math.floor(Math.random() * 70) + 25,
      time: "9h ago"
    },
    {
      title: "🚀 Transfer portal update: Star player entering!",
      content: "BREAKING: All-American linebacker just entered the transfer portal. Where do you think he goes?",
      type: "text",
      section: "Transfer Portal",
      reactions: { rocket: 456, fire: 234, lightning: 123, heart: 89 },
      comments: Math.floor(Math.random() * 300) + 150,
      time: "10h ago",
      isHot: true
    },
    {
      title: "🏟️ Stadium atmosphere comparison",
      content: "Ranking the loudest and most intimidating stadiums in college football...",
      type: "text",
      section: "Stadium Talk",
      reactions: { fire: 178, heart: 134, trophy: 67, hundred: 45 },
      comments: Math.floor(Math.random() * 110) + 55,
      time: "11h ago"
    }
  ];

  // Initialize posts with enhanced data
  useEffect(() => {
    const enhancedPosts = samplePosts.map((post, index) => ({
      ...post,
      id: index + 1,
      user: userNames[Math.floor(Math.random() * userNames.length)],
      photo: userPhotos[Math.floor(Math.random() * userPhotos.length)],
      views: Math.floor(Math.random() * 5000) + 1000,
      shares: Math.floor(Math.random() * 50) + 10,
      bookmarks: Math.floor(Math.random() * 100) + 20
    }));
    setPosts(enhancedPosts);

    // Add real-time post generation
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newPost = {
          id: Date.now(),
          title: `🔥 BREAKING: Live update from ${userNames[Math.floor(Math.random() * userNames.length)]}`,
          content: "Something big just happened! This is developing rapidly...",
          type: "text",
          section: "Breaking News",
          reactions: { fire: Math.floor(Math.random() * 20) + 5, heart: Math.floor(Math.random() * 15) },
          comments: Math.floor(Math.random() * 10) + 2,
          time: "Just now",
          user: userNames[Math.floor(Math.random() * userNames.length)],
          photo: userPhotos[Math.floor(Math.random() * userPhotos.length)],
          views: Math.floor(Math.random() * 100) + 20,
          shares: Math.floor(Math.random() * 5) + 1,
          bookmarks: Math.floor(Math.random() * 10) + 2,
          isNew: true,
          isHot: true
        };
        
        setPosts(prevPosts => [newPost, ...prevPosts.slice(0, 19)]); // Keep max 20 posts
      }
    }, 8000); // New post every 8 seconds

    return () => clearInterval(interval);
  }, []);

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

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowInteractivePost(true);
  };

  const handleCreatePost = () => {
    if (newPost.text.trim()) {
      const post = {
        id: posts.length + 1,
        title: newPost.text.substring(0, 100),
        content: newPost.text,
        type: newPost.type,
        media: newPost.media,
        section: "Main Plaza",
        reactions: { heart: 0, fire: 0, football: 0, hundred: 0 },
        comments: 0,
        time: "Just now",
        user: "You",
        photo: userPhotos[0],
        views: 1,
        shares: 0,
        bookmarks: 0,
        isNew: true
      };
      setPosts([post, ...posts]);
      setNewPost({ text: '', type: 'text', media: null });
      setShowCreatePost(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPost(prev => ({ ...prev, media: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'hot') {
      return (b.reactions.fire || 0) - (a.reactions.fire || 0);
    } else if (sortBy === 'new') {
      return b.id - a.id;
    } else if (sortBy === 'top') {
      const aTotal = Object.values(a.reactions).reduce((sum, val) => sum + val, 0);
      const bTotal = Object.values(b.reactions).reduce((sum, val) => sum + val, 0);
      return bTotal - aTotal;
    }
    return 0;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div 
          className="p-6 text-white relative overflow-hidden"
          style={{ background: professionalGradients.red }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-landmark text-xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">The Colosseum</h1>
                <p className="text-red-100">Where legends are made and opinions collide</p>
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

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="hot">🔥 Hot</option>
                  <option value="new">🆕 New</option>
                  <option value="top">🏆 Top</option>
                </select>
              </div>

              <button
                onClick={() => setShowCreatePost(true)}
                className="px-4 py-2 text-white rounded-lg font-semibold transition-all hover:scale-105"
                style={{ background: professionalGradients.blue }}
              >
                <i className="fas fa-plus mr-2"></i>
                Create Post
              </button>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="p-6 space-y-4">
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-red-200 transform hover:scale-[1.02]"
                style={{
                  background: post.isNew ? 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' : undefined,
                  borderLeft: post.isHot ? '4px solid #ff2e4a' : undefined
                }}
              >
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                      <img 
                        src={post.photo} 
                        alt={post.user}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-white bg-red-500 text-sm" style={{ display: 'none' }}>
                        {post.user[0]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-gray-900">{post.user}</span>
                        <span className="text-sm text-gray-500">{post.time}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {post.section}
                        </span>
                        {post.isHot && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
                            🔥 Hot
                          </span>
                        )}
                        {post.isNew && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            ✨ New
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm">{post.content}</p>
                    </div>
                  </div>

                  {/* Media */}
                  {post.media && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      {post.type === 'image' && (
                        <img 
                          src={post.media} 
                          alt="Post media" 
                          className="w-full h-48 object-cover"
                        />
                      )}
                      {post.type === 'audio' && (
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                              <i className="fas fa-music text-white"></i>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Audio Post</p>
                              <p className="text-sm text-gray-600">Click to play</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {post.type === 'gif' && (
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                              <i className="fas fa-film text-white"></i>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">GIF Post</p>
                              <p className="text-sm text-gray-600">Click to view</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {Object.entries(post.reactions).map(([type, count]) => (
                        count > 0 && (
                          <div key={type} className="flex items-center space-x-1">
                            <span className="text-lg">{reactionEmojis[type]}</span>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        )
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span><i className="fas fa-comment mr-1"></i>{post.comments}</span>
                      <span><i className="fas fa-eye mr-1"></i>{post.views}</span>
                      <span><i className="fas fa-share mr-1"></i>{post.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
                >
                  <i className="fas fa-times text-gray-600"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <textarea
                  value={newPost.text}
                  onChange={(e) => setNewPost(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="What's on your mind about college football?"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setNewPost(prev => ({ ...prev, type: 'image' }));
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    <i className="fas fa-image"></i>
                    <span>Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewPost(prev => ({ ...prev, type: 'audio' }));
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                  >
                    <i className="fas fa-microphone"></i>
                    <span>Audio</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewPost(prev => ({ ...prev, type: 'gif' }));
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all"
                  >
                    <i className="fas fa-film"></i>
                    <span>GIF</span>
                  </button>
                </div>
                
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.text.trim()}
                  className="px-6 py-2 text-white rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: professionalGradients.red }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,video/*,.gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Interactive Post Modal */}
      {showInteractivePost && selectedPost && (
        <InteractiveForumPost 
          post={selectedPost}
          onClose={() => {
            setShowInteractivePost(false);
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
};

export default MainForumSection;
