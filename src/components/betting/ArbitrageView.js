import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services';
import { BettingCalculations } from '../../utils';

const ArbitrageView = ({ arbitrageGames, onGameSelected }) => {
  // Debug logging
  console.log('ArbitrageView received:', {
    gamesCount: arbitrageGames?.length || 0,
    sampleGame: arbitrageGames?.[0],
    gamesWithArbitrage: arbitrageGames?.filter(g => g.hasArbitrage).length || 0
  });

  // State management - mirrors Swift @State
  const [sortBy, setSortBy] = useState(0); // 0: profit, 1: homeTeam, 2: awayTeam
  const [filterBy, setFilterBy] = useState(0); // 0: all, 1: guaranteed
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Theme colors - matching Swift theme
  const accentColor = 'rgb(204, 0, 28)';
  const gradientStart = 'rgb(230, 26, 51)'; // Lighter red
  const gradientEnd = 'rgb(179, 0, 25)'; // Darker red
  const positiveColor = 'rgb(34, 197, 94)'; // Green
  const backgroundColor = '#ffffff';

  // Metallic gradient CSS
  const metallicGradient = `linear-gradient(135deg, 
    rgb(255, 46, 74), 
    rgb(204, 0, 28), 
    rgb(161, 0, 20), 
    rgb(204, 0, 28), 
    rgb(255, 46, 74)
  )`;

  // Load teams on component mount
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const fbsTeams = await teamService.getAllTeams();
        setTeams(fbsTeams || []);
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, []);

  // Computed property for filtered games - mirrors Swift computed property
  const filteredGames = useMemo(() => {
    if (!arbitrageGames) return [];

    let filtered = [...arbitrageGames];

    // Apply filter
    if (filterBy === 1) { // Guaranteed only
      filtered = filtered.filter(game => game.hasArbitrage);
    }

    // Apply sort
    switch (sortBy) {
      case 0: // Profit
        return filtered.sort((a, b) => b.bestProfit - a.bestProfit);
      case 1: // Home Team
        return filtered.sort((a, b) => a.homeTeam.localeCompare(b.homeTeam));
      case 2: // Away Team
        return filtered.sort((a, b) => a.awayTeam.localeCompare(b.awayTeam));
      default:
        return filtered;
    }
  }, [arbitrageGames, sortBy, filterBy]);

  // Helper function to get team abbreviation
  const getTeamAbbreviation = (teamName) => {
    const team = teams.find(t => t.school?.toLowerCase() === teamName.toLowerCase());
    return team?.abbreviation || teamName;
  };

  // Helper function to get team logo
  const getTeamLogo = (teamName) => {
    const team = teams.find(t => t.school?.toLowerCase() === teamName.toLowerCase());
    if (team?.logos && team.logos.length > 0) {
      return team.logos[0].replace('http://', 'https://');
    }
    return null;
  };

  // Helper function to get sportsbook logo
  const getSportsbookLogo = (provider) => {
    const providerLower = provider.toLowerCase();
    
    // Map providers to their logo files - matches College Football Data API providers
    const logoMap = {
      'draftkings': '/photos/draftkings.png',
      'bovada': '/photos/bovada.png',
      'espn bet': '/photos/espnbet.png',
      'espnbet': '/photos/espnbet.png'
    };

    return logoMap[providerLower] || null;
  };

  // Helper function to calculate implied probabilities for a game
  const calculateImpliedProbabilities = (game) => {
    if (!game.lines || game.lines.length === 0) {
      return { homeImplied: 0, awayImplied: 0, totalImplied: 0 };
    }

    // Find best odds for each side
    const homeOdds = game.lines.map(l => l.homeMoneyline).filter(o => o != null);
    const awayOdds = game.lines.map(l => l.awayMoneyline).filter(o => o != null);

    if (homeOdds.length === 0 || awayOdds.length === 0) {
      return { homeImplied: 0, awayImplied: 0, totalImplied: 0 };
    }

    // Find best odds (highest positive, or closest to 0 for negative)
    const bestHomeOdds = homeOdds.reduce((best, current) => {
      if (current > 0 && best > 0) return Math.max(best, current);
      if (current < 0 && best < 0) return Math.max(best, current);
      if (current > 0 && best < 0) return current;
      if (current < 0 && best > 0) return best;
      return best;
    });

    const bestAwayOdds = awayOdds.reduce((best, current) => {
      if (current > 0 && best > 0) return Math.max(best, current);
      if (current < 0 && best < 0) return Math.max(best, current);
      if (current > 0 && best < 0) return current;
      if (current < 0 && best > 0) return best;
      return best;
    });

    // Calculate implied probabilities
    const homeImplied = BettingCalculations.americanToImpliedProbability(bestHomeOdds) || 0;
    const awayImplied = BettingCalculations.americanToImpliedProbability(bestAwayOdds) || 0;
    const totalImplied = homeImplied + awayImplied;

    return {
      homeImplied: homeImplied,
      awayImplied: awayImplied,
      totalImplied: totalImplied
    };
  };

  // Helper function to get gradient color based on probability
  const getProbabilityGradient = (probability, isTotal = false) => {
    if (isTotal) {
      // For total probability: < 100% (green), 100-105% (yellow), > 105% (red)
      if (probability < 100) {
        return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.25))'; // Green
      } else if (probability <= 105) {
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.25))'; // Yellow
      } else {
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.25))'; // Red
      }
    } else {
      // For individual probabilities: higher is more red/orange, lower is more green
      if (probability < 40) {
        return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.25))'; // Green
      } else if (probability < 60) {
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.25))'; // Yellow
      } else {
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.25))'; // Red
      }
    }
  };

  // Implied Probability Display Component with enhanced tooltips
  const ImpliedProbabilityDisplay = ({ game }) => {
    const { homeImplied, awayImplied, totalImplied } = calculateImpliedProbabilities(game);

    if (homeImplied === 0 && awayImplied === 0) return null;

    const getTooltipContent = (type, value) => {
      switch (type) {
        case 'home':
          return {
            title: '🏠 Home Implied Probability',
            description: `Market believes home team has ${value.toFixed(1)}% chance to win`,
            interpretation: value > 60 ? 'Strong favorite' : value > 40 ? 'Slight favorite' : 'Underdog'
          };
        case 'away':
          return {
            title: '✈️ Away Implied Probability', 
            description: `Market believes away team has ${value.toFixed(1)}% chance to win`,
            interpretation: value > 60 ? 'Strong favorite' : value > 40 ? 'Slight favorite' : 'Underdog'
          };
        case 'total':
          return {
            title: '📊 Total Market Efficiency',
            description: `Combined probabilities: ${value.toFixed(1)}%`,
            interpretation: value < 100 ? 'Arbitrage opportunity!' : value > 105 ? 'High market margin' : 'Fair market'
          };
        default:
          return { title: '', description: '', interpretation: '' };
      }
    };

    return (
      <div className="flex items-center gap-2">
        {/* Home Implied Probability */}
        <div className="group relative">
          <div 
            className="px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border border-white/20 cursor-help transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              background: getProbabilityGradient(homeImplied),
              color: homeImplied > 60 ? '#dc2626' : homeImplied > 40 ? '#d97706' : '#16a34a'
            }}
          >
            <span className="font-semibold">H:</span> {homeImplied.toFixed(1)}%
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <div className="font-semibold text-blue-300">{getTooltipContent('home', homeImplied).title}</div>
            <div className="text-gray-200">{getTooltipContent('home', homeImplied).description}</div>
            <div className="text-yellow-300 font-medium">{getTooltipContent('home', homeImplied).interpretation}</div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/95"></div>
          </div>
        </div>

        {/* Away Implied Probability */}
        <div className="group relative">
          <div 
            className="px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border border-white/20 cursor-help transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              background: getProbabilityGradient(awayImplied),
              color: awayImplied > 60 ? '#dc2626' : awayImplied > 40 ? '#d97706' : '#16a34a'
            }}
          >
            <span className="font-semibold">A:</span> {awayImplied.toFixed(1)}%
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <div className="font-semibold text-blue-300">{getTooltipContent('away', awayImplied).title}</div>
            <div className="text-gray-200">{getTooltipContent('away', awayImplied).description}</div>
            <div className="text-yellow-300 font-medium">{getTooltipContent('away', awayImplied).interpretation}</div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/95"></div>
          </div>
        </div>

        {/* Total Implied Probability */}
        <div className="group relative">
          <div 
            className="px-2 py-1 rounded-md text-xs font-bold backdrop-blur-sm border border-white/20 cursor-help transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              background: getProbabilityGradient(totalImplied, true),
              color: totalImplied > 105 ? '#dc2626' : totalImplied > 100 ? '#d97706' : '#16a34a'
            }}
          >
            <span className="font-semibold">T:</span> {totalImplied.toFixed(1)}%
          </div>
          
          {/* Tooltip */}
          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ${totalImplied < 100 ? 'bg-green-600/95' : totalImplied > 105 ? 'bg-red-600/95' : 'bg-yellow-600/95'}`}>
            <div className="font-semibold">{getTooltipContent('total', totalImplied).title}</div>
            <div className={totalImplied < 100 ? 'text-green-200' : totalImplied > 105 ? 'text-red-200' : 'text-yellow-200'}>{getTooltipContent('total', totalImplied).description}</div>
            <div className="text-white font-medium">{getTooltipContent('total', totalImplied).interpretation}</div>
            {/* Arrow */}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${totalImplied < 100 ? 'border-t-green-600/95' : totalImplied > 105 ? 'border-t-red-600/95' : 'border-t-yellow-600/95'}`}></div>
          </div>
        </div>
      </div>
    );
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
  const BestBetArrow = ({ isVisible, tooltipText }) => (
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
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-green-600/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="font-semibold">✓ Best Odds Available</div>
          <div className="text-green-200">{tooltipText}</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600/90"></div>
        </div>
      </div>
    ) : null
  );

  // Filter button component
  const FilterButton = ({ title, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isSelected 
          ? 'text-white shadow-md' 
          : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
      }`}
      style={isSelected ? {
        background: metallicGradient,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      } : {}}
    >
      {title}
    </button>
  );

  // Sort button component
  const SortButton = ({ title, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isSelected 
          ? 'text-white shadow-md' 
          : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
      }`}
      style={isSelected ? {
        background: metallicGradient,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      } : {}}
    >
      {title}
    </button>
  );

  // Summary card component
  const SummaryCard = ({ title, value, icon, valueColor = null }) => (
    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
      <div className="flex items-center mb-2">
        <i className={`${icon} text-sm text-gray-500 mr-2`}></i>
        <span className="text-xs text-gray-600 font-medium">{title}</span>
      </div>
      <div 
        className="text-lg font-bold"
        style={{
          background: valueColor ? `linear-gradient(135deg, ${valueColor}, ${valueColor}CC)` : 'linear-gradient(135deg, #1f2937, #374151)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        {value}
      </div>
    </div>
  );

  // Team logo component with fallback and enhanced tooltip
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
            className="rounded shadow-md transition-transform duration-200 group-hover:scale-110"
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
          className="rounded-full flex items-center justify-center font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-110"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, rgba(156,163,175,0.8), rgba(107,114,128,0.5), rgba(156,163,175,0.7))',
            boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.4)',
            display: logoUrl ? 'none' : 'flex'
          }}
        >
          <span 
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {firstLetter}
          </span>
        </div>

        {/* Coverage indicator with enhanced tooltip */}
        {showCoverage && (
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
            
            {/* Enhanced Tooltip */}
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

  // Sportsbook logo component with enhanced tooltip
  const SportsbookLogo = ({ provider, size = 28 }) => {
    const logoUrl = getSportsbookLogo(provider);
    
    if (logoUrl) {
      return (
        <div className="group relative">
          <img
            src={logoUrl}
            alt={provider}
            className="rounded shadow-sm transition-transform duration-200 group-hover:scale-110 cursor-help"
            style={{
              width: size,
              height: size,
              objectFit: 'contain'
            }}
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

    // Fallback icon based on provider
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
          className="rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-110 cursor-help"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
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

  // Controls section
  const ControlsSection = () => (
    <div className="space-y-6 mb-6">
      {/* Filter controls */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Filter</h3>
        <div className="flex gap-3">
          <FilterButton
            title="All Games"
            isSelected={filterBy === 0}
            onClick={() => setFilterBy(0)}
          />
          <FilterButton
            title="Guaranteed Profit"
            isSelected={filterBy === 1}
            onClick={() => setFilterBy(1)}
          />
        </div>
      </div>

      {/* Sort controls */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Sort By</h3>
        <div className="flex gap-3">
          <SortButton
            title="Profit"
            isSelected={sortBy === 0}
            onClick={() => setSortBy(0)}
          />
          <SortButton
            title="Home Team"
            isSelected={sortBy === 1}
            onClick={() => setSortBy(1)}
          />
          <SortButton
            title="Away Team"
            isSelected={sortBy === 2}
            onClick={() => setSortBy(2)}
          />
        </div>
      </div>
    </div>
  );

  // Summary section
  const SummarySection = () => {
    const gamesWithArbitrage = filteredGames.filter(game => game.hasArbitrage);
    const bestProfit = gamesWithArbitrage.length > 0 
      ? Math.max(...gamesWithArbitrage.map(game => game.bestProfit))
      : 0;

    return (
      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard
          title="Games"
          value={filteredGames.length.toString()}
          icon="fas fa-football-ball"
        />
        <SummaryCard
          title="With Arbitrage"
          value={gamesWithArbitrage.length.toString()}
          icon="fas fa-exchange-alt"
        />
        <SummaryCard
          title="Best Profit"
          value={gamesWithArbitrage.length > 0 ? `${bestProfit.toFixed(1)}%` : 'N/A'}
          icon="fas fa-chart-line"
          valueColor={positiveColor}
        />
      </div>
    );
  };

  // Arbitrage game card
  const ArbitrageGameCard = ({ game }) => (
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
      {/* Game header */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          {/* Teams presentation */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <TeamLogo teamName={game.awayTeam} showCoverage={true} />
              <div>
                <div className="font-medium text-sm">
                  {getTeamAbbreviation(game.awayTeam)}
                </div>
                <div className="text-xs text-gray-500">Away</div>
              </div>
            </div>

            <span className="text-gray-400 text-sm">@</span>

            <div className="flex items-center space-x-3">
              <TeamLogo teamName={game.homeTeam} showCoverage={true} />
              <div>
                <div className="font-medium text-sm">
                  {getTeamAbbreviation(game.homeTeam)}
                </div>
                <div className="text-xs text-gray-500">Home</div>
              </div>
            </div>
          </div>

          {/* Implied Probabilities in the middle */}
          <div className="flex-1 flex justify-center">
            <ImpliedProbabilityDisplay game={game} />
          </div>

          {/* Week info and profit badge */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-2">Week {game.week}</div>
            {game.hasArbitrage && (
              <div 
                className="px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                style={{
                  background: metallicGradient,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <i className="fas fa-trophy text-yellow-300"></i>
                {game.bestProfit.toFixed(1)}% Profit
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100"></div>

      {/* Sportsbook odds comparison */}
      <div>
        {/* Header */}
        <div className="bg-gray-50 px-4 py-2 flex">
          <div className="w-28 text-xs font-medium text-gray-600">Sportsbook</div>
          <div className="flex-1 text-center text-xs font-medium text-gray-600">Home ML</div>
          <div className="flex-1 text-center text-xs font-medium text-gray-600">Away ML</div>
        </div>

        {/* Sportsbook rows */}
        {game.lines.slice(0, 3).map((line, index) => {
          // Find the best odds for comparison
          const allHomeOdds = game.lines.map(l => l.homeMoneyline).filter(o => o != null);
          const allAwayOdds = game.lines.map(l => l.awayMoneyline).filter(o => o != null);
          
          const bestHomeOdds = allHomeOdds.reduce((best, current) => {
            if (current > 0 && best > 0) return Math.max(best, current);
            if (current < 0 && best < 0) return Math.max(best, current);
            if (current > 0 && best < 0) return current;
            if (current < 0 && best > 0) return best;
            return best;
          }, allHomeOdds[0]);
          
          const bestAwayOdds = allAwayOdds.reduce((best, current) => {
            if (current > 0 && best > 0) return Math.max(best, current);
            if (current < 0 && best < 0) return Math.max(best, current);
            if (current > 0 && best < 0) return current;
            if (current < 0 && best > 0) return best;
            return best;
          }, allAwayOdds[0]);

          const isHomeBest = line.homeMoneyline === bestHomeOdds;
          const isAwayBest = line.awayMoneyline === bestAwayOdds;
          
          return (
            <div key={index} className="px-4 py-3 border-b border-gray-50 last:border-b-0">
              <div className="flex items-center">
                <div className="w-28 flex items-center space-x-2">
                  <SportsbookLogo provider={line.provider} />
                  <span className="text-sm text-gray-700 truncate">{line.provider}</span>
                </div>
                
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center group relative">
                    {line.homeMoneyline ? (
                      <>
                        <span 
                          className="text-sm font-semibold cursor-help transition-all duration-200 hover:scale-105"
                          style={{
                            background: isHomeBest 
                              ? 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))' 
                              : line.homeMoneyline > 0 
                                ? `linear-gradient(135deg, ${positiveColor}, ${positiveColor}CC)` 
                                : metallicGradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          {BettingCalculations.formatAmericanOdds(line.homeMoneyline)}
                        </span>
                        <BestBetArrow 
                          isVisible={isHomeBest} 
                          tooltipText={`Best home odds: +${Math.abs(line.homeMoneyline)} more profitable than competitors`}
                        />
                        
                        {/* Odds explanation tooltip */}
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ${isHomeBest ? 'bg-green-600/95' : 'bg-blue-600/95'}`}>
                          <div className="font-semibold">
                            {isHomeBest ? '🎯 Best Home Odds' : '🏠 Home Moneyline'}
                          </div>
                          <div className={isHomeBest ? 'text-green-200' : 'text-blue-200'}>
                            {line.homeMoneyline > 0 
                              ? `Bet $100 to win $${line.homeMoneyline}` 
                              : `Bet $${Math.abs(line.homeMoneyline)} to win $100`
                            }
                          </div>
                          <div className="text-yellow-300 font-medium">
                            {isHomeBest ? 'Highest payout available!' : 'Compare with other books'}
                          </div>
                          {/* Arrow */}
                          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${isHomeBest ? 'border-t-green-600/95' : 'border-t-blue-600/95'}`}></div>
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
                </div>
                
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center group relative">
                    {line.awayMoneyline ? (
                      <>
                        <span 
                          className="text-sm font-semibold cursor-help transition-all duration-200 hover:scale-105"
                          style={{
                            background: isAwayBest 
                              ? 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))' 
                              : line.awayMoneyline > 0 
                                ? `linear-gradient(135deg, ${positiveColor}, ${positiveColor}CC)` 
                                : metallicGradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          {BettingCalculations.formatAmericanOdds(line.awayMoneyline)}
                        </span>
                        <BestBetArrow 
                          isVisible={isAwayBest} 
                          tooltipText={`Best away odds: +${Math.abs(line.awayMoneyline)} more profitable than competitors`}
                        />
                        
                        {/* Odds explanation tooltip */}
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ${isAwayBest ? 'bg-green-600/95' : 'bg-blue-600/95'}`}>
                          <div className="font-semibold">
                            {isAwayBest ? '🎯 Best Away Odds' : '✈️ Away Moneyline'}
                          </div>
                          <div className={isAwayBest ? 'text-green-200' : 'text-blue-200'}>
                            {line.awayMoneyline > 0 
                              ? `Bet $100 to win $${line.awayMoneyline}` 
                              : `Bet $${Math.abs(line.awayMoneyline)} to win $100`
                            }
                          </div>
                          <div className="text-yellow-300 font-medium">
                            {isAwayBest ? 'Highest payout available!' : 'Compare with other books'}
                          </div>
                          {/* Arrow */}
                          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${isAwayBest ? 'border-t-green-600/95' : 'border-t-blue-600/95'}`}></div>
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
                </div>
              </div>
            </div>
          );
        })}

        {/* More sportsbooks indicator */}
        {game.lines.length > 3 && (
          <div className="bg-gray-50 px-4 py-2 text-center">
            <span className="text-xs text-gray-500">
              <i className="fas fa-ellipsis-h mr-1"></i>
              {game.lines.length - 3} more sportsbooks
            </span>
          </div>
        )}
      </div>

      {/* View details button */}
      <div className="p-4">
        <button
          onClick={() => onGameSelected?.(game)}
          className="w-full py-3 text-white font-medium rounded-lg transition-all hover:shadow-lg group relative"
          style={{
            background: metallicGradient,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <i className="fas fa-chart-bar mr-2"></i>
          View Arbitrage Details
          
          {/* Button tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-purple-600/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <div className="font-semibold">🔍 Detailed Analysis</div>
            <div className="text-purple-200">View complete arbitrage breakdown</div>
            <div className="text-yellow-300 font-medium">Calculate optimal bet amounts</div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600/95"></div>
          </div>
        </button>
      </div>
    </div>
  );

  // Empty state view
  const EmptyStateView = () => (
    <div className="text-center py-20">
      <i 
        className="text-6xl mb-6"
        style={{
          background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}
      >
        📊
      </i>
      
      <h3 
        className="text-xl font-bold mb-2"
        style={{
          background: 'linear-gradient(135deg, #1f2937, #374151)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        No arbitrage opportunities
      </h3>
      
      <p className="text-gray-600 mb-6 px-5">
        Try changing your filters or check back later
      </p>
      
      <button
        onClick={() => setFilterBy(0)}
        className="px-6 py-3 text-white font-medium rounded-lg transition-all hover:shadow-lg"
        style={{
          background: metallicGradient,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        Show All Games
      </button>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-0" style={{ backgroundColor }}>
      {/* Controls section */}
      <div className="px-1 pb-6">
        <ControlsSection />
      </div>

      {/* Summary section */}
      <div className="px-1 pb-5">
        <SummarySection />
      </div>

      {/* Games list */}
      {filteredGames.length === 0 ? (
        <EmptyStateView />
      ) : (
        <div className="space-y-4 px-1 pb-5">
          {filteredGames.map(game => (
            <ArbitrageGameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArbitrageView;