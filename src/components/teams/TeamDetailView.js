import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services/teamService';

const TeamDetailView = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  // Add debug logging
  console.log('TeamDetailView render - team:', team, 'loading:', loading);

  // Generate static star positions to avoid re-rendering
  const starLayer1 = useMemo(() => 
    [...Array(50)].map((_, i) => ({
      id: `star1-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
    })), []
  );

  const starLayer2 = useMemo(() => 
    [...Array(30)].map((_, i) => ({
      id: `star2-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 2,
    })), []
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-home' },
    { id: 'stats', label: 'Statistics', icon: 'fa-chart-bar' },
    { id: 'roster', label: 'Roster', icon: 'fa-users' },
    { id: 'schedule', label: 'Schedule', icon: 'fa-calendar' },
    { id: 'news', label: 'News', icon: 'fa-newspaper' },
    { id: 'history', label: 'History', icon: 'fa-trophy' },
  ];

  useEffect(() => {
    const loadTeam = async () => {
      try {
        // Get team ID from hash
        const hash = window.location.hash;
        console.log('Current hash:', hash);
        
        const teamIdMatch = hash.match(/team-detail-(\d+)/);
        
        if (!teamIdMatch) {
          console.log('No team ID found in hash');
          setLoading(false);
          return;
        }
        
        const teamId = parseInt(teamIdMatch[1]);
        console.log('Team ID from hash:', teamId);
        
        // Try to get team from localStorage first (faster)
        const cachedTeam = localStorage.getItem('selectedTeamData');
        if (cachedTeam) {
          try {
            const parsedTeam = JSON.parse(cachedTeam);
            console.log('Cached team:', parsedTeam);
            
            // Validate the parsed team data
            if (parsedTeam && typeof parsedTeam === 'object' && parsedTeam.id === teamId) {
              // Ensure all required fields are strings or valid values
              const cleanedTeam = {
                ...parsedTeam,
                school: String(parsedTeam.school || 'Unknown Team'),
                mascot: String(parsedTeam.mascot || 'Unknown Mascot'),
                conference: String(parsedTeam.conference || 'Unknown Conference'),
                location: parsedTeam.location && typeof parsedTeam.location === 'object' 
                  ? `${parsedTeam.location.city || ''}${parsedTeam.location.state ? `, ${parsedTeam.location.state}` : ''}`.trim() || 'Unknown Location'
                  : String(parsedTeam.location || parsedTeam.city || 'Unknown Location'),
                logos: Array.isArray(parsedTeam.logos) ? parsedTeam.logos : [],
                color: parsedTeam.color || '#dc2626',
                alternateColor: parsedTeam.alternateColor || '#991b1b'
              };
              
              console.log('Cleaned team data:', cleanedTeam);
              setTeam(cleanedTeam);
              
              // Check if team is in favorites
              const favorites = JSON.parse(localStorage.getItem('favoriteTeams') || '[]');
              setIsFavorite(favorites.some(fav => fav.id === cleanedTeam.id));
              setLoading(false);
              return;
            }
          } catch (e) {
            console.log('Error parsing cached team data:', e);
          }
        }
        
        // Fallback: load from API
        console.log('Loading teams from API...');
        const teams = await teamService.getFBSTeams(true);
        console.log('Teams loaded:', teams.length);
        
        const foundTeam = teams.find(t => t.id === teamId);
        console.log('Found team:', foundTeam);
        
        if (foundTeam) {
          // Clean the team data before setting it
          const cleanedTeam = {
            ...foundTeam,
            school: String(foundTeam.school || 'Unknown Team'),
            mascot: String(foundTeam.mascot || 'Unknown Mascot'),
            conference: String(foundTeam.conference || 'Unknown Conference'),
            location: foundTeam.location && typeof foundTeam.location === 'object' 
              ? `${foundTeam.location.city || ''}${foundTeam.location.state ? `, ${foundTeam.location.state}` : ''}`.trim() || 'Unknown Location'
              : String(foundTeam.location || foundTeam.city || 'Unknown Location'),
            logos: Array.isArray(foundTeam.logos) ? foundTeam.logos : [],
            color: foundTeam.color || '#dc2626',
            alternateColor: foundTeam.alternateColor || '#991b1b'
          };
          
          console.log('Setting cleaned team from API:', cleanedTeam);
          setTeam(cleanedTeam);
          
          // Store for future use
          localStorage.setItem('selectedTeamData', JSON.stringify(cleanedTeam));
          
          // Check if team is in favorites
          const favorites = JSON.parse(localStorage.getItem('favoriteTeams') || '[]');
          setIsFavorite(favorites.some(fav => fav.id === cleanedTeam.id));
        } else {
          console.log('Team not found with ID:', teamId);
        }
      } catch (error) {
        console.error('Error loading team:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeam();
  }, []);

  const toggleFavorite = () => {
    if (!team) return;
    
    const favorites = JSON.parse(localStorage.getItem('favoriteTeams') || '[]');
    const updated = isFavorite
      ? favorites.filter(fav => fav.id !== team.id)
      : [...favorites, team];
    
    localStorage.setItem('favoriteTeams', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-2 md:px-4 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-padding border-l-transparent shadow-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen pt-32 px-2 md:px-4 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <i className="fas fa-exclamation-triangle text-7xl text-slate-300 mb-8 filter drop-shadow-lg"></i>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-6">Team Not Found</h3>
            <p className="text-slate-500 text-xl leading-relaxed">
              The team you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const teamLogo = team.logos?.[0];
  // Ensure HTTPS for team logos to avoid mixed content issues
  const secureTeamLogo = teamLogo ? teamLogo.replace(/^http:/, 'https:') : null;
  const primaryColor = team.color || '#dc2626';
  const secondaryColor = team.alternateColor || '#991b1b';

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* HD Back Button */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-white border-b border-slate-200/50 sticky top-20 z-50 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <button
            onClick={() => window.location.hash = 'teams'}
            className="flex items-center gap-3 text-slate-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-bold tracking-wide group"
          >
            <i className="fas fa-arrow-left filter drop-shadow-sm group-hover:transform group-hover:-translate-x-1 transition-transform duration-300"></i>
            <span>Back to All Teams</span>
          </button>
        </div>
      </div>

      {/* Modern HD Galaxy Background Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        {/* HD Galaxy Background with Shiny Effects */}
        <div className="absolute inset-0">
          {/* Sparkling Stars Layer 1 - Small diamond sparkles */}
          <div className="absolute inset-0">
            {starLayer1.map((star) => (
              <div
                key={star.id}
                className="absolute w-1 h-1 bg-white rounded-full shadow-white shadow-sm animate-pulse"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.duration}s`,
                  filter: 'brightness(1.5) contrast(1.2)',
                  boxShadow: '0 0 4px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </div>
          
          {/* Sparkling Stars Layer 2 - Larger crystal sparkles */}
          <div className="absolute inset-0">
            {starLayer2.map((star) => (
              <div
                key={star.id}
                className="absolute w-2 h-2 bg-gradient-to-br from-cyan-200 via-blue-100 to-indigo-200 rounded-full animate-pulse opacity-80"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.duration}s`,
                  filter: 'brightness(1.8) saturate(1.5)',
                  boxShadow: '0 0 6px rgba(139,69,255,0.6), 0 0 12px rgba(59,130,246,0.4), 0 0 18px rgba(14,165,233,0.2)',
                }}
              />
            ))}
          </div>

          {/* HD Nebula Cloud Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800/30 via-blue-800/25 to-indigo-800/30 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/10 via-transparent to-purple-600/15 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-700/15 to-indigo-700/20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Shiny Gradient Overlays for HD Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            {/* HD Shiny Team Logo with Crystal Effect */}
            <div className="relative inline-block mb-8">
              {/* Outer Crystal Glow */}
              <div className="absolute inset-0 w-52 h-52 mx-auto">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-cyan-400/40 via-blue-500/40 to-purple-600/40 blur-3xl animate-pulse"></div>
              </div>
              
              {/* HD Logo Container with Shiny Effects */}
              <div className="relative w-44 h-44 mx-auto">
                {/* Crystal Shadow Layers */}
                <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-white/30 via-cyan-200/25 to-blue-300/20 shadow-2xl transform rotate-3 transition-transform duration-700 hover:rotate-6"></div>
                <div className="absolute inset-1 w-42 h-42 rounded-full bg-gradient-to-br from-blue-100/25 via-indigo-200/20 to-purple-300/15 shadow-xl transform -rotate-2 transition-transform duration-700 hover:-rotate-4"></div>
                
                {/* Main HD Logo Frame */}
                <div className="absolute inset-3 w-38 h-38 rounded-full bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/85 shadow-inner overflow-hidden border-4 border-white/60 backdrop-blur-lg">
                  {secureTeamLogo ? (
                    <img
                      src={secureTeamLogo}
                      alt={team.school}
                      className="w-full h-full object-contain p-4 filter drop-shadow-2xl"
                      style={{
                        filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.4)) contrast(1.15) saturate(1.3) brightness(1.05)',
                      }}
                      onError={(e) => {
                        console.log('Logo failed to load:', secureTeamLogo);
                        e.target.style.display = 'none';
                        e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="fallback-icon w-full h-full flex items-center justify-center" style={{ display: secureTeamLogo ? 'none' : 'flex' }}>
                    <i className="fas fa-university text-slate-600 text-5xl filter drop-shadow-lg"></i>
                  </div>
                </div>

                {/* HD Floating Crystal Orbs */}
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 rounded-full shadow-lg animate-bounce opacity-90" style={{ filter: 'brightness(1.2) contrast(1.1)', boxShadow: '0 0 12px rgba(251,191,36,0.6)' }}></div>
                <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500 rounded-full shadow-lg animate-bounce opacity-85" style={{ animationDelay: '0.5s', filter: 'brightness(1.2) contrast(1.1)', boxShadow: '0 0 10px rgba(59,130,246,0.6)' }}></div>
                <div className="absolute top-1 -left-5 w-4 h-4 bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500 rounded-full shadow-lg animate-bounce opacity-80" style={{ animationDelay: '1s', filter: 'brightness(1.2) contrast(1.1)', boxShadow: '0 0 8px rgba(20,184,166,0.6)' }}></div>
              </div>
            </div>

            {/* Team Information */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
                {team.school || 'Unknown Team'}
              </h1>
              <p className="text-2xl md:text-3xl text-gray-300 font-semibold">
                {team.mascot || 'Unknown Mascot'}
              </p>
              
              {/* Conference and Location with HD Gradient Pills */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-3 bg-gradient-to-r from-white/15 via-cyan-50/10 to-blue-50/15 backdrop-blur-lg rounded-full px-8 py-4 border border-white/20 shadow-lg">
                  <i className="fas fa-layer-group text-cyan-300 filter drop-shadow-sm"></i>
                  <span className="text-white font-semibold tracking-wide">{team.conference || 'N/A'}</span>
                </div>
                
                {(team.location || team.city) && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-white/15 via-purple-50/10 to-indigo-50/15 backdrop-blur-lg rounded-full px-8 py-4 border border-white/20 shadow-lg">
                    <i className="fas fa-map-marker-alt text-purple-300 filter drop-shadow-sm"></i>
                    <span className="text-white font-semibold tracking-wide">
                      {typeof team.location === 'string' 
                        ? team.location 
                        : team.city 
                        ? `${team.city}${team.state ? `, ${team.state}` : ''}` 
                        : 'N/A'
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* HD Gradient Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
                <button
                  onClick={toggleFavorite}
                  className={`px-10 py-5 rounded-2xl font-bold transition-all duration-300 flex items-center gap-4 backdrop-blur-lg border shadow-xl transform hover:scale-105 ${
                    isFavorite
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white border-yellow-400/30 shadow-yellow-500/25'
                      : 'bg-gradient-to-r from-white/20 via-cyan-50/15 to-blue-50/20 border-white/30 text-white hover:from-white/25 hover:via-cyan-50/20 hover:to-blue-50/25'
                  }`}
                >
                  <i className={`fas fa-star ${isFavorite ? 'text-white' : 'text-yellow-300'} filter drop-shadow-sm`}></i>
                  <span className="tracking-wide">{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </button>
                
                <button className="px-10 py-5 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-4 backdrop-blur-lg border border-blue-400/30">
                  <i className="fas fa-plus text-white filter drop-shadow-sm"></i>
                  <span className="tracking-wide">Follow Team</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* HD Team Colors Gradient Bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-3"
          style={{
            background: `linear-gradient(90deg, ${primaryColor}00, ${primaryColor}80, ${secondaryColor}80, ${secondaryColor}00)`,
            filter: 'blur(0.5px) brightness(1.2)',
          }}
        ></div>
      </div>

      {/* HD Gradient Navigation Tabs */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-white shadow-xl border-b border-slate-200/50 sticky top-20 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-10 py-7 font-bold transition-all duration-300 border-b-4 flex items-center gap-4 ${
                  activeTab === tab.id
                    ? 'border-gradient-to-r from-cyan-500 to-blue-600 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-700 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50 hover:shadow-md'
                }`}
                style={activeTab === tab.id ? {
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.15) 100%)',
                  borderImage: 'linear-gradient(90deg, #06b6d4, #3b82f6) 1',
                  borderImageSlice: 1,
                  color: 'transparent',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  backgroundImage: 'linear-gradient(90deg, #0891b2, #2563eb)',
                } : {}}
              >
                <i className={`fas ${tab.icon} filter drop-shadow-sm`}></i>
                <span className="whitespace-nowrap tracking-wide">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HD Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-white via-slate-50 to-cyan-50 rounded-3xl p-12 border border-slate-200/50 shadow-2xl backdrop-blur-sm">
          {/* Coming Soon Content with HD Effects */}
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              {/* HD Animated Icon Background */}
              <div className="absolute inset-0 w-28 h-28 mx-auto">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-cyan-400/30 via-blue-500/25 to-purple-600/30 blur-2xl animate-pulse"></div>
              </div>
              
              {/* HD Main Icon */}
              <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20">
                <i className={`fas ${tabs.find(t => t.id === activeTab)?.icon} text-white text-4xl filter drop-shadow-lg`}></i>
              </div>
            </div>

            <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-8 tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label} Coming Soon
            </h2>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              We're working hard to bring you comprehensive {tabs.find(t => t.id === activeTab)?.label?.toLowerCase() || 'team'} data 
              for {team.school || 'this team'}. Stay tuned for an amazing HD experience!
            </p>

            {/* HD Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
              {getTabFeatures(activeTab).map((feature, index) => (
                <div key={index} className="bg-gradient-to-br from-white via-slate-50 to-cyan-50 rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl">
                    <i className={`fas ${feature.icon} text-white text-xl filter drop-shadow-sm`}></i>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-3 text-lg tracking-wide">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get features for each tab
const getTabFeatures = (tabId) => {
  const features = {
    overview: [
      { icon: 'fa-info-circle', title: 'Team Info', description: 'Complete team details and history' },
      { icon: 'fa-medal', title: 'Achievements', description: 'Championships and awards' },
      { icon: 'fa-chart-line', title: 'Performance', description: 'Season performance metrics' }
    ],
    stats: [
      { icon: 'fa-calculator', title: 'Advanced Stats', description: 'Detailed statistical analysis' },
      { icon: 'fa-chart-pie', title: 'Analytics', description: 'Performance breakdowns' },
      { icon: 'fa-trophy', title: 'Rankings', description: 'National and conference rankings' }
    ],
    roster: [
      { icon: 'fa-user', title: 'Player Profiles', description: 'Complete player information' },
      { icon: 'fa-graduation-cap', title: 'Coaching Staff', description: 'Coaches and support staff' },
      { icon: 'fa-users', title: 'Team Depth', description: 'Position depth charts' }
    ],
    schedule: [
      { icon: 'fa-calendar-alt', title: 'Game Schedule', description: 'Full season schedule' },
      { icon: 'fa-clock', title: 'Game Times', description: 'Times and TV coverage' },
      { icon: 'fa-map', title: 'Venues', description: 'Stadium and location info' }
    ],
    news: [
      { icon: 'fa-newspaper', title: 'Latest News', description: 'Recent team news and updates' },
      { icon: 'fa-rss', title: 'Live Updates', description: 'Real-time news feed' },
      { icon: 'fa-microphone', title: 'Interviews', description: 'Player and coach interviews' }
    ],
    history: [
      { icon: 'fa-crown', title: 'Championships', description: 'Historical achievements' },
      { icon: 'fa-star', title: 'Hall of Fame', description: 'Legendary players and coaches' },
      { icon: 'fa-book', title: 'Records', description: 'Team and individual records' }
    ]
  };
  
  return features[tabId] || features.overview;
};

export default TeamDetailView;
