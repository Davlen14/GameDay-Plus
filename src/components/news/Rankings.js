import React, { useState, useEffect } from 'react';
import { rankingsService, teamService } from '../../services';

const Rankings = () => {
  const [rankings, setRankings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPoll, setSelectedPoll] = useState('AP Top 25');

  // Get team logo from teams data
  const getTeamLogo = (teamName) => {
    const team = teams.find(t => t.school === teamName);
    return team?.logos?.[0] || '/photos/ncaaf.png'; // Use first logo or fallback
  };

  // Get team mascot from teams data
  const getTeamMascot = (teamName) => {
    const team = teams.find(t => t.school === teamName);
    return team?.mascot || null;
  };

  // Get conference logo based on conference name
  const getConferenceLogo = (conferenceName) => {
    if (!conferenceName) return null;
    
    // Skip FCS conferences as mentioned
    if (conferenceName.toLowerCase().includes('fcs') || 
        conferenceName.toLowerCase().includes('subdivision')) {
      return null;
    }

    const conferenceLogos = {
      'ACC': '/photos/ACC.png',
      'American Athletic': '/photos/American Athletic.png',
      'Big 12': '/photos/Big 12.png',
      'Big Ten': '/photos/Big Ten.png',
      'Conference USA': '/photos/Conference USA.png',
      'FBS Independents': '/photos/FBS Independents.png',
      'Mid-American': '/photos/Mid-American.png',
      'Mountain West': '/photos/Mountain West.png',
      'Pac-12': '/photos/Pac-12.png',
      'SEC': '/photos/SEC.png'
    };

    // Try exact match first
    if (conferenceLogos[conferenceName]) {
      return conferenceLogos[conferenceName];
    }

    // Try partial matches for common variations
    const lowerConf = conferenceName.toLowerCase();
    if (lowerConf.includes('acc')) return conferenceLogos['ACC'];
    if (lowerConf.includes('american')) return conferenceLogos['American Athletic'];
    if (lowerConf.includes('big 12') || lowerConf.includes('big12')) return conferenceLogos['Big 12'];
    if (lowerConf.includes('big ten') || lowerConf.includes('b1g')) return conferenceLogos['Big Ten'];
    if (lowerConf.includes('conference usa') || lowerConf.includes('c-usa')) return conferenceLogos['Conference USA'];
    if (lowerConf.includes('independent')) return conferenceLogos['FBS Independents'];
    if (lowerConf.includes('mac') || lowerConf.includes('mid-american')) return conferenceLogos['Mid-American'];
    if (lowerConf.includes('mountain west') || lowerConf.includes('mw')) return conferenceLogos['Mountain West'];
    if (lowerConf.includes('pac-12') || lowerConf.includes('pac12')) return conferenceLogos['Pac-12'];
    if (lowerConf.includes('sec')) return conferenceLogos['SEC'];

    return null;
  };

  // Get poll logo based on poll name
  const getPollLogo = (pollName) => {
    const pollLogos = {
      'AP Top 25': '/photos/AP25.jpg',
      'Coaches Poll': '/photos/USA-Today-Logo.png',
      'FCS Coaches Poll': '/photos/fcs.png'
    };
    
    return pollLogos[pollName] || null;
  };

  // Filter to only show desired polls
  const allowedPolls = ['AP Top 25', 'Coaches Poll', 'FCS Coaches Poll'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both rankings and team data in parallel
        const [rankingsData, teamsData] = await Promise.all([
          rankingsService.getHistoricalRankings(2024, 1, 'postseason'),
          teamService.getAllTeams()
        ]);
        
        console.log('Rankings data:', rankingsData);
        console.log('Teams data:', teamsData);
        
        setRankings(rankingsData);
        setTeams(teamsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get the latest rankings for the selected poll
  const getLatestRankings = () => {
    if (!rankings.length) return [];
    
    // Find the most recent week with the selected poll
    for (let i = rankings.length - 1; i >= 0; i--) {
      const weekData = rankings[i];
      const pollData = weekData.polls?.find(poll => poll.poll === selectedPoll);
      if (pollData) {
        return {
          ...pollData,
          season: weekData.season,
          week: weekData.week,
          seasonType: weekData.seasonType
        };
      }
    }
    return null;
  };

  const latestRankings = getLatestRankings();
  const availablePolls = rankings.length > 0 ? 
    [...new Set(rankings.flatMap(week => week.polls?.map(poll => poll.poll) || []))]
      .filter(poll => allowedPolls.includes(poll)) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-red-500 to-red-600 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xl gradient-text font-bold">Loading Rankings...</p>
              <p className="text-gray-600">Fetching the latest college football rankings</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-red-50 to-red-100 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Error loading rankings: {error}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="relative z-10">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black gradient-text mb-6 tracking-tight">
              RANKINGS
            </h1>
            <div className="w-24 h-1 gradient-bg mx-auto mb-6 rounded-full"></div>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Live college football rankings from <span className="gradient-text font-bold">official polls</span> 
              <br className="hidden md:block" />
              Track your team's journey to the championship
            </p>
          </div>
        </div>

        {/* Poll Selector */}
        <div className="w-[98%] mx-auto mb-12">
          <div className="bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold gradient-text">Select Poll</h2>
              <div className="hidden md:flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm">Live Updates</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {availablePolls.map(poll => (
                <button
                  key={poll}
                  onClick={() => setSelectedPoll(poll)}
                  className={`group relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedPoll === poll
                      ? 'border-red-400 bg-gradient-to-r from-red-50 to-red-100 shadow-lg shadow-red-200/50'
                      : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2 sm:space-y-4">
                    {getPollLogo(poll) && (
                      <div className="relative">
                        <img 
                          src={getPollLogo(poll)} 
                          alt={`${poll} logo`}
                          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                          style={{
                            filter: 'brightness(1.1) contrast(1.2) saturate(1.3)',
                            background: 'linear-gradient(145deg, #f0f0f0, #d0d0d0)',
                            borderRadius: '8px',
                            padding: '4px',
                            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.8)',
                            transform: 'perspective(100px) rotateX(5deg)'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div 
                          className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)'
                          }}
                        ></div>
                      </div>
                    )}
                    <span className={`font-bold text-sm sm:text-base md:text-lg transition-all duration-300 text-center ${
                      selectedPoll === poll ? 'gradient-text' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {poll}
                    </span>
                  </div>
                  {selectedPoll === poll && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-100/30 to-red-200/30 rounded-xl animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rankings Display */}
        {latestRankings && (
          <div className="w-[98%] mx-auto">
            <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-b border-gray-200 p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    {getPollLogo(selectedPoll) && (
                      <div className="relative">
                        <img 
                          src={getPollLogo(selectedPoll)} 
                          alt={`${selectedPoll} logo`}
                          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain transition-all duration-300 hover:scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                          style={{
                            filter: 'brightness(1.1) contrast(1.2) saturate(1.3)',
                            background: 'linear-gradient(145deg, #f0f0f0, #d0d0d0)',
                            borderRadius: '8px',
                            padding: '4px',
                            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.8)',
                            transform: 'perspective(100px) rotateX(5deg)'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div 
                          className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)'
                          }}
                        ></div>
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black gradient-text">{selectedPoll}</h2>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">Official College Football Rankings</p>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200">
                    <div className="text-gray-700 text-sm font-medium">
                      <span className="gradient-text font-bold">{latestRankings.season}</span> Season 
                      <span className="mx-2">•</span> 
                      Week <span className="gradient-text font-bold">{latestRankings.week}</span>
                      <span className="mx-2">•</span> 
                      <span className="text-yellow-600">{latestRankings.seasonType}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Rankings List */}
              <div className="p-3 sm:p-4 md:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {latestRankings.ranks?.map((team, index) => (
                    <div 
                      key={team.rank} 
                      className="group relative bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm border border-gray-200 rounded-xl p-3 sm:p-4 hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      {/* Rank Badge */}
                      <div className="absolute -left-1 sm:-left-2 -top-1 sm:-top-2">
                        <div className="relative">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 gradient-bg rounded-full flex items-center justify-center font-black text-white text-sm sm:text-base md:text-lg shadow-lg border-2 sm:border-4 border-white group-hover:scale-110 transition-transform duration-300">
                            {team.rank}
                          </div>
                          {team.rank <= 3 && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between ml-4 sm:ml-8">
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
                          {/* Team Logo */}
                          <div className="relative group">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 p-1 bg-gray-50 rounded-xl backdrop-blur-sm border border-gray-200 group-hover:bg-gray-100 transition-all duration-300">
                              <img 
                                src={getTeamLogo(team.school)} 
                                alt={`${team.school} logo`}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = '/photos/ncaaf.png';
                                }}
                              />
                            </div>
                          </div>

                          {/* Conference Logo - aligned to bottom */}
                          {getConferenceLogo(team.conference) && (
                            <div className="relative group mb-1 hidden sm:block">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 p-1 bg-gray-100 rounded-lg backdrop-blur-sm border border-gray-200 group-hover:bg-gray-200 transition-all duration-300">
                                <img 
                                  src={getConferenceLogo(team.conference)} 
                                  alt={`${team.conference} logo`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Team Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 transition-all duration-300 truncate">
                              {team.school}
                            </h3>
                            {getTeamMascot(team.school) && (
                              <p className="text-sm sm:text-base md:text-lg gradient-text font-semibold mt-1 truncate">
                                {getTeamMascot(team.school)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right space-y-1 sm:space-y-2 ml-2">
                          {team.points > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg px-2 py-1 sm:px-3 sm:py-2">
                              <div className="text-blue-700 text-xs font-medium">Points</div>
                              <div className="text-gray-900 text-sm sm:text-lg md:text-xl font-bold">{team.points}</div>
                            </div>
                          )}
                          {team.firstPlaceVotes > 0 && (
                            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg px-2 py-1 sm:px-3 sm:py-2">
                              <div className="text-yellow-700 text-xs font-medium">1st Place</div>
                              <div className="gradient-text text-sm sm:text-lg font-bold">{team.firstPlaceVotes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-2 text-gray-600 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 text-sm">
                      <span>Powered by College Football Data API</span>
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
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

export default Rankings;
