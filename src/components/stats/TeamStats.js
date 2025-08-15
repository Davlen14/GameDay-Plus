import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';

const TeamStats = () => {
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('rankings');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTeamsData();
  }, []);

  const loadTeamsData = async () => {
    setLoading(true);
    try {
      console.log('🏈 Loading teams data...');
      const teamsData = await gameService.getTeams();
      
      // Get top 25 FBS teams with enhanced mock stats
      const top25Teams = teamsData
        .filter(team => team.classification === 'fbs')
        .slice(0, 25)
        .map((team, index) => ({
          ...team,
          rank: index + 1,
          record: generateMockRecord(index + 1),
          stats: generateMockStats(index + 1),
          trend: generateTrend(index + 1)
        }));

      setTeams(top25Teams);
      console.log('✅ Teams data loaded:', top25Teams);
    } catch (error) {
      console.error('❌ Error loading teams:', error);
      // Fallback to completely mock data if API fails
      setTeams(generateFallbackTeams());
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecord = (rank) => {
    const baseWins = Math.max(12 - Math.floor(rank / 3), 8);
    const losses = Math.min(Math.floor(rank / 4), 4);
    return { wins: baseWins, losses: losses };
  };

  const generateMockStats = (rank) => {
    const baseScore = Math.max(95 - rank * 2, 65);
    return {
      offenseRating: baseScore + Math.random() * 10,
      defenseRating: baseScore + Math.random() * 8,
      pointsPerGame: Math.max(45 - rank * 1.2, 28) + Math.random() * 5,
      pointsAllowed: Math.min(15 + rank * 0.8, 35) + Math.random() * 3,
      totalYards: Math.max(520 - rank * 8, 380) + Math.random() * 40,
      yardsAllowed: Math.min(280 + rank * 6, 450) + Math.random() * 30
    };
  };

  const generateTrend = (rank) => {
    if (rank <= 5) return 'HOT';
    if (rank <= 12) return 'UP';
    if (rank <= 18) return 'STEADY';
    return 'DOWN';
  };

  const generateFallbackTeams = () => {
    const fallbackTeams = [
      { school: 'Ohio State', mascot: 'Buckeyes', color: '#BB0000', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/194.png'], actualRecord: '14-2', note: 'National champion' },
      { school: 'Notre Dame', mascot: 'Fighting Irish', color: '#0C2340', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/87.png'], actualRecord: '14-2', note: 'CFP runner-up' },
      { school: 'Oregon', mascot: 'Ducks', color: '#154733', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png'], actualRecord: '13-1', note: 'Rose Bowl exit' },
      { school: 'Texas', mascot: 'Longhorns', color: '#BF5700', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/251.png'], actualRecord: '13-3', note: 'Lost in CFP semis' },
      { school: 'Penn State', mascot: 'Nittany Lions', color: '#041E42', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/213.png'], actualRecord: '13-3', note: 'CFP semifinalist' },
      { school: 'Georgia', mascot: 'Bulldogs', color: '#BA0C2F', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/61.png'], actualRecord: '11-3', note: 'SEC champion' },
      { school: 'Arizona State', mascot: 'Sun Devils', color: '#8C1538', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/9.png'], actualRecord: '11-3', note: 'First time ranked top-10' },
      { school: 'Boise State', mascot: 'Broncos', color: '#0033A0', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/68.png'], actualRecord: '12-2', note: 'Mountain West champ' },
      { school: 'Tennessee', mascot: 'Volunteers', color: '#FF8200', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png'], actualRecord: '10-3', note: 'CFP pick' },
      { school: 'Indiana', mascot: 'Hoosiers', color: '#7D110C', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/84.png'], actualRecord: '11-2', note: 'First-ever CFP berth' },
      { school: 'Ole Miss', mascot: 'Rebels', color: '#CE1126', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/145.png'], actualRecord: '10-3', note: 'Strong finish' },
      { school: 'SMU', mascot: 'Mustangs', color: '#C8102E', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png'], actualRecord: '11-3', note: 'AAC standout' },
      { school: 'BYU', mascot: 'Cougars', color: '#002E5D', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/252.png'], actualRecord: '11-2', note: 'Mountain West co-champ' },
      { school: 'Clemson', mascot: 'Tigers', color: '#F56600', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/228.png'], actualRecord: '10-4', note: 'ACC champion' },
      { school: 'Iowa State', mascot: 'Cyclones', color: '#C8102E', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/66.png'], actualRecord: '11-3', note: 'Consistent season' },
      { school: 'Illinois', mascot: 'Fighting Illini', color: '#E84A27', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/356.png'], actualRecord: '10-3', note: 'Surprise postseason run' },
      { school: 'Alabama', mascot: 'Crimson Tide', color: '#9E1B32', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/333.png'], actualRecord: '9-4', note: 'Missed big bowl' },
      { school: 'Miami', mascot: 'Hurricanes', color: '#F47321', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png'], actualRecord: '10-3', note: 'ACC contender' },
      { school: 'South Carolina', mascot: 'Gamecocks', color: '#73000A', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/2579.png'], actualRecord: '9-4', note: 'Strong finish' },
      { school: 'Syracuse', mascot: 'Orange', color: '#F76900', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/183.png'], actualRecord: '10-3', note: 'Improved over prior' },
      { school: 'Army', mascot: 'Black Knights', color: '#000000', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/349.png'], actualRecord: '12-2', note: 'Independent entry' },
      { school: 'Missouri', mascot: 'Tigers', color: '#F1B82D', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/142.png'], actualRecord: '10-3', note: 'Mid-major success' },
      { school: 'UNLV', mascot: 'Rebels', color: '#CF0A2C', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png'], actualRecord: '11-3', note: 'Mountain West team' },
      { school: 'Memphis', mascot: 'Tigers', color: '#003594', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/235.png'], actualRecord: '11-2', note: 'AAC standout' },
      { school: 'Colorado', mascot: 'Buffaloes', color: '#CFB87C', logos: ['https://a.espncdn.com/i/teamlogos/ncaa/500/38.png'], actualRecord: '9-4', note: 'Pac-12 champion' }
    ].map((team, index) => ({
      ...team,
      rank: index + 1,
      record: team.actualRecord ? { 
        wins: parseInt(team.actualRecord.split('-')[0]), 
        losses: parseInt(team.actualRecord.split('-')[1]) 
      } : generateMockRecord(index + 1),
      stats: generateMockStats(index + 1),
      trend: generateTrend(index + 1)
    }));
    return fallbackTeams;
  };

  const filteredTeams = teams.filter(team => 
    team.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.mascot?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 relative" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <style>{`
        .gradient-text {
          background: ${modernRedGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .stats-card-hover {
          transition: all 0.3s ease;
        }
        
        .stats-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(204, 0, 28, 0.15);
        }
      `}</style>

      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: modernRedGradient }}>
            <i className="fas fa-trophy text-white text-2xl"></i>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-4 gradient-text">
          College Football Rankings
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Live team statistics, rankings, and performance analytics
        </p>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none w-64"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('rankings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === 'rankings' 
                  ? 'text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              style={selectedView === 'rankings' ? { background: modernRedGradient } : {}}
            >
              Rankings
            </button>
            <button
              onClick={() => setSelectedView('stats')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === 'stats' 
                  ? 'text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              style={selectedView === 'stats' ? { background: modernRedGradient } : {}}
            >
              Statistics
            </button>
          </div>
        </div>
      </div>
      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-spin"
                 style={{ background: modernRedGradient }}>
              <i className="fas fa-football-ball text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-2 gradient-text">Loading Teams</h3>
            <p className="text-gray-600">Fetching the latest team data...</p>
          </div>
        </div>
      ) : (
        <>
          {selectedView === 'rankings' ? (
            <>
              {/* Team Rankings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTeams.map((team, index) => (
                  <TeamCard key={team.school} team={team} modernRedGradient={modernRedGradient} />
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-12 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
                <h2 className="text-2xl font-bold mb-6 gradient-text text-center">
                  <i className="fas fa-chart-bar mr-3"></i>
                  League Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {filteredTeams.length}
                    </div>
                    <div className="text-gray-600">Teams Ranked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {filteredTeams.reduce((sum, team) => sum + team.record.wins, 0)}
                    </div>
                    <div className="text-gray-600">Total Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {Math.round(filteredTeams.reduce((sum, team) => sum + team.stats.pointsPerGame, 0) / filteredTeams.length)}
                    </div>
                    <div className="text-gray-600">Avg PPG</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {Math.round(filteredTeams.reduce((sum, team) => sum + team.stats.totalYards, 0) / filteredTeams.length)}
                    </div>
                    <div className="text-gray-600">Avg Total Yards</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <StatisticsView modernRedGradient={modernRedGradient} />
          )}
        </>
      )}
    </div>
  );
};

// Team Card Component
const TeamCard = ({ team, modernRedGradient }) => {
  return (
    <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-6 stats-card-hover">
      {/* Rank Badge */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ background: modernRedGradient }}
        >
          #{team.rank}
        </div>
        <div className="text-xs font-bold px-2 py-1 rounded-full border text-gray-700"
             style={{ 
               borderColor: team.trend === 'HOT' ? '#ef4444' : 
                           team.trend === 'UP' ? '#10b981' : 
                           team.trend === 'STEADY' ? '#6b7280' : '#f59e0b',
               color: team.trend === 'HOT' ? '#ef4444' : 
                     team.trend === 'UP' ? '#10b981' : 
                     team.trend === 'STEADY' ? '#6b7280' : '#f59e0b'
             }}>
          {team.trend}
        </div>
      </div>

      {/* Team Logo and Info */}
      <div className="text-center mb-6">
        <div 
          className="w-16 h-16 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            localStorage.setItem('selectedTeamData', JSON.stringify(team));
            window.location.hash = `team-detail-${team.id}`;
          }}
        >
          {team.logos?.[0] ? (
            <img 
              src={team.logos[0]} 
              alt={team.school} 
              className="w-full h-full object-contain drop-shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ 
              background: team.color || modernRedGradient,
              display: team.logos?.[0] ? 'none' : 'flex'
            }}
          >
            {team.school[0]}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-1">{team.school}</h3>
        <p className="text-gray-600 text-sm">{team.mascot}</p>
        
        {/* Record */}
        <div className="mt-3">
          <span className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ background: modernRedGradient }}>
            {team.record.wins}-{team.record.losses}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Points Per Game</span>
          <span className="font-semibold">{team.stats.pointsPerGame.toFixed(1)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Points Allowed</span>
          <span className="font-semibold">{team.stats.pointsAllowed.toFixed(1)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Yards</span>
          <span className="font-semibold">{Math.round(team.stats.totalYards)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Yards Allowed</span>
          <span className="font-semibold">{Math.round(team.stats.yardsAllowed)}</span>
        </div>
      </div>

      {/* Rating Bars */}
      <div className="mt-4 space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Offense</span>
            <span>{Math.round(team.stats.offenseRating)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-1000"
              style={{ 
                background: modernRedGradient,
                width: `${team.stats.offenseRating}%`
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Defense</span>
            <span>{Math.round(team.stats.defenseRating)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-1000"
              style={{ 
                background: modernRedGradient,
                width: `${team.stats.defenseRating}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Statistics View Component with Real 2024 Team Data
const StatisticsView = ({ modernRedGradient }) => {
  const [selectedCategory, setSelectedCategory] = useState('rushing');

  // Team logo mapping
  const getTeamLogo = (teamName) => {
    const logoMap = {
      'Army': 'https://a.espncdn.com/i/teamlogos/ncaa/500/349.png',
      'New Mexico': 'https://a.espncdn.com/i/teamlogos/ncaa/500/167.png',
      'Jacksonville State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/55.png',
      'Liberty': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png',
      'UCF': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png',
      'Navy': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2426.png',
      'UNLV': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png',
      'Boise State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/68.png',
      'Tennessee': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png',
      'Air Force': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2005.png',
      'Kansas State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2306.png',
      'Ohio': 'https://a.espncdn.com/i/teamlogos/ncaa/500/195.png',
      'Kansas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png',
      'Old Dominion': 'https://a.espncdn.com/i/teamlogos/ncaa/500/295.png',
      'Texas State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/326.png',
      'Northern Illinois': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2459.png',
      'Penn State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/213.png',
      'Marshall': 'https://a.espncdn.com/i/teamlogos/ncaa/500/276.png',
      'Notre Dame': 'https://a.espncdn.com/i/teamlogos/ncaa/500/87.png',
      'Arizona State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/9.png',
      'Syracuse': 'https://a.espncdn.com/i/teamlogos/ncaa/500/183.png',
      'Mississippi': 'https://a.espncdn.com/i/teamlogos/ncaa/500/145.png',
      'Miami (FL)': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png',
      'North Texas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/249.png',
      'San Jose State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/23.png',
      'Colorado': 'https://a.espncdn.com/i/teamlogos/ncaa/500/38.png',
      'LSU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/99.png',
      'TCU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png',
      'Texas Tech': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png',
      'USC': 'https://a.espncdn.com/i/teamlogos/ncaa/500/30.png',
      'UTSA': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2949.png',
      'Georgia': 'https://a.espncdn.com/i/teamlogos/ncaa/500/61.png',
      'Oregon': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png',
      'Texas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/251.png',
      'Clemson': 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png',
      'Washington State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/265.png',
      'Maryland': 'https://a.espncdn.com/i/teamlogos/ncaa/500/120.png',
      'Arkansas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/8.png',
      'Appalachian State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png',
      'Memphis': 'https://a.espncdn.com/i/teamlogos/ncaa/500/235.png',
      'Utah State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/328.png',
      'Louisville': 'https://a.espncdn.com/i/teamlogos/ncaa/500/97.png',
      'South Alabama': 'https://a.espncdn.com/i/teamlogos/ncaa/500/6.png',
      'Baylor': 'https://a.espncdn.com/i/teamlogos/ncaa/500/239.png',
      'Indiana': 'https://a.espncdn.com/i/teamlogos/ncaa/500/84.png',
      'SMU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png',
      'Ohio State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png',
      'Tulane': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png'
    };
    return logoMap[teamName] || null;
  };

  const rushingLeaders = [
    { rank: 1, team: 'Army', games: 14, yards: 4207, td: 48, yardsPerGame: 300.50 },
    { rank: 2, team: 'New Mexico', games: 12, yards: 3043, td: 37, yardsPerGame: 253.58 },
    { rank: 3, team: 'Jacksonville State', games: 14, yards: 3517, td: 51, yardsPerGame: 251.21 },
    { rank: 4, team: 'Liberty', games: 12, yards: 3008, td: 28, yardsPerGame: 250.67 },
    { rank: 5, team: 'UCF', games: 12, yards: 2977, td: 33, yardsPerGame: 248.08 },
    { rank: 6, team: 'Navy', games: 13, yards: 3218, td: 38, yardsPerGame: 247.54 },
    { rank: 7, team: 'UNLV', games: 14, yards: 3409, td: 29, yardsPerGame: 243.50 },
    { rank: 8, team: 'Boise State', games: 14, yards: 3365, td: 43, yardsPerGame: 240.36 },
    { rank: 9, team: 'Tennessee', games: 13, yards: 2936, td: 34, yardsPerGame: 225.85 },
    { rank: 10, team: 'Air Force', games: 12, yards: 2688, td: 24, yardsPerGame: 224.00 },
    { rank: 11, team: 'Kansas State', games: 13, yards: 2801, td: 21, yardsPerGame: 215.46 },
    { rank: 12, team: 'Ohio', games: 14, yards: 2984, td: 35, yardsPerGame: 213.14 }
  ];

  const passingLeaders = [
    { rank: 1, team: 'Syracuse', games: 13, yards: 4810, td: 34, yardsPerGame: 370.0 },
    { rank: 2, team: 'Mississippi', games: 13, yards: 4561, td: 31, yardsPerGame: 350.8 },
    { rank: 3, team: 'Miami (FL)', games: 13, yards: 4527, td: 41, yardsPerGame: 348.2 },
    { rank: 4, team: 'North Texas', games: 13, yards: 4267, td: 33, yardsPerGame: 328.2 },
    { rank: 5, team: 'San Jose State', games: 13, yards: 4183, td: 31, yardsPerGame: 321.8 },
    { rank: 6, team: 'Colorado', games: 13, yards: 4134, td: 37, yardsPerGame: 318.0 },
    { rank: 7, team: 'LSU', games: 13, yards: 4097, td: 29, yardsPerGame: 315.2 },
    { rank: 8, team: 'TCU', games: 13, yards: 4068, td: 29, yardsPerGame: 312.9 },
    { rank: 9, team: 'Texas Tech', games: 13, yards: 3857, td: 31, yardsPerGame: 296.7 },
    { rank: 10, team: 'USC', games: 13, yards: 3795, td: 29, yardsPerGame: 291.9 },
    { rank: 11, team: 'UTSA', games: 13, yards: 3685, td: 27, yardsPerGame: 283.5 },
    { rank: 12, team: 'Georgia', games: 14, yards: 3934, td: 29, yardsPerGame: 281.0 }
  ];

  const totalOffenseLeaders = [
    { rank: 1, team: 'Miami (FL)', games: 13, rushYards: 2456, passYards: 4527, totalYards: 6983, yardsPerGame: 537.2 },
    { rank: 2, team: 'Mississippi', games: 13, rushYards: 2284, passYards: 4561, totalYards: 6845, yardsPerGame: 526.5 },
    { rank: 3, team: 'North Texas', games: 13, rushYards: 2088, passYards: 4267, totalYards: 6355, yardsPerGame: 488.8 },
    { rank: 4, team: 'New Mexico', games: 12, rushYards: 3043, passYards: 2768, totalYards: 5811, yardsPerGame: 484.3 },
    { rank: 5, team: 'Texas State', games: 13, rushYards: 2707, passYards: 3493, totalYards: 6200, yardsPerGame: 476.9 },
    { rank: 6, team: 'Utah State', games: 12, rushYards: 2383, passYards: 3229, totalYards: 5612, yardsPerGame: 467.7 },
    { rank: 7, team: 'Syracuse', games: 13, rushYards: 1269, passYards: 4810, totalYards: 6079, yardsPerGame: 467.6 },
    { rank: 8, team: 'Boise State', games: 14, rushYards: 3365, passYards: 3159, totalYards: 6524, yardsPerGame: 466.0 },
    { rank: 9, team: 'Texas Tech', games: 13, rushYards: 2158, passYards: 3857, totalYards: 6015, yardsPerGame: 462.7 },
    { rank: 10, team: 'Arkansas', games: 13, rushYards: 2402, passYards: 3571, totalYards: 5973, yardsPerGame: 459.5 },
    { rank: 11, team: 'Clemson', games: 14, rushYards: 2427, passYards: 3899, totalYards: 6326, yardsPerGame: 451.9 },
    { rank: 12, team: 'UTSA', games: 13, rushYards: 2180, passYards: 3685, totalYards: 5865, yardsPerGame: 451.2 }
  ];

  const scoringLeaders = [
    { rank: 1, team: 'Miami (FL)', games: 13, td: 73, fg: 19, points: 571, pointsPerGame: 43.9 },
    { rank: 2, team: 'Indiana', games: 13, td: 72, fg: 10, points: 537, pointsPerGame: 41.3 },
    { rank: 3, team: 'Mississippi', games: 13, td: 62, fg: 24, points: 502, pointsPerGame: 38.6 },
    { rank: 4, team: 'Texas Tech', games: 13, td: 60, fg: 22, points: 489, pointsPerGame: 37.6 },
    { rank: 5, team: 'Boise State', games: 14, td: 69, fg: 13, points: 522, pointsPerGame: 37.3 },
    { rank: 6, team: 'Washington State', games: 13, td: 65, fg: 8, points: 476, pointsPerGame: 36.6 },
    { rank: 7, team: 'SMU', games: 14, td: 62, fg: 24, points: 511, pointsPerGame: 36.5 },
    { rank: 8, team: 'Texas State', games: 13, td: 61, fg: 15, points: 475, pointsPerGame: 36.5 },
    { rank: 9, team: 'Louisville', games: 13, td: 60, fg: 18, points: 474, pointsPerGame: 36.5 },
    { rank: 10, team: 'Notre Dame', games: 16, td: 76, fg: 15, points: 578, pointsPerGame: 36.1 },
    { rank: 11, team: 'Jacksonville State', games: 14, td: 66, fg: 14, points: 504, pointsPerGame: 36.0 },
    { rank: 12, team: 'Ohio State', games: 16, td: 76, fg: 13, points: 571, pointsPerGame: 35.7 }
  ];

  const getCurrentData = () => {
    switch(selectedCategory) {
      case 'rushing': return rushingLeaders;
      case 'passing': return passingLeaders;
      case 'total': return totalOffenseLeaders;
      case 'scoring': return scoringLeaders;
      default: return rushingLeaders;
    }
  };

  const getCategoryTitle = () => {
    switch(selectedCategory) {
      case 'rushing': return { title: 'Rushing Offense Leaders', icon: 'fas fa-running', desc: 'Top teams by rushing yards per game' };
      case 'passing': return { title: 'Passing Offense Leaders', icon: 'fas fa-football-ball', desc: 'Top teams by passing yards per game' };
      case 'total': return { title: 'Total Offense Leaders', icon: 'fas fa-chart-line', desc: 'Top teams by total yards per game' };
      case 'scoring': return { title: 'Scoring Offense Leaders', icon: 'fas fa-trophy', desc: 'Top teams by points per game' };
      default: return { title: 'Rushing Offense Leaders', icon: 'fas fa-running', desc: 'Top teams by rushing yards per game' };
    }
  };

  const categoryInfo = getCategoryTitle();
  const currentData = getCurrentData();

  return (
    <div className="space-y-8">
      {/* Category Selection */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setSelectedCategory('rushing')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            selectedCategory === 'rushing' 
              ? 'text-white shadow-lg transform scale-105' 
              : 'bg-white/40 text-gray-700 hover:bg-white/60 hover:scale-105'
          }`}
          style={selectedCategory === 'rushing' ? { background: modernRedGradient } : {}}
        >
          <i className="fas fa-running mr-2"></i>
          Rushing
        </button>
        <button
          onClick={() => setSelectedCategory('passing')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            selectedCategory === 'passing' 
              ? 'text-white shadow-lg transform scale-105' 
              : 'bg-white/40 text-gray-700 hover:bg-white/60 hover:scale-105'
          }`}
          style={selectedCategory === 'passing' ? { background: modernRedGradient } : {}}
        >
          <i className="fas fa-football-ball mr-2"></i>
          Passing
        </button>
        <button
          onClick={() => setSelectedCategory('total')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            selectedCategory === 'total' 
              ? 'text-white shadow-lg transform scale-105' 
              : 'bg-white/40 text-gray-700 hover:bg-white/60 hover:scale-105'
          }`}
          style={selectedCategory === 'total' ? { background: modernRedGradient } : {}}
        >
          <i className="fas fa-chart-line mr-2"></i>
          Total Offense
        </button>
        <button
          onClick={() => setSelectedCategory('scoring')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            selectedCategory === 'scoring' 
              ? 'text-white shadow-lg transform scale-105' 
              : 'bg-white/40 text-gray-700 hover:bg-white/60 hover:scale-105'
          }`}
          style={selectedCategory === 'scoring' ? { background: modernRedGradient } : {}}
        >
          <i className="fas fa-trophy mr-2"></i>
          Scoring
        </button>
      </div>

      {/* Category Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: modernRedGradient }}>
            <i className={`${categoryInfo.icon} text-white text-2xl`}></i>
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-2 gradient-text">{categoryInfo.title}</h2>
        <p className="text-lg text-gray-600">{categoryInfo.desc}</p>
      </div>

      {/* Modern Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentData.map((team) => (
          <StatCard 
            key={team.rank} 
            team={team} 
            category={selectedCategory}
            modernRedGradient={modernRedGradient}
            logo={getTeamLogo(team.team)}
          />
        ))}
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ team, category, modernRedGradient, logo }) => {
  const getPrimaryStatInfo = () => {
    switch(category) {
      case 'rushing':
        return { 
          value: team.yardsPerGame,
          label: 'Yards/Game',
          icon: 'fas fa-running',
          color: '#10b981'
        };
      case 'passing':
        return { 
          value: team.yardsPerGame,
          label: 'Yards/Game',
          icon: 'fas fa-football-ball',
          color: '#3b82f6'
        };
      case 'total':
        return { 
          value: team.yardsPerGame,
          label: 'Yards/Game',
          icon: 'fas fa-chart-line',
          color: '#8b5cf6'
        };
      case 'scoring':
        return { 
          value: team.pointsPerGame,
          label: 'Points/Game',
          icon: 'fas fa-trophy',
          color: '#ef4444'
        };
      default:
        return { 
          value: team.yardsPerGame,
          label: 'Yards/Game',
          icon: 'fas fa-running',
          color: '#10b981'
        };
    }
  };

  const getSecondaryStats = () => {
    switch(category) {
      case 'rushing':
        return [
          { label: 'Total Yards', value: team.yards?.toLocaleString() || 'N/A' },
          { label: 'Touchdowns', value: team.td || 'N/A' },
          { label: 'Games', value: team.games || 'N/A' }
        ];
      case 'passing':
        return [
          { label: 'Total Yards', value: team.yards?.toLocaleString() || 'N/A' },
          { label: 'Touchdowns', value: team.td || 'N/A' },
          { label: 'Games', value: team.games || 'N/A' }
        ];
      case 'total':
        return [
          { label: 'Rush Yards', value: team.rushYards?.toLocaleString() || 'N/A' },
          { label: 'Pass Yards', value: team.passYards?.toLocaleString() || 'N/A' },
          { label: 'Total Yards', value: team.totalYards?.toLocaleString() || 'N/A' }
        ];
      case 'scoring':
        return [
          { label: 'Touchdowns', value: team.td || 'N/A' },
          { label: 'Field Goals', value: team.fg || 'N/A' },
          { label: 'Total Points', value: team.points || 'N/A' }
        ];
      default:
        return [
          { label: 'Total Yards', value: team.yards?.toLocaleString() || 'N/A' },
          { label: 'Touchdowns', value: team.td || 'N/A' },
          { label: 'Games', value: team.games || 'N/A' }
        ];
    }
  };

  const primaryStat = getPrimaryStatInfo();
  const secondaryStats = getSecondaryStats();

  return (
    <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-6 stats-card-hover">
      {/* Rank Badge */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ background: modernRedGradient }}
        >
          #{team.rank}
        </div>
        <div className="text-xs font-bold px-2 py-1 rounded-full"
             style={{ 
               backgroundColor: `${primaryStat.color}20`,
               color: primaryStat.color,
               border: `1px solid ${primaryStat.color}40`
             }}>
          <i className={`${primaryStat.icon} mr-1`}></i>
          LEADER
        </div>
      </div>

      {/* Team Logo and Info */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          {logo ? (
            <img 
              src={logo} 
              alt={team.team} 
              className="w-full h-full object-contain drop-shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ 
              background: modernRedGradient,
              display: logo ? 'none' : 'flex'
            }}
          >
            {team.team[0]}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-1">{team.team}</h3>
        
        {/* Primary Stat */}
        <div className="mt-4 mb-4">
          <div className="text-3xl font-bold mb-1" style={{ color: primaryStat.color }}>
            {primaryStat.value}
          </div>
          <div className="text-sm text-gray-600 font-medium">{primaryStat.label}</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="space-y-3">
        {secondaryStats.map((stat, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">{stat.label}</span>
            <span className="font-semibold text-gray-800">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Performance Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Performance</span>
          <span>Top {team.rank <= 3 ? 'Elite' : team.rank <= 8 ? 'Excellent' : 'Good'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-1000"
            style={{ 
              background: `linear-gradient(90deg, ${primaryStat.color}, ${primaryStat.color}80)`,
              width: `${Math.max(100 - (team.rank - 1) * 8, 20)}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TeamStats;
