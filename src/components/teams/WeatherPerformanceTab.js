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
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Thermometer, 
  Cloud, 
  CloudRain, 
  Wind
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
  insights: [
    "Team performs best in moderate weather conditions (65% win rate)",
    "Night games show highest win rate at 65%",
    "Home field advantage is significant with 10% higher win rate",
    "Passing efficiency increases in moderate/cold weather conditions"
  ],
  processedGames: [
    { weather_category: 'Freezing', is_home: true, won: true },
    { weather_category: 'Cold', is_home: false, won: false },
    { weather_category: 'Moderate', is_home: true, won: true },
    { weather_category: 'Warm', is_home: false, won: false }
  ]
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
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const weatherColors = {
    'Freezing': '#1E88E5',
    'Cold': '#42A5F5',
    'Moderate': '#66BB6A',
    'Warm': '#FF7043'
  };
  
  const timeColors = {
    'Morning': '#FFC107',
    'Early Afternoon': '#FF9800',
    'Late Afternoon': '#F57C00',
    'Night': '#5E35B1'
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
    setInsights(MOCK_DATA.insights);
    setIsUsingMockData(true);
  };

  // Fetch team data and process
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setProgress(0);
        setDebugLog([]);
        setDebugLog(log => [...log, 'Initializing team data...']);
        const team = { school: teamId };
        setTeamData(team);
        setProgress(5);
        setDebugLog(log => [...log, 'Fetching games for last 10 years...']);
        
        // Fetch all games for last 10 years
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 10;
        let allGames = [];
        
        for (let year = startYear; year <= currentYear; year++) {
          setDebugLog(log => [...log, `Fetching regular season games for ${year}...`]);
          let regularGames = [];
          try {
            regularGames = await teamService.getTeamGames(team.school, year, 'regular');
            setDebugLog(log => [...log, `Fetched ${regularGames.length} regular games for ${year}.`]);
          } catch (err) {
            setDebugLog(log => [...log, `Error fetching regular games for ${year}: ${err.message || err}`]);
          }
          allGames = [...allGames, ...regularGames];
          setProgress(p => Math.min(p + 2, 20));
          
          setDebugLog(log => [...log, `Fetching postseason games for ${year}...`]);
          let postseasonGames = [];
          try {
            postseasonGames = await teamService.getTeamGames(team.school, year, 'postseason');
            setDebugLog(log => [...log, `Fetched ${postseasonGames.length} postseason games for ${year}.`]);
          } catch (err) {
            setDebugLog(log => [...log, `Error fetching postseason games for ${year}: ${err.message || err}`]);
          }
          allGames = [...allGames, ...postseasonGames];
          setProgress(p => Math.min(p + 2, 30));
        }
        
        // Check if we have any games
        if (allGames.length === 0) {
          throw new Error("No games found for analysis");
        }
        
        setDebugLog(log => [...log, `Fetched ${allGames.length} games.`]);
        setProgress(35);
        
        // Fetch weather data for each game
        setDebugLog(log => [...log, 'Fetching weather data for each game...']);
        const weatherData = {};
        let weatherCount = 0;
        for (const game of allGames) {
          if (game.id) {
            const weather = await teamService.getGameWeather(game.id);
            if (weather) {
              weatherData[game.id] = weather;
            }
            weatherCount++;
            if (weatherCount % 10 === 0) setProgress(p => Math.min(p + 2, 50));
          }
        }
        setDebugLog(log => [...log, `Fetched weather for ${weatherCount} games.`]);
        setProgress(55);
        
        // Fetch team stats for each game
        setDebugLog(log => [...log, 'Fetching team stats for each game...']);
        const teamStats = [];
        let statsCount = 0;
        for (const game of allGames) {
          if (game.id) {
            const stats = await teamService.getTeamStats(game.id);
            if (stats) {
              const teamStat = stats.find(stat => stat.school === team.school);
              if (teamStat) {
                teamStats.push({ 
                  game_id: game.id,
                  ...teamStat
                });
              }
            }
            statsCount++;
            if (statsCount % 10 === 0) setProgress(p => Math.min(p + 2, 70));
          }
        }
        setDebugLog(log => [...log, `Fetched stats for ${statsCount} games.`]);
        setProgress(75);
        
        // Process the data
        setDebugLog(log => [...log, 'Processing games data...']);
        const processed = processGamesData(allGames, weatherData, teamStats, team.school);
        
        if (!processed || processed.length === 0) {
          throw new Error("Unable to process game data");
        }
        
        setProcessedGames(processed);
        setProgress(80);
        
        // Analyze the data
        setDebugLog(log => [...log, 'Analyzing weather performance...']);
        const weatherAnalysis = analyzeWeatherPerformance(processed);
        setWeatherPerformance(weatherAnalysis);
        setProgress(82);
        
        setDebugLog(log => [...log, 'Analyzing time performance...']);
        const timeAnalysis = analyzeTimePerformance(processed);
        setTimePerformance(timeAnalysis);
        setProgress(84);
        
        setDebugLog(log => [...log, 'Analyzing offensive strategy...']);
        const strategyAnalysis = analyzeWeatherStrategy(processed);
        setWeatherStrategy(strategyAnalysis);
        setProgress(86);
        
        setDebugLog(log => [...log, 'Analyzing home/away performance...']);
        const locationAnalysis = analyzeHomeAwayPerformance(processed);
        setHomeAwayPerformance(locationAnalysis);
        setProgress(88);
        
        setDebugLog(log => [...log, 'Analyzing day of week performance...']);
        const dayAnalysis = analyzeDayOfWeekPerformance(processed);
        setDayOfWeekPerformance(dayAnalysis);
        setProgress(90);
        
        setDebugLog(log => [...log, 'Creating weather/time heatmap data...']);
        const heatmap = createWeatherTimeHeatmapData(processed);
        setHeatmapData(heatmap);
        setProgress(92);
        
        setDebugLog(log => [...log, 'Analyzing extreme weather...']);
        const extremeAnalysis = analyzeExtremeWeather(processed);
        setExtremeWeather(extremeAnalysis);
        setProgress(95);
        
        setDebugLog(log => [...log, 'Generating insights...']);
        const generatedInsights = generateInsights(
          processed, 
          weatherAnalysis, 
          timeAnalysis, 
          locationAnalysis
        );
        setInsights(generatedInsights);
        setProgress(100);
        setDebugLog(log => [...log, 'Done!']);
        setIsUsingMockData(false);
        
      } catch (err) {
        console.error("Error fetching weather performance data:", err);
        setError("Failed to load weather performance data due to ongoing development. Showing prototype UI with mock data.");
        setDebugLog(log => [...log, `Error: ${err.message || err}`]);
        // Load mock data on error
        loadMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [teamId]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Loading Weather Analysis...
        </Typography>
        <Box sx={{ width: '80%', mb: 2 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Progress: {progress}%</Typography>
            <Box sx={{ width: '100%', height: 16, bgcolor: '#eee', borderRadius: 8, overflow: 'hidden' }}>
              <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: theme.palette.primary.main, transition: 'width 0.3s' }} />
            </Box>
          </Paper>
        </Box>
        <Box sx={{ width: '80%', maxHeight: 180, overflowY: 'auto', mt: 2 }}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Debug Log:</Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {debugLog.map((msg, idx) => (
                <li key={idx} style={{ fontSize: '0.95rem', color: '#333', marginBottom: 2 }}>{msg}</li>
              ))}
            </ul>
          </Paper>
        </Box>
      </Box>
    );
  }

  // Main render
  return (
    <Box sx={{ py: 3 }}>
      {/* Show error message if using mock data */}
      {(error || isUsingMockData) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error || "Failed to load real data due to ongoing development. Showing prototype UI with mock data."}
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
        {teamData?.school} Weather Performance Analysis
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Thermometer size={24} color={theme.palette.error.main} />
          <Typography variant="h6">Weather Impact Analysis</Typography>
        </Stack>
        <Typography variant="body1" paragraph>
          Analyzing how {teamData?.school} performs under different weather conditions based on {processedGames.length} games over the past 10 years.
          {isUsingMockData && <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}> (Mock Data)</Typography>}
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {insights.map((insight, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={2} sx={{ height: '100%', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <CardContent>
                  <Typography variant="body1">{insight}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            mb: 3,
            '& .MuiTab-root': { 
              textTransform: 'none', 
              fontSize: '1rem',
              fontWeight: 500 
            }
          }}
        >
          <Tab label="Weather Conditions" />
          <Tab label="Time of Day" />
          <Tab label="Offensive Strategy" />
          <Tab label="Home vs Away" />
          <Tab label="Extreme Weather" />
        </Tabs>
        
        {/* Weather Conditions Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Win Rate by Weather Condition</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={formatChartData(weatherPerformance)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                      <Bar dataKey="winRate" name="Win Rate">
                        {formatChartData(weatherPerformance).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={weatherColors[entry.category] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Games Distribution by Weather</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={formatChartData(weatherPerformance)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="gamesPlayed"
                        nameKey="category"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {formatChartData(weatherPerformance).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={weatherColors[entry.category] || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Performance Metrics by Weather</Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Weather</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Win Rate</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Points For</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Points Against</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Point Diff</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Total Yards</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Pass Yards</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Rush Yards</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Turnovers</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Games</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(weatherPerformance).map((category, index) => {
                          const data = weatherPerformance[category];
                          return (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                              <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {category === 'Freezing' && <Thermometer size={20} style={{ marginRight: '8px', color: '#1E88E5' }} />}
                                  {category === 'Cold' && <Thermometer size={20} style={{ marginRight: '8px', color: '#42A5F5' }} />}
                                  {category === 'Moderate' && <Cloud size={20} style={{ marginRight: '8px', color: '#66BB6A' }} />}
                                  {category === 'Warm' && <Thermometer size={20} style={{ marginRight: '8px', color: '#FF7043' }} />}
                                  {category}
                                </Box>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{(data.win_rate * 100).toFixed(1)}%</td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{data.avg_points_for.toFixed(1)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{data.avg_points_against.toFixed(1)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{data.avg_point_diff.toFixed(1)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{data.avg_total_yards.toFixed(1)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{data.avg_pass_yards.toFixed(1)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{data.avg_rush_yards.toFixed(1)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{data.avg_turnovers.toFixed(1)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{data.games_played}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Time of Day Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Win Rate by Time of Day</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={formatChartData(timePerformance)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                      <Bar dataKey="winRate" name="Win Rate">
                        {formatChartData(timePerformance).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={timeColors[entry.category] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Scoring by Time of Day</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={formatChartData(timePerformance)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pointsFor" name="Points For" fill="#4CAF50" />
                      <Bar dataKey="pointsAgainst" name="Points Against" fill="#F44336" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Point Differential by Time</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={formatChartData(timePerformance)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="pointDiff" name="Point Differential">
                        {formatChartData(timePerformance).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={timeColors[entry.category] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Games Distribution by Time</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={formatChartData(timePerformance)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="gamesPlayed"
                        nameKey="category"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {formatChartData(timePerformance).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={timeColors[entry.category] || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Offensive Strategy Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Pass/Run Ratio by Weather</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.keys(weatherStrategy).map(category => ({
                        category,
                        passRatio: weatherStrategy[category].pass_ratio,
                        rushRatio: 1 - weatherStrategy[category].pass_ratio
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      stackOffset="expand"
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <YAxis type="category" dataKey="category" />
                      <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                      <Legend />
                      <Bar dataKey="passRatio" name="Pass" stackId="a" fill="#2196F3" />
                      <Bar dataKey="rushRatio" name="Rush" stackId="a" fill="#FF9800" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Turnovers by Weather</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.keys(weatherStrategy).map(category => ({
                        category,
                        turnovers: weatherStrategy[category].avg_turnovers
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="turnovers" name="Turnovers">
                        {Object.keys(weatherStrategy).map((category, index) => (
                          <Cell key={`cell-${index}`} fill={weatherColors[category] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Offensive Strategy by Weather</Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart outerRadius={150} width={730} height={400} data={
                      Object.keys(weatherStrategy).map(category => ({
                        category,
                        passingYards: weatherStrategy[category].avg_passing_yards,
                        rushingYards: weatherStrategy[category].avg_rushing_yards,
                        turnovers: weatherStrategy[category].avg_turnovers * 50, // Scale for visibility
                      }))
                    }>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                      <Radar name="Passing Yards" dataKey="passingYards" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Rushing Yards" dataKey="rushingYards" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Radar name="Turnovers (x50)" dataKey="turnovers" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Home vs Away Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Win Rate: Home vs Away</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { location: 'Home', winRate: homeAwayPerformance.home.win_rate },
                        { location: 'Away', winRate: homeAwayPerformance.away.win_rate }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                      <Bar dataKey="winRate" name="Win Rate">
                        <Cell fill="#4CAF50" />
                        <Cell fill="#2196F3" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Scoring: Home vs Away</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { 
                          location: 'Home', 
                          pointsFor: homeAwayPerformance.home.avg_points_for,
                          pointsAgainst: homeAwayPerformance.home.avg_points_against
                        },
                        { 
                          location: 'Away', 
                          pointsFor: homeAwayPerformance.away.avg_points_for,
                          pointsAgainst: homeAwayPerformance.away.avg_points_against
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pointsFor" name="Points For" fill="#4CAF50" />
                      <Bar dataKey="pointsAgainst" name="Points Against" fill="#F44336" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Home vs Away Performance in Different Weather
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {Object.keys(weatherPerformance).map((weather, index) => {
                      // Calculate home/away performance in this weather
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
                        <Grid item xs={12} sm={6} md={3} key={index}>
                          <Card 
                            elevation={1} 
                            sx={{ 
                              p: 2, 
                              borderTop: `4px solid ${weatherColors[weather] || COLORS[index % COLORS.length]}` 
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {weather} Weather
                            </Typography>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2">Home Win Rate:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {homeGamesInWeather.length > 0 ? `${(homeWinRate * 100).toFixed(1)}%` : 'N/A'}
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                  ({homeGamesInWeather.length} games)
                                </Typography>
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Away Win Rate:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {awayGamesInWeather.length > 0 ? `${(awayWinRate * 100).toFixed(1)}%` : 'N/A'}
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                  ({awayGamesInWeather.length} games)
                                </Typography>
                              </Typography>
                            </Stack>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Extreme Weather Tab */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            {/* Extreme Cold */}
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Thermometer size={24} color="#1E88E5" style={{ marginRight: 8 }} />
                    <Typography variant="h6">Extreme Cold</Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Games below 32°F: <b>{safe(extremeWeather, ['extremeCold', 'count'], 0)}</b>
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Win Rate: <b>{(safe(extremeWeather, ['extremeCold', 'winRate'], 0) * 100).toFixed(1)}%</b>
                  </Typography>
                  <Typography variant="body2">
                    Avg Score: <b>{safe(extremeWeather, ['extremeCold', 'avgScore'], 0).toFixed(1)} - {safe(extremeWeather, ['extremeCold', 'avgOpponentScore'], 0).toFixed(1)}</b>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Extreme Heat */}
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Thermometer size={24} color="#FF5722" style={{ marginRight: 8 }} />
                    <Typography variant="h6">Extreme Heat</Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Games above 85°F: <b>{safe(extremeWeather, ['extremeHot', 'count'], 0)}</b>
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Win Rate: <b>{(safe(extremeWeather, ['extremeHot', 'winRate'], 0) * 100).toFixed(1)}%</b>
                  </Typography>
                  <Typography variant="body2">
                    Avg Score: <b>{safe(extremeWeather, ['extremeHot', 'avgScore'], 0).toFixed(1)} - {safe(extremeWeather, ['extremeHot', 'avgOpponentScore'], 0).toFixed(1)}</b>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* High Wind */}
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Wind size={24} color="#5E35B1" style={{ marginRight: 8 }} />
                    <Typography variant="h6">High Wind</Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Games with 20+ mph wind: <b>{safe(extremeWeather, ['highWind', 'count'], 0)}</b>
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Win Rate: <b>{(safe(extremeWeather, ['highWind', 'winRate'], 0) * 100).toFixed(1)}%</b>
                  </Typography>
                  <Typography variant="body2">
                    Avg Score: <b>{safe(extremeWeather, ['highWind', 'avgScore'], 0).toFixed(1)} - {safe(extremeWeather, ['highWind', 'avgOpponentScore'], 0).toFixed(1)}</b>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Precipitation */}
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CloudRain size={24} color="#1976D2" style={{ marginRight: 8 }} />
                    <Typography variant="h6">Precipitation</Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Games with precipitation: <b>{safe(extremeWeather, ['precipitation', 'count'], 0)}</b>
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Win Rate: <b>{(safe(extremeWeather, ['precipitation', 'winRate'], 0) * 100).toFixed(1)}%</b>
                  </Typography>
                  <Typography variant="body2">
                    Avg Score: <b>{safe(extremeWeather, ['precipitation', 'avgScore'], 0).toFixed(1)} - {safe(extremeWeather, ['precipitation', 'avgOpponentScore'], 0).toFixed(1)}</b>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Comparison Chart */}
            <Grid item xs={12}>
              <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Extreme Weather Comparison</Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={[
                        { 
                          condition: 'Extreme Cold (<32°F)', 
                          winRate: safe(extremeWeather, ['extremeCold', 'winRate'], 0),
                          gamesPlayed: safe(extremeWeather, ['extremeCold', 'count'], 0)
                        },
                        { 
                          condition: 'Extreme Heat (>85°F)', 
                          winRate: safe(extremeWeather, ['extremeHot', 'winRate'], 0),
                          gamesPlayed: safe(extremeWeather, ['extremeHot', 'count'], 0)
                        },
                        { 
                          condition: 'High Wind (>20mph)', 
                          winRate: safe(extremeWeather, ['highWind', 'winRate'], 0),
                          gamesPlayed: safe(extremeWeather, ['highWind', 'count'], 0)
                        },
                        { 
                          condition: 'Precipitation', 
                          winRate: safe(extremeWeather, ['precipitation', 'winRate'], 0),
                          gamesPlayed: safe(extremeWeather, ['precipitation', 'count'], 0)
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="condition" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => name === 'winRate' ? `${(value * 100).toFixed(1)}%` : value} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="winRate" name="Win Rate" fill="#FF5722" />
                      <Bar yAxisId="right" dataKey="gamesPlayed" name="Games Played" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
      
      <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Key Weather Performance Takeaways</Typography>
        <Typography variant="body1" paragraph>
          This analysis shows how {teamData?.school}'s performance varies under different weather conditions and times of day. The data covers {processedGames.length} games over the past 10 years, providing insights into optimal playing conditions and potential areas for improvement.
          {isUsingMockData && <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}> (Based on Mock Data)</Typography>}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {Object.keys(weatherPerformance).length > 0 && (
            <Grid item xs={12} sm={6} md={4}>
              <Chip 
                icon={<Thermometer size={18} />}
                label={`Best Weather: ${Object.keys(weatherPerformance).reduce((a, b) => 
                  weatherPerformance[a].win_rate > weatherPerformance[b].win_rate ? a : b)}`}
                color="primary"
                sx={{ mb: 1, mr: 1 }}
              />
            </Grid>
          )}
          {Object.keys(timePerformance).length > 0 && (
            <Grid item xs={12} sm={6} md={4}>
              <Chip 
                label={`Best Time: ${Object.keys(timePerformance).reduce((a, b) => 
                  timePerformance[a].win_rate > timePerformance[b].win_rate ? a : b)} games`}
                color="secondary"
                sx={{ mb: 1, mr: 1 }}
              />
            </Grid>
          )}
          {homeAwayPerformance.home && homeAwayPerformance.away && (
            <Grid item xs={12} sm={6} md={4}>
              <Chip 
                label={`Home vs Away: ${(homeAwayPerformance.home.win_rate * 100).toFixed(1)}% vs ${(homeAwayPerformance.away.win_rate * 100).toFixed(1)}%`}
                color="success"
                sx={{ mb: 1, mr: 1 }}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default WeatherPerformanceTab;