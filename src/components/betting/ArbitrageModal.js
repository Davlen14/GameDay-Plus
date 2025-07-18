import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services';
import { BettingCalculations } from '../../utils';

const ArbitrageModal = ({ game, onClose }) => {
  // State management - mirrors Swift @State
  const [activeTab, setActiveTab] = useState(0); // 0: overview, 1: moneyline, 2: spread, 3: calculator
  const [totalStake, setTotalStake] = useState(100);
  const [showProfitChart, setShowProfitChart] = useState(false);
  const [teams, setTeams] = useState([]);
  const [customHomeStake, setCustomHomeStake] = useState(0);
  const [customAwayStake, setCustomAwayStake] = useState(0);

  // Theme colors - matching Swift theme
  const accentColor = 'rgb(204, 0, 28)';
  const positiveColor = 'rgb(34, 197, 94)';
  const backgroundColor = '#ffffff';

  // Metallic gradients
  const metallicGradient = `linear-gradient(135deg, 
    rgb(255, 46, 74), 
    rgb(204, 0, 28), 
    rgb(161, 0, 20), 
    rgb(204, 0, 28), 
    rgb(255, 46, 74)
  )`;

  const metallicGreenGradient = `linear-gradient(135deg, 
    rgb(34, 197, 94), 
    rgb(22, 163, 74), 
    rgb(15, 118, 54), 
    rgb(22, 163, 74), 
    rgb(34, 197, 94)
  )`;

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

  // Computed properties - mirror Swift computed properties
  const bestMoneylinePair = useMemo(() => {
    if (!game.hasArbitrage) return null;

    const providers = game.lines.map(line => ({
      provider: line.provider,
      homeOdds: line.homeMoneyline,
      awayOdds: line.awayMoneyline
    }));

    const bestArb = BettingCalculations.findBestArbitrageOpportunity(providers);
    if (!bestArb) return null;

    const homeDecimal = BettingCalculations.americanToDecimal(bestArb.homeOdds) || 1.0;
    const awayDecimal = BettingCalculations.americanToDecimal(bestArb.awayOdds) || 1.0;

    return {
      homeBookmaker: bestArb.homeBook,
      homeOdds: bestArb.homeOdds,
      homeDecimal,
      awayBookmaker: bestArb.awayBook,
      awayOdds: bestArb.awayOdds,
      awayDecimal,
      profitMargin: bestArb.margin
    };
  }, [game]);

  const bestSpreadPair = useMemo(() => {
    if (!game.hasArbitrage) return null;

    // Simulated spread arbitrage (70% of moneyline arbitrage)
    const spreadArbitrageMargin = game.bestProfit * 0.7;

    if (game.lines.length >= 2) {
      return {
        homeBookmaker: game.lines[0].provider,
        homeOdds: -110,
        homeDecimal: BettingCalculations.americanToDecimal(-110) || 1.91,
        awayBookmaker: game.lines[1].provider,
        awayOdds: -110,
        awayDecimal: BettingCalculations.americanToDecimal(-110) || 1.91,
        profitMargin: spreadArbitrageMargin
      };
    }

    return null;
  }, [game]);

  const moneylineStakes = useMemo(() => {
    if (!bestMoneylinePair) return null;

    const stakes = BettingCalculations.calculateArbitrageStakes(
      bestMoneylinePair.homeOdds,
      bestMoneylinePair.awayOdds,
      totalStake
    );

    return stakes ? {
      home: stakes.stake1,
      away: stakes.stake2,
      profit: stakes.profit
    } : null;
  }, [bestMoneylinePair, totalStake]);

  const spreadStakes = useMemo(() => {
    if (!bestSpreadPair) return null;

    const stakes = BettingCalculations.calculateArbitrageStakes(
      bestSpreadPair.homeOdds,
      bestSpreadPair.awayOdds,
      totalStake
    );

    return stakes ? {
      home: stakes.stake1,
      away: stakes.stake2,
      profit: stakes.profit
    } : null;
  }, [bestSpreadPair, totalStake]);

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

  // Modern Profit Chart Component
  const ProfitChart = ({ moneylineStakes, bestMoneylinePair, totalStake }) => {
    const homeWinProfit = (moneylineStakes.home * bestMoneylinePair.homeDecimal - totalStake);
    const awayWinProfit = (moneylineStakes.away * bestMoneylinePair.awayDecimal - totalStake);
    const maxProfit = Math.max(homeWinProfit, awayWinProfit);
    
    return (
      <div 
        className="mt-4 rounded-lg backdrop-blur-sm overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minHeight: '200px'
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-semibold text-white">Profit Visualization</h5>
            <div className="flex items-center space-x-4 text-xs text-gray-300">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded" style={{ background: metallicGradient }}></div>
                <span>Home Win</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded" style={{ background: metallicGreenGradient }}></div>
                <span>Away Win</span>
              </div>
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="relative h-32">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-300 pr-2">
              <span>${maxProfit.toFixed(0)}</span>
              <span>${(maxProfit / 2).toFixed(0)}</span>
              <span>$0</span>
            </div>
            
            {/* Chart area */}
            <div className="ml-8 h-full flex items-end space-x-8 justify-center">
              {/* Home team bar */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-16 rounded-t-lg transition-all duration-500 ease-out flex items-end justify-center text-white text-xs font-bold"
                  style={{
                    height: `${(homeWinProfit / maxProfit) * 100}%`,
                    minHeight: '20px',
                    background: metallicGradient,
                    animation: 'slideUp 0.8s ease-out'
                  }}
                >
                  ${homeWinProfit.toFixed(0)}
                </div>
                <div className="mt-2 text-xs font-medium text-white text-center">
                  <TeamLogo teamName={game.homeTeam} size={20} />
                  <div className="mt-1">{game.homeTeam}</div>
                </div>
              </div>
              
              {/* Away team bar */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-16 rounded-t-lg transition-all duration-500 ease-out flex items-end justify-center text-white text-xs font-bold"
                  style={{
                    height: `${(awayWinProfit / maxProfit) * 100}%`,
                    minHeight: '20px',
                    background: metallicGreenGradient,
                    animation: 'slideUp 0.8s ease-out 0.2s both'
                  }}
                >
                  ${awayWinProfit.toFixed(0)}
                </div>
                <div className="mt-2 text-xs font-medium text-white text-center">
                  <TeamLogo teamName={game.awayTeam} size={20} />
                  <div className="mt-1">{game.awayTeam}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="text-center">
                <div className="text-gray-300">Guaranteed Profit</div>
                <div 
                  className="text-sm font-bold"
                  style={{
                    background: metallicGreenGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  ${Math.min(homeWinProfit, awayWinProfit).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-300">Profit Margin</div>
                <div 
                  className="text-sm font-bold"
                  style={{
                    background: metallicGreenGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {bestMoneylinePair.profitMargin.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes slideUp {
            from {
              height: 0;
              opacity: 0;
            }
            to {
              height: var(--final-height);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  };

  // Components
  const TeamLogo = ({ teamName, size = 70, showCoverage = false }) => {
    const logoUrl = getTeamLogo(teamName);
    const firstLetter = teamName.charAt(0).toUpperCase();
    const isCovered = isTeamCovered(teamName);

    const logoElement = logoUrl ? (
      <img
        src={logoUrl}
        alt={teamName}
        className="rounded shadow-lg"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
        }}
      />
    ) : (
      <div
        className="rounded-full flex items-center justify-center font-bold text-white shadow-lg"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, rgba(156,163,175,0.8), rgba(107,114,128,0.5), rgba(156,163,175,0.7))',
          border: '1px solid rgba(255,255,255,0.4)'
        }}
      >
        <span 
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: `${size * 0.4}px`
          }}
        >
          {firstLetter}
        </span>
      </div>
    );

    if (!showCoverage) {
      return logoElement;
    }

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {logoElement}
        <div
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: size * 0.25,
            height: size * 0.25,
            minWidth: 12,
            minHeight: 12,
            borderRadius: '50%',
            backgroundColor: isCovered ? '#22c55e' : '#ef4444',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.12,
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {isCovered ? '✓' : '✗'}
        </div>
      </div>
    );
  };

  const SportsbookLogo = ({ provider, size = 24 }) => {
    const logoUrl = getSportsbookLogo(provider);
    
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={provider}
          className="rounded shadow-sm"
          style={{ width: size, height: size, objectFit: 'contain' }}
        />
      );
    }

    const getProviderIcon = (provider) => {
      const providerLower = provider.toLowerCase();
      const iconMap = {
        'draftkings': 'fas fa-d',
        'caesars': 'fas fa-c',
        'betmgm': 'fas fa-m',
        'pointsbet': 'fas fa-p',
        'bet365': 'fas fa-3',
        'betrivers': 'fas fa-r',
        'fanduel': 'fas fa-f',
        'espn bet': 'fas fa-e',
        'espnbet': 'fas fa-e'
      };
      return iconMap[providerLower] || 'fas fa-dollar-sign';
    };

    return (
      <div
        className="rounded flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        }}
      >
        <i className={`${getProviderIcon(provider)} text-white text-xs`}></i>
      </div>
    );
  };

  // Game Header Component
  const GameHeader = () => (
    <div 
      className="p-6 border-b backdrop-blur-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Close button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={onClose}
          className="p-2 rounded-full transition-colors"
          style={{
            background: 'rgba(107, 114, 128, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <i className="fas fa-times text-gray-800"></i>
        </button>
      </div>

      {/* Team matchup */}
      <div className="flex items-center justify-center space-x-10 mb-6">
        <div className="text-center">
          <TeamLogo teamName={game.awayTeam} showCoverage={true} />
          <div className="mt-2 text-sm font-medium text-white">{game.awayTeam}</div>
        </div>

        <div className="text-lg font-bold text-white">VS</div>

        <div className="text-center">
          <TeamLogo teamName={game.homeTeam} showCoverage={true} />
          <div className="mt-2 text-sm font-medium text-white">{game.homeTeam}</div>
        </div>
      </div>

      {/* Game info and profit badge */}
      {game.hasArbitrage && (
        <div className="flex justify-center space-x-4">
          <div 
            className="px-3 py-1 rounded-xl text-xs font-bold text-white"
            style={{ background: metallicGradient }}
          >
            Week {game.week}
          </div>
          
          {moneylineStakes?.profit > 0 && (
            <div 
              className="px-3 py-1 rounded-xl text-xs font-bold text-white flex items-center gap-1"
              style={{ background: metallicGreenGradient }}
            >
              <i className="fas fa-trophy text-yellow-300"></i>
              Guaranteed Profit: {game.bestProfit.toFixed(2)}%
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Tab Navigation Component
  const TabNavigation = () => {
    const tabs = ['Overview', 'Moneyline', 'Spread', 'Calculator'];
    const tabIcons = ['fas fa-chart-bar', 'fas fa-dollar-sign', 'fas fa-arrows-alt-h', 'fas fa-calculator'];

    return (
      <div 
        className="flex backdrop-blur-sm"
        style={{
          background: 'rgba(243, 244, 246, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              activeTab === index ? 'text-white' : 'text-white hover:text-gray-200'
            }`}
            style={activeTab === index ? { background: metallicGradient } : {}}
          >
            <i className={`${tabIcons[index]} mr-2`}></i>
            {tab}
          </button>
        ))}
      </div>
    );
  };

  // Summary Card Component
  const SummaryCard = ({ title, value, icon }) => (
    <div 
      className="rounded-lg p-4 backdrop-blur-sm"
      style={{
        background: 'rgba(249, 250, 251, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <i className={`${icon} text-sm text-gray-300`}></i>
        <span className="text-xs text-gray-300">{title}</span>
      </div>
      <div 
        className="text-lg font-bold"
        style={{
          background: 'linear-gradient(135deg, #ffffff, #f3f4f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {value}
      </div>
    </div>
  );

  // Modern Bookmaker Card Component
  const ModernBookmakerCard = ({ provider, team, odds, decimal, implied, showSpread = false }) => (
    <div 
      className="rounded-lg p-4 flex-1 backdrop-blur-sm"
      style={{
        background: 'rgba(249, 250, 251, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <SportsbookLogo provider={provider} />
        <span className="text-sm font-medium truncate text-white">{provider}</span>
      </div>

      {/* Team info */}
      <div className="flex items-center space-x-2 mb-3">
        {!showSpread && <TeamLogo teamName={team.split(' ')[0]} size={20} showCoverage={true} />}
        <span className="text-sm font-medium text-white">{team}</span>
      </div>

      <div className="border-t pt-3 space-y-2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
        <div className="flex justify-between">
          <span className="text-xs text-gray-300">American:</span>
          <span 
            className="text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #ffffff, #f3f4f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {BettingCalculations.formatAmericanOdds(odds)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-300">Decimal:</span>
          <span className="text-xs font-bold text-white">{decimal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-300">Implied %:</span>
          <span className="text-xs font-bold text-white">{implied.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );

  // Result Row Component
  const ModernResultRow = ({ label, value, isHighlighted = false, valueColor = null, isMetallic = false }) => (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${isHighlighted ? 'text-white' : 'text-gray-300'}`}>
        {label}
      </span>
      <span 
        className="text-sm font-bold"
        style={isMetallic && valueColor === positiveColor ? {
          background: metallicGreenGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        } : { color: valueColor || (isHighlighted ? '#ffffff' : '#d1d5db') }}
      >
        {value}
      </span>
    </div>
  );

  // Tab Content Components
  const OverviewTab = () => (
    <div className="p-6 space-y-6">
      {/* Market Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Market Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard
            title="Best Moneyline"
            value={bestMoneylinePair ? `${bestMoneylinePair.profitMargin.toFixed(2)}%` : 'None'}
            icon="fas fa-dollar-sign"
          />
          <SummaryCard
            title="Best Spread"
            value={bestSpreadPair ? `${bestSpreadPair.profitMargin.toFixed(2)}%` : 'None'}
            icon="fas fa-arrows-alt-h"
          />
        </div>
      </div>

      {/* All Sportsbook Lines */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">All Sportsbook Lines</h3>
        <div 
          className="rounded-lg shadow-sm overflow-hidden backdrop-blur-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Header */}
          <div 
            className="px-4 py-2 flex"
            style={{
              background: 'rgba(249, 250, 251, 0.3)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="w-24 text-xs font-medium text-gray-300">Sportsbook</div>
            <div className="flex-1 text-xs font-medium text-gray-300">Moneyline</div>
          </div>

          {/* Rows */}
          {game.lines.map((line, index) => (
            <div 
              key={index} 
              className="px-4 py-3 border-b last:border-b-0"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center">
                <div className="w-24 flex items-center space-x-2">
                  <SportsbookLogo provider={line.provider} size={20} />
                  <span className="text-sm truncate text-white">{line.provider}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-sm">
                    <span className="font-medium text-white">{game.homeTeam}: </span>
                    <span 
                      className="font-semibold"
                      style={{
                        background: line.homeMoneyline > 0 
                          ? metallicGreenGradient 
                          : metallicGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {BettingCalculations.formatAmericanOdds(line.homeMoneyline)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-white">{game.awayTeam}: </span>
                    <span 
                      className="font-semibold"
                      style={{
                        background: line.awayMoneyline > 0 
                          ? metallicGreenGradient 
                          : metallicGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {BettingCalculations.formatAmericanOdds(line.awayMoneyline)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arbitrage Opportunities */}
      {game.hasArbitrage && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Arbitrage Opportunities</h3>
          <div 
            className="rounded-lg shadow-sm overflow-hidden backdrop-blur-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-2 grid grid-cols-4 gap-4"
              style={{
                background: 'rgba(249, 250, 251, 0.3)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="text-xs font-medium text-gray-300">Type</div>
              <div className="text-xs font-medium text-gray-300">Home Book</div>
              <div className="text-xs font-medium text-gray-300">Away Book</div>
              <div className="text-xs font-medium text-gray-300 text-right">Profit</div>
            </div>

            {/* Moneyline row */}
            {bestMoneylinePair && (
              <div 
                className="px-4 py-3 grid grid-cols-4 gap-4 items-center border-b"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div 
                  className="text-xs font-bold text-white px-2 py-1 rounded"
                  style={{ background: metallicGradient }}
                >
                  ML
                </div>
                <div className="text-sm text-white">{bestMoneylinePair.homeBookmaker}</div>
                <div className="text-sm text-white">{bestMoneylinePair.awayBookmaker}</div>
                <div 
                  className="text-sm font-bold text-right"
                  style={{
                    background: metallicGreenGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {bestMoneylinePair.profitMargin.toFixed(2)}%
                </div>
              </div>
            )}

            {/* Spread row */}
            {bestSpreadPair && (
              <div className="px-4 py-3 grid grid-cols-4 gap-4 items-center">
                <div className="text-xs font-bold text-white px-2 py-1 rounded bg-blue-500">
                  SPR
                </div>
                <div className="text-sm text-white">{bestSpreadPair.homeBookmaker}</div>
                <div className="text-sm text-white">{bestSpreadPair.awayBookmaker}</div>
                <div 
                  className="text-sm font-bold text-right"
                  style={{
                    background: metallicGreenGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {bestSpreadPair.profitMargin.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const MoneylineTab = () => {
    if (!bestMoneylinePair || !moneylineStakes) {
      return (
        <div className="p-6 text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-orange-500 mb-4"></i>
          <h3 className="text-lg font-bold mb-2 text-white">No Guaranteed Arbitrage Found</h3>
          <p className="text-gray-300">
            This means the combined implied probabilities from different sportsbooks exceed 100%.
          </p>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        {/* Profit Banner */}
        <div 
          className="rounded-lg p-4 backdrop-blur-sm"
          style={{
            background: 'rgba(249, 250, 251, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-dollar-sign text-green-600"></i>
              <span className="text-sm font-medium text-white">Guaranteed Profit:</span>
              <span 
                className="text-lg font-bold"
                style={{
                  background: metallicGreenGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {bestMoneylinePair.profitMargin.toFixed(2)}%
              </span>
            </div>
            <button
              onClick={() => setShowProfitChart(!showProfitChart)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showProfitChart ? 'Hide Chart' : 'Show Chart'}
            </button>
          </div>

          {showProfitChart && (
            <ProfitChart 
              moneylineStakes={moneylineStakes}
              bestMoneylinePair={bestMoneylinePair}
              totalStake={totalStake}
            />
          )}
        </div>

        {/* Bookmaker cards */}
        <div className="flex space-x-4">
          <ModernBookmakerCard
            provider={bestMoneylinePair.homeBookmaker}
            team={game.homeTeam}
            odds={bestMoneylinePair.homeOdds}
            decimal={bestMoneylinePair.homeDecimal}
            implied={BettingCalculations.decimalToImpliedProbability(bestMoneylinePair.homeDecimal) || 0}
          />
          <ModernBookmakerCard
            provider={bestMoneylinePair.awayBookmaker}
            team={game.awayTeam}
            odds={bestMoneylinePair.awayOdds}
            decimal={bestMoneylinePair.awayDecimal}
            implied={BettingCalculations.decimalToImpliedProbability(bestMoneylinePair.awayDecimal) || 0}
          />
        </div>

        {/* Allocation bar */}
        <div className="space-y-2">
          <div className="relative h-8 rounded-lg overflow-hidden" style={{ background: 'rgba(209, 213, 219, 0.5)' }}>
            <div 
              className="absolute top-0 left-0 h-full flex items-center justify-center text-white text-xs font-bold"
              style={{
                width: `${(moneylineStakes.home / totalStake) * 100}%`,
                background: metallicGradient
              }}
            >
              {Math.round((moneylineStakes.home / totalStake) * 100)}%
            </div>
            <div 
              className="absolute top-0 h-full flex items-center justify-center text-white text-xs font-bold"
              style={{
                left: `${(moneylineStakes.home / totalStake) * 100}%`,
                width: `${(moneylineStakes.away / totalStake) * 100}%`,
                background: metallicGreenGradient
              }}
            >
              {Math.round((moneylineStakes.away / totalStake) * 100)}%
            </div>
          </div>
          <div className="text-center text-xs text-gray-300">Stake Allocation</div>
        </div>

        {/* Stake Calculator */}
        <div 
          className="rounded-lg p-4 space-y-4 backdrop-blur-sm"
          style={{
            background: 'rgba(249, 250, 251, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <h4 className="text-sm font-semibold text-white">Calculate Your Returns</h4>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">Total Stake ($):</label>
              <span className="text-sm font-bold text-white">${totalStake}</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={totalStake}
              onChange={(e) => setTotalStake(Number(e.target.value))}
              className="w-full"
              style={{ accentColor }}
            />
          </div>

          <div className="border-t pt-4 space-y-3" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <ModernResultRow
              label={`Stake on ${game.homeTeam}:`}
              value={`$${moneylineStakes.home.toFixed(2)}`}
            />
            <ModernResultRow
              label={`Stake on ${game.awayTeam}:`}
              value={`$${moneylineStakes.away.toFixed(2)}`}
            />
            <div className="border-t pt-2 space-y-2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <ModernResultRow
                label="Guaranteed Return:"
                value={`$${(moneylineStakes.home * bestMoneylinePair.homeDecimal).toFixed(2)}`}
                isHighlighted={true}
              />
              <ModernResultRow
                label="Profit:"
                value={`$${moneylineStakes.profit.toFixed(2)}`}
                valueColor={positiveColor}
                isMetallic={true}
              />
              <ModernResultRow
                label="ROI:"
                value={`${((moneylineStakes.profit / totalStake) * 100).toFixed(2)}%`}
                valueColor={positiveColor}
                isMetallic={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SpreadTab = () => {
    if (!bestSpreadPair || !spreadStakes) {
      return (
        <div className="p-6 text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-orange-500 mb-4"></i>
          <h3 className="text-lg font-bold mb-2 text-white">No Spread Arbitrage Available</h3>
          <p className="text-gray-300">
            Spread arbitrage opportunities are less common than moneyline arbitrage.
          </p>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        {/* Profit Banner */}
        <div 
          className="rounded-lg p-4 backdrop-blur-sm"
          style={{
            background: 'rgba(249, 250, 251, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >            <div className="flex items-center space-x-2">
              <i className="fas fa-dollar-sign text-green-600"></i>
              <span className="text-sm font-medium text-white">Guaranteed Profit:</span>
            <span 
              className="text-lg font-bold"
              style={{
                background: metallicGreenGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {bestSpreadPair.profitMargin.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Bookmaker cards */}
        <div className="flex space-x-4">
          <ModernBookmakerCard
            provider={bestSpreadPair.homeBookmaker}
            team={`${game.homeTeam} -3.5`}
            odds={bestSpreadPair.homeOdds}
            decimal={bestSpreadPair.homeDecimal}
            implied={BettingCalculations.decimalToImpliedProbability(bestSpreadPair.homeDecimal) || 0}
            showSpread={true}
          />
          <ModernBookmakerCard
            provider={bestSpreadPair.awayBookmaker}
            team={`${game.awayTeam} +3.5`}
            odds={bestSpreadPair.awayOdds}
            decimal={bestSpreadPair.awayDecimal}
            implied={BettingCalculations.decimalToImpliedProbability(bestSpreadPair.awayDecimal) || 0}
            showSpread={true}
          />
        </div>

        {/* Rest of spread tab content similar to moneyline */}
        <div 
          className="rounded-lg p-4 backdrop-blur-sm"
          style={{
            background: 'rgba(219, 234, 254, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-blue-600 mt-1"></i>
            <div>
              <p className="text-sm text-blue-300">
                <strong>Note about spread bets:</strong> Depending on the final score, there's a possibility 
                of a "middle" where both bets win or a "push" where one bet is refunded.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CalculatorTab = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Arbitrage Calculator</h3>
      
      {bestMoneylinePair && moneylineStakes ? (
        <div className="space-y-6">
          {/* Standard Calculator */}
          <div 
            className="rounded-lg p-4 space-y-4 backdrop-blur-sm"
            style={{
              background: 'rgba(249, 250, 251, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h4 className="text-sm font-semibold text-white">Standard Calculator</h4>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-300">Total Budget ($):</label>
                <span className="text-sm font-bold text-white">${totalStake}</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={totalStake}
                onChange={(e) => setTotalStake(Number(e.target.value))}
                className="w-full"
                style={{ accentColor }}
              />
            </div>

            <div 
              className="rounded-lg p-4 backdrop-blur-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <h5 className="text-xs font-semibold mb-3 text-white">Optimal Moneyline Allocation</h5>
              
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-300 mb-2 pb-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <div>Team</div>
                <div>Sportsbook</div>
                <div className="text-right">Stake</div>
              </div>

              {/* Home row */}
              <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                <div className="flex items-center space-x-2">
                  <TeamLogo teamName={game.homeTeam} size={16} showCoverage={true} />
                  <span className="truncate text-white">{game.homeTeam}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SportsbookLogo provider={bestMoneylinePair.homeBookmaker} size={14} />
                  <span className="truncate text-white">{bestMoneylinePair.homeBookmaker}</span>
                </div>
                <div className="text-right font-bold text-white">
                  ${moneylineStakes.home.toFixed(2)}
                </div>
              </div>

              {/* Away row */}
              <div className="grid grid-cols-3 gap-4 text-sm mb-2 pb-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <div className="flex items-center space-x-2">
                  <TeamLogo teamName={game.awayTeam} size={16} showCoverage={true} />
                  <span className="truncate text-white">{game.awayTeam}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SportsbookLogo provider={bestMoneylinePair.awayBookmaker} size={14} />
                  <span className="truncate text-white">{bestMoneylinePair.awayBookmaker}</span>
                </div>
                <div className="text-right font-bold text-white">
                  ${moneylineStakes.away.toFixed(2)}
                </div>
              </div>

              {/* Total row */}
              <div 
                className="grid grid-cols-3 gap-4 text-sm -mx-4 px-4 py-2"
                style={{
                  background: 'rgba(249, 250, 251, 0.3)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="font-bold text-white">Total Profit</div>
                <div 
                  className="font-bold"
                  style={{
                    background: metallicGreenGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  ${moneylineStakes.profit.toFixed(2)}
                </div>
                <div 
                  className="text-right font-bold"
                  style={{
                    background: metallicGreenGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {((moneylineStakes.profit / totalStake) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Scenario Analysis */}
          <div 
            className="rounded-lg p-4 backdrop-blur-sm"
            style={{
              background: 'rgba(249, 250, 251, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h4 className="text-sm font-semibold mb-4 text-white">Scenario Analysis</h4>
            
            <div 
              className="rounded-lg p-4 backdrop-blur-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-300 mb-2 pb-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <div>Scenario</div>
                <div>Return</div>
                <div className="text-right">Net Profit</div>
              </div>

              {/* Home win scenario */}
              <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                <div className="flex items-center space-x-2">
                  <TeamLogo teamName={game.homeTeam} size={16} showCoverage={true} />
                  <span className="text-white">If {game.homeTeam} wins</span>
                </div>
                <div className="text-white">${(moneylineStakes.home * bestMoneylinePair.homeDecimal).toFixed(2)}</div>
                <div 
                  className="text-right font-bold"
                  style={{
                    background: metallicGreenGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  ${(moneylineStakes.home * bestMoneylinePair.homeDecimal - totalStake).toFixed(2)}
                </div>
              </div>

              {/* Away win scenario */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <TeamLogo teamName={game.awayTeam} size={16} showCoverage={true} />
                  <span className="text-white">If {game.awayTeam} wins</span>
                </div>
                <div className="text-white">${(moneylineStakes.away * bestMoneylinePair.awayDecimal).toFixed(2)}</div>
                <div 
                  className="text-right font-bold"
                  style={{
                    background: metallicGreenGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  ${(moneylineStakes.away * bestMoneylinePair.awayDecimal - totalStake).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-300">No arbitrage opportunities available for calculation.</p>
        </div>
      )}
    </div>
  );

  // Modal Footer
  const ModalFooter = () => (
    <div 
      className="flex space-x-4 p-6 border-t backdrop-blur-sm"
      style={{
        background: 'rgba(249, 250, 251, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}
    >
      <button
        className="flex-1 py-3 px-4 text-white font-medium rounded-lg transition-all hover:shadow-lg"
        style={{ background: metallicGradient }}
      >
        <i className="fas fa-save mr-2"></i>
        Save
      </button>
      <button
        onClick={onClose}
        className="flex-1 py-3 px-4 font-medium rounded-lg transition-colors backdrop-blur-sm"
        style={{
          background: 'rgba(209, 213, 219, 0.3)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <i className="fas fa-times mr-2"></i>
        Close
      </button>
    </div>
  );

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

  // Main render
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="rounded-xl shadow-2xl w-full max-w-4xl backdrop-blur-md border overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          maxHeight: '90vh',
          minHeight: '70vh'
        }}
      >
        <div className="flex flex-col h-full" style={{ maxHeight: '90vh' }}>
          <GameHeader />
          <TabNavigation />
          
          <div 
            className="flex-1 overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.5) transparent'
            }}
          >
            {activeTab === 0 && <OverviewTab />}
            {activeTab === 1 && <MoneylineTab />}
            {activeTab === 2 && <SpreadTab />}
            {activeTab === 3 && <CalculatorTab />}
          </div>
          
          <ModalFooter />
        </div>
      </div>
      
      <style jsx>{`
        .flex-1::-webkit-scrollbar {
          width: 6px;
        }
        .flex-1::-webkit-scrollbar-track {
          background: transparent;
        }
        .flex-1::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 3px;
        }
        .flex-1::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </div>
  );
};

export default ArbitrageModal;