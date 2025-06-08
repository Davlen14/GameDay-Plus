import React, { useState, useEffect } from 'react';
import { newsService, teamService, rankingsService, gameService } from '../../services';

const HomePageView = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [topRecruits, setTopRecruits] = useState([]);
  const [pollRankings, setPollRankings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [featuredGame, setFeaturedGame] = useState(null);
  const [error, setError] = useState(null);

  // Get team logo from teams data
  const getTeamLogo = (teamName) => {
    const team = teams.find(t => t.school === teamName);
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [newsData, recruitsData, pollData, teamsData, gameData] = await Promise.all([
        fetchNews(),
        fetchTopRecruits(),
        fetchAPPoll(),
        fetchTeams(),
        fetchFeaturedGame()
      ]);

      setArticles(newsData);
      setTopRecruits(recruitsData);
      setPollRankings(pollData);
      setTeams(teamsData);
      setFeaturedGame(gameData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      // Use actual news service to fetch college football articles
      const articles = await newsService.getLatestNews(10);
      
      // Add unique IDs to articles since GNews might not provide them
      return articles.map((article, index) => ({
        ...article,
        id: article.id || index + 1
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback articles in case API fails
      return [
        {
          id: 1,
          title: "College Football News Currently Unavailable",
          description: "We're experiencing connectivity issues with our news service. Please try again later.",
          source: { name: "GAMEDAY+" },
          publishedAt: new Date().toISOString(),
          url: "#",
          image: "/photos/ncaaf.png"
        }
      ];
    }
  };

  const fetchTopRecruits = async () => {
    try {
      // Mock recruits data - replace with actual service call
      return [
        { id: 1, name: "Marcus Johnson", position: "QB", ranking: 1, stars: 5, school: "De La Salle High School", state: "CA", committedTo: "Georgia" },
        { id: 2, name: "Trevor Williams", position: "RB", ranking: 2, stars: 5, school: "IMG Academy", state: "FL", committedTo: "Alabama" },
        { id: 3, name: "David Thompson", position: "WR", ranking: 3, stars: 5, school: "Mater Dei", state: "CA", committedTo: null },
        { id: 4, name: "Michael Davis", position: "DE", ranking: 4, stars: 5, school: "St. John Bosco", state: "CA", committedTo: "Ohio State" },
        { id: 5, name: "Chris Martinez", position: "OT", ranking: 5, stars: 5, school: "Duncanville", state: "TX", committedTo: "Texas" },
        { id: 6, name: "Anthony Brown", position: "CB", ranking: 6, stars: 5, school: "American Heritage", state: "FL", committedTo: null },
        { id: 7, name: "Robert Wilson", position: "LB", ranking: 7, stars: 5, school: "Centennial", state: "NV", committedTo: "USC" },
        { id: 8, name: "Kevin Garcia", position: "DT", ranking: 8, stars: 4, school: "Bishop Gorman", state: "NV", committedTo: "Oregon" }
      ];
    } catch (error) {
      console.error('Error fetching recruits:', error);
      return [];
    }
  };

  const fetchAPPoll = async () => {
    try {
      // Fetch actual AP Poll rankings using rankings service
      const rankingsData = await rankingsService.getHistoricalRankings(2024, 1, 'postseason');
      
      // Find the most recent AP Top 25 poll
      for (let i = rankingsData.length - 1; i >= 0; i--) {
        const weekData = rankingsData[i];
        const apPoll = weekData.polls?.find(poll => poll.poll === 'AP Top 25');
        if (apPoll && apPoll.ranks) {
          // Return all teams from the poll (typically 25) for the sidebar
          return apPoll.ranks.map(team => ({
            rank: team.rank,
            school: team.school,
            conference: team.conference || 'Unknown',
            points: team.points || 0,
            firstPlaceVotes: team.firstPlaceVotes || 0
          }));
        }
      }
      
      // Fallback if no AP poll found - return empty array to show no rankings
      console.warn('No AP Top 25 poll found in rankings data');
      return [];
    } catch (error) {
      console.error('Error fetching AP Poll:', error);
      // Return mock data as fallback if API fails
      return [
        { rank: 1, school: "Georgia", conference: "SEC", points: 1550 },
        { rank: 2, school: "Alabama", conference: "SEC", points: 1485 },
        { rank: 3, school: "Ohio State", conference: "Big Ten", points: 1420 },
        { rank: 4, school: "Michigan", conference: "Big Ten", points: 1355 },
        { rank: 5, school: "Texas", conference: "Big 12", points: 1290 },
        { rank: 6, school: "USC", conference: "Pac-12", points: 1225 },
        { rank: 7, school: "Clemson", conference: "ACC", points: 1160 },
        { rank: 8, school: "Oregon", conference: "Pac-12", points: 1095 },
        { rank: 9, school: "Oklahoma", conference: "SEC", points: 1030 },
        { rank: 10, school: "Notre Dame", conference: "Independent", points: 965 },
        { rank: 11, school: "LSU", conference: "SEC", points: 900 },
        { rank: 12, school: "Penn State", conference: "Big Ten", points: 835 },
        { rank: 13, school: "Florida State", conference: "ACC", points: 770 },
        { rank: 14, school: "Tennessee", conference: "SEC", points: 705 },
        { rank: 15, school: "Utah", conference: "Pac-12", points: 640 }
      ];
    }
  };

  const fetchTeams = async () => {
    try {
      return await teamService.getAllTeams();
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  };

  const fetchFeaturedGame = async () => {
    try {
      // Featured game - Ohio State vs Texas at Ohio Stadium
      return {
        id: 1,
        homeTeam: "Ohio State",
        awayTeam: "Texas",
        homeConference: "Big Ten",
        awayConference: "SEC",
        week: 1,
        season: 2025,
        venue: "Ohio Stadium",
        neutralSite: false,
        conferenceGame: false,
        date: "August 30, 2025",
        time: "12:00 PM EST",
        network: "FOX"
      };
    } catch (error) {
      console.error('Error fetching featured game:', error);
      return null;
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const openArticle = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading GAMEDAY+ Home...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Content</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={fetchData}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-black gradient-text mb-4 tracking-tight">
            GAMEDAY+ HOME
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your ultimate college football headquarters - News, Rankings, and Recruiting
          </p>
        </div>

        {/* Featured Game */}
        {featuredGame && (
          <div className="mb-12">
            <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white border-opacity-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">FEATURED GAME</h2>
                <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-sm font-bold">
                  Week {featuredGame.week}
                </span>
              </div>
              
              <div className="flex items-center justify-center space-x-8">
                {/* Away Team */}
                <div className="text-center flex-1">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                    <i className="fas fa-university text-3xl text-gray-600"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{featuredGame.awayTeam}</h3>
                  <p className="text-sm text-gray-600">{featuredGame.awayConference}</p>
                </div>

                {/* VS Badge */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-lg">VS</span>
                  </div>
                </div>

                {/* Home Team */}
                <div className="text-center flex-1">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                    <i className="fas fa-university text-3xl text-gray-600"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{featuredGame.homeTeam}</h3>
                  <p className="text-sm text-gray-600">{featuredGame.homeConference}</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-700 mb-2">
                  <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
                  {featuredGame.venue}
                </p>
                <p className="text-sm text-gray-600">{featuredGame.date} • {featuredGame.time} • {featuredGame.network}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Top Recruits */}
          <div className="lg:col-span-3">
            <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white border-opacity-20 sticky top-32">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">TOP RECRUITS</h2>
                <span className="text-sm text-gray-600 font-semibold">2025 Class</span>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {topRecruits.slice(0, 8).map((recruit) => (
                  <div key={recruit.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300">
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded">
                        #{recruit.ranking}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded">
                        {recruit.position}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-sm text-gray-800 mb-1">{recruit.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{recruit.school}, {recruit.state}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        {[...Array(recruit.stars)].map((_, i) => (
                          <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>
                        ))}
                      </div>
                      
                      {recruit.committedTo ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                            <i className="fas fa-university text-xs text-gray-600"></i>
                          </div>
                          <span className="text-xs text-gray-700">{recruit.committedTo}</span>
                          <i className="fas fa-check-circle text-green-500 text-xs"></i>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Uncommitted</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - News Articles */}
          <div className="lg:col-span-6">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold gradient-text mb-2">GAMEDAY+ NEWS</h2>
                <p className="text-gray-600">Latest college football updates and analysis</p>
              </div>

              {articles.map((article) => (
                <div 
                  key={article.id}
                  className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white border-opacity-20 hover:shadow-2xl transition duration-300 cursor-pointer"
                  onClick={() => openArticle(article.url)}
                >
                  {article.image && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        onError={(e) => {
                          // Fallback to default image if article image fails to load
                          e.target.src = "/photos/ncaaf.png";
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-full">
                        GAMEDAY+ News
                      </span>
                      <i className="fas fa-external-link-alt text-gray-400 hover:text-red-500 transition duration-300"></i>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-3 hover:gradient-text transition duration-300">
                      {article.title}
                    </h3>
                    
                    {article.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="font-semibold">{article.source?.name || 'Unknown Source'}</span>
                      <span>{article.publishedAt ? formatDate(article.publishedAt) : 'Recently'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - AP Top 25 Poll */}
          <div className="lg:col-span-3">
            <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white border-opacity-20 sticky top-32">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">AP TOP 25</h2>
                <img src="/photos/AP25.jpg" alt="AP Poll" className="h-6 object-contain" />
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pollRankings.map((team) => (
                  <div key={team.rank} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{team.rank}</span>
                    </div>
                    
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center p-1">
                      <img 
                        src={getTeamLogo(team.school)} 
                        alt={`${team.school} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = '/photos/ncaaf.png';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-800 truncate">{team.school}</h4>
                      <p className="text-xs text-gray-600">{team.conference}</p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs text-gray-500">{team.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Experience More with GAMEDAY+</h3>
            <p className="text-xl mb-6 opacity-90">
              Get access to premium analytics, betting models, and exclusive content
            </p>
            <button className="px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition duration-300 shadow-lg">
              Try for Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageView;
