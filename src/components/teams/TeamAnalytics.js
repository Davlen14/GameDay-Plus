import React, { useState, useEffect } from 'react';
import graphqlService from '../../services/graphqlService';

const TeamAnalytics = ({ team }) => {
  const [loading, setLoading] = useState(true);
  const [graphqlData, setGraphqlData] = useState({
    isAvailable: false,
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

  useEffect(() => {
    const loadGraphQLData = async () => {
      if (!team) {
        setLoading(false);
        return;
      }

      try {
        console.log(`🚀 [GraphQL Analytics] Loading data for ${team.school}...`);
        
        // Check GraphQL availability first
        const isGraphQLAvailable = await graphqlService.utils.isAvailable();
        console.log(`✅ [GraphQL Analytics] GraphQL Available: ${isGraphQLAvailable}`);
        
        if (!isGraphQLAvailable) {
          setGraphqlData(prev => ({ 
            ...prev, 
            isAvailable: false, 
            error: 'GraphQL service not available' 
          }));
          setLoading(false);
          return;
        }

        const dataPromises = [];
        const results = {};

        // 1. Enhanced Team Ratings
        dataPromises.push(
          graphqlService.getEnhancedTeamRatings(team.school, 2024)
            .then(data => { results.enhancedRatings = data; })
            .catch(err => { 
              console.warn(`⚠️ Enhanced ratings failed:`, err.message);
              results.enhancedRatings = null;
            })
        );

        // 2. Detailed Team Ratings
        dataPromises.push(
          graphqlService.getTeamDetailedRatings(team.school, 2024)
            .then(data => { results.detailedRatings = data; })
            .catch(err => { 
              console.warn(`⚠️ Detailed ratings failed:`, err.message);
              results.detailedRatings = null;
            })
        );

        // 3. Games by Team
        dataPromises.push(
          graphqlService.getGamesByTeam(team.school, 2024)
            .then(data => { results.games = data || []; })
            .catch(err => { 
              console.warn(`⚠️ Games by team failed:`, err.message);
              results.games = [];
            })
        );

        // 4. Comprehensive Prediction Data
        dataPromises.push(
          graphqlService.getComprehensivePredictionData(team.school, team.school, 2024)
            .then(data => { results.comprehensiveData = data; })
            .catch(err => { 
              console.warn(`⚠️ Comprehensive data failed:`, err.message);
              results.comprehensiveData = null;
            })
        );

        // 5. Conference Strength Analysis
        dataPromises.push(
          graphqlService.getConferenceStrengthAnalysis(team.conference, 2024)
            .then(data => { results.conferenceAnalysis = data; })
            .catch(err => { 
              console.warn(`⚠️ Conference analysis failed:`, err.message);
              results.conferenceAnalysis = null;
            })
        );

        // 6. Betting Lines Analysis (compare with another team for demo)
        dataPromises.push(
          graphqlService.getBettingLinesAnalysis(team.school, 'Alabama', 2024)
            .then(data => { results.bettingAnalysis = data; })
            .catch(err => { 
              console.warn(`⚠️ Betting analysis failed:`, err.message);
              results.bettingAnalysis = null;
            })
        );

        // 7. Weather Conditions
        dataPromises.push(
          graphqlService.getWeatherConditions(team.id, 1, 2024)
            .then(data => { results.weatherData = data; })
            .catch(err => { 
              console.warn(`⚠️ Weather data failed:`, err.message);
              results.weatherData = null;
            })
        );

        // Wait for all GraphQL requests to complete
        await Promise.all(dataPromises);

        console.log(`✅ [GraphQL Analytics] All data loaded for ${team.school}:`, results);

        setGraphqlData({
          isAvailable: true,
          enhancedRatings: results.enhancedRatings,
          detailedRatings: results.detailedRatings,
          games: results.games,
          comprehensiveData: results.comprehensiveData,
          conferenceAnalysis: results.conferenceAnalysis,
          bettingAnalysis: results.bettingAnalysis,
          weatherData: results.weatherData,
          error: null
        });

      } catch (error) {
        console.error(`❌ [GraphQL Analytics] Error loading data:`, error);
        setGraphqlData(prev => ({ 
          ...prev, 
          error: error.message 
        }));
      } finally {
        setLoading(false);
      }
    };

    loadGraphQLData();
  }, [team]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        background: 'linear-gradient(135deg, rgba(14, 25, 47, 0.95) 0%, rgba(25, 39, 66, 0.95) 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(79, 172, 254, 0.2)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#4FACFE', marginBottom: '20px' }} />
          <p style={{ color: 'white', fontSize: '1.2rem' }}>Loading GraphQL Analytics...</p>
        </div>
      </div>
    );
  }  if (!graphqlData.isAvailable) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        minHeight: '400px',
        background: 'linear-gradient(135deg, rgba(14, 25, 47, 0.95) 0%, rgba(25, 39, 66, 0.95) 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 107, 107, 0.3)',
        backdropFilter: 'blur(20px)',
      }}>
        <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#FF6B6B', marginBottom: '20px' }} />
        <h3 style={{ color: '#FF6B6B', fontSize: '1.5rem', marginBottom: '10px' }}>GraphQL Not Available</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
          {graphqlData.error || 'GraphQL service is currently unavailable. Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(14, 25, 47, 0.95) 0%, rgba(25, 39, 66, 0.95) 100%)',
      borderRadius: '20px',
      border: '1px solid rgba(79, 172, 254, 0.2)',
      backdropFilter: 'blur(20px)',
      minHeight: '800px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '10px',
          letterSpacing: '2px'
        }}>
          GraphQL Analytics
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>
          {team?.school} - Real-time data from GraphQL endpoints
        </p>
      </div>

      {/* Data Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Enhanced Ratings Section */}
        <div style={{
          background: 'rgba(79, 172, 254, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(79, 172, 254, 0.2)'
        }}>
          <h3 style={{ color: '#4FACFE', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-star" style={{ marginRight: '10px' }} />
            Enhanced Ratings
          </h3>
          {graphqlData.enhancedRatings ? (
            <div style={{ color: 'white' }}>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(graphqlData.enhancedRatings, null, 2)}
              </pre>
            </div>
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No enhanced ratings data available</p>
          )}
        </div>

        {/* Detailed Ratings Section */}
        <div style={{
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(255, 107, 107, 0.2)'
        }}>
          <h3 style={{ color: '#FF6B6B', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-chart-bar" style={{ marginRight: '10px' }} />
            Detailed Ratings
          </h3>
          {graphqlData.detailedRatings ? (
            <div style={{ color: 'white' }}>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(graphqlData.detailedRatings, null, 2)}
              </pre>
            </div>
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No detailed ratings data available</p>
          )}
        </div>

        {/* Games Data Section */}
        <div style={{
          background: 'rgba(74, 222, 128, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(74, 222, 128, 0.2)'
        }}>
          <h3 style={{ color: '#4ADE80', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-football-ball" style={{ marginRight: '10px' }} />
            Games Data ({graphqlData.games.length})
          </h3>
          {graphqlData.games.length > 0 ? (
            <div style={{ color: 'white' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Sample Game:</strong>
              </div>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(graphqlData.games[0], null, 2)}
              </pre>
            </div>
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No games data available</p>
          )}
        </div>

        {/* Comprehensive Data Section */}
        <div style={{
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(168, 85, 247, 0.2)'
        }}>
          <h3 style={{ color: '#A855F7', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-database" style={{ marginRight: '10px' }} />
            Comprehensive Data
          </h3>
          {graphqlData.comprehensiveData ? (
            <div style={{ color: 'white' }}>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(graphqlData.comprehensiveData, null, 2)}
              </pre>
            </div>
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No comprehensive data available</p>
          )}
        </div>

        {/* Conference Analysis Section */}
        <div style={{
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(251, 191, 36, 0.2)'
        }}>
          <h3 style={{ color: '#FBBF24', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-users" style={{ marginRight: '10px' }} />
            Conference Analysis
          </h3>
          {graphqlData.conferenceAnalysis ? (
            <div style={{ color: 'white' }}>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(graphqlData.conferenceAnalysis, null, 2)}
              </pre>
            </div>
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No conference analysis available</p>
          )}
        </div>

        {/* Betting Analysis Section */}
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <h3 style={{ color: '#22C55E', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-dollar-sign" style={{ marginRight: '10px' }} />
            Betting Analysis
          </h3>
          {graphqlData.bettingAnalysis ? (
            <div style={{ color: 'white' }}>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(graphqlData.bettingAnalysis, null, 2)}
              </pre>
            </div>
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No betting analysis available</p>
          )}
        </div>

        {/* Weather Data Section */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(56, 189, 248, 0.2)'
        }}>
          <h3 style={{ color: '#38BDF8', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-cloud-sun" style={{ marginRight: '10px' }} />
            Weather Data
          </h3>
          {graphqlData.weatherData ? (
            <div style={{ color: 'white' }}>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(graphqlData.weatherData, null, 2)}
              </pre>
            </div>
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No weather data available</p>
          )}
        </div>

        {/* Error Display Section */}
        {graphqlData.error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ color: '#EF4444', fontSize: '1.3rem', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-exclamation-triangle" style={{ marginRight: '10px' }} />
              Error Details
            </h3>
            <p style={{ color: '#EF4444' }}>{graphqlData.error}</p>
          </div>
        )}

      </div>

      {/* Summary Stats */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'rgba(79, 172, 254, 0.05)',
        borderRadius: '15px',
        border: '1px solid rgba(79, 172, 254, 0.1)'
      }}>
        <h3 style={{ color: '#4FACFE', fontSize: '1.3rem', marginBottom: '15px' }}>
          GraphQL Data Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ color: 'white' }}>
            <strong>Enhanced Ratings:</strong> {graphqlData.enhancedRatings ? '✅ Loaded' : '❌ Failed'}
          </div>
          <div style={{ color: 'white' }}>
            <strong>Detailed Ratings:</strong> {graphqlData.detailedRatings ? '✅ Loaded' : '❌ Failed'}
          </div>
          <div style={{ color: 'white' }}>
            <strong>Games Data:</strong> {graphqlData.games.length > 0 ? `✅ ${graphqlData.games.length} games` : '❌ No games'}
          </div>
          <div style={{ color: 'white' }}>
            <strong>Comprehensive Data:</strong> {graphqlData.comprehensiveData ? '✅ Loaded' : '❌ Failed'}
          </div>
          <div style={{ color: 'white' }}>
            <strong>Conference Analysis:</strong> {graphqlData.conferenceAnalysis ? '✅ Loaded' : '❌ Failed'}
          </div>
          <div style={{ color: 'white' }}>
            <strong>Betting Analysis:</strong> {graphqlData.bettingAnalysis ? '✅ Loaded' : '❌ Failed'}
          </div>
          <div style={{ color: 'white' }}>
            <strong>Weather Data:</strong> {graphqlData.weatherData ? '✅ Loaded' : '❌ Failed'}
          </div>
        </div>
      </div>
    </div>
  );
};;

export default TeamAnalytics;
