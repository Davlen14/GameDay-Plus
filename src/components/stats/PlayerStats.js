import React, { useState } from 'react';

const PlayerStats = () => {
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  const [selectedCategory, setSelectedCategory] = useState('passing');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'

  // Team logo mapping
  const getTeamLogo = (teamName) => {
    const logoMap = {
      'Syracuse': 'https://a.espncdn.com/i/teamlogos/ncaa/500/183.png',
      'Miami (FL)': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png',
      'Ole Miss': 'https://a.espncdn.com/i/teamlogos/ncaa/500/145.png',
      'Mississippi': 'https://a.espncdn.com/i/teamlogos/ncaa/500/145.png',
      'Colorado': 'https://a.espncdn.com/i/teamlogos/ncaa/500/38.png',
      'LSU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/99.png',
      'TCU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png',
      'North Texas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/249.png',
      'Texas Tech': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png',
      'Oregon': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png',
      'California': 'https://a.espncdn.com/i/teamlogos/ncaa/500/25.png',
      'App State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png',
      'Appalachian State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png',
      'Memphis': 'https://a.espncdn.com/i/teamlogos/ncaa/500/235.png',
      'Georgia': 'https://a.espncdn.com/i/teamlogos/ncaa/500/61.png',
      'Louisville': 'https://a.espncdn.com/i/teamlogos/ncaa/500/97.png',
      'UTSA': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2949.png',
      'Maryland': 'https://a.espncdn.com/i/teamlogos/ncaa/500/120.png',
      'Washington St': 'https://a.espncdn.com/i/teamlogos/ncaa/500/265.png',
      'Washington State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/265.png',
      'Clemson': 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png',
      'MTSU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2393.png',
      'Utah State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/328.png',
      'Boise State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/68.png',
      'North Carolina': 'https://a.espncdn.com/i/teamlogos/ncaa/500/153.png',
      'Arizona State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/9.png',
      'UCF': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png',
      'Iowa': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png',
      'Army': 'https://a.espncdn.com/i/teamlogos/ncaa/500/349.png',
      'Jacksonville St': 'https://a.espncdn.com/i/teamlogos/ncaa/500/55.png',
      'Jacksonville State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/55.png',
      'Rutgers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/164.png',
      'Tennessee': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png',
      'Liberty': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png',
      'La-Monroe': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2433.png',
      'Kansas State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2306.png',
      'SDSU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/21.png',
      'Kansas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png',
      'Va Tech': 'https://a.espncdn.com/i/teamlogos/ncaa/500/259.png',
      'Navy': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2426.png',
      'Auburn': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png',
      'Tulane': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png',
      'BGSU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/189.png',
      'SJSU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/23.png',
      'San Jose State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/23.png',
      'Arizona': 'https://a.espncdn.com/i/teamlogos/ncaa/500/12.png',
      'Arkansas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/8.png',
      'FIU': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2229.png',
      'South Alabama': 'https://a.espncdn.com/i/teamlogos/ncaa/500/6.png',
      'Iowa State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/66.png',
      'Ohio': 'https://a.espncdn.com/i/teamlogos/ncaa/500/195.png',
      'Temple': 'https://a.espncdn.com/i/teamlogos/ncaa/500/218.png',
      'Troy': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2653.png'
    };
    return logoMap[teamName] || null;
  };

  const passingLeaders = [
    { rank: 1, player: 'Kyle McCord', team: 'Syracuse', att: 592, comp: 391, yards: 4779, td: 34, int: 12, yardsPerGame: 367.6 },
    { rank: 2, player: 'Cam Ward', team: 'Miami (FL)', att: 454, comp: 305, yards: 4313, td: 39, int: 7, yardsPerGame: 331.8 },
    { rank: 3, player: 'Jaxson Dart', team: 'Ole Miss', att: 398, comp: 276, yards: 4279, td: 29, int: 6, yardsPerGame: 329.2 },
    { rank: 4, player: 'Shedeur Sanders', team: 'Colorado', att: 477, comp: 353, yards: 4134, td: 37, int: 10, yardsPerGame: 318.0 },
    { rank: 5, player: 'Garrett Nussmeier', team: 'LSU', att: 525, comp: 337, yards: 4052, td: 29, int: 12, yardsPerGame: 311.7 },
    { rank: 6, player: 'Josh Hoover', team: 'TCU', att: 471, comp: 313, yards: 3949, td: 27, int: 11, yardsPerGame: 303.8 },
    { rank: 7, player: 'Chandler Morris', team: 'North Texas', att: 512, comp: 322, yards: 3774, td: 31, int: 12, yardsPerGame: 290.3 },
    { rank: 8, player: 'Behren Morton', team: 'Texas Tech', att: 466, comp: 295, yards: 3335, td: 27, int: 8, yardsPerGame: 277.9 },
    { rank: 9, player: 'Dillon Gabriel', team: 'Oregon', att: 447, comp: 326, yards: 3857, td: 30, int: 6, yardsPerGame: 275.5 },
    { rank: 10, player: 'Fernando Mendoza', team: 'California', att: 386, comp: 265, yards: 3004, td: 16, int: 6, yardsPerGame: 273.1 },
    { rank: 11, player: 'Joey Aguilar', team: 'App State', att: 390, comp: 218, yards: 3003, td: 23, int: 14, yardsPerGame: 273.0 },
    { rank: 12, player: 'Seth Henigan', team: 'Memphis', att: 477, comp: 309, yards: 3502, td: 25, int: 6, yardsPerGame: 269.4 }
  ];

  const rushingLeaders = [
    { rank: 1, player: 'Ashton Jeanty', team: 'Boise State', att: 374, yards: 2601, td: 29, yardsPerGame: 185.79 },
    { rank: 2, player: 'Omarion Hampton', team: 'North Carolina', att: 281, yards: 1660, td: 15, yardsPerGame: 138.33 },
    { rank: 3, player: 'Tahj Brooks', team: 'Texas Tech', att: 286, yards: 1505, td: 17, yardsPerGame: 136.82 },
    { rank: 4, player: 'Cam Skattebo', team: 'Arizona State', att: 293, yards: 1711, td: 21, yardsPerGame: 131.62 },
    { rank: 5, player: 'RJ Harvey', team: 'UCF', att: 232, yards: 1577, td: 22, yardsPerGame: 131.42 },
    { rank: 6, player: 'Kaleb Johnson', team: 'Iowa', att: 240, yards: 1537, td: 21, yardsPerGame: 128.08 },
    { rank: 7, player: 'Bryson Daily', team: 'Army', att: 310, yards: 1659, td: 32, yardsPerGame: 127.62 },
    { rank: 8, player: 'Tre Stewart', team: 'Jacksonville St', att: 278, yards: 1638, td: 25, yardsPerGame: 117.00 },
    { rank: 9, player: 'Kyle Monangai', team: 'Rutgers', att: 256, yards: 1279, td: 13, yardsPerGame: 116.27 },
    { rank: 10, player: 'Dylan Sampson', team: 'Tennessee', att: 258, yards: 1491, td: 22, yardsPerGame: 114.69 },
    { rank: 11, player: 'Quinton Cooley', team: 'Liberty', att: 205, yards: 1254, td: 13, yardsPerGame: 114.00 },
    { rank: 12, player: 'Ahmad Hardy', team: 'La-Monroe', att: 237, yards: 1351, td: 13, yardsPerGame: 112.58 }
  ];

  const receivingLeaders = [
    { rank: 1, player: 'Harold Fannin Jr.', team: 'BGSU', rec: 117, yards: 1555, td: 10, yardsPerGame: 119.6 },
    { rank: 2, player: 'Nick Nash', team: 'SJSU', rec: 104, yards: 1382, td: 16, yardsPerGame: 115.2 },
    { rank: 3, player: 'Tetairoa McMillan', team: 'Arizona', rec: 84, yards: 1319, td: 8, yardsPerGame: 109.9 },
    { rank: 4, player: 'Andrew Armstrong', team: 'Arkansas', rec: 78, yards: 1140, td: 1, yardsPerGame: 103.6 },
    { rank: 5, player: 'Eric Rivers', team: 'FIU', rec: 62, yards: 1172, td: 12, yardsPerGame: 97.7 },
    { rank: 6, player: 'Travis Hunter', team: 'Colorado', rec: 96, yards: 1258, td: 15, yardsPerGame: 96.8 },
    { rank: 7, player: 'Jamaal Pritchett', team: 'South Alabama', rec: 91, yards: 1127, td: 9, yardsPerGame: 93.9 },
    { rank: 8, player: 'Xavier Restrepo', team: 'Miami (FL)', rec: 69, yards: 1127, td: 11, yardsPerGame: 93.9 },
    { rank: 9, player: 'Tai Felton', team: 'Maryland', rec: 96, yards: 1124, td: 9, yardsPerGame: 93.7 },
    { rank: 10, player: 'Kaedin Robinson', team: 'App State', rec: 53, yards: 840, td: 2, yardsPerGame: 93.3 },
    { rank: 11, player: 'Kyle Williams', team: 'Washington St', rec: 70, yards: 1198, td: 14, yardsPerGame: 92.2 },
    { rank: 12, player: 'Jordyn Tyson', team: 'Arizona State', rec: 75, yards: 1101, td: 10, yardsPerGame: 91.8 }
  ];

  const getCurrentData = () => {
    switch(selectedCategory) {
      case 'passing': return passingLeaders;
      case 'rushing': return rushingLeaders;
      case 'receiving': return receivingLeaders;
      default: return passingLeaders;
    }
  };

  const getCategoryInfo = () => {
    switch(selectedCategory) {
      case 'passing': return { title: 'Passing Leaders', icon: 'fas fa-football-ball', desc: 'Top quarterbacks by passing yards per game' };
      case 'rushing': return { title: 'Rushing Leaders', icon: 'fas fa-running', desc: 'Top running backs by rushing yards per game' };
      case 'receiving': return { title: 'Receiving Leaders', icon: 'fas fa-hands-catching', desc: 'Top receivers by receiving yards per game' };
      default: return { title: 'Passing Leaders', icon: 'fas fa-football-ball', desc: 'Top quarterbacks by passing yards per game' };
    }
  };

  const categoryInfo = getCategoryInfo();
  const currentData = getCurrentData();

  return (
    <div className="min-h-screen p-6 relative" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <style>{`
        .gradient-text {
          background: ${modernRedGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .player-card-hover {
          transition: all 0.3s ease;
        }
        
        .player-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(204, 0, 28, 0.15);
        }
      `}</style>

      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: modernRedGradient }}>
            <i className="fas fa-star text-white text-2xl"></i>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-4 gradient-text">
          Player Statistical Leaders
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          2024 FBS Season Individual Performance Leaders
        </p>
        
        {/* Category Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
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
            onClick={() => setSelectedCategory('receiving')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              selectedCategory === 'receiving' 
                ? 'text-white shadow-lg transform scale-105' 
                : 'bg-white/40 text-gray-700 hover:bg-white/60 hover:scale-105'
            }`}
            style={selectedCategory === 'receiving' ? { background: modernRedGradient } : {}}
          >
            <i className="fas fa-hands-catching mr-2"></i>
            Receiving
          </button>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              viewMode === 'cards' 
                ? 'text-white shadow-md' 
                : 'bg-white/40 text-gray-700 hover:bg-white/60'
            }`}
            style={viewMode === 'cards' ? { background: modernRedGradient } : {}}
          >
            <i className="fas fa-th mr-2"></i>
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              viewMode === 'list' 
                ? 'text-white shadow-md' 
                : 'bg-white/40 text-gray-700 hover:bg-white/60'
            }`}
            style={viewMode === 'list' ? { background: modernRedGradient } : {}}
          >
            <i className="fas fa-list mr-2"></i>
            List
          </button>
        </div>
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

      {/* ESPN-Style Player Cards Grid */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentData.map((player) => (
            <PlayerCard 
              key={player.rank} 
              player={player} 
              category={selectedCategory}
              modernRedGradient={modernRedGradient}
              logo={getTeamLogo(player.team)}
            />
          ))}
        </div>
      ) : (
        <CompactListView 
          players={currentData}
          category={selectedCategory}
          modernRedGradient={modernRedGradient}
          getTeamLogo={getTeamLogo}
        />
      )}
    </div>
  );
};

// ESPN-Style Player Card Component
const PlayerCard = ({ player, category, modernRedGradient, logo }) => {
  const getPrimaryStatInfo = () => {
    switch(category) {
      case 'passing':
        return { 
          value: player.yardsPerGame,
          label: 'Pass Yds/Game',
          icon: 'fas fa-football-ball'
        };
      case 'rushing':
        return { 
          value: player.yardsPerGame,
          label: 'Rush Yds/Game',
          icon: 'fas fa-running'
        };
      case 'receiving':
        return { 
          value: player.yardsPerGame,
          label: 'Rec Yds/Game',
          icon: 'fas fa-hands-catching'
        };
      default:
        return { 
          value: player.yardsPerGame,
          label: 'Yds/Game',
          icon: 'fas fa-football-ball'
        };
    }
  };

  const getSecondaryStats = () => {
    switch(category) {
      case 'passing':
        return [
          { label: 'Completions', value: `${player.comp}/${player.att}` },
          { label: 'Total Yards', value: player.yards.toLocaleString() },
          { label: 'Touchdowns', value: player.td },
          { label: 'Interceptions', value: player.int }
        ];
      case 'rushing':
        return [
          { label: 'Attempts', value: player.att },
          { label: 'Total Yards', value: player.yards.toLocaleString() },
          { label: 'Touchdowns', value: player.td },
          { label: 'Avg/Carry', value: (player.yards / player.att).toFixed(1) }
        ];
      case 'receiving':
        return [
          { label: 'Receptions', value: player.rec },
          { label: 'Total Yards', value: player.yards.toLocaleString() },
          { label: 'Touchdowns', value: player.td },
          { label: 'Avg/Catch', value: (player.yards / player.rec).toFixed(1) }
        ];
      default:
        return [];
    }
  };

  const getPositionBadge = () => {
    switch(category) {
      case 'passing': return 'QB';
      case 'rushing': return 'RB';
      case 'receiving': return 'WR';
      default: return 'P';
    }
  };

  const primaryStat = getPrimaryStatInfo();
  const secondaryStats = getSecondaryStats();
  const positionBadge = getPositionBadge();

  return (
    <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-6 player-card-hover">
      {/* Header with Rank and Position */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ background: modernRedGradient }}
        >
          #{player.rank}
        </div>
        <div className="text-xs font-bold px-3 py-1 rounded-full text-white"
             style={{ background: modernRedGradient }}>
          {positionBadge}
        </div>
      </div>

      {/* Team Logo and Player Info */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          {logo ? (
            <img 
              src={logo} 
              alt={player.team} 
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
            {player.team[0]}
          </div>
        </div>
        
        {/* Player Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-1">{player.player}</h3>
        <p className="text-sm text-gray-600 font-medium">{player.team}</p>
        
        {/* Primary Stat - Large Display */}
        <div className="mt-4 mb-4">
          <div className="text-3xl font-bold mb-1 gradient-text">
            {primaryStat.value}
          </div>
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">{primaryStat.label}</div>
        </div>
      </div>

      {/* ESPN-Style Stats Grid */}
      <div className="space-y-2">
        {secondaryStats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-white/30 transition-colors">
            <span className="text-xs text-gray-600 font-medium uppercase tracking-wide">{stat.label}</span>
            <span className="text-sm font-bold text-gray-800">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Elite Performance Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">National Ranking</span>
          <div className="flex items-center">
            <span className="font-bold text-gray-800">#{player.rank}</span>
            {player.rank <= 3 && (
              <i className="fas fa-crown ml-1 text-yellow-500"></i>
            )}
            {player.rank <= 5 && player.rank > 3 && (
              <i className="fas fa-medal ml-1 text-orange-500"></i>
            )}
          </div>
        </div>
        
        {/* Performance Tier Badge */}
        <div className="mt-2">
          <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full ${
            player.rank <= 3 ? 'bg-yellow-100 text-yellow-800' :
            player.rank <= 8 ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {player.rank <= 3 ? 'Elite' : player.rank <= 8 ? 'All-American' : 'Outstanding'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Compact List View Component
const CompactListView = ({ players, category, modernRedGradient, getTeamLogo }) => {
  const getColumnHeaders = () => {
    switch(category) {
      case 'passing':
        return ['Rank', 'Player', 'Team', 'Comp/Att', 'Yards', 'TD', 'INT', 'Yds/G'];
      case 'rushing':
        return ['Rank', 'Player', 'Team', 'Att', 'Yards', 'TD', 'Avg', 'Yds/G'];
      case 'receiving':
        return ['Rank', 'Player', 'Team', 'Rec', 'Yards', 'TD', 'Avg', 'Yds/G'];
      default:
        return ['Rank', 'Player', 'Team', 'Yards', 'TD', 'Yds/G'];
    }
  };

  const getRowData = (player) => {
    switch(category) {
      case 'passing':
        return [
          player.rank,
          player.player,
          player.team,
          `${player.comp}/${player.att}`,
          player.yards.toLocaleString(),
          player.td,
          player.int,
          player.yardsPerGame
        ];
      case 'rushing':
        return [
          player.rank,
          player.player,
          player.team,
          player.att,
          player.yards.toLocaleString(),
          player.td,
          (player.yards / player.att).toFixed(1),
          player.yardsPerGame
        ];
      case 'receiving':
        return [
          player.rank,
          player.player,
          player.team,
          player.rec,
          player.yards.toLocaleString(),
          player.td,
          (player.yards / player.rec).toFixed(1),
          player.yardsPerGame
        ];
      default:
        return [player.rank, player.player, player.team, player.yards, player.td, player.yardsPerGame];
    }
  };

  const headers = getColumnHeaders();

  return (
    <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200/50" style={{ background: `${modernRedGradient}10` }}>
              {headers.map((header, index) => (
                <th key={index} className="text-left py-4 px-4 font-bold text-gray-800 text-sm">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const rowData = getRowData(player);
              const logo = getTeamLogo(player.team);
              
              return (
                <tr key={player.rank} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                  {rowData.map((data, index) => (
                    <td key={index} className="py-3 px-4 text-sm">
                      {index === 0 ? (
                        // Rank column
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: modernRedGradient }}>
                          #{data}
                        </span>
                      ) : index === 1 ? (
                        // Player name column
                        <div className="font-bold text-gray-800">{data}</div>
                      ) : index === 2 ? (
                        // Team column with logo
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {logo ? (
                              <img 
                                src={logo} 
                                alt={player.team} 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ 
                                background: modernRedGradient,
                                display: logo ? 'none' : 'flex'
                              }}
                            >
                              {player.team[0]}
                            </div>
                          </div>
                          <span className="text-gray-700 font-medium">{data}</span>
                        </div>
                      ) : index === headers.length - 1 ? (
                        // Last column (Yards/Game) with gradient
                        <span className="font-bold gradient-text">{data}</span>
                      ) : (
                        // Regular data columns
                        <span className="text-gray-700">{data}</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerStats;
