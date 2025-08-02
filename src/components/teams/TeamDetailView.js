import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services/teamService';
import ADVScheduleTab from './ADVScheduleTab';
import TeamAnalytics from './TeamAnalytics';
import RosterTab from './RosterTab';
import OverviewTab from './OverviewTab';
import HistoryTab from './HistoryTab';
import MatchupsTab from './MatchupsTab';
import MediaTab from './MediaTab';
import ProjectionsTab from './ProjectionsTab';
import FacilitiesTab from './FacilitiesTab';
import CultureTab from './CultureTab';
import WeatherPerformanceTab from './WeatherPerformanceTab';

const TeamDetailView = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // Start with Overview
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
    { id: 1, label: 'ROSTER', icon: 'fa-users' },
    { id: 2, label: 'ANALYTICS', icon: 'fa-chart-line' },
    { id: 3, label: 'WEATHER', icon: 'fa-cloud-sun' },
    { id: 4, label: 'HISTORY', icon: 'fa-trophy' },
    { id: 5, label: 'MATCHUPS', icon: 'fa-vs' },
    { id: 6, label: 'SCHEDULE', icon: 'fa-calendar' },
    { id: 7, label: 'MEDIA', icon: 'fa-play-circle' },
    { id: 8, label: 'PROJECTIONS', icon: 'fa-chart-bar' },
    { id: 9, label: 'FACILITIES', icon: 'fa-building' },
    { id: 10, label: 'CULTURE', icon: 'fa-users' },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-7xl text-gray-300 mb-8"></i>
          <h3 className="text-3xl font-bold text-gray-700 mb-6">Team Not Found</h3>
          <p className="text-gray-500 text-xl">The team you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Convert hex to RGB for CSS
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 220, g: 38, b: 38 };
  };

  // Calculate luminance/brightness of a color (0-255 scale)
  const getColorBrightness = (hexColor) => {
    const rgb = hexToRgb(hexColor);
    // Use standard luminance formula: (R×299 + G×587 + B×114) / 1000
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  };

  // Smart algorithm to determine if we should use secondary logo/color
  const shouldUseSecondary = () => {
    const primaryBrightness = getColorBrightness(team.color || '#dc2626');
    const secondaryBrightness = team.alternateColor ? getColorBrightness(team.alternateColor) : 0;
    
    // Use secondary if:
    // 1. Primary color is very dark (brightness < 60)
    // 2. AND secondary color is significantly brighter (at least 40 points brighter)
    // 3. AND we have both secondary logo and color available
    const primaryIsDark = primaryBrightness < 60;
    const secondaryIsBrighter = secondaryBrightness > primaryBrightness + 40;
    const hasSecondaryOptions = team.alternateColor && team.logos?.[1];
    
    return primaryIsDark && secondaryIsBrighter && hasSecondaryOptions;
  };

  // Apply smart logo and color selection
  const useSecondaryOptions = shouldUseSecondary();
  const teamLogo = useSecondaryOptions ? team.logos[1] : team.logos?.[0];
  const secureTeamLogo = teamLogo ? teamLogo.replace(/^http:/, 'https:') : null;
  const primaryColor = useSecondaryOptions ? team.alternateColor : (team.color || '#dc2626');
  const secondaryColor = useSecondaryOptions ? team.color : (team.alternateColor || '#991b1b');

  // Header always uses original team colors for consistency
  const headerColor = team.color || '#dc2626';
  const headerRgb = hexToRgb(headerColor);
  const headerColorRgb = `${headerRgb.r}, ${headerRgb.g}, ${headerRgb.b}`;
  
  // Header text also uses original secondary color
  const headerSecondaryColor = team.alternateColor || '#991b1b';

  const teamRgb = hexToRgb(primaryColor);
  const teamColorRgb = `${teamRgb.r}, ${teamRgb.g}, ${teamRgb.b}`;

  // Get metallic gradient for team colors
  const getMetallicGradient = () => {
    const darkerRgb = `${Math.max(0, teamRgb.r - 40)}, ${Math.max(0, teamRgb.g - 40)}, ${Math.max(0, teamRgb.b - 40)}`;
    const lighterRgb = `${Math.min(255, teamRgb.r + 60)}, ${Math.min(255, teamRgb.g + 60)}, ${Math.min(255, teamRgb.b + 60)}`;
    return `linear-gradient(135deg, 
      rgba(${lighterRgb}, 0.95) 0%, 
      rgba(${teamColorRgb}, 1) 15%, 
      rgba(${darkerRgb}, 1) 35%, 
      rgba(${teamColorRgb}, 0.9) 50%, 
      rgba(${darkerRgb}, 1) 65%, 
      rgba(${teamColorRgb}, 1) 85%, 
      rgba(${lighterRgb}, 0.95) 100%)`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HD Galaxy Header - Enhanced Crisp Version */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          height: '415px',
          background: `linear-gradient(135deg, 
            rgba(${headerColorRgb}, 0.95) 0%, 
            rgba(${headerColorRgb}, 1) 20%, 
            rgba(${headerColorRgb}, 0.85) 40%, 
            rgba(${headerColorRgb}, 1) 60%, 
            rgba(${headerColorRgb}, 0.9) 80%, 
            rgba(${headerColorRgb}, 0.95) 100%)`,
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
                rgba(${headerColorRgb}, 0.4) 0%, 
                rgba(${headerColorRgb}, 0.1) 15%,
                transparent 25%, 
                rgba(${headerColorRgb}, 0.25) 45%, 
                transparent 65%, 
                rgba(${headerColorRgb}, 0.5) 85%, 
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
                rgba(${headerColorRgb}, 0.15) 20%,
                transparent 35%, 
                rgba(${headerColorRgb}, 0.35) 55%, 
                transparent 75%,
                rgba(${headerColorRgb}, 0.2) 90%,
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
                  rgba(${headerColorRgb}, 0.4) 30%,
                  rgba(255, 255, 255, 0.3) 60%, 
                  transparent 100%)`,
                transform: animateGalaxy 
                  ? `scale(${Math.random() * 0.8 + 0.6}) rotate(${Math.random() * 360}deg)` 
                  : `scale(${Math.random() * 0.5 + 0.3}) rotate(0deg)`,
                transition: `transform ${crystal.duration}s ease-in-out infinite`,
                transitionDelay: `${crystal.delay}s`,
                animationDirection: 'alternate',
                filter: 'brightness(1.3) contrast(1.1) saturate(1.2)',
                boxShadow: `0 0 8px rgba(${headerColorRgb}, 0.6), 0 0 16px rgba(255,255,255,0.3)`,
              }}
            />
          ))}

          {/* HD Nebula Swirls */}
          <div 
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg at 20% 80%, 
                rgba(${headerColorRgb}, 0.18) 0deg,
                transparent 60deg, 
                rgba(${headerColorRgb}, 0.12) 120deg, 
                transparent 180deg,
                rgba(${headerColorRgb}, 0.08) 240deg,
                transparent 300deg,
                rgba(${headerColorRgb}, 0.15) 360deg)`,
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
                rgba(${headerColorRgb}, 0.15) 60deg, 
                transparent 120deg, 
                rgba(${headerColorRgb}, 0.08) 180deg,
                transparent 240deg,
                rgba(${headerColorRgb}, 0.12) 300deg,
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
                  rgba(${headerColorRgb}, 0.4) 30%,
                  rgba(255, 255, 255, 0.3) 60%, 
                  transparent 100%)`,
                transform: animateGalaxy 
                  ? `translate(${particle.offsetX}px, ${particle.offsetY}px) scale(${Math.random() * 0.6 + 0.8})` 
                  : `translate(${particle.offsetX * -0.5}px, ${particle.offsetY * -0.5}px) scale(${Math.random() * 0.4 + 0.6})`,
                transition: `transform ${particle.duration}s ease-in-out infinite`,
                transitionDelay: `${particle.delay}s`,
                animationDirection: 'alternate',
                filter: 'brightness(1.4) contrast(1.2)',
                boxShadow: `0 0 12px rgba(${headerColorRgb}, 0.5), 0 0 24px rgba(255,255,255,0.3)`,
              }}
            />
          ))}

          {/* HD Color Waves */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${animateGalaxy ? '45deg' : '225deg'}, 
                rgba(${headerColorRgb}, 0.08) 0%, 
                transparent 20%, 
                rgba(${headerColorRgb}, 0.12) 40%, 
                transparent 60%, 
                rgba(${headerColorRgb}, 0.06) 80%,
                transparent 100%)`,
              transition: 'background 12s ease-in-out infinite',
              animationDirection: 'alternate',
              filter: 'blur(0.5px) brightness(1.1)',
            }}
          />

          {/* Subtle sparkle overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, 
                transparent 0%, 
                rgba(255,255,255,0.03) 30%,
                transparent 50%, 
                rgba(255,255,255,0.02) 70%,
                transparent 100%)`,
              opacity: animateGalaxy ? 0.6 : 0.3,
              transition: 'opacity 4s ease-in-out infinite',
              animationDirection: 'alternate',
            }}
          />
        </div>

        {/* Header Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pt-6">
          {/* Team Logo - Clear with hover effect */}
          <div 
            className="mb-5 cursor-pointer transition-transform duration-300 hover:scale-110"
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
                className="w-72 h-72 object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-105"
                style={{
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3)) drop-shadow(0 5px 10px rgba(0,0,0,0.2))',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-72 h-72 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 transition-transform duration-300 hover:scale-105"
              style={{ display: secureTeamLogo ? 'none' : 'flex' }}
            >
              <i className="fas fa-university text-white text-8xl filter drop-shadow-lg"></i>
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
                    color: headerSecondaryColor
                  }}
                >
                  {team.mascot}
                </span>
              )}
              
              {team.mascot && team.conference && (
                <span style={{ color: headerSecondaryColor }}>•</span>
              )}
              
              {team.conference && (
                <span 
                  className="text-sm font-bold" 
                  style={{ 
                    fontFamily: 'Orbitron, sans-serif', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    color: headerSecondaryColor
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
              rgba(${headerColorRgb}, 0.2) 20%,
              rgba(${headerColorRgb}, 0.6) 50%, 
              rgba(${headerColorRgb}, 0.2) 80%,
              transparent 100%)`,
            filter: 'blur(8px) brightness(1.2)',
          }}
        />
      </div>

      {/* Metallic Tab Selection with Team Colors - NO GAPS */}
      <div className="bg-gray-100 sticky top-0 z-40 shadow-lg backdrop-blur-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex justify-center items-center gap-2 px-4 py-3 min-w-max mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs transition-all duration-500 transform hover:scale-105 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white shadow-2xl'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {/* Active metallic team color background */}
                {activeTab === tab.id && (
                  <div 
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: getMetallicGradient(),
                      boxShadow: `0 8px 25px rgba(${teamColorRgb}, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)`
                    }}
                  ></div>
                )}
                
                {/* Inactive glass background */}
                {activeTab !== tab.id && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300"></div>
                )}
                
                {/* Subtle glass highlight overlay */}
                <div className="absolute inset-1 rounded-md bg-gradient-to-br from-white/15 via-transparent to-white/5 pointer-events-none"></div>
                
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area - 97% width - NO GAP */}
      <div className="bg-gray-50">
        <div className="px-2 py-8 mx-auto" style={{ width: '97%' }}>
          {activeTab === 0 ? (
            <OverviewTab team={team} primaryTeamColor={primaryColor} />
          ) : activeTab === 1 ? (
            <RosterTab team={team} primaryTeamColor={primaryColor} />
          ) : activeTab === 2 ? (
            <TeamAnalytics team={team} />
          ) : activeTab === 3 ? (
            <WeatherPerformanceTab team={team} primaryTeamColor={primaryColor} />
          ) : activeTab === 4 ? (
            <HistoryTab team={team} primaryTeamColor={primaryColor} />
          ) : activeTab === 5 ? (
            <MatchupsTab team={team} primaryTeamColor={primaryColor} />
          ) : activeTab === 6 ? (
            <ADVScheduleTab team={team} primaryTeamColor={primaryColor} />
          ) : activeTab === 7 ? (
            <MediaTab team={team} primaryTeamColor={primaryColor} />
          ) : activeTab === 8 ? (
            <ProjectionsTab team={team} primaryTeamColor={primaryColor} />
          ) : activeTab === 9 ? (
            <FacilitiesTab team={team} primaryTeamColor={primaryColor} />
          ) : activeTab === 10 ? (
            <CultureTab team={team} primaryTeamColor={primaryColor} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TeamDetailView;