import React, { useState, useEffect, useCallback } from 'react';
import { newsService, teamService, rankingsService } from '../../services';
import LazyImage from '../UI/LazyImage';

const HomePageView = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [topRecruits, setTopRecruits] = useState([]);
  const [pollRankings, setPollRankings] = useState([]);
  const [coachesPollRankings, setCoachesPollRankings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [featuredGame, setFeaturedGame] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Get team logo from teams data
  const getTeamLogo = (teamName) => {
    const team = teams.find(t => t.school === teamName);
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  // Calculate time left until game
  const calculateTimeLeft = useCallback(() => {
    if (!featuredGame) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const gameDate = new Date('2025-08-30T16:00:00'); // 12:00 PM EST = 4:00 PM UTC
    const now = new Date();
    const difference = gameDate - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }, [featuredGame]);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [newsData, recruitsData, pollData, coachesPollData, teamsData, gameData] = await Promise.all([
        fetchNews(),
        fetchTopRecruits(),
        fetchAPPoll(),
        fetchCoachesPoll(),
        fetchTeams(),
        fetchFeaturedGame()
      ]);

      setArticles(newsData);
      setTopRecruits(recruitsData);
      setPollRankings(pollData);
      setCoachesPollRankings(coachesPollData);
      setTeams(teamsData);
      setFeaturedGame(gameData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since fetchData doesn't depend on any props or state

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchNews = async () => {
    try {
      // Use actual news service to fetch college football articles
      const articles = await newsService.getLatestNews(10);
      return articles;
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
      // Use actual recruiting service to fetch top recruits for 2025 class
      const recruits = await rankingsService.getPlayerRecruitingRankings(2025);
      
      // Transform API data to match our component's expected format
      return recruits.slice(0, 40).map((recruit, index) => ({
        id: recruit.id || index + 1,
        name: recruit.name,
        position: recruit.position,
        ranking: recruit.ranking || index + 1,
        stars: recruit.stars || 4,
        school: recruit.school,
        state: recruit.stateProvince || recruit.state,
        committedTo: recruit.committedTo
      }));
    } catch (error) {
      console.error('Error fetching recruits:', error);
      // Fallback recruits data if API fails - extended to 40
      return [
        { id: 1, name: "Marcus Johnson", position: "QB", ranking: 1, stars: 5, school: "De La Salle High School", state: "CA", committedTo: "Georgia" },
        { id: 2, name: "Trevor Williams", position: "RB", ranking: 2, stars: 5, school: "IMG Academy", state: "FL", committedTo: "Alabama" },
        { id: 3, name: "David Thompson", position: "WR", ranking: 3, stars: 5, school: "Mater Dei", state: "CA", committedTo: null },
        { id: 4, name: "Michael Davis", position: "DE", ranking: 4, stars: 5, school: "St. John Bosco", state: "CA", committedTo: "Ohio State" },
        { id: 5, name: "Chris Martinez", position: "OT", ranking: 5, stars: 5, school: "Duncanville", state: "TX", committedTo: "Texas" },
        { id: 6, name: "Anthony Brown", position: "CB", ranking: 6, stars: 5, school: "American Heritage", state: "FL", committedTo: null },
        { id: 7, name: "Robert Wilson", position: "LB", ranking: 7, stars: 5, school: "Centennial", state: "NV", committedTo: "USC" },
        { id: 8, name: "Kevin Garcia", position: "DT", ranking: 8, stars: 4, school: "Bishop Gorman", state: "NV", committedTo: "Oregon" },
        { id: 9, name: "James Rodriguez", position: "QB", ranking: 9, stars: 4, school: "Trinity", state: "TX", committedTo: "Notre Dame" },
        { id: 10, name: "Tyler Anderson", position: "WR", ranking: 10, stars: 4, school: "Servite", state: "CA", committedTo: "Alabama" },
        { id: 11, name: "Brandon Lee", position: "OT", ranking: 11, stars: 4, school: "Westlake", state: "TX", committedTo: null },
        { id: 12, name: "Austin Clark", position: "DE", ranking: 12, stars: 4, school: "Eastside Catholic", state: "WA", committedTo: "Oregon" },
        { id: 13, name: "Ryan Mitchell", position: "RB", ranking: 13, stars: 4, school: "Kahuku", state: "HI", committedTo: "Georgia" },
        { id: 14, name: "Daniel Kim", position: "CB", ranking: 14, stars: 4, school: "Poly Prep", state: "CA", committedTo: "USC" },
        { id: 15, name: "Jacob Thompson", position: "LB", ranking: 15, stars: 4, school: "St. Frances", state: "MD", committedTo: null },
        { id: 16, name: "Noah Williams", position: "DT", ranking: 16, stars: 4, school: "Buford", state: "GA", committedTo: "Georgia" },
        { id: 17, name: "Ethan Davis", position: "WR", ranking: 17, stars: 4, school: "Venice", state: "FL", committedTo: "Miami" },
        { id: 18, name: "Lucas Martinez", position: "OG", ranking: 18, stars: 4, school: "Elder", state: "OH", committedTo: "Ohio State" },
        { id: 19, name: "Mason Brown", position: "TE", ranking: 19, stars: 4, school: "Cathedral", state: "IN", committedTo: null },
        { id: 20, name: "Caleb Johnson", position: "S", ranking: 20, stars: 4, school: "IMG Academy", state: "FL", committedTo: "Florida" },
        { id: 21, name: "Hunter Wilson", position: "QB", ranking: 21, stars: 4, school: "Corner Canyon", state: "UT", committedTo: "BYU" },
        { id: 22, name: "Cole Anderson", position: "RB", ranking: 22, stars: 4, school: "Basha", state: "AZ", committedTo: "Arizona State" },
        { id: 23, name: "Blake Garcia", position: "WR", ranking: 23, stars: 4, school: "Dutch Fork", state: "SC", committedTo: "Clemson" },
        { id: 24, name: "Carson Taylor", position: "DE", ranking: 24, stars: 4, school: "Skyline", state: "TX", committedTo: null },
        { id: 25, name: "Isaiah White", position: "CB", ranking: 25, stars: 4, school: "Serra", state: "CA", committedTo: "Stanford" },
        { id: 26, name: "Jordan Miller", position: "OT", ranking: 26, stars: 4, school: "St. Thomas Aquinas", state: "FL", committedTo: "Miami" },
        { id: 27, name: "Andrew Jackson", position: "WR", ranking: 27, stars: 4, school: "Shadow Creek", state: "TX", committedTo: "Texas A&M" },
        { id: 28, name: "Cameron Smith", position: "LB", ranking: 28, stars: 4, school: "Don Bosco Prep", state: "NJ", committedTo: null },
        { id: 29, name: "Xavier Thompson", position: "DT", ranking: 29, stars: 4, school: "North Shore", state: "TX", committedTo: "Texas" },
        { id: 30, name: "Malik Washington", position: "RB", ranking: 30, stars: 4, school: "DeMatha", state: "MD", committedTo: "Penn State" },
        { id: 31, name: "Devin Harris", position: "CB", ranking: 31, stars: 4, school: "Lakeland", state: "FL", committedTo: "Florida State" },
        { id: 32, name: "Tyler Brooks", position: "TE", ranking: 32, stars: 4, school: "Trinity Christian", state: "TX", committedTo: "Notre Dame" },
        { id: 33, name: "Joshua Martinez", position: "OG", ranking: 33, stars: 4, school: "Central Catholic", state: "CA", committedTo: "Oregon" },
        { id: 34, name: "Antonio Davis", position: "S", ranking: 34, stars: 4, school: "Cocoa", state: "FL", committedTo: null },
        { id: 35, name: "Marcus Lewis", position: "DE", ranking: 35, stars: 4, school: "Grayson", state: "GA", committedTo: "Georgia" },
        { id: 36, name: "Christian Moore", position: "QB", ranking: 36, stars: 4, school: "Bishop Gorman", state: "NV", committedTo: "USC" },
        { id: 37, name: "Jaylen Cooper", position: "WR", ranking: 37, stars: 4, school: "Cedar Hill", state: "TX", committedTo: null },
        { id: 38, name: "Terrell Johnson", position: "RB", ranking: 38, stars: 4, school: "Mallard Creek", state: "NC", committedTo: "North Carolina" },
        { id: 39, name: "Emmanuel Walker", position: "LB", ranking: 39, stars: 4, school: "Katy", state: "TX", committedTo: "Alabama" },
        { id: 40, name: "Damon Rodriguez", position: "CB", ranking: 40, stars: 4, school: "Venice", state: "CA", committedTo: "UCLA" }
      ];
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

  const fetchCoachesPoll = async () => {
    try {
      // Fetch actual Coaches Poll rankings using rankings service
      const rankingsData = await rankingsService.getHistoricalRankings(2024, 1, 'postseason');
      
      // Find the most recent Coaches poll
      for (let i = rankingsData.length - 1; i >= 0; i--) {
        const weekData = rankingsData[i];
        const coachesPoll = weekData.polls?.find(poll => poll.poll === 'Coaches Poll');
        if (coachesPoll && coachesPoll.ranks) {
          // Return all teams from the poll (typically 25) for the sidebar
          return coachesPoll.ranks.map(team => ({
            rank: team.rank,
            school: team.school,
            conference: team.conference || 'Unknown',
            points: team.points || 0,
            firstPlaceVotes: team.firstPlaceVotes || 0
          }));
        }
      }
      
      // Fallback if no Coaches poll found - return empty array to show no rankings
      console.warn('No Coaches poll found in rankings data');
      return [];
    } catch (error) {
      console.error('Error fetching Coaches Poll:', error);
      // Return mock data as fallback if API fails
      return [
        { rank: 1, school: "Alabama", conference: "SEC", points: 1575 },
        { rank: 2, school: "Georgia", conference: "SEC", points: 1510 },
        { rank: 3, school: "Ohio State", conference: "Big Ten", points: 1445 },
        { rank: 4, school: "Michigan", conference: "Big Ten", points: 1380 },
        { rank: 5, school: "Texas", conference: "Big 12", points: 1315 },
        { rank: 6, school: "USC", conference: "Pac-12", points: 1250 },
        { rank: 7, school: "Clemson", conference: "ACC", points: 1185 },
        { rank: 8, school: "Oregon", conference: "Pac-12", points: 1120 },
        { rank: 9, school: "Oklahoma", conference: "SEC", points: 1055 },
        { rank: 10, school: "Notre Dame", conference: "Independent", points: 990 },
        { rank: 11, school: "LSU", conference: "SEC", points: 925 },
        { rank: 12, school: "Penn State", conference: "Big Ten", points: 860 },
        { rank: 13, school: "Florida State", conference: "ACC", points: 795 },
        { rank: 14, school: "Tennessee", conference: "SEC", points: 730 },
        { rank: 15, school: "Utah", conference: "Pac-12", points: 665 }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-red-500 to-red-600 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xl gradient-text font-bold">Loading...</p>
              <p className="text-gray-600">Fetching the latest college football data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-red-50 to-red-100 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Error loading data: {error}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="container mx-auto px-4">
        {/* Featured Game */}
        {featuredGame && (
          <div className="w-[98%] mx-auto mb-6">
            <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 relative">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold gradient-text">FEATURED GAME</h2>
                  
                  {/* Live Countdown Timer - Centered */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-2">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-200 shadow-lg">
                      <div className="text-xs text-gray-600 font-medium mb-1 text-center">KICKOFF IN</div>
                      <div className="grid grid-cols-4 gap-1 text-center">
                        <div className="gradient-bg rounded px-1 py-1">
                          <div className="text-white font-bold text-xs">{timeLeft.days}</div>
                          <div className="text-white text-xs">DAYS</div>
                        </div>
                        <div className="gradient-bg rounded px-1 py-1">
                          <div className="text-white font-bold text-xs">{timeLeft.hours}</div>
                          <div className="text-white text-xs">HRS</div>
                        </div>
                        <div className="gradient-bg rounded px-1 py-1">
                          <div className="text-white font-bold text-xs">{timeLeft.minutes}</div>
                          <div className="text-white text-xs">MIN</div>
                        </div>
                        <div className="gradient-bg rounded px-1 py-1">
                          <div className="text-white font-bold text-xs">{timeLeft.seconds}</div>
                          <div className="text-white text-xs">SEC</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 gradient-bg text-white rounded-full text-sm font-bold">
                      Week {featuredGame.week}
                    </div>
                    <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-200">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21,3H3C1.89,3 1,3.89 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5C23,3.89 22.1,3 21,3M21,19H3V5H21V19Z" />
                        <path d="M10,12L15,9V15" fill="#3B82F6"/>
                      </svg>
                      <span className="text-sm font-bold text-gray-700">HD</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-6">
                  {/* Away Team */}
                  <div className="text-center flex-1">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-2 flex items-center justify-center p-3 relative metallic-3d-logo-container">
                      <img 
                        src={getTeamLogo(featuredGame.awayTeam)} 
                        alt={`${featuredGame.awayTeam} logo`}
                        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 metallic-3d-logo-enhanced"
                        onError={(e) => {
                          e.target.src = '/photos/ncaaf.png';
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{featuredGame.awayTeam}</h3>
                    <p className="text-sm text-gray-600">{featuredGame.awayConference}</p>
                  </div>

                  {/* VS Badge */}
                  <div className="flex-shrink-0 text-center">
                    <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-black text-sm">VS</span>
                    </div>
                  </div>

                  {/* Home Team */}
                  <div className="text-center flex-1">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-2 flex items-center justify-center p-2 relative metallic-3d-logo-container">
                      <img 
                        src={getTeamLogo(featuredGame.homeTeam)} 
                        alt={`${featuredGame.homeTeam} logo`}
                        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 metallic-3d-logo-enhanced"
                        onError={(e) => {
                          e.target.src = '/photos/ncaaf.png';
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{featuredGame.homeTeam}</h3>
                    <p className="text-sm text-gray-600">{featuredGame.homeConference}</p>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-gray-700 mb-1 flex items-center justify-center text-sm">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {featuredGame.venue}
                  </p>
                  <p className="text-xs text-gray-600">{featuredGame.date} • {featuredGame.time} • {featuredGame.network}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Top Recruits */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-6">
              <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 -m-6 mb-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold gradient-text">TOP RECRUITS</h2>
                  <span className="text-sm text-gray-600 font-semibold">2025 Class</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {topRecruits.slice(0, 40).map((recruit) => (
                  <div key={recruit.id} className="p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:from-gray-100 hover:to-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-md">
                    {/* Main row with clean 247 Sports-style alignment */}
                    <div className="flex items-center space-x-3">
                      {/* Rank number - fixed width for alignment */}
                      <div className="flex-shrink-0 w-6 h-6 gradient-bg rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {recruit.ranking}
                        </span>
                      </div>
                      
                      {/* Person Icon */}
                      <div className="flex-shrink-0 w-6 h-6 gradient-bg rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      
                      {/* Player info - flex to take remaining space */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-gray-800 truncate">{recruit.name}</h4>
                            <p className="text-xs text-gray-600 truncate">{recruit.school}, {recruit.state}</p>
                          </div>
                          
                          {/* Position badge - aligned right */}
                          <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded flex-shrink-0">
                            {recruit.position}
                          </span>
                        </div>
                        
                        {/* Bottom row with stars and commitment */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            {/* Star rating */}
                            <div className="flex">
                              {[...Array(recruit.stars)].map((_, i) => (
                                <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          
                          {/* Commitment status */}
                          {recruit.committedTo ? (
                            <div className="flex items-center space-x-1">
                              <div className="w-4 h-4 flex items-center justify-center">
                                <img 
                                  src={getTeamLogo(recruit.committedTo)} 
                                  alt={`${recruit.committedTo} logo`}
                                  className="w-full h-full object-contain filter brightness-85 contrast-115 saturate-130 drop-shadow-sm"
                                  onError={(e) => {
                                    e.target.src = '/photos/ncaaf.png';
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-700 truncate max-w-[60px]">{recruit.committedTo}</span>
                              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 font-medium">Open</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - News Articles */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              {articles.map((article) => (
                <div 
                  key={article.id}
                  className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl hover:bg-white/70 transition-all duration-500 cursor-pointer hover:scale-105 hover:border-white/50"
                  onClick={() => openArticle(article.url)}
                >
                  {/* Image container */}
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                    <LazyImage
                      src={article.image || "/photos/ncaaf.png"}
                      alt={article.title}
                      className="news-card-image"
                      placeholder="/photos/ncaaf.png"
                    />
                    <div className="news-image-overlay"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold gradient-text italic">
                        GAMEDAY+ News
                      </span>
                      <svg className="w-5 h-5 text-gray-400 hover:text-red-500 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:gradient-text transition duration-300 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                      <span className="font-semibold">{article.source?.name || 'Unknown Source'}</span>
                      <span>{article.publishedAt ? formatDate(article.publishedAt) : 'Recently'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Both Polls */}
          <div className="lg:col-span-3 space-y-8">
            {/* AP Top 25 Poll */}
            <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-6">
              <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 -m-6 mb-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold gradient-text">AP TOP 25</h2>
                  <img src="/photos/committee.png" alt="AP Poll" className="h-6 object-contain" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {pollRankings.slice(0, 25).map((team) => (
                  <div key={team.rank} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:from-gray-100 hover:to-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-md">
                    <div className="flex-shrink-0 w-6 h-6 gradient-bg rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{team.rank}</span>
                    </div>
                    
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      <img 
                        src={getTeamLogo(team.school)} 
                        alt={`${team.school} logo`}
                        className="w-full h-full object-contain filter brightness-85 contrast-115 saturate-130 drop-shadow-sm"
                        onError={(e) => {
                          e.target.src = '/photos/ncaaf.png';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-800 truncate">{team.school}</h4>
                      <p className="text-xs text-gray-600 truncate">{team.conference}</p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs text-gray-500">{team.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coaches Poll */}
            <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-6">
              <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 -m-6 mb-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold gradient-text">COACHES POLL</h2>
                  <img src="/photos/committee.png" alt="Coaches Poll" className="h-6 object-contain" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {coachesPollRankings.slice(0, 25).map((team) => (
                  <div key={team.rank} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:from-gray-100 hover:to-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-md">
                    <div className="flex-shrink-0 w-6 h-6 gradient-bg rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{team.rank}</span>
                    </div>
                    
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      <img 
                        src={getTeamLogo(team.school)} 
                        alt={`${team.school} logo`}
                        className="w-full h-full object-contain filter brightness-85 contrast-115 saturate-130 drop-shadow-sm"
                        onError={(e) => {
                          e.target.src = '/photos/ncaaf.png';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-800 truncate">{team.school}</h4>
                      <p className="text-xs text-gray-600 truncate">{team.conference}</p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs text-gray-500">{team.points}</span>
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

export default HomePageView;