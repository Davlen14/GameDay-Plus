# Player Statistics Reference - GAMEDAY+ FanHub

## Overview
This document outlines the expected player statistics for each position in college football, the current API data structure, and how stats should be displayed in the Player Detail Modal.

## Current API Structure
All player stats come from the College Football Data API endpoint: `/stats/player/season`

**Base JSON Structure:**
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

## Position-Specific Statistics

### QUARTERBACK (QB)

#### **Passing Stats** (category: `passing`)
- **ATT**: Passing Attempts
- **COMPLETIONS**: Completed Passes
- **YDS**: Passing Yards
- **TD**: Passing Touchdowns
- **INT**: Interceptions Thrown
- **PCT**: Completion Percentage (0.0-1.0)
- **YPA**: Yards Per Attempt

#### **Rushing Stats** (category: `rushing`)
- **CAR**: Carries/Rushing Attempts
- **YDS**: Rushing Yards
- **TD**: Rushing Touchdowns
- **LONG**: Longest Rush
- **YPC**: Yards Per Carry

#### **Display Priority for QB:**
1. Passing Yards
2. Passing TDs
3. Completion % (from PCT * 100)
4. Completions/Attempts
5. Interceptions
6. Rushing Yards
7. Rushing TDs

---

### RUNNING BACK (RB)

#### **Rushing Stats** (category: `rushing`)
- **CAR**: Carries/Rushing Attempts
- **YDS**: Rushing Yards
- **TD**: Rushing Touchdowns
- **LONG**: Longest Rush
- **YPC**: Yards Per Carry

#### **Receiving Stats** (category: `receiving`)
- **REC**: Receptions
- **YDS**: Receiving Yards
- **TD**: Receiving Touchdowns
- **LONG**: Longest Reception
- **YPR**: Yards Per Reception

#### **Display Priority for RB:**
1. Rushing Yards
2. Rushing TDs
3. Carries
4. Receiving Yards
5. Receptions
6. Receiving TDs

---

### WIDE RECEIVER (WR)

#### **Receiving Stats** (category: `receiving`)
- **REC**: Receptions
- **YDS**: Receiving Yards
- **TD**: Receiving Touchdowns
- **LONG**: Longest Reception
- **YPR**: Yards Per Reception

#### **Rushing Stats** (category: `rushing`) - Optional
- **CAR**: Carries (if any)
- **YDS**: Rushing Yards (if any)
- **TD**: Rushing Touchdowns (if any)

#### **Display Priority for WR:**
1. Receiving Yards
2. Receptions
3. Receiving TDs
4. Rushing Yards (if > 0)
5. Rushing TDs (if > 0)

---

### TIGHT END (TE)

#### **Receiving Stats** (category: `receiving`)
- **REC**: Receptions
- **YDS**: Receiving Yards
- **TD**: Receiving Touchdowns
- **LONG**: Longest Reception
- **YPR**: Yards Per Reception

#### **Display Priority for TE:**
1. Receiving Yards
2. Receptions
3. Receiving TDs

---

### OFFENSIVE LINE (OL)
**Note:** Offensive linemen typically don't have statistical categories in standard APIs. They may occasionally appear in defensive stats if they recover fumbles or score defensive touchdowns.

#### **Display for OL:**
- Show "No statistical data" or "No playing time recorded"
- Focus on Bio information (height, weight, year, hometown)

---

### DEFENSIVE LINE (DL)

#### **Defensive Stats** (category: `defensive`)
- **TOT**: Total Tackles
- **SOLO**: Solo Tackles
- **SACKS**: Sacks
- **TFL**: Tackles For Loss
- **PD**: Passes Defensed
- **QB HUR**: Quarterback Hurries
- **TD**: Defensive Touchdowns

#### **Display Priority for DL:**
1. Total Tackles
2. Sacks
3. Tackles For Loss
4. QB Hurries
5. Passes Defensed

---

### LINEBACKER (LB)

#### **Defensive Stats** (category: `defensive`)
- **TOT**: Total Tackles
- **SOLO**: Solo Tackles  
- **SACKS**: Sacks
- **TFL**: Tackles For Loss
- **PD**: Passes Defensed
- **QB HUR**: Quarterback Hurries

#### **Interception Stats** (category: `interceptions`)
- **INT**: Number of Interceptions
- **YDS**: Interception Return Yards
- **TD**: Interception Return Touchdowns
- **LONG**: Longest Interception Return
- **AVG**: Average Yards Per Interception

#### **Display Priority for LB:**
1. Total Tackles
2. Sacks
3. Interceptions
4. Tackles For Loss
5. Passes Defensed
6. Forced Fumbles

---

### DEFENSIVE BACK (DB)

#### **Defensive Stats** (category: `defensive`)
- **TOT**: Total Tackles
- **SOLO**: Solo Tackles
- **PD**: Passes Defensed
- **QB HUR**: Quarterback Hurries

#### **Interception Stats** (category: `interceptions`)
- **INT**: Number of Interceptions
- **YDS**: Interception Return Yards
- **TD**: Interception Return Touchdowns
- **LONG**: Longest Interception Return
- **AVG**: Average Yards Per Interception

#### **Display Priority for DB:**
1. Interceptions
2. Passes Defensed
3. Total Tackles
4. Interception Return Yards
5. Interception Return TDs

---

### KICKER (K)

#### **Kicking Stats** (category: `kicking`)
- **FGM**: Field Goals Made
- **FGA**: Field Goal Attempts
- **PCT**: Field Goal Percentage
- **LONG**: Longest Field Goal
- **XPM**: Extra Points Made
- **XPA**: Extra Point Attempts
- **PTS**: Total Points Scored

#### **Display Priority for K:**
1. Field Goals (FGM/FGA)
2. Field Goal % (PCT * 100)
3. Extra Points (XPM/XPA)
4. Longest Field Goal
5. Total Points

---

### PUNTER (P)

#### **Punting Stats** (category: `punting`)
- **PUNTS**: Number of Punts
- **YDS**: Total Punting Yards
- **YPP**: Yards Per Punt
- **LONG**: Longest Punt
- **IN20**: Punts Inside 20-yard Line
- **TB**: Touchbacks
- **NET**: Net Punting Average

#### **Display Priority for P:**
1. Yards Per Punt
2. Total Punts
3. Punts Inside 20
4. Net Average
5. Longest Punt

---

## Handling Players with No Stats

### Criteria for "No Playing Time"
1. **Freshmen (FR)**: Automatically show "No playing time" unless they have actual stats
2. **Any Player**: If no stats exist in API for any category relevant to their position
3. **Redshirts**: Players who didn't play due to redshirt year

### Display Messages
- **"No playing time this season"** - For players with zero stats
- **"Redshirt season"** - If player data indicates redshirt status
- **"Limited playing time"** - For players with minimal stats (< 5 in primary category)

---

## API Data Processing Logic

### Current Implementation Issues
1. **Sample data overriding real data** - Need to check if real stats exist first
2. **Incorrect stat mapping** - Some positions showing wrong categories
3. **Missing null checks** - Not handling missing data gracefully

### Recommended Processing Flow
```javascript
const processPlayerStats = (statsArray, position, player) => {
  // 1. Check if any real stats exist
  if (!statsArray || statsArray.length === 0) {
    return { hasStats: false, position, player };
  }
  
  // 2. Organize stats by category
  const statsByCategory = {};
  statsArray.forEach(stat => {
    if (!statsByCategory[stat.category]) {
      statsByCategory[stat.category] = {};
    }
    statsByCategory[stat.category][stat.statType] = stat.stat;
  });
  
  // 3. Map to display format based on position
  return mapStatsForPosition(statsByCategory, position, player);
};
```

---

## Debug Information Structure

### Debug Data to Show
```javascript
{
  "apiCalls": [
    {
      "endpoint": "/stats/player/season",
      "params": { "year": 2024, "team": "Alabama" },
      "responseCount": 156,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "rawStats": [
    {
      "category": "passing",
      "statType": "YDS", 
      "stat": "3485",
      "player": "Carson Beck"
    }
  ],
  "processedStats": {
    "passingYards": 3485,
    "passingTDs": 28,
    "hasStats": true
  },
  "position": "QB",
  "playerInfo": {
    "name": "Carson Beck",
    "year": "SR",
    "team": "Georgia"
  }
}
```

### Debug Modal Features
1. **Raw API Response** - Show exactly what came from API
2. **Processing Steps** - Show how raw data was transformed
3. **Missing Stats** - Highlight what stats should exist but don't
4. **Sample vs Real** - Clearly indicate if showing sample data

---

## Implementation Priorities

1. **Fix stats display logic** - Stop showing sample data when real data exists
2. **Add "No Playing Time" detection** - Properly handle players without stats
3. **Add debug modal** - Help diagnose API data issues
4. **Improve error handling** - Better fallbacks for missing data
5. **Add stat validation** - Ensure stats make sense for position

---

## Testing Checklist

- [ ] QB with real passing stats shows actual data
- [ ] RB with real rushing stats shows actual data  
- [ ] Freshman with no stats shows "No playing time"
- [ ] OL players show appropriate message
- [ ] Debug modal shows accurate API data
- [ ] Sample data only used when no real data exists
- [ ] All position-specific stats display correctly
- [ ] Error states handled gracefully
