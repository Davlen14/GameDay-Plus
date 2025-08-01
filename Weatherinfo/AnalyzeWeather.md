Finding weather‑related endpoints in CollegeFootballData.com API

REST API (Swagger UI)
	•	Weather endpoint (GET /games/weather) – The Swagger UI shows a games/weather endpoint under the games category.  The description notes that this endpoint retrieves historical and future weather data.  Parameters include year (required if gameId is omitted), and optional seasonType (regular, postseason, spring, etc.), week, team, conference, classification (FBS, FCS, Division II/III) and gameId.  The sample JSON schema shows that each record contains a game identifier and weather fields such as startTime, gameIndoors, homeTeam, awayTeam, venue, temperature, dewPoint, humidity, precipitation, snowfall, windDirection, windSpeed, pressure, weatherConditionCode and the human‑readable weatherCondition.  This endpoint is part of the paid tier (Patreon only).
	•	Games endpoint (GET /games) – this endpoint returns game results and metadata.  Its parameters include year, week, seasonType, classification, team, home, away, conference and id.  The example response includes identifiers, start dates/times, venues, team names, scores, line scores, Elo ratings, etc.; it does not include weather fields.  To analyse weather effects in REST, you need to fetch game results (/games or /games/teams) and weather data (/games/weather) and then join them locally on gameId or id.
	•	Other REST endpoints such as /games/teams, /games/players or /teams provide team‑level statistics, rosters and other data.  They do not include weather fields, but they can be joined with the weather endpoint for more detailed analysis.

Suggested workflow (REST)
	1.	Identify the games of interest.  Use /games or /games/teams with filters like year, week, team, home, away and conference to find game identifiers and team‑performance metrics.  The startDate field provides the time of day (UTC) for the kick‑off.
	2.	Fetch weather data.  Call /games/weather with the same year, team and week (or the returned gameId) to get weather conditions for those games.  The response contains temperature, dew‑point, humidity, precipitation, snowfall, wind direction/speed, pressure and a description code.
	3.	Join the data offline.  Because the REST API doesn’t join weather and performance for you, you must merge the weather response with game or team‑level statistics locally (e.g., using gameId).  You can then analyse how a team performs at home vs. away, in day vs. night games (use startDate), and under specific weather conditions.

Sample cURL requests (REST)

These examples use a placeholder API key T0iV2bfp8UKCf8rTV12qsS26USzyDYiVNA7x6WbaV3NOvewuDQnJlv3NfPzr3f/p


# Fetch Georgia’s 2024 regular‑season games in week 1
auth="Authorization: Bearer T0iV2bfp8UKCf8rTV12qsS26USzyDYiVNA7x6WbaV3NOvewuDQnJlv3NfPzr3f/p"
curl -sG https://api.collegefootballdata.com/games \
  -H "$auth" \
  --data-urlencode "year=2024" \
  --data-urlencode "week=1" \
  --data-urlencode "team=Georgia" \
  --data-urlencode "seasonType=regular"

# Fetch weather data for Georgia’s week‑1 games (returns weather per game)
curl -sG https://api.collegefootballdata.com/games/weather \
  -H "$auth" \
  --data-urlencode "year=2024" \
  --data-urlencode "week=1" \
  --data-urlencode "team=Georgia" \
  --data-urlencode "seasonType=regular"



  After retrieving the data, you can join on id or gameId and compute summary statistics (e.g., average points scored when temperature < 50 °F vs. ≥ 50 °F, performance in rain vs. dry conditions, etc.).

⸻

GraphQL API

The CFBD GraphQL API (available to Patreon Tier 3 subscribers) allows you to build more sophisticated queries.  It exposes a single endpoint (https://graphql.collegefootballdata.com/v1/graphql) where you send POST requests containing a GraphQL query and variables.  In the documentation, three types are relevant for weather analysis:


GraphQL query
Purpose & key fields
Evidence
game
Retrieves game‑level data.  It includes team names, startDate/startTime, home/away indicators, scores and betting lines.  Inside the game object there is a nested weather field that exposes dewpoint, humidity, precipitation, pressure, snowfall, temperature, weatherConditionCode, windDirection, windGust and windSpeed.  This allows you to get performance and weather in a single query.
GraphQL docs show the game query returning a weather object with these fields.
gameWeather
Fetches data from the game_weather table.  Returns fields such as dewpoint, gameId, humidity, precipitation, pressure, snowfall, temperature, weatherConditionCode, windDirection, windGust, and windSpeed.  This query is useful if you only need weather information or want to aggregate weather data across games.
The gameWeather query example lists these fields.
weatherCondition
Provides a lookup table of weather condition codes to human‑readable descriptions.  Fields include id (code) and description.  Use this to decode the weatherConditionCode returned by game or gameWeather.
GraphQL docs show the weatherCondition query returning description and id.


Filtering with GraphQL

GraphQL queries accept a where argument that uses boolean expressions.  For the game query, the filter type gameBoolExp allows you to specify conditions on fields like season, week, homeTeam, awayTeam, conference, weather.temperature, etc.  Similarly, gameWeather has its own boolean expression filter.  For example, you can filter for games where the temperature was below 40 °F and the home team is a specific team.

Sample GraphQL cURL requests
	1.	Get a team’s games along with weather and scores – This query fetches Georgia’s 2024 regular‑season games, returning start date/time, home/away teams, scores and detailed weather data:

query='query TeamGamesWithWeather($season: Int!, $team: String!) {
  game(where: {season: {_eq: $season}, seasonType: {_eq: "regular"}, _or: [{homeTeam: {_eq: $team}}, {awayTeam: {_eq: $team}}]}) {
    id
    season
    week
    startDate
    homeTeam
    awayTeam
    homePoints
    awayPoints
    weather {
      temperature
      dewpoint
      humidity
      precipitation
      snowfall
      pressure
      windDirection
      windSpeed
      windGust
      weatherConditionCode
      condition { description }
    }
  }
}'
curl -s -X POST https://graphql.collegefootballdata.com/v1/graphql \
  -H "Authorization: Bearer T0iV2bfp8UKCf8rTV12qsS26USzyDYiVNA7x6WbaV3NOvewuDQnJlv3NfPzr3f/p" \
  -H "Content-Type: application/json" \
  -d '{"query":'"$query"',"variables":{"season":2024,"team":"Georgia"}}'

Find all games with heavy precipitation – This query lists games where precipitation exceeded 0.5 inches and returns the game date, teams and precipitation:

query='query RainyGames($minPrec: numeric!) {
  gameWeather(where: {precipitation: {_gt: $minPrec}}) {
    gameId
    temperature
    precipitation
    snowfall
    windSpeed
    condition { description }
  }
}'
curl -s -X POST https://graphql.collegefootballdata.com/v1/graphql \
  -H "Authorization: Bearer T0iV2bfp8UKCf8rTV12qsS26USzyDYiVNA7x6WbaV3NOvewuDQnJlv3NfPzr3f/p" \
  -H "Content-Type: application/json" \
  -d '{"query":'"$query"',"variables":{"minPrec":0.5}}'


  	3.	Lookup weather condition codes – Use this to create a mapping of condition codes to names:


    query='query { weatherCondition { id description } }'
curl -s -X POST https://graphql.collegefootballdata.com/v1/graphql \
  -H "Authorization: Bearer T0iV2bfp8UKCf8rTV12qsS26USzyDYiVNA7x6WbaV3NOvewuDQnJlv3NfPzr3f/p" \
  -H "Content-Type: application/json" \
  -d '{"query":'"$query"'}'

Advantages of GraphQL vs. REST
	•	Single query for multiple resources – The game query allows you to retrieve game results and weather data together, reducing the need for multiple REST calls.  You can ask only for the fields you need (e.g., startDate, temperature, windSpeed), which can reduce payload size.
	•	Flexible filtering – GraphQL’s boolean expression filters enable complex conditions such as selecting games by team, season, weather thresholds or time of day, which is harder to achieve with fixed REST endpoints.
	•	Subscriptions – Although experimental, the GraphQL API supports subscriptions for real‑time updates, which can be useful for live game analysis.

However, GraphQL access requires a higher Patreon tier and may not expose all datasets yet.  If you are on the free tier, you can use the REST API and perform joins locally.

Summary

The CollegeFootballData.com API provides robust weather information for college football games.  In the REST API, the /games/weather endpoint returns historical and future weather data (temperature, humidity, precipitation, wind, pressure, etc.) along with game identifiers and teams.  Combining this endpoint with /games or /games/teams allows you to study how teams perform at home vs. away, by time of day (using startDate) and under various weather conditions.  The GraphQL API simplifies this process: the game query includes a nested weather object with all relevant weather fields, and gameWeather/weatherCondition queries provide detailed weather records and condition descriptions.  Using GraphQL, you can craft custom queries that return team performance and weather data together and filter by season, team, or specific weather thresholds.  Both approaches support cURL commands; just include your API key in the Authorization header.





