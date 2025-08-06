import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const PlayerChartsSection = ({ 
  smithGameData, 
  hitRateData, 
  texasDefenseData, 
  week1Projections,
  modernRedGradient,
  modernGreenGradient,
  accentColor,
  positiveColor
}) => {
  // Custom dot component for team logos
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload || !payload.opponent) return null;
    
    // Convert opponent name to logo filename for all games (including playoffs)
    const getLogoPath = (opponent) => {
      const logoMap = {
        'Akron': 'Akron.png',
        'Western Michigan': 'Western_Michigan.png',
        'Marshall': 'Marshall.png',
        'Michigan State': 'Michigan_State.png',
        'Iowa': 'Iowa.png',
        'Oregon': 'Oregon.png',
        'Nebraska': 'Nebraska.png',
        'Penn State': 'Penn_State.png',
        'Purdue': 'Purdue.png',
        'Northwestern': 'Northwestern.png',
        'Indiana': 'Indiana.png',
        'Michigan': 'Michigan.png',
        'Tennessee': 'Tennessee.png',
        'Texas': 'Texas.png',
        'Notre Dame': 'Notre_Dame.png'
      };
      return `/team_logos/${logoMap[opponent] || 'default.png'}`;
    };

    return (
      <g>
        <image 
          x={cx - 10} 
          y={cy - 10} 
          width="20" 
          height="20" 
          href={getLogoPath(payload.opponent)}
          className="hover:scale-125 transition-transform duration-200"
        />
      </g>
    );
  };

  // Custom tooltip for yards per game chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Convert opponent name to logo filename for all games
      const getLogoPath = (opponent) => {
        const logoMap = {
          'Akron': 'Akron.png',
          'Western Michigan': 'Western_Michigan.png',
          'Marshall': 'Marshall.png',
          'Michigan State': 'Michigan_State.png',
          'Iowa': 'Iowa.png',
          'Oregon': 'Oregon.png',
          'Nebraska': 'Nebraska.png',
          'Penn State': 'Penn_State.png',
          'Purdue': 'Purdue.png',
          'Northwestern': 'Northwestern.png',
          'Indiana': 'Indiana.png',
          'Michigan': 'Michigan.png',
          'Tennessee': 'Tennessee.png',
          'Texas': 'Texas.png',
          'Notre Dame': 'Notre_Dame.png'
        };
        return `/team_logos/${logoMap[opponent] || 'default.png'}`;
      };

      const seasonAverage = 82.2;
      const isAboveAverage = data.yards > seasonAverage;
      
      return (
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg"
          style={{ zIndex: 9999, position: 'relative' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={getLogoPath(data.opponent)} 
              alt={data.opponent}
              className="w-8 h-8"
            />
            <div>
              <p className="font-bold text-gray-800">
                {data.isPlayoff ? `${label} vs ${data.opponent}` : `Week ${label} vs ${data.opponent}`}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Receiving Yards: 
              <span className="font-bold text-gray-900">{data.yards}</span>
              {isAboveAverage ? (
                <span className="text-green-500 font-bold">↗</span>
              ) : (
                <span className="text-red-500 font-bold">↘</span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              Season Avg: {seasonAverage} (<span className={isAboveAverage ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{isAboveAverage ? '+' : ''}{(data.yards - seasonAverage).toFixed(1)}</span>)
            </p>
            <p className="text-sm font-semibold text-gray-700">
              Receptions: <span className="font-bold text-gray-900">{data.receptions}</span>
            </p>
            <p className="text-sm font-semibold text-gray-700">
              Touchdowns: <span className="font-bold text-gray-900">{data.tds}</span>
            </p>
            <p className="text-sm font-semibold text-gray-700">
              Targets: <span className="font-bold text-gray-900">{data.target}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-12">
      
      {/* Modern Yards Per Game Trend Chart */}
      <div 
        className="rounded-xl shadow-2xl border overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="p-8">
          <h3 className="text-xl font-medium text-gray-700 mb-6">
            Receiving Yards Per Game - 2024 Season
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={smithGameData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(204, 0, 28, 0.1)" opacity={0.8} />
              <XAxis 
                dataKey="week" 
                tick={{fontSize: 12, fill: '#6b7280', fontWeight: 'bold'}} 
                axisLine={{ stroke: accentColor, strokeWidth: 1 }}
              />
              <YAxis 
                tick={{fontSize: 12, fill: '#6b7280', fontWeight: 'bold'}} 
                axisLine={{ stroke: accentColor, strokeWidth: 1 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="yards" 
                stroke="#9ca3af"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={false}
              />
              <Line 
                type="monotone" 
                dataKey={() => 82.2} 
                stroke={positiveColor}
                strokeWidth={3}
                strokeDasharray="8 8"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-8 mt-4 text-sm font-bold">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full" style={{ background: modernRedGradient }}></div>
              <span>Actual Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full bg-green-500"></div>
              <span>Season Average (82.2)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Hit Rates Chart */}
      <div 
        className="rounded-xl shadow-2xl border overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="p-8">
          <h3 className="text-xl font-medium text-gray-700 mb-6">
            Hit Rates vs Various Lines
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={hitRateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(204, 0, 28, 0.1)" opacity={0.8} />
              <XAxis 
                dataKey="line" 
                tick={{fontSize: 12, fill: '#6b7280', fontWeight: 'bold'}} 
                axisLine={{ stroke: accentColor, strokeWidth: 1 }}
              />
              <YAxis 
                tick={{fontSize: 12, fill: '#6b7280', fontWeight: 'bold'}} 
                axisLine={{ stroke: accentColor, strokeWidth: 1 }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(255, 255, 255, 1)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  fontWeight: 'bold',
                  zIndex: 9999,
                  position: 'relative',
                  opacity: 1,
                  backdropFilter: 'none'
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === 'over' ? 'Over %' : 'Under %'
                ]}
                wrapperStyle={{ zIndex: 9999 }}
              />
              <Bar 
                dataKey="over" 
                fill="url(#greenGradient)" 
                fillOpacity={0.3} 
                radius={[4, 4, 0, 0]}
                stroke="rgba(34, 197, 94, 0.6)"
                strokeWidth={1}
              />
              <Bar 
                dataKey="under" 
                fill="url(#redGradient)" 
                fillOpacity={0.3} 
                radius={[4, 4, 0, 0]}
                stroke="rgba(255, 46, 74, 0.6)"
                strokeWidth={1}
              />
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(34, 197, 94, 0.4)" />
                  <stop offset="100%" stopColor="rgba(22, 163, 74, 0.4)" />
                </linearGradient>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 46, 74, 0.4)" />
                  <stop offset="100%" stopColor="rgba(204, 0, 28, 0.4)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-8 mt-4 text-sm font-bold">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Over %</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: modernRedGradient }}></div>
              <span>Under %</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Texas Defense Analysis */}
      <div 
        className="rounded-xl shadow-2xl border overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="p-8">
          <h3 className="text-xl font-medium text-gray-700 mb-6">
            Texas Pass Defense - 2024 Splits
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={texasDefenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(204, 0, 28, 0.1)" opacity={0.8} />
              <XAxis 
                dataKey="category" 
                tick={{fontSize: 12, fill: '#6b7280', fontWeight: 'bold'}} 
                axisLine={{ stroke: accentColor, strokeWidth: 1 }}
              />
              <YAxis 
                tick={{fontSize: 12, fill: '#6b7280', fontWeight: 'bold'}} 
                axisLine={{ stroke: accentColor, strokeWidth: 1 }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  fontWeight: 'bold',
                  zIndex: 9999,
                  position: 'relative'
                }}
                formatter={(value) => [`${value} yards`, 'Yards Per Game']}
                wrapperStyle={{ zIndex: 9999 }}
              />
              <Bar dataKey="yards" fillOpacity={0.3} radius={[8, 8, 0, 0]}>
                <Cell fill="url(#greenDefenseGradient)" stroke="rgba(34, 197, 94, 0.6)" strokeWidth={1} />
                <Cell fill="url(#yellowDefenseGradient)" stroke="rgba(251, 191, 36, 0.6)" strokeWidth={1} />
                <Cell fill="url(#redDefenseGradient)" stroke="rgba(255, 46, 74, 0.6)" strokeWidth={1} />
              </Bar>
              <defs>
                <linearGradient id="greenDefenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(34, 197, 94, 0.4)" />
                  <stop offset="100%" stopColor="rgba(22, 163, 74, 0.4)" />
                </linearGradient>
                <linearGradient id="yellowDefenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(251, 191, 36, 0.4)" />
                  <stop offset="100%" stopColor="rgba(245, 158, 11, 0.4)" />
                </linearGradient>
                <linearGradient id="redDefenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 46, 74, 0.4)" />
                  <stop offset="100%" stopColor="rgba(204, 0, 28, 0.4)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-3 gap-6 text-sm">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-bold text-gray-800">vs Unranked</p>
              <p className="text-green-600 font-black text-lg" style={{
                background: modernGreenGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>140.8 YPG</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-6 h-6 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <p className="font-bold text-gray-800">vs Ranked</p>
              <p className="text-yellow-600 font-black text-lg">246.4 YPG</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-6 h-6 rounded-full mx-auto mb-2" style={{ background: modernRedGradient }}></div>
              <p className="font-bold text-gray-800">Dec/Jan</p>
              <p className="font-black text-lg" style={{
                background: modernRedGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>264.3 YPG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Week 1 Projections */}
      <div 
        className="rounded-xl shadow-2xl border overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="p-8">
          <h3 className="text-xl font-medium text-gray-700 mb-6">
            Week 1 vs Texas Projections
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={week1Projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(204, 0, 28, 0.1)" opacity={0.8} />
              <XAxis 
                dataKey="scenario" 
                tick={{fontSize: 12, fill: '#6b7280', fontWeight: 'bold'}} 
                axisLine={{ stroke: accentColor, strokeWidth: 1 }}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                tick={{fontSize: 12, fill: '#6b7280', fontWeight: 'bold'}} 
                axisLine={{ stroke: accentColor, strokeWidth: 1 }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  fontWeight: 'bold',
                  zIndex: 9999,
                  position: 'relative'
                }}
                wrapperStyle={{ zIndex: 9999 }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="yards" 
                fill="url(#projectionGradient)" 
                fillOpacity={0.3} 
                radius={[8, 8, 0, 0]}
                stroke="rgba(59, 130, 246, 0.6)"
                strokeWidth={1}
              />
              <defs>
                <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                  <stop offset="100%" stopColor="rgba(37, 99, 235, 0.4)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-3 gap-6 text-sm">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="font-medium text-gray-800 mb-1">Conservative</p>
              <p className="text-gray-800 font-medium text-2xl mb-1">65 yards</p>
              <p className="text-gray-600 font-medium">30% chance</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="font-medium text-gray-800 mb-1">Projected</p>
              <p className="text-gray-800 font-medium text-2xl mb-1">90 yards</p>
              <p className="text-gray-600 font-medium">45% chance</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="font-medium text-gray-800 mb-1">Aggressive</p>
              <p className="text-gray-800 font-medium text-2xl mb-1">110 yards</p>
              <p className="text-gray-600 font-medium">25% chance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerChartsSection;