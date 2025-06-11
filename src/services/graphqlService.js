// Enhanced GraphQL service for College Football Data API
// Optimized for prediction model with advanced metrics

const GRAPHQL_ENDPOINT = 'https://graphql.collegefootballdata.com/v1/graphql';
const COLLEGE_FOOTBALL_API_KEY = process.env.REACT_APP_COLLEGE_FOOTBALL_API_KEY;

// Direct GraphQL API interaction with enhanced error handling
const fetchData = async (query, variables = {}) => {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${COLLEGE_FOOTBALL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors.map((e) => e.message).join(", "));
    }
    return result.data;
  } catch (error) {
    console.error("GraphQL Fetch Error:", error.message);
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
export const getConferenceStrengthAnalysis = async (conference, year = 2024) => {
  const query = `
    query ConferenceStrengthAnalysis($conference: String!, $year: smallint!) {
      teams: currentTeams(where: {conference: {_eq: $conference}}) {
        school teamId
        
        # Season performance aggregates
        gamesAggregate(
          where: {
            _and: [
              {_or: [{homeTeam: {_eq: school}}, {awayTeam: {_eq: school}}]},
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
            }
          }
        }
        
        # Talent rating
        teamTalents(where: {year: {_eq: $year}}) {
          talent
        }
        
        # Recruiting
        recruitingTeams(where: {year: {_eq: $year}}) {
          rank points
        }
      }
    }
  `;
  
  const variables = { conference, year };
  const data = await fetchData(query, variables);
  return data?.teams || [];
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
};

// Betting lines analysis
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
      ) {
        id
        gameLines {
          provider spread spreadOpen overUnder overUnderOpen
          homeMoneyline awayMoneyline
        }
      }
      
      # Historical betting performance for both teams
      homeTeamLines: game(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $homeTeam}}, {awayTeam: {_eq: $homeTeam}}]},
            {season: {_eq: $year}},
            {status: {_eq: "completed"}}
          ]
        }
      ) {
        homeTeam awayTeam homePoints awayPoints
        gameLines {
          provider spread overUnder
        }
      }
      
      awayTeamLines: game(
        where: {
          _and: [
            {_or: [{homeTeam: {_eq: $awayTeam}}, {awayTeam: {_eq: $awayTeam}}]},
            {season: {_eq: $year}},
            {status: {_eq: "completed"}}
          ]
        }
      ) {
        homeTeam awayTeam homePoints awayPoints
        gameLines {
          provider spread overUnder
        }
      }
    }
  `;
  
  const variables = { homeTeam, awayTeam, year };
  const data = await fetchData(query, variables);
  
  return {
    currentLines: data?.currentMatchup?.[0]?.gameLines || [],
    homeTeamHistory: data?.homeTeamLines || [],
    awayTeamHistory: data?.awayTeamLines || []
  };
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
};

// Enhanced teams list
export const getTeams = async () => {
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
  
  const variables = {
    limit: 150,
    offset: 0,
    where: { classification: { _eq: "fbs" } }
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
  const data = await fetchData(query, variables);
  return data?.game || [];
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
  
  // Enhanced existing functions
  getTeams,
  getTeamBySchool,
  getTeamRatings,
  getTeamDetailedRatings,
  getGamesByTeam,
  getGameScoreboard,
  getGameInfo,
  
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
        return true;
      } catch (error) {
        console.warn('GraphQL not available:', error.message);
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