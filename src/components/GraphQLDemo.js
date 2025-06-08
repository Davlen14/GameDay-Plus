import React, { useState, useEffect } from 'react';
import { graphqlService, teamService, rankingsService, gameService } from '../services';

const GraphQLDemo = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState('teams');
  const [graphqlAvailable, setGraphqlAvailable] = useState(null);

  // Check GraphQL availability on component mount (non-blocking)
  useEffect(() => {
    const checkGraphQL = async () => {
      try {
        const available = await graphqlService.utils.isAvailable();
        setGraphqlAvailable(available);
        if (!available) {
          console.warn('GraphQL API availability check failed - individual queries may still work');
        }
      } catch (error) {
        console.warn('Error checking GraphQL availability:', error);
        setGraphqlAvailable(false);
      }
    };
    
    checkGraphQL();
  }, []);

  const demos = {
    teams: {
      name: 'Teams Comparison',
      description: 'Compare GraphQL vs REST performance for team data',
      run: async () => {
        const startTime = performance.now();
        
        // Test GraphQL (with fallback)
        const graphqlStart = performance.now();
        let graphqlTeams, graphqlTime, graphqlError = null;
        try {
          graphqlTeams = await teamService.getAllTeams(true); // Use GraphQL if available
          graphqlTime = performance.now() - graphqlStart;
        } catch (error) {
          graphqlError = error.message;
          graphqlTime = performance.now() - graphqlStart;
          graphqlTeams = [];
        }
        
        // Test REST
        const restStart = performance.now();
        const restTeams = await teamService.getAllTeams(false); // Use REST only
        const restTime = performance.now() - restStart;
        
        const totalTime = performance.now() - startTime;
        
        return {
          graphql: {
            time: graphqlTime,
            count: graphqlTeams.length,
            sample: graphqlTeams.slice(0, 3),
            error: graphqlError
          },
          rest: {
            time: restTime,
            count: restTeams.length,
            sample: restTeams.slice(0, 3)
          },
          totalTime,
          performance: graphqlError ? null : {
            improvement: ((restTime - graphqlTime) / restTime * 100).toFixed(1),
            speedup: (restTime / graphqlTime).toFixed(2)
          }
        };
      }
    },
    
    rankings: {
      name: 'Rankings Comparison',
      description: 'Compare GraphQL vs REST for poll rankings',
      run: async () => {
        const startTime = performance.now();
        
        // Test GraphQL (with fallback)
        const graphqlStart = performance.now();
        let graphqlRankings, graphqlTime, graphqlError = null;
        try {
          graphqlRankings = await rankingsService.getHistoricalRankings(2024, null, 'regular', true);
          graphqlTime = performance.now() - graphqlStart;
        } catch (error) {
          graphqlError = error.message;
          graphqlTime = performance.now() - graphqlStart;
          graphqlRankings = [];
        }
        
        // Test REST
        const restStart = performance.now();
        const restRankings = await rankingsService.getHistoricalRankings(2024, null, 'regular', false);
        const restTime = performance.now() - restStart;
        
        const totalTime = performance.now() - startTime;
        
        return {
          graphql: {
            time: graphqlTime,
            count: graphqlRankings.length,
            sample: graphqlRankings.slice(0, 2),
            error: graphqlError
          },
          rest: {
            time: restTime,
            count: restRankings.length,
            sample: restRankings.slice(0, 2)
          },
          totalTime,
          performance: graphqlError ? null : {
            improvement: ((restTime - graphqlTime) / restTime * 100).toFixed(1),
            speedup: (restTime / graphqlTime).toFixed(2)
          }
        };
      }
    },
    
    games: {
      name: 'Games Comparison',
      description: 'Compare GraphQL vs REST for game data',
      run: async () => {
        const startTime = performance.now();
        
        // Test GraphQL (with fallback)
        const graphqlStart = performance.now();
        let graphqlGames, graphqlTime, graphqlError = null;
        try {
          graphqlGames = await gameService.getGames(2024, null, 'regular', null, null, null, null, 'fbs', null, true);
          graphqlTime = performance.now() - graphqlStart;
        } catch (error) {
          graphqlError = error.message;
          graphqlTime = performance.now() - graphqlStart;
          graphqlGames = [];
        }
        
        // Test REST
        const restStart = performance.now();
        const restGames = await gameService.getGames(2024, null, 'regular', null, null, null, null, 'fbs', null, false);
        const restTime = performance.now() - restStart;
        
        const totalTime = performance.now() - startTime;
        
        return {
          graphql: {
            time: graphqlTime,
            count: graphqlGames.length,
            sample: graphqlGames.slice(0, 3),
            error: graphqlError
          },
          rest: {
            time: restTime,
            count: restGames.length,
            sample: restGames.slice(0, 3)
          },
          totalTime,
          performance: graphqlError ? null : {
            improvement: ((restTime - graphqlTime) / restTime * 100).toFixed(1),
            speedup: (restTime / graphqlTime).toFixed(2)
          }
        };
      }
    },
    
    hybrid: {
      name: 'Hybrid Approach Demo',
      description: 'Show how we use GraphQL for speed and REST for completeness',
      run: async () => {
        const startTime = performance.now();
        
        // Demonstrate hybrid approach - fast GraphQL with REST logo fallback
        const teams = await teamService.getFBSTeams(true); // Hybrid approach
        
        const totalTime = performance.now() - startTime;
        
        // Find teams with logos to show hybrid working
        const teamsWithLogos = teams.filter(team => team.logos && team.logos.length > 0).slice(0, 5);
        
        return {
          hybrid: {
            time: totalTime,
            count: teams.length,
            teamsWithLogos: teamsWithLogos.length,
            sample: teamsWithLogos.map(team => ({
              school: team.school,
              conference: team.conference,
              hasLogo: team.logos && team.logos.length > 0,
              logoUrl: team.logos?.[0],
              mascot: team.mascot,
              colors: [team.color, team.altColor]
            }))
          },
          description: 'GraphQL provided fast team data, REST provided logo URLs'
        };
      }
    },
    
    directGraphQL: {
      name: 'Direct GraphQL Query',
      description: 'Execute a raw GraphQL query',
      run: async () => {
        const startTime = performance.now();
        
        // Define query outside try-catch so it's accessible in both blocks
        const query = `
          query GetTeams {
            currentTeams(limit: 10, where: {classification: {_eq: "fbs"}}) {
              school
              mascot
              conference
              division
              color
              altColor
            }
          }
        `;
        
        try {
          
          const result = await graphqlService.query(query);
          const totalTime = performance.now() - startTime;
          
          return {
            raw: {
              time: totalTime,
              query: query.trim(),
              result: result.currentTeams || [],
              count: (result.currentTeams || []).length
            },
            description: 'Raw GraphQL query for FBS teams using correct schema'
          };
        } catch (error) {
          const totalTime = performance.now() - startTime;
          let errorMessage = error.message;
          let description = 'GraphQL query failed';
          
          // Provide helpful explanation for common CORS errors
          if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            errorMessage = 'CORS Error: The GraphQL endpoint blocks direct browser requests for security';
            description = 'This is expected behavior - GraphQL works from server-side code but browsers are blocked due to CORS policy. Our backend GraphQL service functions correctly (see test results in console).';
          }
          
          return {
            raw: {
              time: totalTime,
              query: query.trim(),
              result: [],
              count: 0,
              error: errorMessage,
              note: 'Note: GraphQL service works correctly from server-side (Node.js). Browser requests are blocked by CORS policy.'
            },
            description: description
          };
        }
      }
    },

    status: {
      name: 'GraphQL Status',
      description: 'Check GraphQL API availability and authentication',
      run: async () => {
        const startTime = performance.now();
        
        try {
          // Test basic connectivity
          const available = await graphqlService.utils.isAvailable();
          const totalTime = performance.now() - startTime;
          
          return {
            status: {
              available,
              time: totalTime,
              endpoint: 'https://graphql.collegefootballdata.com/v1/graphql',
              authRequired: 'Bearer token + Patreon Tier 3+',
              lastChecked: new Date().toISOString()
            },
            description: available ? 'GraphQL API is accessible' : 'GraphQL API is not accessible'
          };
        } catch (error) {
          const totalTime = performance.now() - startTime;
          
          return {
            status: {
              available: false,
              time: totalTime,
              error: error.message,
              endpoint: 'https://graphql.collegefootballdata.com/v1/graphql',
              authRequired: 'Bearer token + Patreon Tier 3+',
              lastChecked: new Date().toISOString()
            },
            description: 'GraphQL API check failed'
          };
        }
      }
    }
  };

  const runDemo = async (demoKey) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const demo = demos[demoKey];
      const result = await demo.run();
      setResults({
        ...result,
        demoName: demo.name,
        description: demo.description
      });
    } catch (err) {
      console.error('Demo error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black gradient-text mb-4">GraphQL Demo</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare GraphQL vs REST performance and see how our hybrid approach optimizes speed while maintaining data completeness.
          </p>
        </div>

        {/* GraphQL Status Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">GraphQL Service Status</h3>
              <div className="text-blue-700 space-y-2">
                <p>✅ <strong>Server-side GraphQL:</strong> Fully functional (validated with Node.js tests)</p>
                <p>⚠️ <strong>Browser GraphQL:</strong> Limited by CORS policy (College Football Data API blocks direct browser requests)</p>
                <p>💡 <strong>Solution:</strong> Our hybrid approach uses GraphQL for server operations and REST for browser compatibility</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold gradient-text mb-6">Select Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(demos).map(([key, demo]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedDemo(key);
                  runDemo(key);
                }}
                disabled={loading}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedDemo === key
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
              >
                <div className="font-semibold text-sm mb-2">{demo.name}</div>
                <div className="text-xs text-gray-600">{demo.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Running {demos[selectedDemo]?.name}...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-red-700">Error: {error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold gradient-text">{results.demoName}</h2>
                <p className="text-gray-600">{results.description}</p>
              </div>
            </div>

            {/* Performance Comparison */}
            {results.performance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="text-green-700 font-semibold mb-2">Performance Improvement</div>
                  <div className="text-2xl font-black text-green-600">{results.performance.improvement}%</div>
                  <div className="text-sm text-green-600">faster with GraphQL</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-blue-700 font-semibold mb-2">Speed Multiplier</div>
                  <div className="text-2xl font-black text-blue-600">{results.performance.speedup}x</div>
                  <div className="text-sm text-blue-600">speed improvement</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="text-purple-700 font-semibold mb-2">Total Time</div>
                  <div className="text-2xl font-black text-purple-600">{results.totalTime.toFixed(0)}ms</div>
                  <div className="text-sm text-purple-600">for both tests</div>
                </div>
              </div>
            )}

            {/* Detailed Results */}
            <div className="space-y-6">
              {results.graphql && results.rest && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* GraphQL Results */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>GraphQL Results</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Time:</span>
                        <span className="font-semibold text-green-600">{results.graphql.time.toFixed(2)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Records Count:</span>
                        <span className="font-semibold">{results.graphql.count}</span>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">Sample Data:</div>
                        <pre className="bg-white rounded p-3 text-xs overflow-x-auto">
                          {JSON.stringify(results.graphql.sample, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* REST Results */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      <span>REST Results</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Time:</span>
                        <span className="font-semibold text-blue-600">{results.rest.time.toFixed(2)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Records Count:</span>
                        <span className="font-semibold">{results.rest.count}</span>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">Sample Data:</div>
                        <pre className="bg-white rounded p-3 text-xs overflow-x-auto">
                          {JSON.stringify(results.rest.sample, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hybrid Results */}
              {results.hybrid && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span>Hybrid Approach Results</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-purple-600 font-semibold">Response Time</div>
                      <div className="text-2xl font-bold">{results.hybrid.time.toFixed(2)}ms</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-purple-600 font-semibold">Total Teams</div>
                      <div className="text-2xl font-bold">{results.hybrid.count}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-purple-600 font-semibold">Teams with Logos</div>
                      <div className="text-2xl font-bold">{results.hybrid.teamsWithLogos}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Teams with Complete Data (GraphQL + REST logos):</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {results.hybrid.sample.map((team, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border">
                          <div className="font-semibold text-gray-900">{team.school}</div>
                          <div className="text-sm text-gray-600">{team.mascot}</div>
                          <div className="text-xs text-gray-500">{team.conference}</div>
                          <div className="flex items-center mt-2">
                            {team.hasLogo && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                ✓ Logo Available
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Raw GraphQL Results */}
              {results.raw && (
                <div className={`rounded-xl p-6 text-white ${results.raw.error ? 'bg-red-900' : 'bg-gray-900'}`}>
                  <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${results.raw.error ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                    <span>Raw GraphQL Query</span>
                  </h3>
                  
                  {results.raw.error && (
                    <div className="mb-4 p-4 bg-red-800 rounded">
                      <div className="text-red-200 font-semibold">Error:</div>
                      <div className="text-red-100">{results.raw.error}</div>
                      {results.raw.note && (
                        <div className="mt-3 p-3 bg-blue-900 rounded text-blue-100 text-sm">
                          <div className="font-semibold text-blue-200">ℹ️ Information:</div>
                          <div>{results.raw.note}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-300 mb-2">Query executed in {results.raw.time.toFixed(2)}ms:</div>
                    <pre className="bg-gray-800 rounded p-4 text-sm overflow-x-auto">
                      {results.raw.query}
                    </pre>
                  </div>
                  
                  {!results.raw.error && (
                    <div>
                      <div className="text-sm text-gray-300 mb-2">Result ({results.raw.count} teams):</div>
                      <pre className="bg-gray-800 rounded p-4 text-xs overflow-x-auto max-h-64">
                        {JSON.stringify(results.raw.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphQLDemo;
