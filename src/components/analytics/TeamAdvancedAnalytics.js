import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaArrowLeft, FaTrophy, FaFootballBall, FaShieldAlt, 
  FaBolt, FaUsers, FaStar, FaCalendarAlt, FaMapMarkerAlt, FaFire,
  FaInfoCircle, FaChartBar, FaTarget, FaGraduationCap, FaBullseye,
  FaTrendingUp, FaTrendingDown, FaMinus, FaPercent, FaClock,
  FaExchangeAlt, FaRocket, FaEye, FaGamepad, FaFlag
} from 'react-icons/fa';
import { teamService } from '../../services/teamService';
import { analyticsService } from '../../services/analyticsService';
import { bettingService } from '../../services/bettingService';

const TeamAdvancedAnalytics = ({ teamSlug, onNavigate }) => {
  const [team, setTeam] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Convert slug back to team name
  const teamName = teamSlug ? teamSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

  useEffect(() => {
    if (teamSlug) {
      loadTeamAdvancedAnalytics();
    }
  }, [teamSlug]);

  const loadTeamAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert team slug back to proper name for display
      const displayName = teamSlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      // Create comprehensive mock team data for fast preview
      const mockTeam = {
        school: displayName,
        mascot: generateMascot(displayName),
        conference: generateConference(),
        division: generateDivision(),
        classification: 'fbs',
        location: generateLocation(),
        stadium: generateStadium(displayName),
        capacity: Math.floor(Math.random() * 40000) + 40000,
        founded: Math.floor(Math.random() * 100) + 1880,
        colors: generateColors(),
        logos: [`/photos/${displayName}.png`],
        headCoach: generateCoach(),
        coordinators: generateCoordinators()
      };

      // Create comprehensive analytics data
      const mockAnalytics = {
        // Season Record & Performance
        record: {
          wins: Math.floor(Math.random() * 8) + 4,
          losses: Math.floor(Math.random() * 6) + 1,
          ties: 0,
          conferenceWins: Math.floor(Math.random() * 6) + 2,
          conferenceLosses: Math.floor(Math.random() * 4) + 1,
          homeRecord: { wins: Math.floor(Math.random() * 6) + 3, losses: Math.floor(Math.random() * 2) },
          awayRecord: { wins: Math.floor(Math.random() * 4) + 1, losses: Math.floor(Math.random() * 4) + 1 },
          neutralRecord: { wins: Math.floor(Math.random() * 2), losses: Math.floor(Math.random() * 2) },
          vsRanked: { wins: Math.floor(Math.random() * 3), losses: Math.floor(Math.random() * 3) + 1 },
          vsTop10: { wins: Math.floor(Math.random() * 2), losses: Math.floor(Math.random() * 2) + 1 }
        },

        // Comprehensive Rating Systems
        ratings: {
          sp: {
            overall: Math.random() * 40 + 10,
            offense: Math.random() * 30 + 15,
            defense: Math.random() * 30 + 5,
            specialTeams: Math.random() * 10 - 5
          },
          fpi: {
            overall: Math.random() * 30 + 5,
            offense: Math.random() * 25 + 10,
            defense: Math.random() * 25 + 5,
            specialTeams: Math.random() * 5 - 2.5
          },
          elo: {
            current: Math.floor(Math.random() * 800) + 1200,
            peak: Math.floor(Math.random() * 900) + 1300,
            low: Math.floor(Math.random() * 700) + 1100
          },
          sagarin: Math.random() * 40 + 60,
          massey: Math.random() * 50 + 50,
          colleyMatrix: Math.random() * 0.8 + 0.1
        },

        // Season Statistics
        stats: {
          offense: {
            pointsPerGame: Math.random() * 20 + 25,
            totalYardsPerGame: Math.random() * 200 + 350,
            passingYardsPerGame: Math.random() * 150 + 200,
            rushingYardsPerGame: Math.random() * 100 + 120,
            firstDownsPerGame: Math.random() * 8 + 18,
            thirdDownConversions: Math.random() * 25 + 35,
            redZoneEfficiency: Math.random() * 30 + 65,
            turnoversPerGame: Math.random() * 1.5 + 0.8,
            timeOfPossession: Math.random() * 4 + 28,
            yardsPerPlay: Math.random() * 2 + 5.5
          },
          defense: {
            pointsAllowedPerGame: Math.random() * 15 + 15,
            totalYardsAllowedPerGame: Math.random() * 150 + 280,
            passingYardsAllowedPerGame: Math.random() * 100 + 180,
            rushingYardsAllowedPerGame: Math.random() * 80 + 100,
            firstDownsAllowedPerGame: Math.random() * 6 + 15,
            thirdDownStops: Math.random() * 25 + 55,
            redZoneDefense: Math.random() * 25 + 65,
            turnoversCreatedPerGame: Math.random() * 1.5 + 1.0,
            sacksPerGame: Math.random() * 2 + 2.5,
            tacklesForLossPerGame: Math.random() * 3 + 5
          }
        },

        // Advanced Analytics
        advanced: {
          efficiency: {
            overall: Math.random() * 0.4 + 0.4,
            passingDowns: Math.random() * 0.5 + 0.3,
            standardDowns: Math.random() * 0.4 + 0.4,
            rushingDowns: Math.random() * 0.5 + 0.3
          },
          explosiveness: {
            overall: Math.random() * 0.4 + 0.3,
            passing: Math.random() * 0.5 + 0.25,
            rushing: Math.random() * 0.3 + 0.15
          },
          fieldPosition: {
            averageStart: Math.random() * 15 + 25,
            averageGiven: Math.random() * 15 + 25,
            fieldPositionAdvantage: Math.random() * 6 - 3
          },
          situational: {
            clutchPerformance: Math.random() * 30 + 60,
            fourthDownConversions: Math.random() * 30 + 45,
            goalLineStands: Math.random() * 40 + 40,
            weatherPerformance: Math.random() * 20 + 70
          }
        },

        // PPA (Predicted Points Added)
        ppa: {
          overall: {
            offense: Math.random() * 0.8 - 0.2,
            defense: Math.random() * 0.8 - 0.4,
            overall: Math.random() * 0.6 - 0.1
          },
          situational: {
            firstDown: Math.random() * 0.6 - 0.1,
            secondDown: Math.random() * 0.6 - 0.2,
            thirdDown: Math.random() * 0.8 - 0.3,
            passing: Math.random() * 0.8 - 0.1,
            rushing: Math.random() * 0.6 - 0.2
          }
        },

        // Recruiting & Talent
        recruiting: {
          currentClass: {
            rank: Math.floor(Math.random() * 130) + 1,
            points: Math.random() * 300 + 100,
            commits: Math.floor(Math.random() * 15) + 15,
            avgRating: Math.random() * 1.5 + 2.5
          },
          talent: {
            overall: Math.random() * 800 + 400,
            freshman: Math.random() * 200 + 100,
            sophomore: Math.random() * 200 + 100,
            junior: Math.random() * 200 + 100,
            senior: Math.random() * 200 + 100
          },
          portal: {
            additions: Math.floor(Math.random() * 12) + 3,
            departures: Math.floor(Math.random() * 15) + 5,
            netRating: Math.random() * 200 - 100
          }
        },

        // Betting & Market Analysis
        betting: {
          seasonRecord: {
            ats: { wins: Math.floor(Math.random() * 7) + 3, losses: Math.floor(Math.random() * 7) + 3 },
            overUnder: { overs: Math.floor(Math.random() * 6) + 3, unders: Math.floor(Math.random() * 6) + 3 }
          },
          market: {
            averageSpread: Math.random() * 20 - 10,
            averageTotal: Math.random() * 15 + 50,
            publicBettingPercentage: Math.random() * 40 + 30,
            sharpAction: Math.random() > 0.5 ? 'backing' : 'fading'
          },
          futures: {
            championshipOdds: generateOdds(),
            playoffOdds: Math.random() * 80 + 10,
            conferenceOdds: Math.random() * 60 + 20,
            winTotal: Math.random() * 4 + 8
          }
        },

        // Schedule Analysis
        schedule: {
          strengthOfSchedule: Math.random() * 30 + 60,
          strengthOfRecord: Math.random() * 25 + 65,
          remainingStrength: Math.random() * 40 + 40,
          gameEnvironments: generateGameEnvironments()
        }
      };

      setTeam(mockTeam);
      setAnalytics(mockAnalytics);
      setLoading(false);

    } catch (error) {
      console.error('Error loading team analytics:', error);
      setError('Failed to load team analytics');
      setLoading(false);
    }
  };

  // Helper functions for generating mock data
  const generateMascot = (teamName) => {
    const mascots = ['Wildcats', 'Eagles', 'Bears', 'Tigers', 'Lions', 'Hawks', 'Bulldogs', 'Warriors'];
    return mascots[Math.floor(Math.random() * mascots.length)];
  };

  const generateConference = () => {
    const conferences = ['SEC', 'Big Ten', 'Big 12', 'ACC', 'Pac-12', 'American Athletic', 'Mountain West'];
    return conferences[Math.floor(Math.random() * conferences.length)];
  };

  const generateDivision = () => {
    return Math.random() > 0.5 ? 'East' : 'West';
  };

  const generateLocation = () => {
    const cities = ['Athens, GA', 'Tuscaloosa, AL', 'Austin, TX', 'Ann Arbor, MI', 'Eugene, OR', 'Clemson, SC'];
    return cities[Math.floor(Math.random() * cities.length)];
  };

  const generateStadium = (teamName) => {
    const suffixes = ['Stadium', 'Field', 'Arena', 'Coliseum'];
    return `${teamName} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  };

  const generateColors = () => {
    const colorSets = [
      ['#CC0000', '#000000'], // Red/Black
      ['#003366', '#FFFFFF'], // Navy/White  
      ['#FF6600', '#FFFFFF'], // Orange/White
      ['#800080', '#FFD700'], // Purple/Gold
      ['#006600', '#FFFFFF']  // Green/White
    ];
    return colorSets[Math.floor(Math.random() * colorSets.length)];
  };

  const generateCoach = () => {
    const firstNames = ['John', 'Mike', 'Steve', 'Dave', 'Tom', 'Jim', 'Bill', 'Mark'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  };

  const generateCoordinators = () => ({
    offensive: generateCoach(),
    defensive: generateCoach(),
    specialTeams: generateCoach()
  });

  const generateOdds = () => {
    const odds = ['+5000', '+2500', '+1200', '+800', '+500', '+300', '+200', '+150'];
    return odds[Math.floor(Math.random() * odds.length)];
  };

  const generateGameEnvironments = () => {
    const games = Math.floor(Math.random() * 4) + 8;
    return {
      homeGames: Math.floor(games / 2),
      awayGames: Math.floor(games / 2),
      neutralSite: Math.floor(Math.random() * 2),
      primetime: Math.floor(Math.random() * 3) + 1,
      conference: Math.floor(games * 0.7),
      nonConference: Math.floor(games * 0.3)
    };
  };

  const getRatingColor = (rating, threshold = 70) => {
    if (rating >= threshold + 15) return 'text-green-600 bg-green-100';
    if (rating >= threshold) return 'text-blue-600 bg-blue-100';
    if (rating >= threshold - 15) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FaTrendingUp className="text-green-500" />;
    if (trend === 'down') return <FaTrendingDown className="text-red-500" />;
    return <FaMinus className="text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Advanced Analytics</h2>
          <p className="text-gray-600">Gathering detailed team data...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
        <div className="w-[97%] mx-auto">
          <div className="text-center">
            <FaFootballBall className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Team Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested team could not be found.'}</p>
            <button 
              onClick={() => onNavigate('team-metrics')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Back to Team Metrics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 bg-gray-50">
      <div className="w-[97%] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('team-metrics')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Team Metrics
          </button>
          
          {/* Team Identity Hero */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <img 
                  src={team.logos?.[0] || `/photos/${team.school}.png`} 
                  alt={team.school}
                  className="w-24 h-24 object-contain"
                />
                <div>
                  <h1 className="text-4xl font-bold text-gray-800">{team.school} {team.mascot}</h1>
                  <p className="text-xl text-gray-600">{team.conference} {team.division} | {team.location}</p>
                  <p className="text-lg text-gray-500">{team.stadium} ({team.capacity?.toLocaleString()})</p>
                  <p className="text-sm text-gray-400">Head Coach: {team.headCoach}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-700">
                  {analytics.record.wins}-{analytics.record.losses}
                </div>
                <div className="text-lg text-gray-500">
                  ({analytics.record.conferenceWins}-{analytics.record.conferenceLosses} {team.conference})
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  Win Rate: {((analytics.record.wins / (analytics.record.wins + analytics.record.losses)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-lg">
            {[
              { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
              { id: 'offense', label: 'Offense', icon: <FaBolt /> },
              { id: 'defense', label: 'Defense', icon: <FaShieldAlt /> },
              { id: 'advanced', label: 'Advanced', icon: <FaRocket /> },
              { id: 'recruiting', label: 'Recruiting', icon: <FaGraduationCap /> },
              { id: 'betting', label: 'Betting', icon: <FaTarget /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Rating Systems Comparison */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaTrophy className="mr-3 text-yellow-600" />
                Rating Systems Comparison
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{analytics.ratings.sp.overall.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">SP+ Overall</div>
                  <div className="text-xs text-gray-400">Advanced metric</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analytics.ratings.fpi.overall.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">FPI Rating</div>
                  <div className="text-xs text-gray-400">ESPN metric</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{Math.round(analytics.ratings.elo.current)}</div>
                  <div className="text-sm text-gray-600">Elo Rating</div>
                  <div className="text-xs text-gray-400">Historical power</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{analytics.ratings.sagarin.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Sagarin</div>
                  <div className="text-xs text-gray-400">Computer poll</div>
                </div>
              </div>
            </div>

            {/* Season Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                  Season Record Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Overall Record:</span>
                    <span className="font-bold">{analytics.record.wins}-{analytics.record.losses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conference:</span>
                    <span className="font-bold">{analytics.record.conferenceWins}-{analytics.record.conferenceLosses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Home:</span>
                    <span className="font-bold">{analytics.record.homeRecord.wins}-{analytics.record.homeRecord.losses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Away:</span>
                    <span className="font-bold">{analytics.record.awayRecord.wins}-{analytics.record.awayRecord.losses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>vs Ranked:</span>
                    <span className="font-bold">{analytics.record.vsRanked.wins}-{analytics.record.vsRanked.losses}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FaInfoCircle className="mr-2 text-green-600" />
                  Schedule Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Strength of Schedule:</span>
                    <span className="font-bold">{analytics.schedule.strengthOfSchedule.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strength of Record:</span>
                    <span className="font-bold">{analytics.schedule.strengthOfRecord.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining SOS:</span>
                    <span className="font-bold">{analytics.schedule.remainingStrength.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Home Games:</span>
                    <span className="font-bold">{analytics.schedule.gameEnvironments.homeGames}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prime Time:</span>
                    <span className="font-bold">{analytics.schedule.gameEnvironments.primetime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offense' && (
          <div className="space-y-8">
            {/* Offensive Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaBolt className="mr-3 text-yellow-600" />
                Offensive Performance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">{analytics.stats.offense.pointsPerGame.toFixed(1)}</div>
                  <div className="text-sm text-yellow-600">Points/Game</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{analytics.stats.offense.totalYardsPerGame.toFixed(0)}</div>
                  <div className="text-sm text-blue-600">Total Yards/Game</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{analytics.stats.offense.yardsPerPlay.toFixed(1)}</div>
                  <div className="text-sm text-green-600">Yards/Play</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">{analytics.stats.offense.redZoneEfficiency.toFixed(1)}%</div>
                  <div className="text-sm text-purple-600">Red Zone %</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold mb-4">Passing Offense</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Pass Yards/Game:</span>
                      <span className="font-bold">{analytics.stats.offense.passingYardsPerGame.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pass Efficiency:</span>
                      <span className="font-bold">{analytics.ratings.sp.offense.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passing PPA:</span>
                      <span className="font-bold">{analytics.ppa.situational.passing.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Rushing Offense</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Rush Yards/Game:</span>
                      <span className="font-bold">{analytics.stats.offense.rushingYardsPerGame.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rush Efficiency:</span>
                      <span className="font-bold">{(analytics.ratings.sp.offense * 0.8).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rushing PPA:</span>
                      <span className="font-bold">{analytics.ppa.situational.rushing.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'defense' && (
          <div className="space-y-8">
            {/* Defensive Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaShieldAlt className="mr-3 text-red-600" />
                Defensive Performance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">{analytics.stats.defense.pointsAllowedPerGame.toFixed(1)}</div>
                  <div className="text-sm text-red-600">Points Allowed/Game</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{analytics.stats.defense.totalYardsAllowedPerGame.toFixed(0)}</div>
                  <div className="text-sm text-blue-600">Yards Allowed/Game</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{analytics.stats.defense.sacksPerGame.toFixed(1)}</div>
                  <div className="text-sm text-green-600">Sacks/Game</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">{analytics.stats.defense.turnoversCreatedPerGame.toFixed(1)}</div>
                  <div className="text-sm text-purple-600">Turnovers/Game</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold mb-4">Pass Defense</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Pass Yards Allowed:</span>
                      <span className="font-bold">{analytics.stats.defense.passingYardsAllowedPerGame.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pass Defense Rating:</span>
                      <span className="font-bold">{analytics.ratings.sp.defense.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Third Down Stops:</span>
                      <span className="font-bold">{analytics.stats.defense.thirdDownStops.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Rush Defense</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Rush Yards Allowed:</span>
                      <span className="font-bold">{analytics.stats.defense.rushingYardsAllowedPerGame.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TFL/Game:</span>
                      <span className="font-bold">{analytics.stats.defense.tacklesForLossPerGame.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Red Zone Defense:</span>
                      <span className="font-bold">{analytics.stats.defense.redZoneDefense.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-8">
            {/* Advanced Analytics */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaRocket className="mr-3 text-purple-600" />
                Advanced Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-4">Efficiency Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall:</span>
                      <span className="font-bold">{(analytics.advanced.efficiency.overall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard Downs:</span>
                      <span className="font-bold">{(analytics.advanced.efficiency.standardDowns * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passing Downs:</span>
                      <span className="font-bold">{(analytics.advanced.efficiency.passingDowns * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-4">Explosiveness</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall:</span>
                      <span className="font-bold">{(analytics.advanced.explosiveness.overall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passing:</span>
                      <span className="font-bold">{(analytics.advanced.explosiveness.passing * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rushing:</span>
                      <span className="font-bold">{(analytics.advanced.explosiveness.rushing * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-4">Field Position</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Avg Start:</span>
                      <span className="font-bold">{analytics.advanced.fieldPosition.averageStart.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Given:</span>
                      <span className="font-bold">{analytics.advanced.fieldPosition.averageGiven.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Advantage:</span>
                      <span className="font-bold">{analytics.advanced.fieldPosition.fieldPositionAdvantage.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PPA Breakdown */}
              <div className="mt-8">
                <h4 className="font-bold mb-4">Predicted Points Added (PPA)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-700">{analytics.ppa.overall.offense.toFixed(2)}</div>
                    <div className="text-sm text-yellow-600">Offensive PPA</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700">{analytics.ppa.overall.defense.toFixed(2)}</div>
                    <div className="text-sm text-red-600">Defensive PPA</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700">{analytics.ppa.situational.firstDown.toFixed(2)}</div>
                    <div className="text-sm text-blue-600">1st Down PPA</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">{analytics.ppa.situational.thirdDown.toFixed(2)}</div>
                    <div className="text-sm text-green-600">3rd Down PPA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recruiting' && (
          <div className="space-y-8">
            {/* Recruiting Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaGraduationCap className="mr-3 text-indigo-600" />
                Recruiting & Talent Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold mb-4">Current Recruiting Class</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Class Rank:</span>
                      <span className="font-bold">#{analytics.recruiting.currentClass.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Points:</span>
                      <span className="font-bold">{analytics.recruiting.currentClass.points.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commits:</span>
                      <span className="font-bold">{analytics.recruiting.currentClass.commits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Rating:</span>
                      <span className="font-bold">{analytics.recruiting.currentClass.avgRating.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-4">Talent Composition</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Overall Talent:</span>
                      <span className="font-bold">{analytics.recruiting.talent.overall.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Freshman:</span>
                      <span className="font-bold">{analytics.recruiting.talent.freshman.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upperclassmen:</span>
                      <span className="font-bold">{(analytics.recruiting.talent.junior + analytics.recruiting.talent.senior).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold mb-4">Transfer Portal Activity</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.recruiting.portal.additions}</div>
                    <div className="text-sm text-gray-600">Additions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analytics.recruiting.portal.departures}</div>
                    <div className="text-sm text-gray-600">Departures</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${analytics.recruiting.portal.netRating >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.recruiting.portal.netRating >= 0 ? '+' : ''}{analytics.recruiting.portal.netRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Net Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'betting' && (
          <div className="space-y-8">
            {/* Betting Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaTarget className="mr-3 text-green-600" />
                Betting Market Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold mb-4">Season Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>ATS Record:</span>
                      <span className="font-bold">{analytics.betting.seasonRecord.ats.wins}-{analytics.betting.seasonRecord.ats.losses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>O/U Record:</span>
                      <span className="font-bold">{analytics.betting.seasonRecord.overUnder.overs}O-{analytics.betting.seasonRecord.overUnder.unders}U</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Spread:</span>
                      <span className="font-bold">{analytics.betting.market.averageSpread >= 0 ? '+' : ''}{analytics.betting.market.averageSpread.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Total:</span>
                      <span className="font-bold">{analytics.betting.market.averageTotal.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-4">Market Position</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Public Betting:</span>
                      <span className="font-bold">{analytics.betting.market.publicBettingPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sharp Action:</span>
                      <span className="font-bold capitalize">{analytics.betting.market.sharpAction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Championship Odds:</span>
                      <span className="font-bold">{analytics.betting.futures.championshipOdds}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Playoff Odds:</span>
                      <span className="font-bold">{analytics.betting.futures.playoffOdds.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-green-800 mb-4">Season Win Total</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-700">{analytics.betting.futures.winTotal.toFixed(1)}</div>
                  <div className="text-sm text-green-600">Projected Wins</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Current: {analytics.record.wins} wins | Remaining games could push total {analytics.record.wins > analytics.betting.futures.winTotal ? 'over' : 'under'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAdvancedAnalytics;
