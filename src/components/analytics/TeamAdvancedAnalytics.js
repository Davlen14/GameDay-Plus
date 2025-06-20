import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaArrowLeft, FaTrophy, FaFootballBall, FaShieldAlt, 
  FaBolt, FaUsers, FaStar, FaCalendarAlt
} from 'react-icons/fa';
import { teamService } from '../../services/teamService';
import { analyticsService } from '../../services/analyticsService';
import { bettingService } from '../../services/bettingService';

const TeamAdvancedAnalytics = ({ teamSlug, onNavigate }) => {
  const [team, setTeam] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Get team data
      const teamData = await teamService.getTeamByName(teamName);
      if (!teamData) {
        throw new Error('Team not found');
      }

      // Get comprehensive analytics
      const [
        teamStats,
        advancedStats,
        spRatings,
        eloRatings,
        ppaData,
        enhancedAnalytics,
        bettingData
      ] = await Promise.all([
        teamService.getTeamStats(2024, teamData.school).catch(() => null),
        teamService.getAdvancedTeamStats(2024, teamData.school).catch(() => null),
        teamService.getSPRatings(2024, teamData.school).catch(() => null),
        teamService.getEloRatings(2024, null, teamData.school).catch(() => null),
        teamService.getTeamPPA(2024, teamData.school).catch(() => null),
        analyticsService.getEnhancedTeamMetrics(teamData, 2024).catch(() => null),
        bettingService.getTeamLines(teamData.school, 2024).catch(() => null)
      ]);

      setTeam(teamData);
      setAnalytics({
        stats: teamStats?.[0] || {},
        advanced: advancedStats?.[0] || {},
        sp: spRatings?.[0] || {},
        elo: eloRatings?.[0] || {},
        ppa: ppaData?.[0] || {},
        enhanced: enhancedAnalytics || {},
        betting: bettingData || []
      });

    } catch (error) {
      console.error('Error loading team advanced analytics:', error);
      setError('Failed to load team analytics. Please try again.');
    } finally {
      setLoading(false);
    }
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
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-semibold"
          >
            <FaArrowLeft className="mr-2" />
            Back to Team Metrics
          </button>
          
          <div className="flex items-center space-x-6">
            <img 
              src={team.logos?.[0] || `/photos/${team.school}.png`} 
              alt={team.school}
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold gradient-text">{team.school}</h1>
              <p className="text-xl text-gray-600">{team.mascot}</p>
              <p className="text-lg text-gray-500">{team.conference}</p>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaChartLine className="mr-3 text-blue-600" />
              Performance Metrics
            </h2>
            
            <div className="space-y-4">
              {analytics.sp?.overall && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">SP+ Overall Rating</span>
                  <span className="text-2xl font-bold text-blue-600">{analytics.sp.overall.toFixed(1)}</span>
                </div>
              )}
              
              {analytics.elo?.elo && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Elo Rating</span>
                  <span className="text-2xl font-bold text-green-600">{Math.round(analytics.elo.elo)}</span>
                </div>
              )}
              
              {analytics.ppa?.overall?.ppa && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">PPA Overall</span>
                  <span className="text-2xl font-bold text-purple-600">{analytics.ppa.overall.ppa.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Offensive/Defensive Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaBolt className="mr-3 text-yellow-600" />
              Offensive & Defensive Analysis
            </h2>
            
            <div className="space-y-4">
              {analytics.sp?.offense && (
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="font-semibold">SP+ Offense</span>
                  <span className="text-2xl font-bold text-red-600">{analytics.sp.offense.toFixed(1)}</span>
                </div>
              )}
              
              {analytics.sp?.defense && (
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-semibold">SP+ Defense</span>
                  <span className="text-2xl font-bold text-blue-600">{analytics.sp.defense.toFixed(1)}</span>
                </div>
              )}
              
              {analytics.ppa?.offense?.ppa && (
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold">Offensive PPA</span>
                  <span className="text-2xl font-bold text-green-600">{analytics.ppa.offense.ppa.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Season Stats */}
          {analytics.stats && Object.keys(analytics.stats).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaTrophy className="mr-3 text-yellow-600" />
                Season Statistics
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {analytics.stats.wins && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{analytics.stats.wins}</div>
                    <div className="text-sm text-green-700">Wins</div>
                  </div>
                )}
                
                {analytics.stats.losses && (
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{analytics.stats.losses}</div>
                    <div className="text-sm text-red-700">Losses</div>
                  </div>
                )}
                
                {analytics.stats.totalYards && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analytics.stats.totalYards}</div>
                    <div className="text-sm text-blue-700">Total Yards</div>
                  </div>
                )}
                
                {analytics.stats.pointsFor && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analytics.stats.pointsFor}</div>
                    <div className="text-sm text-purple-700">Points Scored</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Betting Analysis */}
          {analytics.betting && analytics.betting.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaStar className="mr-3 text-purple-600" />
                Betting Market Analysis
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="font-semibold">Games with Lines</span>
                  <span className="text-2xl font-bold text-purple-600">{analytics.betting.length}</span>
                </div>
                
                {/* Add more betting analytics here */}
              </div>
            </div>
          )}
        </div>

        {/* Additional Analytics Sections */}
        {analytics.enhanced && Object.keys(analytics.enhanced).length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaUsers className="mr-3 text-indigo-600" />
              Enhanced Analytics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(analytics.enhanced).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-xl font-bold text-indigo-600">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </div>
                  <div className="text-sm text-indigo-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAdvancedAnalytics;
