import React, { useEffect, useState } from 'react';
import { playService } from '../../services/playService';
import { driveService } from '../../services/driveService';
import FootballField from './FootballField';

const GamePlayByPlay = ({ game, awayTeam, homeTeam }) => {
  const [plays, setPlays] = useState(null);
  const [drives, setDrives] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get team data with fallbacks to Whitmer
  const getHomeTeamData = () => {
    if (homeTeam) {
      return {
        name: homeTeam.school || 'WHITMER',
        logo: homeTeam.logos?.[0] || '/photos/Whitmer.png',
        primaryColor: homeTeam.color || '#cc001c',
        secondaryColor: homeTeam.alternateColor || '#a10014'
      };
    }
    return {
      name: 'WHITMER',
      logo: '/photos/Whitmer.png',
      primaryColor: '#cc001c',
      secondaryColor: '#a10014'
    };
  };

  const getAwayTeamData = () => {
    if (awayTeam) {
      return {
        name: awayTeam.school || 'OPPONENT',
        logo: awayTeam.logos?.[0] || '/photos/ncaaf.png',
        primaryColor: awayTeam.color || '#3b82f6',
        secondaryColor: awayTeam.alternateColor || '#1e40af'
      };
    }
    return {
      name: 'OPPONENT',
      logo: '/photos/ncaaf.png',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af'
    };
  };

  const homeData = getHomeTeamData();
  const awayData = getAwayTeamData();

  // Debug function to load plays and drives
  const loadPlayByPlayData = async () => {
    if (!game) {
      setError('No game data provided');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading play-by-play data for game:', game);
      
      // Try multiple approaches to get the data
      const results = {
        plays: null,
        drives: null,
        errors: []
      };

      // Method 1: Try with game ID if available
      if (game.id) {
        try {
          console.log('Attempting to load live plays with game ID:', game.id);
          const livePlays = await playService.getLivePlays(game.id);
          results.plays = livePlays;
          console.log('Live plays loaded:', livePlays);
        } catch (err) {
          console.error('Live plays failed:', err);
          results.errors.push(`Live plays error: ${err.message}`);
        }
      }

      // Method 2: Try with year/week/team
      if (!results.plays && game.season && game.week) {
        try {
          console.log('Attempting to load plays with year/week:', game.season, game.week);
          const playsData = await playService.getPlays(
            game.season, 
            game.week,
            homeData.name,
            null,
            null,
            null,
            null,
            null,
            null,
            game.season_type || 'regular'
          );
          results.plays = playsData;
          console.log('Plays loaded:', playsData);
        } catch (err) {
          console.error('Plays by year/week failed:', err);
          results.errors.push(`Plays by year/week error: ${err.message}`);
        }
      }

      // Load drives
      if (game.season && game.week) {
        try {
          console.log('Attempting to load drives:', game.season, game.week);
          const drivesData = await driveService.getDrives(
            game.season,
            game.season_type || 'regular',
            game.week,
            homeData.name
          );
          results.drives = drivesData;
          console.log('Drives loaded:', drivesData);
        } catch (err) {
          console.error('Drives failed:', err);
          results.errors.push(`Drives error: ${err.message}`);
        }
      }

      setPlays(results.plays);
      setDrives(results.drives);
      
      if (results.errors.length > 0 && !results.plays && !results.drives) {
        setError(results.errors.join('\n'));
      }
      
    } catch (error) {
      console.error('Error loading play-by-play data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Football Field Component */}
      <FootballField homeTeam={homeTeam} awayTeam={awayTeam} />

      {/* Debug Section */}
      <div className="p-8 bg-gray-100">
        <div className="max-w-1200px mx-auto">
          <h2 className="text-2xl font-bold mb-4">Play-by-Play Debug</h2>
          
          {/* Game Info */}
          <div className="mb-4 p-4 bg-white rounded shadow">
            <h3 className="font-bold mb-2">Game Information:</h3>
            <pre className="text-sm overflow-auto bg-gray-50 p-2 rounded">
              {JSON.stringify(game, null, 2)}
            </pre>
          </div>

          {/* Load Button */}
          <div className="mb-4">
            <button
              onClick={loadPlayByPlayData}
              disabled={loading}
              className={`px-6 py-3 rounded font-bold text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {loading ? 'Loading...' : 'Load Play-by-Play Data'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <h3 className="font-bold mb-2">Error:</h3>
              <pre className="whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {/* Plays Display */}
          {plays && (
            <div className="mb-4 p-4 bg-white rounded shadow">
              <h3 className="font-bold mb-2">Plays Data ({plays.length || 0} plays):</h3>
              <pre className="text-sm overflow-auto bg-gray-50 p-2 rounded max-h-96">
                {JSON.stringify(plays, null, 2)}
              </pre>
            </div>
          )}

          {/* Drives Display */}
          {drives && (
            <div className="mb-4 p-4 bg-white rounded shadow">
              <h3 className="font-bold mb-2">Drives Data ({drives.length || 0} drives):</h3>
              <pre className="text-sm overflow-auto bg-gray-50 p-2 rounded max-h-96">
                {JSON.stringify(drives, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlayByPlay;