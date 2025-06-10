import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronDown, 
  Search, 
  Tv, 
  MapPin, 
  Users, 
  Trophy, 
  Star, 
  Flame,
  TrendingUp,
  Wifi,
  Play,
  Globe,
  Zap,
  Award,
  Clock,
  CheckCircle,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Eye,
  Thermometer,
  Home
} from 'lucide-react';
import { gameService, teamService, rankingsService } from '../../services';

// Enhanced Weather Icon Component with HD animations and interactive effects
const WeatherIcon = ({ condition, temperature }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getWeatherData = () => {
    if (!condition) return { icon: Thermometer, color: 'gray', animation: 'pulse' };
    
    const cond = condition.toLowerCase();
    if (cond.includes('clear') || cond.includes('sunny')) {
      return { icon: Sun, color: 'yellow', animation: 'rotate', effect: 'sun-rays' };
    }
    if (cond.includes('partly') || cond.includes('scattered')) {
      return { icon: Cloud, color: 'blue', animation: 'float', effect: 'partial-clouds' };
    }
    if (cond.includes('cloud') || cond.includes('overcast')) {
      return { icon: Cloud, color: 'gray', animation: 'drift', effect: 'moving-clouds' };
    }
    if (cond.includes('rain') || cond.includes('shower')) {
      return { icon: CloudRain, color: 'blue', animation: 'bounce', effect: 'rain-drops' };
    }
    if (cond.includes('snow') || cond.includes('blizzard')) {
      return { icon: Snowflake, color: 'cyan', animation: 'spin', effect: 'snowfall' };
    }
    if (cond.includes('storm') || cond.includes('thunder')) {
      return { icon: Zap, color: 'purple', animation: 'flash', effect: 'lightning' };
    }
    if (cond.includes('wind')) {
      return { icon: Wind, color: 'teal', animation: 'sway', effect: 'wind-lines' };
    }
    if (cond.includes('night')) {
      return { icon: Moon, color: 'indigo', animation: 'glow', effect: 'stars' };
    }
    return { icon: Cloud, color: 'blue', animation: 'float', effect: 'default' };
  };

  const getTemperatureGradient = () => {
    if (!temperature) return 'from-gray-400 to-gray-600';
    
    if (temperature >= 90) return 'from-red-500 via-orange-500 to-yellow-400';
    if (temperature >= 80) return 'from-orange-400 via-yellow-400 to-green-400';
    if (temperature >= 70) return 'from-green-400 via-emerald-400 to-teal-400';
    if (temperature >= 50) return 'from-blue-400 via-sky-400 to-cyan-400';
    if (temperature >= 32) return 'from-blue-500 via-indigo-500 to-purple-500';
    return 'from-blue-600 via-purple-600 to-indigo-700';
  };

  const weatherData = getWeatherData();
  const WeatherIconComponent = weatherData.icon;

  return (
    <div className="relative group">
      <style jsx>{`
        @keyframes sun-rays {
          0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 20px rgba(251,191,36,0.8)); }
          50% { transform: rotate(180deg) scale(1.1); filter: drop-shadow(0 0 30px rgba(251,191,36,1)); }
        }
        
        @keyframes moving-clouds {
          0% { transform: translateX(-10px); opacity: 0.7; }
          50% { transform: translateX(10px); opacity: 1; }
          100% { transform: translateX(-10px); opacity: 0.7; }
        }
        
        @keyframes rain-drops {
          0% { transform: translateY(-20px); opacity: 0; }
          50% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }
        
        @keyframes snowfall {
          0% { transform: translateY(-30px) rotate(0deg); opacity: 0; }
          50% { transform: translateY(0px) rotate(180deg); opacity: 1; }
          100% { transform: translateY(30px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          5%, 10% { opacity: 1; filter: drop-shadow(0 0 15px rgba(168,85,247,0.9)); }
        }
        
        @keyframes wind-lines {
          0% { transform: translateX(-15px); opacity: 0; }
          50% { transform: translateX(15px); opacity: 1; }
          100% { transform: translateX(30px); opacity: 0; }
        }
        
        @keyframes stars-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .weather-icon-container {
          animation: ${weatherData.animation} 3s ease-in-out infinite;
        }
        
        .sun-effect { animation: sun-rays 4s linear infinite; }
        .cloud-effect { animation: moving-clouds 6s ease-in-out infinite; }
        .rain-effect { animation: rain-drops 1s linear infinite; }
        .snow-effect { animation: snowfall 3s linear infinite; }
        .lightning-effect { animation: lightning 2s infinite; }
        .wind-effect { animation: wind-lines 2s ease-in-out infinite; }
        .stars-effect { animation: stars-twinkle 2s ease-in-out infinite; }
      `}</style>

      {/* Weather Icon Container */}
      <motion.div 
        className="relative flex items-center space-x-4"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Animated Weather Icon */}
        <div className="relative weather-icon-container">
          <motion.div 
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTemperatureGradient()} p-2 shadow-lg backdrop-blur-xl border border-white/20`}
            style={{
              boxShadow: `
                0 4px 12px rgba(0,0,0,0.1),
                inset 0 1px 2px rgba(255,255,255,0.2),
                0 0 0 1px rgba(255,255,255,0.05)
              `
            }}
            whileHover={{ 
              boxShadow: `
                0 6px 16px rgba(0,0,0,0.15),
                inset 0 1px 3px rgba(255,255,255,0.3),
                0 0 8px rgba(255,255,255,0.2)
              `
            }}
          >
            <WeatherIconComponent 
              className="w-full h-full text-white drop-shadow-sm"
              strokeWidth={1.5}
            />
          </motion.div>
          
          {/* Weather Effects */}
          <AnimatePresence>
            {weatherData.effect === 'rain-drops' && (
              <div className="absolute -top-2 -right-2 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-8 bg-blue-400 rounded-full rain-effect"
                    style={{ 
                      left: `${i * 4}px`,
                      animationDelay: `${i * 200}ms`,
                      opacity: 0.6 
                    }}
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 30, opacity: [0, 1, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            )}
            
            {weatherData.effect === 'snowfall' && (
              <div className="absolute -top-3 -right-3 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{ 
                      left: `${i * 3}px`,
                      top: `${Math.random() * 10}px`
                    }}
                    animate={{ 
                      y: [0, 40],
                      x: [0, Math.random() * 10 - 5],
                      rotate: [0, 360],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      delay: i * 0.5,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            )}
            
            {weatherData.effect === 'sun-rays' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 h-6 bg-yellow-300 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: '50% 32px',
                      transform: `rotate(${i * 45}deg) translateY(-32px)`
                    }}
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
            )}
            
            {weatherData.effect === 'lightning' && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-6 bg-purple-300 rounded-sm lightning-effect"
                style={{ clipPath: 'polygon(20% 0%, 40% 20%, 30% 30%, 70% 100%, 50% 80%, 60% 70%, 30% 0%)' }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
              />
            )}
            
            {weatherData.effect === 'wind-lines' && (
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-8 h-0.5 bg-teal-300 rounded-full"
                    style={{ top: `${i * 4}px` }}
                    animate={{ 
                      x: [-20, 20],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.3
                    }}
                  />
                ))}
              </div>
            )}
            
            {weatherData.effect === 'stars' && (
              <div className="absolute -top-2 -right-2 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-indigo-200 rounded-full stars-effect"
                    style={{ 
                      left: `${i * 6}px`,
                      top: `${i * 3}px`
                    }}
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.7
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Temperature Display */}
        {temperature && (
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div 
              className={`px-2 py-1 rounded-lg bg-gradient-to-r ${getTemperatureGradient()} text-white font-bold text-xs shadow-lg backdrop-blur-xl border border-white/20`}
              style={{
                boxShadow: `
                  0 4px 12px rgba(0,0,0,0.1),
                  inset 0 1px 2px rgba(255,255,255,0.2)
                `
              }}
            >
              <span className="drop-shadow-sm">{Math.round(temperature)}°F</span>
            </div>
            
            {/* Temperature indicators */}
            {temperature >= 90 && (
              <motion.div 
                className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            {temperature <= 32 && (
              <motion.div 
                className="absolute -top-1 -right-1 w-2 h-2 bg-blue-200 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Weather condition text */}
      {condition && (
        <motion.div 
          className="mt-1 text-xs font-medium text-gray-600 capitalize text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {condition}
        </motion.div>
      )}
    </div>
  );
};

// Enhanced Utility Components
const ExcitementStars = ({ excitementIndex = 0 }) => {
  const stars = Math.min(Math.max(Math.round(excitementIndex / 2), 0), 5);
  
  const getStarGradient = () => {
    if (excitementIndex >= 8) return 'from-yellow-300 via-yellow-400 to-orange-400';
    if (excitementIndex >= 6) return 'from-yellow-400 via-yellow-500 to-orange-500';
    if (excitementIndex >= 4) return 'from-yellow-500 via-yellow-600 to-orange-600';
    return 'from-gray-300 to-gray-400';
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`relative ${i < stars ? `bg-gradient-to-br ${getStarGradient()}` : 'bg-gray-200'} shadow-lg transition-all duration-300`}
            style={{
              width: '18px',
              height: '18px',
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              ...(i < stars ? {
                boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)'
              } : {})
            }}
            whileHover={{ scale: 1.2, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          />
        ))}
      </div>
      <span className="text-lg font-black bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
        {excitementIndex ? excitementIndex.toFixed(1) : 'N/A'}
      </span>
    </div>
  );
};

const WinProbabilityChart = ({ homeTeam, awayTeam, homeProb, awayProb, homeTeamId, awayTeamId, getTeamLogo }) => {
  if (!homeProb && !awayProb) return null;
  
  const homePct = homeProb ? Math.round(homeProb * 100) : 50;
  const awayPct = awayProb ? Math.round(awayProb * 100) : 50;
  
  return (
    <motion.div 
      className="relative bg-white/25 backdrop-blur-2xl rounded-3xl border border-white/30 p-8 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        boxShadow: `
          0 25px 50px rgba(0,0,0,0.1),
          inset 0 1px 6px rgba(255,255,255,0.2),
          0 0 0 1px rgba(255,255,255,0.05)
        `
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10">
        <div className="text-lg font-black text-gray-700 mb-6 text-center flex items-center justify-center space-x-3">
          <motion.div 
            className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={2} />
          </motion.div>
          <span>Win Probability</span>
        </div>
        
        <div className="space-y-6">
          {/* Away Team */}
          <div className="flex items-center space-x-4">
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/40 p-2 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src={getTeamLogo(awayTeamId)} 
                alt={awayTeam}
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) saturate(1.3) contrast(1.2) brightness(1.1)'
                }}
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-black text-gray-800">{awayTeam}</span>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{awayPct}%</span>
              </div>
              <div className="h-3 bg-gray-200/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ 
                    background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)`,
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${awayPct}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
          
          {/* Home Team */}
          <div className="flex items-center space-x-4">
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/40 p-2 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src={getTeamLogo(homeTeamId)} 
                alt={homeTeam}
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) saturate(1.3) contrast(1.2) brightness(1.1)'
                }}
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-black text-gray-800">{homeTeam}</span>
                <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">{homePct}%</span>
              </div>
              <div className="h-3 bg-gray-200/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ 
                    background: `linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)`,
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${homePct}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EloRatingDisplay = ({ preGameElo, postGameElo, teamName, isCompleted }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!preGameElo) return null;
  
  const eloChange = postGameElo && isCompleted ? postGameElo - preGameElo : 0;
  const eloLevel = preGameElo >= 2000 ? 'Elite' : preGameElo >= 1800 ? 'Strong' : preGameElo >= 1600 ? 'Good' : 'Developing';
  
  return (
    <div className="relative">
      <motion.div 
        className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-xl text-sm cursor-help border border-white/20 hover:bg-white/30 transition-all duration-300"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.05 }}
        style={{
          boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2} />
          <span className="font-black text-gray-700">{preGameElo}</span>
          <span className="text-gray-500">({eloLevel})</span>
          {isCompleted && eloChange !== 0 && (
            <motion.span 
              className={`font-black ${eloChange > 0 ? 'text-green-600' : 'text-red-600'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {eloChange > 0 ? '+' : ''}{eloChange}
            </motion.span>
          )}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-[10000] w-80"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div 
              className="bg-white/90 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-2xl"
              style={{
                boxShadow: `
                  0 25px 50px rgba(0,0,0,0.15),
                  inset 0 1px 6px rgba(255,255,255,0.2),
                  0 0 0 1px rgba(255,255,255,0.1)
                `
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <h4 className="font-black text-gray-800 text-lg">ELO Rating System</h4>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                ELO is a rating system that measures team strength based on game results and opponent quality. 
                Teams gain/lose points based on wins/losses and the strength of their opponents.
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-3 rounded-xl bg-green-50 border border-green-100">
                  <span className="text-gray-600 font-semibold">Elite:</span>
                  <span className="font-black text-green-600">2000+</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="text-gray-600 font-semibold">Strong:</span>
                  <span className="font-black text-blue-600">1800-1999</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                  <span className="text-gray-600 font-semibold">Good:</span>
                  <span className="font-black text-yellow-600">1600-1799</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-600 font-semibold">Developing:</span>
                  <span className="font-black text-gray-600">Below 1600</span>
                </div>
              </div>
            </div>
            
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/90 border-r border-b border-white/50 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MediaIcon = ({ outlet, mediaType }) => {
  const getNetworkData = () => {
    if (!outlet) return { icon: Tv, color: 'gray' };
    
    const network = outlet.toLowerCase();
    if (network.includes('espn')) return { icon: Wifi, color: 'red' };
    if (network.includes('fox')) return { icon: Tv, color: 'blue' };
    if (network.includes('cbs')) return { icon: Tv, color: 'blue' };
    if (network.includes('nbc')) return { icon: Tv, color: 'purple' };
    if (network.includes('peacock')) return { icon: Play, color: 'blue' };
    if (network.includes('paramount')) return { icon: Play, color: 'blue' };
    if (network.includes('hulu')) return { icon: Play, color: 'green' };
    if (network.includes('netflix')) return { icon: Play, color: 'red' };
    if (mediaType === 'web') return { icon: Globe, color: 'purple' };
    return { icon: Tv, color: 'gray' };
  };

  const getNetworkGradient = () => {
    if (!outlet) return 'from-gray-500 to-gray-700';
    const network = outlet.toLowerCase();
    if (network.includes('espn')) return 'from-red-500 to-red-700';
    if (network.includes('fox')) return 'from-blue-500 to-blue-700';
    if (network.includes('cbs')) return 'from-blue-600 to-blue-800';
    if (network.includes('nbc')) return 'from-purple-500 to-purple-700';
    if (network.includes('peacock')) return 'from-blue-400 to-blue-600';
    if (mediaType === 'web') return 'from-purple-500 to-purple-700';
    return 'from-gray-500 to-gray-700';
  };

  const networkData = getNetworkData();
  const NetworkIcon = networkData.icon;

  return (
    <div className="relative">
      <motion.div 
        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getNetworkGradient()} p-2 shadow-lg backdrop-blur-xl flex items-center justify-center border border-white/20`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        style={{
          boxShadow: `
            0 4px 12px rgba(0,0,0,0.1),
            inset 0 1px 2px rgba(255,255,255,0.2)
          `
        }}
      >
        <NetworkIcon className="w-full h-full text-white" strokeWidth={1.5} />
      </motion.div>
      
      <motion.div 
        className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg border border-white"
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

const Schedule = () => {
  // State persistence helper functions
  const getStoredState = useCallback((key, defaultValue) => {
    try {
      const stored = localStorage.getItem(`schedule_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, []);

  const setStoredState = useCallback((key, value) => {
    try {
      localStorage.setItem(`schedule_${key}`, JSON.stringify(value));
    } catch {
      // Silently ignore localStorage errors
    }
  }, []);

  // Core state management with persistence
  const [selectedWeek, setSelectedWeekState] = useState(() => getStoredState('selectedWeek', 1));
  const [isPostseason, setIsPostseasonState] = useState(() => getStoredState('isPostseason', false));
  const [selectedConference, setSelectedConferenceState] = useState(() => getStoredState('selectedConference', null));
  const [selectedYear, setSelectedYearState] = useState(() => getStoredState('selectedYear', 2024));
  const [selectedCategory, setSelectedCategoryState] = useState(() => getStoredState('selectedCategory', 'Top 25'));
  const [searchText, setSearchTextState] = useState(() => getStoredState('searchText', ''));
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Enhanced state setters that persist to localStorage
  const setSelectedWeek = useCallback((value) => {
    setSelectedWeekState(value);
    setStoredState('selectedWeek', value);
  }, [setStoredState]);

  const setIsPostseason = useCallback((value) => {
    setIsPostseasonState(value);
    setStoredState('isPostseason', value);
  }, [setStoredState]);

  const setSelectedConference = useCallback((value) => {
    setSelectedConferenceState(value);
    setStoredState('selectedConference', value);
  }, [setStoredState]);

  const setSelectedYear = useCallback((value) => {
    setSelectedYearState(value);
    setStoredState('selectedYear', value);
  }, [setStoredState]);

  const setSelectedCategory = useCallback((value) => {
    setSelectedCategoryState(value);
    setStoredState('selectedCategory', value);
  }, [setStoredState]);

  const setSearchText = useCallback((value) => {
    setSearchTextState(value);
    setStoredState('searchText', value);
  }, [setStoredState]);
  
  // UI state
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showConferencePicker, setShowConferencePicker] = useState(false);

  // Check if any dropdown is open
  const isAnyDropdownOpen = showWeekPicker || showYearPicker || showConferencePicker;

  // Data state with enhanced media and weather
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [gameMedia, setGameMedia] = useState(new Map());
  const [gameWeather, setGameWeather] = useState(new Map());

  // Conference data
  const conferences = [
    { name: 'ACC', logo: 'ACC' },
    { name: 'American Athletic', logo: 'American Athletic' },
    { name: 'Big 12', logo: 'Big 12' },
    { name: 'Big Ten', logo: 'Big Ten' },
    { name: 'Conference USA', logo: 'Conference USA' },
    { name: 'FBS Independents', logo: 'FBS Independents' },
    { name: 'Mid-American', logo: 'Mid-American' },
    { name: 'Mountain West', logo: 'Mountain West' },
    { name: 'Pac-12', logo: 'Pac-12' },
    { name: 'SEC', logo: 'SEC' },
    { name: 'Sun Belt', logo: 'SBC' }
  ];

  const loadDataIfNeeded = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let loadedTeams = teams;
      if (loadedTeams.length === 0) {
        loadedTeams = await teamService.getFBSTeams(true);
        setTeams(loadedTeams);
      }

      let loadedGames = [];
      if (isPostseason) {
        loadedGames = await gameService.getPostseasonGames(selectedYear, false);
      } else {
        loadedGames = await gameService.getGamesByWeek(selectedYear, selectedWeek, 'regular', false);
      }
      setGames(loadedGames || []);

      const [mediaData, weatherData] = await Promise.all([
        gameService.getEnhancedGameMedia(selectedYear, selectedWeek, isPostseason ? 'postseason' : 'regular').catch(() => []),
        gameService.getEnhancedGameWeather(null, selectedYear, selectedWeek, isPostseason ? 'postseason' : 'regular').catch(() => [])
      ]);

      const mediaMap = new Map();
      const weatherMap = new Map();

      mediaData.forEach(media => {
        mediaMap.set(media.id, media);
      });

      weatherData.forEach(weather => {
        weatherMap.set(weather.id, weather);
      });

      setGameMedia(mediaMap);
      setGameWeather(weatherMap);

      let loadedRankings = rankings;
      if (loadedRankings.length === 0) {
        try {
          const rankingsData = await rankingsService.getHistoricalRankings(2024, null, 'postseason');
          const apPoll = rankingsData.find(week => 
            week.polls?.find(poll => poll.poll === 'AP Top 25')
          );
          if (apPoll) {
            const apRankings = apPoll.polls.find(poll => poll.poll === 'AP Top 25');
            loadedRankings = apRankings?.ranks || [];
          }
          setRankings(loadedRankings);
        } catch (error) {
          console.warn('Error loading rankings:', error);
          setRankings([]);
        }
      }

    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error loading schedule data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWeek, selectedYear, isPostseason, teams, rankings]);

  useEffect(() => {
    loadDataIfNeeded();
  }, [loadDataIfNeeded]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowWeekPicker(false);
        setShowYearPicker(false);
        setShowConferencePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Optimized filtered games with useMemo for performance
  const filteredGames = useMemo(() => {
    let filtered = [...games];

    if (selectedConference) {
      const conferenceTeamIds = new Set(
        teams.filter(team => team.conference === selectedConference).map(team => team.id)
      );
      filtered = filtered.filter(game => 
        conferenceTeamIds.has(game.home_id || game.homeId) ||
        conferenceTeamIds.has(game.away_id || game.awayId)
      );
    }

    if (selectedCategory === 'Top 25') {
      const rankedSchools = new Set(rankings.map(rank => rank.school.toLowerCase()));
      filtered = filtered.filter(game => {
        const homeTeam = teams.find(team => team.id === (game.home_id || game.homeId));
        const awayTeam = teams.find(team => team.id === (game.away_id || game.awayId));
        return (homeTeam && rankedSchools.has(homeTeam.school.toLowerCase())) ||
               (awayTeam && rankedSchools.has(awayTeam.school.toLowerCase()));
      });
    }

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      const matchingTeamIds = new Set(
        teams.filter(team => 
          team.school?.toLowerCase().includes(query) ||
          team.abbreviation?.toLowerCase().includes(query) ||
          team.conference?.toLowerCase().includes(query)
        ).map(team => team.id)
      );
      
      filtered = filtered.filter(game =>
        matchingTeamIds.has(game.home_id || game.homeId) ||
        matchingTeamIds.has(game.away_id || game.awayId)
      );
    }

    return filtered;
  }, [games, selectedConference, selectedCategory, searchText, teams, rankings]);

  const getTeamRank = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    const ranking = rankings.find(r => r.school.toLowerCase() === team.school.toLowerCase());
    return ranking?.rank || null;
  };

  const getTeamLogo = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  const getTeamAbbreviation = (teamId, fallback) => {
    const team = teams.find(t => t.id === teamId);
    if (team?.abbreviation) return team.abbreviation;
    if (team?.school) {
      const words = team.school.split(' ').filter(w => w.length > 0);
      if (words.length === 1) return words[0].substring(0, 4).toUpperCase();
      return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
    }
    return fallback || 'TBD';
  };

  const formatGameDate = (dateString) => {
    if (!dateString || dateString === 'TBD') return 'TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBD';
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return `Today • ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow • ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'TBD';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Animated Network Background */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="network" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="2" fill="rgba(220, 38, 38, 0.1)">
                  <animate attributeName="r" values="1;3;1" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="20" cy="20" r="1" fill="rgba(220, 38, 38, 0.08)">
                  <animate attributeName="r" values="0.5;2;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="80" cy="30" r="1.5" fill="rgba(220, 38, 38, 0.06)">
                  <animate attributeName="r" values="1;2.5;1" dur="5s" repeatCount="indefinite" />
                </circle>
                <line x1="50" y1="50" x2="20" y2="20" stroke="rgba(220, 38, 38, 0.05)" strokeWidth="0.5">
                  <animate attributeName="stroke-opacity" values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite" />
                </line>
                <line x1="50" y1="50" x2="80" y2="30" stroke="rgba(220, 38, 38, 0.05)" strokeWidth="0.5">
                  <animate attributeName="stroke-opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
                </line>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#network)" />
          </svg>
        </div>

        <div className="text-center relative z-10">
          <motion.div 
            className="relative mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 mx-auto flex items-center justify-center shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <Calendar className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>
          <motion.h2 
            className="text-4xl font-black bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isPostseason ? 'Loading Postseason Games...' : `Loading Week ${selectedWeek} Games...`}
          </motion.h2>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Fetching college football schedule
          </motion.p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Network Background */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="error-network" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="2" fill="rgba(220, 38, 38, 0.3)" />
                <circle cx="20" cy="20" r="1" fill="rgba(220, 38, 38, 0.2)" />
                <circle cx="80" cy="30" r="1.5" fill="rgba(220, 38, 38, 0.25)" />
                <line x1="50" y1="50" x2="20" y2="20" stroke="rgba(220, 38, 38, 0.15)" strokeWidth="1" />
                <line x1="50" y1="50" x2="80" y2="30" stroke="rgba(220, 38, 38, 0.15)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#error-network)" />
          </svg>
        </div>

        <motion.div 
          className="max-w-md mx-auto bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/40 p-10 text-center shadow-2xl relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 mx-auto mb-6 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-8 h-8 text-white" strokeWidth={1.5} />
          </motion.div>
          <h3 className="font-black text-gray-800 text-2xl mb-3">Error Loading Schedule</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{errorMessage}</p>
          <motion.button 
            onClick={loadDataIfNeeded}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-black rounded-2xl shadow-2xl border border-white/20"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(220, 38, 38, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Enhanced Animated Network Background */}
      <div className="fixed inset-0 z-0">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="networkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(220, 38, 38, 0.08)">
                <animate attributeName="stop-opacity" values="0.05;0.12;0.05" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="rgba(185, 28, 28, 0.06)">
                <animate attributeName="stop-opacity" values="0.03;0.09;0.03" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="rgba(153, 27, 27, 0.04)">
                <animate attributeName="stop-opacity" values="0.02;0.06;0.02" dur="5s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            
            <pattern id="dynamicNetwork" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="60" cy="60" r="3" fill="url(#networkGrad)">
                <animate attributeName="r" values="2;5;2" dur="6s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="20" cy="30" r="2" fill="rgba(220, 38, 38, 0.1)">
                <animate attributeName="r" values="1;3;1" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="100" cy="20" r="2.5" fill="rgba(220, 38, 38, 0.08)">
                <animate attributeName="r" values="1.5;4;1.5" dur="5s" repeatCount="indefinite" />
              </circle>
              <circle cx="90" cy="90" r="2" fill="rgba(220, 38, 38, 0.06)">
                <animate attributeName="r" values="1;3.5;1" dur="3s" repeatCount="indefinite" />
              </circle>
              
              <line x1="60" y1="60" x2="20" y2="30" stroke="rgba(220, 38, 38, 0.08)" strokeWidth="1">
                <animate attributeName="stroke-opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite" />
                <animate attributeName="stroke-width" values="0.5;2;0.5" dur="6s" repeatCount="indefinite" />
              </line>
              <line x1="60" y1="60" x2="100" y2="20" stroke="rgba(220, 38, 38, 0.06)" strokeWidth="1">
                <animate attributeName="stroke-opacity" values="0.1;0.3;0.1" dur="5s" repeatCount="indefinite" />
              </line>
              <line x1="60" y1="60" x2="90" y2="90" stroke="rgba(220, 38, 38, 0.07)" strokeWidth="0.8">
                <animate attributeName="stroke-opacity" values="0.1;0.35;0.1" dur="3s" repeatCount="indefinite" />
              </line>
              <line x1="20" y1="30" x2="100" y2="20" stroke="rgba(220, 38, 38, 0.04)" strokeWidth="0.5">
                <animate attributeName="stroke-opacity" values="0.05;0.2;0.05" dur="7s" repeatCount="indefinite" />
              </line>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dynamicNetwork)">
            <animateTransform 
              attributeName="transform" 
              type="translate" 
              values="0,0;30,20;0,0" 
              dur="20s" 
              repeatCount="indefinite" 
            />
          </rect>
        </svg>
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Futuristic Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Iconic Header Logo */}
            <motion.div 
              className="flex items-center justify-center mb-8 relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div 
                className="relative w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/30 flex items-center justify-center group cursor-pointer shadow-2xl"
                style={{
                  boxShadow: `
                    0 25px 50px rgba(0,0,0,0.1),
                    inset 0 1px 6px rgba(255,255,255,0.3),
                    0 0 0 1px rgba(255,255,255,0.1)
                  `
                }}
              >
                <Calendar className="w-12 h-12 text-red-600 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                <motion.div 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
            
            {/* Futuristic Typography */}
            <motion.h1 
              className="text-8xl md:text-9xl font-black mb-8 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent drop-shadow-2xl">
                College Football
              </span>
              <br />
              <span className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent drop-shadow-2xl">
                Schedule
              </span>
            </motion.h1>
            
            {/* Enhanced Stats Display */}
            <motion.div 
              className="inline-flex items-center space-x-8 px-10 py-5 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                boxShadow: `
                  0 15px 35px rgba(0,0,0,0.1),
                  inset 0 1px 4px rgba(255,255,255,0.3)
                `
              }}
            >
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-red-700"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  {filteredGames.length} Games
                </span>
              </div>
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
              <span className="text-2xl text-gray-700 font-bold">
                {isPostseason ? 'Bowl Season & Playoffs' : `Week ${selectedWeek} • 2024`}
              </span>
            </motion.div>
          </motion.div>

          {/* Enhanced Filter Controls */}
          <motion.div 
            className="relative mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div 
              className="bg-white/25 backdrop-blur-2xl rounded-3xl border border-white/30 p-10 shadow-2xl"
              style={{
                boxShadow: `
                  0 25px 50px rgba(0,0,0,0.1),
                  inset 0 1px 6px rgba(255,255,255,0.3),
                  0 0 0 1px rgba(255,255,255,0.1)
                `
              }}
            >
              {/* Category Selection */}
              <div className="flex flex-wrap items-center gap-8 mb-10">
                {['Top 25', 'FBS'].map(category => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative px-10 py-5 rounded-2xl font-black text-xl transition-all duration-500 ${
                      selectedCategory === category
                        ? 'text-white shadow-2xl'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedCategory === category && (
                      <motion.div 
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600 to-red-800"
                        layoutId="activeCategory"
                        style={{
                          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4), inset 0 1px 4px rgba(255,255,255,0.2)'
                        }}
                      />
                    )}
                    
                    {selectedCategory !== category && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl hover:bg-white/30 transition-all duration-300"></div>
                    )}
                    
                    <span className="relative z-10">{category}</span>
                  </motion.button>
                ))}
                
                {/* Enhanced Search Box */}
                <div className="flex-1 min-w-96 relative">
                  <motion.div 
                    className="relative bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 overflow-hidden"
                    whileFocus={{ boxShadow: "0 15px 35px rgba(220, 38, 38, 0.2)" }}
                    style={{
                      boxShadow: `
                        inset 0 2px 8px rgba(0,0,0,0.1),
                        0 4px 12px rgba(0,0,0,0.05)
                      `
                    }}
                  >
                    <div className="relative flex items-center">
                      <Search className="absolute left-6 w-6 h-6 text-gray-500 z-10" strokeWidth={1.5} />
                      <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none font-semibold text-xl"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Time Frame Controls */}
              <div className="flex flex-wrap items-center gap-6">
                {/* Year Selector */}
                <div className="relative dropdown-container">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowYearPicker(!showYearPicker);
                      setShowWeekPicker(false);
                      setShowConferencePicker(false);
                    }}
                    className="flex items-center gap-4 px-8 py-4 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 font-bold text-gray-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar className="w-5 h-5" strokeWidth={1.5} />
                    <span>{selectedYear}</span>
                    <motion.div
                      animate={{ rotate: showYearPicker ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {showYearPicker && (
                      <motion.div 
                        className="absolute top-full mt-3 bg-white/25 backdrop-blur-2xl rounded-2xl border border-white/30 z-[9999] min-w-36 overflow-hidden shadow-2xl"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {[2024, 2025].map(year => (
                          <motion.button
                            key={year}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedYear(year);
                              setShowYearPicker(false);
                            }}
                            className="block w-full text-left px-8 py-4 hover:bg-white/30 transition-all duration-200 font-semibold text-gray-700"
                            whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                          >
                            {year}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Conference Selector */}
                <div className="relative dropdown-container">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConferencePicker(!showConferencePicker);
                      setShowYearPicker(false);
                      setShowWeekPicker(false);
                    }}
                    className="flex items-center gap-4 px-8 py-4 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 font-bold text-gray-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trophy className="w-5 h-5" strokeWidth={1.5} />
                    <span>{selectedConference || 'All Conferences'}</span>
                    <motion.div
                      animate={{ rotate: showConferencePicker ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {showConferencePicker && (
                      <motion.div 
                        className="absolute top-full mt-3 bg-white/25 backdrop-blur-2xl rounded-2xl border border-white/30 z-[9999] min-w-52 max-h-64 overflow-y-auto shadow-2xl"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConference(null);
                            setShowConferencePicker(false);
                          }}
                          className="block w-full text-left px-8 py-4 hover:bg-white/30 transition-all duration-200 font-semibold text-gray-700"
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                        >
                          All Conferences
                        </motion.button>
                        {conferences.map(conf => (
                          <motion.button
                            key={conf.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedConference(conf.name);
                              setShowConferencePicker(false);
                            }}
                            className="block w-full text-left px-8 py-4 hover:bg-white/30 transition-all duration-200 font-semibold text-gray-700"
                            whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                          >
                            {conf.name}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Week Selector */}
                <div className="relative dropdown-container">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowWeekPicker(!showWeekPicker);
                      setShowYearPicker(false);
                      setShowConferencePicker(false);
                    }}
                    className="flex items-center gap-4 px-8 py-4 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 font-bold text-gray-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Clock className="w-5 h-5" strokeWidth={1.5} />
                    <span>{isPostseason ? 'Postseason' : `Week ${selectedWeek}`}</span>
                    <motion.div
                      animate={{ rotate: showWeekPicker ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {showWeekPicker && (
                      <motion.div 
                        className="absolute top-full mt-3 bg-white/25 backdrop-blur-2xl rounded-2xl border border-white/30 z-[9999] min-w-36 max-h-64 overflow-y-auto shadow-2xl"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {Array.from({length: 15}, (_, i) => i + 1).map(week => (
                          <motion.button
                            key={week}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWeek(week);
                              setIsPostseason(false);
                              setShowWeekPicker(false);
                            }}
                            className="block w-full text-left px-8 py-4 hover:bg-white/30 transition-all duration-200 font-semibold text-gray-700"
                            whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                          >
                            Week {week}
                          </motion.button>
                        ))}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPostseason(true);
                            setShowWeekPicker(false);
                          }}
                          className="block w-full text-left px-8 py-4 hover:bg-white/30 transition-all duration-200 font-semibold text-gray-700"
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                        >
                          Postseason
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Games List */}
          <div className="relative">
            <AnimatePresence>
              {isAnyDropdownOpen && (
                <motion.div 
                  className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm z-10 rounded-3xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
            
            {filteredGames.length === 0 ? (
              <motion.div 
                className="text-center py-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div 
                  className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 mx-auto mb-8 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Search className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-4xl font-black text-gray-600 mb-5">No Games Found</h3>
                <p className="text-gray-500 text-xl">Try adjusting your filters or selecting a different week.</p>
              </motion.div>
            ) : (
              <div className="space-y-10">
                {filteredGames.map((game, index) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    getTeamRank={getTeamRank}
                    getTeamLogo={getTeamLogo}
                    getTeamAbbreviation={getTeamAbbreviation}
                    formatGameDate={formatGameDate}
                    index={index}
                    gameMedia={gameMedia}
                    gameWeather={gameWeather}
                    isAnyDropdownOpen={isAnyDropdownOpen}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Futuristic Game Card Component
const GameCard = ({ game, getTeamRank, getTeamLogo, getTeamAbbreviation, formatGameDate, index, gameMedia, gameWeather, isAnyDropdownOpen }) => {
  const homeTeamId = game.home_id || game.homeId;
  const awayTeamId = game.away_id || game.awayId;
  const homeTeam = game.home_team || game.homeTeam;
  const awayTeam = game.away_team || game.awayTeam;
  const homePoints = game.home_points || game.homePoints;
  const awayPoints = game.away_points || game.awayPoints;
  const isCompleted = game.completed === true;

  const excitementIndex = game.excitement_index || game.excitementIndex || 0;
  const homePreElo = game.home_pregame_elo || game.homePregameElo;
  const awayPreElo = game.away_pregame_elo || game.awayPregameElo;
  const homePostElo = game.home_postgame_elo || game.homePostgameElo;
  const awayPostElo = game.away_postgame_elo || game.awayPostgameElo;
  const homeWinProb = game.home_postgame_win_probability || game.homePostgameWinProbability;
  const awayWinProb = game.away_postgame_win_probability || game.awayPostgameWinProbability;
  const attendance = game.attendance;

  const mediaData = gameMedia.get(game.id);
  const weatherData = gameWeather.get(game.id);

  const temperature = weatherData?.temperature || game.temperature;
  const weatherCondition = weatherData?.condition || weatherData?.weather_condition || game.weather_condition || game.weatherCondition;
  const windSpeed = weatherData?.wind_speed || game.wind_speed || game.windSpeed;
  const gameIndoors = weatherData?.indoors || game.game_indoors || game.gameIndoors;

  const tvOutlet = mediaData?.outlet || game.tv_outlet;
  const streamingOutlet = mediaData?.streamingOutlet;
  const mediaType = mediaData?.mediaType || game.media_type;

  const handleCardClick = (e) => {
    if (isAnyDropdownOpen) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    window.location.hash = `#game-detail-${game.id}`;
  };

  return (
    <motion.div 
      className={`group relative transition-all duration-700 ${
        isAnyDropdownOpen 
          ? 'cursor-not-allowed opacity-50 pointer-events-none' 
          : 'cursor-pointer'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={handleCardClick}
      whileHover={{ 
        scale: isAnyDropdownOpen ? 1 : 1.02, 
        y: isAnyDropdownOpen ? 0 : -10 
      }}
    >
      {/* Compact Glass Card */}
      <div 
        className="relative bg-white/25 backdrop-blur-2xl rounded-xl border border-white/30 p-4 shadow-lg overflow-hidden"
        style={{
          boxShadow: `
            0 10px 25px rgba(0,0,0,0.08),
            inset 0 1px 3px rgba(255,255,255,0.2),
            0 0 0 1px rgba(255,255,255,0.05)
          `
        }}
      >
        {/* Enhanced hover effects */}
        <motion.div 
          className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-red-600/20 via-red-500/10 to-red-600/20 blur-xl"
          animate={{ 
            background: [
              "linear-gradient(90deg, rgba(220,38,38,0.2) 0%, rgba(239,68,68,0.1) 50%, rgba(220,38,38,0.2) 100%)",
              "linear-gradient(180deg, rgba(220,38,38,0.15) 0%, rgba(239,68,68,0.05) 50%, rgba(220,38,38,0.15) 100%)",
              "linear-gradient(270deg, rgba(220,38,38,0.2) 0%, rgba(239,68,68,0.1) 50%, rgba(220,38,38,0.2) 100%)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="relative z-10 space-y-4">
          
          {/* Main Team Matchup */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 flex-1">
              
              {/* Away Team */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative group/logo">
                  <motion.img
                    src={getTeamLogo(awayTeamId)}
                    alt={`${awayTeam} logo`}
                    className="w-12 h-12 object-contain"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2)) saturate(1.2) contrast(1.1) brightness(1.1)'
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) saturate(1.3) contrast(1.2) brightness(1.2)'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                  />
                  {getTeamRank(awayTeamId) && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg border border-white"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
                      }}
                    >
                      <span className="text-white text-xs font-black">{getTeamRank(awayTeamId)}</span>
                    </motion.div>
                  )}
                </div>
                
                <div className="text-left">
                  <h3 className="text-sm font-black text-gray-900 mb-1">
                    {getTeamAbbreviation(awayTeamId, awayTeam)}
                  </h3>
                  {homePoints !== null && awayPoints !== null && (
                    <motion.div 
                      className="text-lg font-black bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {awayPoints}
                    </motion.div>
                  )}
                  {awayPreElo && (
                    <EloRatingDisplay 
                      preGameElo={awayPreElo} 
                      postGameElo={awayPostElo}
                      teamName={awayTeam}
                      isCompleted={isCompleted}
                    />
                  )}
                </div>
              </motion.div>

              {/* VS Indicator */}
              <div className="flex items-center justify-center">
                <motion.div 
                  className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.15, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{
                    boxShadow: `
                      0 4px 12px rgba(0,0,0,0.08),
                      inset 0 1px 2px rgba(255,255,255,0.2)
                    `
                  }}
                >
                  <span className="text-xs font-black bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
                    @
                  </span>
                </motion.div>
              </div>

              {/* Home Team */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-right">
                  <h3 className="text-sm font-black text-gray-900 mb-1">
                    {getTeamAbbreviation(homeTeamId, homeTeam)}
                  </h3>
                  {homePoints !== null && awayPoints !== null && (
                    <motion.div 
                      className="text-lg font-black bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {homePoints}
                    </motion.div>
                  )}
                  {homePreElo && (
                    <EloRatingDisplay 
                      preGameElo={homePreElo} 
                      postGameElo={homePostElo}
                      teamName={homeTeam}
                      isCompleted={isCompleted}
                    />
                  )}
                </div>
                
                <div className="relative group/logo">
                  <motion.img
                    src={getTeamLogo(homeTeamId)}
                    alt={`${homeTeam} logo`}
                    className="w-12 h-12 object-contain"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2)) saturate(1.2) contrast(1.1) brightness(1.1)'
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: -5,
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) saturate(1.3) contrast(1.2) brightness(1.2)'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                  />
                  {getTeamRank(homeTeamId) && (
                    <motion.div 
                      className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg border border-white"
                      whileHover={{ scale: 1.2, rotate: -360 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
                      }}
                    >
                      <span className="text-white text-xs font-black">{getTeamRank(homeTeamId)}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Game Status */}
            <motion.div 
              className={`relative px-3 py-2 rounded-lg font-bold text-xs backdrop-blur-xl border shadow-lg ${
                isCompleted 
                  ? 'bg-green-500/20 border-green-400/30 text-green-700' 
                  : 'bg-gradient-to-br from-red-600 to-red-800 border-white/30 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={!isCompleted ? {
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
              } : {}}
            >
              <div className="flex items-center space-x-2">
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                    <span>FINAL</span>
                  </>
                ) : (
                  <>
                    <motion.div 
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span>{formatGameDate(game.start_date || game.startDate)}</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Compact Game Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Media Coverage */}
            {(tvOutlet || streamingOutlet) && (
              <motion.div 
                className="bg-white/20 backdrop-blur-xl rounded-lg border border-white/20 p-3 shadow-lg"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.25)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-3">
                  <MediaIcon outlet={tvOutlet || streamingOutlet} mediaType={mediaType} />
                  <div>
                    <div className="font-bold text-gray-800 text-sm mb-1">{tvOutlet || streamingOutlet}</div>
                    {streamingOutlet && tvOutlet && (
                      <div className="text-xs text-gray-600 mb-1">+ {streamingOutlet}</div>
                    )}
                    {mediaType && (
                      <span className={`text-xs px-2 py-1 rounded-full font-bold inline-block ${
                        mediaType === 'web' ? 'bg-purple-500/20 text-purple-700' : 'bg-blue-500/20 text-blue-700'
                      }`}>
                        {mediaType.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Compact Weather */}
            {(temperature || weatherCondition || game.venue_details?.climate) && (
              <motion.div 
                className="bg-white/20 backdrop-blur-xl rounded-lg border border-white/20 p-3 shadow-lg"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.25)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <WeatherIcon 
                  condition={weatherCondition || game.venue_details?.climate || 'Unknown'} 
                  temperature={temperature || (game.venue_details?.temperature_avg)} 
                />
                {windSpeed && windSpeed > 10 && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center space-x-2">
                    <Wind className="w-3 h-3 text-emerald-500" strokeWidth={1.5} />
                    <span>Wind: {Math.round(windSpeed)} mph</span>
                  </div>
                )}
                {(gameIndoors || game.venue_details?.dome) && (
                  <div className="mt-2">
                    <span className="text-xs bg-gray-500/20 text-gray-700 px-2 py-1 rounded-full font-bold inline-flex items-center space-x-1">
                      <Home className="w-3 h-3" strokeWidth={1.5} />
                      <span>Indoor</span>
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Excitement Level */}
            {excitementIndex > 0 && (
              <motion.div 
                className="bg-white/20 backdrop-blur-xl rounded-lg border border-white/20 p-3 shadow-lg"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.25)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-xs font-bold text-gray-600 mb-2">Excitement Level</div>
                <ExcitementStars excitementIndex={excitementIndex} />
                <div className="text-xs text-gray-500 mt-2 font-semibold">
                  {excitementIndex >= 8 ? 'Thriller!' : 
                   excitementIndex >= 6 ? 'Great Game' : 
                   excitementIndex >= 4 ? 'Good Game' : 'Standard'}
                </div>
              </motion.div>
            )}

            {/* Venue */}
            {game.venue && (
              <motion.div 
                className="bg-white/20 backdrop-blur-xl rounded-lg border border-white/20 p-3 shadow-lg"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.25)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 p-2 flex items-center justify-center shadow-lg border border-white/20"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <MapPin className="w-full h-full text-white" strokeWidth={1.5} />
                  </motion.div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm mb-1">{game.venue}</div>
                    {attendance && (
                      <div className="text-xs text-gray-600 flex items-center space-x-1 mt-1">
                        <Users className="w-3 h-3" strokeWidth={1.5} />
                        <span>{attendance.toLocaleString()} fans</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Win Probability */}
            {(homeWinProb || awayWinProb) && (
              <div className="md:col-span-2 lg:col-span-1">
                <WinProbabilityChart 
                  homeTeam={getTeamAbbreviation(homeTeamId, homeTeam)}
                  awayTeam={getTeamAbbreviation(awayTeamId, awayTeam)}
                  homeProb={homeWinProb}
                  awayProb={awayWinProb}
                  homeTeamId={homeTeamId}
                  awayTeamId={awayTeamId}
                  getTeamLogo={getTeamLogo}
                />
              </div>
            )}
          </div>

          {/* Game Type Badges */}
          <motion.div 
            className="flex flex-wrap gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {(game.conference_game || game.conferenceGame) && (
              <motion.div 
                className="px-8 py-4 rounded-full bg-blue-500/20 backdrop-blur-xl text-blue-700 font-black text-lg border border-blue-400/30 shadow-lg"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.25)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Trophy className="inline w-5 h-5 mr-3" strokeWidth={1.5} />
                Conference Game
              </motion.div>
            )}
            
            {(game.neutral_site || game.neutralSite) && (
              <motion.div 
                className="px-8 py-4 rounded-full bg-purple-500/20 backdrop-blur-xl text-purple-700 font-black text-lg border border-purple-400/30 shadow-lg"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(147, 51, 234, 0.25)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MapPin className="inline w-5 h-5 mr-3" strokeWidth={1.5} />
                Neutral Site
              </motion.div>
            )}

            {game.rivalry && (
              <motion.div 
                className="px-8 py-4 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-lg shadow-2xl border border-white/20"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 15px 35px rgba(220, 38, 38, 0.4)" 
                }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4), inset 0 1px 4px rgba(255,255,255,0.2)'
                }}
              >
                <Flame className="inline w-5 h-5 mr-3" strokeWidth={1.5} />
                Rivalry Game
              </motion.div>
            )}

            {isCompleted && excitementIndex >= 8 && (
              <motion.div 
                className="px-8 py-4 rounded-full bg-yellow-500/20 backdrop-blur-xl text-yellow-700 font-black text-lg border border-yellow-400/30 shadow-lg"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(234, 179, 8, 0.25)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Star className="inline w-5 h-5 mr-3" strokeWidth={1.5} />
                Game of the Week
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Schedule;