# Team Logos and Colors Implementation Guide

## Overview
This guide explains how the GameDetailView component handles team logos and colors for home and away teams when rendering game details.

## Data Flow Architecture

### 1. Team Data Loading
```javascript
// Teams are loaded from the teamService
const teamsData = await teamService.getFBSTeams(true);
setTeams(teamsData);

// Team data structure from API includes:
// - id: unique team identifier
// - school: team name (e.g., "Alabama", "Georgia")
// - logos: array of logo URLs
// - color: primary team color (hex format)
// - conference: team's conference
// - mascot: team mascot name
```

### 2. Team Retrieval Functions

#### Getting Team Data
```javascript
// Helper function to find team by ID
const getTeam = (teamId) => teams.find(team => team.id === teamId) || {};

// Get away and home teams from current game
const awayTeam = currentGame ? getTeam(currentGame.away_id || currentGame.awayId) : {};
const homeTeam = currentGame ? getTeam(currentGame.home_id || currentGame.homeId) : {};
```

## Logo Implementation

### Logo Retrieval Function
```javascript
const getTeamLogo = (teamId) => {
  const team = getTeam(teamId);
  return team?.logos?.[0] || '/photos/ncaaf.png';
};
```

### Logo Rendering with LazyImage
```javascript
<LazyImage
  src={getTeamLogo(currentGame?.away_id || currentGame?.awayId)}
  alt={awayTeam?.school || 'Away Team'}
  className="w-32 h-32 object-contain relative z-10 transition-transform duration-300 hover:scale-105"
  placeholder="/photos/ncaaf.png"
/>
```

### Key Logo Features:
- **Fallback Strategy**: If team logo not found, uses default `/photos/ncaaf.png`
- **Lazy Loading**: Uses LazyImage component for performance
- **Responsive Design**: 128px x 128px (w-32 h-32) with hover effects
- **3D Effects**: Multiple shadow layers and glowing ring animations

## Color Implementation

### Color Retrieval Function
```javascript
const getTeamColor = (teamId) => {
  const team = getTeam(teamId);
  if (team.color) {
    return team.color;
  }
  // Fallback colors: Blue for away, Red for home
  return teamId === (currentGame?.away_id || currentGame?.awayId) ? '#3B82F6' : '#EF4444';
};

const awayColor = currentGame ? getTeamColor(currentGame.away_id || currentGame.awayId) : '#3B82F6';
const homeColor = currentGame ? getTeamColor(currentGame.home_id || currentGame.homeId) : '#EF4444';
```

### Color Processing for CSS
```javascript
// Convert hex to RGB for CSS rgba usage
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 59, g: 130, b: 246 };
};

const awayRgb = hexToRgb(awayColor);
const homeRgb = hexToRgb(homeColor);
const awayColorRgb = `${awayRgb.r}, ${awayRgb.g}, ${awayRgb.b}`;
const homeColorRgb = `${homeRgb.r}, ${homeRgb.g}, ${homeRgb.b}`;
```

## Visual Effects Using Team Colors

### 1. Header Gradient Background
```javascript
background: `linear-gradient(to right, 
  rgba(${awayColorRgb}, 1) 0%, 
  rgba(${awayColorRgb}, 0.95) 20%, 
  rgba(${awayColorRgb}, 0.8) 35%, 
  rgba(${awayColorRgb}, 0.7) 45%, 
  rgba(${awayColorRgb}, 0.6) 48%, 
  rgba(${homeColorRgb}, 0.6) 52%, 
  rgba(${homeColorRgb}, 0.7) 55%, 
  rgba(${homeColorRgb}, 0.8) 65%, 
  rgba(${homeColorRgb}, 0.95) 80%, 
  rgba(${homeColorRgb}, 1) 100%)`
```

### 2. 3D Logo Shadow Effects
```javascript
// Away team logo shadow
<div 
  className="absolute inset-0 w-32 h-32"
  style={{
    background: `radial-gradient(circle, rgba(${awayColorRgb}, 0.4) 0%, transparent 70%)`,
    filter: 'blur(25px)',
    transform: 'translateY(8px) scale(1.1)',
  }}
/>
```

### 3. Glowing Ring Animations
```javascript
// Rotating color ring around logo
<div 
  className="absolute inset-0 w-32 h-32 rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-500"
  style={{
    background: `conic-gradient(from 0deg, 
      rgba(${awayColorRgb}, 0.8) 0deg,
      transparent 60deg,
      rgba(${awayColorRgb}, 0.4) 120deg,
      transparent 180deg,
      rgba(${awayColorRgb}, 0.6) 240deg,
      transparent 300deg,
      rgba(${awayColorRgb}, 0.8) 360deg)`,
    filter: 'blur(8px)',
    animation: 'spin 20s linear infinite',
    transform: 'scale(1.3)',
  }}
/>
```

### 4. Score Display Styling
```javascript
// Score background using team colors
style={{ 
  textShadow: `0 4px 12px rgba(${awayColorRgb}, 0.8), 0 6px 16px rgba(0,0,0,0.5)`,
  background: `linear-gradient(135deg, 
    rgba(${awayColorRgb}, 0.2) 0%,
    rgba(${awayColorRgb}, 0.1) 50%,
    rgba(${awayColorRgb}, 0.2) 100%)`,
  border: `1px solid rgba(${awayColorRgb}, 0.3)`,
  backdropFilter: 'blur(20px)',
}}
```

## Data Field Mapping

### Game Data Fields
- **Away Team ID**: `currentGame.away_id` or `currentGame.awayId`
- **Home Team ID**: `currentGame.home_id` or `currentGame.homeId`
- **Away Team Name**: `currentGame.away_team` or `awayTeam.school`
- **Home Team Name**: `currentGame.home_team` or `homeTeam.school`

### Team Data Fields
- **Logo**: `team.logos[0]` (first logo in array)
- **Color**: `team.color` (hex format like "#9E1B32")
- **School**: `team.school` (full team name)
- **Conference**: `team.conference`
- **Mascot**: `team.mascot`
- **Ranking**: `team.ranking` (if available)

## Fallback Strategy

### Logo Fallbacks
1. Primary: `team.logos[0]` (from API)
2. Fallback: `/photos/ncaaf.png` (default football logo)

### Color Fallbacks
1. Primary: `team.color` (from API)
2. Away Fallback: `#3B82F6` (blue)
3. Home Fallback: `#EF4444` (red)

## Performance Optimizations

### LazyImage Component
- Delays loading until image is in viewport
- Shows placeholder while loading
- Handles error states gracefully

### Color Processing
- Colors processed once and reused throughout component
- RGB conversion done at component level, not per element

## Usage Pattern for New Components

```javascript
// 1. Load teams data
const [teams, setTeams] = useState([]);
useEffect(() => {
  const loadTeams = async () => {
    const teamsData = await teamService.getFBSTeams(true);
    setTeams(teamsData);
  };
  loadTeams();
}, []);

// 2. Helper functions
const getTeam = (teamId) => teams.find(team => team.id === teamId) || {};
const getTeamLogo = (teamId) => {
  const team = getTeam(teamId);
  return team?.logos?.[0] || '/photos/ncaaf.png';
};
const getTeamColor = (teamId) => {
  const team = getTeam(teamId);
  return team.color || '#1F2937'; // default gray
};

// 3. Get team data for game
const awayTeam = getTeam(game.away_id);
const homeTeam = getTeam(game.home_id);

// 4. Render with logo and colors
<img src={getTeamLogo(game.away_id)} alt={awayTeam.school} />
<div style={{ backgroundColor: getTeamColor(game.away_id) }}>
  {awayTeam.school}
</div>
```

## Common Pitfalls to Avoid

1. **Field Name Variations**: Always check for both `away_id`/`awayId` and `home_id`/`homeId`
2. **Missing Team Data**: Always provide fallbacks for missing logos and colors
3. **Color Format**: Ensure colors are in hex format for CSS compatibility
4. **Logo Array**: Always check if `logos` array exists and has elements
5. **Performance**: Don't recalculate colors on every render - compute once and reuse

## Additional Features

### Ranking Badges
```javascript
{awayTeam?.ranking && (
  <div 
    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
    style={{
      background: `linear-gradient(135deg, rgba(${awayColorRgb}, 1) 0%, rgba(${awayColorRgb}, 0.8) 100%)`,
      boxShadow: `0 2px 8px rgba(${awayColorRgb}, 0.4)`,
    }}
  >
    #{awayTeam.ranking}
  </div>
)}
```

### Conference Display
```javascript
{awayTeam?.conference && (
  <div className="text-white/80 text-sm font-medium">
    {awayTeam.conference}
  </div>
)}
```

This implementation provides a robust, scalable system for handling team logos and colors with comprehensive fallbacks and visual effects.
