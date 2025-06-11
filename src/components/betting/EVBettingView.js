import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services';
import { BettingCalculations } from '../../utils';

const EVBettingView = ({ evGames = [] }) => {
  // State management - mirrors Swift @State
  const [minEV, setMinEV] = useState(1.0);
  const [sortBy, setSortBy] = useState(0); // 0: ev, 1: team
  const [sortOrder, setSortOrder] = useState(true); // true: descending, false: ascending
  const [selectedBetTypes, setSelectedBetTypes] = useState(new Set(['moneyline', 'spread', 'overUnder']));
  const [expandedGames, setExpandedGames] = useState(new Set());
  const [teams, setTeams] = useState([]);

  // Theme colors - matching Swift theme
  const accentColor = 'rgb(204, 0, 28)';
  const positiveColor = 'rgb(34, 197, 94)';
  const mediumEVColor = 'rgb(251, 146, 60)';
  const highEVColor = 'rgb(34, 197, 94)';
  const backgroundColor = '#ffffff';

  // Metallic gradient CSS
  const metallicGradient = `linear-gradient(135deg, 
    rgb(255, 46, 74), 
    rgb(204, 0, 28), 
    rgb(161, 0, 20), 
    rgb(204, 0, 28), 
    rgb(255, 46, 74)
  )`;

  // Helper function for EV color determination (MOVED BEFORE metallicEVGradient)
  const getEVColor = (ev) => {
    if (ev < 0) return 'rgb(156, 163, 175)';
    if (ev < 5) return mediumEVColor;
    if (ev < 10) return positiveColor;
    return 'rgb(250, 204, 21)'; // Yellow for highest EV
  };

  // Metallic EV gradient based on EV value (FIXED - no longer calls getEVColor)
  const metallicEVGradient = (ev) => {
    if (ev < 0) {
      return `linear-gradient(135deg, 
        rgb(156, 163, 175), 
        rgb(107, 114, 128), 
        rgb(75, 85, 99), 
        rgb(107, 114, 128), 
        rgb(156, 163, 175)
      )`;
    } else if (ev < 5) {
      return `linear-gradient(135deg, 
        rgb(251, 146, 60), 
        rgb(249, 115, 22), 
        rgb(234, 88, 12), 
        rgb(249, 115, 22), 
        rgb(251, 146, 60)
      )`;
    } else if (ev < 10) {
      return `linear-gradient(135deg, 
        rgb(34, 197, 94), 
        rgb(22, 163, 74), 
        rgb(15, 118, 54), 
        rgb(22, 163, 74), 
        rgb(34, 197, 94)
      )`;
    } else {
      return `linear-gradient(135deg, 
        rgb(250, 204, 21), 
        rgb(245, 158, 11), 
        rgb(217, 119, 6), 
        rgb(245, 158, 11), 
        rgb(250, 204, 21)
      )`;
    }
  };

  // Load teams on component mount
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const fbsTeams = await teamService.getAllTeams();
        setTeams(fbsTeams || []);
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };

    loadTeams();
  }, []);

  // Computed property for filtered games
  const filteredGames = useMemo(() => {
    let filtered = evGames.filter(game => game.maxEV >= minEV);

    // Sort the games
    filtered.sort((a, b) => {
      if (sortBy === 0) { // Sort by EV
        return sortOrder ? b.maxEV - a.maxEV : a.maxEV - b.maxEV;
      } else { // Sort by team
        const aTeam = a.homeTeam;
        const bTeam = b.homeTeam;
        return sortOrder ? bTeam.localeCompare(aTeam) : aTeam.localeCompare(bTeam);
      }
    });

    return filtered;
  }, [evGames, minEV, sortBy, sortOrder]);

  // Helper functions
  const getTeamLogo = (teamName) => {
    const team = teams.find(t => t.school?.toLowerCase() === teamName.toLowerCase());
    if (team?.logos && team.logos.length > 0) {
      return team.logos[0].replace('http://', 'https://');
    }
    return null;
  };

  const getSportsbookLogo = (provider) => {
    const providerLower = provider.toLowerCase();
    const logoMap = {
      'draftkings': '/photos/draftkings.png',
      'bovada': '/photos/bovada.png',
      'espn bet': '/photos/espnbet.png',
      'espnbet': '/photos/espnbet.png'
    };
    return logoMap[providerLower] || null;
  };

  const formatOdds = (odds) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const toggleExpanded = (gameId) => {
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
    }
    setExpandedGames(newExpanded);
  };

  const toggleBetType = (type) => {
    const newTypes = new Set(selectedBetTypes);
    if (newTypes.has(type)) {
      if (newTypes.size > 1) {
        newTypes.delete(type);
      }
    } else {
      newTypes.add(type);
    }
    setSelectedBetTypes(newTypes);
  };

  // UPDATED to use BettingCalculations utility
  const calculateEstimatedEV = (odds, game, isHome) => {
    // Get all odds for the same bet type from different sportsbooks
    const allTeamOdds = game.lines
      .map(line => isHome ? line.homeMoneyline : line.awayMoneyline)
      .filter(o => o && o !== 0);
    
    if (allTeamOdds.length === 0 || !odds) return 0;
    
    // Calculate fair odds using market average (remove vig estimation)
    const avgOdds = allTeamOdds.reduce((sum, o) => sum + o, 0) / allTeamOdds.length;
    
    // Use BettingCalculations to get proper EV
    const ev = BettingCalculations.calculateEV(odds, avgOdds);
    
    // Return EV as positive percentage or 0 if negative/null
    return Math.max(ev || 0, 0);
  };

  const calculateBestBets = (line, game) => {
    const bets = [];

    if (selectedBetTypes.has('moneyline')) {
      const homeEV = calculateEstimatedEV(line.homeMoneyline, game, true);
      const awayEV = calculateEstimatedEV(line.awayMoneyline, game, false);

      if (homeEV >= minEV) {
        bets.push({
          description: `${game.homeTeam} ML (${formatOdds(line.homeMoneyline)})`,
          evValue: homeEV
        });
      }

      if (awayEV >= minEV) {
        bets.push({
          description: `${game.awayTeam} ML (${formatOdds(line.awayMoneyline)})`,
          evValue: awayEV
        });
      }
    }

    if (selectedBetTypes.has('spread')) {
      // UPDATED to use BettingCalculations for spread EV
      const homeSpreadOdds = line.homeSpreadOdds || -110;
      const awaySpreadOdds = line.awaySpreadOdds || -110;
      
      // Get average spread odds from all lines for fair value estimation
      const allHomeSpreadOdds = game.lines
        .map(l => l.homeSpreadOdds || -110)
        .filter(o => o && o !== 0);
      const allAwaySpreadOdds = game.lines
        .map(l => l.awaySpreadOdds || -110)
        .filter(o => o && o !== 0);
      
      const avgHomeSpreadOdds = allHomeSpreadOdds.length ? 
        allHomeSpreadOdds.reduce((sum, o) => sum + o, 0) / allHomeSpreadOdds.length : -110;
      const avgAwaySpreadOdds = allAwaySpreadOdds.length ? 
        allAwaySpreadOdds.reduce((sum, o) => sum + o, 0) / allAwaySpreadOdds.length : -110;
      
      const homeSpreadEV = Math.max(BettingCalculations.calculateEV(homeSpreadOdds, avgHomeSpreadOdds) || 0, 0);
      const awaySpreadEV = Math.max(BettingCalculations.calculateEV(awaySpreadOdds, avgAwaySpreadOdds) || 0, 0);

      if (homeSpreadEV >= minEV) {
        bets.push({
          description: `${game.homeTeam} ${line.homeSpread || line.spread} (${formatOdds(homeSpreadOdds)})`,
          evValue: homeSpreadEV
        });
      }

      if (awaySpreadEV >= minEV) {
        const awaySpread = line.awaySpread || (line.spread ? -line.spread : '+' + Math.abs(line.spread || 0));
        bets.push({
          description: `${game.awayTeam} ${awaySpread} (${formatOdds(awaySpreadOdds)})`,
          evValue: awaySpreadEV
        });
      }
    }

    if (selectedBetTypes.has('overUnder')) {
      // UPDATED to use BettingCalculations for over/under EV
      const overOdds = line.overOdds || -110;
      const underOdds = line.underOdds || -110;
      
      // Get average over/under odds from all lines for fair value estimation
      const allOverOdds = game.lines
        .map(l => l.overOdds || -110)
        .filter(o => o && o !== 0);
      const allUnderOdds = game.lines
        .map(l => l.underOdds || -110)
        .filter(o => o && o !== 0);
      
      const avgOverOdds = allOverOdds.length ? 
        allOverOdds.reduce((sum, o) => sum + o, 0) / allOverOdds.length : -110;
      const avgUnderOdds = allUnderOdds.length ? 
        allUnderOdds.reduce((sum, o) => sum + o, 0) / allUnderOdds.length : -110;
      
      const overEV = Math.max(BettingCalculations.calculateEV(overOdds, avgOverOdds) || 0, 0);
      const underEV = Math.max(BettingCalculations.calculateEV(underOdds, avgUnderOdds) || 0, 0);

      if (overEV >= minEV) {
        bets.push({
          description: `Over ${line.overUnder} (${formatOdds(overOdds)})`,
          evValue: overEV
        });
      }

      if (underEV >= minEV) {
        bets.push({
          description: `Under ${line.overUnder} (${formatOdds(underOdds)})`,
          evValue: underEV
        });
      }
    }

    return bets.sort((a, b) => b.evValue - a.evValue);
  };

  // Team coverage information for 2024 season
  const teamCoverage2024 = {
    'Alabama': true, 'Auburn': true, 'Georgia': true, 'Tennessee': true, 'Florida': true,
    'LSU': true, 'Arkansas': true, 'Kentucky': true, 'Mississippi State': true, 'Missouri': true,
    'Ole Miss': true, 'South Carolina': true, 'Texas A&M': true, 'Vanderbilt': true,
    'Texas': true, 'Oklahoma': true, 'Ohio State': true, 'Michigan': true, 'Penn State': true,
    'Wisconsin': true, 'Iowa': true, 'Minnesota': true, 'Illinois': true, 'Indiana': true,
    'Maryland': true, 'Michigan State': true, 'Nebraska': true, 'Northwestern': true,
    'Purdue': true, 'Rutgers': true, 'Oregon': true, 'Washington': true, 'UCLA': true,
    'USC': true, 'Utah': true, 'Arizona': true, 'Arizona State': true, 'California': true,
    'Colorado': true, 'Oregon State': true, 'Stanford': true, 'Washington State': true,
    'Clemson': true, 'Florida State': true, 'Miami': true, 'NC State': true, 'North Carolina': true,
    'Virginia': true, 'Virginia Tech': true, 'Boston College': true, 'Duke': true, 'Georgia Tech': true,
    'Louisville': true, 'Pittsburgh': true, 'Syracuse': true, 'Wake Forest': true,
    'Notre Dame': true, 'BYU': true, 'Army': true, 'Navy': true, 'Liberty': true,
    'UConn': true, 'UMass': true
  };

  const isTeamCovered = (teamName) => {
    return teamCoverage2024[teamName] || false;
  };

  // Best bet indicator component with tooltip
  const BestBetArrow = ({ isVisible, tooltipText = "" }) => (
    isVisible ? (
      <div 
        className="flex items-center ml-2 group relative"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(34, 197, 94, 0.4))' }}
      >
        <div
          className="w-0 h-0 transition-all duration-200 group-hover:scale-110"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent', 
            borderBottom: '8px solid rgb(34, 197, 94)',
            transform: 'rotate(-90deg)'
          }}
        />
        
        {/* Best bet tooltip */}
        {tooltipText && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-green-600/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <div className="font-semibold">✅ Best Expected Value</div>
            <div className="text-green-200">{tooltipText}</div>
            <div className="text-yellow-300 font-medium">Highest profit potential</div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600/90"></div>
          </div>
        )}
      </div>
    ) : null
  );

  // Component sections
  const TeamLogo = ({ teamName, size = 40, showCoverage = false }) => {
    const logoUrl = getTeamLogo(teamName);
    const firstLetter = teamName.charAt(0).toUpperCase();
    const isCovered = isTeamCovered(teamName);

    return (
      <div className="relative group">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={teamName}
            className="rounded shadow-lg cursor-pointer transition-transform duration-200 group-hover:scale-110"
            style={{
              width: size,
              height: size,
              objectFit: 'contain',
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div
          className="rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-pointer transition-transform duration-200 group-hover:scale-110"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, rgba(156,163,175,0.8), rgba(107,114,128,0.5), rgba(156,163,175,0.7))',
            border: '1px solid rgba(255,255,255,0.4)',
            display: logoUrl ? 'none' : 'flex'
          }}
        >
          <span 
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {firstLetter}
          </span>
        </div>

        {/* Coverage indicator with enhanced tooltip */}
        {showCoverage && (
          <div className="group relative">
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold cursor-help transition-transform duration-200 hover:scale-125"
              style={{
                background: isCovered 
                  ? 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))'
                  : 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))',
                color: 'white',
                fontSize: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}
            >
              {isCovered ? '✓' : '✗'}
              
              {/* Enhanced Coverage Tooltip */}
              <div className={`absolute bottom-full right-0 mb-2 px-3 py-2 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ${isCovered ? 'bg-green-600/90' : 'bg-red-600/90'}`}>
                <div className="font-semibold">{isCovered ? '✓ 2024 Coverage Available' : '✗ Limited 2024 Coverage'}</div>
                <div className={isCovered ? 'text-green-200' : 'text-red-200'}>
                  {isCovered 
                    ? 'Full betting data available for this team' 
                    : 'Limited betting data - use with caution'
                  }
                </div>
                {/* Arrow */}
                <div className={`absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${isCovered ? 'border-t-green-600/90' : 'border-t-red-600/90'}`}></div>
              </div>
            </div>
          </div>
        )}

        {/* Team name tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-40">
          <div className="font-semibold">{teamName}</div>
          <div className="text-gray-300">Click for team details</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/90"></div>
        </div>
      </div>
    );
  };

  const SportsbookLogo = ({ provider, size = 28 }) => {
    const logoUrl = getSportsbookLogo(provider);
    
    if (logoUrl) {
      return (
        <div className="group relative">
          <img
            src={logoUrl}
            alt={provider}
            className="rounded shadow-sm cursor-pointer transition-transform duration-200 group-hover:scale-110"
            style={{ width: size, height: size, objectFit: 'contain' }}
          />
          
          {/* Sportsbook tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-blue-600/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <div className="font-semibold">📊 {provider}</div>
            <div className="text-blue-200">Compare odds across sportsbooks</div>
            <div className="text-yellow-300 font-medium">Find the best value</div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600/95"></div>
          </div>
        </div>
      );
    }

    const getProviderIcon = (provider) => {
      const providerLower = provider.toLowerCase();
      switch (providerLower) {
        case 'draftkings': return 'fas fa-d';
        case 'caesars': return 'fas fa-c';
        case 'betmgm': return 'fas fa-m';
        case 'pointsbet': return 'fas fa-p';
        case 'bet365': return 'fas fa-3';
        case 'betrivers': return 'fas fa-r';
        case 'fanduel': return 'fas fa-f';
        case 'espn bet':
        case 'espnbet': return 'fas fa-e';
        default: return 'fas fa-dollar-sign';
      }
    };

    return (
      <div className="group relative">
        <div
          className="rounded flex items-center justify-center cursor-pointer transition-transform duration-200 group-hover:scale-110"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
          }}
        >
          <i className={`${getProviderIcon(provider)} text-white text-xs`}></i>
        </div>
        
        {/* Sportsbook tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-blue-600/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="font-semibold">📊 {provider}</div>
          <div className="text-blue-200">Compare odds across sportsbooks</div>
          <div className="text-yellow-300 font-medium">Find the best value</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600/95"></div>
        </div>
      </div>
    );
  };

  const FilterButton = ({ title, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isSelected ? 'text-white shadow-md' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
      }`}
      style={isSelected ? { background: metallicGradient } : {}}
    >
      {title}
    </button>
  );

  const SortButton = ({ title, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isSelected ? 'text-white shadow-md' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
      }`}
      style={isSelected ? { background: metallicGradient } : {}}
    >
      {title}
    </button>
  );

  const SummaryCard = ({ icon, title, value, valueColor = null }) => (
    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
      <div className="flex items-center mb-2">
        <i className={`${icon} text-sm text-gray-500 mr-2`}></i>
        <span className="text-xs text-gray-600 font-medium">{title}</span>
      </div>
      <div 
        className="text-lg font-bold"
        style={{
          background: valueColor || 'linear-gradient(135deg, #1f2937, #374151)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {value}
      </div>
    </div>
  );

  const ControlsSection = () => (
    <div className="space-y-6">
      {/* EV Filter slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-600">Minimum EV %:</span>
          <span 
            className="text-lg font-bold"
            style={{
              background: metallicEVGradient(minEV),
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {minEV.toFixed(1)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={minEV}
          onChange={(e) => setMinEV(parseFloat(e.target.value))}
          className="w-full"
          style={{ accentColor }}
        />
      </div>

      {/* Bet Type Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Bet Types:</h3>
        <div className="flex gap-3">
          <FilterButton
            title="Moneyline"
            isSelected={selectedBetTypes.has('moneyline')}
            onClick={() => toggleBetType('moneyline')}
          />
          <FilterButton
            title="Spread"
            isSelected={selectedBetTypes.has('spread')}
            onClick={() => toggleBetType('spread')}
          />
          <FilterButton
            title="Over/Under"
            isSelected={selectedBetTypes.has('overUnder')}
            onClick={() => toggleBetType('overUnder')}
          />
        </div>
      </div>

      {/* Sort Controls */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Sort By</h3>
        <div className="flex gap-3">
          <SortButton
            title={`EV ${sortBy === 0 ? (sortOrder ? '↓' : '↑') : ''}`}
            isSelected={sortBy === 0}
            onClick={() => {
              if (sortBy === 0) {
                setSortOrder(!sortOrder);
              } else {
                setSortBy(0);
              }
            }}
          />
          <SortButton
            title={`Team ${sortBy === 1 ? (sortOrder ? '↓' : '↑') : ''}`}
            isSelected={sortBy === 1}
            onClick={() => {
              if (sortBy === 1) {
                setSortOrder(!sortOrder);
              } else {
                setSortBy(1);
              }
            }}
          />
        </div>
      </div>
    </div>
  );

  const SummarySection = () => {
    const bestEV = filteredGames.length > 0 ? Math.max(...filteredGames.map(g => g.maxEV)) : 0;
    const expectedReturn = 100 * (1 + bestEV / 100);

    return (
      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard
          icon="fas fa-chart-line"
          title="Games with +EV"
          value={filteredGames.length.toString()}
        />
        <SummaryCard
          icon="fas fa-percent"
          title="Best EV Chance"
          value={`${bestEV.toFixed(1)}%`}
          valueColor={metallicEVGradient(bestEV)}
        />
        <SummaryCard
          icon="fas fa-dollar-sign"
          title="+EV on $100"
          value={`$${expectedReturn.toFixed(2)}`}
          valueColor={metallicEVGradient(bestEV)}
        />
      </div>
    );
  };

  const MoneylineTabContent = ({ game }) => (
    <div>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 flex">
        <div className="w-28 text-xs font-medium text-gray-600">Sportsbook</div>
        <div className="flex-1 text-center text-xs font-medium text-gray-600">{game.homeTeam}</div>
        <div className="flex-1 text-center text-xs font-medium text-gray-600">{game.awayTeam}</div>
        <div className="w-16 text-xs font-medium text-gray-600 text-right">Best EV</div>
      </div>

      {/* Sportsbook rows */}
      {game.lines.map((line, index) => {
        const homeEV = calculateEstimatedEV(line.homeMoneyline, game, true);
        const awayEV = calculateEstimatedEV(line.awayMoneyline, game, false);
        const bestEV = Math.max(homeEV, awayEV);

        return (
          <div key={index} className="px-4 py-3 border-b border-gray-50 last:border-b-0">
            <div className="flex items-center">
              <div className="w-28 flex items-center space-x-2">
                <SportsbookLogo provider={line.provider} size={20} />
                <span className="text-sm truncate">{line.provider}</span>
              </div>
              
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center group relative">
                  {line.homeMoneyline ? (
                    <>
                      <div 
                        className="text-sm font-semibold cursor-help transition-all duration-200 hover:scale-105" 
                        style={{ 
                          background: homeEV >= 3 
                            ? 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))'
                            : line.homeMoneyline > 0 
                              ? `linear-gradient(135deg, ${positiveColor}, ${positiveColor}CC)` 
                              : metallicGradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        {formatOdds(line.homeMoneyline)}
                      </div>
                      <BestBetArrow 
                        isVisible={homeEV >= 3} 
                        tooltipText={`${homeEV.toFixed(1)}% expected value on home team`}
                      />
                      
                      {/* Odds explanation tooltip */}
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ${homeEV >= 3 ? 'bg-green-600/95' : 'bg-blue-600/95'}`}>
                        <div className="font-semibold">
                          {homeEV >= 3 ? '🎯 High Value Home Bet' : '🏠 Home Moneyline'}
                        </div>
                        <div className={homeEV >= 3 ? 'text-green-200' : 'text-blue-200'}>
                          {line.homeMoneyline > 0 
                            ? `Bet $100 to win $${line.homeMoneyline}` 
                            : `Bet $${Math.abs(line.homeMoneyline)} to win $100`
                          }
                        </div>
                        <div className="text-yellow-300 font-medium">
                          Expected Value: +{homeEV.toFixed(1)}%
                        </div>
                        {/* Arrow */}
                        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${homeEV >= 3 ? 'border-t-green-600/95' : 'border-t-blue-600/95'}`}></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center group relative">
                      <span 
                        className="text-sm font-semibold cursor-help"
                        style={{
                          background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        ✗
                      </span>
                      
                      {/* No odds tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        <div className="font-semibold">❌ No Odds Available</div>
                        <div className="text-red-200">This sportsbook is not offering odds</div>
                        <div className="text-yellow-300 font-medium">Try other sportsbooks</div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600/95"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div 
                  className="text-xs font-bold cursor-help"
                  style={{
                    background: metallicEVGradient(homeEV),
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  +{homeEV.toFixed(1)}%
                </div>
              </div>
              
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center group relative">
                  {line.awayMoneyline ? (
                    <>
                      <div 
                        className="text-sm font-semibold cursor-help transition-all duration-200 hover:scale-105" 
                        style={{ 
                          background: awayEV >= 3 
                            ? 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))'
                            : line.awayMoneyline > 0 
                              ? `linear-gradient(135deg, ${positiveColor}, ${positiveColor}CC)` 
                              : metallicGradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        {formatOdds(line.awayMoneyline)}
                      </div>
                      <BestBetArrow 
                        isVisible={awayEV >= 3} 
                        tooltipText={`${awayEV.toFixed(1)}% expected value on away team`}
                      />
                      
                      {/* Odds explanation tooltip */}
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ${awayEV >= 3 ? 'bg-green-600/95' : 'bg-blue-600/95'}`}>
                        <div className="font-semibold">
                          {awayEV >= 3 ? '🎯 High Value Away Bet' : '✈️ Away Moneyline'}
                        </div>
                        <div className={awayEV >= 3 ? 'text-green-200' : 'text-blue-200'}>
                          {line.awayMoneyline > 0 
                            ? `Bet $100 to win $${line.awayMoneyline}` 
                            : `Bet $${Math.abs(line.awayMoneyline)} to win $100`
                          }
                        </div>
                        <div className="text-yellow-300 font-medium">
                          Expected Value: +{awayEV.toFixed(1)}%
                        </div>
                        {/* Arrow */}
                        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${awayEV >= 3 ? 'border-t-green-600/95' : 'border-t-blue-600/95'}`}></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center group relative">
                      <span 
                        className="text-sm font-semibold cursor-help"
                        style={{
                          background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        ✗
                      </span>
                      
                      {/* No odds tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        <div className="font-semibold">❌ No Odds Available</div>
                        <div className="text-red-200">This sportsbook is not offering odds</div>
                        <div className="text-yellow-300 font-medium">Try other sportsbooks</div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600/95"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div 
                  className="text-xs font-bold cursor-help"
                  style={{
                    background: metallicEVGradient(awayEV),
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  +{awayEV.toFixed(1)}%
                </div>
              </div>
              
              <div className="group relative">
                <div 
                  className="w-16 text-sm font-bold text-right cursor-help"
                  style={{
                    background: metallicEVGradient(bestEV),
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  +{bestEV.toFixed(1)}%
                </div>
                
                {/* Best EV tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-purple-600/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  <div className="font-semibold">🏆 Best EV for this Book</div>
                  <div className="text-purple-200">Highest expected value available</div>
                  <div className="text-yellow-300 font-medium">
                    {bestEV === homeEV ? 'Home team bet' : 'Away team bet'}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600/95"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const EVCalculator = ({ game }) => (
    <div className="space-y-4 p-4">
      <div className="flex items-center space-x-2 group relative">
        <h4 className="text-lg font-medium cursor-help">EV Calculator</h4>
        <i className="fas fa-calculator text-gray-500 cursor-help"></i>
        
        {/* EV Calculator explanation tooltip */}
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-indigo-600/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="font-semibold">🧮 Expected Value Calculator</div>
          <div className="text-indigo-200 max-w-xs">Shows potential profit based on statistical edge</div>
          <div className="text-yellow-300 font-medium">Higher EV = Better long-term profit</div>
          {/* Arrow */}
          <div className="absolute top-full left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-indigo-600/95"></div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600">
        Expected Value (EV) represents the average amount you can expect to win (or lose) per bet placed 
        if you were to place the same bet on this game many times.
      </p>

      <div className="bg-gray-50 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-2 flex">
          <div className="flex-1 text-xs font-medium text-gray-600">Stake</div>
          <div className="flex-1 text-xs font-medium text-gray-600">Expected Return</div>
          <div className="flex-1 text-xs font-medium text-gray-600 text-right">Expected Profit</div>
        </div>

        {/* Stake rows */}
        {[50, 100, 200, 500, 1000].map(stake => {
          const expectedReturn = stake * (1 + game.maxEV / 100);
          const expectedProfit = stake * (game.maxEV / 100);

          return (
            <div key={stake} className="px-4 py-2 border-b border-gray-100 last:border-b-0 group relative">
              <div className="flex cursor-help">
                <div className="flex-1 text-sm">${stake}</div>
                <div className="flex-1 text-sm">${expectedReturn.toFixed(2)}</div>
                <div 
                  className="flex-1 text-sm font-bold text-right"
                  style={{
                    background: metallicEVGradient(game.maxEV),
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  ${expectedProfit.toFixed(2)}
                </div>
              </div>
              
              {/* Profit explanation tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-green-600/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                <div className="font-semibold">💰 Betting ${stake} at {game.maxEV.toFixed(1)}% EV</div>
                <div className="text-green-200">Expected profit over many bets: ${expectedProfit.toFixed(2)}</div>
                <div className="text-yellow-300 font-medium">Total expected return: ${expectedReturn.toFixed(2)}</div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600/95"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const EVGameCard = ({ game }) => {
    const isExpanded = expandedGames.has(game.id);

    return (
      <div 
        className="rounded-xl shadow-lg overflow-hidden border"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Game Header */}
        <button
          onClick={() => toggleExpanded(game.id)}
          className="w-full p-4 text-left"
        >
          <div className="space-y-4">
            {/* Team matchup */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <TeamLogo teamName={game.awayTeam} size={50} showCoverage={true} />
                  <div>
                    <div className="font-medium text-sm">{game.awayTeam}</div>
                    <div className="text-xs text-gray-500">Away</div>
                  </div>
                </div>

                <span className="text-gray-400 text-sm">@</span>

                <div className="flex items-center space-x-3">
                  <TeamLogo teamName={game.homeTeam} size={50} showCoverage={true} />
                  <div>
                    <div className="font-medium text-sm">{game.homeTeam}</div>
                    <div className="text-xs text-gray-500">Home</div>
                  </div>
                </div>
              </div>

              {/* EV Badge */}
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-2">Week {game.week}</div>
                <div className="group relative">
                  <div 
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 cursor-help"
                    style={{ background: metallicEVGradient(game.maxEV) }}
                  >
                    <i className="fas fa-trophy text-yellow-300"></i>
                    +{game.maxEV.toFixed(1)}% EV
                  </div>
                  
                  {/* EV Badge tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-orange-600/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    <div className="font-semibold">🏆 Best Expected Value</div>
                    <div className="text-orange-200">This game offers {game.maxEV.toFixed(1)}% profit edge</div>
                    <div className="text-yellow-300 font-medium">Positive EV = Long-term profit potential</div>
                    {/* Arrow */}
                    <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-orange-600/95"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expansion indicator */}
            <div className="flex justify-center">
              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400`}></i>
            </div>
          </div>
        </button>

        {!isExpanded ? (
          // Collapsed view - preview
          <div>
            <div className="border-t border-gray-100"></div>
            <div className="bg-gray-50 px-4 py-2 flex">
              <div className="w-28 text-xs font-medium text-gray-600">Sportsbook</div>
              <div className="flex-1 text-xs font-medium text-gray-600">Best Bet</div>
              <div className="w-16 text-xs font-medium text-gray-600 text-right">EV%</div>
            </div>

            {game.lines.slice(0, 2).map((line, index) => {
              const bestBets = calculateBestBets(line, game);
              const bestBet = bestBets[0];

              if (!bestBet) return null;

              return (
                <div key={index} className="px-4 py-3 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-28 flex items-center space-x-2">
                      <SportsbookLogo provider={line.provider} size={20} />
                      <span className="text-sm truncate">{line.provider}</span>
                    </div>
                    <div className="flex-1 text-sm">{bestBet.description}</div>
                    <div 
                      className="w-16 text-sm font-bold text-right"
                      style={{
                        background: metallicEVGradient(bestBet.evValue),
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      +{bestBet.evValue.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}

            {game.lines.length > 2 && (
              <div className="px-4 py-2 text-center bg-gray-50">
                <span className="text-xs text-gray-500">
                  <i className="fas fa-info-circle mr-1"></i>
                  Tap to see {game.lines.length - 2} more sportsbooks
                </span>
              </div>
            )}
          </div>
        ) : (
          // Expanded view
          <div>
            <div className="border-t border-gray-100"></div>
            
            {/* Bet type tabs */}
            <div className="flex bg-gray-100">
              {Array.from(selectedBetTypes).map(betType => {
                const title = betType === 'moneyline' ? 'Moneyline' : 
                             betType === 'spread' ? 'Spread' : 'Over/Under';


                
                return (
                  <div
                    key={betType}
                    className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
                      betType === 'moneyline' ? 'bg-gray-50 text-red-600' : 'text-gray-700'
                    }`}
                  >
                    {title}
                  </div>
                );
              })}
            </div>

            <MoneylineTabContent game={game} />
            <EVCalculator game={game} />
          </div>
        )}
      </div>
    );
  };

  const EmptyStateView = () => (
    <div className="text-center py-20">
      <i className="fas fa-info-circle text-6xl text-orange-500 mb-6"></i>
      <h3 className="text-xl font-bold mb-2">No positive EV bets found</h3>
      <p className="text-gray-600 mb-6">Try lowering the minimum EV or selecting different bet types.</p>
      
      <div className="flex items-center justify-center space-x-4 mb-6">
        <span className="text-sm font-medium text-gray-600">Minimum EV %:</span>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={minEV}
          onChange={(e) => setMinEV(parseFloat(e.target.value))}
          className="w-32"
          style={{ accentColor }}
        />
        <span 
          className="text-lg font-bold"
          style={{
            background: metallicEVGradient(minEV),
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {minEV.toFixed(1)}%
        </span>
      </div>

      <button
        onClick={() => setMinEV(0)}
        className="px-6 py-3 text-white font-medium rounded-lg transition-all hover:shadow-lg"
        style={{ background: metallicGradient }}
      >
        Show All Games
      </button>
    </div>
  );

  return (
    <div className="space-y-0" style={{ backgroundColor }}>
      {/* Controls section */}
      <div className="px-1 pb-6">
        <ControlsSection />
      </div>

      {filteredGames.length === 0 ? (
        <EmptyStateView />
      ) : (
        <>
          {/* Summary section */}
          <div className="px-1 pb-5">
            <SummarySection />
          </div>

          {/* Games list */}
          <div className="space-y-4 px-1 pb-5">
            {filteredGames.map(game => (
              <EVGameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EVBettingView;