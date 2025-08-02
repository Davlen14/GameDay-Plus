# Defensive Player Stats Structure - College Football Data API

## API Endpoint
```
https://api.collegefootballdata.com/stats/player/season
```

## Authentication
```bash
curl -H "Authorization: Bearer YOUR_API_KEY"
```

## Base JSON Structure
Each stat entry follows this structure:
```json
{
  "season": 2024,
  "playerId": "string",
  "player": "Player Name",
  "position": "POSITION_CODE",
  "team": "Team Name",
  "conference": "Conference",
  "category": "defensive",
  "statType": "STAT_TYPE",
  "stat": "value"
}
```

---

## LINEBACKER (LB) - Defensive Stats

**Example Player**: Cayden Jones (Alabama)
**Category**: `defensive`

### Available Stat Types:
```json
[
  {
    "season": 2024,
    "playerId": "5079479",
    "player": "Cayden Jones",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "PD",
    "stat": "1"
  },
  {
    "season": 2024,
    "playerId": "5079479",
    "player": "Cayden Jones",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "QB HUR",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "5079479",
    "player": "Cayden Jones",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "SACKS",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "5079479",
    "player": "Cayden Jones",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "SOLO",
    "stat": "4"
  },
  {
    "season": 2024,
    "playerId": "5079479",
    "player": "Cayden Jones",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "TD",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "5079479",
    "player": "Cayden Jones",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "TFL",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "5079479",
    "player": "Cayden Jones",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "TOT",
    "stat": "6"
  }
]
```

---

## DEFENSIVE LINE (DL) - Defensive Stats

**Example Player**: Tim Keenan III (Alabama)
**Category**: `defensive`

### Available Stat Types:
```json
[
  {
    "season": 2024,
    "playerId": "4431414",
    "player": "Tim Keenan III",
    "position": "DL",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "PD",
    "stat": "1"
  },
  {
    "season": 2024,
    "playerId": "4431414",
    "player": "Tim Keenan III",
    "position": "DL",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "QB HUR",
    "stat": "2"
  },
  {
    "season": 2024,
    "playerId": "4431414",
    "player": "Tim Keenan III",
    "position": "DL",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "SACKS",
    "stat": "2.5"
  },
  {
    "season": 2024,
    "playerId": "4431414",
    "player": "Tim Keenan III",
    "position": "DL",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "SOLO",
    "stat": "15"
  },
  {
    "season": 2024,
    "playerId": "4431414",
    "player": "Tim Keenan III",
    "position": "DL",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "TD",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "4431414",
    "player": "Tim Keenan III",
    "position": "DL",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "TFL",
    "stat": "4"
  },
  {
    "season": 2024,
    "playerId": "4431414",
    "player": "Tim Keenan III",
    "position": "DL",
    "team": "Alabama",
    "conference": "SEC",
    "category": "defensive",
    "statType": "TOT",
    "stat": "28"
  }
]
```

---

## DEFENSIVE BACK (DB) - Defensive Stats

**Example Player**: Chris Peal (Georgia)
**Category**: `defensive`

### Available Stat Types:
```json
[
  {
    "season": 2024,
    "playerId": "4870944",
    "player": "Chris Peal",
    "position": "DB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "defensive",
    "statType": "PD",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "4870944",
    "player": "Chris Peal",
    "position": "DB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "defensive",
    "statType": "QB HUR",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "4870944",
    "player": "Chris Peal",
    "position": "DB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "defensive",
    "statType": "SACKS",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "4870944",
    "player": "Chris Peal",
    "position": "DB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "defensive",
    "statType": "SOLO",
    "stat": "1"
  },
  {
    "season": 2024,
    "playerId": "4870944",
    "player": "Chris Peal",
    "position": "DB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "defensive",
    "statType": "TD",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "4870944",
    "player": "Chris Peal",
    "position": "DB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "defensive",
    "statType": "TFL",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "4870944",
    "player": "Chris Peal",
    "position": "DB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "defensive",
    "statType": "TOT",
    "stat": "1"
  }
]
```

---

## DEFENSIVE END (DE) - Defensive Stats

**Position**: DE
**Category**: `defensive`

### Available Stat Types:
- **PD**: Passes Defensed
- **QB HUR**: Quarterback Hurries
- **SACKS**: Sacks
- **SOLO**: Solo Tackles
- **TD**: Touchdowns (defensive/fumble/interception returns)
- **TFL**: Tackles For Loss
- **TOT**: Total Tackles

---

## DEFENSIVE TACKLE (DT) - Defensive Stats

**Position**: DT
**Category**: `defensive`

### Available Stat Types:
- **PD**: Passes Defensed
- **QB HUR**: Quarterback Hurries
- **SACKS**: Sacks
- **SOLO**: Solo Tackles
- **TD**: Touchdowns (defensive/fumble/interception returns)
- **TFL**: Tackles For Loss
- **TOT**: Total Tackles

---

## INTERCEPTION STATS

**Example Player**: Deontae Lawson (Alabama LB)
**Category**: `interceptions`

### Available Stat Types:
```json
[
  {
    "season": 2024,
    "playerId": "4432725",
    "player": "Deontae Lawson",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "interceptions",
    "statType": "AVG",
    "stat": "0.0"
  },
  {
    "season": 2024,
    "playerId": "4432725",
    "player": "Deontae Lawson",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "interceptions",
    "statType": "INT",
    "stat": "1"
  },
  {
    "season": 2024,
    "playerId": "4432725",
    "player": "Deontae Lawson",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "interceptions",
    "statType": "LONG",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "4432725",
    "player": "Deontae Lawson",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "interceptions",
    "statType": "TD",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "4432725",
    "player": "Deontae Lawson",
    "position": "LB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "interceptions",
    "statType": "YDS",
    "stat": "0"
  }
]
```

### Interception Stat Types:
- **AVG**: Average Yards Per Interception
- **INT**: Number of Interceptions
- **LONG**: Longest Interception Return
- **TD**: Interception Return Touchdowns
- **YDS**: Interception Return Yards

---

## PUNTER (P) - Punting Stats

**Position**: P
**Category**: `punting`

### Available Stat Types:
- **IN20**: Punts Inside 20-yard Line
- **LONG**: Longest Punt
- **NET**: Net Punting Average
- **PUNTS**: Number of Punts
- **TB**: Touchbacks
- **YDS**: Total Punting Yards
- **YPP**: Yards Per Punt

---

## All Defensive Stat Types Summary

### Standard Defensive Stats (`defensive` category):
- **PD**: Passes Defensed
- **QB HUR**: Quarterback Hurries  
- **SACKS**: Sacks
- **SOLO**: Solo Tackles
- **TD**: Touchdowns (defensive scores)
- **TFL**: Tackles For Loss
- **TOT**: Total Tackles

### Interception Stats (`interceptions` category):
- **AVG**: Average Yards Per Interception
- **INT**: Number of Interceptions
- **LONG**: Longest Interception Return
- **TD**: Interception Return Touchdowns
- **YDS**: Interception Return Yards

### Fumble Recovery Stats (`fumbles` category):
- **FUM**: Fumbles Recovered
- **TD**: Fumble Return Touchdowns
- **YDS**: Fumble Return Yards

---

## API Usage Examples

### Get All Defensive Stats for a Team
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.collegefootballdata.com/stats/player/season?year=2024&seasonType=regular&category=defensive&team=Alabama"
```

### Get Interception Stats for a Team
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.collegefootballdata.com/stats/player/season?year=2024&seasonType=regular&category=interceptions&team=Alabama"
```

### Get Punting Stats for a Team
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.collegefootballdata.com/stats/player/season?year=2024&seasonType=regular&category=punting&team=Alabama"
```

---

## Defensive Position Codes
- **LB**: Linebacker
- **DL**: Defensive Line
- **DB**: Defensive Back (includes corners, safeties)
- **DE**: Defensive End
- **DT**: Defensive Tackle
- **P**: Punter

---

## Query Parameters

- **year** (required): Season year (e.g., 2024)
- **seasonType**: "regular", "postseason" (default: regular)
- **category**: "defensive", "interceptions", "punting", "fumbles"
- **team**: Specific team name (e.g., "Alabama", "Georgia")
- **conference**: Conference filter (e.g., "SEC", "Big Ten")
- **week**: Specific week number
- **player**: Specific player name

---

## Rate Limits & Authentication

- Requires API key from collegefootballdata.com
- Include as Bearer token in Authorization header
- Free tier has rate limits - check API documentation for current limits
