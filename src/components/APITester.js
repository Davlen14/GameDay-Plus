import React, { useState, useEffect } from 'react';
import { 
  teamService, 
  gameService, 
  bettingService, 
  rankingsService, 
  newsService, 
  playerService,
  driveService,
  playService,
  miscService 
} from '../services';

const APITester = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runAPITests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get all teams
      console.log('Testing: Get all teams...');
      const teams = await teamService.getAllTeams();
      results.teams = { success: true, count: teams?.length || 0, sample: teams?.slice(0, 3) };
    } catch (error) {
      results.teams = { success: false, error: error.message };
    }

    try {
      // Test 2: Get conferences
      console.log('Testing: Get conferences...');
      const conferences = await miscService.getConferences();
      results.conferences = { success: true, count: conferences?.length || 0, sample: conferences?.slice(0, 3) };
    } catch (error) {
      results.conferences = { success: false, error: error.message };
    }

    try {
      // Test 3: Get current games
      console.log('Testing: Get current games...');
      const games = await gameService.getGames();
      results.games = { success: true, count: games?.length || 0, sample: games?.slice(0, 3) };
    } catch (error) {
      results.games = { success: false, error: error.message };
    }

    try {
      // Test 4: Get rankings
      console.log('Testing: Get rankings...');
      const rankings = await rankingsService.getHistoricalRankings();
      results.rankings = { success: true, count: rankings?.length || 0, sample: rankings?.slice(0, 3) };
    } catch (error) {
      results.rankings = { success: false, error: error.message };
    }

    try {
      // Test 5: Get news
      console.log('Testing: Get news...');
      const news = await newsService.getLatestNews(5);
      results.news = { success: true, count: news?.length || 0, sample: news?.slice(0, 2) };
    } catch (error) {
      results.news = { success: false, error: error.message };
    }

    try {
      // Test 6: Get betting lines (try with minimal parameters)
      console.log('Testing: Get betting lines...');
      const currentYear = new Date().getFullYear();
      // Try with just year and week to see if endpoint is accessible
      const lines = await bettingService.getBettingLines(null, currentYear - 1, 1, 'regular');
      results.betting = { success: true, count: lines?.length || 0, sample: lines?.slice(0, 3) };
    } catch (error) {
      console.error('Betting API test failed:', error);
      results.betting = { 
        success: false, 
        error: error.message,
        details: `Status: ${error.status || 'Unknown'}`
      };
    }

    try {
      // Test 7: Get play types
      console.log('Testing: Get play types...');
      const playTypes = await playService.getPlayTypes();
      results.playTypes = { success: true, count: playTypes?.length || 0, sample: playTypes?.slice(0, 3) };
    } catch (error) {
      results.playTypes = { success: false, error: error.message };
    }

    try {
      // Test 8: Search players
      console.log('Testing: Search players...');
      const players = await playerService.searchPlayers('Williams');
      results.players = { success: true, count: players?.length || 0, sample: players?.slice(0, 3) };
    } catch (error) {
      results.players = { success: false, error: error.message };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runAPITests();
  }, []);

  const TestResult = ({ title, result }) => (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {result.success ? (
        <div className="text-green-400">
          ✅ Success - {result.count} items found
          {result.sample && result.sample.length > 0 && (
            <div className="mt-2 text-sm text-gray-300">
              <details>
                <summary className="cursor-pointer">Sample data:</summary>
                <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-auto">
                  {JSON.stringify(result.sample, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      ) : (
        <div className="text-red-400">
          ❌ Failed - {result.error}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">API Service Tests</h1>
        
        <div className="text-center mb-8">
          <button
            onClick={runAPITests}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run API Tests'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(testResults).map(key => (
            <TestResult
              key={key}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              result={testResults[key]}
            />
          ))}
        </div>

        {loading && (
          <div className="text-center mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="mt-2 text-gray-400">Testing API endpoints...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITester;
