# How to Check if Your App is Using REST API or GraphQL

## Method 1: Chrome DevTools Network Tab

1. **Open your app**: Go to `https://gameday-plus.vercel.app/#game-predictor`

2. **Open Chrome DevTools**:
   - Right-click anywhere on the page → "Inspect"
   - Or press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac)

3. **Go to Network Tab**:
   - Click on the "Network" tab in DevTools
   - Make sure "All" filter is selected (or try "XHR" filter)

4. **Clear existing requests**:
   - Click the clear button (🚫) to clear previous requests

5. **Trigger API calls**:
   - Refresh the page or navigate to the Game Predictor
   - Change the week/year to trigger new predictions
   - The Network tab will show all API requests

6. **Look for these patterns**:

   **GraphQL Requests:**
   - URL: `https://graphql.collegefootballdata.com/v1/graphql`
   - Method: `POST`
   - Request payload contains `query` field with GraphQL syntax

   **REST API Requests:**
   - URLs like: `https://api.collegefootballdata.com/games`
   - URLs like: `https://api.collegefootballdata.com/teams`
   - Method: `GET` (usually)
   - No GraphQL query syntax

## Method 2: Console Logging

Look for console messages in the DevTools Console tab:
- GraphQL messages: "Using GraphQL service", "GraphQL request successful"
- REST API messages: "GraphQL unavailable, falling back to REST API"
- CORS messages: "CORS error detected" (indicates GraphQL issues)

## Method 3: Check Request Headers

Click on any API request in the Network tab to see:
- **GraphQL**: Contains `Authorization: Bearer [API_KEY]` and `Content-Type: application/json`
- **REST API**: Contains `Authorization: Bearer [API_KEY]` and different endpoint structure

## What You Should See:

### If Using GraphQL Successfully:
```
POST https://graphql.collegefootballdata.com/v1/graphql
Status: 200
Response: JSON with data field containing requested information
```

### If Falling Back to REST API:
```
GET https://api.collegefootballdata.com/games?year=2025&week=1
GET https://api.collegefootballdata.com/teams/fbs
Status: 200
Response: Direct JSON array or object
```

### If CORS Issues with GraphQL:
```
POST https://graphql.collegefootballdata.com/v1/graphql
Status: (failed) net::ERR_BLOCKED_BY_CLIENT or CORS error
Console: "CORS error detected, falling back to REST API"
```
