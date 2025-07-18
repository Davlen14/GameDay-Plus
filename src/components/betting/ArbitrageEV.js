import React, { useState, useEffect } from 'react';
import { bettingService, gameService, teamService } from '../../services';
import { BettingCalculations } from '../../utils';
import ArbitrageView from './ArbitrageView';
import ArbitrageModal from './ArbitrageModal';
import EVBettingView from './EVBettingView';
import BoostsView from './BoostsView';
import MiddlesView from './MiddlesView';

const ArbitrageEV = () => {
  // State management
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showArbitrageModal, setShowArbitrageModal] = useState(false);

  // API Data States
  const [gameLines, setGameLines] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Theme colors using the red gradient
  const gradientStart = 'rgb(204,0,28)';
  const gradientEnd = 'rgb(115,0,13)';
  const accentColor = 'rgb(204,0,28)';

  // Metallic gradient CSS - matching EVBettingView
  const metallicGradient = `linear-gradient(135deg, 
    rgb(255, 46, 74), 
    rgb(204, 0, 28), 
    rgb(161, 0, 20), 
    rgb(204, 0, 28), 
    rgb(255, 46, 74)
  )`;

  // Sportsbook data for the slider
  const sportsbooks = [
    { name: 'Underdog', logo: '/SportsbookLogos/underdog.svg' },
    { name: 'ESPN Bet', logo: '/SportsbookLogos/espnbet.svg' },
    { name: 'DraftKings', logo: '/SportsbookLogos/Draftking.svg' },
    { name: 'Caesars', logo: '/SportsbookLogos/caesar.svg' },
    { name: 'Bovada', logo: '/SportsbookLogos/Bovada-Casino-Logo.svg' },
    { name: 'BetMGM', logo: '/SportsbookLogos/betgmg.svg' },
    { name: 'Bet365', logo: '/SportsbookLogos/bet365.svg' }
  ];

  // Tab options
  const tabs = ['EV+', 'Arbitrage', 'Boosts', 'Middles'];
  const tabIcons = ['fas fa-chart-line', 'fas fa-exchange-alt', 'fas fa-arrow-up', 'fas fa-arrows-alt-v'];

  // Helper functions
  const calculateSimpleArbitrage = (lines) => {
    if (!lines || lines.length < 2) {
      return { hasArbitrage: false, bestProfit: 0, bestCombination: null };
    }

    // Get moneyline odds for all providers
    const homeOdds = lines.map(l => l.moneylineHome).filter(o => o && o !== 0 && !isNaN(o));
    const awayOdds = lines.map(l => l.moneylineAway).filter(o => o && o !== 0 && !isNaN(o));
    
    if (homeOdds.length === 0 || awayOdds.length === 0) {
      return { hasArbitrage: false, bestProfit: 0, bestCombination: null };
    }

    // For arbitrage, we want the BEST odds for each side (most profitable)
    // For positive odds, higher is better
    // For negative odds, closer to 0 is better (less negative is better)
    const bestHomeOdds = homeOdds.reduce((best, current) => {
      if (current > 0 && best > 0) return Math.max(best, current);
      if (current < 0 && best < 0) return Math.max(best, current); // closer to 0
      if (current > 0 && best < 0) return current; // positive is better than negative
      if (current < 0 && best > 0) return best; // positive is better than negative
      return best;
    });

    const bestAwayOdds = awayOdds.reduce((best, current) => {
      if (current > 0 && best > 0) return Math.max(best, current);
      if (current < 0 && best < 0) return Math.max(best, current); // closer to 0
      if (current > 0 && best < 0) return current; // positive is better than negative
      if (current < 0 && best > 0) return best; // positive is better than negative
      return best;
    });

    // Convert to implied probabilities
    const homeImplied = BettingCalculations.americanToImpliedProbability(bestHomeOdds) / 100;
    const awayImplied = BettingCalculations.americanToImpliedProbability(bestAwayOdds) / 100;
    
    // Check for arbitrage opportunity
    const totalImplied = homeImplied + awayImplied;
    const hasArbitrage = totalImplied < 1.0;
    const profit = hasArbitrage ? ((1 / totalImplied) - 1) * 100 : 0;

    const bestCombination = hasArbitrage ? {
      type: 'moneyline',
      homeBet: { 
        provider: lines.find(l => l.moneylineHome === bestHomeOdds)?.provider || 'Unknown', 
        odds: bestHomeOdds, 
        stake: (1 / totalImplied) * homeImplied * 100 
      },
      awayBet: { 
        provider: lines.find(l => l.moneylineAway === bestAwayOdds)?.provider || 'Unknown', 
        odds: bestAwayOdds, 
        stake: (1 / totalImplied) * awayImplied * 100 
      }
    } : null;

    return {
      hasArbitrage,
      bestProfit: profit,
      bestCombination
    };
  };

  const processRestAPILines = (restLines) => {
    if (!restLines || restLines.length === 0) return [];
    
    console.log('Processing REST API lines:', restLines.length, 'games');
    
    // Filter for FBS games only and games with lines
    const fbsGames = restLines.filter(game => 
      game.homeClassification === 'fbs' && 
      game.awayClassification === 'fbs' &&
      game.lines && 
      game.lines.length > 0
    );
    
    console.log('FBS games with lines:', fbsGames.length);
    
    // Process each game
    const processedGames = fbsGames.map(gameData => {
      // Map the lines data correctly
      const processedLines = gameData.lines.map(line => ({
        provider: line.provider || 'Unknown',
        moneylineHome: line.homeMoneyline,
        moneylineAway: line.awayMoneyline,
        homeMoneyline: line.homeMoneyline,  // Add this mapping for ArbitrageView
        awayMoneyline: line.awayMoneyline,  // Add this mapping for ArbitrageView
        spread: line.spread,
        overUnder: line.overUnder
      })).filter(line => 
        // Filter out lines with missing moneyline data
        line.homeMoneyline !== null && line.awayMoneyline !== null &&
        line.homeMoneyline !== undefined && line.awayMoneyline !== undefined &&
        !isNaN(line.homeMoneyline) && !isNaN(line.awayMoneyline) &&
        line.homeMoneyline !== 0 && line.awayMoneyline !== 0
      );
      
      console.log(`Game ${gameData.homeTeam} vs ${gameData.awayTeam}: ${gameData.lines.length} total lines, ${processedLines.length} valid lines`);
      
      // Only process games with at least 2 valid moneylines for arbitrage
      if (processedLines.length >= 2) {
        const arbitrageData = calculateSimpleArbitrage(processedLines);
        console.log(`Arbitrage result for ${gameData.homeTeam} vs ${gameData.awayTeam}:`, arbitrageData);
        
        return {
          id: gameData.id,
          homeTeam: gameData.homeTeam,
          awayTeam: gameData.awayTeam,
          week: gameData.week,
          lines: processedLines,
          ...arbitrageData
        };
      }
      
      return null;
    }).filter(Boolean); // Remove null entries

    console.log('Processed games with arbitrage data:', processedGames.length);
    console.log('Games with arbitrage:', processedGames.filter(g => g.hasArbitrage).length);
    return processedGames;
  };

  // Data processing functions - defined before useMemo hooks
  const getArbitrageGames = React.useCallback(() => {
    // Return the actual processed games from REST API
    if (!gameLines || gameLines.length === 0) {
      return [];
    }
    
    // Filter to only return games that have arbitrage opportunities or at least multiple lines
    return gameLines.filter(game => game.lines && game.lines.length >= 2);
  }, [gameLines, selectedWeek]);

  const getEVGames = React.useCallback(() => {
    // GraphQL service already returns processed games, so work with gameLines directly
    if (!gameLines || gameLines.length === 0) {
      // Return mock data for demo purposes if no real data available
      return [
        {
          id: 'mock-1',
          homeTeam: 'Georgia',
          awayTeam: 'Alabama',
          week: selectedWeek,
          lines: [
            {
              provider: 'DraftKings',
              homeMoneyline: -150,
              awayMoneyline: 130,
              spread: -3.5,
              overUnder: 52.5
            },
            {
              provider: 'Bovada',
              homeMoneyline: -145,
              awayMoneyline: 125,
              spread: -3,
              overUnder: 53
            }
          ],
          maxEV: 3.2
        },
        {
          id: 'mock-2',
          homeTeam: 'Ohio State',
          awayTeam: 'Michigan',
          week: selectedWeek,
          lines: [
            {
              provider: 'ESPN Bet',
              homeMoneyline: -200,
              awayMoneyline: 175,
              spread: -6,
              overUnder: 48.5
            },
            {
              provider: 'DraftKings',
              homeMoneyline: -190,
              awayMoneyline: 165,
              spread: -5.5,
              overUnder: 49
            }
          ],
          maxEV: 2.8
        }
      ];
    }
    
    return gameLines.map(game => {
      const validLines = game.lines.filter(line => 
        line.moneylineHome && line.moneylineAway
      );

      if (validLines.length === 0) return null;

      // Calculate fair odds using market average
      const homeOdds = validLines.map(l => l.moneylineHome).filter(o => o > 0);
      const awayOdds = validLines.map(l => l.moneylineAway).filter(o => o > 0);
      
      const avgHomeOdds = homeOdds.length ? Math.round(homeOdds.reduce((sum, o) => sum + o, 0) / homeOdds.length) : 0;
      const avgAwayOdds = awayOdds.length ? Math.round(awayOdds.reduce((sum, o) => sum + o, 0) / awayOdds.length) : 0;
      
      // Find best odds for EV calculation
      const bestHomeOdds = Math.max(...homeOdds, 0);
      const bestAwayOdds = Math.max(...awayOdds, 0);
      
      const homeEV = BettingCalculations.calculateEV(bestHomeOdds, avgHomeOdds) || 0;
      const awayEV = BettingCalculations.calculateEV(bestAwayOdds, avgAwayOdds) || 0;
      const maxEV = Math.max(homeEV, awayEV);

      return {
        id: game.id,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        week: game.week,
        lines: validLines.map(line => ({
          provider: line.provider,
          homeMoneyline: line.moneylineHome,
          awayMoneyline: line.moneylineAway,
          spread: line.spread,
          overUnder: line.overUnder
        })),
        maxEV: Math.max(maxEV, 0)
      };
    }).filter(Boolean);
  }, [gameLines, selectedWeek]);

  // Computed stats - now after function definitions
  const arbitrageStats = React.useMemo(() => {
    const games = getArbitrageGames();
    const arbitrageGames = games.filter(g => g.hasArbitrage);
    const bestProfit = arbitrageGames.reduce((max, g) => Math.max(max, g.bestProfit), 0);
    
    return {
      gameCount: games.length,
      withArbitrageCount: arbitrageGames.length,
      bestProfit
    };
  }, [getArbitrageGames]);

  const evStats = React.useMemo(() => {
    const evGames = getEVGames();
    const evValues = evGames.map(g => g.maxEV);
    const avgEV = evValues.length ? evValues.reduce((sum, ev) => sum + ev, 0) / evValues.length : 0;
    const bestEV = Math.max(...evValues, 0);
    
    return {
      betCount: evGames.length,
      avgEV,
      bestEV
    };
  }, [getEVGames]);

  const boostsStats = React.useMemo(() => {
    // Mock stats for boosts - would be calculated from real boost data
    return {
      boostCount: 23,
      avgBoostValue: 35,
      bestEV: 18.5
    };
  }, []);

  const middlesStats = React.useMemo(() => {
    // Mock stats for middles - would be calculated from real middle data
    return {
      middleCount: 12,
      avgGap: 4.2,
      bestProbability: 22.3
    };
  }, []);

  // Data fetching functions
  const fetchBettingLines = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Fetch teams if not already loaded
      if (teams.length === 0) {
        const fbsTeams = await teamService.getAllTeams();
        setTeams(fbsTeams || []);
      }

      // Use REST API as primary method
      let lines = [];
      
      try {
        const currentYear = 2024; // Using 2024 data as specified
        console.log('Fetching betting lines for year:', currentYear, 'week:', selectedWeek);
        const restLines = await bettingService.getBettingLines(null, currentYear, selectedWeek, 'regular');
        
        // Convert REST format to expected format
        lines = processRestAPILines(restLines || []);
        console.log('REST API response:', lines);
      } catch (restError) {
        console.error('REST API failed:', restError);
        throw new Error('Unable to fetch betting data from REST API');
      }
      
      setGameLines(lines || []);
      setIsLoading(false);
    } catch (error) {
      console.error('fetchBettingLines error:', error);
      setErrorMessage(`Failed to load betting lines: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Load data on component mount and week change
  useEffect(() => {
    fetchBettingLines();
  }, [selectedWeek]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading timeout reached, stopping loading state');
        setIsLoading(false);
        if (!errorMessage && gameLines.length === 0) {
          setErrorMessage('Request timed out. Using demo data.');
        }
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [isLoading, errorMessage, gameLines.length]);

  // Sportsbook Slider Component - Full Width
  const SportsbookSlider = () => (
    <div 
      className="overflow-hidden py-8 mb-12"
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        position: 'relative'
      }}
    >
      <div className="flex animate-scroll">
        {/* First set of sportsbooks */}
        {sportsbooks.map((book, index) => (
          <div 
            key={`first-${index}`}
            className="flex-shrink-0 mx-6 group cursor-pointer"
          >
            <div className="relative bg-white/80 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-w-[200px]">
              {/* Glassy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-transparent rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white/90 rounded-xl shadow-sm">
                  <img 
                    src={book.logo} 
                    alt={book.name}
                    className="w-12 h-12 object-contain filter drop-shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {book.name.substring(0, 2)}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{book.name}</h3>
                <p className="text-xs text-gray-600">Compare Odds</p>
              </div>
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-2xl"></div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Duplicate set for seamless loop */}
        {sportsbooks.map((book, index) => (
          <div 
            key={`second-${index}`}
            className="flex-shrink-0 mx-6 group cursor-pointer"
          >
            <div className="relative bg-white/80 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-w-[200px]">
              {/* Glassy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-transparent rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white/90 rounded-xl shadow-sm">
                  <img 
                    src={book.logo} 
                    alt={book.name}
                    className="w-12 h-12 object-contain filter drop-shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {book.name.substring(0, 2)}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{book.name}</h3>
                <p className="text-xs text-gray-600">Compare Odds</p>
              </div>
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-2xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Component sections
  const LoadingView = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"></div>
      <p className="mt-4 text-gray-600">Loading betting lines...</p>
    </div>
  );

  const ErrorView = ({ message }) => (
    <div className="text-center py-20">
      <i className="fas fa-exclamation-triangle text-5xl text-orange-500 mb-4"></i>
      <h3 className="text-xl font-bold mb-2">Error</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={fetchBettingLines}
        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
      >
        Retry
      </button>
    </div>
  );

  const NoDataView = () => (
    <div className="text-center py-20">
      <i className="fas fa-chart-line text-5xl text-gray-400 mb-4"></i>
      <h3 className="text-xl font-bold mb-2">No Betting Lines Available</h3>
      <p className="text-gray-600 mb-6">Try selecting a different week or check back later</p>
      <button
        onClick={fetchBettingLines}
        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
      >
        Refresh
      </button>
    </div>
  );

  const StatsSummary = () => (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {selectedTab === 0 ? (
        // EV Stats
        <>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-list text-red-600 mr-2"></i>
              <span className="text-sm text-gray-600">Available Bets</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{evStats.betCount}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-chart-bar text-green-600 mr-2"></i>
              <span className="text-sm text-gray-600">Average EV</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{evStats.avgEV.toFixed(1)}%</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-star text-yellow-600 mr-2"></i>
              <span className="text-sm text-gray-600">Best EV</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{evStats.bestEV.toFixed(1)}%</div>
          </div>
        </>
      ) : selectedTab === 1 ? (
        // Arbitrage Stats
        <>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-chart-line text-red-600 mr-2"></i>
              <span className="text-sm text-gray-600">Arbitrage Games</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{arbitrageStats.withArbitrageCount}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-exchange-alt text-green-600 mr-2"></i>
              <span className="text-sm text-gray-600">Profit %</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {arbitrageStats.withArbitrageCount > 0 ? arbitrageStats.bestProfit.toFixed(1) : '0.0'}%
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-trophy text-yellow-600 mr-2"></i>
              <span className="text-sm text-gray-600">Best Profit</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{arbitrageStats.bestProfit.toFixed(1)}%</div>
          </div>
        </>
      ) : selectedTab === 2 ? (
        // Boosts Stats
        <>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-arrow-up text-yellow-600 mr-2"></i>
              <span className="text-sm text-gray-600">Active Boosts</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{boostsStats.boostCount}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-percentage text-orange-600 mr-2"></i>
              <span className="text-sm text-gray-600">Avg Boost</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{boostsStats.avgBoostValue}%</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-star text-green-600 mr-2"></i>
              <span className="text-sm text-gray-600">Best EV</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{boostsStats.bestEV}%</div>
          </div>
        </>
      ) : (
        // Middles Stats
        <>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-arrows-alt-v text-purple-600 mr-2"></i>
              <span className="text-sm text-gray-600">Available Middles</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{middlesStats.middleCount}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-expand-alt text-blue-600 mr-2"></i>
              <span className="text-sm text-gray-600">Avg Gap</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{middlesStats.avgGap} pts</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center mb-2">
              <i className="fas fa-target text-green-600 mr-2"></i>
              <span className="text-sm text-gray-600">Best Probability</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{middlesStats.bestProbability}%</div>
          </div>
        </>
      )}
    </div>
  );

  const TabSelection = () => (
    <div className="flex justify-center mb-6">
      <div style={{ width: '96%', maxWidth: 'none' }}>
        <div className="flex bg-white/50 backdrop-blur-md border border-white/30 rounded-lg p-1 shadow-lg">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setSelectedTab(index)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTab === index
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={selectedTab === index ? {
                background: metallicGradient,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              } : {}}
            >
              <i className={`${tabIcons[index]} mr-2`}></i>
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const WeekSelector = () => (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <button
          onClick={() => setShowWeekPicker(!showWeekPicker)}
          className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-md border border-white/30 rounded-lg hover:bg-white/90 transition-all shadow-lg"
        >
          <i className="fas fa-calendar mr-2 text-gray-500"></i>
          College Week {selectedWeek}
          <i className="fas fa-chevron-down ml-2 text-gray-400"></i>
        </button>
        
        {showWeekPicker && (
          <div className="absolute top-full mt-1 w-48 bg-white/90 backdrop-blur-md border border-white/30 rounded-lg shadow-xl z-10">
            <div className="p-2">
              <div className="text-sm font-semibold text-gray-700 px-2 py-1">Select Week</div>
              <div className="max-h-60 overflow-y-auto">
                {Array.from({ length: 15 }, (_, i) => i + 1).map(week => (
                  <button
                    key={week}
                    onClick={() => {
                      setSelectedWeek(week);
                      setShowWeekPicker(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-white/70 transition-colors ${
                      selectedWeek === week ? 'bg-red-50/80 text-red-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    Week {week}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ArbitrageViewComponent = ({ arbitrageGames }) => (
    <ArbitrageView 
      arbitrageGames={arbitrageGames} 
      onGameSelected={(game) => {
        setSelectedGame(game);
        setShowArbitrageModal(true);
      }} 
    />
  );

  const ComingSoonView = ({ title, description }) => (
    <div className="text-center py-20">
      <i className="fas fa-cog text-5xl text-gray-400 mb-4"></i>
      <h3 className="text-2xl font-bold gradient-text mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  const MainContent = () => {
    switch (selectedTab) {
      case 0:
        return <EVBettingView evGames={getEVGames()} />;
      case 1:
        return <ArbitrageViewComponent arbitrageGames={getArbitrageGames()} />;
      case 2:
        return <BoostsView gameLines={gameLines} teams={teams} />;
      case 3:
        return <MiddlesView gameLines={gameLines} teams={teams} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out;
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
      
      {/* Header - Constrained Width */}
      <div className="container mx-auto px-4 text-center mb-8" style={{ width: '96%', maxWidth: 'none' }}>
        <h1 className="text-5xl font-bold gradient-text mb-4">ARBITRAGE EV</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Expected value calculations and arbitrage opportunities through various sportsbooks.
        </p>
      </div>

      {/* Sportsbook Slider - Full Width */}
      <SportsbookSlider />

      {/* Main Content Container - Constrained Width for Tabs/Content */}
      <div className="container mx-auto px-4" style={{ width: '96%', maxWidth: 'none' }}>
        <div className="w-full">
          {/* Navigation */}
          <TabSelection />
          <WeekSelector />
          
          {/* Stats Summary */}
          <StatsSummary />

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-lg shadow-xl">
            <div className="p-6">
              {isLoading ? (
                <LoadingView />
              ) : errorMessage ? (
                <ErrorView message={errorMessage} />
              ) : gameLines.length === 0 ? (
                <NoDataView />
              ) : (
                <MainContent />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Arbitrage Modal */}
      {showArbitrageModal && selectedGame && (
        <ArbitrageModal 
          game={selectedGame} 
          onClose={() => {
            setShowArbitrageModal(false);
            setSelectedGame(null);
          }} 
        />
      )}
    </div>
  );
};

export default ArbitrageEV;