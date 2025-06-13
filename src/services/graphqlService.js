// Enhanced GraphQL service - WORKS WITH YOUR CREATE REACT APP SETUP
import { fetchCollegeFootballData } from './core';

// Smart endpoint selection based on environment
const GRAPHQL_ENDPOINT = process.env.NODE_ENV === 'production' 
  ? '/api/graphql'  // Use YOUR existing Vercel Function in production
  : 'https://graphql.collegefootballdata.com/v1/graphql'; // Direct in development

// KEEP your existing API key setup
const COLLEGE_FOOTBALL_API_KEY = process.env.REACT_APP_COLLEGE_FOOTBALL_API_KEY || 'p5M3+9PK7Kt1CIMox0hgi7zgyWKCeO86buPF+tEH/zPCExymKp+v+IBrl7rKucSq';

// Direct GraphQL API interaction - RESPECTS your existing setup
const fetchData = async (query, variables = {}) => {
  console.log('🚀 [API DEBUG] Attempting GraphQL request to:', GRAPHQL_ENDPOINT);
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: process.env.NODE_ENV === 'production' 
        ? {
            // Production: Let YOUR Vercel Function handle auth
            "Content-Type": "application/json",
            'Accept': 'application/json',
          }
        : {
            // Development: Use direct API with your existing auth
            'Authorization': `Bearer ${COLLEGE_FOOTBALL_API_KEY}`,
            "Content-Type": "application/json",
            'Accept': 'application/json',
          },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      console.log('❌ [API DEBUG] GraphQL request failed with status:', response.status);
      if (response.status === 0 || response.status === 403 || response.status === 401) {
        throw new Error('CORS_ERROR');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (result.errors) {
      console.log('❌ [API DEBUG] GraphQL returned errors:', result.errors);
      throw new Error(result.errors.map((e) => e.message).join(", "));
    }
    
    console.log('✅ [API DEBUG] GraphQL request successful - data received');
    return result.data;
  } catch (error) {
    console.error("❌ [API DEBUG] GraphQL Fetch Error:", error.message);
    if (error.message.includes('CORS') || error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
      console.log('🔄 [API DEBUG] CORS/Network error detected - will fallback to REST API');
      throw new Error('CORS_ERROR');
    }
    throw error;
  }
};

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ====== ENHANCED PREDICTION-FOCUSED QUERIES ======

// Comprehensive prediction data in single query (GAME CHANGER!)
export const getComprehensivePredictionData = async (homeTeam, awayTeam, year = 2024) => {
  const query = `
    query ComprehensivePredictionData($homeTeam: String!, $awayTeam: String!, $year: smallint!) {
      # Home team recent games with advanced metrics
      homeGames: game(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $homeTeam}}, {awayTeam: {_eq: $homeTeam}}]},
            {season: {_eq: $year}},
            {status: {_eq: "completed"}}
          ]
        }
        orderBy: {week: DESC}
        limit: 10
      ) {
        id week homeTeam awayTeam homePoints awayPoints
        homeStartElo awayStartElo homeEndElo awayEndElo
        homePostgameWinProb awayPostgameWinProb
        excitementIndex
        neutralSite conferenceGame
        
        gameLines {
          provider spread overUnder homeMoneyline awayMoneyline
        }
        
        gameWeather {
          temperature windSpeed precipitation humidity weatherCondition
        }
      }
      
      # Away team recent games
      awayGames: game(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $awayTeam}}, {awayTeam: {_eq: $awayTeam}}]},
            {season: {_eq: $year}},
            {status: {_eq: "completed"}}
          ]
        }
        orderBy: {week: DESC}
        limit: 10
      ) {
        id week homeTeam awayTeam homePoints awayPoints
        homeStartElo awayStartElo homeEndElo awayEndElo
        homePostgameWinProb awayPostgameWinProb
        excitementIndex
        neutralSite conferenceGame
        
        gameLines {
          provider spread overUnder homeMoneyline awayMoneyline
        }
        
        gameWeather {
          temperature windSpeed precipitation humidity weatherCondition
        }
      }
      
      # Head-to-head history with betting context
      headToHead: game(
        where: {
          _and: [
            {season: {_gte: 2019}},
            {_or: [
              {_and: [{homeTeam: {_eq: $homeTeam}}, {awayTeam: {_eq: $awayTeam}}]},
              {_and: [{homeTeam: {_eq: $awayTeam}}, {awayTeam: {_eq: $homeTeam}}]}
            ]},
            {status: {_eq: "completed"}}
          ]
        }
        orderBy: {season: DESC}
      ) {
        season week homeTeam awayTeam homePoints awayPoints
        neutralSite excitementIndex
        gameLines { spread overUnder }
      }
      
      # Aggregated performance metrics
      homeAggregates: gameAggregate(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $homeTeam}}, {awayTeam: {_eq: $homeTeam}}]},
            {season: {_eq: $year}},
            {status: {_eq: "completed"}}
          ]
        }
      ) {
        aggregate {
          count
          avg {
            homePoints awayPoints
            homePostgameWinProb awayPostgameWinProb
            excitementIndex
            homeStartElo awayStartElo
          }
          max { homePoints awayPoints }
          min { homePoints awayPoints }
        }
      }
      
      awayAggregates: gameAggregate(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $awayTeam}}, {awayTeam: {_eq: $awayTeam}}]},
            {season: {_eq: $year}},
            {status: {_eq: "completed"}}
          ]
        }
      ) {
        aggregate {
          count
          avg {
            homePoints awayPoints
            homePostgameWinProb awayPostgameWinProb
            excitementIndex
            homeStartElo awayStartElo
          }
          max { homePoints awayPoints }
          min { homePoints awayPoints }
        }
      }
      
      # Team talent ratings
      homeTalent: teamTalent(where: {team: {_eq: $homeTeam}, year: {_eq: $year}}) {
        talent
      }
      
      awayTalent: teamTalent(where: {team: {_eq: $awayTeam}, year: {_eq: $year}}) {
        talent
      }
      
      # Recruiting data
      homeRecruiting: recruitingTeam(where: {team: {_eq: $homeTeam}, year: {_eq: $year}}) {
        rank points
      }
      
      awayRecruiting: recruitingTeam(where: {team: {_eq: $awayTeam}, year: {_eq: $year}}) {
        rank points
      }
    }
  `;
  
  const variables = { homeTeam, awayTeam, year };
  
  try {
    const data = await fetchData(query, variables);
    
    // Process and return structured data
    return {
      homeGames: data?.homeGames || [],
      awayGames: data?.awayGames || [],
      headToHead: data?.headToHead || [],
      homeAggregates: data?.homeAggregates?.aggregate || null,
      awayAggregates: data?.awayAggregates?.aggregate || null,
      homeTalent: data?.homeTalent?.[0]?.talent || null,
      awayTalent: data?.awayTalent?.[0]?.talent || null,
      homeRecruiting: data?.homeRecruiting?.[0] || null,
      awayRecruiting: data?.awayRecruiting?.[0] || null
    };
  } catch (error) {
    console.error("❌ Comprehensive Prediction Data GraphQL Error, falling back to REST:", error);
    
    // REST API fallback using core service
    try {
      console.log('🔄 [FALLBACK] Using REST API for comprehensive prediction data...');
      const [homeGames, awayGames, talentData, recruitingData] = await Promise.allSettled([
        fetchCollegeFootballData('/games', { year, team: homeTeam }),
        fetchCollegeFootballData('/games', { year, team: awayTeam }),
        fetchCollegeFootballData('/talent', { year }),
        fetchCollegeFootballData('/recruiting/teams', { year })
      ]);

      // Process the fallback data
      const homeGamesData = homeGames.status === 'fulfilled' ? 
        homeGames.value.filter(g => g.completed).slice(0, 10) : [];
      const awayGamesData = awayGames.status === 'fulfilled' ? 
        awayGames.value.filter(g => g.completed).slice(0, 10) : [];
      
      // Find head-to-head games
      const headToHeadData = homeGamesData.filter(g => 
        (g.home_team === homeTeam && g.away_team === awayTeam) ||
        (g.home_team === awayTeam && g.away_team === homeTeam)
      );
      
      const talent = talentData.status === 'fulfilled' ? talentData.value : [];
      const recruiting = recruitingData.status === 'fulfilled' ? recruitingData.value : [];
      
      const homeTalent = talent.find(t => t.school === homeTeam);
      const awayTalent = talent.find(t => t.school === awayTeam);
      const homeRecruiting = recruiting.find(r => r.team === homeTeam);
      const awayRecruiting = recruiting.find(r => r.team === awayTeam);
      
      // Calculate basic aggregates
      const calculateAggregates = (games, team) => {
        if (games.length === 0) return null;
        
        const teamGames = games.map(g => ({
          points: g.home_team === team ? g.home_points : g.away_points,
          pointsAllowed: g.home_team === team ? g.away_points : g.home_points
        }));
        
        const totalPoints = teamGames.reduce((sum, g) => sum + g.points, 0);
        const totalAllowed = teamGames.reduce((sum, g) => sum + g.pointsAllowed, 0);
        
        return {
          count: games.length,
          avg: {
            homePoints: totalPoints / games.length,
            awayPoints: totalAllowed / games.length,
            homePostgameWinProb: null,
            awayPostgameWinProb: null,
            excitementIndex: null,
            homeStartElo: null,
            awayStartElo: null
          },
          max: {
            homePoints: Math.max(...teamGames.map(g => g.points)),
            awayPoints: Math.max(...teamGames.map(g => g.pointsAllowed))
          },
          min: {
            homePoints: Math.min(...teamGames.map(g => g.points)),
            awayPoints: Math.min(...teamGames.map(g => g.pointsAllowed))
          }
        };
      };

      return {
        homeGames: homeGamesData.map(g => ({
          id: g.id,
          week: g.week,
          homeTeam: g.home_team,
          awayTeam: g.away_team,
          homePoints: g.home_points,
          awayPoints: g.away_points,
          neutralSite: g.neutral_site,
          conferenceGame: g.conference_game,
          // GraphQL-only fields not available
          homeStartElo: null,
          awayStartElo: null,
          homeEndElo: null,
          awayEndElo: null,
          homePostgameWinProb: null,
          awayPostgameWinProb: null,
          excitementIndex: null,
          gameLines: [],
          gameWeather: []
        })),
        awayGames: awayGamesData.map(g => ({
          id: g.id,
          week: g.week,
          homeTeam: g.home_team,
          awayTeam: g.away_team,
          homePoints: g.home_points,
          awayPoints: g.away_points,
          neutralSite: g.neutral_site,
          conferenceGame: g.conference_game,
          // GraphQL-only fields not available
          homeStartElo: null,
          awayStartElo: null,
          homeEndElo: null,
          awayEndElo: null,
          homePostgameWinProb: null,
          awayPostgameWinProb: null,
          excitementIndex: null,
          gameLines: [],
          gameWeather: []
        })),
        headToHead: headToHeadData.map(g => ({
          season: g.season,
          week: g.week,
          homeTeam: g.home_team,
          awayTeam: g.away_team,
          homePoints: g.home_points,
          awayPoints: g.away_points,
          neutralSite: g.neutral_site,
          excitementIndex: null,
          gameLines: []
        })),
        homeAggregates: calculateAggregates(homeGamesData, homeTeam),
        awayAggregates: calculateAggregates(awayGamesData, awayTeam),
        homeTalent: homeTalent?.talent || null,
        awayTalent: awayTalent?.talent || null,
        homeRecruiting: homeRecruiting || null,
        awayRecruiting: awayRecruiting || null
      };
    } catch (restError) {
      console.error("❌ REST API fallback also failed:", restError);
      throw error; // Throw original GraphQL error
    }
  };
};

// Weekly games with prediction context
export const getWeeklyGamesForPrediction = async (week, year = 2024, seasonType = 'regular') => {
  const query = `
    query WeeklyGamesForPrediction($week: smallint!, $year: smallint!, $seasonType: season_type!) {
      game(
        where: {
          _and: [
            {week: {_eq: $week}},
            {season: {_eq: $year}},
            {seasonType: {_eq: $seasonType}}
          ]
        }
        orderBy: {startDate: ASC}
      ) {
        id
        homeTeam awayTeam
        startDate
        neutralSite conferenceGame
        status
        
        gameLines {
          provider spread overUnder homeMoneyline awayMoneyline
        }
        
        gameWeather {
          temperature windSpeed precipitation gameIndoors
        }
        
        # Include recent ELO if available
        homeStartElo awayStartElo
      }
    }
  `;
  
  const variables = { week, year, seasonType };
  const data = await fetchData(query, variables);
  return data?.game || [];
};

// Conference strength analysis
// Conference strength analysis - FIXED QUERY
export const getConferenceStrengthAnalysis = async (conference, year = 2024) => {
  const query = `
    query ConferenceStrengthAnalysis($conference: String!, $year: smallint!) {
      currentTeams(where: {conference: {_eq: $conference}}) {
        school teamId
        conference
        
        # Add talent rating
        teamTalents(where: {year: {_eq: $year}}) {
          talent
        }
        
        # Add recruiting
        recruitingTeams(where: {year: {_eq: $year}}) {
          rank points
        }
      }
    }
  `;
  
  const variables = { conference, year };
  
  try {
    const data = await fetchData(query, variables);
    return data?.currentTeams || [];
  } catch (error) {
    console.error("❌ Conference Analysis GraphQL Error, falling back to REST:", error);
    
    // REST API fallback
    try {
      console.log('🔄 [FALLBACK] Using REST API for conference analysis...');
      const [teamsData, talentData, recruitingData] = await Promise.allSettled([
        fetchCollegeFootballData('/teams', { conference }),
        fetchCollegeFootballData('/talent', { year }),
        fetchCollegeFootballData('/recruiting/teams', { year })
      ]);

      const teams = teamsData.status === 'fulfilled' ? teamsData.value : [];
      const talent = talentData.status === 'fulfilled' ? talentData.value : [];
      const recruiting = recruitingData.status === 'fulfilled' ? recruitingData.value : [];
      
      return teams.map(team => ({
        school: team.school,
        teamId: team.id,
        conference: team.conference,
        teamTalents: talent.filter(t => t.school === team.school).map(t => ({ talent: t.talent })),
        recruitingTeams: recruiting.filter(r => r.team === team.school).map(r => ({ rank: r.rank, points: r.points }))
      }));
    } catch (restError) {
      console.error("❌ REST API fallback also failed:", restError);
      throw error;
    }
  }
};

// Enhanced team ratings with advanced metrics
export const getEnhancedTeamRatings = async (team, year = 2024) => {
  const query = `
    query EnhancedTeamRatings($team: String!, $year: smallint!) {
      # Standard ratings
      ratings(where: {team: {_eq: $team}, year: {_eq: $year}}) {
        conference elo fpi
        fpiOffensiveEfficiency fpiDefensiveEfficiency fpiSpecialTeamsEfficiency
        spOverall spOffense spDefense spSpecialTeams
        srs
      }
      
      # Talent composite
      teamTalent(where: {team: {_eq: $team}, year: {_eq: $year}}) {
        talent
      }
      
      # Recruiting strength
      recruitingTeam(where: {team: {_eq: $team}, year: {_eq: $year}}) {
        rank points
      }
      
      # Season performance aggregates
      seasonStats: gameAggregate(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $team}}, {awayTeam: {_eq: $team}}]},
            {season: {_eq: $year}},
            {status: {_eq: "completed"}}
          ]
        }
      ) {
        aggregate {
          count
          avg {
            homePoints awayPoints
            homePostgameWinProb
            excitementIndex
            homeStartElo
          }
        }
      }
    }
  `;
  
  const variables = { team, year };
  
  try {
    const data = await fetchData(query, variables);
    
    const ratings = data?.ratings?.[0];
    const talent = data?.teamTalent?.[0];
    const recruiting = data?.recruitingTeam?.[0];
    const stats = data?.seasonStats?.aggregate;
    
    return {
      // Standard ratings
      overall: ratings?.spOverall || null,
      offense: ratings?.spOffense || null,
      defense: ratings?.spDefense || null,
      specialTeams: ratings?.spSpecialTeams || null,
      
      // Advanced metrics
      fpi: ratings?.fpi || null,
      fpiOffense: ratings?.fpiOffensiveEfficiency || null,
      fpiDefense: ratings?.fpiDefensiveEfficiency || null,
      elo: ratings?.elo || null,
      srs: ratings?.srs || null,
      
      // Talent and recruiting
      talent: talent?.talent || null,
      recruitingRank: recruiting?.rank || null,
      recruitingPoints: recruiting?.points || null,
      
      // Season performance
      avgPointsScored: stats?.avg?.homePoints || null,
      avgPointsAllowed: stats?.avg?.awayPoints || null,
      avgWinProbability: stats?.avg?.homePostgameWinProb || null,
      avgExcitement: stats?.avg?.excitementIndex || null,
      avgElo: stats?.avg?.homeStartElo || null,
      gamesPlayed: stats?.count || 0
    };
  } catch (error) {
    console.error("❌ Enhanced Team Ratings GraphQL Error, falling back to REST:", error);
    
    // REST API fallback using core service
    try {
      console.log('🔄 [FALLBACK] Using REST API for enhanced team ratings...');
      const [ratingsData, talentData, recruitingData, gamesData] = await Promise.allSettled([
        fetchCollegeFootballData('/ratings/sp', { year, team }),
        fetchCollegeFootballData('/talent', { year }),
        fetchCollegeFootballData('/recruiting/teams', { year }),
        fetchCollegeFootballData('/games', { year, team })
      ]);

      // Process the fallback data
      const ratings = ratingsData.status === 'fulfilled' ? 
        ratingsData.value.find(r => r.team === team) : null;
      const talent = talentData.status === 'fulfilled' ? 
        talentData.value.find(t => t.school === team) : null;
      const recruiting = recruitingData.status === 'fulfilled' ? 
        recruitingData.value.find(r => r.team === team) : null;
      const games = gamesData.status === 'fulfilled' ? gamesData.value : [];
      
      // Calculate averages from games
      const completedGames = games.filter(g => g.completed);
      const avgStats = completedGames.length > 0 ? {
        avgPointsScored: completedGames.reduce((sum, g) => sum + (g.home_team === team ? g.home_points : g.away_points), 0) / completedGames.length,
        avgPointsAllowed: completedGames.reduce((sum, g) => sum + (g.home_team === team ? g.away_points : g.home_points), 0) / completedGames.length,
        gamesPlayed: completedGames.length
      } : { avgPointsScored: null, avgPointsAllowed: null, gamesPlayed: 0 };

      return {
        // Standard ratings
        overall: ratings?.rating || null,
        offense: ratings?.offense || null,
        defense: ratings?.defense || null,
        specialTeams: ratings?.specialTeams || null,
        
        // Advanced metrics
        fpi: null, // Not available in REST
        fpiOffense: null,
        fpiDefense: null,
        elo: null,
        srs: null,
        
        // Talent and recruiting
        talent: talent?.talent || null,
        recruitingRank: recruiting?.rank || null,
        recruitingPoints: recruiting?.points || null,
        
        // Season performance from fallback
        ...avgStats,
        avgWinProbability: null,
        avgExcitement: null,
        avgElo: null
      };
    } catch (restError) {
      console.error("❌ REST API fallback also failed:", restError);
      throw error; // Throw original GraphQL error
    }
  }
};

// Betting lines analysis
// Betting lines analysis - FIXED QUERY
export const getBettingLinesAnalysis = async (homeTeam, awayTeam, year = 2024) => {
  const query = `
    query BettingLinesAnalysis($homeTeam: String!, $awayTeam: String!, $year: smallint!) {
      # Current matchup if exists
      currentMatchup: game(
        where: {
          _and: [
            {homeTeam: {_eq: $homeTeam}},
            {awayTeam: {_eq: $awayTeam}},
            {season: {_eq: $year}}
          ]
        }
        limit: 1
      ) {
        id
        homeTeam
        awayTeam
        gameLines {
          provider 
          spread 
          overUnder 
          homeMoneyline 
          awayMoneyline
        }
      }
      
      # Historical betting performance for home team
      homeTeamLines: game(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $homeTeam}}, {awayTeam: {_eq: $homeTeam}}]},
            {season: {_eq: $year}},
            {status: {_eq: "completed"}}
          ]
        }
        limit: 10
      ) {
        homeTeam 
        awayTeam 
        homePoints 
        awayPoints
        gameLines {
          provider 
          spread 
          overUnder
        }
      }
      
      # Historical betting performance for away team  
      awayTeamLines: game(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $awayTeam}}, {awayTeam: {_eq: $awayTeam}}]},
            {season: {_eq: $year}},
            {status: {_eq: "completed"}}
          ]
        }
        limit: 10
      ) {
        homeTeam 
        awayTeam 
        homePoints 
        awayPoints
        gameLines {
          provider 
          spread 
          overUnder
        }
      }
    }
  `;
  
  const variables = { homeTeam, awayTeam, year };
  
  try {
    const data = await fetchData(query, variables);
    
    return {
      currentLines: data?.currentMatchup?.[0]?.gameLines || [],
      homeTeamHistory: data?.homeTeamLines || [],
      awayTeamHistory: data?.awayTeamLines || []
    };
  } catch (error) {
    console.error("❌ Betting Analysis GraphQL Error, falling back to REST:", error);
    
    // REST API fallback
    try {
      console.log('🔄 [FALLBACK] Using REST API for betting analysis...');
      const [homeGames, awayGames] = await Promise.allSettled([
        fetchCollegeFootballData('/games', { year, team: homeTeam }),
        fetchCollegeFootballData('/games', { year, team: awayTeam })
      ]);

      const homeGamesData = homeGames.status === 'fulfilled' ? homeGames.value : [];
      const awayGamesData = awayGames.status === 'fulfilled' ? awayGames.value : [];
      
      // Look for current matchup
      const currentMatchup = homeGamesData.find(g => 
        (g.home_team === homeTeam && g.away_team === awayTeam) ||
        (g.home_team === awayTeam && g.away_team === homeTeam)
      );
      
      return {
        currentLines: [], // Betting lines not available in REST
        homeTeamHistory: homeGamesData.slice(0, 10).map(g => ({
          homeTeam: g.home_team,
          awayTeam: g.away_team,
          homePoints: g.home_points,
          awayPoints: g.away_points,
          gameLines: [] // Not available in REST
        })),
        awayTeamHistory: awayGamesData.slice(0, 10).map(g => ({
          homeTeam: g.home_team,
          awayTeam: g.away_team,
          homePoints: g.home_points,
          awayPoints: g.away_points,
          gameLines: [] // Not available in REST
        })),
        message: 'Betting lines only available through GraphQL - using game data only'
      };
    } catch (restError) {
      console.error("❌ REST API fallback also failed:", restError);
      throw error;
    }
  }
};

// Live game tracking for in-game predictions
export const getLiveGameData = async (gameId) => {
  const query = `
    query LiveGameData($gameId: Int!) {
      scoreboard(where: {id: {_eq: $gameId}}) {
        id status
        currentPeriod currentClock
        currentPossession currentSituation lastPlay
        homeTeam awayTeam
        homePoints awayPoints
        homeLineScores awayLineScores
        spread overUnder
        moneylineHome moneylineAway
        temperature weatherDescription
        windSpeed windDirection
      }
    }
  `;
  
  const variables = { gameId: parseInt(gameId) };
  const data = await fetchData(query, variables);
  return data?.scoreboard?.[0] || null;
};

// Head-to-head history analysis
export const getHeadToHeadHistory = async (team1, team2, year = 2024) => {
  const query = `
    query HeadToHeadHistory($team1: String!, $team2: String!, $year: smallint!) {
      team1Games: game(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $team1}}, {awayTeam: {_eq: $team1}}]},
            {_or: [{homeTeam: {_eq: $team2}}, {awayTeam: {_eq: $team2}}]},
            {season: {_lte: $year}},
            {status: {_eq: "completed"}}
          ]
        }
        orderBy: {season: DESC}
        limit: 10
      ) {
        id season week homeTeam awayTeam
        homePoints awayPoints
        excitementIndex
        homeStartElo awayStartElo
      }
    }
  `;
  
  const variables = { team1, team2, year };
  const data = await fetchData(query, variables);
  
  const games = data?.team1Games || [];
  const team1Wins = games.filter(game => 
    (game.homeTeam === team1 && game.homePoints > game.awayPoints) ||
    (game.awayTeam === team1 && game.awayPoints > game.homePoints)
  ).length;
  
  return {
    games: games.map(game => ({
      ...game,
      excitementIndex: game.excitementIndex || 0,
      eloRatingDiff: (game.homeStartElo || 0) - (game.awayStartElo || 0)
    })),
    team1Wins,
    team2Wins: games.length - team1Wins,
    avgPointDiff: games.length > 0 ? 
      games.reduce((acc, game) => {
        const diff = game.homeTeam === team1 ? 
          game.homePoints - game.awayPoints : 
          game.awayPoints - game.homePoints;
        return acc + diff;
      }, 0) / games.length : 0,
    lastMeeting: games[0] || null
  };
};

// Weather conditions for game prediction
// Weather conditions for game prediction - FIXED QUERY
export const getWeatherConditions = async (teamId, week, season = 2024) => {
  const query = `
    query WeatherConditions($teamId: Int!, $week: smallint!, $season: smallint!) {
      game(
        where: {
          _and: [
            {_or: [{homeTeamId: {_eq: $teamId}}, {awayTeamId: {_eq: $teamId}}]},
            {week: {_eq: $week}},
            {season: {_eq: $season}}
          ]
        }
        limit: 1
      ) {
        id
        homeTeam
        awayTeam
        week
        season
        gameWeather {
          temperature 
          windSpeed 
          precipitation 
          humidity
          weatherCondition 
          gameIndoors
        }
      }
    }
  `;
  
  const variables = { teamId: parseInt(teamId), week, season };
  
  try {
    const data = await fetchData(query, variables);
    
    const game = data?.game?.[0];
    const weather = game?.gameWeather;
    
    if (!weather) {
      return {
        game: game || null,
        weather: null,
        message: 'No weather data available for this game'
      };
    }
    
    return {
      game: {
        id: game.id,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        week: game.week,
        season: game.season
      },
      detailedConditions: {
        temperature: weather.temperature,
        windSpeed: weather.windSpeed,
        precipitation: weather.precipitation ? {
          type: weather.precipitation > 0.5 ? 'heavy' : 'light',
          intensity: weather.precipitation
        } : null,
        humidity: weather.humidity,
        visibility: weather.gameIndoors ? 1.0 : 0.75
      },
      severity: weather.temperature < 32 || weather.windSpeed > 25 ? 'high' : 
                weather.temperature < 45 || weather.windSpeed > 15 ? 'moderate' : 'low'
    };
  } catch (error) {
    console.error("❌ Weather Data GraphQL Error, falling back to REST:", error);
    
    // REST API fallback
    try {
      console.log('🔄 [FALLBACK] Using REST API for weather data...');
      const gamesData = await fetchCollegeFootballData('/games', { 
        year: season, 
        week,
        team: teamId // This might not work perfectly, but it's a fallback
      });

      return {
        game: gamesData[0] || null,
        weather: null,
        message: 'Weather data only available through GraphQL - REST fallback has limited weather info'
      };
    } catch (restError) {
      console.error("❌ REST API fallback also failed:", restError);
      throw error;
    }
  }
};

// ====== EXISTING FUNCTIONS (ENHANCED) ======

// Enhanced team ratings
export const getTeamRatings = async (team, year = 2024) => {
  return await getEnhancedTeamRatings(team, year);
};

// Detailed team ratings (enhanced with more metrics)
export const getTeamDetailedRatings = async (team, year = 2024) => {
  const query = `
    query DetailedRatings($team: String!, $year: smallint!) {
      ratings(where: {team: {_eq: $team}, year: {_eq: $year}}) {
        conference conferenceId
        elo fpi
        fpiAvgWinProbabilityRank fpiDefensiveEfficiency fpiGameControlRank
        fpiOffensiveEfficiency fpiOverallEfficiency fpiRemainingSosRank
        fpiResumeRank fpiSosRank fpiSpecialTeamsEfficiency
        fpiStrengthOfRecordRank
        spDefense spOffense spOverall spSpecialTeams
        srs team teamId year
      }
      
      # Add talent and recruiting context
      teamTalent(where: {team: {_eq: $team}, year: {_eq: $year}}) {
        talent
      }
      
      recruitingTeam(where: {team: {_eq: $team}, year: {_eq: $year}}) {
        rank points
      }
    }
  `;
  
  const variables = { team: team.trim(), year };
  
  try {
    const data = await fetchData(query, variables);
    
    const ratings = data?.ratings?.[0];
    const talent = data?.teamTalent?.[0];
    const recruiting = data?.recruitingTeam?.[0];
    
    if (!ratings) return null;
    
    return {
      ...ratings,
      talent: talent?.talent || null,
      recruitingRank: recruiting?.rank || null,
      recruitingPoints: recruiting?.points || null
    };
  } catch (error) {
    console.error("❌ Team Detailed Ratings GraphQL Error, falling back to REST:", error);
    
    // REST API fallback using core service
    try {
      console.log('🔄 [FALLBACK] Using REST API for detailed team ratings...');
      const [spRatings, fpiRatings, talentData, recruitingData] = await Promise.allSettled([
        fetchCollegeFootballData('/ratings/sp', { year, team }),
        fetchCollegeFootballData('/ratings/fpi', { year, team }),
        fetchCollegeFootballData('/talent', { year }),
        fetchCollegeFootballData('/recruiting/teams', { year })
      ]);

      // Process the fallback data
      const spData = spRatings.status === 'fulfilled' ? 
        spRatings.value.find(r => r.team === team) : null;
      const fpiData = fpiRatings.status === 'fulfilled' ? 
        fpiRatings.value.find(r => r.team === team) : null;
      const talent = talentData.status === 'fulfilled' ? 
        talentData.value.find(t => t.school === team) : null;
      const recruiting = recruitingData.status === 'fulfilled' ? 
        recruitingData.value.find(r => r.team === team) : null;
      
      if (!spData && !fpiData) return null;

      return {
        // Basic info
        team,
        year,
        conference: spData?.conference || null,
        conferenceId: null,
        teamId: null,
        
        // SP+ Ratings
        spOverall: spData?.rating || null,
        spOffense: spData?.offense || null,
        spDefense: spData?.defense || null,
        spSpecialTeams: spData?.specialTeams || null,
        
        // FPI Ratings (may be limited in REST)
        fpi: fpiData?.fpi || null,
        fpiOffensiveEfficiency: fpiData?.offenseEfficiency || null,
        fpiDefensiveEfficiency: fpiData?.defenseEfficiency || null,
        fpiSpecialTeamsEfficiency: fpiData?.specialTeamsEfficiency || null,
        fpiOverallEfficiency: fpiData?.overallEfficiency || null,
        
        // Rankings and SRS
        elo: null, // Not available in REST
        srs: null,
        fpiAvgWinProbabilityRank: null,
        fpiGameControlRank: null,
        fpiRemainingSosRank: null,
        fpiResumeRank: null,
        fpiSosRank: null,
        fpiStrengthOfRecordRank: null,
        
        // Talent and recruiting
        talent: talent?.talent || null,
        recruitingRank: recruiting?.rank || null,
        recruitingPoints: recruiting?.points || null
      };
    } catch (restError) {
      console.error("❌ REST API fallback also failed:", restError);
      throw error; // Throw original GraphQL error
    }
  }
};

// Enhanced teams list
export const getTeams = async (filters = {}) => {
  const query = `
    query EnhancedCurrentTeams($limit: Int, $offset: Int, $where: currentTeamsBoolExp) {
      currentTeams(limit: $limit, offset: $offset, where: $where, orderBy: {school: ASC}) {
        abbreviation classification conference conferenceId
        division school teamId
        
        # Add talent ranking for context
        teamTalents(where: {year: {_eq: 2024}}, limit: 1) {
          talent
        }
      }
    }
  `;
  
  // Build where clause based on filters
  let whereClause = {};
  if (filters.classification) {
    whereClause.classification = { _eq: filters.classification };
  } else {
    // Default to FBS teams
    whereClause.classification = { _eq: "fbs" };
  }
  
  const variables = {
    limit: filters.limit || 150,
    offset: filters.offset || 0,
    where: whereClause
  };
  
  const data = await fetchData(query, variables);
  return (data?.currentTeams || []).map(team => ({
    ...team,
    talent: team.teamTalents?.[0]?.talent || null
  }));
};

// Enhanced team lookup
export const getTeamBySchool = async (school) => {
  const query = `
    query GetEnhancedTeamBySchool($school: String!) {
      currentTeams(where: {school: {_eq: $school}}) {
        teamId school abbreviation classification
        conference conferenceId division
        
        teamTalents(where: {year: {_eq: 2024}}, limit: 1) {
          talent
        }
        
        recruitingTeams(where: {year: {_eq: 2024}}, limit: 1) {
          rank points
        }
      }
    }
  `;
  
  const variables = { school };
  const data = await fetchData(query, variables);
  const team = data?.currentTeams?.[0];
  
  if (!team) return null;
  
  return {
    ...team,
    talent: team.teamTalents?.[0]?.talent || null,
    recruitingRank: team.recruitingTeams?.[0]?.rank || null,
    recruitingPoints: team.recruitingTeams?.[0]?.points || null
  };
};

// Enhanced games by team (with more context)
export const getGamesByTeam = async (team, season = 2024, seasonType = 'regular') => {
  const query = `
    query EnhancedGamesByTeam($team: String!, $season: smallint!, $seasonType: season_type!) {
      game(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $team}}, {awayTeam: {_eq: $team}}]},
            {season: {_eq: $season}},
            {seasonType: {_eq: $seasonType}}
          ]
        }
        orderBy: {week: ASC}
      ) {
        id season week seasonType startDate
        homeTeam homePoints awayTeam awayPoints
        neutralSite conferenceGame attendance
        status
        
        # Enhanced metrics
        homeStartElo awayStartElo homeEndElo awayEndElo
        homePostgameWinProb awayPostgameWinProb
        excitementIndex
        
        # Betting context
        gameLines {
          provider spread overUnder
        }
        
        # Weather conditions
        gameWeather {
          temperature windSpeed precipitation
        }
      }
    }
  `;
  
  const variables = { team, season, seasonType };
  
  try {
    const data = await fetchData(query, variables);
    return data?.game || [];
  } catch (error) {
    console.error("❌ Games by Team GraphQL Error, falling back to REST:", error);
    
    // REST API fallback using core service
    try {
      console.log('🔄 [FALLBACK] Using REST API for games by team...');
      const gamesData = await fetchCollegeFootballData('/games', { 
        year: season, 
        team,
        seasonType: seasonType === 'regular' ? 'regular' : seasonType
      });

      // Transform REST data to match GraphQL structure
      return gamesData.map(game => ({
        id: game.id,
        season: game.season,
        week: game.week,
        seasonType: game.season_type,
        startDate: game.start_date,
        homeTeam: game.home_team,
        homePoints: game.home_points,
        awayTeam: game.away_team,
        awayPoints: game.away_points,
        neutralSite: game.neutral_site,
        conferenceGame: game.conference_game,
        attendance: game.attendance,
        status: game.completed ? 'completed' : 'scheduled',
        
        // Enhanced metrics not available in REST
        homeStartElo: null,
        awayStartElo: null,
        homeEndElo: null,
        awayEndElo: null,
        homePostgameWinProb: null,
        awayPostgameWinProb: null,
        excitementIndex: null,
        
        // Nested data not available in REST
        gameLines: [],
        gameWeather: []
      }));
    } catch (restError) {
      console.error("❌ REST API fallback also failed:", restError);
      throw error; // Throw original GraphQL error
    }
  }
};

// Keep existing functions for compatibility
export const getGameScoreboard = async (gameId) => {
  return await getLiveGameData(gameId);
};

export const getGameInfo = async (gameId) => {
  const query = `
    query EnhancedGameInfo($gameId: Int!) {
      game(where: { id: { _eq: $gameId } }) {
        id attendance
        awayClassification awayConference awayConferenceId
        awayEndElo awayLineScores awayPoints awayPostgameWinProb
        awayStartElo awayTeam awayTeamId
        conferenceGame excitementIndex
        homeClassification homeConference homeConferenceId
        homeEndElo homeLineScores homePoints homePostgameWinProb
        homeStartElo homeTeam homeTeamId
        neutralSite notes season seasonType
        startDate startTimeTbd status venueId week
        
        gameLines {
          provider spread overUnder homeMoneyline awayMoneyline
        }
        
        gameWeather {
          temperature windSpeed precipitation humidity
          weatherCondition gameIndoors
        }
      }
    }
  `;
  
  const variables = { gameId: parseInt(gameId) };
  const data = await fetchData(query, variables);
  return data?.game?.[0] || null;
};

// Export enhanced service object
const graphqlService = {
  // Prediction-focused functions (NEW!)
  getComprehensivePredictionData,
  getWeeklyGamesForPrediction,
  getConferenceStrengthAnalysis,
  getEnhancedTeamRatings,
  getBettingLinesAnalysis,
  getLiveGameData,
  getHeadToHeadHistory,
  getWeatherConditions,
  
  // Enhanced existing functions
  getTeams,
  getTeamBySchool,
  getTeamRatings,
  getTeamDetailedRatings,
  getGamesByTeam,
  getGameScoreboard,
  getGameInfo,
  
  // Structured service namespaces for easier use
  teams: {
    getCurrent: getTeams,
    getBySchool: getTeamBySchool,
    getRatings: getTeamRatings,
    getDetailed: getTeamDetailedRatings,
    getByConference: getConferenceStrengthAnalysis
  },
  
  games: {
    getByTeam: getGamesByTeam,
    getByWeek: getWeeklyGamesForPrediction,
    getScoreboard: getGameScoreboard,
    getInfo: getGameInfo
  },
  
  // Utility functions
  utils: {
    // Enhanced availability check
    isAvailable: async () => {
      try {
        await delay(100); // Rate limiting
        const testQuery = `
          query TestQuery {
            currentTeams(limit: 1) {
              school
            }
          }
        `;
        await fetchData(testQuery);
        console.log('✓ GraphQL service available');
        return true;
      } catch (error) {
        console.warn('⚠️ GraphQL not available:', error.message);
        if (error.message.includes('CORS')) {
          console.warn('⚠️ GraphQL CORS blocked - falling back to REST API');
        }
        return false;
      }
    },
    
    // Rate limited query execution
    queryWithDelay: async (query, variables = {}, delayMs = 100) => {
      await delay(delayMs);
      return await fetchData(query, variables);
    },
    
    // Batch queries with rate limiting
    batchQueries: async (queries, delayMs = 150) => {
      const results = [];
      for (const { query, variables } of queries) {
        try {
          const result = await fetchData(query, variables);
          results.push({ success: true, data: result });
          await delay(delayMs);
        } catch (error) {
          results.push({ success: false, error: error.message });
          await delay(delayMs);
        }
      }
      return results;
    }
  },
  
  // Direct query execution
  query: fetchData
};

export default graphqlService;