import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services';
import { BettingCalculations } from '../../utils';

const MiddlesView = ({ gameLines = [], teams = [] }) => {
  // State management
  const [minGap, setMinGap] = useState(3.0); // Minimum point gap for middles
  const [sortBy, setSortBy] = useState(0); // 0: gap size, 1: team, 2: middle probability
  const [sortOrder, setSortOrder] = useState(true); // true: descending
  const [betType, setBetType] = useState('spread'); // spread, total
  const [expandedMiddles, setExpandedMiddles] = useState(new Set());
  const [selectedMiddle, setSelectedMiddle] = useState(null);

  // Theme colors
  const accentColor = 'rgb(204, 0, 28)';
  const positiveColor = 'rgb(34, 197, 94)';
  const middleColor = 'rgb(139, 69, 19)'; // Brown for middles
  const profitColor = 'rgb(16, 185, 129)'; // Emerald for profit

  // Metallic gradient for middle indicators
  const middleGradient = `linear-gradient(135deg, 
    rgb(139, 69, 19), 
    rgb(180, 83, 9), 
    rgb(217, 119, 6), 
    rgb(180, 83, 9), 
    rgb(139, 69, 19)
  )`;

  // Helper function to generate middle opportunities
  const generateMiddleData = () => {
    const middleOpportunities = [];

    gameLines.forEach(game => {
      if (!game.lines || game.lines.length < 2) return;

      // Find middle opportunities for spreads
      if (betType === 'spread') {
        const spreads = game.lines
          .map(line => ({
            provider: line.provider,
            homeSpread: line.spread || 0,
            awaySpread: -(line.spread || 0),
            homeOdds: line.homeSpreadOdds || -110,
            awayOdds: line.awaySpreadOdds || -110
          }))
          .filter(line => line.homeSpread !== 0);

        // Compare all spread combinations
        for (let i = 0; i < spreads.length; i++) {
          for (let j = i + 1; j < spreads.length; j++) {
            const line1 = spreads[i];
            const line2 = spreads[j];

            // Check for middle opportunity
            const gap = Math.abs(line1.homeSpread - line2.homeSpread);
            
            if (gap >= minGap) {
              // Determine which side to bet on each book
              const betSide1 = line1.homeSpread > line2.homeSpread ? 'away' : 'home';
              const betSide2 = line1.homeSpread > line2.homeSpread ? 'home' : 'away';

              const middle = {
                id: `${game.id}-spread-${i}-${j}`,
                gameId: game.id,
                homeTeam: game.homeTeam,
                awayTeam: game.awayTeam,
                type: 'spread',
                gap: gap,
                book1: {
                  provider: line1.provider,
                  bet: betSide1 === 'home' ? `${game.homeTeam} ${line1.homeSpread}` : `${game.awayTeam} ${line1.awaySpread}`,
                  odds: betSide1 === 'home' ? line1.homeOdds : line1.awayOdds,
                  line: betSide1 === 'home' ? line1.homeSpread : line1.awaySpread
                },
                book2: {
                  provider: line2.provider,
                  bet: betSide2 === 'home' ? `${game.homeTeam} ${line2.homeSpread}` : `${game.awayTeam} ${line2.awaySpread}`,
                  odds: betSide2 === 'home' ? line2.homeOdds : line2.awayOdds,
                  line: betSide2 === 'home' ? line2.homeSpread : line2.awaySpread
                },
                middleRange: {
                  low: Math.min(Math.abs(line1.homeSpread), Math.abs(line2.homeSpread)),
                  high: Math.max(Math.abs(line1.homeSpread), Math.abs(line2.homeSpread))
                },
                estimatedProbability: calculateMiddleProbability(gap, 'spread'),
                maxLoss: 0, // Will be calculated
                maxProfit: 0 // Will be calculated
              };

              // Calculate potential profit/loss
              const result = calculateMiddleOutcome(middle);
              middle.maxLoss = result.maxLoss;
              middle.maxProfit = result.maxProfit;
              middle.roi = result.roi;

              middleOpportunities.push(middle);
            }
          }
        }
      }

      // Find middle opportunities for totals
      if (betType === 'total') {
        const totals = game.lines
          .map(line => ({
            provider: line.provider,
            total: line.overUnder || 0,
            overOdds: line.overOdds || -110,
            underOdds: line.underOdds || -110
          }))
          .filter(line => line.total > 0);

        // Compare all total combinations
        for (let i = 0; i < totals.length; i++) {
          for (let j = i + 1; j < totals.length; j++) {
            const line1 = totals[i];
            const line2 = totals[j];

            const gap = Math.abs(line1.total - line2.total);
            
            if (gap >= minGap) {
              // Determine which side to bet on each book
              const betSide1 = line1.total > line2.total ? 'under' : 'over';
              const betSide2 = line1.total > line2.total ? 'over' : 'under';

              const middle = {
                id: `${game.id}-total-${i}-${j}`,
                gameId: game.id,
                homeTeam: game.homeTeam,
                awayTeam: game.awayTeam,
                type: 'total',
                gap: gap,
                book1: {
                  provider: line1.provider,
                  bet: `${betSide1 === 'over' ? 'Over' : 'Under'} ${line1.total}`,
                  odds: betSide1 === 'over' ? line1.overOdds : line1.underOdds,
                  line: line1.total
                },
                book2: {
                  provider: line2.provider,
                  bet: `${betSide2 === 'over' ? 'Over' : 'Under'} ${line2.total}`,
                  odds: betSide2 === 'over' ? line2.overOdds : line2.underOdds,
                  line: line2.total
                },
                middleRange: {
                  low: Math.min(line1.total, line2.total),
                  high: Math.max(line1.total, line2.total)
                },
                estimatedProbability: calculateMiddleProbability(gap, 'total'),
                maxLoss: 0,
                maxProfit: 0
              };

              const result = calculateMiddleOutcome(middle);
              middle.maxLoss = result.maxLoss;
              middle.maxProfit = result.maxProfit;
              middle.roi = result.roi;

              middleOpportunities.push(middle);
            }
          }
        }
      }
    });

    return middleOpportunities;
  };

  // Calculate the probability of hitting the middle
  const calculateMiddleProbability = (gap, type) => {
    // Simplified probability model
    // Larger gaps = higher chance of middle hitting
    if (type === 'spread') {
      // For spreads, probability decreases exponentially with gap size
      return Math.min(25, Math.max(5, 20 - (gap * 2))); // 5-25% range
    } else {
      // For totals, similar but slightly different curve
      return Math.min(30, Math.max(8, 25 - (gap * 1.5))); // 8-30% range
    }
  };

  // Calculate potential outcomes
  const calculateMiddleOutcome = (middle) => {
    const stake = 100; // $100 per bet assumption
    
    const odds1Decimal = BettingCalculations.americanToDecimal(middle.book1.odds);
    const odds2Decimal = BettingCalculations.americanToDecimal(middle.book2.odds);
    
    if (!odds1Decimal || !odds2Decimal) {
      return { maxLoss: 0, maxProfit: 0, roi: 0 };
    }

    // Calculate outcomes
    const bet1Wins = (stake * odds1Decimal) - stake; // Profit from bet 1
    const bet2Wins = (stake * odds2Decimal) - stake; // Profit from bet 2
    const bet1Loses = -stake; // Loss from bet 1
    const bet2Loses = -stake; // Loss from bet 2

    // Scenario 1: Only bet 1 wins (bet 2 loses)
    const scenario1 = bet1Wins + bet2Loses;
    
    // Scenario 2: Only bet 2 wins (bet 1 loses)
    const scenario2 = bet2Wins + bet1Loses;
    
    // Scenario 3: Both bets win (middle hits!)
    const scenario3 = bet1Wins + bet2Wins;
    
    // Scenario 4: Both bets lose (push/void - rare)
    const scenario4 = 0;

    const maxLoss = Math.min(scenario1, scenario2, scenario3, scenario4);
    const maxProfit = Math.max(scenario1, scenario2, scenario3, scenario4);
    const roi = (maxProfit / (stake * 2)) * 100; // ROI based on total stake

    return { maxLoss, maxProfit, roi };
  };

  // Generate middle data
  const middleData = useMemo(() => generateMiddleData(), [gameLines, betType, minGap]);

  // Filtered middles
  const filteredMiddles = useMemo(() => {
    let filtered = [...middleData];

    // Sort middles
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 0: // Gap size
          comparison = b.gap - a.gap;
          break;
        case 1: // Team
          comparison = a.homeTeam.localeCompare(b.homeTeam);
          break;
        case 2: // Middle probability
          comparison = b.estimatedProbability - a.estimatedProbability;
          break;
        default:
          comparison = 0;
      }
      return sortOrder ? comparison : -comparison;
    });

    return filtered;
  }, [middleData, sortBy, sortOrder]);

  // Helper functions
  const getTeamLogo = (teamName) => {
    const team = teams.find(t => t.school?.toLowerCase() === teamName.toLowerCase());
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  const getSportsbookLogo = (provider) => {
    const logoMap = {
      'DraftKings': '/SportsbookLogos/Draftking.svg',
      'FanDuel': '/SportsbookLogos/fanduel.svg',
      'BetMGM': '/SportsbookLogos/betgmg.svg',
      'Caesars': '/SportsbookLogos/caesar.svg',
      'ESPN Bet': '/SportsbookLogos/espnbet.svg',
      'Bovada': '/SportsbookLogos/Bovada-Casino-Logo.svg'
    };
    return logoMap[provider] || null;
  };

  const formatOdds = (odds) => odds > 0 ? `+${odds}` : `${odds}`;

  const getProbabilityColor = (prob) => {
    if (prob >= 20) return profitColor;
    if (prob >= 15) return positiveColor;
    if (prob >= 10) return 'rgb(251, 146, 60)'; // Orange
    return 'rgb(156, 163, 175)'; // Gray
  };

  const getRoiColor = (roi) => {
    if (roi >= 50) return profitColor;
    if (roi >= 25) return positiveColor;
    if (roi >= 0) return 'rgb(251, 146, 60)';
    return 'rgb(239, 68, 68)'; // Red for negative
  };

  const toggleExpanded = (middleId) => {
    const newExpanded = new Set(expandedMiddles);
    if (newExpanded.has(middleId)) {
      newExpanded.delete(middleId);
    } else {
      newExpanded.add(middleId);
    }
    setExpandedMiddles(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: accentColor }}>
          Middle Bet Finder
        </h2>
        <p className="text-gray-600 text-lg">
          Find profitable middle opportunities where both bets can win simultaneously
        </p>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold" style={{ color: middleColor }}>
              {filteredMiddles.length}
            </div>
            <div className="text-sm text-gray-600">Available Middles</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredMiddles.filter(m => m.estimatedProbability >= 15).length}
            </div>
            <div className="text-sm text-gray-600">High Probability</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-orange-600">
              {filteredMiddles.filter(m => m.gap >= 7).length}
            </div>
            <div className="text-sm text-gray-600">Large Gaps</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {filteredMiddles.length > 0 ? Math.max(...filteredMiddles.map(m => m.estimatedProbability)).toFixed(1) : '0.0'}%
            </div>
            <div className="text-sm text-gray-600">Best Probability</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Bet Type */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Bet Type:</label>
            <select
              value={betType}
              onChange={(e) => setBetType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="spread">Point Spreads</option>
              <option value="total">Over/Under Totals</option>
            </select>
          </div>

          {/* Minimum Gap */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Min Gap:</label>
            <select
              value={minGap}
              onChange={(e) => setMinGap(parseFloat(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value={2}>2 points</option>
              <option value={3}>3 points</option>
              <option value={4}>4 points</option>
              <option value={5}>5 points</option>
              <option value={6}>6+ points</option>
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
              <option value={0}>Gap Size</option>
              <option value={1}>Team</option>
              <option value={2}>Middle Probability</option>
            </select>
            <button
              onClick={() => setSortOrder(!sortOrder)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className={`fas fa-sort-${sortOrder ? 'down' : 'up'} text-gray-600`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Middles List */}
      <div className="space-y-4">
        {filteredMiddles.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-target text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Middle Opportunities Found</h3>
            <p className="text-gray-500">Try adjusting your filters or selecting a different bet type</p>
          </div>
        ) : (
          filteredMiddles.map(middle => (
            <div
              key={middle.id}
              className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  {/* Left side - Game and middle info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      {/* Team logos */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                          <img
                            src={getTeamLogo(middle.awayTeam)}
                            alt={middle.awayTeam}
                            className="w-6 h-6 object-contain"
                            onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                          />
                        </div>
                        <span className="text-gray-400 font-medium">@</span>
                        <div className="w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                          <img
                            src={getTeamLogo(middle.homeTeam)}
                            alt={middle.homeTeam}
                            className="w-6 h-6 object-contain"
                            onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                          />
                        </div>
                      </div>

                      {/* Middle badge */}
                      <span 
                        className="px-3 py-1 text-white text-xs font-bold rounded-full flex items-center"
                        style={{ background: middleGradient }}
                      >
                        <i className="fas fa-arrows-alt-v mr-1"></i>
                        {middle.gap} POINT MIDDLE
                      </span>

                      {/* Type badge */}
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                        {middle.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {/* Bet 1 */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-5 h-5 bg-white/90 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                            <img
                              src={getSportsbookLogo(middle.book1.provider)}
                              alt={middle.book1.provider}
                              className="w-4 h-4 object-contain"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{middle.book1.provider}</span>
                        </div>
                        <div className="font-bold text-gray-800">{middle.book1.bet}</div>
                        <div className="text-sm text-gray-600">{formatOdds(middle.book1.odds)}</div>
                      </div>

                      {/* Bet 2 */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-5 h-5 bg-white/90 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                            <img
                              src={getSportsbookLogo(middle.book2.provider)}
                              alt={middle.book2.provider}
                              className="w-4 h-4 object-contain"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{middle.book2.provider}</span>
                        </div>
                        <div className="font-bold text-gray-800">{middle.book2.bet}</div>
                        <div className="text-sm text-gray-600">{formatOdds(middle.book2.odds)}</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Middle Range:</strong> {middle.type === 'spread' ? 
                        `Win by ${middle.middleRange.low + 1} to ${middle.middleRange.high} points` :
                        `Total between ${middle.middleRange.low + 0.5} and ${middle.middleRange.high - 0.5}`
                      }
                    </div>
                  </div>

                  {/* Right side - Stats */}
                  <div className="text-right">
                    <div className="mb-2">
                      <div className="text-sm text-gray-500">Middle Probability</div>
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: getProbabilityColor(middle.estimatedProbability) }}
                      >
                        {middle.estimatedProbability.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-sm text-gray-500">Max Profit</div>
                      <div className="text-lg font-bold text-green-600">
                        ${Math.abs(middle.maxProfit).toFixed(0)}
                      </div>
                    </div>

                    <div 
                      className="inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-bold"
                      style={{ backgroundColor: getRoiColor(middle.roi) }}
                    >
                      {middle.roi.toFixed(1)}% ROI
                    </div>
                  </div>
                </div>

                {/* Expandable details */}
                <button
                  onClick={() => toggleExpanded(middle.id)}
                  className="mt-4 w-full flex items-center justify-center py-2 border-t border-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span className="text-sm font-medium mr-2">
                    {expandedMiddles.has(middle.id) ? 'Hide Analysis' : 'Show Analysis'}
                  </span>
                  <i className={`fas fa-chevron-${expandedMiddles.has(middle.id) ? 'up' : 'down'} text-xs`}></i>
                </button>

                {expandedMiddles.has(middle.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Scenario Analysis</div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Only Bet 1 Wins: ${(middle.maxLoss).toFixed(0)}</div>
                          <div>Only Bet 2 Wins: ${(middle.maxLoss).toFixed(0)}</div>
                          <div className="text-green-600 font-bold">Both Bets Win: ${middle.maxProfit.toFixed(0)}</div>
                          <div>Both Bets Push: $0</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Risk Assessment</div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Maximum Loss: ${Math.abs(middle.maxLoss).toFixed(0)}</div>
                          <div>Maximum Profit: ${middle.maxProfit.toFixed(0)}</div>
                          <div>Risk/Reward: 1:{(middle.maxProfit / Math.abs(middle.maxLoss)).toFixed(2)}</div>
                          <div>Expected ROI: {middle.roi.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Strategy Notes</div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Gap Size: {middle.gap} points</div>
                          <div>Hit Probability: {middle.estimatedProbability.toFixed(1)}%</div>
                          <div>Bet Type: {middle.type === 'spread' ? 'Point Spread' : 'Total Points'}</div>
                          <div className={middle.estimatedProbability >= 15 ? 'text-green-600 font-bold' : ''}>
                            {middle.estimatedProbability >= 15 ? 'High Value Opportunity' : 'Standard Middle'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <i className="fas fa-lightbulb text-yellow-600 mt-1"></i>
                        <div>
                          <div className="font-bold text-yellow-800 text-sm">Middle Strategy</div>
                          <div className="text-yellow-700 text-xs mt-1">
                            Place equal stakes on both bets. Worst case: lose the vig (~{Math.abs(middle.maxLoss).toFixed(0)}). 
                            Best case: both bets win for ${middle.maxProfit.toFixed(0)} profit. 
                            The {middle.estimatedProbability.toFixed(1)}% chance of hitting the middle makes this 
                            {middle.estimatedProbability >= 15 ? ' a high-value' : ' a standard'} opportunity.
                          </div>
                        </div>
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
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-8">
        <div className="flex items-start space-x-3">
          <i className="fas fa-graduation-cap text-purple-500 mt-1"></i>
          <div>
            <h4 className="font-bold text-purple-800 mb-1 flex items-center">
              <i className="fas fa-target mr-2"></i>
              Understanding Middles
            </h4>
            <p className="text-purple-700 text-sm">
              A middle occurs when you bet both sides of a game at different sportsbooks, hoping the final 
              result falls between your two bets. This allows both bets to win simultaneously. Look for 
              gaps of 4+ points with 15%+ hit probability for the best opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiddlesView;
