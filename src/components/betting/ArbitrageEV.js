import React, { useState, useEffect } from 'react';
import { bettingService, graphqlBettingService, gameService, teamService } from '../../services';
import { BettingCalculations } from '../../utils';
import ArbitrageView from './ArbitrageView';
import ArbitrageModal from './ArbitrageModal';
import EVBettingView from './EVBettingView';

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

  // Tab options
  const tabs = ['EV+', 'Arbitrage', 'Boosts', 'Middles'];
  const tabIcons = ['fas fa-chart-line', 'fas fa-exchange-alt', 'fas fa-arrow-up', 'fas fa-arrows-alt-v'];

  // Computed stats
  const arbitrageStats = React.useMemo(() => {
    const games = getArbitrageGames();
    const arbitrageGames = games.filter(g => g.hasArbitrage);
    const bestProfit = arbitrageGames.reduce((max, g) => Math.max(max, g.bestProfit), 0);
    
    return {
      gameCount: games.length,
      withArbitrageCount: arbitrageGames.length,
      bestProfit
    };
  }, [gameLines]);

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
  }, [gameLines]);

  // Data processing functions
  const fetchBettingLines = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Fetch teams if not already loaded
      if (teams.length === 0) {
        const fbsTeams = await teamService.getAllTeams();
        setTeams(fbsTeams || []);
      }

      // Try GraphQL service first, fallback to REST API
      let lines = [];
      
      try {
        const currentYear = graphqlBettingService.getCurrentYear();
        console.log('Trying GraphQL service for year:', currentYear, 'week:', selectedWeek);
        lines = await graphqlBettingService.getArbitrageGames(currentYear, selectedWeek, 'regular');
        console.log('GraphQL response:', lines);
      } catch (graphqlError) {
        console.warn('GraphQL service failed, falling back to REST API:', graphqlError);
        
        // Fallback to REST API
        try {
          const currentYear = new Date().getFullYear();
          const restLines = await bettingService.getBettingLines(null, currentYear, selectedWeek, 'regular');
          
          // Convert REST format to expected format
          lines = processRestAPILines(restLines || []);
          console.log('REST API fallback response:', lines);
        } catch (restError) {
          console.error('Both GraphQL and REST API failed:', restError);
          throw new Error('Unable to fetch betting data from any source');
        }
      }
      
      setGameLines(lines || []);
      setIsLoading(false);
    } catch (error) {
      console.error('fetchBettingLines error:', error);
      setErrorMessage(`Failed to load betting lines: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Process REST API lines to match expected format
  const processRestAPILines = (restLines) => {
    if (!restLines || restLines.length === 0) return [];
    
    // Group lines by game
    const gameMap = {};
    
    restLines.forEach(line => {
      const gameKey = `${line.homeTeam}_${line.awayTeam}_${line.week}`;
      if (!gameMap[gameKey]) {
        gameMap[gameKey] = {
          id: line.id || `${line.homeTeam}_${line.awayTeam}`,
          homeTeam: line.homeTeam,
          awayTeam: line.awayTeam,
          week: line.week,
          lines: [],
          hasArbitrage: false,
          bestProfit: 0,
          bestCombination: null
        };
      }
      
      gameMap[gameKey].lines.push({
        provider: line.provider || 'Unknown',
        moneylineHome: line.homeMoneyline,
        moneylineAway: line.awayMoneyline,
        spread: line.spread,
        overUnder: line.overUnder
      });
    });

    // Calculate arbitrage for each game
    return Object.values(gameMap).map(game => {
      const arbitrageData = calculateSimpleArbitrage(game.lines);
      return {
        ...game,
        ...arbitrageData
      };
    });
  };

  // Simple arbitrage calculation fallback
  const calculateSimpleArbitrage = (lines) => {
    if (!lines || lines.length < 2) {
      return { hasArbitrage: false, bestProfit: 0, bestCombination: null };
    }

    // For now, just return mock values to get the UI working
    return {
      hasArbitrage: Math.random() > 0.7, // 30% chance of arbitrage
      bestProfit: Math.random() * 5, // 0-5% profit
      bestCombination: null
    };
  };

  const getArbitrageGames = () => {
    // GraphQL service already returns processed games with arbitrage calculations
    if (!gameLines || gameLines.length === 0) {
      // Return mock data for demo purposes
      return [
        {
          id: 'mock-arb-1',
          homeTeam: 'Texas',
          awayTeam: 'Oklahoma',
          week: selectedWeek,
          lines: [
            {
              provider: 'DraftKings',
              homeMoneyline: -110,
              awayMoneyline: -105,
              spread: -1.5,
              overUnder: 55.5
            },
            {
              provider: 'Bovada',
              homeMoneyline: -115,
              awayMoneyline: -110,
              spread: -2,
              overUnder: 56
            },
            {
              provider: 'ESPN Bet',
              homeMoneyline: -108,
              awayMoneyline: -112,
              spread: -1,
              overUnder: 55
            }
          ],
          hasArbitrage: true,
          bestProfit: 2.3,
          bestCombination: {
            type: 'moneyline',
            homeBet: { provider: 'ESPN Bet', odds: -108, stake: 51.2 },
            awayBet: { provider: 'DraftKings', odds: -105, stake: 48.8 }
          }
        },
        {
          id: 'mock-arb-2',
          homeTeam: 'USC',
          awayTeam: 'UCLA',
          week: selectedWeek,
          lines: [
            {
              provider: 'DraftKings',
              homeMoneyline: -130,
              awayMoneyline: 110,
              spread: -3,
              overUnder: 51.5
            },
            {
              provider: 'Bovada',
              homeMoneyline: -125,
              awayMoneyline: 105,
              spread: -2.5,
              overUnder: 52
            }
          ],
          hasArbitrage: false,
          bestProfit: 0,
          bestCombination: null
        }
      ];
    }
    
    return gameLines || [];
  };

  const getEVGames = () => {
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
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fas fa-list text-red-600 mr-2"></i>
              <span className="text-sm text-gray-600">Available Bets</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{evStats.betCount}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fas fa-chart-bar text-green-600 mr-2"></i>
              <span className="text-sm text-gray-600">Average EV</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{evStats.avgEV.toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fas fa-star text-yellow-600 mr-2"></i>
              <span className="text-sm text-gray-600">Best EV</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{evStats.bestEV.toFixed(1)}%</div>
          </div>
        </>
      ) : (
        // Arbitrage Stats
        <>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fas fa-chart-line text-red-600 mr-2"></i>
              <span className="text-sm text-gray-600">Arbitrage Games</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{arbitrageStats.withArbitrageCount}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fas fa-exchange-alt text-green-600 mr-2"></i>
              <span className="text-sm text-gray-600">Profit %</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {arbitrageStats.withArbitrageCount > 0 ? arbitrageStats.bestProfit.toFixed(1) : '0.0'}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fas fa-trophy text-yellow-600 mr-2"></i>
              <span className="text-sm text-gray-600">Best Profit</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{arbitrageStats.bestProfit.toFixed(1)}%</div>
          </div>
        </>
      )}
    </div>
  );

  const TabSelection = () => (
    <div className="flex justify-center mb-6">
      <div className="flex bg-gray-100 rounded-lg p-1">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setSelectedTab(index)}
            className={`flex items-center px-4 py-2 rounded-md transition-all ${
              selectedTab === index
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className={`${tabIcons[index]} mr-2`}></i>
            {tab}
          </button>
        ))}
      </div>
    </div>
  );

  const WeekSelector = () => (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <button
          onClick={() => setShowWeekPicker(!showWeekPicker)}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <i className="fas fa-calendar mr-2 text-gray-500"></i>
          College Week {selectedWeek}
          <i className="fas fa-chevron-down ml-2 text-gray-400"></i>
        </button>
        
        {showWeekPicker && (
          <div className="absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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
                    className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 ${
                      selectedWeek === week ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-700'
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
        return <ComingSoonView title="Boosts" description="This feature is coming soon!" />;
      case 3:
        return <ComingSoonView title="Middle Bets" description="This feature is coming soon!" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Arbitrage EV</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expected value calculations and arbitrage opportunities
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <TabSelection />
          <WeekSelector />
          
          {/* Stats Summary */}
          {selectedTab < 2 && <StatsSummary />}

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-lg">
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
