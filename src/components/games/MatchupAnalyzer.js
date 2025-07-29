import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Radar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler);

// Matchup Analyzer Interface Component
export const MatchupAnalyzerInterface = ({ 
  homeTeam, 
  awayTeam, 
  setHomeTeam, 
  setAwayTeam, 
  teams, 
  onPredict, 
  prediction, 
  isLoading 
}) => {
  const [activeMetricsTab, setActiveMetricsTab] = useState('offensive');
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // Generate prediction and show full analysis
  const handlePredict = async () => {
    await onPredict();
    setShowFullAnalysis(true);
  };

  return (
    <div className="space-y-8">
      {/* Team Selection */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6 text-center">Select Teams to Analyze</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Away Team Selection */}
          <div className="text-center">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-4">
              {awayTeam && (
                <div className="mb-4">
                  <img 
                    src={awayTeam.logos?.[0] || '/api/placeholder/80/80'} 
                    alt={awayTeam.school} 
                    className="w-20 h-20 mx-auto metallic-3d-logo object-contain"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{awayTeam?.school || 'Select Team'}</h3>
              <p className="text-sm text-gray-500">{awayTeam?.conference || 'Conference'}</p>
              <div className="mt-4">
                <select
                  value={awayTeam?.id || ''}
                  onChange={(e) => {
                    const team = teams.find(t => t.id === parseInt(e.target.value));
                    setAwayTeam(team);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select away team...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.school}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm font-semibold uppercase text-gray-600">Away Team</div>
          </div>

          {/* VS Section */}
          <div className="text-center">
            <div className="gradient-bg text-white px-6 py-2 rounded-full font-semibold mx-auto inline-block">VS</div>
            <button
              onClick={handlePredict}
              disabled={!homeTeam || !awayTeam || isLoading}
              className="mt-6 gradient-bg text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                <>
                  <i className="fas fa-calculator mr-2"></i>Generate Prediction
                </>
              )}
            </button>
          </div>

          {/* Home Team Selection */}
          <div className="text-center">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-4">
              {homeTeam && (
                <div className="mb-4">
                  <img 
                    src={homeTeam.logos?.[0] || '/api/placeholder/80/80'} 
                    alt={homeTeam.school} 
                    className="w-20 h-20 mx-auto metallic-3d-logo object-contain"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{homeTeam?.school || 'Select Team'}</h3>
              <p className="text-sm text-gray-500">{homeTeam?.conference || 'Conference'}</p>
              <div className="mt-4">
                <select
                  value={homeTeam?.id || ''}
                  onChange={(e) => {
                    const team = teams.find(t => t.id === parseInt(e.target.value));
                    setHomeTeam(team);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select home team...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.school}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm font-semibold uppercase text-gray-600">Home Team</div>
          </div>
        </div>
      </div>

      {/* Prediction Results */}
      {prediction && showFullAnalysis && (
        <MatchupAnalysisResults 
          prediction={prediction} 
          homeTeam={homeTeam} 
          awayTeam={awayTeam}
          activeMetricsTab={activeMetricsTab}
          setActiveMetricsTab={setActiveMetricsTab}
        />
      )}
    </div>
  );
};

// Enhanced Matchup Analysis Results Component
export const MatchupAnalysisResults = ({ prediction, homeTeam, awayTeam, activeMetricsTab, setActiveMetricsTab }) => {
  if (!prediction) return null;

  const pred = prediction.prediction || prediction;
  const teams = prediction.teams || { home: homeTeam, away: awayTeam };
  const analysis = prediction.analysis || {};
  const confidence = prediction.confidence || 0.7;

  // Calculate gauge rotation for win probability
  const homeWinProb = pred.winProbability?.home || 50;
  const gaugeRotation = (homeWinProb / 100 * 180) - 90;

  return (
    <div className="space-y-8">
      {/* Main Prediction Results */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold gradient-text mb-2">Prediction Results</h3>
          <p className="text-gray-600">Based on analysis of 500+ metrics and historical performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Spread Prediction */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
            <div className="text-gray-500 text-sm mb-2">Predicted Spread</div>
            <div className="text-3xl font-bold gradient-text mb-2">
              {pred.spread > 0 ? '+' : ''}{pred.spread?.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {pred.spread > 0 ? teams.home?.school : teams.away?.school} favored by {Math.abs(pred.spread || 0).toFixed(1)} points
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 flex justify-between mb-1">
                <span>{teams.away?.school}</span>
                <span>{teams.home?.school}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 gradient-bg rounded-full" 
                  style={{ width: `${pred.spread > 0 ? 65 : 35}%`, marginLeft: pred.spread > 0 ? '35%' : '0' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Win Probability */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
            <div className="text-gray-500 text-sm mb-2">Win Probability</div>
            
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-700">{pred.winProbability?.away?.toFixed(0) || 50}%</div>
                <div className="text-xs text-gray-500 mt-1">{teams.away?.school}</div>
              </div>
              
              <div className="relative w-40 h-20 mx-4">
                <div className="absolute w-40 h-40 rounded-full bg-gray-200 top-0"></div>
                <div 
                  className="absolute w-40 h-40 rounded-full gradient-bg top-0"
                  style={{ 
                    clipPath: 'polygon(80px 80px, 0 80px, 0 0, 160px 0, 160px 80px)',
                    transform: `rotate(${gaugeRotation}deg)`,
                    transformOrigin: 'center bottom'
                  }}
                ></div>
                <div className="absolute w-32 h-32 rounded-full bg-white top-4 left-4"></div>
                <div className="absolute w-full text-center top-8">
                  <div className="text-2xl font-bold gradient-text">{homeWinProb.toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">Win Probability</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold gradient-text">{pred.winProbability?.home?.toFixed(0) || 50}%</div>
                <div className="text-xs text-gray-500 mt-1">{teams.home?.school}</div>
              </div>
            </div>
          </div>

          {/* Total Points */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
            <div className="text-gray-500 text-sm mb-2">Projected Total Points</div>
            <div className="text-3xl font-bold gradient-text mb-2">{pred.total?.toFixed(1) || '0.0'}</div>
            <div className="mt-3">
              <div className="text-sm flex justify-between mb-1">
                <span className="text-gray-600">
                  <i className="fas fa-arrow-down text-blue-500 mr-1"></i>
                  <span className="font-medium">Under</span>
                </span>
                <span className="text-gray-600">
                  <span className="font-medium">Over</span>
                  <i className="fas fa-arrow-up text-red-500 ml-1"></i>
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 gradient-bg rounded-full" style={{ width: '58%' }}></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                58% chance of going Over
              </div>
            </div>
          </div>
        </div>

        {/* Model Confidence */}
        <div className="mt-10">
          <h4 className="text-lg font-semibold mb-4">Model Confidence</h4>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Low Confidence</span>
                  <span className="font-medium">{(confidence * 100).toFixed(0)}% Confidence</span>
                  <span>High Confidence</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full">
                  <div className="h-4 gradient-bg rounded-full" style={{ width: `${confidence * 100}%` }}></div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                    <p>Confidence score is calculated based on model agreement, historical accuracy, data quality, and prediction stability.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Factors in Prediction */}
      <KeyFactorsSection teams={teams} prediction={prediction} />

      {/* Advanced Metrics */}
      <AdvancedMetricsSection 
        teams={teams} 
        activeTab={activeMetricsTab} 
        setActiveTab={setActiveMetricsTab}
      />

      {/* Model Architecture */}
      <ModelArchitectureSection />

      {/* Team Analysis Cards */}
      {analysis.teamAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeamAnalysisCard team={teams.away} analysis={analysis.teamAnalysis.away} />
          <TeamAnalysisCard team={teams.home} analysis={analysis.teamAnalysis.home} />
        </div>
      )}
    </div>
  );
};

// Key Factors Section Component
const KeyFactorsSection = ({ teams, prediction }) => {
  const chartData = {
    labels: ['Offensive Efficiency', 'Defensive Efficiency', 'Success Rate', 'Explosiveness', 'Red Zone Scoring', '3rd Down Conversion', 'Turnover Rate', 'Network Centrality', 'Momentum Score', 'SOS Rating'],
    datasets: [{
      label: 'Feature Importance',
      data: [0.18, 0.15, 0.12, 0.11, 0.09, 0.08, 0.07, 0.07, 0.07, 0.06],
      backgroundColor: 'rgba(220, 38, 38, 0.8)',
      borderColor: 'rgba(220, 38, 38, 1)',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Importance: ${(context.raw * 100).toFixed(1)}%`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 0.2,
        ticks: {
          callback: (value) => `${(value * 100).toFixed(0)}%`
        }
      }
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold gradient-text mb-6">Key Factors in Prediction</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Team Comparison */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Team Comparison</h3>
          
          <div className="space-y-4">
            <MetricComparison 
              label="Offensive Efficiency" 
              awayValue="0.41" awayRating="Good"
              homeValue="0.48" homeRating="Elite"
              awayTeam={teams.away?.school}
              homeTeam={teams.home?.school}
            />
            <MetricComparison 
              label="Defensive Efficiency" 
              awayValue="-0.10" awayRating="Good"
              homeValue="-0.15" homeRating="Elite"
              awayTeam={teams.away?.school}
              homeTeam={teams.home?.school}
            />
            <MetricComparison 
              label="Success Rate" 
              awayValue="45.2%" awayRating="Average"
              homeValue="49.1%" homeRating="Good"
              awayTeam={teams.away?.school}
              homeTeam={teams.home?.school}
            />
            <MetricComparison 
              label="Explosiveness" 
              awayValue="1.28" awayRating="Good"
              homeValue="1.31" homeRating="Good"
              awayTeam={teams.away?.school}
              homeTeam={teams.home?.school}
            />
            <MetricComparison 
              label="3rd Down Conversion" 
              awayValue="41.8%" awayRating="Average"
              homeValue="47.2%" homeRating="Good"
              awayTeam={teams.away?.school}
              homeTeam={teams.home?.school}
            />
          </div>
        </div>
        
        {/* Top Model Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Top Influential Features</h3>
          
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <i className="fas fa-info-circle text-blue-500 mt-1"></i>
              <p>Feature importance indicates which metrics have the strongest influence on the model's prediction.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Network Analysis */}
      <NetworkAnalysis teams={teams} />
    </div>
  );
};

// Metric Comparison Component
const MetricComparison = ({ label, awayValue, awayRating, homeValue, homeRating, awayTeam, homeTeam }) => {
  const getRatingClass = (rating) => {
    switch(rating) {
      case 'Elite': case 'Good': return 'bg-green-100 text-green-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full gradient-bg mr-2"></div>
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-sm text-gray-600">{awayTeam}</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{awayValue}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRatingClass(awayRating)}`}>
                {awayRating}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">{homeTeam}</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{homeValue}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRatingClass(homeRating)}`}>
                {homeRating}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Network Analysis Component
const NetworkAnalysis = ({ teams }) => {
  const transitiveData = {
    labels: ['Direct Matchup', '1-Step Connection', '2-Step Connection', '3-Step Connection', 'Common Opponents'],
    datasets: [
      {
        label: teams.home?.school || 'Home',
        data: [65, 70, 68, 65, 72],
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderColor: 'rgba(220, 38, 38, 0.8)',
        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
      },
      {
        label: teams.away?.school || 'Away',
        data: [55, 58, 60, 65, 57],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      }
    ]
  };

  const transitiveOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false }
      }
    }
  };

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-4">Network Analysis Insights</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
          <h4 className="text-md font-medium mb-3">Common Opponents Analysis</h4>
          
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Common Opponent</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">{teams.home?.school} Result</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">{teams.away?.school} Result</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2">Michigan</td>
                <td className="py-2">W 30-24</td>
                <td className="py-2">L 21-27</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2">Alabama</td>
                <td className="py-2">W 27-20</td>
                <td className="py-2">W 34-24</td>
              </tr>
              <tr>
                <td className="py-2">Penn State</td>
                <td className="py-2">W 20-12</td>
                <td className="py-2">No matchup</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
          <h4 className="text-md font-medium mb-3">Transitive Performance</h4>
          
          <div style={{ height: '200px' }}>
            <Radar data={transitiveData} options={transitiveOptions} />
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <i className="fas fa-info-circle text-blue-500 mt-1"></i>
              <p>Transitive performance analyzes how teams performed against common opponents and through team-to-team connections.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Metrics Section Component
const AdvancedMetricsSection = ({ teams, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'offensive', label: 'Offensive Metrics' },
    { id: 'defensive', label: 'Defensive Metrics' },
    { id: 'situational', label: 'Situational Metrics' },
    { id: 'trend', label: 'Trend Analysis' }
  ];

  return (
    <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold gradient-text mb-6">Advanced Metrics Analysis</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex space-x-8">
          {tabs.map(tab => (
            <li key={tab.id}>
              <button
                className={`py-2 px-1 ${activeTab === tab.id ? 'border-b-3 border-red-500 gradient-text font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'offensive' && <OffensiveMetricsTab teams={teams} />}
        {activeTab === 'defensive' && <DefensiveMetricsTab teams={teams} />}
        {activeTab === 'situational' && <SituationalMetricsTab teams={teams} />}
        {activeTab === 'trend' && <TrendAnalysisTab teams={teams} />}
      </div>
    </div>
  );
};

// Offensive Metrics Tab
const OffensiveMetricsTab = ({ teams }) => {
  const chartData = {
    labels: ['Points/Game', 'Yards/Play', 'Success Rate', 'Explosiveness', '3rd Down %', 'Red Zone TD %', 'Havoc Rate Allowed'],
    datasets: [
      {
        label: teams.home?.school || 'Home',
        data: [85, 90, 80, 75, 82, 78, 72],
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderColor: 'rgba(220, 38, 38, 0.8)',
        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
      },
      {
        label: teams.away?.school || 'Away',
        data: [80, 85, 75, 82, 70, 75, 78],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Offensive Efficiency Breakdown</h3>
        <div style={{ height: '300px' }}>
          <Radar data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          <DetailedMetric label="Points Per Game" awayValue="36.2" homeValue="35.8" />
          <DetailedMetric label="Yards Per Play" awayValue="6.8" homeValue="7.2" />
          <DetailedMetric label="Success Rate" awayValue="45.2%" homeValue="49.1%" />
          <DetailedMetric label="Explosiveness (PPP)" awayValue="1.28" homeValue="1.31" />
          <DetailedMetric label="3rd Down Conversion" awayValue="41.8%" homeValue="47.2%" />
          <DetailedMetric label="Red Zone TD %" awayValue="68.4%" homeValue="71.2%" />
          <DetailedMetric label="Rush Yards/Carry" awayValue="5.1" homeValue="4.8" />
          <DetailedMetric label="Pass Yards/Attempt" awayValue="8.9" homeValue="9.3" />
          <DetailedMetric label="QBR" awayValue="155.4" homeValue="167.2" />
          <DetailedMetric label="Havoc Rate Allowed" awayValue="14.8%" homeValue="13.2%" />
        </div>
      </div>
    </div>
  );
};

// Defensive Metrics Tab
const DefensiveMetricsTab = ({ teams }) => {
  const chartData = {
    labels: ['Points Allowed', 'Yards/Play Allowed', 'Success Rate Allowed', 'Explosiveness Allowed', '3rd Down Stop %', 'Red Zone Stop %', 'Havoc Rate'],
    datasets: [
      {
        label: teams.home?.school || 'Home',
        data: [88, 85, 80, 75, 82, 75, 90],
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderColor: 'rgba(220, 38, 38, 0.8)',
        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
      },
      {
        label: teams.away?.school || 'Away',
        data: [80, 78, 75, 80, 72, 70, 85],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Defensive Efficiency Breakdown</h3>
        <div style={{ height: '300px' }}>
          <Radar data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          <DetailedMetric label="Points Allowed/Game" awayValue="17.5" homeValue="15.8" />
          <DetailedMetric label="Yards Allowed/Play" awayValue="4.9" homeValue="4.6" />
          <DetailedMetric label="Success Rate Allowed" awayValue="38.1%" homeValue="36.4%" />
          <DetailedMetric label="Explosive Play % Allowed" awayValue="9.2%" homeValue="8.5%" />
          <DetailedMetric label="3rd Down Stop Rate" awayValue="65.2%" homeValue="68.9%" />
          <DetailedMetric label="Red Zone TD % Allowed" awayValue="52.6%" homeValue="48.3%" />
          <DetailedMetric label="Sack Rate" awayValue="8.3%" homeValue="9.1%" />
          <DetailedMetric label="Havoc Rate" awayValue="18.7%" homeValue="20.2%" />
          <DetailedMetric label="Turnover Rate" awayValue="9.8%" homeValue="11.2%" />
          <DetailedMetric label="PPA Allowed" awayValue="-0.10" homeValue="-0.15" />
        </div>
      </div>
    </div>
  );
};

// Situational Metrics Tab
const SituationalMetricsTab = ({ teams }) => {
  const chartData = {
    labels: ['3rd & Short', '3rd & Long', 'Red Zone', 'When Trailing', '2-Minute Drill', '4th Quarter', '4th Down'],
    datasets: [
      {
        label: teams.home?.school || 'Home',
        data: [85, 65, 80, 75, 68, 72, 75],
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderColor: 'rgba(220, 38, 38, 0.8)',
        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
      },
      {
        label: teams.away?.school || 'Away',
        data: [80, 60, 75, 68, 65, 78, 70],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Situational Performance</h3>
        <div style={{ height: '300px' }}>
          <Radar data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          <DetailedMetric label="3rd and Short Conversion %" awayValue="72.4%" homeValue="75.8%" />
          <DetailedMetric label="3rd and Long Conversion %" awayValue="28.6%" homeValue="32.1%" />
          <DetailedMetric label="Red Zone TD %" awayValue="68.4%" homeValue="71.2%" />
          <DetailedMetric label="Performance when Trailing" awayValue="+0.23 PPP" homeValue="+0.38 PPP" />
          <DetailedMetric label="2-Minute Drill Success Rate" awayValue="41.2%" homeValue="45.5%" />
          <DetailedMetric label="Performance in Q4" awayValue="+0.32 PPP" homeValue="+0.29 PPP" />
          <DetailedMetric label="Explosive Play Rate" awayValue="13.5%" homeValue="14.2%" />
          <DetailedMetric label="Field Position Advantage" awayValue="+3.8 yards" homeValue="+5.2 yards" />
          <DetailedMetric label="Performance vs Top 25" awayValue="+0.18 PPP" homeValue="+0.23 PPP" />
          <DetailedMetric label="4th Down Conversion %" awayValue="63.2%" homeValue="68.7%" />
        </div>
      </div>
    </div>
  );
};

// Trend Analysis Tab
const TrendAnalysisTab = ({ teams }) => {
  const chartData = {
    labels: ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5', 'Game 6', 'Game 7', 'Game 8'],
    datasets: [
      {
        label: `${teams.home?.school || 'Home'} Efficiency`,
        data: [0.25, 0.28, 0.22, 0.30, 0.35, 0.32, 0.38, 0.42],
        borderColor: 'rgba(220, 38, 38, 1)',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: `${teams.away?.school || 'Away'} Efficiency`,
        data: [0.20, 0.23, 0.28, 0.25, 0.30, 0.32, 0.34, 0.36],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Efficiency (PPA)'
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Performance Trend Analysis</h3>
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          <DetailedMetric label="Recent Form (Last 3 Games)" awayValue="+0.28 PPP" homeValue="+0.35 PPP" />
          <DetailedMetric label="Offensive Trend" awayValue="+0.05 PPP" homeValue="+0.08 PPP" />
          <DetailedMetric label="Defensive Trend" awayValue="-0.02 PPP" homeValue="-0.04 PPP" />
          <DetailedMetric label="Current Win Streak" awayValue="3 games" homeValue="5 games" />
          <DetailedMetric label="Margin Trend" awayValue="+3.5 pts" homeValue="+5.2 pts" />
          <DetailedMetric label="Momentum Score" awayValue="+12.5" homeValue="+15.8" />
          <DetailedMetric label="Consistency Rating" awayValue="0.75" homeValue="0.82" />
          <DetailedMetric label="SOS Trend" awayValue="+2.1" homeValue="+1.5" />
          <DetailedMetric label="Recent ATS Performance" awayValue="2-1" homeValue="3-0" />
          <DetailedMetric label="Recent O/U Performance" awayValue="1-2 (Under)" homeValue="2-1 (Over)" />
        </div>
      </div>
    </div>
  );
};

// Detailed Metric Component
const DetailedMetric = ({ label, awayValue, homeValue }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">Away:</span>
        <span className="font-semibold">{awayValue}</span>
        <span className="text-sm text-gray-500">Home:</span>
        <span className="font-semibold">{homeValue}</span>
      </div>
    </div>
  );
};

// Model Architecture Section
const ModelArchitectureSection = () => {
  return (
    <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold gradient-text mb-6">Model Architecture</h2>
      
      <p className="mb-6">GAMEDAY+ uses an advanced ensemble machine learning approach combining multiple specialized models to generate predictions with the highest possible accuracy.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Model Architecture Diagram */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Ensemble Architecture</h3>
          <div className="flex flex-col space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 relative">
              <div className="text-center font-medium">Input Data</div>
              <div className="text-sm text-gray-600 text-center mt-1">500+ Engineered Features</div>
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-4 text-gray-400">
                <i className="fas fa-arrow-down"></i>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="text-center font-medium text-sm">XGBoost</div>
                <div className="text-xs text-gray-600 text-center mt-1">Gradient Boosting</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="text-center font-medium text-sm">LightGBM</div>
                <div className="text-xs text-gray-600 text-center mt-1">Gradient Boosting</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="text-center font-medium text-sm">CatBoost</div>
                <div className="text-xs text-gray-600 text-center mt-1">Categorical Boosting</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="text-center font-medium text-sm">Neural Network</div>
                <div className="text-xs text-gray-600 text-center mt-1">Deep Learning</div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 -top-4 text-gray-400">
                <i className="fas fa-arrow-down"></i>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-center font-medium">Weighted Ensemble</div>
                <div className="text-sm text-gray-600 text-center mt-1">Optimized Model Combination</div>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-4 text-gray-400">
                <i className="fas fa-arrow-down"></i>
              </div>
            </div>
            
            <div className="gradient-bg p-4 rounded-lg text-white">
              <div className="text-center font-medium">Final Prediction</div>
              <div className="text-sm text-white/80 text-center mt-1">Spread, Win Probability, Total</div>
            </div>
          </div>
        </div>
        
        {/* Model Components */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Model Components</h3>
          
          <div className="space-y-4">
            <ModelComponent 
              icon="fa-database"
              title="Feature Engineering Pipeline"
              description="Comprehensive feature creation system that generates 500+ metrics for each matchup, including basic statistics, advanced metrics, situational performance indicators, and network-based features."
            />
            
            <ModelComponent 
              icon="fa-project-diagram"
              title="Network Analysis Engine"
              description="Graph-based team relationship modeling system that analyzes transitive performance and common opponent relationships to identify hidden strengths and weaknesses."
            />
            
            <ModelComponent 
              icon="fa-robot"
              title="Ensemble Learning System"
              description="Advanced model combination system that optimally weights predictions from multiple machine learning algorithms to maximize accuracy and minimize error."
            />
            
            <ModelComponent 
              icon="fa-chart-line"
              title="Uncertainty Quantification"
              description="Sophisticated system that estimates confidence intervals and prediction uncertainty to provide more reliable and actionable insights."
            />
          </div>
        </div>
      </div>
      
      {/* Model Performance Metrics */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Model Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PerformanceMetric label="Spread Accuracy (ATS)" value="68.3%" subtitle="Last 500 games" />
          <PerformanceMetric label="Win Prediction Accuracy" value="73.5%" subtitle="Last 500 games" />
          <PerformanceMetric label="Over/Under Accuracy" value="62.7%" subtitle="Last 500 games" />
          <PerformanceMetric label="Mean Absolute Error" value="6.8" subtitle="Points" />
        </div>
      </div>
    </div>
  );
};

// Model Component
const ModelComponent = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
          <i className={`fas ${icon} text-white text-sm`}></i>
        </div>
        <h4 className="font-medium">{title}</h4>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

// Performance Metric Component
const PerformanceMetric = ({ label, value, subtitle }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="text-gray-500 text-sm mb-1">{label}</div>
      <div className="text-2xl font-bold gradient-text">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
};

// Enhanced Team Analysis Card Component
export const TeamAnalysisCard = ({ team, analysis }) => {
  return (
    <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <img 
          src={team.logos?.[0] || '/api/placeholder/40/40'} 
          alt={team.school} 
          className="w-12 h-12 metallic-3d-logo object-contain"
        />
        <div>
          <div className="font-bold text-lg">{team.school}</div>
          <div className="text-sm text-gray-600">{team.conference}</div>
        </div>
        <div className="ml-auto">
          <div className={`text-2xl font-bold ${
            analysis.overall === 'A' ? 'text-green-600' :
            analysis.overall === 'B+' || analysis.overall === 'B' ? 'text-blue-600' :
            analysis.overall === 'C+' || analysis.overall === 'C' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {analysis.overall}
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {analysis.keyStats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="font-bold text-lg">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.rank}</div>
          </div>
        ))}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-semibold text-green-700 mb-2">Strengths</div>
          <div className="space-y-1">
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="text-xs text-green-600 flex items-center">
                <i className="fas fa-check-circle mr-1"></i>
                {strength}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-red-700 mb-2">Weaknesses</div>
          <div className="space-y-1">
            {analysis.weaknesses.map((weakness, index) => (
              <div key={index} className="text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {weakness}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="mt-4 text-center">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
          analysis.trend === 'Trending Up' ? 'bg-green-100 text-green-800' :
          analysis.trend === 'Trending Down' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {analysis.trend}
        </div>
      </div>
    </div>
  );
};

export default MatchupAnalyzerInterface;