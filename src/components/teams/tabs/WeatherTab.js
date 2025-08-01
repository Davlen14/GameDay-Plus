import React, { useState, useEffect } from 'react';
import { weatherService } from '../../../services/weatherService';

const WeatherTab = ({ team1, team2 }) => {
  const [weatherComparison, setWeatherComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYears, setSelectedYears] = useState([2021, 2022, 2023, 2024]);
  const [detailedView, setDetailedView] = useState(false);
  const [predictionConditions, setPredictionConditions] = useState({
    temperature: 65,
    humidity: 50,
    windSpeed: 10,
    precipitation: 0,
    pressure: 1017
  });
  const [prediction, setPrediction] = useState(null);
  const [activeWeatherCard, setActiveWeatherCard] = useState(null);

  // Modern red gradient colors for consistent branding
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  
  // Get team-specific colors or fall back to modern red gradient
  const getTeamColors = (team) => {
    if (!team) return {
      primary: 'from-red-600 to-red-700',
      secondary: 'bg-red-50',
      accent: 'border-red-200',
      solid: '#dc2626'
    };

    // Use team's actual color if available, otherwise use red gradient
    const teamColor = team.color || '#dc2626';
    
    return {
      primary: `from-[${teamColor}] to-[${teamColor}dd]`,
      secondary: 'bg-gray-50',
      accent: 'border-gray-200',
      solid: teamColor
    };
  };

  // Temperature to color mapping for thermometer effect
  const getTempColor = (temp) => {
    if (temp <= 32) return 'from-blue-600 to-cyan-400'; // Freezing - Blue
    if (temp <= 45) return 'from-cyan-400 to-blue-300'; // Cold - Light Blue
    if (temp <= 60) return 'from-green-400 to-emerald-300'; // Cool - Green
    if (temp <= 75) return 'from-yellow-400 to-green-400'; // Moderate - Yellow-Green
    if (temp <= 85) return 'from-orange-400 to-yellow-400'; // Warm - Orange
    return 'from-red-500 to-pink-500'; // Hot - Red
  };

  // Simplified weather icon components
  const WeatherIcon = ({ type, size = 'w-8 h-8' }) => {
    const iconClasses = `${size} text-gray-600`;
    
    switch (type) {
      case 'sunny':
        return <i className={`fas fa-sun ${iconClasses} text-yellow-500`}></i>;
      case 'cloudy':
        return <i className={`fas fa-cloud ${iconClasses} text-gray-500`}></i>;
      case 'rainy':
        return <i className={`fas fa-cloud-rain ${iconClasses} text-blue-500`}></i>;
      case 'windy':
        return <i className={`fas fa-wind ${iconClasses} text-green-500`}></i>;
      case 'cold':
        return <i className={`fas fa-snowflake ${iconClasses} text-cyan-500`}></i>;
      default:
        return <i className={`fas fa-cloud-sun ${iconClasses}`}></i>;
    }
  };

  // Simple thermometer component
  const Thermometer = ({ temperature, label }) => {
    const tempPercentage = Math.max(0, Math.min(100, ((temperature + 20) / 120) * 100));
    const tempColor = getTempColor(temperature);
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="relative w-4 h-20 bg-gray-200 rounded-full border overflow-hidden">
          <div 
            className={`absolute bottom-0 w-full bg-gradient-to-t ${tempColor} transition-all duration-500 rounded-full`}
            style={{ height: `${tempPercentage}%` }}
          ></div>
        </div>
        <span className="text-lg font-bold text-gray-700">
          {temperature}°F
        </span>
      </div>
    );
  };

  useEffect(() => {
    if (team1?.school && team2?.school) {
      loadWeatherComparison();
    }
  }, [team1, team2, selectedYears]);

  const loadWeatherComparison = async () => {
    if (!team1?.school || !team2?.school) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🌤️ Loading weather comparison for ${team1.school} vs ${team2.school}...`);
      const comparison = await weatherService.compareTeamWeatherProfiles(team1.school, team2.school, selectedYears);
      setWeatherComparison(comparison);
    } catch (err) {
      console.error('Weather comparison error:', err);
      setError('Failed to load weather comparison data. College Football Data API weather endpoint may require premium access.');
    } finally {
      setLoading(false);
    }
  };

  const renderWeatherStatsCard = (team, profile) => {
    const teamColors = getTeamColors(team);
    
    if (!profile) {
      return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto flex items-center justify-center">
                {team?.logos?.[0] ? (
                  <img src={team.logos[0]} alt={team.school} className="w-full h-full object-contain drop-shadow-sm" />
                ) : (
                  <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl"
                       style={{ backgroundColor: teamColors.solid }}>
                    {team?.school?.[0]}
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4" 
                style={{ color: teamColors.solid }}>
              {team?.school}
            </h3>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl mb-2"></i>
              <p className="text-gray-700 font-medium">No weather data available</p>
              <p className="text-sm text-gray-500 mt-2">Weather data requires premium College Football Data API access</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        {/* Team Header */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              {team?.logos?.[0] ? (
                <img src={team.logos[0]} alt={team.school} className="w-full h-full object-contain drop-shadow-sm" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl"
                     style={{ background: modernRedGradient }}>
                  {team?.school?.[0]}
                </div>
              )}
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4" 
              style={{ color: teamColors.solid }}>
            {team?.school}
          </h3>
          <div className="flex items-center justify-center space-x-6">
            <Thermometer 
              temperature={profile.temperature.avg} 
              label="Avg Temp" 
            />
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">{profile.totalGames}</div>
              <div className="text-sm text-gray-600">Total Games</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Home Games */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <WeatherIcon type="sunny" size="w-6 h-6" />
              <span className="text-xl font-bold text-gray-800">{profile.percentages.homeGames}%</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">Home Games</div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  background: `linear-gradient(to right, ${teamColors.solid}, ${teamColors.solid}dd)`,
                  width: `${profile.percentages.homeGames}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Cold Weather */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <WeatherIcon type="cold" size="w-6 h-6" />
              <span className="text-xl font-bold text-cyan-600">{profile.percentages.coldWeather}%</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">Cold Weather</div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                style={{ width: `${profile.percentages.coldWeather}%` }}
              ></div>
            </div>
          </div>

          {/* Warm Weather */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <WeatherIcon type="sunny" size="w-6 h-6" />
              <span className="text-xl font-bold text-orange-600">{profile.percentages.warmWeather}%</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">Warm Weather</div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                style={{ width: `${profile.percentages.warmWeather}%` }}
              ></div>
            </div>
          </div>

          {/* Windy Games */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <WeatherIcon type="windy" size="w-6 h-6" />
              <span className="text-xl font-bold text-green-600">{profile.percentages.windy}%</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">Windy Games</div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${profile.percentages.windy}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Temperature Range */}
        <div className={`p-4 rounded-lg ${teamColors.secondary} border ${teamColors.accent}`}>
          <h4 className="font-bold mb-4 text-gray-800 flex items-center">
            <i className="fas fa-thermometer-half mr-2 text-blue-500"></i>
            Temperature Analysis
          </h4>
          <div className="flex items-center justify-between">
            <Thermometer 
              temperature={profile.temperature.min} 
              label="Min" 
            />
            <div className="flex-1 mx-4">
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 rounded-full"></div>
                <div className="absolute top-1/2 transform -translate-y-1/2 w-2 h-4 bg-gray-800 rounded-full"
                     style={{ left: `${((profile.temperature.avg - profile.temperature.min) / (profile.temperature.max - profile.temperature.min)) * 100}%` }}>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-600">Range: {profile.temperature.range}°F</span>
              </div>
            </div>
            <Thermometer 
              temperature={profile.temperature.max} 
              label="Max" 
            />
          </div>
        </div>
      </div>
    );
  };

  const renderAdvantageAnalysis = (advantages) => {
    const team1Colors = getTeamColors(team1);
    const team2Colors = getTeamColors(team2);

    const AdvantageBar = ({ title, team1Value, team2Value, advantage, icon, weatherType }) => {
      const team1Width = Math.max(5, (team1Value / Math.max(team1Value, team2Value, 1)) * 100);
      const team2Width = Math.max(5, (team2Value / Math.max(team1Value, team2Value, 1)) * 100);
      const advantageToTeam1 = parseFloat(advantage) > 0;

      return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <WeatherIcon type={weatherType} size="w-8 h-8" />
              <div>
                <h4 className="text-lg font-bold text-gray-800">{title}</h4>
                <span className="text-sm text-gray-600">Experience Comparison</span>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 text-white">
              {Math.abs(parseFloat(advantage))}% advantage
            </div>
          </div>

          {/* Team Comparison */}
          <div className="space-y-4">
            {/* Team 1 */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 flex items-center justify-center">
                {team1?.logos?.[0] ? (
                  <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain drop-shadow-sm" />
                ) : (
                  <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-sm"
                       style={{ backgroundColor: team1Colors.solid }}>
                    {team1?.school?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{team1?.school}</span>
                  <span className="text-lg font-bold text-gray-800">{team1Value}%</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      background: `linear-gradient(to right, ${team1Colors.solid}, ${team1Colors.solid}dd)`,
                      width: `${team1Width}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* VS Indicator */}
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-full p-2 border">
                <span className="text-gray-600 font-bold text-sm">VS</span>
              </div>
            </div>

            {/* Team 2 */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 flex items-center justify-center">
                {team2?.logos?.[0] ? (
                  <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain drop-shadow-sm" />
                ) : (
                  <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-sm"
                       style={{ backgroundColor: team2Colors.solid }}>
                    {team2?.school?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{team2?.school}</span>
                  <span className="text-lg font-bold text-gray-800">{team2Value}%</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      background: `linear-gradient(to right, ${team2Colors.solid}, ${team2Colors.solid}dd)`,
                      width: `${team2Width}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Winner */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-white"
                 style={{ 
                   background: advantageToTeam1 
                     ? `linear-gradient(to right, ${team1Colors.solid}, ${team1Colors.solid}dd)`
                     : `linear-gradient(to right, ${team2Colors.solid}, ${team2Colors.solid}dd)`
                 }}>
              <i className="fas fa-trophy text-yellow-300"></i>
              <span className="font-bold">
                {advantageToTeam1 ? team1?.school : team2?.school} Advantage
              </span>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 space-x-4">
            <WeatherIcon type="sunny" size="w-10 h-10" />
            <WeatherIcon type="cloudy" size="w-10 h-10" />
            <WeatherIcon type="rainy" size="w-10 h-10" />
            <WeatherIcon type="windy" size="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold mb-2 text-gray-800">
            Weather Analysis
          </h3>
          <p className="text-gray-600">Head-to-head weather experience comparison</p>
        </div>

        {/* Advantage Comparisons */}
        <div className="space-y-6">
          <AdvantageBar
            title="Cold Weather Experience"
            team1Value={advantages.coldWeather.team1}
            team2Value={advantages.coldWeather.team2}
            advantage={advantages.coldWeather.advantage}
            icon="fas fa-snowflake"
            weatherType="cold"
          />

          <AdvantageBar
            title="Warm Weather Experience"
            team1Value={advantages.warmWeather.team1}
            team2Value={advantages.warmWeather.team2}
            advantage={advantages.warmWeather.advantage}
            icon="fas fa-sun"
            weatherType="sunny"
          />

          <AdvantageBar
            title="Home Field Weather"
            team1Value={advantages.homeWeatherAdvantage.team1}
            team2Value={advantages.homeWeatherAdvantage.team2}
            advantage={advantages.homeWeatherAdvantage.advantage}
            icon="fas fa-home"
            weatherType="sunny"
          />
        </div>
      </div>
    );
  };

  const renderGamePredictionTool = () => {
    const calculatePrediction = () => {
      if (!weatherComparison) return;
      
      const result = weatherService.calculateWeatherGameAdvantage(
        predictionConditions,
        weatherComparison.team1.profile,
        weatherComparison.team2.profile
      );
      setPrediction(result);
    };

    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-cloud-sun text-blue-600 text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-800">
            Game Weather Simulator
          </h3>
          <p className="text-gray-600">Adjust conditions to predict weather advantages</p>
        </div>

        {/* Simple Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <i className="fas fa-thermometer-half mr-2 text-blue-500"></i>
              Temperature: {predictionConditions.temperature}°F
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={predictionConditions.temperature}
              onChange={(e) => {
                const newTemp = parseInt(e.target.value);
                setPredictionConditions({...predictionConditions, temperature: newTemp});
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <i className="fas fa-wind mr-2 text-green-500"></i>
              Wind Speed: {predictionConditions.windSpeed} mph
            </label>
            <input
              type="range"
              min={0}
              max={40}
              value={predictionConditions.windSpeed}
              onChange={(e) => {
                const newWind = parseInt(e.target.value);
                setPredictionConditions({...predictionConditions, windSpeed: newWind});
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

        </div>

        {/* Calculate Button */}
        <div className="text-center mb-6">
          <button 
            onClick={calculatePrediction}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-calculator mr-2"></i>
            Calculate Weather Advantage
          </button>
        </div>

        {/* Results */}
        {prediction && (
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Weather Analysis Results</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="font-medium text-gray-700 mb-2">{weatherComparison.team1.name}</div>
                <div className="text-2xl font-bold text-gray-800">{prediction.team1Advantage.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Advantage Score</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="font-medium text-gray-700 mb-2">{weatherComparison.team2.name}</div>
                <div className="text-2xl font-bold text-gray-800">{prediction.team2Advantage.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Advantage Score</div>
              </div>
            </div>

            {/* Winner */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
                <i className="fas fa-trophy text-yellow-600"></i>
                <span className="font-bold">
                  Weather Advantage: {prediction.netAdvantage > 0 ? weatherComparison.team1.name : weatherComparison.team2.name}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-white">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-blue-100 rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-cloud-sun text-2xl text-blue-600"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Analyzing Weather Patterns
          </h2>
          <p className="text-gray-600">
            Loading atmospheric data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-white">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-8 py-6 max-w-lg mx-auto">
            <h3 className="text-xl font-bold mb-2 text-red-800">Weather System Error</h3>
            <p className="text-red-700 mb-4">⚠️ {error}</p>
            <button 
              onClick={loadWeatherComparison}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <i className="fas fa-redo mr-2"></i>
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!team1?.school || !team2?.school) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-white">
        <div className="text-center py-20">
          <div className="flex justify-center mb-6 space-x-4">
            <WeatherIcon type="sunny" size="w-12 h-12" />
            <WeatherIcon type="cloudy" size="w-12 h-12" />
            <WeatherIcon type="rainy" size="w-12 h-12" />
            <WeatherIcon type="windy" size="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-gray-800">
            Weather Impact Analysis
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Select two teams to view weather performance insights
          </p>
          <div className="bg-gray-50 border rounded-lg p-6 max-w-sm mx-auto">
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center space-x-3">
                <i className="fas fa-thermometer-half text-blue-500"></i>
                <span>Temperature analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-wind text-green-500"></i>
                <span>Wind impact metrics</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-cloud-rain text-cyan-500"></i>
                <span>Weather experience comparison</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: modernRedGradient }}>
            <i className="fas fa-cloud-sun text-white text-2xl"></i>
          </div>
        </div>
        
        <h2 className="text-4xl font-bold mb-4" 
            style={{ 
              background: modernRedGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Weather Performance Analysis
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Weather analysis for {team1?.school} vs {team2?.school}
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          {/* Year Selector */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <label className="block text-gray-800 font-medium mb-3">
              <i className="fas fa-calendar-alt mr-2" style={{ color: '#dc2626' }}></i>
              Analysis Years
            </label>
            <div className="flex flex-wrap gap-2">
              {[2021, 2022, 2023, 2024].map(year => (
                <label key={year} className="cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedYears.includes(year)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedYears([...selectedYears, year].sort());
                      } else {
                        setSelectedYears(selectedYears.filter(y => y !== year));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    selectedYears.includes(year) 
                      ? 'text-white' 
                      : 'bg-white border hover:bg-gray-50 text-gray-700'
                  }`}
                  style={selectedYears.includes(year) ? { background: modernRedGradient } : {}}>
                    {year}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <button 
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                detailedView 
                  ? 'text-white' 
                  : 'bg-white border hover:bg-gray-50 text-gray-700'
              }`}
              style={detailedView ? { background: modernRedGradient } : {}}
              onClick={() => setDetailedView(!detailedView)}
            >
              <i className={`${detailedView ? 'fas fa-microscope' : 'fas fa-eye'} mr-2`}></i>
              {detailedView ? 'Advanced Mode' : 'Simple View'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Team Weather Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {weatherComparison && renderWeatherStatsCard(team1, weatherComparison.team1.profile)}
          {weatherComparison && renderWeatherStatsCard(team2, weatherComparison.team2.profile)}
        </div>

        {/* Weather Analysis */}
        {weatherComparison && renderAdvantageAnalysis(weatherComparison.advantages)}

        {/* Detailed Prediction Tool (simplified) */}
        {detailedView && weatherComparison && (
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                Weather Simulator
              </h3>
              <p className="text-gray-600">Adjust conditions to predict weather advantages</p>
            </div>
            <div className="text-center text-gray-500">
              <i className="fas fa-tools text-2xl mb-2"></i>
              <p>Detailed simulation tools available in advanced mode</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherTab;
