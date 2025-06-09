import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services/teamService';
import ADVScheduleTab from './ADVScheduleTab';

const TeamDetailView = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(4); // Start with Schedule like SwiftUI
  const [isFavorite, setIsFavorite] = useState(false);
  const [animateGalaxy, setAnimateGalaxy] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  // Generate static positions for cosmic elements (like SwiftUI)
  const galaxyElements = useMemo(() => ({
    mainStars: [...Array(50)].map((_, i) => ({
      id: `main-star-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: i * 0.1,
      duration: Math.random() * 4 + 2,
      scale: Math.random() * 1.5 + 0.3,
    })),
    twinkleStars: [...Array(30)].map((_, i) => ({
      id: `twinkle-star-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      delay: i * 0.2,
      duration: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
    })),
    lightParticles: [...Array(15)].map((_, i) => ({
      id: `particle-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 10 + 6,
      delay: i * 0.3,
      duration: Math.random() * 4 + 4,
      offsetX: Math.random() * 40 - 20,
      offsetY: Math.random() * 30 - 15,
    })),
    crystalParticles: [...Array(20)].map((_, i) => ({
      id: `crystal-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: i * 0.15,
      duration: Math.random() * 6 + 3,
      brightness: Math.random() * 0.8 + 0.4,
    })),
  }), []);

  const tabs = [
    { id: 0, label: 'OVERVIEW', icon: 'fa-home' },
    { id: 1, label: 'ANALYTICS', icon: 'fa-chart-line' },
    { id: 2, label: 'HISTORY', icon: 'fa-trophy' },
    { id: 3, label: 'MATCHUPS', icon: 'fa-vs' },
    { id: 4, label: 'SCHEDULE', icon: 'fa-calendar' },
    { id: 5, label: 'MEDIA', icon: 'fa-play-circle' },
    { id: 6, label: 'PROJECTIONS', icon: 'fa-chart-bar' },
    { id: 7, label: 'FACILITIES', icon: 'fa-building' },
    { id: 8, label: 'CULTURE', icon: 'fa-users' },
  ];

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const hash = window.location.hash;
        const teamIdMatch = hash.match(/team-detail-(\d+)/);
        
        if (!teamIdMatch) {
          setLoading(false);
          return;
        }
        
        const teamId = parseInt(teamIdMatch[1]);
        
        const cachedTeam = localStorage.getItem('selectedTeamData');
        if (cachedTeam) {
          try {
            const parsedTeam = JSON.parse(cachedTeam);
            if (parsedTeam && parsedTeam.id === teamId) {
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
              
              setTeam(cleanedTeam);
              const favorites = JSON.parse(localStorage.getItem('favoriteTeams') || '[]');
              setIsFavorite(favorites.some(fav => fav.id === cleanedTeam.id));
              setLoading(false);
              return;
            }
          } catch (e) {
            console.log('Error parsing cached team data:', e);
          }
        }
        
        const teams = await teamService.getFBSTeams(true);
        const foundTeam = teams.find(t => t.id === teamId);
        
        if (foundTeam) {
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
          
          setTeam(cleanedTeam);
          localStorage.setItem('selectedTeamData', JSON.stringify(cleanedTeam));
          
          const favorites = JSON.parse(localStorage.getItem('favoriteTeams') || '[]');
          setIsFavorite(favorites.some(fav => fav.id === cleanedTeam.id));
        }
      } catch (error) {
        console.error('Error loading team:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeam();
  }, []);

  // Start animations after component mounts (like SwiftUI onAppear)
  useEffect(() => {
    if (!loading && team) {
      const timer1 = setTimeout(() => {
        setAnimateGalaxy(true);
      }, 500);
      
      const timer2 = setTimeout(() => {
        setAnimateCards(true);
      }, 200);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [loading, team]);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-red-500 to-red-600 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl gradient-text font-bold">Loading...</p>
            <p className="text-gray-600">Fetching team data</p>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-7xl text-gray-300 mb-8"></i>
          <h3 className="text-3xl font-bold text-gray-700 mb-6">Team Not Found</h3>
          <p className="text-gray-500 text-xl">The team you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const teamLogo = team.logos?.[0];
  const secureTeamLogo = teamLogo ? teamLogo.replace(/^http:/, 'https:') : null;
  const primaryColor = team.color || '#dc2626';
  const secondaryColor = team.alternateColor || '#991b1b';

  // Convert hex to RGB for CSS
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 220, g: 38, b: 38 };
  };

  const teamRgb = hexToRgb(primaryColor);
  const teamColorRgb = `${teamRgb.r}, ${teamRgb.g}, ${teamRgb.b}`;

  return (
    <div className="min-h-screen bg-white">
      {/* HD Galaxy Header - Enhanced Crisp Version */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          height: '415px',
          background: `linear-gradient(135deg, 
            rgba(${teamColorRgb}, 0.95) 0%, 
            rgba(${teamColorRgb}, 1) 20%, 
            rgba(${teamColorRgb}, 0.85) 40%, 
            rgba(${teamColorRgb}, 1) 60%, 
            rgba(${teamColorRgb}, 0.9) 80%, 
            rgba(${teamColorRgb}, 0.95) 100%)`,
          filter: 'contrast(1.1) saturate(1.2) brightness(1.05)',
        }}
      >
        {/* Back Button - Positioned inside galaxy header */}
        <div className="absolute top-8 left-5 z-50">
          <button
            onClick={() => window.location.hash = 'teams'}
            className="flex items-center gap-2 text-white px-4 py-2.5 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-chevron-left text-sm font-semibold"></i>
            <span className="font-medium text-sm tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Back</span>
          </button>
        </div>

        {/* HD Galaxy Texture Overlay */}
        <div className="absolute inset-0">
          {/* Enhanced First Galaxy Core */}
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 150px 100px at 30% 30%, 
                rgba(${teamColorRgb}, 0.4) 0%, 
                rgba(${teamColorRgb}, 0.1) 15%,
                transparent 25%, 
                rgba(${teamColorRgb}, 0.25) 45%, 
                transparent 65%, 
                rgba(${teamColorRgb}, 0.5) 85%, 
                transparent 100%)`,
              transform: animateGalaxy ? 'scale(1.1) rotate(360deg)' : 'scale(0.9) rotate(0deg)',
              transition: 'transform 20s linear infinite',
              filter: 'blur(0.5px) brightness(1.2)',
            }}
          />
          
          {/* Enhanced Second Galaxy Core */}
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 120px 80px at 70% 70%, 
                transparent 0%, 
                rgba(${teamColorRgb}, 0.15) 20%,
                transparent 35%, 
                rgba(${teamColorRgb}, 0.35) 55%, 
                transparent 75%,
                rgba(${teamColorRgb}, 0.2) 90%,
                transparent 100%)`,
              transform: animateGalaxy ? 'scale(0.8) rotate(-180deg)' : 'scale(1.2) rotate(180deg)',
              transition: 'transform 15s linear infinite',
              filter: 'blur(0.3px) brightness(1.15)',
            }}
          />

          {/* HD Crystal Star Field - Main Stars */}
          {galaxyElements.mainStars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 40%, transparent 100%)',
                transform: animateGalaxy ? `scale(${star.scale * 1.8})` : `scale(${star.scale * 1.2})`,
                transition: `transform ${star.duration}s ease-in-out infinite`,
                transitionDelay: `${star.delay}s`,
                animationDirection: 'alternate',
                filter: 'brightness(1.4) contrast(1.2)',
                boxShadow: '0 0 6px rgba(255,255,255,0.8), 0 0 12px rgba(255,255,255,0.4)',
              }}
            />
          ))}

          {/* HD Twinkling Stars Layer */}
          {galaxyElements.twinkleStars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 30%, transparent 100%)',
                opacity: animateGalaxy ? star.opacity : star.opacity * 0.6,
                transition: `opacity ${star.duration}s ease-in-out infinite`,
                transitionDelay: `${star.delay}s`,
                animationDirection: 'alternate',
                filter: 'brightness(1.6) saturate(1.1)',
                boxShadow: '0 0 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.5)',
              }}
            />
          ))}

          {/* HD Crystal Particles */}
          {galaxyElements.crystalParticles.map((crystal) => (
            <div
              key={crystal.id}
              className="absolute rounded-full"
              style={{
                left: `${crystal.left}%`,
                top: `${crystal.top}%`,
                width: `${crystal.size}px`,
                height: `${crystal.size}px`,
                background: `radial-gradient(circle, 
                  rgba(255, 255, 255, ${crystal.brightness}) 0%, 
                  rgba(${teamColorRgb}, 0.4) 30%,
                  rgba(255, 255, 255, 0.3) 60%, 
                  transparent 100%)`,
                transform: animateGalaxy 
                  ? `scale(${Math.random() * 0.8 + 0.6}) rotate(${Math.random() * 360}deg)` 
                  : `scale(${Math.random() * 0.5 + 0.3}) rotate(0deg)`,
                transition: `transform ${crystal.duration}s ease-in-out infinite`,
                transitionDelay: `${crystal.delay}s`,
                animationDirection: 'alternate',
                filter: 'brightness(1.3) contrast(1.1) saturate(1.2)',
                boxShadow: `0 0 8px rgba(${teamColorRgb}, 0.6), 0 0 16px rgba(255,255,255,0.3)`,
              }}
            />
          ))}

          {/* HD Nebula Swirls */}
          <div 
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg at 20% 80%, 
                rgba(${teamColorRgb}, 0.18) 0deg,
                transparent 60deg, 
                rgba(${teamColorRgb}, 0.12) 120deg, 
                transparent 180deg,
                rgba(${teamColorRgb}, 0.08) 240deg,
                transparent 300deg,
                rgba(${teamColorRgb}, 0.15) 360deg)`,
              transform: animateGalaxy ? 'rotate(90deg) scale(1.1)' : 'rotate(-90deg) scale(0.9)',
              transition: 'transform 25s ease-in-out infinite',
              animationDirection: 'alternate',
              filter: 'blur(1px) brightness(1.1)',
            }}
          />
          
          <div 
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 180deg at 80% 20%, 
                transparent 0deg,
                rgba(${teamColorRgb}, 0.15) 60deg, 
                transparent 120deg, 
                rgba(${teamColorRgb}, 0.08) 180deg,
                transparent 240deg,
                rgba(${teamColorRgb}, 0.12) 300deg,
                transparent 360deg)`,
              transform: animateGalaxy ? 'rotate(-120deg) scale(0.9)' : 'rotate(120deg) scale(1.1)',
              transition: 'transform 30s ease-in-out infinite',
              animationDirection: 'alternate',
              filter: 'blur(0.8px) brightness(1.05)',
            }}
          />

          {/* HD Floating Light Particles */}
          {galaxyElements.lightParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `radial-gradient(circle, 
                  rgba(255, 255, 255, 0.8) 0%, 
                  rgba(${teamColorRgb}, 0.4) 30%,
                  rgba(255, 255, 255, 0.3) 60%, 
                  transparent 100%)`,
                transform: animateGalaxy 
                  ? `translate(${particle.offsetX}px, ${particle.offsetY}px) scale(${Math.random() * 0.6 + 0.8})` 
                  : `translate(${particle.offsetX * -0.5}px, ${particle.offsetY * -0.5}px) scale(${Math.random() * 0.4 + 0.6})`,
                transition: `transform ${particle.duration}s ease-in-out infinite`,
                transitionDelay: `${particle.delay}s`,
                animationDirection: 'alternate',
                filter: 'brightness(1.4) contrast(1.2)',
                boxShadow: `0 0 12px rgba(${teamColorRgb}, 0.5), 0 0 24px rgba(255,255,255,0.3)`,
              }}
            />
          ))}

          {/* HD Color Waves */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${animateGalaxy ? '45deg' : '225deg'}, 
                rgba(${teamColorRgb}, 0.08) 0%, 
                transparent 20%, 
                rgba(${teamColorRgb}, 0.12) 40%, 
                transparent 60%, 
                rgba(${teamColorRgb}, 0.06) 80%,
                transparent 100%)`,
              transition: 'background 12s ease-in-out infinite',
              animationDirection: 'alternate',
              filter: 'blur(0.5px) brightness(1.1)',
            }}
          />

          {/* HD Shimmer Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(45deg, 
                transparent 0%, 
                rgba(255,255,255,0.1) 20%,
                transparent 40%, 
                rgba(255,255,255,0.05) 60%,
                transparent 80%,
                rgba(255,255,255,0.08) 100%)`,
              transform: animateGalaxy ? 'translateX(100%)' : 'translateX(-100%)',
              transition: 'transform 8s ease-in-out infinite',
              animationDirection: 'alternate',
            }}
          />
        </div>

        {/* Header Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pt-6">
          {/* Team Logo with Premium Effects - BIGGER SIZE */}
          <div 
            className="mb-5 metallic-3d-logo-container"
            style={{
              transform: animateCards ? 'scale(1.0)' : 'scale(0.8)',
              opacity: animateCards ? 1 : 0,
              transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            {secureTeamLogo ? (
              <img
                src={secureTeamLogo}
                alt={team.school}
                className="w-56 h-56 metallic-3d-logo-enhanced"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-56 h-56 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
              style={{ display: secureTeamLogo ? 'none' : 'flex' }}
            >
              <i className="fas fa-university text-white text-7xl filter drop-shadow-lg"></i>
            </div>
          </div>

          {/* Team Info */}
          <div 
            className="text-center"
            style={{
              transform: animateCards ? 'translateY(0)' : 'translateY(20px)',
              opacity: animateCards ? 1 : 0,
              transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s',
            }}
          >
            <h1 className="text-3xl font-black text-white mb-2 tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {team.school.toUpperCase()}
            </h1>
            
            <div className="flex items-center justify-center gap-4">
              {team.mascot && (
                <span 
                  className="text-sm font-bold" 
                  style={{ 
                    fontFamily: 'Orbitron, sans-serif', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    color: secondaryColor
                  }}
                >
                  {team.mascot}
                </span>
              )}
              
              {team.mascot && team.conference && (
                <span style={{ color: secondaryColor }}>•</span>
              )}
              
              {team.conference && (
                <span 
                  className="text-sm font-bold" 
                  style={{ 
                    fontFamily: 'Orbitron, sans-serif', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    color: secondaryColor
                  }}
                >
                  {team.conference}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Team Color Shadow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-6"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              rgba(${teamColorRgb}, 0.2) 20%,
              rgba(${teamColorRgb}, 0.6) 50%, 
              rgba(${teamColorRgb}, 0.2) 80%,
              transparent 100%)`,
            filter: 'blur(8px) brightness(1.2)',
          }}
        />
      </div>

      {/* HD Shiny Tab Selection - Centered */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-lg backdrop-blur-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex justify-center items-center gap-2 px-4 py-3 min-w-max mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-bold rounded transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={activeTab === tab.id ? {
                  background: `linear-gradient(135deg, 
                    ${primaryColor} 0%, 
                    rgba(${teamColorRgb}, 0.9) 50%, 
                    ${primaryColor} 100%)`,
                  boxShadow: `
                    0 4px 12px rgba(${teamColorRgb}, 0.4),
                    0 2px 6px rgba(${teamColorRgb}, 0.3),
                    inset 0 1px 0 rgba(255,255,255,0.3),
                    inset 0 -1px 0 rgba(0,0,0,0.1)
                  `,
                  fontFamily: 'Orbitron, sans-serif',
                  filter: 'brightness(1.05) contrast(1.1)',
                } : {
                  background: `linear-gradient(135deg, 
                    rgba(243,244,246,1) 0%, 
                    rgba(249,250,251,1) 50%, 
                    rgba(243,244,246,1) 100%)`,
                  border: '1px solid rgba(209,213,219,0.5)',
                  boxShadow: `
                    0 2px 4px rgba(0,0,0,0.05),
                    inset 0 1px 0 rgba(255,255,255,0.8),
                    inset 0 -1px 0 rgba(0,0,0,0.05)
                  `,
                  fontFamily: 'Orbitron, sans-serif',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 py-8 max-w-6xl mx-auto">
        {activeTab === 4 ? (
          <ADVScheduleTab team={team} primaryTeamColor={primaryColor} />
        ) : (
          <div className="text-center py-20">
            <div className="mb-8">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, rgba(${teamColorRgb}, 0.15) 0%, rgba(${teamColorRgb}, 0.05) 100%)`,
                  border: `2px solid rgba(${teamColorRgb}, 0.2)`
                }}
              >
                <i 
                  className="fas fa-hammer text-3xl font-bold filter drop-shadow-sm"
                  style={{ color: primaryColor }}
                ></i>
              </div>
              
              <h2 
                className="text-xl font-black mb-3"
                style={{ 
                  fontFamily: 'Orbitron, sans-serif',
                  color: primaryColor,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                COMING SOON
              </h2>
              
              <p className="text-sm font-medium text-gray-600 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                In Development
              </p>
              
              <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
                {`We're working hard to bring you comprehensive ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} data for ${team.school}. Stay tuned for an amazing experience!`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetailView;