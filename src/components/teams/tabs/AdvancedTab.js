import React, { useState, useEffect } from 'react';
import ComparisonAnalyzer from '../../../services/comparisonAnalyzer';
import { advancedStatsService } from '../../../services/advancedStatsService';
import FootballKnowledgeTab from './FootballKnowledgeTab';

const AdvancedTab = ({ team1, team2 }) => {
  const [selectedCategory, setSelectedCategory] = useState('summary');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [team1Stats, setTeam1Stats] = useState(null);
  const [team2Stats, setTeam2Stats] = useState(null);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);

  // Modern red gradient (consistent with other tabs)
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  
  const categories = [
    { id: 'summary', label: 'Summary', icon: 'fas fa-chart-bar' },
    { id: 'offense', label: 'Offense', icon: 'fas fa-arrow-right' },
    { id: 'defense', label: 'Defense', icon: 'fas fa-shield-alt' },
    { id: 'fieldPosition', label: 'Field Position', icon: 'fas fa-map-marked-alt' },
    { id: 'situational', label: 'Situational', icon: 'fas fa-clock' }
  ];

  useEffect(() => {
    if (team1?.school && team2?.school) {
      loadAdvancedAnalysis();
    }
  }, [team1, team2]);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setAnimateCards(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadAdvancedAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🧠 Loading advanced analysis for ${team1.school} vs ${team2.school}`);
      
      // Fetch real stats for both teams in parallel using the singleton service
      const [team1RealStats, team2RealStats] = await Promise.all([
        advancedStatsService.fetchTeamAdvancedStats(team1.school, 2024),
        advancedStatsService.fetchTeamAdvancedStats(team2.school, 2024)
      ]);

      console.log(`📊 Team 1 (${team1.school}) stats:`, team1RealStats);
      console.log(`📊 Team 2 (${team2.school}) stats:`, team2RealStats);

      setTeam1Stats(team1RealStats);
      setTeam2Stats(team2RealStats);

      // Create analyzer and perform analysis with real data
      const analyzer = new ComparisonAnalyzer(team1, team2, team1RealStats, team2RealStats);
      const analysisResult = analyzer.performAnalysis();
      
      setAnalysis(analysisResult);
      console.log('✅ Advanced analysis complete:', analysisResult);

    } catch (err) {
      console.error('❌ Error loading advanced analysis:', err);
      setError(`Failed to load advanced analysis data: ${err.message}`);
      
      // Fallback to mock data if API fails
      console.log('🔄 Falling back to mock data for development...');
      await loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = async () => {
    try {
      console.log('🔄 Loading realistic mock data based on team quality...');
      
      // Use the service's realistic mock data generation instead of generic data
      const mockStats1 = advancedStatsService.generateMockAdvancedStats(team1.school);
      const mockStats2 = advancedStatsService.generateMockAdvancedStats(team2.school);

      console.log(`📊 Mock stats for ${team1.school}:`, mockStats1);
      console.log(`📊 Mock stats for ${team2.school}:`, mockStats2);

      setTeam1Stats(mockStats1);
      setTeam2Stats(mockStats2);

      // Create analyzer and perform analysis
      const analyzer = new ComparisonAnalyzer(team1, team2, mockStats1, mockStats2);
      const analysisResult = analyzer.performAnalysis();
      
      setAnalysis(analysisResult);
      console.log('✅ Mock analysis complete with realistic data:', analysisResult);
    } catch (mockError) {
      console.error('❌ Error with mock data:', mockError);
      setError('Failed to load even mock data');
    }
  };

  const getTeamColor = (team) => {
    return team?.color || '#dc2626';
  };

  const renderCategoryContent = () => {
    // If no teams selected, show welcome state
    if (!team1?.school || !team2?.school) {
      return renderWelcomeState();
    }
    
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();
    if (!analysis) return renderNoDataState();

    switch (selectedCategory) {
      case 'summary':
        return <ComparisonSummary analysis={analysis} team1={team1} team2={team2} />;
      case 'offense':
        return <OffenseComparison team1Stats={team1Stats} team2Stats={team2Stats} team1={team1} team2={team2} />;
      case 'defense':
        return <DefenseComparison team1Stats={team1Stats} team2Stats={team2Stats} team1={team1} team2={team2} />;
      case 'fieldPosition':
        return <FieldPositionView team1Stats={team1Stats} team2Stats={team2Stats} team1={team1} team2={team2} />;
      case 'situational':
        return <SituationalView team1Stats={team1Stats} team2Stats={team2Stats} team1={team1} team2={team2} />;
      default:
        return <ComparisonSummary analysis={analysis} team1={team1} team2={team2} />;
    }
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center py-20">
        <div className="relative mb-8">
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
          <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-red-600"></div>
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#cc001c' }}>
          Analyzing Advanced Metrics
        </h3>
        <p className="text-gray-600">Processing statistical comparisons...</p>
      </div>
    </div>
  );

  const renderWelcomeState = () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center py-20">
        <div className="flex justify-center mb-6 space-x-4">
          <i className="fas fa-chart-line text-4xl text-gray-400"></i>
          <i className="fas fa-microscope text-4xl text-gray-400"></i>
          <i className="fas fa-calculator text-4xl text-gray-400"></i>
        </div>
        <h3 className="text-4xl font-black mb-4 gradient-text">
          Advanced Analytics
        </h3>
        <p className="text-xl text-gray-600 font-light mb-8">
          Select two teams to view advanced statistical analysis
        </p>
        <div className="bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl p-6 max-w-sm mx-auto shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)]">
          <div className="space-y-3 text-gray-600">
            <div className="flex items-center space-x-3">
              <i className="fas fa-chart-bar gradient-text"></i>
              <span>Statistical comparison engine</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-balance-scale gradient-text"></i>
              <span>Matchup advantage analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-tactics gradient-text"></i>
              <span>Team style identification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center py-20">
        <div className="relative mb-8">
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
          <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
            <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-red-600">Analysis Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={loadAdvancedAnalysis}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <i className="fas fa-redo mr-2"></i>
          Retry Analysis
        </button>
      </div>
    </div>
  );

  const renderNoDataState = () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center py-20">
        <div className="relative mb-8">
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
          <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
            <i className="fas fa-chart-line text-gray-400 text-3xl"></i>
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-700">No Analysis Available</h3>
        <p className="text-gray-600">Unable to generate analysis for the selected teams.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 relative">
      <style>{`
        .gradient-text {
          background: ${modernRedGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .knowledge-button-pulse {
          animation: knowledge-pulse 2s ease-in-out infinite;
        }
        
        @keyframes knowledge-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 25px 50px -12px rgba(204, 0, 28, 0.3);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 25px 50px -12px rgba(204, 0, 28, 0.6);
          }
        }
      `}</style>

      {/* Floating Help Button */}
      <button
        onClick={() => setShowKnowledgeModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center knowledge-button-pulse"
        style={{ background: modernRedGradient }}
        title="Learn about these metrics"
      >
        <i className="fas fa-graduation-cap text-xl"></i>
      </button>

      {/* Knowledge Modal */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl relative w-full">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold gradient-text">
                <i className="fas fa-graduation-cap mr-2 gradient-text"></i>Football Knowledge Center
              </h2>
              <button
                onClick={() => setShowKnowledgeModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <i className="fas fa-times text-gray-600"></i>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              <FootballKnowledgeTab />
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: modernRedGradient }}>
            <i className="fas fa-brain text-white text-2xl"></i>
          </div>
        </div>
        
        <h2 className="text-4xl font-bold mb-4 gradient-text">
          Advanced Statistical Analysis
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Deep dive into statistical matchup analysis for {team1?.school} vs {team2?.school}
        </p>
      </div>

      {/* Category Tab Bar with Glass Effect */}
      <div className={`bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-6 mb-8 transition-all duration-500 ${animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30 hover:border-white/50'
              }`}
              style={selectedCategory === category.id ? { background: modernRedGradient } : {}}
            >
              <i className={`${category.icon} text-lg`}></i>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content Based on Category */}
      <div className={`transition-all duration-500 ${animateCards ? 'opacity-100' : 'opacity-0'}`}>
        {renderCategoryContent()}
      </div>
    </div>
  );
};

// Enhanced Comparison Summary with glassmorphism styling and DEBUG TOOLS
const ComparisonSummary = ({ analysis, team1, team2 }) => {
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  const [debugMode, setDebugMode] = useState(false);
  const [apiTestResults, setApiTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  
  const getTeamColor = (team) => team?.color || '#dc2626';

  // Debug API endpoint testing
  const testAPIEndpoint = async (endpointName, apiCall) => {
    setTesting(true);
    try {
      console.log(`🧪 Testing ${endpointName}...`);
      const startTime = Date.now();
      const result = await apiCall();
      const endTime = Date.now();
      
      setApiTestResults(prev => ({
        ...prev,
        [endpointName]: {
          status: 'success',
          data: result,
          responseTime: endTime - startTime,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      
      console.log(`✅ ${endpointName} success:`, result);
    } catch (error) {
      setApiTestResults(prev => ({
        ...prev,
        [endpointName]: {
          status: 'error',
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      
      console.error(`❌ ${endpointName} failed:`, error);
    }
    setTesting(false);
  };

  const testAllEndpoints = async () => {
    if (!team1?.school || !team2?.school) {
      alert('Please select two teams first!');
      return;
    }

    const endpoints = [
      {
        name: 'Team PPA - Ohio State',
        call: () => advancedStatsService.getTeamPPA(2024, team1.school)
      },
      {
        name: 'Team PPA - Purdue',
        call: () => advancedStatsService.getTeamPPA(2024, team2.school)
      },
      {
        name: 'Advanced Stats - Ohio State',
        call: () => advancedStatsService.getAdvancedTeamStats(2024, team1.school)
      },
      {
        name: 'Advanced Stats - Purdue',
        call: () => advancedStatsService.getAdvancedTeamStats(2024, team2.school)
      },
      {
        name: 'Season Stats - Ohio State',
        call: () => advancedStatsService.getSeasonStats(2024, team1.school)
      },
      {
        name: 'Season Stats - Purdue',
        call: () => advancedStatsService.getSeasonStats(2024, team2.school)
      },
      {
        name: 'Combined Stats - Ohio State',
        call: () => advancedStatsService.fetchTeamAdvancedStats(team1.school, 2024)
      },
      {
        name: 'Combined Stats - Purdue',
        call: () => advancedStatsService.fetchTeamAdvancedStats(team2.school, 2024)
      }
    ];

    for (const endpoint of endpoints) {
      await testAPIEndpoint(endpoint.name, endpoint.call);
      // Small delay between calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };
  
  return (
    <div className="space-y-8">
      {/* DEBUG PANEL */}
      <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-red-800 flex items-center">
            🐛 DEBUG MODE - Advanced Stats Analysis
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                debugMode ? 'bg-red-600 text-white' : 'bg-red-200 text-red-800'
              }`}
            >
              {debugMode ? 'Hide Debug' : 'Show Debug'}
            </button>
            <button
              onClick={testAllEndpoints}
              disabled={testing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : '🧪 Test All APIs'}
            </button>
          </div>
        </div>

        {debugMode && (
          <div className="space-y-4">
            {/* Current Analysis Debug */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">📊 Current Analysis Data:</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </div>

            {/* Teams Debug */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">🏈 {team1?.school} Data:</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                  {JSON.stringify(analysis?.team1Stats, null, 2)}
                </pre>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">🏈 {team2?.school} Data:</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                  {JSON.stringify(analysis?.team2Stats, null, 2)}
                </pre>
              </div>
            </div>

            {/* API Test Results */}
            {Object.keys(apiTestResults).length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">🔗 API Test Results:</h4>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {Object.entries(apiTestResults).map(([endpoint, result]) => (
                    <div key={endpoint} className={`p-2 rounded text-sm ${
                      result.status === 'success' ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{endpoint}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.status === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {result.status === 'success' ? `✅ ${result.responseTime}ms` : '❌ Failed'}
                        </span>
                      </div>
                      {result.status === 'error' && (
                        <div className="text-red-600 text-xs mt-1">{result.error}</div>
                      )}
                      {result.status === 'success' && result.data && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-gray-600">View Data</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-20">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Endpoint Test Buttons */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">🎯 Individual API Tests:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => testAPIEndpoint('PPA Test', () => advancedStatsService.getTeamPPA(2024, team1.school))}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Test PPA
                </button>
                <button
                  onClick={() => testAPIEndpoint('Advanced Test', () => advancedStatsService.getAdvancedTeamStats(2024, team1.school))}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Test Advanced
                </button>
                <button
                  onClick={() => testAPIEndpoint('Season Test', () => advancedStatsService.getSeasonStats(2024, team1.school))}
                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                >
                  Test Season
                </button>
                <button
                  onClick={() => testAPIEndpoint('Mock Test', () => advancedStatsService.generateMockAdvancedStats(team1.school))}
                  className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                >
                  Test Mock
                </button>
              </div>
            </div>

            {/* Analysis Debug Info */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">📈 Analysis Calculation Debug:</h4>
              <div className="space-y-2 text-sm">
                <div>Overall Advantage: <span className="font-mono">{analysis?.overallAdvantage || 'N/A'}</span></div>
                <div>Matchup Type: <span className="font-mono">{analysis?.matchupType || 'N/A'}</span></div>
                <div>Team 1 Styles: <span className="font-mono">{JSON.stringify(analysis?.team1Styles || [])}</span></div>
                <div>Team 2 Styles: <span className="font-mono">{JSON.stringify(analysis?.team2Styles || [])}</span></div>
                <div>Has Team1 Stats: <span className="font-mono">{analysis?.team1Stats ? 'YES' : 'NO'}</span></div>
                <div>Has Team2 Stats: <span className="font-mono">{analysis?.team2Stats ? 'YES' : 'NO'}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overall Matchup Analysis */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4" 
              style={{ 
                background: modernRedGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
            {team1.school} vs {team2.school}
          </h2>
          
          {/* Enhanced summary with logos and green text */}
          <div className="flex items-center justify-center space-x-4">
            {/* Show team1 logo if they have advantage */}
            {analysis?.overallAdvantage < -0.2 && team1?.logos?.[0] && (
              <img src={team1.logos[0]} alt={team1.school} className="w-8 h-8 object-contain" />
            )}
            
            <p className="text-xl font-semibold text-green-600">
              {analysis?.overallAdvantage < -0.2 ? `${team1.school} Advantage` :
               analysis?.overallAdvantage > 0.2 ? `${team2.school} Advantage` : 
               'Even Statistical Matchup'}
            </p>
            
            {/* Show team2 logo if they have advantage */}
            {analysis?.overallAdvantage > 0.2 && team2?.logos?.[0] && (
              <img src={team2.logos[0]} alt={team2.school} className="w-8 h-8 object-contain" />
            )}
          </div>
          
          {/* Debug advantage calculation */}
          {debugMode && (
            <div className="mt-2 text-sm text-gray-600">
              Raw Advantage: {analysis?.overallAdvantage || 'undefined'} | 
              Threshold: {analysis?.overallAdvantage < -0.2 ? 'Team1 Strong' : analysis?.overallAdvantage > 0.2 ? 'Team2 Strong' : 'Even'}
            </div>
          )}
        </div>

        {/* Advantage Visualization */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              {team1?.logos?.[0] && (
                <img src={team1.logos[0]} alt={team1.school} className="w-12 h-12 object-contain" />
              )}
              <span className="text-lg font-semibold" style={{ color: getTeamColor(team1) }}>
                {team1.school}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold" style={{ color: getTeamColor(team2) }}>
                {team2.school}
              </span>
              {team2?.logos?.[0] && (
                <img src={team2.logos[0]} alt={team2.school} className="w-12 h-12 object-contain" />
              )}
            </div>
          </div>

          {/* Enhanced Advantage Bar */}
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute inset-0 bg-gradient-to-r rounded-full"
              style={{ 
                background: `linear-gradient(to right, ${getTeamColor(team1)}, #e5e7eb, ${getTeamColor(team2)})`
              }}
            ></div>
            <div 
              className="absolute top-1 h-6 bg-white border-2 border-gray-800 rounded-full transition-all duration-1000 w-2 shadow-lg"
              style={{ 
                left: `${50 + (analysis?.overallAdvantage * 40)}%`,
                transform: 'translateX(-50%)'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
              {analysis?.overallAdvantage === 0 ? 'Even' : 
               analysis?.overallAdvantage < 0 ? `${team1.school} +${Math.abs(analysis.overallAdvantage * 100).toFixed(0)}%` :
               `${team2.school} +${(analysis.overallAdvantage * 100).toFixed(0)}%`}
            </div>
          </div>

          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{team1.school} Favored</span>
            <span>Even</span>
            <span>{team2.school} Favored</span>
          </div>
        </div>
      </div>

      {/* Team Style Analysis Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Team 1 Style Card */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              {team1?.logos?.[0] ? (
                <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain drop-shadow-lg" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                     style={{ background: modernRedGradient }}>
                  {team1?.school?.[0]}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: getTeamColor(team1) }}>
              {team1.school}
            </h3>
            <p className="text-gray-600 font-medium">Playing Style Profile</p>
          </div>

          <div className="space-y-3">
            {analysis?.team1Styles?.map((style, index) => (
              <div key={index} className="flex items-center justify-center">
                <span className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${getTeamColor(team1)}, ${getTeamColor(team1)}dd)` }}>
                  {style}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 Style Card */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              {team2?.logos?.[0] ? (
                <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain drop-shadow-lg" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                     style={{ background: modernRedGradient }}>
                  {team2?.school?.[0]}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: getTeamColor(team2) }}>
              {team2.school}
            </h3>
            <p className="text-gray-600 font-medium">Playing Style Profile</p>
          </div>

          <div className="space-y-3">
            {analysis?.team2Styles?.map((style, index) => (
              <div key={index} className="flex items-center justify-center">
                <span className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${getTeamColor(team2)}, ${getTeamColor(team2)}dd)` }}>
                  {style}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Comparison */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h3 className="text-2xl font-bold mb-6 text-center" 
            style={{ 
              background: modernRedGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Key Statistical Matchups
        </h3>
        
        {/* Debug Values */}
        {debugMode && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">🔍 Raw Statistical Values:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>{team1.school} Offense:</strong>
                <div>Success Rate: {analysis?.team1Stats?.offense?.successRate || 'undefined'}</div>
                <div>Explosiveness: {analysis?.team1Stats?.offense?.explosiveness || 'undefined'}</div>
                <div>PPA: {analysis?.team1Stats?.offense?.ppa || 'undefined'}</div>
              </div>
              <div>
                <strong>{team2.school} Offense:</strong>
                <div>Success Rate: {analysis?.team2Stats?.offense?.successRate || 'undefined'}</div>
                <div>Explosiveness: {analysis?.team2Stats?.offense?.explosiveness || 'undefined'}</div>
                <div>PPA: {analysis?.team2Stats?.offense?.ppa || 'undefined'}</div>
              </div>
              <div>
                <strong>{team1.school} Defense:</strong>
                <div>Success Rate: {analysis?.team1Stats?.defense?.successRate || 'undefined'}</div>
                <div>PPA: {analysis?.team1Stats?.defense?.ppa || 'undefined'}</div>
              </div>
              <div>
                <strong>{team2.school} Defense:</strong>
                <div>Success Rate: {analysis?.team2Stats?.defense?.successRate || 'undefined'}</div>
                <div>PPA: {analysis?.team2Stats?.defense?.ppa || 'undefined'}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Offensive Efficiency */}
          <div className="text-center p-4 bg-white/30 rounded-2xl">
            <i className="fas fa-chart-line text-3xl mb-3 gradient-text"></i>
            <h4 className="font-bold text-gray-800 mb-2">Offensive Efficiency</h4>
            <div className="space-y-2 text-sm">
              <div className={`${debugMode ? 'font-mono' : ''}`}>
                {team1.school}: {(analysis?.team1Stats?.offense?.successRate * 100 || 0).toFixed(1)}%
                {debugMode && <span className="text-xs text-gray-500 ml-2">({analysis?.team1Stats?.offense?.successRate || 'null'})</span>}
              </div>
              <div className={`${debugMode ? 'font-mono' : ''}`}>
                {team2.school}: {(analysis?.team2Stats?.offense?.successRate * 100 || 0).toFixed(1)}%
                {debugMode && <span className="text-xs text-gray-500 ml-2">({analysis?.team2Stats?.offense?.successRate || 'null'})</span>}
              </div>
            </div>
          </div>
          
          {/* Defensive Strength */}
          <div className="text-center p-4 bg-white/30 rounded-2xl">
            <i className="fas fa-shield-alt text-3xl mb-3 gradient-text"></i>
            <h4 className="font-bold text-gray-800 mb-2">Defensive Strength</h4>
            <div className="space-y-2 text-sm">
              <div className={`${debugMode ? 'font-mono' : ''}`}>
                {team1.school}: {((1 - (analysis?.team1Stats?.defense?.successRate || 0)) * 100).toFixed(1)}%
                {debugMode && <span className="text-xs text-gray-500 ml-2">({analysis?.team1Stats?.defense?.successRate || 'null'})</span>}
              </div>
              <div className={`${debugMode ? 'font-mono' : ''}`}>
                {team2.school}: {((1 - (analysis?.team2Stats?.defense?.successRate || 0)) * 100).toFixed(1)}%
                {debugMode && <span className="text-xs text-gray-500 ml-2">({analysis?.team2Stats?.defense?.successRate || 'null'})</span>}
              </div>
            </div>
          </div>
          
          {/* Explosiveness */}
          <div className="text-center p-4 bg-white/30 rounded-2xl">
            <i className="fas fa-bolt text-3xl mb-3 gradient-text"></i>
            <h4 className="font-bold text-gray-800 mb-2">Explosiveness</h4>
            <div className="space-y-2 text-sm">
              <div className={`${debugMode ? 'font-mono' : ''}`}>
                {team1.school}: {(analysis?.team1Stats?.offense?.explosiveness || 0).toFixed(2)}
                {debugMode && <span className="text-xs text-gray-500 ml-2">({analysis?.team1Stats?.offense?.explosiveness || 'null'})</span>}
              </div>
              <div className={`${debugMode ? 'font-mono' : ''}`}>
                {team2.school}: {(analysis?.team2Stats?.offense?.explosiveness || 0).toFixed(2)}
                {debugMode && <span className="text-xs text-gray-500 ml-2">({analysis?.team2Stats?.offense?.explosiveness || 'null'})</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Analysis */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h3 className="text-2xl font-bold mb-6 text-center" 
            style={{ 
              background: modernRedGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Comprehensive Analysis
        </h3>
        
        <div className="space-y-6">
          {/* Overview Analysis */}
          <div className="p-6 bg-white/30 rounded-2xl">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <i className="fas fa-chart-bar mr-2 gradient-text"></i>
              Matchup Overview
            </h4>
            <div className="text-green-600 leading-relaxed font-medium">
              {(() => {
                const analyzer = new ComparisonAnalyzer(team1, team2, analysis?.team1Stats, analysis?.team2Stats);
                const analysisText = analyzer.matchupAnalysis1(analysis?.matchupType);
                
                // Replace team names with team name + logo
                let formattedText = analysisText;
                if (team1?.school && team1?.logos?.[0]) {
                  const team1Regex = new RegExp(team1.school, 'g');
                  formattedText = formattedText.replace(team1Regex, 
                    `<span class="inline-flex items-center gap-1">
                      <img src="${team1.logos[0]}" alt="${team1.school}" class="w-4 h-4 object-contain inline" />
                      ${team1.school}
                    </span>`
                  );
                }
                if (team2?.school && team2?.logos?.[0]) {
                  const team2Regex = new RegExp(team2.school, 'g');
                  formattedText = formattedText.replace(team2Regex, 
                    `<span class="inline-flex items-center gap-1">
                      <img src="${team2.logos[0]}" alt="${team2.school}" class="w-4 h-4 object-contain inline" />
                      ${team2.school}
                    </span>`
                  );
                }
                
                return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
              })()}
            </div>
          </div>

          {/* Deep Dive Analysis */}
          <div className="p-6 bg-white/30 rounded-2xl">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <i className="fas fa-search mr-2 gradient-text"></i>
              Deep Dive Analysis
            </h4>
            <div className="text-green-600 leading-relaxed font-medium">
              {(() => {
                const analyzer = new ComparisonAnalyzer(team1, team2, analysis?.team1Stats, analysis?.team2Stats);
                const analysisText = analyzer.matchupAnalysis2(analysis?.matchupType);
                
                // Replace team names with team name + logo
                let formattedText = analysisText;
                if (team1?.school && team1?.logos?.[0]) {
                  const team1Regex = new RegExp(team1.school, 'g');
                  formattedText = formattedText.replace(team1Regex, 
                    `<span class="inline-flex items-center gap-1">
                      <img src="${team1.logos[0]}" alt="${team1.school}" class="w-4 h-4 object-contain inline" />
                      ${team1.school}
                    </span>`
                  );
                }
                if (team2?.school && team2?.logos?.[0]) {
                  const team2Regex = new RegExp(team2.school, 'g');
                  formattedText = formattedText.replace(team2Regex, 
                    `<span class="inline-flex items-center gap-1">
                      <img src="${team2.logos[0]}" alt="${team2.school}" class="w-4 h-4 object-contain inline" />
                      ${team2.school}
                    </span>`
                  );
                }
                
                return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
              })()}
            </div>
          </div>

          {/* Technical Analysis */}
          <div className="p-6 bg-white/30 rounded-2xl">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <i className="fas fa-calculator mr-2 gradient-text"></i>
              Technical Statistical Analysis
            </h4>
            <div className="text-green-600 leading-relaxed font-medium">
              {(() => {
                const analyzer = new ComparisonAnalyzer(team1, team2, analysis?.team1Stats, analysis?.team2Stats);
                const analysisText = analyzer.matchupAnalysis3(analysis?.matchupType);
                
                // Replace team names with team name + logo
                let formattedText = analysisText;
                if (team1?.school && team1?.logos?.[0]) {
                  const team1Regex = new RegExp(team1.school, 'g');
                  formattedText = formattedText.replace(team1Regex, 
                    `<span class="inline-flex items-center gap-1">
                      <img src="${team1.logos[0]}" alt="${team1.school}" class="w-4 h-4 object-contain inline" />
                      ${team1.school}
                    </span>`
                  );
                }
                if (team2?.school && team2?.logos?.[0]) {
                  const team2Regex = new RegExp(team2.school, 'g');
                  formattedText = formattedText.replace(team2Regex, 
                    `<span class="inline-flex items-center gap-1">
                      <img src="${team2.logos[0]}" alt="${team2.school}" class="w-4 h-4 object-contain inline" />
                      ${team2.school}
                    </span>`
                  );
                }
                
                return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Offensive Analysis with detailed metrics
const OffenseComparison = ({ team1Stats, team2Stats, team1, team2 }) => {
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  const getTeamColor = (team) => team?.color || '#dc2626';

  const compareMetric = (stat1, stat2, higherBetter = true) => {
    if (!stat1 || !stat2) return 'even';
    const diff = higherBetter ? stat1 - stat2 : stat2 - stat1;
    if (Math.abs(diff) < 0.02) return 'even';
    return diff > 0 ? 'team1' : 'team2';
  };

  const MetricCard = ({ title, icon, team1Value, team2Value, description, higherBetter = true }) => {
    const advantage = compareMetric(team1Value, team2Value, higherBetter);
    
    return (
      <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 p-6 shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)]">
        <div className="text-center mb-4">
          <i className={`${icon} text-3xl mb-2 gradient-text`}></i>
          <h4 className="font-bold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        
        <div className="space-y-3">
          <div className={`flex justify-between items-center p-3 rounded-xl ${advantage === 'team1' ? 'bg-green-100 border border-green-200' : 'bg-gray-50'}`}>
            <span className="font-medium" style={{ color: getTeamColor(team1) }}>
              {team1.school}
            </span>
            <span className="font-bold">
              {typeof team1Value === 'number' ? team1Value.toFixed(2) : team1Value || 'N/A'}
            </span>
          </div>
          
          <div className={`flex justify-between items-center p-3 rounded-xl ${advantage === 'team2' ? 'bg-green-100 border border-green-200' : 'bg-gray-50'}`}>
            <span className="font-medium" style={{ color: getTeamColor(team2) }}>
              {team2.school}
            </span>
            <span className="font-bold">
              {typeof team2Value === 'number' ? team2Value.toFixed(2) : team2Value || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{ background: modernRedGradient }}>
          <i className="fas fa-arrow-right text-white text-2xl"></i>
        </div>
        <h3 className="text-3xl font-bold mb-2" 
            style={{ 
              background: modernRedGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Offensive Analysis
        </h3>
        <p className="text-gray-600">Comprehensive offensive efficiency comparison</p>
      </div>

      {/* Primary Metrics */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800">Core Offensive Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Success Rate"
            icon="fas fa-percentage"
            team1Value={team1Stats?.offense?.successRate * 100}
            team2Value={team2Stats?.offense?.successRate * 100}
            description="Percentage of successful plays"
          />
          
          <MetricCard
            title="Points Per Play"
            icon="fas fa-chart-line"
            team1Value={team1Stats?.offense?.ppa}
            team2Value={team2Stats?.offense?.ppa}
            description="Average points added per play"
          />
          
          <MetricCard
            title="Explosiveness"
            icon="fas fa-bolt"
            team1Value={team1Stats?.offense?.explosiveness}
            team2Value={team2Stats?.offense?.explosiveness}
            description="Big play capability"
          />
        </div>
      </div>

      {/* Play Type Analysis */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800">Play Type Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Passing */}
          <div className="space-y-4">
            <div className="text-center">
              <i className="fas fa-football-ball text-3xl mb-2 gradient-text"></i>
              <h5 className="font-bold text-lg text-gray-800">Passing Game</h5>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/30 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Pass Rate</span>
                  <span className="font-bold">Usage</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: getTeamColor(team1) }}>{team1.school}</span>
                    <span>{((team1Stats?.offense?.passingPlays?.rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: getTeamColor(team2) }}>{team2.school}</span>
                    <span>{((team2Stats?.offense?.passingPlays?.rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/30 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Pass Success</span>
                  <span className="font-bold">Efficiency</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: getTeamColor(team1) }}>{team1.school}</span>
                    <span>{((team1Stats?.offense?.passingPlays?.successRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: getTeamColor(team2) }}>{team2.school}</span>
                    <span>{((team2Stats?.offense?.passingPlays?.successRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rushing */}
          <div className="space-y-4">
            <div className="text-center">
              <i className="fas fa-running text-3xl mb-2 gradient-text"></i>
              <h5 className="font-bold text-lg text-gray-800">Running Game</h5>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/30 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Rush Rate</span>
                  <span className="font-bold">Usage</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: getTeamColor(team1) }}>{team1.school}</span>
                    <span>{((team1Stats?.offense?.rushingPlays?.rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: getTeamColor(team2) }}>{team2.school}</span>
                    <span>{((team2Stats?.offense?.rushingPlays?.rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/30 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Rush Success</span>
                  <span className="font-bold">Efficiency</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: getTeamColor(team1) }}>{team1.school}</span>
                    <span>{((team1Stats?.offense?.rushingPlays?.successRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: getTeamColor(team2) }}>{team2.school}</span>
                    <span>{((team2Stats?.offense?.rushingPlays?.successRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Situational Metrics */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800">Situational Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Standard Downs"
            icon="fas fa-play"
            team1Value={team1Stats?.offense?.standardDowns?.successRate * 100}
            team2Value={team2Stats?.offense?.standardDowns?.successRate * 100}
            description="1st & 2nd down efficiency"
          />
          
          <MetricCard
            title="Passing Downs"
            icon="fas fa-hand-paper"
            team1Value={team1Stats?.offense?.passingDowns?.successRate * 100}
            team2Value={team2Stats?.offense?.passingDowns?.successRate * 100}
            description="3rd & 4th down efficiency"
          />
          
          <MetricCard
            title="Red Zone Efficiency"
            icon="fas fa-bullseye"
            team1Value={team1Stats?.offense?.pointsPerOpportunity}
            team2Value={team2Stats?.offense?.pointsPerOpportunity}
            description="Points per red zone trip"
          />
        </div>
      </div>

      {/* Comprehensive Offensive Analysis */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
          <i className="fas fa-search mr-3 gradient-text"></i>
          Detailed Offensive Analysis
        </h4>
        <div className="bg-white/30 rounded-2xl p-6">
          <div className="text-green-600 leading-relaxed font-medium">
            {(() => {
              const analyzer = new ComparisonAnalyzer(team1, team2, team1Stats, team2Stats);
              const analysisText = analyzer.offensiveAnalysis();
              
              // Replace team names with team name + logo
              let formattedText = analysisText;
              if (team1?.school && team1?.logos?.[0]) {
                const team1Regex = new RegExp(team1.school, 'g');
                formattedText = formattedText.replace(team1Regex, 
                  `<span class="inline-flex items-center gap-1">
                    <img src="${team1.logos[0]}" alt="${team1.school}" class="w-4 h-4 object-contain inline" />
                    ${team1.school}
                  </span>`
                );
              }
              if (team2?.school && team2?.logos?.[0]) {
                const team2Regex = new RegExp(team2.school, 'g');
                formattedText = formattedText.replace(team2Regex, 
                  `<span class="inline-flex items-center gap-1">
                    <img src="${team2.logos[0]}" alt="${team2.school}" class="w-4 h-4 object-contain inline" />
                    ${team2.school}
                  </span>`
                );
              }
              
              return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Defensive Analysis with detailed metrics
const DefenseComparison = ({ team1Stats, team2Stats, team1, team2 }) => {
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  const getTeamColor = (team) => team?.color || '#dc2626';

  const compareDefensiveMetric = (stat1, stat2, lowerBetter = true) => {
    if (!stat1 || !stat2) return 'even';
    const diff = lowerBetter ? stat2 - stat1 : stat1 - stat2;
    if (Math.abs(diff) < 0.02) return 'even';
    return diff > 0 ? 'team1' : 'team2';
  };

  const DefensiveMetricCard = ({ title, icon, team1Value, team2Value, description, lowerBetter = true }) => {
    const advantage = compareDefensiveMetric(team1Value, team2Value, lowerBetter);
    
    return (
      <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 p-6 shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)]">
        <div className="text-center mb-4">
          <i className={`${icon} text-3xl mb-2 gradient-text`}></i>
          <h4 className="font-bold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        
        <div className="space-y-3">
          <div className={`flex justify-between items-center p-3 rounded-xl ${advantage === 'team1' ? 'bg-green-100 border border-green-200' : 'bg-gray-50'}`}>
            <span className="font-medium" style={{ color: getTeamColor(team1) }}>
              {team1.school}
            </span>
            <span className="font-bold">
              {typeof team1Value === 'number' ? team1Value.toFixed(2) : team1Value || 'N/A'}
            </span>
          </div>
          
          <div className={`flex justify-between items-center p-3 rounded-xl ${advantage === 'team2' ? 'bg-green-100 border border-green-200' : 'bg-gray-50'}`}>
            <span className="font-medium" style={{ color: getTeamColor(team2) }}>
              {team2.school}
            </span>
            <span className="font-bold">
              {typeof team2Value === 'number' ? team2Value.toFixed(2) : team2Value || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{ background: modernRedGradient }}>
          <i className="fas fa-shield-alt text-white text-2xl"></i>
        </div>
        <h3 className="text-3xl font-bold mb-2" 
            style={{ 
              background: modernRedGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Defensive Analysis
        </h3>
        <p className="text-gray-600">Comprehensive defensive efficiency comparison</p>
      </div>

      {/* Primary Defensive Metrics */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800">Core Defensive Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DefensiveMetricCard
            title="Opponent Success Rate"
            icon="fas fa-percentage"
            team1Value={team1Stats?.defense?.successRate * 100}
            team2Value={team2Stats?.defense?.successRate * 100}
            description="Lower is better"
          />
          
          <DefensiveMetricCard
            title="Points Per Play Allowed"
            icon="fas fa-chart-line-down"
            team1Value={team1Stats?.defense?.ppa}
            team2Value={team2Stats?.defense?.ppa}
            description="Points allowed per play"
          />
          
          <DefensiveMetricCard
            title="Havoc Rate"
            icon="fas fa-bolt"
            team1Value={team1Stats?.defense?.havoc?.total * 100}
            team2Value={team2Stats?.defense?.havoc?.total * 100}
            description="Disruption percentage"
            lowerBetter={false}
          />
        </div>
      </div>

      {/* Havoc Breakdown */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800">Havoc Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Front Seven Havoc */}
          <div className="space-y-4">
            <div className="text-center">
              <i className="fas fa-fist-raised text-3xl mb-2 gradient-text"></i>
              <h5 className="font-bold text-lg text-gray-800">Front Seven</h5>
              <p className="text-sm text-gray-600">Pass rush & run stopping</p>
            </div>
            
            <div className="bg-white/30 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Disruption Rate</span>
                <span className="font-bold">Percentage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: getTeamColor(team1) }}>{team1.school}</span>
                  <span>{((team1Stats?.defense?.havoc?.frontSeven || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: getTeamColor(team2) }}>{team2.school}</span>
                  <span>{((team2Stats?.defense?.havoc?.frontSeven || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Havoc */}
          <div className="space-y-4">
            <div className="text-center">
              <i className="fas fa-user-shield text-3xl mb-2 gradient-text"></i>
              <h5 className="font-bold text-lg text-gray-800">Secondary</h5>
              <p className="text-sm text-gray-600">Coverage & ball skills</p>
            </div>
            
            <div className="bg-white/30 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Disruption Rate</span>
                <span className="font-bold">Percentage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: getTeamColor(team1) }}>{team1.school}</span>
                  <span>{((team1Stats?.defense?.havoc?.secondary || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: getTeamColor(team2) }}>{team2.school}</span>
                  <span>{((team2Stats?.defense?.havoc?.secondary || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Run Defense Metrics */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800">Run Defense Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DefensiveMetricCard
            title="Stuff Rate"
            icon="fas fa-hand-rock"
            team1Value={team1Stats?.defense?.stuffRate * 100}
            team2Value={team2Stats?.defense?.stuffRate * 100}
            description="TFL percentage"
            lowerBetter={false}
          />
          
          <DefensiveMetricCard
            title="Line Yards"
            icon="fas fa-arrows-alt-h"
            team1Value={team1Stats?.defense?.lineYards}
            team2Value={team2Stats?.defense?.lineYards}
            description="Yards at line"
          />
          
          <DefensiveMetricCard
            title="Second Level"
            icon="fas fa-layer-group"
            team1Value={team1Stats?.defense?.secondLevelYards}
            team2Value={team2Stats?.defense?.secondLevelYards}
            description="LB level yards"
          />
          
          <DefensiveMetricCard
            title="Open Field"
            icon="fas fa-running"
            team1Value={team1Stats?.defense?.openFieldYards}
            team2Value={team2Stats?.defense?.openFieldYards}
            description="Breakaway yards"
          />
        </div>
      </div>

      {/* Defensive Summary */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-center text-gray-800">Defensive Identity</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Team 1 Defense */}
          <div className="text-center p-6 bg-white/30 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {team1?.logos?.[0] ? (
                <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl"
                     style={{ background: modernRedGradient }}>
                  {team1?.school?.[0]}
                </div>
              )}
            </div>
            <h5 className="font-bold text-lg mb-2" style={{ color: getTeamColor(team1) }}>
              {team1.school}
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Havoc:</span>
                <span className="font-bold">{((team1Stats?.defense?.havoc?.total || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Opponent Success:</span>
                <span className="font-bold">{((team1Stats?.defense?.successRate || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Points Allowed:</span>
                <span className="font-bold">{(team1Stats?.defense?.ppa || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Team 2 Defense */}
          <div className="text-center p-6 bg-white/30 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {team2?.logos?.[0] ? (
                <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl"
                     style={{ background: modernRedGradient }}>
                  {team2?.school?.[0]}
                </div>
              )}
            </div>
            <h5 className="font-bold text-lg mb-2" style={{ color: getTeamColor(team2) }}>
              {team2.school}
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Havoc:</span>
                <span className="font-bold">{((team2Stats?.defense?.havoc?.total || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Opponent Success:</span>
                <span className="font-bold">{((team2Stats?.defense?.successRate || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Points Allowed:</span>
                <span className="font-bold">{(team2Stats?.defense?.ppa || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Defensive Analysis */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
          <i className="fas fa-search mr-3 gradient-text"></i>
          Detailed Defensive Analysis
        </h4>
        <div className="bg-white/30 rounded-2xl p-6">
          <div className="text-green-600 leading-relaxed font-medium">
            {(() => {
              const analyzer = new ComparisonAnalyzer(team1, team2, team1Stats, team2Stats);
              const analysisText = analyzer.defensiveAnalysis();
              
              // Replace team names with team name + logo
              let formattedText = analysisText;
              if (team1?.school && team1?.logos?.[0]) {
                const team1Regex = new RegExp(team1.school, 'g');
                formattedText = formattedText.replace(team1Regex, 
                  `<span class="inline-flex items-center gap-1">
                    <img src="${team1.logos[0]}" alt="${team1.school}" class="w-4 h-4 object-contain inline" />
                    ${team1.school}
                  </span>`
                );
              }
              if (team2?.school && team2?.logos?.[0]) {
                const team2Regex = new RegExp(team2.school, 'g');
                formattedText = formattedText.replace(team2Regex, 
                  `<span class="inline-flex items-center gap-1">
                    <img src="${team2.logos[0]}" alt="${team2.school}" class="w-4 h-4 object-contain inline" />
                    ${team2.school}
                  </span>`
                );
              }
              
              return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Field Position Analysis
const FieldPositionView = ({ team1Stats, team2Stats, team1, team2 }) => {
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  const getTeamColor = (team) => team?.color || '#dc2626';

  const FieldVisualization = ({ teamStats, team, isTop = true }) => {
    const avgStart = teamStats?.offense?.fieldPosition?.averageStart || 25;
    const position = Math.max(0, Math.min(100, avgStart));
    
    return (
      <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40">
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
            {team?.logos?.[0] ? (
              <img src={team.logos[0]} alt={team.school} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold"
                   style={{ background: modernRedGradient }}>
                {team?.school?.[0]}
              </div>
            )}
          </div>
          <h4 className="font-bold" style={{ color: getTeamColor(team) }}>
            {team.school}
          </h4>
          <p className="text-sm text-gray-600">Avg Start: {avgStart.toFixed(1)} yard line</p>
        </div>
        
        {/* Field visualization */}
        <div className="relative h-20 bg-gradient-to-r from-red-300 via-green-200 to-red-300 rounded-lg border-2 border-white overflow-hidden">
          {/* Yard markers */}
          <div className="absolute inset-0 flex">
            {[20, 40, 50, 60, 80].map(yard => (
              <div key={yard} className="flex-1 border-r border-white/50 flex items-center justify-center text-xs font-bold text-gray-700">
                {yard === 50 ? '50' : yard > 50 ? 100 - yard : yard}
              </div>
            ))}
          </div>
          
          {/* Team position marker */}
          <div 
            className="absolute top-2 w-4 h-16 bg-white border-2 border-gray-800 rounded-full shadow-lg transition-all duration-1000"
            style={{ 
              left: `${position}%`,
              transform: 'translateX(-50%)',
              background: getTeamColor(team)
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs mt-2 text-gray-600">
          <span>Own Goal</span>
          <span>Midfield</span>
          <span>Opponent Goal</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{ background: modernRedGradient }}>
          <i className="fas fa-map-marked-alt text-white text-2xl"></i>
        </div>
        <h3 className="text-3xl font-bold mb-2" 
            style={{ 
              background: modernRedGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Field Position Analysis
        </h3>
        <p className="text-gray-600">Average starting field position and territorial advantage</p>
      </div>

      {/* Field Position Comparison */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-center text-gray-800">Starting Field Position</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FieldVisualization teamStats={team1Stats} team={team1} />
          <FieldVisualization teamStats={team2Stats} team={team2} />
        </div>
      </div>

      {/* Territory Impact */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-center text-gray-800">Territorial Impact</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/30 rounded-2xl">
            <i className="fas fa-arrow-up text-3xl mb-3 gradient-text"></i>
            <h5 className="font-bold text-gray-800 mb-2">Field Position Value</h5>
            <p className="text-sm text-gray-600 mb-4">Better starting position = more scoring opportunities</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: getTeamColor(team1) }}>{team1.school}:</span>
                <span className="font-bold">
                  {team1Stats?.offense?.fieldPosition?.averageStart > team2Stats?.offense?.fieldPosition?.averageStart ? 'Advantage' : 'Disadvantage'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: getTeamColor(team2) }}>{team2.school}:</span>
                <span className="font-bold">
                  {team2Stats?.offense?.fieldPosition?.averageStart > team1Stats?.offense?.fieldPosition?.averageStart ? 'Advantage' : 'Disadvantage'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-white/30 rounded-2xl">
            <i className="fas fa-crosshairs text-3xl mb-3 gradient-text"></i>
            <h5 className="font-bold text-gray-800 mb-2">Scoring Probability</h5>
            <p className="text-sm text-gray-600 mb-4">Expected points based on field position</p>
            <div className="space-y-2 text-sm">
              <div>Better field position leads to:</div>
              <div className="font-bold">• Higher scoring chance</div>
              <div className="font-bold">• Shorter drives needed</div>
              <div className="font-bold">• More play options</div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-white/30 rounded-2xl">
            <i className="fas fa-balance-scale text-3xl mb-3 gradient-text"></i>
            <h5 className="font-bold text-gray-800 mb-2">Game Impact</h5>
            <p className="text-sm text-gray-600 mb-4">How field position affects the game</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Difference:</span>
                <span className="font-bold">
                  {Math.abs((team1Stats?.offense?.fieldPosition?.averageStart || 0) - (team2Stats?.offense?.fieldPosition?.averageStart || 0)).toFixed(1)} yards
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {Math.abs((team1Stats?.offense?.fieldPosition?.averageStart || 0) - (team2Stats?.offense?.fieldPosition?.averageStart || 0)) > 3 ? 
                  'Significant advantage' : 'Marginal difference'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Field Position Analysis */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
          <i className="fas fa-search mr-3 gradient-text"></i>
          Detailed Field Position Analysis
        </h4>
        <div className="bg-white/30 rounded-2xl p-6">
          <div className="text-green-600 leading-relaxed font-medium">
            {(() => {
              const analyzer = new ComparisonAnalyzer(team1, team2, team1Stats, team2Stats);
              const analysisText = analyzer.fieldPositionAnalysis();
              
              // Replace team names with team name + logo
              let formattedText = analysisText;
              if (team1?.school && team1?.logos?.[0]) {
                const team1Regex = new RegExp(team1.school, 'g');
                formattedText = formattedText.replace(team1Regex, 
                  `<span class="inline-flex items-center gap-1">
                    <img src="${team1.logos[0]}" alt="${team1.school}" class="w-4 h-4 object-contain inline" />
                    ${team1.school}
                  </span>`
                );
              }
              if (team2?.school && team2?.logos?.[0]) {
                const team2Regex = new RegExp(team2.school, 'g');
                formattedText = formattedText.replace(team2Regex, 
                  `<span class="inline-flex items-center gap-1">
                    <img src="${team2.logos[0]}" alt="${team2.school}" class="w-4 h-4 object-contain inline" />
                    ${team2.school}
                  </span>`
                );
              }
              
              return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Situational Analysis
const SituationalView = ({ team1Stats, team2Stats, team1, team2 }) => {
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  const getTeamColor = (team) => team?.color || '#dc2626';

  const SituationCard = ({ title, icon, description, team1Value, team2Value, valueLabel, higherBetter = true }) => {
    const advantage = higherBetter ? 
      (team1Value > team2Value ? 'team1' : team1Value < team2Value ? 'team2' : 'even') :
      (team1Value < team2Value ? 'team1' : team1Value > team2Value ? 'team2' : 'even');

    return (
      <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 p-6">
        <div className="text-center mb-4">
          <i className={`${icon} text-3xl mb-2 gradient-text`}></i>
          <h4 className="font-bold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        
        <div className="space-y-3">
          <div className={`flex justify-between items-center p-3 rounded-xl ${advantage === 'team1' ? 'bg-green-100 border border-green-200' : 'bg-gray-50'}`}>
            <span className="font-medium" style={{ color: getTeamColor(team1) }}>
              {team1.school}
            </span>
            <span className="font-bold">
              {typeof team1Value === 'number' ? `${team1Value.toFixed(1)}${valueLabel}` : team1Value || 'N/A'}
            </span>
          </div>
          
          <div className={`flex justify-between items-center p-3 rounded-xl ${advantage === 'team2' ? 'bg-green-100 border border-green-200' : 'bg-gray-50'}`}>
            <span className="font-medium" style={{ color: getTeamColor(team2) }}>
              {team2.school}
            </span>
            <span className="font-bold">
              {typeof team2Value === 'number' ? `${team2Value.toFixed(1)}${valueLabel}` : team2Value || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{ background: modernRedGradient }}>
          <i className="fas fa-clock text-white text-2xl"></i>
        </div>
        <h3 className="text-3xl font-bold mb-2" 
            style={{ 
              background: modernRedGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Situational Analysis
        </h3>
        <p className="text-gray-600">Performance in critical game situations</p>
      </div>

      {/* Down and Distance */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800">Down & Distance Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SituationCard
            title="Standard Downs"
            icon="fas fa-play-circle"
            description="1st & 2nd down success rate"
            team1Value={(team1Stats?.offense?.standardDowns?.successRate || 0) * 100}
            team2Value={(team2Stats?.offense?.standardDowns?.successRate || 0) * 100}
            valueLabel="%"
          />
          
          <SituationCard
            title="Passing Downs"
            icon="fas fa-hand-paper"
            description="3rd & 4th down conversion rate"
            team1Value={(team1Stats?.offense?.passingDowns?.successRate || 0) * 100}
            team2Value={(team2Stats?.offense?.passingDowns?.successRate || 0) * 100}
            valueLabel="%"
          />
        </div>
      </div>

      {/* Red Zone Performance */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800">Scoring Efficiency</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SituationCard
            title="Red Zone Efficiency"
            icon="fas fa-bullseye"
            description="Points per red zone opportunity"
            team1Value={team1Stats?.offense?.pointsPerOpportunity || 0}
            team2Value={team2Stats?.offense?.pointsPerOpportunity || 0}
            valueLabel=" pts"
          />
          
          <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 p-6">
            <div className="text-center mb-4">
              <i className="fas fa-target text-3xl mb-2 gradient-text"></i>
              <h4 className="font-bold text-gray-800">Scoring Zones</h4>
              <p className="text-sm text-gray-600 mt-1">Expected points by field position</p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-red-100 p-3 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Red Zone (0-20)</span>
                  <span className="font-bold">6.0+ pts expected</span>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Scoring Zone (20-40)</span>
                  <span className="font-bold">3.0+ pts expected</span>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Field Goal Range (40-60)</span>
                  <span className="font-bold">1.5+ pts expected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clutch Performance */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-center text-gray-800">Performance Characteristics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Team 1 Characteristics */}
          <div className="text-center p-6 bg-white/30 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {team1?.logos?.[0] ? (
                <img src={team1.logos[0]} alt={team1.school} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl"
                     style={{ background: modernRedGradient }}>
                  {team1?.school?.[0]}
                </div>
              )}
            </div>
            <h5 className="font-bold text-lg mb-4" style={{ color: getTeamColor(team1) }}>
              {team1.school}
            </h5>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Standard Downs:</span>
                <span className="font-bold">{((team1Stats?.offense?.standardDowns?.successRate || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Passing Downs:</span>
                <span className="font-bold">{((team1Stats?.offense?.passingDowns?.successRate || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Red Zone:</span>
                <span className="font-bold">{(team1Stats?.offense?.pointsPerOpportunity || 0).toFixed(1)} pts</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <span className="text-xs font-medium">
                  {(team1Stats?.offense?.standardDowns?.successRate || 0) > (team1Stats?.offense?.passingDowns?.successRate || 0) ? 
                    'Early Down Dependent' : 'Clutch Performer'}
                </span>
              </div>
            </div>
          </div>

          {/* Team 2 Characteristics */}
          <div className="text-center p-6 bg-white/30 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {team2?.logos?.[0] ? (
                <img src={team2.logos[0]} alt={team2.school} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl"
                     style={{ background: modernRedGradient }}>
                  {team2?.school?.[0]}
                </div>
              )}
            </div>
            <h5 className="font-bold text-lg mb-4" style={{ color: getTeamColor(team2) }}>
              {team2.school}
            </h5>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Standard Downs:</span>
                <span className="font-bold">{((team2Stats?.offense?.standardDowns?.successRate || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Passing Downs:</span>
                <span className="font-bold">{((team2Stats?.offense?.passingDowns?.successRate || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Red Zone:</span>
                <span className="font-bold">{(team2Stats?.offense?.pointsPerOpportunity || 0).toFixed(1)} pts</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <span className="text-xs font-medium">
                  {(team2Stats?.offense?.standardDowns?.successRate || 0) > (team2Stats?.offense?.passingDowns?.successRate || 0) ? 
                    'Early Down Dependent' : 'Clutch Performer'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Situational Analysis */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
        <h4 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
          <i className="fas fa-search mr-3 gradient-text"></i>
          Detailed Situational Analysis
        </h4>
        <div className="bg-white/30 rounded-2xl p-6">
          <div className="text-green-600 leading-relaxed font-medium">
            {(() => {
              const analyzer = new ComparisonAnalyzer(team1, team2, team1Stats, team2Stats);
              const analysisText = analyzer.situationalAnalysis();
              
              // Replace team names with team name + logo
              let formattedText = analysisText;
              if (team1?.school && team1?.logos?.[0]) {
                const team1Regex = new RegExp(team1.school, 'g');
                formattedText = formattedText.replace(team1Regex, 
                  `<span class="inline-flex items-center gap-1">
                    <img src="${team1.logos[0]}" alt="${team1.school}" class="w-4 h-4 object-contain inline" />
                    ${team1.school}
                  </span>`
                );
              }
              if (team2?.school && team2?.logos?.[0]) {
                const team2Regex = new RegExp(team2.school, 'g');
                formattedText = formattedText.replace(team2Regex, 
                  `<span class="inline-flex items-center gap-1">
                    <img src="${team2.logos[0]}" alt="${team2.school}" class="w-4 h-4 object-contain inline" />
                    ${team2.school}
                  </span>`
                );
              }
              
              return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTab;
