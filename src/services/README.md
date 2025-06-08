# API Services Documentation

This directory contains modular API service files organized by functionality. The services are designed to handle all API interactions for the GAMEDAY+ College Football Intelligence Platform.

## Service Modules

### Core Service (`core.js`)
- **Purpose**: Contains the base `fetchData` utility function used by all other services
- **Usage**: Import this for direct API calls or use the specialized service modules

### Team Service (`teamService.js`)
- **Purpose**: Team-related API endpoints
- **Functions**:
  - `getAllTeams()` - Get all college football teams
  - `getTeamById(teamId)` - Get specific team information
  - `getTeamRoster(teamId)` - Get team roster
  - `getTeamSchedule(teamId)` - Get team schedule
  - `getTeamStats(teamId, season)` - Get team statistics
  - `getConferenceTeams(conference)` - Get teams in a conference
  - `getTeamRankings()` - Get team rankings
  - `getTeamOutlook(teamId)` - Get team season outlook

### Player Service (`playerService.js`)
- **Purpose**: Player-related API endpoints
- **Functions**:
  - `getPlayer(playerId)` - Get player information
  - `getPlayerStats(playerId, season)` - Get player statistics
  - `getPlayerGrades(playerId)` - Get player performance grades
  - `getTopPlayers(position, limit)` - Get top players by position
  - `getPlayersByTeam(teamId)` - Get all players on a team
  - `getDraftEligiblePlayers()` - Get NFL draft eligible players
  - `getPlayerComparisons(playerIds)` - Compare multiple players
  - `getInjuryReports()` - Get injury reports
  - `getTransferPortal()` - Get transfer portal data

### Game Service (`gameService.js`)
- **Purpose**: Game and schedule-related API endpoints
- **Functions**:
  - `getUpcomingGames(week)` - Get upcoming games
  - `getGame(gameId)` - Get specific game information
  - `getGameStats(gameId)` - Get game statistics
  - `getGameHighlights(gameId)` - Get game highlights
  - `getScores(date)` - Get game scores
  - `getSchedule(week, conference)` - Get game schedule
  - `getGamePredictions(gameId)` - Get game predictions
  - `getWeeklyGames(week)` - Get games for a specific week

### Betting Service (`bettingService.js`)
- **Purpose**: Betting and odds-related API endpoints
- **Functions**:
  - `getOdds(gameId)` - Get betting odds
  - `getSpreadAnalysis(gameId)` - Get spread analysis
  - `getOverUnderAnalysis(gameId)` - Get over/under analysis
  - `getBettingModels()` - Get betting models
  - `getArbitrageOpportunities()` - Get arbitrage opportunities
  - `getExpectedValue(betType, gameId)` - Get expected value
  - `getBettingSuggestions(week)` - Get betting suggestions
  - `getLineMovements(gameId)` - Get line movements
  - `getPublicBetting(gameId)` - Get public betting data

### News Service (`newsService.js`)
- **Purpose**: News and content-related API endpoints
- **Functions**:
  - `getLatestNews(limit)` - Get latest news
  - `getNewsByCategory(category, limit)` - Get news by category
  - `getDraftNews()` - Get NFL draft news
  - `getCoachingChanges()` - Get coaching changes
  - `getRecruitingNews()` - Get recruiting news
  - `getAnalysis(topic)` - Get analysis articles
  - `getPressConferences()` - Get press conferences
  - `getVideos(category)` - Get videos
  - `getCommitments()` - Get recruiting commitments

### Analytics Service (`analyticsService.js`)
- **Purpose**: Analytics and AI-related API endpoints
- **Functions**:
  - `getTeamMetrics(teamId, metrics)` - Get team analytics
  - `getPlayerMetrics(playerId, metrics)` - Get player analytics
  - `getGamedayGPT(query)` - Query GamedayGPT AI
  - `getAIInsights(teamId, gameId)` - Get AI insights
  - `predictOutcomes(gameId, factors)` - Predict game outcomes
  - `getCoachAnalysis(coachId)` - Get coach analysis
  - `getPerformanceMetrics(entityType, entityId, timeframe)` - Get performance metrics
  - `getAdvancedStats(teamId, statType)` - Get advanced statistics
  - `getWeatherImpact(gameId)` - Get weather impact analysis

### Fan Service (`fanService.js`)
- **Purpose**: Fan engagement and community-related API endpoints
- **Functions**:
  - `getFanForums(category)` - Get fan forums
  - `getFanPredictions(gameId)` - Get fan predictions
  - `getPolls(active)` - Get polls
  - `getSocialFeed(hashtag, limit)` - Get social media feed
  - `getFanStats(userId)` - Get fan statistics
  - `createPost(content, category)` - Create forum post
  - `votePoll(pollId, optionId)` - Vote in poll
  - `submitPrediction(gameId, prediction)` - Submit prediction
  - `getUserProfile(userId)` - Get user profile

### Rankings Service (`rankingsService.js`)
- **Purpose**: Rankings and standings-related API endpoints
- **Functions**:
  - `getCFPRankings()` - Get College Football Playoff rankings
  - `getAPPoll()` - Get AP Poll rankings
  - `getCoachesPoll()` - Get Coaches Poll rankings
  - `getConferenceStandings(conference)` - Get conference standings
  - `getPlayerRankings(position)` - Get player rankings by position
  - `getRecruitingRankings(year, type)` - Get recruiting rankings
  - `getDraftRankings(position)` - Get draft rankings
  - `getCoachRankings()` - Get coach rankings
  - `getStrengthOfSchedule(teamId)` - Get strength of schedule

## Usage Examples

### Direct Service Import
```javascript
import { teamService, playerService } from '../services';

// Get team information
const team = await teamService.getTeamById('alabama');

// Get player stats
const stats = await playerService.getPlayerStats('player123', '2024');
```

### Using the Combined API Object
```javascript
import api from '../services/api';

// Legacy compatibility
const teams = await api.getAllTeams();
const odds = await api.getOdds('game123');
```

### Individual Service Import
```javascript
import { bettingService } from '../services/bettingService';

const spreads = await bettingService.getSpreadAnalysis('game123');
```

## File Structure
```
services/
├── index.js              # Central export file
├── api.js                # Main API module with legacy compatibility
├── core.js               # Core utility functions
├── teamService.js        # Team-related endpoints
├── playerService.js      # Player-related endpoints
├── gameService.js        # Game-related endpoints
├── bettingService.js     # Betting-related endpoints
├── newsService.js        # News-related endpoints
├── analyticsService.js   # Analytics-related endpoints
├── fanService.js         # Fan engagement endpoints
├── rankingsService.js    # Rankings-related endpoints
└── README.md            # This documentation file
```

## Benefits of Modular Structure

1. **Maintainability**: Each service handles a specific domain
2. **Reusability**: Services can be imported individually as needed
3. **Testing**: Easier to unit test individual service modules
4. **Performance**: Tree shaking can eliminate unused code
5. **Development**: Easier to find and modify specific functionality
6. **Collaboration**: Team members can work on different services independently

## Migration Notes

The new modular structure maintains backward compatibility with the original `api.js` approach. Existing code will continue to work, but new development should use the individual service imports for better organization.
