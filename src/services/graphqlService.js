// Simplified GraphQL service for College Football Data API
// Direct endpoint interaction with focused functionality

const GRAPHQL_ENDPOINT = 'https://graphql.collegefootballdata.com/v1/graphql';
const COLLEGE_FOOTBALL_API_KEY = 'p5M3+9PK7Kt1CIMox0hgi7zgyWKCeO86buPF+tEH/zPCExymKp+v+IBrl7rKucSq';

// Direct GraphQL API interaction
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
    console.error("Fetch Error:", error.message);
    throw error;
  }
};

// SP+ team ratings (used for gauges)
export const getTeamRatings = async (team, year = 2024) => {
  const query = `
    query GetTeamRatings($year: Int!, $team: String!) {
      teamRatings(where: { year: { _eq: $year }, team: { _eq: $team } }) {
        rating
        offense { rating, ranking }
        defense { rating, ranking }
        specialTeams { rating }
      }
    }
  `;
  const variables = { year, team };
  const data = await fetchData(query, variables);
  const teamData = data?.teamRatings?.[0];
  if (!teamData) throw new Error(`Ratings data not found for team: ${team}`);
  return {
    overall: teamData.rating,
    offense: teamData.offense?.rating || "N/A",
    defense: teamData.defense?.rating || "N/A",
    specialTeams: teamData.specialTeams?.rating || "N/A",
    offenseRank: teamData.offense?.ranking || "N/A",
    defenseRank: teamData.defense?.ranking || "N/A",
  };
};

// Detailed team ratings (for rating table)
export const getTeamDetailedRatings = async (team, year = 2024) => {
  const query = `
    query Ratings($where: ratingsBoolExp) {
      ratings(where: $where) {
        conference
        conferenceId
        elo
        fpi
        fpiAvgWinProbabilityRank
        fpiDefensiveEfficiency
        fpiGameControlRank
        fpiOffensiveEfficiency
        fpiOverallEfficiency
        fpiRemainingSosRank
        fpiResumeRank
        fpiSosRank
        fpiSpecialTeamsEfficiency
        fpiStrengthOfRecordRank
        spDefense
        spOffense
        spOverall
        spSpecialTeams
        srs
        team
        teamId
        year
      }
    }
  `;
  
  const variables = {
    where: {
      team: { _eq: team.trim() },
      year: { _eq: year }
    }
  };
  
  const data = await fetchData(query, variables);
  return data?.ratings?.[0] || null;
};

// Basic team information
export const getTeams = async () => {
  const query = `
    query CurrentTeams(
      $limit: Int,
      $offset: Int,
      $orderBy: [currentTeamsOrderBy!],
      $where: currentTeamsBoolExp
    ) {
      currentTeams(
        limit: $limit,
        offset: $offset,
        orderBy: $orderBy,
        where: $where
      ) {
        abbreviation
        classification
        conference
        conferenceId
        division
        school
        teamId
      }
    }
  `;
  const variables = {
    limit: 100,
    offset: 0,
    where: { classification: { _eq: "fbs" } }
  };
  const data = await fetchData(query, variables);
  return data?.currentTeams || [];
};

// Get team by school name
export const getTeamBySchool = async (school) => {
  const query = `
    query GetTeamBySchool($school: String!) {
      currentTeams(where: {school: {_eq: $school}}) {
        teamId
        school
        abbreviation
        classification
        conference
        conferenceId
        division
      }
    }
  `;
  const variables = { school };
  const data = await fetchData(query, variables);
  return data?.currentTeams?.[0] || null;
};

// Get games by team
export const getGamesByTeam = async (team, season = 2024, seasonType = 'regular') => {
  const query = `
    query GetGamesByTeam($team: String!, $season: smallint!, $seasonType: season_type!) {
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
        id
        season
        week
        seasonType
        startDate
        homeTeam
        homePoints
        awayTeam
        awayPoints
        neutralSite
        conferenceGame
        attendance
      }
    }
  `;
  const variables = { team, season, seasonType };
  const data = await fetchData(query, variables);
  return data?.game || [];
};

// Get detailed game scoreboard data
export const getGameScoreboard = async (gameId) => {
  const query = `
    query GetGameScoreboard($gameId: Int!) {
      scoreboard(where: { id: { _eq: $gameId } }) {
        id
        awayClassification
        awayConference
        awayConferenceAbbreviation
        awayId
        awayLineScores
        awayPoints
        awayTeam
        city
        conferenceGame
        currentClock
        currentPeriod
        currentPossession
        currentSituation
        homeClassification
        homeConference
        homeConferenceAbbreviation
        homeId
        homeLineScores
        homePoints
        homeTeam
        lastPlay
        moneylineAway
        moneylineHome
        neutralSite
        overUnder
        spread
        startDate
        startTimeTbd
        state
        status
        temperature
        tv
        venue
        weatherDescription
        windDirection
        windSpeed
      }
    }
  `;
  const variables = { gameId: parseInt(gameId) };
  const data = await fetchData(query, variables);
  return data?.scoreboard?.[0] || null;
};

// Get comprehensive game information
export const getGameInfo = async (gameId) => {
  const query = `
    query GetGameInfo($gameId: Int!) {
      game(where: { id: { _eq: $gameId } }) {
        id
        attendance
        away_classification
        away_conference
        away_conference_id
        away_end_elo
        away_line_scores
        away_points
        away_postgame_win_prob
        away_start_elo
        away_team
        away_team_id
        conference_game
        excitement_index
        home_classification
        home_conference
        home_conference_id
        home_end_elo
        home_line_scores
        home_points
        home_postgame_win_prob
        home_start_elo
        home_team
        home_team_id
        neutral_site
        notes
        season
        season_type
        start_date
        start_time_tbd
        status
        venue_id
        week
      }
    }
  `;
  const variables = { gameId: parseInt(gameId) };
  const data = await fetchData(query, variables);
  return data?.game?.[0] || null;
};

// Export individual functions and create service object
const graphqlService = {
  getTeams,
  getTeamBySchool,
  getTeamRatings,
  getTeamDetailedRatings,
  getGamesByTeam,
  getGameScoreboard,
  getGameInfo,
  
  // Utility functions
  utils: {
    // Check if GraphQL is available (test query)
    isAvailable: async () => {
      try {
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
    }
  },
  
  // Direct query execution
  query: fetchData
};

export default graphqlService;
