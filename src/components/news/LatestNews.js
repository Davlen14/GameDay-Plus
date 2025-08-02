import React, { useState, useEffect } from 'react';
import { newsService } from '../../services/newsService';
import { fetchYouTubeData } from '../../services/core';

const LatestNews = () => {
  const [news, setNews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('breaking');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Fetch latest college football news using the correct method
        const newsData = await newsService.getLatestNews(50);
        console.log('Fetched news data:', newsData);
        
        // Filter and categorize news
        const categorizedNews = {
          breaking: newsData.filter(article => 
            article.title?.toLowerCase().includes('breaking') ||
            article.title?.toLowerCase().includes('urgent') ||
            new Date(article.publishedAt || article.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).slice(0, 12),
          gameRecaps: newsData.filter(article =>
            article.title?.toLowerCase().includes('recap') ||
            article.title?.toLowerCase().includes('final') ||
            article.title?.toLowerCase().includes('highlights') ||
            article.title?.toLowerCase().includes('score')
          ).slice(0, 12),
          recruiting: newsData.filter(article =>
            article.title?.toLowerCase().includes('recruit') ||
            article.title?.toLowerCase().includes('commit') ||
            article.title?.toLowerCase().includes('signing')
          ).slice(0, 12),
          injuries: newsData.filter(article =>
            article.title?.toLowerCase().includes('injury') ||
            article.title?.toLowerCase().includes('injured') ||
            article.title?.toLowerCase().includes('hurt') ||
            article.title?.toLowerCase().includes('out')
          ).slice(0, 12),
          all: newsData.slice(0, 20)
        };
        
        console.log('Categorized news:', categorizedNews);
        setNews(categorizedNews);

        // Fetch college football videos
        const videoQueries = [
          'college football highlights today',
          'ESPN college football',
          'college football news',
          'college football recruiting',
          'college football injury report'
        ];
        
        let allVideos = [];
        
        for (const query of videoQueries) {
          try {
            console.log(`Fetching videos for query: ${query}`);
            const videoData = await fetchYouTubeData(query, 6);
            console.log(`Video data for "${query}":`, videoData);
            
            if (videoData && videoData.items && videoData.items.length > 0) {
              const transformedVideos = videoData.items.map(item => ({
                id: item.id?.videoId || item.id,
                title: item.snippet?.title || 'No title',
                description: item.snippet?.description || 'No description',
                thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
                publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
                channelTitle: item.snippet?.channelTitle || 'Unknown Channel'
              }));
              allVideos = [...allVideos, ...transformedVideos];
            }
          } catch (videoError) {
            console.error(`Error fetching videos for query "${query}":`, videoError);
          }
        }
        
        // Remove duplicates and limit videos
        const uniqueVideos = allVideos.filter((video, index, self) => 
          index === self.findIndex(v => v.id === video.id)
        ).slice(0, 18);
        
        console.log('Final videos:', uniqueVideos);
        setVideos(uniqueVideos);
        
      } catch (error) {
        console.error('Error fetching latest news:', error);
        // Provide fallback demo data
        setNews({
          breaking: [
            {
              id: 'demo-breaking-1',
              title: 'College Football Playoff Expansion Plans Announced',
              description: 'Major changes coming to the College Football Playoff format with expansion to 12 teams starting next season.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-breaking-2',
              title: 'Top Recruiting Class Commits Continue',
              description: 'Several five-star recruits announce their college commitments ahead of National Signing Day.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            }
          ],
          gameRecaps: [
            {
              id: 'demo-recap-1',
              title: 'Alabama Defeats Georgia in SEC Championship Final',
              description: 'Crimson Tide captures SEC title with dominant 31-17 victory over Bulldogs in Atlanta.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-recap-2',
              title: 'Michigan Wins Big Ten Championship Game',
              description: 'Wolverines defeat Iowa 42-3 to claim Big Ten title and secure playoff spot.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-recap-3',
              title: 'Ohio State Dominates in Rose Bowl Victory',
              description: 'Buckeyes complete perfect season with 45-23 win over Washington in Rose Bowl.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-recap-4',
              title: 'Texas Upsets Oklahoma in Red River Showdown',
              description: 'Longhorns shock Sooners 28-21 in overtime thriller at Cotton Bowl.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            }
          ],
          recruiting: [
            {
              id: 'demo-recruiting-1',
              title: 'Five-Star QB Commits to Ohio State',
              description: 'Top quarterback prospect announces commitment to Buckeyes over Alabama and Georgia.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-recruiting-2',
              title: 'Elite Wide Receiver Flips to LSU',
              description: 'Top wide receiver prospect changes commitment from Texas to LSU in surprise move.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: '247Sports' }
            },
            {
              id: 'demo-recruiting-3',
              title: 'Georgia Lands Top Defensive Line Class',
              description: 'Bulldogs secure commitments from three five-star defensive linemen.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'Rivals' }
            },
            {
              id: 'demo-recruiting-4',
              title: 'Alabama Gets Commitment from Top RB',
              description: 'Five-star running back chooses Crimson Tide over Auburn and Tennessee.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            }
          ],
          injuries: [
            {
              id: 'demo-injury-1',
              title: 'Star Running Back Expected to Return for Bowl Game',
              description: 'Heisman candidate working through injury but optimistic about postseason availability.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-injury-2',
              title: 'Starting Quarterback Out 4-6 Weeks with Shoulder Injury',
              description: 'Team captain undergoes surgery and will miss remainder of regular season.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-injury-3',
              title: 'Defensive Star Cleared to Return After Concussion',
              description: 'All-American linebacker passes protocols and expected to play this weekend.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-injury-4',
              title: 'Multiple Players Dealing with Flu-Like Symptoms',
              description: 'Team monitoring several key players ahead of conference championship game.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            }
          ],
          all: [
            {
              id: 'demo-all-1',
              title: 'College Football Playoff Rankings Released',
              description: 'Final CFP rankings revealed with four teams selected for national championship tournament.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-all-2',
              title: 'Bowl Game Matchups Announced',
              description: 'Complete bowl schedule released with exciting matchups across all major bowl games.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            },
            {
              id: 'demo-all-3',
              title: 'Coaching Carousel Updates',
              description: 'Latest updates on head coaching changes across major college football programs.',
              url: '#',
              image: '/photos/ncaaf.png',
              publishedAt: new Date().toISOString(),
              source: { name: 'ESPN' }
            }
          ]
        });

        // Provide fallback demo videos
        setVideos([
          {
            id: 'demo-video-1',
            title: 'College Football Highlights: Best Plays of the Week',
            description: 'Watch the most incredible plays from this week in college football.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'ESPN College Football',
            category: 'highlights'
          },
          {
            id: 'demo-video-2',
            title: 'SEC Championship Game Highlights',
            description: 'Extended highlights from the SEC Championship Game.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'SEC Network',
            category: 'gameRecaps'
          },
          {
            id: 'demo-video-3',
            title: 'Alabama vs Georgia: Full Game Recap',
            description: 'Complete game breakdown and highlights from the SEC title game.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'ESPN College Football',
            category: 'gameRecaps'
          },
          {
            id: 'demo-video-4',
            title: 'Michigan Big Ten Championship Victory',
            description: 'Wolverines dominate Iowa to capture Big Ten title.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'Big Ten Network',
            category: 'gameRecaps'
          },
          {
            id: 'demo-video-5',
            title: 'Top Recruiting Commits This Week',
            description: 'Latest recruiting news and commitment updates.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: '247Sports',
            category: 'recruiting'
          },
          {
            id: 'demo-video-6',
            title: 'Five-Star QB Commitment Announcement',
            description: 'Top quarterback prospect announces his college decision.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'ESPN Recruiting',
            category: 'recruiting'
          },
          {
            id: 'demo-video-7',
            title: 'National Signing Day Coverage',
            description: 'Live coverage of the biggest recruiting day of the year.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'ESPN College Football',
            category: 'recruiting'
          },
          {
            id: 'demo-video-8',
            title: 'College Football Injury Report Update',
            description: 'Latest updates on key player injuries across college football.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'ESPN College Football',
            category: 'injuries'
          },
          {
            id: 'demo-video-9',
            title: 'Star QB Injury Update and Recovery Timeline',
            description: 'Medical experts break down the quarterback injury and recovery process.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'ESPN College Football',
            category: 'injuries'
          },
          {
            id: 'demo-video-10',
            title: 'Bowl Game Predictions and Analysis',
            description: 'Expert predictions for all major bowl games.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'ESPN College Football',
            category: 'general'
          },
          {
            id: 'demo-video-11',
            title: 'College Football Playoff Preview',
            description: 'Breaking down the College Football Playoff matchups.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'ESPN College Football',
            category: 'general'
          },
          {
            id: 'demo-video-12',
            title: 'Heisman Trophy Ceremony Highlights',
            description: 'Highlights from the annual Heisman Trophy presentation.',
            thumbnail: '/photos/ncaaf.png',
            publishedAt: new Date().toISOString(),
            channelTitle: 'Heisman Trophy',
            category: 'general'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const VideoModal = ({ video, onClose }) => {
    if (!video) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-1">
        <div className="glass-modal rounded-2xl max-w-[98vw] w-full h-[95vh] overflow-hidden shadow-2xl border border-white/20">
          <div className="flex justify-between items-center p-3 md:p-4 border-b border-white/10 backdrop-blur-sm bg-white/10">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate pr-4 drop-shadow-sm">
              {video.title}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-700 hover:text-gray-900 text-2xl font-bold transition-all duration-300 hover:scale-110 bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm"
            >
              ×
            </button>
          </div>
          <div className="h-[calc(95vh-120px)] bg-black rounded-lg m-1 md:m-2 overflow-hidden shadow-inner">
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>
          <div className="p-3 md:p-4 bg-white/10 backdrop-blur-sm">
            <p className="text-sm md:text-base text-gray-800 mb-2 font-medium drop-shadow-sm">
              {video.channelTitle} • {new Date(video.publishedAt).toLocaleDateString()}
            </p>
            <p className="text-sm md:text-base text-gray-700 line-clamp-2 leading-relaxed drop-shadow-sm">
              {video.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const NewsCard = ({ article, featured = false }) => (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      {article.image && (
        <div className="relative">
          <img 
            src={article.image} 
            alt={article.title}
            className={`w-full object-cover rounded-t-xl ${
              featured ? 'h-48 md:h-56' : 'h-40'
            }`}
          />
          <div className="absolute top-4 left-4">
            <span className="gradient-bg text-white px-3 py-1 rounded-full text-xs font-semibold">
              LIVE
            </span>
          </div>
        </div>
      )}
      <div className={`p-4 ${featured ? 'md:p-6' : ''}`}>
        <div className="flex items-center mb-2">
          <span className="text-xs gradient-text font-semibold uppercase tracking-wide">
            ESPN • College Football
          </span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            {new Date(article.publishedAt || article.date).toLocaleDateString()}
          </span>
        </div>
        <h3 className={`font-bold text-gray-900 mb-2 line-clamp-3 ${
          featured ? 'text-lg md:text-xl' : 'text-base'
        }`}>
          {article.title}
        </h3>
        <p className={`text-gray-600 mb-3 line-clamp-2 ${
          featured ? 'text-sm' : 'text-xs'
        }`}>
          {article.description || article.content}
        </p>
        <div className="flex justify-between items-center">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gradient-text hover:opacity-70 font-semibold text-xs transition-opacity"
          >
            Read Full Story
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-[#cc001c] transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-[#cc001c] transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#cc001c] mb-4"></div>
          <p className="text-lg text-gray-600">Loading latest college football news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-white rounded-xl shadow-lg sticky top-20 z-10">
          {[
            { key: 'breaking', label: 'Breaking News', icon: 'fas fa-bolt' },
            { key: 'gameRecaps', label: 'Game Recaps', icon: 'fas fa-football-ball' },
            { key: 'recruiting', label: 'Recruiting', icon: 'fas fa-user-graduate' },
            { key: 'injuries', label: 'Injury Reports', icon: 'fas fa-medical-bag' },
            { key: 'videos', label: 'Videos', icon: 'fas fa-play' },
            { key: 'all', label: 'All News', icon: 'fas fa-newspaper' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                activeTab === tab.key
                  ? 'gradient-bg text-white shadow-lg transform scale-105'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'videos' ? (
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-6 text-center">Latest College Football Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="gradient-bg rounded-full p-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 5v10l8-5z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="gradient-bg text-white px-2 py-1 rounded text-xs font-semibold">
                        VIDEO
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      {video.channelTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                {activeTab === 'breaking' && 'Breaking News'}
                {activeTab === 'gameRecaps' && 'Game Recaps & Highlights'}
                {activeTab === 'recruiting' && 'Recruiting News'}
                {activeTab === 'injuries' && 'Injury Reports'}
                {activeTab === 'all' && 'All College Football News'}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select 
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc001c]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="sec">SEC</option>
                  <option value="bigten">Big Ten</option>
                  <option value="acc">ACC</option>
                  <option value="big12">Big 12</option>
                  <option value="pac12">Pac-12</option>
                </select>
              </div>
            </div>

            {news[activeTab] && news[activeTab].length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {news[activeTab].map((article, index) => (
                    <NewsCard 
                      key={index} 
                      article={article} 
                      featured={index === 0 && activeTab === 'breaking'}
                    />
                  ))}
                </div>

                {/* Related Videos Section */}
                {videos && videos.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold gradient-text mb-4">Related Videos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {videos
                        .filter(video => 
                          video.category === activeTab || 
                          (activeTab === 'breaking' && video.category === 'general') ||
                          (activeTab === 'all' && true)
                        )
                        .slice(0, 8)
                        .map((video, index) => (
                          <div 
                            key={`category-${index}`}
                            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                          >
                            <div className="relative">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className="w-full h-32 object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <div className="gradient-bg rounded-full p-2">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 5v10l8-5z"/>
                                  </svg>
                                </div>
                              </div>
                              <div className="absolute top-2 right-2">
                                <span className="gradient-bg text-white px-2 py-1 rounded text-xs font-semibold">
                                  VIDEO
                                </span>
                              </div>
                            </div>
                            <div className="p-3">
                              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                                {video.title}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {video.channelTitle}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-newspaper text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No news available</h3>
                <p className="text-gray-500">Check back later for updates in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <VideoModal 
        video={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />

      <style jsx>{`
        .gradient-bg {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
        }
        .gradient-text {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .icon-gradient {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass-modal {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .glass-modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          border-radius: inherit;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default LatestNews;
