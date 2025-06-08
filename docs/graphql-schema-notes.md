# College Football Data GraphQL Schema - Critical Notes & Lessons Learned

## 🚨 CRITICAL SCHEMA FINDINGS & CORRECTIONS

### Data Types (MUST FOLLOW!)
- **Season/Week fields**: Use `smallint` NOT `Int` in GraphQL variables
- **Boolean expressions**: Use camelCase types like `gameBoolExp`, `currentTeamsBoolExp`
- **Field names**: ALL snake_case (`home_team`, `away_team`, `season_type`, `home_points`) ✅ CORRECTED

### GraphQL vs REST API Coverage Analysis

#### ✅ GRAPHQL HAS (Available Queries):
- `game` - Game info from "game_info" table (NOT the same as REST `/games`)
- `currentTeams` - Current team information  
- `coach` / `coachSeason` - Coach data
- `poll` - Rankings and polls
- `recruit` - Recruiting data
- `calendar` - Season calendar
- `adjustedTeamMetrics` - Advanced team stats
- `gameLines` - Betting lines (nested in game)
- `gameMedia` - Media info (nested in game)  
- `gameWeather` - Weather data (nested in game)

#### ❌ GRAPHQL MISSING (Must use REST fallback):
- **`/games`** - REST endpoint for basic game data (different structure than GraphQL `game`)
- **`/games/teams`** - Team box score statistics  
- **`/games/players`** - Player box score statistics
- **`/games/media`** - Game media (available as nested field in GraphQL `game`)
- **`/games/weather`** - Game weather (available as nested field in GraphQL `game`)
- Most other REST endpoints (teams, players, stats, etc.)

### Key Schema Corrections Applied: ✅ UPDATED
1. **Data Types**: `Int` → `smallint` for season/week parameters
2. **Field Names**: CORRECTED - All fields use snake_case (`home_team`, `away_team`, etc.)
3. **Boolean Expressions**: `game_bool_exp` → `gameBoolExp`
4. **Enum Types**: Use `season_type` variable type, not `String`
5. **Removed Unsupported**: `order_by` arguments from polls/recruiting queries

## Field Name Reference (Based on Actual Schema)

### Game Fields (`game` query) ✅ CORRECTED
```graphql
{
  id
  season              # smallint
  week                # smallint  
  season_type         # snake_case enum
  start_date
  attendance
  venue_id
  venue
  home_id
  home_team           # snake_case! 
  home_conference     # snake_case!
  home_division       # snake_case
  home_points         # snake_case
  home_line_scores    # snake_case
  away_id
  away_team           # snake_case!
  away_conference     # snake_case!
  away_division       # snake_case
  away_points         # snake_case
  away_line_scores    # snake_case
  # ... other fields
}
```

### Team Fields (`currentTeams` query)
```graphql
{
  id
  school
  mascot
  abbreviation
  classification
  conference
  division
  color
  alt_color
  twitter
}
```

## Critical Boolean Expression Types
- `gameBoolExp` - For filtering games
- `currentTeamsBoolExp` - For filtering currentTeams  
- `pollBoolExp` - For filtering polls
- `recruitBoolExp` - For filtering recruits
- `coachBoolExp` - For filtering coaches

## Working Query Examples

### ✅ WORKING: Get FBS Teams
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

### ✅ WORKING: Get Games by Team (CORRECTED)
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

### ✅ WORKING: Get Polls (No order_by)
```graphql
query GetPolls($season: smallint!, $week: smallint, $seasonType: String) {
  poll(where: {
    season: {_eq: $season},
    week: {_eq: $week},
    season_type: {_eq: $seasonType}
  }) {
    season
    week
    season_type
    poll
    rank
    school
    conference
    first_place_votes
    points
  }
}
```

## Common Issues & Solutions

### ❌ Type Mismatch Errors
**Error**: `Int cannot represent non 32-bit signed integer value: 2024`
**Solution**: Use `smallint` type instead of `Int` for season/week

### ❌ Field Not Found Errors  
**Error**: `field 'home_team' not found in type: 'gameBoolExp'`
**Solution**: ✅ CORRECTED - Actually use `home_team` (snake_case), previous docs were wrong!

### ❌ Unsupported Arguments
**Error**: Unknown argument "order_by" on field
**Solution**: Remove `order_by` clauses, do sorting post-query if needed

## Hybrid Approach Strategy

Since GraphQL doesn't have all REST endpoints, use this strategy:

1. **Use GraphQL for**: Fast queries on supported data (teams, basic games, polls, recruiting)
2. **Use REST for**: Complete game data, team stats, player stats, logos, advanced metrics
3. **Combine**: GraphQL speed + REST completeness in hybrid approach

## API Access Requirements

- **Patreon Tier 3+** subscription required for GraphQL access
- **Same API key** as REST API 
- **Authorization**: `Bearer <API_KEY>` header
- **Endpoint**: `https://graphql.collegefootballdata.com/v1/graphql`

## Performance Notes

- GraphQL can be 2-5x faster for supported queries
- Smaller payload sizes
- Single request for multiple data types
- But limited coverage means REST fallback essential
