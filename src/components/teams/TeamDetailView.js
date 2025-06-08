import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/teamService';

const TeamDetailView = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

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
        const teamIdMatch = hash.match(/team-detail-(\d+)/);
        
        if (!teamIdMatch) {
          setLoading(false);
          return;
        }
        
        const teamId = parseInt(teamIdMatch[1]);
        
        // Try to get team from localStorage first (faster)
        const cachedTeam = localStorage.getItem('selectedTeamData');
        if (cachedTeam) {
          const parsedTeam = JSON.parse(cachedTeam);
          if (parsedTeam.id === teamId) {
            setTeam(parsedTeam);
            // Check if team is in favorites
            const favorites = JSON.parse(localStorage.getItem('favoriteTeams') || '[]');
            setIsFavorite(favorites.some(fav => fav.id === parsedTeam.id));
            setLoading(false);
            return;
          }
        }
        
        // Fallback: load from API
        const teams = await teamService.getFBSTeams(true);
        const foundTeam = teams.find(t => t.id === teamId);
        
        if (foundTeam) {
          setTeam(foundTeam);
          // Check if team is in favorites
          const favorites = JSON.parse(localStorage.getItem('favoriteTeams') || '[]');
          setIsFavorite(favorites.some(fav => fav.id === foundTeam.id));
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
      <div className="min-h-screen pt-32 px-2 md:px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen pt-32 px-2 md:px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <i className="fas fa-exclamation-triangle text-6xl text-gray-300 mb-6"></i>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Team Not Found</h3>
            <p className="text-gray-500 text-lg">
              The team you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const teamLogo = team.logos?.[0];
  const primaryColor = team.color || '#dc2626';
  const secondaryColor = team.alternateColor || '#991b1b';

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => window.location.hash = 'teams'}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-300 font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to All Teams</span>
          </button>
        </div>
      </div>

      {/* Galaxy Background Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Animated Galaxy Background */}
        <div className="absolute inset-0">
          {/* Stars Layer 1 */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={`star1-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
          
          {/* Stars Layer 2 - Larger */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={`star2-${i}`}
                className="absolute w-2 h-2 bg-blue-200 rounded-full animate-pulse opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Nebula Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse"></div>
          
          {/* Rotating Galaxy Rings */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 border border-blue-500/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="absolute inset-8 border border-purple-500/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-16 border border-indigo-500/20 rounded-full animate-spin" style={{ animationDuration: '25s' }}></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            {/* Team Logo with Enhanced 3D Metallic Effect */}
            <div className="relative inline-block mb-8">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 w-48 h-48 mx-auto">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30 blur-2xl animate-pulse"></div>
              </div>
              
              {/* Main Logo Container */}
              <div className="relative w-40 h-40 mx-auto">
                {/* Shadow Layers */}
                <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600 shadow-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                <div className="absolute inset-2 w-36 h-36 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500 shadow-xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-500"></div>
                
                {/* Main Logo Frame */}
                <div className="absolute inset-4 w-32 h-32 rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-300 shadow-inner overflow-hidden border-4 border-white/50 backdrop-blur-sm">
                  {teamLogo ? (
                    <img
                      src={teamLogo}
                      alt={team.school}
                      className="w-full h-full object-contain p-3 filter drop-shadow-2xl"
                      style={{
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) contrast(1.1) saturate(1.2)',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-university text-gray-600 text-4xl"></i>
                    </div>
                  )}
                </div>

                {/* Floating Orbs */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-bounce opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-0 -left-6 w-4 h-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full shadow-lg animate-bounce opacity-70" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>

            {/* Team Information */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
                {team.school}
              </h1>
              <p className="text-2xl md:text-3xl text-gray-300 font-semibold">
                {team.mascot}
              </p>
              
              {/* Conference and Location */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                  <i className="fas fa-layer-group text-blue-400"></i>
                  <span className="text-white font-medium">{team.conference}</span>
                </div>
                
                {team.location && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                    <i className="fas fa-map-marker-alt text-red-400"></i>
                    <span className="text-white font-medium">{team.location}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <button
                  onClick={toggleFavorite}
                  className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                    isFavorite
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/25'
                      : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <i className={`fas fa-star ${isFavorite ? 'text-white' : 'text-yellow-400'}`}></i>
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                
                <button className="px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
                  <i className="fas fa-plus text-white"></i>
                  Follow Team
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Team Colors Gradient Bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-2"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
          }}
        ></div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-8 py-6 font-semibold transition-all duration-300 border-b-4 flex items-center gap-3 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-xl">
          {/* Coming Soon Content */}
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              {/* Animated Icon Background */}
              <div className="absolute inset-0 w-24 h-24 mx-auto">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 blur-xl animate-pulse"></div>
              </div>
              
              {/* Main Icon */}
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                <i className={`fas ${tabs.find(t => t.id === activeTab)?.icon} text-white text-3xl`}></i>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              {tabs.find(t => t.id === activeTab)?.label} Coming Soon
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              We're working hard to bring you comprehensive {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} data 
              for {team.school}. Stay tuned for an amazing experience!
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {getTabFeatures(activeTab).map((feature, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <i className={`fas ${feature.icon} text-white`}></i>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
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
