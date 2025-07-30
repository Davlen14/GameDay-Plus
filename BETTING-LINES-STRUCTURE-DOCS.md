# College Football Data API - Betting Lines Structure Documentation

## Overview
This document explains the betting lines data structure from the College Football Data API and how it integrates with the ATSTab component in your GAMEDAY+ FanHub application.

## API Endpoints

### GraphQL Endpoint
- **URL**: `https://graphql.collegefootballdata.com/v1/graphql`
- **Query Field**: `gameLines`
- **Authentication**: Bearer token required

### REST API Endpoint  
- **URL**: `https://api.collegefootballdata.com/lines`
- **Authentication**: Bearer token required
- **Parameters**: year, team, week, seasonType, etc.

## Data Structure

### Game Object Structure
```javascript
{
  "id": 401628455,                    // Unique game identifier
  "season": 2024,                     // Season year
  "seasonType": "regular",            // "regular" or "postseason"
  "week": 1,                          // Week number
  "startDate": "2024-08-31T19:30:00.000Z", // ISO 8601 timestamp
  "homeTeam": "Ohio State",           // Home team name
  "homeConference": "Big Ten",        // Home team conference
  "homeClassification": "fbs",        // Division classification
  "homeScore": 52,                    // Final home team score
  "awayTeam": "Akron",               // Away team name
  "awayConference": "Mid-American",   // Away team conference
  "awayClassification": "fbs",        // Division classification
  "awayScore": 6,                     // Final away team score
  "lines": [                          // Array of betting lines
    // ... betting line objects
  ]
}
```

### Betting Line Object Structure
```javascript
{
  "provider": "ESPN Bet",                    // Sportsbook name
  "spread": -48.5,                          // Point spread (negative = favorite)
  "formattedSpread": "Ohio State -48.5",    // Human-readable spread
  "spreadOpen": -50.5,                      // Opening spread (if available)
  "overUnder": 55.5,                        // Total points line
  "overUnderOpen": 58.0,                    // Opening over/under (if available)
  "homeMoneyline": -6000,                   // Home team moneyline (American odds)
  "awayMoneyline": 1800                     // Away team moneyline (American odds)
}
```

## Available Sportsbook Providers
- **ESPN Bet** (Primary for consensus)
- **DraftKings**
- **Bovada**
- **FanDuel** (in some data)
- **Caesars** (in some data)

## Ohio State 2024 ATS Performance Example

### Regular Season Results
- **Record**: 12-0-0 (100.0% ATS win rate)
- **ROI**: +90.9%
- **Total Profit**: +$1,090.92 (betting $100 per game)

### Notable Games Analysis
1. **vs Michigan (Week 14)**: Lost 10-13 but covered -20.5 spread (+17.5 ATS margin)
2. **@ Oregon (Week 7)**: Lost 31-32 but covered -3.5 spread (+2.5 ATS margin)
3. **vs Nebraska (Week 9)**: Won 21-17, massive cover of -25.5 spread (+29.5 ATS margin)

## ATS Calculation Logic

### Basic ATS Calculation
```javascript
const isHome = game.homeTeam === teamName;
const teamScore = isHome ? game.homeScore : game.awayScore;
const opponentScore = isHome ? game.awayScore : game.homeScore;
const actualMargin = teamScore - opponentScore;

// Adjust spread for away games
const adjustedSpread = isHome ? spread : -spread;
const atsMargin = actualMargin - adjustedSpread;

// Determine result
if (Math.abs(atsMargin) < 0.5) return 'PUSH';
else if (atsMargin > 0) return 'WIN';
else return 'LOSS';
```

### ROI Calculation
```javascript
// Standard -110 odds calculation
const roi = atsResult === 'WIN' ? 90.91 : 
           atsResult === 'LOSS' ? -100 : 0;
```

## Integration with ATSTab Component

### Service Layer Integration
```javascript
// From bettingService.js
const getTeamLines = async (team, year, seasonType) => {
  return await fetchCollegeFootballData('/lines', { 
    team, 
    year, 
    seasonType 
  });
};
```

### Data Processing in ATSTab
```javascript
// Calculate ATS metrics for games and lines
const calculateATSMetrics = (games, lines, team) => {
  // Process each game
  games.forEach(game => {
    // Find corresponding betting lines
    const gameLines = lines.filter(line => line.gameId === game.id);
    
    // Use consensus line (ESPN Bet preferred)
    const consensusLine = gameLines.find(line => line.provider === 'ESPN Bet') 
                         || gameLines[0];
    
    // Calculate ATS performance
    const atsResult = calculateATSResult(game, consensusLine.spread, team);
    
    // Update metrics
    updateATSMetrics(atsResult);
  });
};
```

## Key Features for ATSTab

### 1. Multi-Provider Line Comparison
- Compare spreads across ESPN Bet, DraftKings, Bovada
- Track line movement (opening vs closing)
- Identify best available lines

### 2. Situational Analysis
- **Home vs Away**: Performance at home versus on the road
- **Favorite vs Underdog**: Performance when favored vs being dogs
- **Spread Size Categories**:
  - Small spreads (0-3 points)
  - Medium spreads (3.5-7 points)
  - Large spreads (7.5-14 points)
  - Huge spreads (14+ points)

### 3. Historical Trends
- Yearly ATS performance tracking
- Week-by-week analysis
- Conference vs non-conference performance

### 4. ROI Tracking
- Track betting profitability over time
- Calculate break-even percentages
- Show profit/loss in dollar terms

## Error Handling & Fallbacks

### Missing Betting Lines
When betting lines aren't available, the ATSTab component uses estimation:

```javascript
const estimateSpread = (game, team) => {
  const isHome = game.home_team === team.school;
  const homeAdvantage = 3; // Standard home field advantage
  const baseSpread = Math.random() * 14 - 7; // -7 to +7 range
  return isHome ? baseSpread + homeAdvantage : baseSpread - homeAdvantage;
};
```

### API Rate Limiting
- Cache results for 6 hours
- Smart routing: Vercel function → Direct API
- Graceful degradation to estimated lines

## Performance Optimizations

### 1. Caching Strategy
```javascript
const cacheKey = `ats-${team1.school}-${team2.school}-${selectedTimeframe}`;
const cachedData = localStorage.getItem(cacheKey);
```

### 2. Parallel Data Fetching
```javascript
const [team1Data, team2Data] = await Promise.all([
  getATSHistory(team1, analysisYears, team1Records),
  getATSHistory(team2, analysisYears, team2Records)
]);
```

### 3. Progressive Loading
- Show loading progress percentage
- Display results as they're calculated
- Animate cards after data loads

## API Usage Monitoring

The ATSTab component tracks:
- Total API calls made
- Lines found vs estimated
- Data source (API vs cache vs hybrid)
- Last update timestamp
- Records used from existing data

This comprehensive betting lines structure provides everything needed for sophisticated ATS analysis in your GAMEDAY+ FanHub application! 🚀
