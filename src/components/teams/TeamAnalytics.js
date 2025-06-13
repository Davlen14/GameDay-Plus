import React, { useState } from 'react';
import graphqlService from '../../services/graphqlService';

const TeamAnalytics = ({ team }) => {
  const [graphqlData, setGraphqlData] = useState({
    isAvailable: null,
    enhancedRatings: null,
    detailedRatings: null,
    games: [],
    comprehensiveData: null,
    headToHeadHistory: null,
    weatherData: null,
    bettingAnalysis: null,
    conferenceAnalysis: null,
    liveGameData: null,
    error: null
  });

  const [loadingStates, setLoadingStates] = useState({
    enhancedRatings: false,
    detailedRatings: false,
    games: false,
    comprehensiveData: false,
    conferenceAnalysis: false,
    bettingAnalysis: false,
    weatherData: false
  });

  // Test individual GraphQL endpoints
  const testEndpoint = async (endpointName) => {
    if (!team) return;

    setLoadingStates(prev => ({ ...prev, [endpointName]: true }));

    try {
      console.log(`🚀 Testing ${endpointName} for ${team.school}...`);
      
      // Check GraphQL availability first if not already checked
      if (graphqlData.isAvailable === null) {
        const isGraphQLAvailable = await graphqlService.utils.isAvailable();
        setGraphqlData(prev => ({ ...prev, isAvailable: isGraphQLAvailable }));
        
        if (!isGraphQLAvailable) {
          setGraphqlData(prev => ({ 
            ...prev, 
            error: 'GraphQL service not available' 
          }));
          setLoadingStates(prev => ({ ...prev, [endpointName]: false }));
          return;
        }
      }

      let result = null;

      switch (endpointName) {
        case 'enhancedRatings':
          result = await graphqlService.getEnhancedTeamRatings(team.school, 2024);
          break;
        case 'detailedRatings':
          result = await graphqlService.getTeamDetailedRatings(team.school, 2024);
          break;
        case 'games':
          result = await graphqlService.getGamesByTeam(team.school, 2024);
          break;
        case 'comprehensiveData':
          result = await graphqlService.getComprehensivePredictionData(team.school, team.school, 2024);
          break;
        case 'conferenceAnalysis':
          result = await graphqlService.getConferenceStrengthAnalysis(team.conference, 2024);
          break;
        case 'bettingAnalysis':
          result = await graphqlService.getBettingLinesAnalysis(team.school, 'Alabama', 2024);
          break;
        case 'weatherData':
          result = await graphqlService.getWeatherConditions(team.id, 1, 2024);
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpointName}`);
      }

      setGraphqlData(prev => ({
        ...prev,
        [endpointName]: result,
        error: null
      }));

      console.log(`✅ ${endpointName} loaded successfully:`, result);

    } catch (error) {
      console.error(`❌ ${endpointName} failed:`, error);
      setGraphqlData(prev => ({
        ...prev,
        [endpointName]: null,
        error: `${endpointName}: ${error.message}`
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [endpointName]: false }));
    }
  };

  const glassyStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const containerStyle = {
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    minHeight: '800px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '10px',
          letterSpacing: '2px'
        }}>
          GraphQL Analytics
        </h2>
        <p style={{ color: 'rgba(71, 85, 105, 0.8)', fontSize: '1.1rem' }}>
          {team?.school} - Test individual endpoints to verify functionality
        </p>
      </div>

      {/* Data Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* Enhanced Ratings Section */}
        <div style={{
          ...glassyStyle,
          background: 'rgba(79, 172, 254, 0.05)',
          border: '1px solid rgba(79, 172, 254, 0.2)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#4F46E5', fontSize: '1.3rem', display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-star" style={{ marginRight: '10px' }} />
              Enhanced Ratings
            </h3>
            <button
              onClick={() => testEndpoint('enhancedRatings')}
              disabled={loadingStates.enhancedRatings}
              style={{
                padding: '8px 16px',
                backgroundColor: loadingStates.enhancedRatings ? '#9CA3AF' : '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingStates.enhancedRatings ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {loadingStates.enhancedRatings ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-play" />
                  Test
                </>
              )}
            </button>
          </div>
          {graphqlData.enhancedRatings ? (
            <div style={{ color: '#374151' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.5)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px',
                border: '1px solid rgba(79, 172, 254, 0.1)'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(graphqlData.enhancedRatings, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(71, 85, 105, 0.6)', fontStyle: 'italic' }}>
              Click "Test" to load enhanced ratings data
            </p>
          )}
        </div>

        {/* Detailed Ratings Section */}
        <div style={{
          ...glassyStyle,
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#DC2626', fontSize: '1.3rem', display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-chart-bar" style={{ marginRight: '10px' }} />
              Detailed Ratings
            </h3>
            <button
              onClick={() => testEndpoint('detailedRatings')}
              disabled={loadingStates.detailedRatings}
              style={{
                padding: '8px 16px',
                backgroundColor: loadingStates.detailedRatings ? '#9CA3AF' : '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingStates.detailedRatings ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {loadingStates.detailedRatings ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-play" />
                  Test
                </>
              )}
            </button>
          </div>
          {graphqlData.detailedRatings ? (
            <div style={{ color: '#374151' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.5)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px',
                border: '1px solid rgba(239, 68, 68, 0.1)'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(graphqlData.detailedRatings, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(71, 85, 105, 0.6)', fontStyle: 'italic' }}>
              Click "Test" to load detailed ratings data
            </p>
          )}
        </div>

        {/* Games Data Section */}
        <div style={{
          ...glassyStyle,
          background: 'rgba(34, 197, 94, 0.05)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#059669', fontSize: '1.3rem', display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-football-ball" style={{ marginRight: '10px' }} />
              Games Data ({Array.isArray(graphqlData.games) ? graphqlData.games.length : 0})
            </h3>
            <button
              onClick={() => testEndpoint('games')}
              disabled={loadingStates.games}
              style={{
                padding: '8px 16px',
                backgroundColor: loadingStates.games ? '#9CA3AF' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingStates.games ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {loadingStates.games ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-play" />
                  Test
                </>
              )}
            </button>
          </div>
          {Array.isArray(graphqlData.games) && graphqlData.games.length > 0 ? (
            <div style={{ color: '#374151' }}>
              <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                Sample Game:
              </div>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.5)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px',
                border: '1px solid rgba(34, 197, 94, 0.1)'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(graphqlData.games[0], null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(71, 85, 105, 0.6)', fontStyle: 'italic' }}>
              Click "Test" to load games data
            </p>
          )}
        </div>

        {/* Comprehensive Data Section */}
        <div style={{
          ...glassyStyle,
          background: 'rgba(168, 85, 247, 0.05)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#7C3AED', fontSize: '1.3rem', display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-database" style={{ marginRight: '10px' }} />
              Comprehensive Data
            </h3>
            <button
              onClick={() => testEndpoint('comprehensiveData')}
              disabled={loadingStates.comprehensiveData}
              style={{
                padding: '8px 16px',
                backgroundColor: loadingStates.comprehensiveData ? '#9CA3AF' : '#7C3AED',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingStates.comprehensiveData ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {loadingStates.comprehensiveData ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-play" />
                  Test
                </>
              )}
            </button>
          </div>
          {graphqlData.comprehensiveData ? (
            <div style={{ color: '#374151' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.5)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px',
                border: '1px solid rgba(168, 85, 247, 0.1)'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(graphqlData.comprehensiveData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(71, 85, 105, 0.6)', fontStyle: 'italic' }}>
              Click "Test" to load comprehensive data
            </p>
          )}
        </div>

        {/* Conference Analysis Section */}
        <div style={{
          ...glassyStyle,
          background: 'rgba(251, 191, 36, 0.05)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#D97706', fontSize: '1.3rem', display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-users" style={{ marginRight: '10px' }} />
              Conference Analysis
            </h3>
            <button
              onClick={() => testEndpoint('conferenceAnalysis')}
              disabled={loadingStates.conferenceAnalysis}
              style={{
                padding: '8px 16px',
                backgroundColor: loadingStates.conferenceAnalysis ? '#9CA3AF' : '#D97706',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingStates.conferenceAnalysis ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {loadingStates.conferenceAnalysis ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-play" />
                  Test
                </>
              )}
            </button>
          </div>
          {graphqlData.conferenceAnalysis ? (
            <div style={{ color: '#374151' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.5)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px',
                border: '1px solid rgba(251, 191, 36, 0.1)'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(graphqlData.conferenceAnalysis, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(71, 85, 105, 0.6)', fontStyle: 'italic' }}>
              Click "Test" to load conference analysis
            </p>
          )}
        </div>

        {/* Betting Analysis Section */}
        <div style={{
          ...glassyStyle,
          background: 'rgba(34, 197, 94, 0.05)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#16A34A', fontSize: '1.3rem', display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-dollar-sign" style={{ marginRight: '10px' }} />
              Betting Analysis
            </h3>
            <button
              onClick={() => testEndpoint('bettingAnalysis')}
              disabled={loadingStates.bettingAnalysis}
              style={{
                padding: '8px 16px',
                backgroundColor: loadingStates.bettingAnalysis ? '#9CA3AF' : '#16A34A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingStates.bettingAnalysis ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {loadingStates.bettingAnalysis ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-play" />
                  Test
                </>
              )}
            </button>
          </div>
          {graphqlData.bettingAnalysis ? (
            <div style={{ color: '#374151' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.5)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px',
                border: '1px solid rgba(34, 197, 94, 0.1)'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(graphqlData.bettingAnalysis, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(71, 85, 105, 0.6)', fontStyle: 'italic' }}>
              Click "Test" to load betting analysis
            </p>
          )}
        </div>

        {/* Weather Data Section */}
        <div style={{
          ...glassyStyle,
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#0284C7', fontSize: '1.3rem', display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-cloud-sun" style={{ marginRight: '10px' }} />
              Weather Data
            </h3>
            <button
              onClick={() => testEndpoint('weatherData')}
              disabled={loadingStates.weatherData}
              style={{
                padding: '8px 16px',
                backgroundColor: loadingStates.weatherData ? '#9CA3AF' : '#0284C7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingStates.weatherData ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {loadingStates.weatherData ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-play" />
                  Test
                </>
              )}
            </button>
          </div>
          {graphqlData.weatherData ? (
            <div style={{ color: '#374151' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.5)', 
                padding: '15px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px',
                border: '1px solid rgba(56, 189, 248, 0.1)'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(graphqlData.weatherData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(71, 85, 105, 0.6)', fontStyle: 'italic' }}>
              Click "Test" to load weather data
            </p>
          )}
        </div>

      </div>

      {/* Error Display Section */}
      {graphqlData.error && (
        <div style={{
          ...glassyStyle,
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#DC2626', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '10px' }} />
            Latest Error
          </h3>
          <p style={{ color: '#DC2626', margin: 0 }}>{graphqlData.error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{
        ...glassyStyle,
        background: 'rgba(79, 172, 254, 0.05)',
        border: '1px solid rgba(79, 172, 254, 0.2)',
        padding: '20px',
        marginTop: '30px'
      }}>
        <h3 style={{ color: '#4F46E5', fontSize: '1.3rem', marginBottom: '15px' }}>
          GraphQL Test Results Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ color: '#374151', padding: '10px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '8px' }}>
            <strong>Enhanced Ratings:</strong> {graphqlData.enhancedRatings ? '✅ Loaded' : '⏸️ Not Tested'}
          </div>
          <div style={{ color: '#374151', padding: '10px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '8px' }}>
            <strong>Detailed Ratings:</strong> {graphqlData.detailedRatings ? '✅ Loaded' : '⏸️ Not Tested'}
          </div>
          <div style={{ color: '#374151', padding: '10px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '8px' }}>
            <strong>Games Data:</strong> {Array.isArray(graphqlData.games) && graphqlData.games.length > 0 ? `✅ ${graphqlData.games.length} games` : '⏸️ Not Tested'}
          </div>
          <div style={{ color: '#374151', padding: '10px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '8px' }}>
            <strong>Comprehensive Data:</strong> {graphqlData.comprehensiveData ? '✅ Loaded' : '⏸️ Not Tested'}
          </div>
          <div style={{ color: '#374151', padding: '10px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '8px' }}>
            <strong>Conference Analysis:</strong> {graphqlData.conferenceAnalysis ? '✅ Loaded' : '⏸️ Not Tested'}
          </div>
          <div style={{ color: '#374151', padding: '10px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '8px' }}>
            <strong>Betting Analysis:</strong> {graphqlData.bettingAnalysis ? '✅ Loaded' : '⏸️ Not Tested'}
          </div>
          <div style={{ color: '#374151', padding: '10px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '8px' }}>
            <strong>Weather Data:</strong> {graphqlData.weatherData ? '✅ Loaded' : '⏸️ Not Tested'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;