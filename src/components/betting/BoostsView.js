import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services';
import { BettingCalculations } from '../../utils';

const BoostsView = ({ gameLines = [], teams = [] }) => {
  // State management
  const [minEV, setMinEV] = useState(5.0); // Higher threshold for boosts
  const [sortBy, setSortBy] = useState(0); // 0: ev, 1: team, 2: boost value
  const [sortOrder, setSortOrder] = useState(true); // true: descending
  const [selectedSportsbooks, setSelectedSportsbooks] = useState(new Set(['all']));
  const [expandedBoosts, setExpandedBoosts] = useState(new Set());

  // Theme colors
  const accentColor = 'rgb(204, 0, 28)';
  const positiveColor = 'rgb(34, 197, 94)';
  const boostColor = 'rgb(250, 204, 21)'; // Gold for boosts
  const highBoostColor = 'rgb(239, 68, 68)'; // Red for high value boosts

  // Metallic gradient for boost indicators
  const boostGradient = `linear-gradient(135deg, 
    rgb(250, 204, 21), 
    rgb(245, 158, 11), 
    rgb(217, 119, 6), 
    rgb(245, 158, 11), 
    rgb(250, 204, 21)
  )`;

  // Helper function to generate mock boost data
  const generateBoostData = () => {
    const boostTypes = [
      'Moneyline Boost', 'Touchdown Scorer Boost', 'Over/Under Boost', 
      'Same Game Parlay Boost', 'First Half Boost', 'Player Props Boost'
    ];
    
    const sportsbooks = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'ESPN Bet', 'Bovada'];
    
    return gameLines.flatMap(game => {
      // Generate 1-3 boosts per game
      const numBoosts = Math.floor(Math.random() * 3) + 1;
      
      return Array.from({ length: numBoosts }, (_, i) => {
        const boostType = boostTypes[Math.floor(Math.random() * boostTypes.length)];
        const sportsbook = sportsbooks[Math.floor(Math.random() * sportsbooks.length)];
        const originalOdds = -110 + Math.floor(Math.random() * 220); // -110 to +110
        const boostMultiplier = 1.2 + Math.random() * 0.8; // 1.2x to 2.0x boost
        const boostedOdds = Math.round(originalOdds * boostMultiplier);
        
        // Calculate EV based on boost value
        const ev = BettingCalculations.calculateEV(boostedOdds, originalOdds) || 0;
        
        return {
          id: `${game.id}-boost-${i}`,
          gameId: game.id,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          sportsbook,
          boostType,
          description: generateBoostDescription(game, boostType),
          originalOdds,
          boostedOdds,
          boostValue: Math.round((boostMultiplier - 1) * 100), // Percentage boost
          estimatedEV: Math.max(ev, 0),
          maxStake: 25 + Math.floor(Math.random() * 475), // $25-$500
          timeRemaining: Math.floor(Math.random() * 72) + 1, // 1-72 hours
          isPopular: Math.random() > 0.7,
          isLimitedTime: Math.random() > 0.6
        };
      });
    }).filter(boost => boost.estimatedEV >= minEV);
  };

  const generateBoostDescription = (game, boostType) => {
    const descriptions = {
      'Moneyline Boost': `${game.homeTeam} to Win - BOOSTED`,
      'Touchdown Scorer Boost': `${game.homeTeam} QB Anytime TD - BOOSTED`,
      'Over/Under Boost': `${game.homeTeam} vs ${game.awayTeam} Over 45.5 - BOOSTED`,
      'Same Game Parlay Boost': `${game.homeTeam} to Win + Over 45.5 - BOOSTED`,
      'First Half Boost': `${game.homeTeam} First Half ML - BOOSTED`,
      'Player Props Boost': `${game.homeTeam} RB Over 75.5 Rush Yards - BOOSTED`
    };
    return descriptions[boostType] || `${game.homeTeam} Special Boost`;
  };

  // Generate boost data
  const boostData = useMemo(() => generateBoostData(), [gameLines, minEV]);

  // Filtered boosts
  const filteredBoosts = useMemo(() => {
    let filtered = [...boostData];

    // Filter by selected sportsbooks
    if (!selectedSportsbooks.has('all')) {
      filtered = filtered.filter(boost => selectedSportsbooks.has(boost.sportsbook));
    }

    // Sort boosts
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 0: // EV
          comparison = b.estimatedEV - a.estimatedEV;
          break;
        case 1: // Team
          comparison = a.homeTeam.localeCompare(b.homeTeam);
          break;
        case 2: // Boost Value
          comparison = b.boostValue - a.boostValue;
          break;
        default:
          comparison = 0;
      }
      return sortOrder ? comparison : -comparison;
    });

    return filtered;
  }, [boostData, selectedSportsbooks, sortBy, sortOrder]);

  // Helper functions
  const getTeamLogo = (teamName) => {
    const team = teams.find(t => t.school?.toLowerCase() === teamName.toLowerCase());
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  const getSportsbookLogo = (sportsbook) => {
    const logoMap = {
      'DraftKings': '/SportsbookLogos/Draftking.svg',
      'FanDuel': '/SportsbookLogos/fanduel.svg',
      'BetMGM': '/SportsbookLogos/betgmg.svg',
      'Caesars': '/SportsbookLogos/caesar.svg',
      'ESPN Bet': '/SportsbookLogos/espnbet.svg',
      'Bovada': '/SportsbookLogos/Bovada-Casino-Logo.svg'
    };
    return logoMap[sportsbook] || null;
  };

  const formatOdds = (odds) => odds > 0 ? `+${odds}` : `${odds}`;

  const getEVColor = (ev) => {
    if (ev >= 15) return highBoostColor;
    if (ev >= 10) return boostColor;
    if (ev >= 5) return positiveColor;
    return 'rgb(156, 163, 175)';
  };

  const getTimeRemainingColor = (hours) => {
    if (hours <= 6) return 'text-red-600';
    if (hours <= 24) return 'text-orange-600';
    return 'text-gray-600';
  };

  const formatTimeRemaining = (hours) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const toggleExpanded = (boostId) => {
    const newExpanded = new Set(expandedBoosts);
    if (newExpanded.has(boostId)) {
      newExpanded.delete(boostId);
    } else {
      newExpanded.add(boostId);
    }
    setExpandedBoosts(newExpanded);
  };

  const toggleSportsbook = (sportsbook) => {
    const newSelected = new Set(selectedSportsbooks);
    if (sportsbook === 'all') {
      newSelected.clear();
      newSelected.add('all');
    } else {
      newSelected.delete('all');
      if (newSelected.has(sportsbook)) {
        newSelected.delete(sportsbook);
        if (newSelected.size === 0) {
          newSelected.add('all');
        }
      } else {
        newSelected.add(sportsbook);
      }
    }
    setSelectedSportsbooks(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: accentColor }}>
          Odds Boosts Hunter
        </h2>
        <p className="text-gray-600 text-lg">
          Find the most valuable odds boosts across all major sportsbooks
        </p>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold" style={{ color: boostColor }}>
              {filteredBoosts.length}
            </div>
            <div className="text-sm text-gray-600">Active Boosts</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredBoosts.filter(b => b.estimatedEV >= 10).length}
            </div>
            <div className="text-sm text-gray-600">High Value</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-orange-600">
              {filteredBoosts.filter(b => b.timeRemaining <= 24).length}
            </div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {filteredBoosts.length > 0 ? Math.max(...filteredBoosts.map(b => b.estimatedEV)).toFixed(1) : '0.0'}%
            </div>
            <div className="text-sm text-gray-600">Best EV</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* EV Threshold */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Min EV:</label>
            <select
              value={minEV}
              onChange={(e) => setMinEV(parseFloat(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value={0}>0%</option>
              <option value={5}>5%</option>
              <option value={10}>10%</option>
              <option value={15}>15%</option>
              <option value={20}>20%</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value={0}>Expected Value</option>
              <option value={1}>Team</option>
              <option value={2}>Boost Percentage</option>
            </select>
            <button
              onClick={() => setSortOrder(!sortOrder)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className={`fas fa-sort-${sortOrder ? 'down' : 'up'} text-gray-600`}></i>
            </button>
          </div>
        </div>

        {/* Sportsbook Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'ESPN Bet', 'Bovada'].map(book => (
            <button
              key={book}
              onClick={() => toggleSportsbook(book)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedSportsbooks.has(book)
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              } border`}
            >
              {book === 'all' ? 'All Sportsbooks' : book}
            </button>
          ))}
        </div>
      </div>

      {/* Boosts List */}
      <div className="space-y-4">
        {filteredBoosts.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Boosts Found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new boosts</p>
          </div>
        ) : (
          filteredBoosts.map(boost => (
            <div
              key={boost.id}
              className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  {/* Left side - Game and boost info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      {/* Team logos */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                          <img
                            src={getTeamLogo(boost.awayTeam)}
                            alt={boost.awayTeam}
                            className="w-6 h-6 object-contain"
                            onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                          />
                        </div>
                        <span className="text-gray-400 font-medium">@</span>
                        <div className="w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                          <img
                            src={getTeamLogo(boost.homeTeam)}
                            alt={boost.homeTeam}
                            className="w-6 h-6 object-contain"
                            onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                          />
                        </div>
                      </div>

                      {/* Boost badges */}
                      <div className="flex items-center space-x-2">
                        {boost.isPopular && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center">
                            <i className="fas fa-fire mr-1"></i>
                            POPULAR
                          </span>
                        )}
                        {boost.isLimitedTime && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center">
                            <i className="fas fa-clock mr-1"></i>
                            LIMITED
                          </span>
                        )}
                        <span 
                          className="px-2 py-1 text-white text-xs font-bold rounded-full flex items-center"
                          style={{ background: boostGradient }}
                        >
                          <i className="fas fa-arrow-up mr-1"></i>
                          +{boost.boostValue}% BOOST
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {boost.description}
                    </h3>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-white/90 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                          <img
                            src={getSportsbookLogo(boost.sportsbook)}
                            alt={boost.sportsbook}
                            className="w-4 h-4 object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <span className="font-medium">{boost.sportsbook}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-coins text-yellow-600"></i>
                        <span>Max Stake: ${boost.maxStake}</span>
                      </div>
                      <div className={`font-medium flex items-center space-x-1 ${getTimeRemainingColor(boost.timeRemaining)}`}>
                        <i className="fas fa-hourglass-half"></i>
                        <span>Expires in {formatTimeRemaining(boost.timeRemaining)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Odds and EV */}
                  <div className="text-right">
                    <div className="mb-2">
                      <div className="text-sm text-gray-500 line-through">
                        Was {formatOdds(boost.originalOdds)}
                      </div>
                      <div className="text-2xl font-bold" style={{ color: boostColor }}>
                        {formatOdds(boost.boostedOdds)}
                      </div>
                    </div>
                    
                    <div 
                      className="inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-bold"
                      style={{ background: `linear-gradient(135deg, ${getEVColor(boost.estimatedEV)}, ${getEVColor(boost.estimatedEV)}dd)` }}
                    >
                      {boost.estimatedEV.toFixed(1)}% EV
                    </div>
                  </div>
                </div>

                {/* Expandable details */}
                <button
                  onClick={() => toggleExpanded(boost.id)}
                  className="mt-4 w-full flex items-center justify-center py-2 border-t border-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span className="text-sm font-medium mr-2">
                    {expandedBoosts.has(boost.id) ? 'Hide Details' : 'Show Details'}
                  </span>
                  <i className={`fas fa-chevron-${expandedBoosts.has(boost.id) ? 'up' : 'down'} text-xs`}></i>
                </button>

                {expandedBoosts.has(boost.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700 mb-2">Boost Analysis</div>
                      <div className="space-y-1 text-gray-600">
                        <div>Original Odds: {formatOdds(boost.originalOdds)}</div>
                        <div>Boosted Odds: {formatOdds(boost.boostedOdds)}</div>
                        <div>Boost Value: +{boost.boostValue}%</div>
                        <div>Estimated EV: {boost.estimatedEV.toFixed(2)}%</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 mb-2">Betting Info</div>
                      <div className="space-y-1 text-gray-600">
                        <div>Bet Type: {boost.boostType}</div>
                        <div>Maximum Stake: ${boost.maxStake}</div>
                        <div>Sportsbook: {boost.sportsbook}</div>
                        <div>Time Remaining: {formatTimeRemaining(boost.timeRemaining)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-8">
        <div className="flex items-start space-x-3">
          <i className="fas fa-lightbulb text-blue-500 mt-1"></i>
          <div>
            <h4 className="font-bold text-blue-800 mb-1 flex items-center">
              <i className="fas fa-rocket mr-2"></i>
              Pro Tip: Boost Hunting Strategy
            </h4>
            <p className="text-blue-700 text-sm">
              Focus on boosts with 10%+ EV and reasonable maximum stakes. Sportsbooks often offer these 
              as loss leaders to attract customers, creating genuine value opportunities for smart bettors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoostsView;
