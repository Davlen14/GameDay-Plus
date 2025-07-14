import React, { useState, useEffect } from 'react';
import teamService from '../../services/teamService';
import gameService from '../../services/gameService';
import rankingsService from '../../services/rankingsService';

// Enhanced Team Performance Component
const TeamPerformanceCard = ({ team, rank, record, eloRating, talentRating, onTeamClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const getEloLevel = (elo) => {
    if (!elo) return 'Unranked';
    if (elo >= 2000) return 'Elite';
    if (elo >= 1800) return 'Strong';
    if (elo >= 1600) return 'Good';
    return 'Developing';
  };

  const getEloColor = (elo) => {
    if (!elo) return 'text-gray-500';
    if (elo >= 2000) return 'text-green-600';
    if (elo >= 1800) return 'text-blue-600';
    if (elo >= 1600) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTalentBarWidth = (talent, maxTalent) => {
    if (!talent || !maxTalent) return 0;
    return Math.min((talent / maxTalent) * 100, 100);
  };

  return (
    <div 
      className="relative group cursor-pointer transform transition-all duration-500 hover:scale-105"
      onClick={() => onTeamClick && onTeamClick(team.id)}
    >
      {/* Liquid Glass Card Container */}
      <div className="relative bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_15px_35px_rgba(0,0,0,0.1)] p-6 hover:bg-white/50 transition-all duration-300">
        {/* Glass highlight overlay */}
        <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* Team Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Team Logo */}
              <div className="w-14 h-14 rounded-full bg-white/60 backdrop-blur-sm border border-white/60 flex items-center justify-center overflow-hidden shadow-lg">
                <img 
                  src={team.logos?.[0] || '/photos/ncaaf.png'} 
                  alt={team.school}
                  className="w-10 h-10 object-contain"
                  onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                />
              </div>
              
              {/* Team Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {rank && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}>
                      {rank}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-800 truncate">{team.school}</h3>
                </div>
                <p className="text-sm text-gray-600 font-medium">{team.abbreviation}</p>
              </div>
            </div>

            {/* Conference Trophy */}
            <div className="flex items-center space-x-2">
              <i className="fas fa-trophy text-2xl" style={{ 
                background: 'linear-gradient(135deg, #000000, #555555, #000000)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))'
              }}></i>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-3">
            {/* Record */}
            {record && (
              <div className="bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/40">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Record</span>
                  <span className="font-bold text-gray-800">{record.wins}-{record.losses}</span>
                </div>
              </div>
            )}

            {/* ELO Rating */}
            {eloRating && (
              <div 
                className="bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/40 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">ELO Rating</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getEloColor(eloRating)}`}>{Math.round(eloRating)}</span>
                    <span className="text-xs text-gray-600">({getEloLevel(eloRating)})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Talent Rating with Bar */}
            {talentRating && (
              <div className="bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/40">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Talent</span>
                  <span className="font-bold text-gray-800">{talentRating.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ 
                      width: `${getTalentBarWidth(talentRating, 1000)}%`,
                      background: 'linear-gradient(135deg, #000000, #555555, #000000)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ELO Tooltip */}
          {showTooltip && eloRating && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[10000] w-72">
              <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-4">
                <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-chart-line" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                    <h4 className="font-bold text-gray-800">ELO Rating System</h4>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    ELO measures team strength based on wins, losses, and opponent quality. 
                    Big Ten teams compete at the highest level of college football.
                  </p>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Elite:</span>
                      <span className="font-bold text-green-600">2000+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Strong:</span>
                      <span className="font-bold text-blue-600">1800-1999</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Good:</span>
                      <span className="font-bold text-yellow-600">1600-1799</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Developing:</span>
                      <span className="font-bold text-gray-600">Below 1600</span>
                    </div>
                  </div>
                </div>
                
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-white/50 rotate-45"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Conference News Component
const ConferenceNews = ({ news }) => {
  const formatNewsDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-4">
      {news.slice(0, 6).map((article, index) => (
        <div 
          key={index}
          className="relative group cursor-pointer"
          onClick={() => article.url && window.open(article.url, '_blank')}
        >
          <div className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4 hover:bg-white/40 transition-all duration-300 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]">
            {/* Glass highlight */}
            <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              {article.image && (
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              
              <h4 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm leading-tight">
                {article.title}
              </h4>
              
              {article.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {article.description}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{article.source || 'Big Ten News'}</span>
                <span>{formatNewsDate(article.publishedAt || article.date)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Recent Games Component
const RecentGames = ({ games, teams, getTeamLogo, getTeamAbbreviation }) => {
  const formatGameDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  return (
    <div className="space-y-3">
      {games.slice(0, 8).map((game, index) => {
        const homeTeam = teams.find(t => t.id === (game.home_id || game.homeId));
        const awayTeam = teams.find(t => t.id === (game.away_id || game.awayId));
        const isCompleted = game.completed === true;
        
        return (
          <div key={game.id || index} className="relative">
            <div className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]">
              {/* Glass highlight */}
              <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                {/* Game Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-football-ball text-sm" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                    <span className="text-xs font-semibold text-gray-700">
                      {formatGameDate(game.start_date || game.date)}
                    </span>
                  </div>
                  {isCompleted && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Final
                    </span>
                  )}
                </div>

                {/* Teams */}
                <div className="space-y-2">
                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center overflow-hidden">
                        <img 
                          src={getTeamLogo(game.away_id || game.awayId)} 
                          alt={awayTeam?.school}
                          className="w-4 h-4 object-contain"
                          onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {getTeamAbbreviation(game.away_id || game.awayId) || 'TBD'}
                      </span>
                    </div>
                    {isCompleted && (
                      <span className="text-sm font-bold text-gray-800">
                        {game.away_points || game.awayPoints || 0}
                      </span>
                    )}
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center overflow-hidden">
                        <img 
                          src={getTeamLogo(game.home_id || game.homeId)} 
                          alt={homeTeam?.school}
                          className="w-4 h-4 object-contain"
                          onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {getTeamAbbreviation(game.home_id || game.homeId) || 'TBD'}
                      </span>
                    </div>
                    {isCompleted && (
                      <span className="text-sm font-bold text-gray-800">
                        {game.home_points || game.homePoints || 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BigTen = () => {
  // State management
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [standings, setStandings] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [news, setNews] = useState([]);
  const [teamTalent, setTeamTalent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Standings');

  // Big Ten team IDs (you may need to adjust these based on your data)
  const bigTenTeamIds = [
    2, 130, 135, 158, 193, 213, 239, 253, 254, 269, 275, 294, 329, 331, 356, 371, 405, 419
  ];

  const categories = ['Standings', 'Recent Games', 'Rankings', 'News'];

  useEffect(() => {
    loadBigTenData();
  }, []);

  const loadBigTenData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Load all teams first
      const allTeams = await teamService.getFBSTeams(true);
      const bigTenTeams = allTeams.filter(team => 
        team.conference === 'Big Ten' || bigTenTeamIds.includes(team.id)
      );
      setTeams(bigTenTeams);

      // Load recent games for Big Ten teams
      const currentWeek = 1; // You can make this dynamic
      const recentGames = await gameService.getGamesByWeek(2024, currentWeek, 'regular', false);
      const bigTenGames = recentGames.filter(game => 
        bigTenTeamIds.includes(game.home_id || game.homeId) || 
        bigTenTeamIds.includes(game.away_id || game.awayId)
      );
      setGames(bigTenGames);

      // Load rankings
      try {
        const rankingsData = await rankingsService.getHistoricalRankings(2024, null, 'postseason');
        const apPoll = rankingsData.find(week => 
          week.polls?.find(poll => poll.poll === 'AP Top 25')
        );
        if (apPoll) {
          const apRankings = apPoll.polls.find(poll => poll.poll === 'AP Top 25');
          setRankings(apRankings?.ranks || []);
        }
      } catch (error) {
        console.warn('Error loading rankings:', error);
        setRankings([]);
      }

      // Mock news data (you can replace with real news service)
      const mockNews = [
        {
          title: "Big Ten Championship Race Heats Up",
          description: "Multiple teams vie for conference title as season progresses",
          date: new Date().toISOString(),
          source: "Big Ten Network"
        },
        {
          title: "Transfer Portal Impact on Big Ten",
          description: "How portal transfers are reshaping conference competition",
          date: new Date(Date.now() - 86400000).toISOString(),
          source: "ESPN"
        },
        {
          title: "Big Ten Recruiting Update",
          description: "Latest commitments and recruiting news across the conference",
          date: new Date(Date.now() - 172800000).toISOString(),
          source: "247Sports"
        }
      ];
      setNews(mockNews);

      // Mock talent ratings (you can replace with real data)
      const mockTalent = bigTenTeams.map(team => ({
        school: team.school,
        talent: Math.random() * 200 + 800, // Random talent score between 800-1000
        elo: Math.random() * 400 + 1600 // Random ELO between 1600-2000
      }));
      setTeamTalent(mockTalent);

    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error loading Big Ten data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamLogo = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  const getTeamAbbreviation = (teamId, fallback) => {
    const team = teams.find(t => t.id === teamId);
    if (team?.abbreviation) return team.abbreviation;
    if (team?.school) {
      const words = team.school.split(' ').filter(w => w.length > 0);
      if (words.length === 1) return words[0].substring(0, 4).toUpperCase();
      return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
    }
    return fallback || 'TBD';
  };

  const getTeamRank = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    const ranking = rankings.find(r => r.school.toLowerCase() === team.school.toLowerCase());
    return ranking?.rank || null;
  };

  const getTeamRecord = (teamId) => {
    // Mock record data - you can replace with real standings data
    return {
      wins: Math.floor(Math.random() * 10) + 2,
      losses: Math.floor(Math.random() * 4)
    };
  };

  const getTeamElo = (teamSchool) => {
    const talent = teamTalent.find(t => t.school === teamSchool);
    return talent?.elo || null;
  };

  const getTeamTalent = (teamSchool) => {
    const talent = teamTalent.find(t => t.school === teamSchool);
    return talent?.talent || null;
  };

  const handleTeamClick = (teamId) => {
    // You can implement team detail navigation here
    console.log('Team clicked:', teamId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Loading Big Ten Conference...
              </p>
              <p className="text-gray-600">Fetching conference data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
              <h3 className="font-bold">Error Loading Big Ten Data</h3>
              <p className="text-sm mt-2">{errorMessage}</p>
              <button 
                onClick={loadBigTenData}
                className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Custom CSS Styles */}
      <style jsx>{`
        .gradient-bg {
          background: linear-gradient(135deg, #000000, #555555, #000000);
        }
        .gradient-text {
          background: linear-gradient(135deg, #000000, #555555, #000000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .icon-gradient {
          background: linear-gradient(135deg, #000000, #555555, #000000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Floating Orbs Background - Big Ten themed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
        <div className="absolute top-60 right-20 w-48 h-48 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-80 rounded-full opacity-4 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-56 h-56 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Liquid Glass Header Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8 relative">
            {/* Liquid Glass Icon Container */}
            <div className="relative">
              {/* Outer glass ring */}
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl animate-pulse"></div>
              {/* Inner glass container */}
              <div className="relative w-16 h-16 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center">
                {/* Liquid glass highlight */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
                <i className="fas fa-trophy text-3xl relative z-10 drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}></i>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full opacity-60 animate-ping" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full opacity-40 animate-ping animation-delay-500" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
            </div>
          </div>
          
          {/* Enhanced Title with Liquid Glass Effect */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-7xl font-black mb-6 relative">
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Big Ten</span>
              <br />
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Conference</span>
              {/* Animated underline */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 rounded-full opacity-60 animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
            </h1>
          </div>
          
          {/* Stats Badge with Liquid Glass */}
          <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_15px_35px_rgba(0,0,0,0.1)]">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
              <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{teams.length} Teams</span>
            </div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="text-lg text-gray-700 font-medium">2024 Season</span>
          </div>
        </div>

        {/* Liquid Glass Category Controls */}
        <div className="relative mb-8">
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            {/* Highlight overlay */}
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-4 justify-center">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-500 transform hover:scale-105 ${
                      selectedCategory === category
                        ? 'text-white shadow-2xl'
                        : 'text-gray-700 hover:text-white'
                    }`}
                  >
                    {/* Active gradient background */}
                    {selectedCategory === category && (
                      <div className="absolute inset-0 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}></div>
                    )}
                    
                    {/* Inactive glass background */}
                    {selectedCategory !== category && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300"></div>
                    )}
                    
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <span className="relative z-10">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedCategory === 'Standings' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Conference Standings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teams.map((team, index) => (
                      <TeamPerformanceCard
                        key={team.id}
                        team={team}
                        rank={getTeamRank(team.id)}
                        record={getTeamRecord(team.id)}
                        eloRating={getTeamElo(team.school)}
                        talentRating={getTeamTalent(team.school)}
                        onTeamClick={handleTeamClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'Recent Games' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Recent Games
                  </h2>
                  
                  <RecentGames 
                    games={games}
                    teams={teams}
                    getTeamLogo={getTeamLogo}
                    getTeamAbbreviation={getTeamAbbreviation}
                  />
                </div>
              </div>
            )}

            {selectedCategory === 'Rankings' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    AP Top 25 Rankings
                  </h2>
                  
                  <div className="space-y-4">
                    {rankings.filter(rank => 
                      teams.some(team => team.school.toLowerCase() === rank.school.toLowerCase())
                    ).map((ranking, index) => {
                      const team = teams.find(t => t.school.toLowerCase() === ranking.school.toLowerCase());
                      return (
                        <div key={index} className="relative bg-white/30 backdrop-blur-xl rounded-xl border border-white/40 p-4">
                          <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)' }}>
                                {ranking.rank}
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center overflow-hidden">
                                  <img 
                                    src={team?.logos?.[0] || '/photos/ncaaf.png'} 
                                    alt={ranking.school}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                                  />
                                </div>
                                <span className="font-bold text-gray-800">{ranking.school}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-700">{ranking.points} pts</div>
                              <div className="text-xs text-gray-500">{ranking.firstPlaceVotes || 0} first place</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'News' && (
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Conference News
                  </h2>
                  
                  <ConferenceNews news={news} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Conference Logo */}
            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8 text-center">
              <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <img 
                  src="/photos/Big Ten.png" 
                  alt="Big Ten Conference"
                  className="w-32 h-32 mx-auto mb-4 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Big Ten Conference</h3>
                <p className="text-gray-600 text-sm">Est. 1896 • 18 Teams</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
              <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4" style={{ background: 'linear-gradient(135deg, #000000, #555555, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Quick Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span className="text-sm text-gray-600">Active Teams</span>
                    <span className="font-bold text-gray-800">{teams.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span className="text-sm text-gray-600">Ranked Teams</span>
                    <span className="font-bold text-gray-800">
                      {rankings.filter(rank => 
                        teams.some(team => team.school.toLowerCase() === rank.school.toLowerCase())
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Recent Games</span>
                    <span className="font-bold text-gray-800">{games.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BigTen;
