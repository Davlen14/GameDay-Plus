# Offensive Player Stats Structure - College Football Data API

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
  "category": "stat_category",
  "statType": "STAT_TYPE",
  "stat": "value"
}
```

---

## QUARTERBACK (QB) - Passing Stats

**Example Player**: Carson Beck (Georgia)
**Category**: `passing`

### Available Stat Types:
```json
[
  {
    "season": 2024,
    "playerId": "4430841",
    "player": "Carson Beck",
    "position": "QB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "passing",
    "statType": "ATT",
    "stat": "448"
  },
  {
    "season": 2024,
    "playerId": "4430841",
    "player": "Carson Beck",
    "position": "QB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "passing",
    "statType": "COMPLETIONS",
    "stat": "290"
  },
  {
    "season": 2024,
    "playerId": "4430841",
    "player": "Carson Beck",
    "position": "QB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "passing",
    "statType": "INT",
    "stat": "12"
  },
  {
    "season": 2024,
    "playerId": "4430841",
    "player": "Carson Beck",
    "position": "QB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "passing",
    "statType": "PCT",
    "stat": "0.647"
  },
  {
    "season": 2024,
    "playerId": "4430841",
    "player": "Carson Beck",
    "position": "QB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "passing",
    "statType": "TD",
    "stat": "28"
  },
  {
    "season": 2024,
    "playerId": "4430841",
    "player": "Carson Beck",
    "position": "QB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "passing",
    "statType": "YDS",
    "stat": "3485"
  },
  {
    "season": 2024,
    "playerId": "4430841",
    "player": "Carson Beck",
    "position": "QB",
    "team": "Georgia",
    "conference": "SEC",
    "category": "passing",
    "statType": "YPA",
    "stat": "7.8"
  }
]
```

### Passing Stat Types:
- **ATT**: Passing Attempts
- **COMPLETIONS**: Completed Passes  
- **INT**: Interceptions Thrown
- **PCT**: Completion Percentage
- **TD**: Passing Touchdowns
- **YDS**: Passing Yards
- **YPA**: Yards Per Attempt

---

## QUARTERBACK (QB) - Rushing Stats

**Example Player**: Jalen Milroe (Alabama)
**Category**: `rushing`

### Available Stat Types:
```json
[
  {
    "season": 2024,
    "playerId": "4432734",
    "player": "Jalen Milroe",
    "position": "QB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "rushing",
    "statType": "CAR",
    "stat": "152"
  },
  {
    "season": 2024,
    "playerId": "4432734",
    "player": "Jalen Milroe",
    "position": "QB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "rushing",
    "statType": "LONG",
    "stat": "75"
  },
  {
    "season": 2024,
    "playerId": "4432734",
    "player": "Jalen Milroe",
    "position": "QB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "rushing",
    "statType": "TD",
    "stat": "20"
  },
  {
    "season": 2024,
    "playerId": "4432734",
    "player": "Jalen Milroe",
    "position": "QB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "rushing",
    "statType": "YDS",
    "stat": "719"
  },
  {
    "season": 2024,
    "playerId": "4432734",
    "player": "Jalen Milroe",
    "position": "QB",
    "team": "Alabama",
    "conference": "SEC",
    "category": "rushing",
    "statType": "YPC",
    "stat": "4.7"
  }
]
```

### Rushing Stat Types:
- **CAR**: Carries/Rushing Attempts
- **LONG**: Longest Rush
- **TD**: Rushing Touchdowns
- **YDS**: Rushing Yards
- **YPC**: Yards Per Carry

---

## RUNNING BACK (RB) - Rushing Stats

**Category**: `rushing`

### Available Stat Types:
- **CAR**: Carries/Rushing Attempts
- **LONG**: Longest Rush  
- **TD**: Rushing Touchdowns
- **YDS**: Rushing Yards
- **YPC**: Yards Per Carry

---

## RUNNING BACK (RB) - Receiving Stats

**Category**: `receiving`

### Available Stat Types:
- **LONG**: Longest Reception
- **REC**: Receptions
- **TD**: Receiving Touchdowns
- **YDS**: Receiving Yards
- **YPR**: Yards Per Reception

---

## WIDE RECEIVER (WR) - Receiving Stats

**Category**: `receiving`

### Available Stat Types:
- **LONG**: Longest Reception
- **REC**: Receptions
- **TD**: Receiving Touchdowns  
- **YDS**: Receiving Yards
- **YPR**: Yards Per Reception

---

## TIGHT END (TE) - Receiving Stats

**Example Player**: C.J. Dippre (Alabama)
**Category**: `receiving`

### Available Stat Types:
```json
[
  {
    "season": 2024,
    "playerId": "4596545",
    "player": "C.J. Dippre",
    "position": "TE",
    "team": "Alabama",
    "conference": "SEC",
    "category": "receiving",
    "statType": "LONG",
    "stat": "46"
  },
  {
    "season": 2024,
    "playerId": "4596545",
    "player": "C.J. Dippre",
    "position": "TE",
    "team": "Alabama",
    "conference": "SEC",
    "category": "receiving",
    "statType": "REC",
    "stat": "19"
  },
  {
    "season": 2024,
    "playerId": "4596545",
    "player": "C.J. Dippre",
    "position": "TE",
    "team": "Alabama",
    "conference": "SEC",
    "category": "receiving",
    "statType": "TD",
    "stat": "0"
  },
  {
    "season": 2024,
    "playerId": "4596545",
    "player": "C.J. Dippre",
    "position": "TE",
    "team": "Alabama",
    "conference": "SEC",
    "category": "receiving",
    "statType": "YDS",
    "stat": "343"
  },
  {
    "season": 2024,
    "playerId": "4596545",
    "player": "C.J. Dippre",
    "position": "TE",
    "team": "Alabama",
    "conference": "SEC",
    "category": "receiving",
    "statType": "YPR",
    "stat": "18.1"
  }
]
```

### Receiving Stat Types:
- **LONG**: Longest Reception
- **REC**: Receptions
- **TD**: Receiving Touchdowns
- **YDS**: Receiving Yards  
- **YPR**: Yards Per Reception

---

## OFFENSIVE LINE (OL)

**Note**: Offensive linemen typically don't appear in standard statistical categories like passing, rushing, or receiving. They may occasionally appear in defensive stats if they recover fumbles or score defensive touchdowns.

---

## PLACEKICKER (PK) - Kicking Stats

**Example Player**: Reid Schuback (Alabama)
**Category**: `kicking`

### Available Stat Types:
```json
[
  {
    "season": 2024,
    "playerId": "4880051",
    "player": "Reid Schuback",
    "position": "PK",
    "team": "Alabama",
    "conference": "SEC",
    "category": "kicking",
    "statType": "FGA",
    "stat": "27"
  },
  {
    "season": 2024,
    "playerId": "4880051",
    "player": "Reid Schuback",
    "position": "PK",
    "team": "Alabama",
    "conference": "SEC",
    "category": "kicking",
    "statType": "FGM",
    "stat": "21"
  },
  {
    "season": 2024,
    "playerId": "4880051",
    "player": "Reid Schuback",
    "position": "PK",
    "team": "Alabama",
    "conference": "SEC",
    "category": "kicking",
    "statType": "LONG",
    "stat": "53"
  },
  {
    "season": 2024,
    "playerId": "4880051",
    "player": "Reid Schuback",
    "position": "PK",
    "team": "Alabama",
    "conference": "SEC",
    "category": "kicking",
    "statType": "PCT",
    "stat": "0.778"
  },
  {
    "season": 2024,
    "playerId": "4880051",
    "player": "Reid Schuback",
    "position": "PK",
    "team": "Alabama",
    "conference": "SEC",
    "category": "kicking",
    "statType": "PTS",
    "stat": "105"
  },
  {
    "season": 2024,
    "playerId": "4880051",
    "player": "Reid Schuback",
    "position": "PK",
    "team": "Alabama",
    "conference": "SEC",
    "category": "kicking",
    "statType": "XPA",
    "stat": "42"
  },
  {
    "season": 2024,
    "playerId": "4880051",
    "player": "Reid Schuback",
    "position": "PK",
    "team": "Alabama",
    "conference": "SEC",
    "category": "kicking",
    "statType": "XPM",
    "stat": "42"
  }
]
```

### Kicking Stat Types:
- **FGA**: Field Goal Attempts
- **FGM**: Field Goals Made
- **LONG**: Longest Field Goal
- **PCT**: Field Goal Percentage
- **PTS**: Total Points Scored
- **XPA**: Extra Point Attempts
- **XPM**: Extra Points Made

---

## API Usage Examples

### Get All Passing Stats for a Team
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.collegefootballdata.com/stats/player/season?year=2024&seasonType=regular&category=passing&team=Alabama"
```

### Get All Rushing Stats for a Team  
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.collegefootballdata.com/stats/player/season?year=2024&seasonType=regular&category=rushing&team=Alabama"
```

### Get All Receiving Stats for a Team
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.collegefootballdata.com/stats/player/season?year=2024&seasonType=regular&category=receiving&team=Alabama"
```

### Get All Kicking Stats for a Team
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.collegefootballdata.com/stats/player/season?year=2024&seasonType=regular&category=kicking&team=Alabama"
```

---

## Query Parameters

- **year** (required): Season year (e.g., 2024)
- **seasonType**: "regular", "postseason" (default: regular)
- **category**: "passing", "rushing", "receiving", "kicking" for offense
- **team**: Specific team name (e.g., "Alabama", "Georgia")
- **conference**: Conference filter (e.g., "SEC", "Big Ten")
- **week**: Specific week number
- **player**: Specific player name

---

## Rate Limits & Authentication

- Requires API key from collegefootballdata.com
- Include as Bearer token in Authorization header
- Free tier has rate limits - check API documentation for current limits
