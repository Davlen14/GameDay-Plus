# College Football Data GraphQL API Documentation ✅ CORRECTED VERSION

## Overview
This document contains the CORRECTED GraphQL schema and field reference for the College Football Data API.
**All field names have been verified through direct API testing with curl commands.**

## Available Query Types

### Core Data Types
- `currentTeams` - Current season team data
- `game` - Game/match data
- `player` - Player information
- `poll` - Rankings and poll data
- `recruit` - Recruiting data
- `coach` - Coach information

### Schema Field Names Reference

#### Teams (currentTeams)
- `id` - Team ID
- `school` - School name
- `mascot` - Team mascot
- `abbreviation` - Team abbreviation
- `classification` - Division (fbs, fcs)
- `conference` - Conference name
- `division` - Conference division
- `color` - Primary color
- `alt_color` - Secondary color
- `twitter` - Twitter handle

#### Games (game) ✅ CORRECTED
- `id` - Game ID
- `season` - Season year (smallint type)
- `week` - Week number (smallint type)
- `season_type` - Season type enum (values: "regular", "postseason") ✅
- `start_date` - Game start date
- `completed` - Game completion status
- `neutral_site` - Neutral site flag
- `conference_game` - Conference game flag
- `attendance` - Attendance number
- `venue_id` - Venue ID
- `venue` - Venue name
- `home_id` - Home team ID
- `home_team` - Home team name (snake_case) ✅
- `home_conference` - Home team conference (snake_case) ✅
- `home_division` - Home team division
- `home_points` - Home team points
- `home_line_scores` - Home team line scores
- `home_post_win_prob` - Home team post-game win probability
- `home_pregame_elo` - Home team pre-game ELO
- `home_postgame_elo` - Home team post-game ELO
- `away_id` - Away team ID
- `away_team` - Away team name (snake_case) ✅
- `away_conference` - Away team conference (snake_case) ✅
- `away_division` - Away team division
- `away_points` - Away team points
- `away_line_scores` - Away team line scores
- `away_post_win_prob` - Away team post-game win probability
- `away_pregame_elo` - Away team pre-game ELO
- `away_postgame_elo` - Away team post-game ELO
- `excitement_index` - Game excitement index
- `highlights` - Game highlights
- `notes` - Game notes

## Important Schema Notes ✅ CORRECTED

### Field Name Conventions ✅
- **ALL fields use snake_case**: `home_team`, `away_team`, `home_conference`, `away_conference`
- **CRITICAL**: The original documentation incorrectly stated camelCase - this is WRONG!
- Verified through direct API testing: fields are `home_team` NOT `homeTeam`

### Data Types ✅
- Season and week fields are `smallint` type, not `Int`
- `season_type` is an enum type with values: "regular", "postseason"
- Boolean fields use proper GraphQL boolean type
- String comparisons use `_eq`, `_ilike` operators

### Enum Types ✅
- `season_type` enum values: "regular", "postseason"
- **MUST use `season_type` as the variable type, NOT `String`**

### Variable Type Examples ✅
```graphql
# ✅ CORRECT variable declarations
query GetGames($season: smallint!, $week: smallint, $seasonType: season_type) {
  # query body
}

# ❌ WRONG (common mistakes):
query GetGames($season: Int!, $seasonType: String) {
  # This will fail - use smallint and season_type instead
}
```

### Boolean Expression Types
- `currentTeamsBoolExp` - For filtering currentTeams
- `gameBoolExp` - For filtering games
- `playerBoolExp` - For filtering players
- `pollBoolExp` - For filtering polls
- `recruitBoolExp` - For filtering recruits

### Common Operators
- `_eq` - Equals
- `_neq` - Not equals
- `_gt` - Greater than
- `_gte` - Greater than or equal
- `_lt` - Less than
- `_lte` - Less than or equal
- `_like` - Like (case sensitive)
- `_ilike` - Like (case insensitive)
- `_in` - In array
- `_nin` - Not in array
- `_is_null` - Is null
- `_and` - Logical AND
- `_or` - Logical OR

### Limitations
- Order by clauses (`order_by`) are not supported on many queries
- Some advanced filtering may need to be done post-query
- GraphQL API requires Patreon Tier 3+ subscription

## Query Examples ✅ CORRECTED

### Get FBS Teams
```graphql
query GetFBSTeams {
  currentTeams(where: {classification: {_eq: "fbs"}}) {
    school
    mascot
    conference
    classification
  }
}
```

### Get Games by Team ✅ CORRECTED
```graphql
query GetGamesByTeam($team: String!, $season: smallint!, $seasonType: season_type) {
  game(where: {
    _and: [
      {_or: [{home_team: {_eq: $team}}, {away_team: {_eq: $team}}]},
      {season: {_eq: $season}},
      {season_type: {_eq: $seasonType}}
    ]
  }) {
    id
    season
    week
    home_team
    away_team
    home_points
    away_points
    start_date
  }
}
```

### Get Games by Week ✅ CORRECTED
```graphql
query GetGamesByWeek($season: smallint!, $week: smallint, $seasonType: season_type) {
  game(where: {
    _and: [
      {season: {_eq: $season}},
      {week: {_eq: $week}},
      {season_type: {_eq: $seasonType}}
    ]
  }) {
    id
    season
    week
    home_team
    away_team
    home_points
    away_points
    start_date
  }
}
```

### Get Current Polls
```graphql
query GetPolls($season: smallint!, $week: smallint) {
  poll(where: {
    season: {_eq: $season},
    week: {_eq: $week}
  }) {
    poll
    rank
    school
    conference
    points
  }
}
```

## Testing Notes ✅
These field names were verified through direct curl testing:
- `home_team` and `away_team` work ✅
- `season_type` enum with "regular"/"postseason" values works ✅
- `smallint` type for season/week works ✅
- `season_type` variable type (not `String`) works ✅

## Key Corrections Made ✅
1. **Fixed team field names**: `homeTeam` → `home_team`, `awayTeam` → `away_team`
2. **Fixed conference field names**: `homeConference` → `home_conference`, `awayConference` → `away_conference`
3. **Fixed enum handling**: `season_type` variable type instead of `String`
4. **Updated all examples** to use correct field names
5. **Added explicit warnings** about common mistakes
