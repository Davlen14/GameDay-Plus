import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Divider,
  Chip,
  Alert,
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Thermometer, 
  Cloud, 
  CloudRain, 
  Wind,
  Sun,
  CloudSnow,
  Droplets,
  Snowflake,
  CloudLightning,
  CloudDrizzle,
  Gauge,
  Timer,
  Home,
  Plane,
  TrendingUp,
  Activity
} from 'lucide-react';

// Import team service
import { teamService } from '../../services/teamService';

// Import weather calculations utility
import {
  processGamesData,
  analyzeWeatherPerformance,
  analyzeTimePerformance,
  analyzeWeatherStrategy,
  analyzeHomeAwayPerformance,
  analyzeDayOfWeekPerformance,
  createWeatherTimeHeatmapData,
  analyzeExtremeWeather,
  generateInsights,
  formatChartData
} from '../../utils/weatherCalculations';

// Mock data definitions
const MOCK_DATA = {
  weatherPerformance: {
    Freezing: {
      win_rate: 0.55,
      avg_points_for: 24.2,
      avg_points_against: 20.1,
      avg_point_diff: 4.1,
      avg_total_yards: 350.5,
      avg_pass_yards: 180.2,
      avg_rush_yards: 170.3,
      avg_turnovers: 1.2,
      games_played: 12
    },
    Cold: {
      win_rate: 0.60,
      avg_points_for: 27.5,
      avg_points_against: 19.8,
      avg_point_diff: 7.7,
      avg_total_yards: 370.1,
      avg_pass_yards: 200.4,
      avg_rush_yards: 169.7,
      avg_turnovers: 1.0,
      games_played: 18
    },
    Moderate: {
      win_rate: 0.65,
      avg_points_for: 30.3,
      avg_points_against: 21.2,
      avg_point_diff: 9.1,
      avg_total_yards: 390.2,
      avg_pass_yards: 210.5,
      avg_rush_yards: 179.7,
      avg_turnovers: 0.9,
      games_played: 22
    },
    Warm: {
      win_rate: 0.50,
      avg_points_for: 22.1,
      avg_points_against: 23.5,
      avg_point_diff: -1.4,
      avg_total_yards: 340.0,
      avg_pass_yards: 170.0,
      avg_rush_yards: 170.0,
      avg_turnovers: 1.5,
      games_played: 10
    }
  },
  timePerformance: {
    Morning: { win_rate: 0.60, pointsFor: 28, pointsAgainst: 20, pointDiff: 8, gamesPlayed: 10 },
    'Early Afternoon': { win_rate: 0.62, pointsFor: 29, pointsAgainst: 21, pointDiff: 8, gamesPlayed: 15 },
    'Late Afternoon': { win_rate: 0.58, pointsFor: 27, pointsAgainst: 22, pointDiff: 5, gamesPlayed: 12 },
    Night: { win_rate: 0.65, pointsFor: 31, pointsAgainst: 19, pointDiff: 12, gamesPlayed: 25 }
  },
  weatherStrategy: {
    Freezing: { pass_ratio: 0.45, avg_turnovers: 1.2, avg_passing_yards: 180, avg_rushing_yards: 170 },
    Cold: { pass_ratio: 0.50, avg_turnovers: 1.0, avg_passing_yards: 200, avg_rushing_yards: 170 },
    Moderate: { pass_ratio: 0.55, avg_turnovers: 0.9, avg_passing_yards: 210, avg_rushing_yards: 180 },
    Warm: { pass_ratio: 0.40, avg_turnovers: 1.5, avg_passing_yards: 170, avg_rushing_yards: 170 }
  },
  homeAwayPerformance: {
    home: { win_rate: 0.65, avg_points_for: 30, avg_points_against: 20 },
    away: { win_rate: 0.55, avg_points_for: 25, avg_points_against: 23 }
  },
  extremeWeather: {
    extremeCold: { count: 12, winRate: 0.55, avgScore: 24.2, avgOpponentScore: 20.1 },
    extremeHot: { count: 10, winRate: 0.50, avgScore: 22.1, avgOpponentScore: 23.5 },
    highWind: { count: 8, winRate: 0.52, avgScore: 23.0, avgOpponentScore: 22.0 },
    precipitation: { count: 15, winRate: 0.58, avgScore: 26.0, avgOpponentScore: 21.0 }
  },
  heatmapData: [
    { weather: 'Freezing', time: 'Morning', value: 0.50, games: 3 },
    { weather: 'Freezing', time: 'Early Afternoon', value: 0.55, games: 4 },
    { weather: 'Freezing', time: 'Late Afternoon', value: 0.60, games: 3 },
    { weather: 'Freezing', time: 'Night', value: 0.52, games: 2 },
    { weather: 'Cold', time: 'Morning', value: 0.58, games: 3 },
    { weather: 'Cold', time: 'Early Afternoon', value: 0.62, games: 5 },
    { weather: 'Cold', time: 'Late Afternoon', value: 0.60, games: 4 },
    { weather: 'Cold', time: 'Night', value: 0.61, games: 6 },
    { weather: 'Moderate', time: 'Morning', value: 0.65, games: 2 },
    { weather: 'Moderate', time: 'Early Afternoon', value: 0.68, games: 4 },
    { weather: 'Moderate', time: 'Late Afternoon', value: 0.64, games: 3 },
    { weather: 'Moderate', time: 'Night', value: 0.70, games: 13 },
    { weather: 'Warm', time: 'Morning', value: 0.52, games: 2 },
    { weather: 'Warm', time: 'Early Afternoon', value: 0.48, games: 2 },
    { weather: 'Warm', time: 'Late Afternoon', value: 0.50, games: 2 },
    { weather: 'Warm', time: 'Night', value: 0.51, games: 4 }
  ],
  insights: [
    "Team performs best in moderate weather conditions (65% win rate)",
    "Night games show highest win rate at 65%",
    "Home field advantage is significant with 10% higher win rate",
    "Passing efficiency increases in moderate/cold weather conditions"
  ],
  processedGames: Array(62).fill(null).map((_, i) => ({
    weather_category: ['Freezing', 'Cold', 'Moderate', 'Warm'][Math.floor(Math.random() * 4)],
    is_home: Math.random() > 0.5,
    won: Math.random() > 0.4,
    temperature: Math.random() * 60 + 30,
    wind_speed: Math.random() * 20,
    humidity: Math.random() * 100,
    precipitation: Math.random() > 0.7 ? Math.random() * 2 : 0
  }))
};

const WeatherPerformanceTab = () => {
  const theme = useTheme();
  const { teamId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [debugLog, setDebugLog] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [processedGames, setProcessedGames] = useState([]);
  const [weatherPerformance, setWeatherPerformance] = useState({});
  const [timePerformance, setTimePerformance] = useState({});
  const [weatherStrategy, setWeatherStrategy] = useState({});
  const [homeAwayPerformance, setHomeAwayPerformance] = useState({});
  const [dayOfWeekPerformance, setDayOfWeekPerformance] = useState({});
  const [heatmapData, setHeatmapData] = useState([]);
  const [extremeWeather, setExtremeWeather] = useState({});
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  
  // Modern gradient colors
  const weatherGradients = {
    'Freezing': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Cold': 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    'Moderate': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'Warm': 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)'
  };
  
  const timeGradients = {
    'Morning': 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
    'Early Afternoon': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Late Afternoon': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'Night': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  };

  // Weather icons mapping
  const getWeatherIcon = (weather) => {
    switch(weather) {
      case 'Freezing': return <Snowflake className="w-6 h-6" />;
      case 'Cold': return <CloudSnow className="w-6 h-6" />;
      case 'Moderate': return <Cloud className="w-6 h-6" />;
      case 'Warm': return <Sun className="w-6 h-6" />;
      default: return <Cloud className="w-6 h-6" />;
    }
  };

  // Helper to safely get nested values with defaults
  const safe = (obj, path, def) => {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? def;
  };

  // Function to load mock data
  const loadMockData = () => {
    setTeamData({ school: teamId });
    setProcessedGames(MOCK_DATA.processedGames);
    setWeatherPerformance(MOCK_DATA.weatherPerformance);
    setTimePerformance(MOCK_DATA.timePerformance);
    setWeatherStrategy(MOCK_DATA.weatherStrategy);
    setHomeAwayPerformance(MOCK_DATA.homeAwayPerformance);
    setExtremeWeather(MOCK_DATA.extremeWeather);
    setHeatmapData(MOCK_DATA.heatmapData);
    setInsights(MOCK_DATA.insights);
    setIsUsingMockData(true);
    setTimeout(() => setAnimateStats(true), 300);
  };

  // Fetch team data and process
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setProgress(0);
        setDebugLog([]);
        
        // Simulate loading for demo
        setTimeout(() => {
          loadMockData();
          setLoading(false);
        }, 2000);
        
      } catch (err) {
        console.error("Error fetching weather performance data:", err);
        setError("Failed to load weather performance data due to ongoing development. Showing prototype UI with mock data.");
        loadMockData();
        setLoading(false);
      }
    };
    
    fetchData();
  }, [teamId]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Custom styled components
  const GlassCard = ({ children, className = '', gradient = false, ...props }) => (
    <div 
      className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 ${animateStats ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );

  const StatCard = ({ icon, title, value, subtitle, gradient, delay = 0 }) => (
    <GlassCard 
      className="p-6 h-full transform hover:scale-105 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
          style={{ background: gradient }}
        >
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 font-light" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {subtitle}
          </p>
          <p 
            className="text-3xl font-black bg-clip-text text-transparent"
            style={{ 
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Orbitron, sans-serif'
            }}
          >
            {value}
          </p>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Orbitron, sans-serif' }}>
        {title}
      </h3>
    </GlassCard>
  );

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-white/50">
          <p className="font-bold text-gray-800" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color, fontFamily: 'Orbitron, sans-serif' }}>
              {entry.name}: {typeof entry.value === 'number' ? 
                (entry.name.includes('%') || entry.name.includes('Rate') ? 
                  `${(entry.value * 100).toFixed(1)}%` : 
                  entry.value.toFixed(1)) : 
                entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Weather Performance Heatmap Component
  const WeatherHeatmap = ({ data }) => {
    const weatherTypes = ['Freezing', 'Cold', 'Moderate', 'Warm'];
    const timeSlots = ['Morning', 'Early Afternoon', 'Late Afternoon', 'Night'];
    
    const getColor = (value) => {
      if (!value) return '#f0f0f0';
      const intensity = value;
      if (intensity >= 0.7) return '#22c55e';
      if (intensity >= 0.6) return '#3b82f6';
      if (intensity >= 0.5) return '#f59e0b';
      return '#ef4444';
    };

    return (
      <GlassCard className="p-8">
        <h3 className="text-2xl font-black mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          Performance Heatmap
        </h3>
        <div className="grid grid-cols-5 gap-2">
          <div></div>
          {timeSlots.map(time => (
            <div key={time} className="text-center">
              <p className="text-xs font-bold text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {time}
              </p>
            </div>
          ))}
          {weatherTypes.map(weather => (
            <React.Fragment key={weather}>
              <div className="flex items-center justify-end pr-2">
                {getWeatherIcon(weather)}
                <span className="ml-2 text-sm font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {weather}
                </span>
              </div>
              {timeSlots.map(time => {
                const cell = data.find(d => d.weather === weather && d.time === time);
                const value = cell ? cell.value : 0;
                const games = cell ? cell.games : 0;
                return (
                  <div
                    key={`${weather}-${time}`}
                    className="relative group"
                  >
                    <div
                      className="aspect-square rounded-xl flex items-center justify-center text-white font-bold shadow-lg transform transition-all duration-300 hover:scale-110 cursor-pointer"
                      style={{ 
                        backgroundColor: getColor(value),
                        fontFamily: 'Orbitron, sans-serif'
                      }}
                    >
                      {(value * 100).toFixed(0)}%
                    </div>
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                      <p style={{ fontFamily: 'Orbitron, sans-serif' }}>{games} games</p>
                      <p style={{ fontFamily: 'Orbitron, sans-serif' }}>Win Rate: {(value * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center justify-center mt-6 space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>Poor (&lt;50%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-amber-500"></div>
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>Average (50-60%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>Good (60-70%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>Excellent (70%+)</span>
          </div>
        </div>
      </GlassCard>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
          
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .loading-spinner {
            animation: spin 2s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .pulse-animation {
            animation: pulse 2s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-2xl opacity-50 mx-auto pulse-animation"></div>
            <div className="relative w-24 h-24 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
              <CloudLightning className="w-12 h-12 text-purple-600 loading-spinner" />
            </div>
          </div>
          <h3 className="text-3xl font-black gradient-text mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Loading Weather Analysis
          </h3>
          <p className="text-gray-600 font-light" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Analyzing 10 years of weather data...
          </p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen p-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .weather-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .custom-tab {
          font-family: 'Orbitron', sans-serif !important;
          font-weight: 600 !important;
          text-transform: none !important;
          font-size: 1rem !important;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: inset 0 2px 10px rgba(255, 255, 255, 0.3), 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .chart-animation {
          animation: fadeInScale 0.8s ease-out forwards;
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: rgba(0, 0, 0, 0.05);
        }
        
        .recharts-text {
          font-family: 'Orbitron', sans-serif !important;
          font-size: 0.875rem;
        }
        
        .recharts-legend-item-text {
          font-family: 'Orbitron', sans-serif !important;
          font-weight: 600;
        }
      `}</style>

      {/* Show error message if using mock data */}
      {(error || isUsingMockData) && (
        <Alert 
          severity="info" 
          className="mb-6 glass-effect"
          sx={{ 
            borderRadius: '1.5rem',
            fontFamily: 'Orbitron, sans-serif',
            '& .MuiAlert-message': { fontFamily: 'Orbitron, sans-serif' }
          }}
        >
          {error || "Showing prototype UI with mock data for demonstration."}
        </Alert>
      )}
      
      {/* Header Section */}
      <div className={`text-center mb-12 transition-all duration-500 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <CloudLightning className="w-12 h-12 text-purple-600" />
          <h1 className="text-5xl font-black gradient-text">
            Weather Performance Analysis
          </h1>
          <CloudLightning className="w-12 h-12 text-purple-600" />
        </div>
        <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
          Analyzing {teamData?.school}'s performance across different weather conditions 
          based on {processedGames.length} games over the past 10 years
        </p>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<Thermometer />}
          title="Best Weather"
          value="Moderate"
          subtitle="65% Win Rate"
          gradient={weatherGradients.Moderate}
          delay={100}
        />
        <StatCard
          icon={<Timer />}
          title="Best Time"
          value="Night"
          subtitle="65% Win Rate"
          gradient={timeGradients.Night}
          delay={200}
        />
        <StatCard
          icon={<Home />}
          title="Home Advantage"
          value="+10%"
          subtitle="Win Rate Boost"
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          delay={300}
        />
        <StatCard
          icon={<Activity />}
          title="Total Games"
          value={processedGames.length}
          subtitle="Analyzed"
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          delay={400}
        />
      </div>

      {/* Insights Section */}
      <GlassCard className="p-8 mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black gradient-text">Key Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className="flex items-start space-x-3 p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 transform hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 font-medium">{insight}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Tabs */}
      <GlassCard className="p-2 mb-8">
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': { 
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              color: 'rgba(0,0,0,0.6)',
              '&.Mui-selected': {
                color: '#7c3aed',
                fontWeight: 700
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#7c3aed',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="Weather Conditions" icon={<Cloud className="w-5 h-5" />} iconPosition="start" />
          <Tab label="Time of Day" icon={<Timer className="w-5 h-5" />} iconPosition="start" />
          <Tab label="Strategy" icon={<Activity className="w-5 h-5" />} iconPosition="start" />
          <Tab label="Home vs Away" icon={<Home className="w-5 h-5" />} iconPosition="start" />
          <Tab label="Extreme Weather" icon={<CloudLightning className="w-5 h-5" />} iconPosition="start" />
          <Tab label="Heatmap" icon={<Gauge className="w-5 h-5" />} iconPosition="start" />
        </Tabs>
      </GlassCard>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Weather Conditions Tab */}
        {activeTab === 0 && (
          <div className="space-y-8">
            {/* Win Rate by Weather */}
            <GlassCard className="p-8">
              <h3 className="text-2xl font-black mb-6 gradient-text">Win Rate by Weather Condition</h3>
              <div className="h-96 chart-animation">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={formatChartData(weatherPerformance)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <defs>
                      <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontFamily: 'Orbitron', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      domain={[0, 1]} 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      tick={{ fontFamily: 'Orbitron', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="winRate" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorWinRate)"
                      strokeWidth={3}
                      name="Win Rate"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Points Analysis */}
              <GlassCard className="p-8">
                <h3 className="text-2xl font-black mb-6 gradient-text">Scoring by Weather</h3>
                <div className="h-80 chart-animation">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={Object.keys(weatherPerformance).map(key => ({
                        category: key,
                        pointsFor: weatherPerformance[key].avg_points_for,
                        pointsAgainst: weatherPerformance[key].avg_points_against,
                        differential: weatherPerformance[key].avg_point_diff
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="category" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <YAxis tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontFamily: 'Orbitron' }} />
                      <Bar dataKey="pointsFor" fill="#22c55e" name="Points For" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="pointsAgainst" fill="#ef4444" name="Points Against" radius={[8, 8, 0, 0]} />
                      <Line type="monotone" dataKey="differential" stroke="#3b82f6" strokeWidth={3} name="Differential" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Yards Analysis */}
              <GlassCard className="p-8">
                <h3 className="text-2xl font-black mb-6 gradient-text">Yardage by Weather</h3>
                <div className="h-80 chart-animation">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={Object.keys(weatherPerformance).map(key => ({
                      category: key,
                      totalYards: weatherPerformance[key].avg_total_yards,
                      passYards: weatherPerformance[key].avg_pass_yards,
                      rushYards: weatherPerformance[key].avg_rush_yards
                    }))}>
                      <PolarGrid stroke="rgba(0,0,0,0.1)" />
                      <PolarAngleAxis dataKey="category" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontFamily: 'Orbitron', fontSize: 10 }} />
                      <Radar name="Total Yards" dataKey="totalYards" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} strokeWidth={2} />
                      <Radar name="Pass Yards" dataKey="passYards" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} strokeWidth={2} />
                      <Radar name="Rush Yards" dataKey="rushYards" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontFamily: 'Orbitron' }} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* Detailed Stats Table */}
            <GlassCard className="p-8 overflow-hidden">
              <h3 className="text-2xl font-black mb-6 gradient-text">Detailed Performance Metrics</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left font-bold text-gray-700" style={{ fontFamily: 'Orbitron' }}>Weather</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700" style={{ fontFamily: 'Orbitron' }}>Games</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700" style={{ fontFamily: 'Orbitron' }}>Win %</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700" style={{ fontFamily: 'Orbitron' }}>Pts For</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700" style={{ fontFamily: 'Orbitron' }}>Pts Against</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700" style={{ fontFamily: 'Orbitron' }}>Total Yds</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700" style={{ fontFamily: 'Orbitron' }}>Pass Yds</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700" style={{ fontFamily: 'Orbitron' }}>Rush Yds</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700" style={{ fontFamily: 'Orbitron' }}>TO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(weatherPerformance).map((category, index) => {
                      const data = weatherPerformance[category];
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 font-medium" style={{ fontFamily: 'Orbitron' }}>
                            <div className="flex items-center space-x-2">
                              {getWeatherIcon(category)}
                              <span>{category}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right" style={{ fontFamily: 'Orbitron' }}>{data.games_played}</td>
                          <td className="px-4 py-4 text-right font-bold" style={{ fontFamily: 'Orbitron' }}>
                            <span className={`px-2 py-1 rounded-lg text-white ${data.win_rate >= 0.6 ? 'bg-green-500' : data.win_rate >= 0.5 ? 'bg-blue-500' : 'bg-red-500'}`}>
                              {(data.win_rate * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right" style={{ fontFamily: 'Orbitron' }}>{data.avg_points_for.toFixed(1)}</td>
                          <td className="px-4 py-4 text-right" style={{ fontFamily: 'Orbitron' }}>{data.avg_points_against.toFixed(1)}</td>
                          <td className="px-4 py-4 text-right" style={{ fontFamily: 'Orbitron' }}>{data.avg_total_yards.toFixed(0)}</td>
                          <td className="px-4 py-4 text-right" style={{ fontFamily: 'Orbitron' }}>{data.avg_pass_yards.toFixed(0)}</td>
                          <td className="px-4 py-4 text-right" style={{ fontFamily: 'Orbitron' }}>{data.avg_rush_yards.toFixed(0)}</td>
                          <td className="px-4 py-4 text-right" style={{ fontFamily: 'Orbitron' }}>{data.avg_turnovers.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Time of Day Tab */}
        {activeTab === 1 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Win Rate by Time */}
              <GlassCard className="p-8">
                <h3 className="text-2xl font-black mb-6 gradient-text">Win Rate by Time of Day</h3>
                <div className="h-80 chart-animation">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatChartData(timePerformance)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        {Object.keys(timeGradients).map((time, index) => (
                          <linearGradient key={time} id={`gradient-${time}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={timeGradients[time].split(' ')[2].slice(0, -1)} stopOpacity={1} />
                            <stop offset="100%" stopColor={timeGradients[time].split(' ')[5].slice(0, -1)} stopOpacity={0.8} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="category" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="winRate" name="Win Rate" radius={[12, 12, 0, 0]}>
                        {formatChartData(timePerformance).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradient-${entry.category})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Scoring by Time */}
              <GlassCard className="p-8">
                <h3 className="text-2xl font-black mb-6 gradient-text">Scoring Performance</h3>
                <div className="h-80 chart-animation">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatChartData(timePerformance)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="category" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <YAxis tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontFamily: 'Orbitron' }} />
                      <Line type="monotone" dataKey="pointsFor" stroke="#22c55e" strokeWidth={3} name="Points For" dot={{ r: 6 }} />
                      <Line type="monotone" dataKey="pointsAgainst" stroke="#ef4444" strokeWidth={3} name="Points Against" dot={{ r: 6 }} />
                      <Line type="monotone" dataKey="pointDiff" stroke="#3b82f6" strokeWidth={3} name="Differential" strokeDasharray="5 5" dot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* Time Distribution */}
            <GlassCard className="p-8">
              <h3 className="text-2xl font-black mb-6 gradient-text">Game Distribution by Time</h3>
              <div className="h-96 chart-animation">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatChartData(timePerformance)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="gamesPlayed"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {formatChartData(timePerformance).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(timeGradients)[index % Object.values(timeGradients).length].split(' ')[2].slice(0, -1)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Strategy Tab */}
        {activeTab === 2 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pass/Run Ratio */}
              <GlassCard className="p-8">
                <h3 className="text-2xl font-black mb-6 gradient-text">Offensive Balance by Weather</h3>
                <div className="h-80 chart-animation">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.keys(weatherStrategy).map(category => ({
                        category,
                        passRatio: weatherStrategy[category].pass_ratio * 100,
                        rushRatio: (1 - weatherStrategy[category].pass_ratio) * 100
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="category" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} formatter={(value) => `${value.toFixed(1)}%`} />
                      <Legend wrapperStyle={{ fontFamily: 'Orbitron' }} />
                      <Bar dataKey="passRatio" name="Pass %" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="rushRatio" name="Rush %" stackId="a" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Turnovers by Weather */}
              <GlassCard className="p-8">
                <h3 className="text-2xl font-black mb-6 gradient-text">Ball Security Analysis</h3>
                <div className="h-80 chart-animation">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={Object.keys(weatherStrategy).map(category => ({
                        category,
                        turnovers: weatherStrategy[category].avg_turnovers
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="colorTurnovers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="category" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <YAxis tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="turnovers" stroke="#ef4444" fillOpacity={1} fill="url(#colorTurnovers)" strokeWidth={3} name="Avg Turnovers" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* Strategy Radar */}
            <GlassCard className="p-8">
              <h3 className="text-2xl font-black mb-6 gradient-text">Comprehensive Strategy Overview</h3>
              <div className="h-96 chart-animation">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={
                    Object.keys(weatherStrategy).map(category => ({
                      category,
                      passingYards: weatherStrategy[category].avg_passing_yards,
                      rushingYards: weatherStrategy[category].avg_rushing_yards,
                      turnovers: weatherStrategy[category].avg_turnovers * 50,
                      passRatio: weatherStrategy[category].pass_ratio * 200
                    }))
                  }>
                    <PolarGrid stroke="rgba(0,0,0,0.1)" />
                    <PolarAngleAxis dataKey="category" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontFamily: 'Orbitron', fontSize: 10 }} />
                    <Radar name="Passing Yards" dataKey="passingYards" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                    <Radar name="Rushing Yards" dataKey="rushingYards" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} />
                    <Radar name="Turnovers (x50)" dataKey="turnovers" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} strokeWidth={2} />
                    <Radar name="Pass Ratio (x200)" dataKey="passRatio" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontFamily: 'Orbitron' }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Home vs Away Tab */}
        {activeTab === 3 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Win Rate Comparison */}
              <GlassCard className="p-8">
                <h3 className="text-2xl font-black mb-6 gradient-text">Win Rate Comparison</h3>
                <div className="h-80 chart-animation">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { location: 'Home', winRate: homeAwayPerformance.home.win_rate },
                        { location: 'Away', winRate: homeAwayPerformance.away.win_rate }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="location" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                      <Bar dataKey="winRate" name="Win Rate" radius={[12, 12, 0, 0]}>
                        <Cell fill="#22c55e" />
                        <Cell fill="#3b82f6" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Scoring Comparison */}
              <GlassCard className="p-8 lg:col-span-2">
                <h3 className="text-2xl font-black mb-6 gradient-text">Scoring Analysis</h3>
                <div className="h-80 chart-animation">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={[
                        { 
                          location: 'Home', 
                          pointsFor: homeAwayPerformance.home.avg_points_for,
                          pointsAgainst: homeAwayPerformance.home.avg_points_against,
                          differential: homeAwayPerformance.home.avg_points_for - homeAwayPerformance.home.avg_points_against
                        },
                        { 
                          location: 'Away', 
                          pointsFor: homeAwayPerformance.away.avg_points_for,
                          pointsAgainst: homeAwayPerformance.away.avg_points_against,
                          differential: homeAwayPerformance.away.avg_points_for - homeAwayPerformance.away.avg_points_against
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="location" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <YAxis tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontFamily: 'Orbitron' }} />
                      <Bar dataKey="pointsFor" fill="#22c55e" name="Points For" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="pointsAgainst" fill="#ef4444" name="Points Against" radius={[8, 8, 0, 0]} />
                      <Line type="monotone" dataKey="differential" stroke="#3b82f6" strokeWidth={3} name="Differential" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* Weather Performance by Location */}
            <GlassCard className="p-8">
              <h3 className="text-2xl font-black mb-6 gradient-text">Weather Performance by Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.keys(weatherPerformance).map((weather, index) => {
                  const homeGamesInWeather = processedGames.filter(
                    game => game.weather_category === weather && game.is_home
                  );
                  const awayGamesInWeather = processedGames.filter(
                    game => game.weather_category === weather && !game.is_home
                  );
                  
                  const homeWinRate = homeGamesInWeather.length > 0 
                    ? homeGamesInWeather.filter(game => game.won).length / homeGamesInWeather.length 
                    : 0;
                    
                  const awayWinRate = awayGamesInWeather.length > 0 
                    ? awayGamesInWeather.filter(game => game.won).length / awayGamesInWeather.length 
                    : 0;
                  
                  return (
                    <div 
                      key={index}
                      className="bg-white/30 backdrop-blur-sm rounded-2xl border border-white/40 p-6"
                      style={{ 
                        borderTop: `4px solid transparent`,
                        borderImage: `${weatherGradients[weather]} 1`
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        {getWeatherIcon(weather)}
                        <span className="font-bold text-gray-800">{weather}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Home</span>
                          <span className="font-bold text-green-600">
                            {homeGamesInWeather.length > 0 ? `${(homeWinRate * 100).toFixed(1)}%` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Away</span>
                          <span className="font-bold text-blue-600">
                            {awayGamesInWeather.length > 0 ? `${(awayWinRate * 100).toFixed(1)}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Extreme Weather Tab */}
        {activeTab === 4 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Extreme Cold Card */}
              <GlassCard className="p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Snowflake className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-black text-blue-600">{safe(extremeWeather, ['extremeCold', 'count'], 0)}</span>
                </div>
                <h4 className="text-lg font-bold mb-2">Extreme Cold</h4>
                <p className="text-sm text-gray-600 mb-3">Games below 32°F</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Win Rate</span>
                    <span className="font-bold">{(safe(extremeWeather, ['extremeCold', 'winRate'], 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Score</span>
                    <span className="font-bold">{safe(extremeWeather, ['extremeCold', 'avgScore'], 0).toFixed(1)}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Extreme Heat Card */}
              <GlassCard className="p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Sun className="w-8 h-8 text-orange-600" />
                  <span className="text-2xl font-black text-orange-600">{safe(extremeWeather, ['extremeHot', 'count'], 0)}</span>
                </div>
                <h4 className="text-lg font-bold mb-2">Extreme Heat</h4>
                <p className="text-sm text-gray-600 mb-3">Games above 85°F</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Win Rate</span>
                    <span className="font-bold">{(safe(extremeWeather, ['extremeHot', 'winRate'], 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Score</span>
                    <span className="font-bold">{safe(extremeWeather, ['extremeHot', 'avgScore'], 0).toFixed(1)}</span>
                  </div>
                </div>
              </GlassCard>

              {/* High Wind Card */}
              <GlassCard className="p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Wind className="w-8 h-8 text-purple-600" />
                  <span className="text-2xl font-black text-purple-600">{safe(extremeWeather, ['highWind', 'count'], 0)}</span>
                </div>
                <h4 className="text-lg font-bold mb-2">High Wind</h4>
                <p className="text-sm text-gray-600 mb-3">20+ mph winds</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Win Rate</span>
                    <span className="font-bold">{(safe(extremeWeather, ['highWind', 'winRate'], 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Score</span>
                    <span className="font-bold">{safe(extremeWeather, ['highWind', 'avgScore'], 0).toFixed(1)}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Precipitation Card */}
              <GlassCard className="p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <CloudRain className="w-8 h-8 text-cyan-600" />
                  <span className="text-2xl font-black text-cyan-600">{safe(extremeWeather, ['precipitation', 'count'], 0)}</span>
                </div>
                <h4 className="text-lg font-bold mb-2">Precipitation</h4>
                <p className="text-sm text-gray-600 mb-3">Rain/Snow games</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Win Rate</span>
                    <span className="font-bold">{(safe(extremeWeather, ['precipitation', 'winRate'], 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Score</span>
                    <span className="font-bold">{safe(extremeWeather, ['precipitation', 'avgScore'], 0).toFixed(1)}</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Extreme Weather Comparison Chart */}
            <GlassCard className="p-8">
              <h3 className="text-2xl font-black mb-6 gradient-text">Extreme Weather Performance Comparison</h3>
              <div className="h-96 chart-animation">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[
                      { 
                        condition: 'Extreme Cold', 
                        winRate: safe(extremeWeather, ['extremeCold', 'winRate'], 0),
                        gamesPlayed: safe(extremeWeather, ['extremeCold', 'count'], 0),
                        avgScore: safe(extremeWeather, ['extremeCold', 'avgScore'], 0)
                      },
                      { 
                        condition: 'Extreme Heat', 
                        winRate: safe(extremeWeather, ['extremeHot', 'winRate'], 0),
                        gamesPlayed: safe(extremeWeather, ['extremeHot', 'count'], 0),
                        avgScore: safe(extremeWeather, ['extremeHot', 'avgScore'], 0)
                      },
                      { 
                        condition: 'High Wind', 
                        winRate: safe(extremeWeather, ['highWind', 'winRate'], 0),
                        gamesPlayed: safe(extremeWeather, ['highWind', 'count'], 0),
                        avgScore: safe(extremeWeather, ['highWind', 'avgScore'], 0)
                      },
                      { 
                        condition: 'Precipitation', 
                        winRate: safe(extremeWeather, ['precipitation', 'winRate'], 0),
                        gamesPlayed: safe(extremeWeather, ['precipitation', 'count'], 0),
                        avgScore: safe(extremeWeather, ['precipitation', 'avgScore'], 0)
                      }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="condition" angle={-45} textAnchor="end" height={80} tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                    <YAxis yAxisId="left" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontFamily: 'Orbitron', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontFamily: 'Orbitron' }} />
                    <Bar yAxisId="left" dataKey="winRate" name="Win Rate" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="right" dataKey="gamesPlayed" name="Games" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#f59e0b" strokeWidth={3} name="Avg Score" dot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 5 && (
          <div className="space-y-8">
            <WeatherHeatmap data={heatmapData} />
            
            {/* 3D Scatter Plot for Weather Conditions */}
            <GlassCard className="p-8">
              <h3 className="text-2xl font-black mb-6 gradient-text">Weather Conditions Scatter Analysis</h3>
              <div className="h-96 chart-animation">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="temperature" 
                      name="Temperature" 
                      unit="°F"
                      tick={{ fontFamily: 'Orbitron', fontSize: 12 }}
                      domain={[20, 100]}
                    />
                    <YAxis 
                      dataKey="humidity" 
                      name="Humidity" 
                      unit="%"
                      tick={{ fontFamily: 'Orbitron', fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <ZAxis dataKey="wind_speed" range={[50, 400]} name="Wind Speed" unit="mph" />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Legend wrapperStyle={{ fontFamily: 'Orbitron' }} />
                    <Scatter 
                      name="Games" 
                      data={processedGames.map(game => ({
                        temperature: game.temperature,
                        humidity: game.humidity,
                        wind_speed: game.wind_speed,
                        won: game.won,
                        weather_category: game.weather_category
                      }))} 
                      fill="#8884d8"
                    >
                      {processedGames.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.won ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center mt-4 space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Win</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Loss</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Bubble size = Wind Speed</span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Footer */}
      <GlassCard className="p-8 mt-12">
        <div className="flex items-center space-x-4 mb-6">
          <Activity className="w-8 h-8 text-purple-600" />
          <h3 className="text-2xl font-black gradient-text">Analysis Summary</h3>
        </div>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed">
            This comprehensive weather performance analysis reveals how {teamData?.school} adapts to various environmental conditions. 
            The data spans {processedGames.length} games over 10 years, providing deep insights into optimal playing conditions 
            and areas for strategic improvement. Key findings show strongest performance in moderate weather conditions with 
            a {Object.keys(weatherPerformance).length > 0 ? (weatherPerformance.Moderate?.win_rate * 100).toFixed(1) : 'N/A'}% win rate, 
            while extreme conditions present unique challenges and opportunities for the team.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default WeatherPerformanceTab;