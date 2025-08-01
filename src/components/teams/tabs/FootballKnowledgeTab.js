import React, { useState } from 'react';

const FootballKnowledgeTab = () => {
  const modernRedGradient = 'linear-gradient(135deg, rgb(204,0,28), rgb(161,0,20), rgb(115,0,13), rgb(161,0,20), rgb(204,0,28))';
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const metrics = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-book-open' },
    { id: 'successRate', label: 'Success Rate', icon: 'fas fa-percentage' },
    { id: 'ppa', label: 'Points Per Play', icon: 'fas fa-chart-line' },
    { id: 'explosiveness', label: 'Explosiveness', icon: 'fas fa-bolt' },
    { id: 'fieldPosition', label: 'Field Position', icon: 'fas fa-map-marked-alt' },
    { id: 'downAndDistance', label: 'Down & Distance', icon: 'fas fa-ruler-combined' },
    { id: 'situational', label: 'Situational Stats', icon: 'fas fa-clock' },
    { id: 'redZone', label: 'Red Zone', icon: 'fas fa-bullseye' }
  ];

  const metricDefinitions = {
    overview: {
      title: "What Football Analytics Tell Us",
      analytical: "Advanced football analytics measure team performance beyond traditional statistics like yards and touchdowns. These metrics evaluate efficiency, consistency, and situational performance to provide a comprehensive view of team strength. Modern analytics focus on success probability, expected points, and contextual performance rather than raw volume statistics.",
      simple: "Think of it like this: Instead of just counting how many yards a team gets, we look at HOW they get those yards. It's like comparing two students - one who gets A's on easy tests vs. one who gets B's on really hard tests. The second student might actually be better!",
      importance: "These stats matter because they predict future performance better than traditional stats. A team might have fewer total yards but be more efficient, making them more likely to win future games.",
      icon: "fas fa-brain",
      color: "bg-blue-500"
    },
    successRate: {
      title: "Success Rate",
      analytical: "Success Rate measures the percentage of plays that achieve a positive expected points added (EPA) value. A successful play is defined as one that gains at least 50% of needed yards on 1st down, 70% on 2nd down, and 100% on 3rd/4th down. This metric evaluates consistency and efficiency rather than explosive plays.",
      simple: "Imagine you need to walk 10 steps to reach a goal. On your first try, you need to take at least 5 steps to be 'successful.' On your second try, you need 7 steps. On your final try, you need all 10 steps. Success Rate counts how often you meet these minimum requirements.",
      importance: "Success Rate is crucial because it shows which teams can consistently move the ball and avoid negative plays. Teams with higher success rates control games better, maintain drives longer, and put less pressure on their defense. It's like having a reliable car vs. a fast but unreliable one.",
      icon: "fas fa-percentage",
      color: "bg-green-500"
    },
    ppa: {
      title: "Points Per Play (PPA)",
      analytical: "Points Per Play represents the average expected points added per offensive play. It calculates the change in expected points from the beginning to the end of each play, accounting for field position, down, and distance. Positive PPA indicates the offense increased their expected scoring, while negative PPA means they decreased it.",
      simple: "Think of PPA like a video game score. Every time your team touches the ball, they're either getting closer to scoring (positive points) or further away (negative points). If you start at your 20-yard line, you might have a 2-point chance to score. If you gain 30 yards, now you have a 4-point chance. You just added 2 points!",
      importance: "PPA is the gold standard for measuring offensive efficiency because it considers context. A 5-yard gain on 3rd-and-3 is worth more than a 5-yard gain on 1st-and-10. Teams with higher PPA score more points and win more games, regardless of total yards.",
      icon: "fas fa-chart-line",
      color: "bg-yellow-500"
    },
    explosiveness: {
      title: "Explosiveness",
      analytical: "Explosiveness measures a team's ability to generate big plays, typically defined as plays with an EPA of 1.0 or higher. It represents the average EPA on successful plays only, filtering out the 'noise' of unsuccessful attempts. This metric identifies teams that can quickly change field position and game momentum through explosive gains.",
      simple: "Explosiveness is like measuring how often a basketball player makes really amazing shots vs. just regular baskets. Some football teams are like players who mostly make safe, easy shots. Others are like players who can suddenly drain a three-pointer from way downtown and completely change the game!",
      importance: "Explosive plays are game-changers because they can instantly flip field position and momentum. Teams with high explosiveness can score quickly even from bad field position, making them dangerous at any point in the game. It's the difference between a boxer who lands steady jabs vs. one who can throw knockout punches.",
      icon: "fas fa-bolt",
      color: "bg-purple-500"
    },
    fieldPosition: {
      title: "Field Position",
      analytical: "Field Position metrics evaluate how teams perform based on their starting position on the field. This includes average starting field position, points per drive based on starting position, and the ability to flip field position through defense and special teams. Advanced metrics consider expected points based on field position and how teams exceed or fall short of expectations.",
      simple: "Field position is like starting a race closer to or further from the finish line. If your team always starts at the 50-yard line (middle of the field) vs. the 20-yard line (close to your own end zone), you have a much easier time scoring. It's like getting a head start in a running race!",
      importance: "Field position is massive because it determines how easy or hard it is to score. Starting drives at your own 20-yard line vs. the opponent's 40-yard line can be the difference between 3 points per game vs. 6 points per game. Good field position teams win the 'hidden yardage' battle.",
      icon: "fas fa-map-marked-alt",
      color: "bg-indigo-500"
    },
    downAndDistance: {
      title: "Down & Distance",
      analytical: "Down and Distance analytics examine team performance in specific game situations: 1st down (standard downs), 2nd down (standard downs), 3rd down (passing downs), and 4th down. Success rates and EPA are calculated for each situation to identify teams that excel in particular scenarios. Standard downs (1st & 2nd, < 8 yards) vs. Passing downs (3rd & 4th, or 2nd & 8+) reveal different team strengths.",
      simple: "Think of downs like levels in a video game. Level 1 (1st down) is usually easy - you have lots of room for mistakes. Level 2 (2nd down) is medium difficulty. Level 3 (3rd down) is HARD - you usually have to do something special to succeed. Some teams are great at the easy levels, others are clutch on the hard levels!",
      importance: "Down and distance performance shows which teams can stay ahead of the chains (avoid 3rd and long) and which teams are clutch in pressure situations. Teams that excel on standard downs control games. Teams that excel on passing downs can overcome mistakes and bad situations.",
      icon: "fas fa-ruler-combined",
      color: "bg-red-500"
    },
    situational: {
      title: "Situational Statistics",
      analytical: "Situational statistics analyze performance in specific game contexts: early downs vs. late downs, short yardage situations, goal line scenarios, garbage time vs. competitive situations, and performance when leading/trailing. These metrics reveal team tendencies and clutch performance capabilities that standard statistics often miss.",
      simple: "Situational stats are like seeing how a student performs on pop quizzes vs. final exams, or how a basketball player shoots free throws when the game is tied vs. when their team is already winning by 20 points. Some teams play great when things are easy but struggle under pressure!",
      importance: "Situational performance matters because games are won in key moments. A team might dominate when ahead by 14 points but collapse in close games. Understanding these tendencies helps predict performance in crucial situations and identifies truly elite vs. good teams.",
      icon: "fas fa-clock",
      color: "bg-teal-500"
    },
    redZone: {
      title: "Red Zone Efficiency",
      analytical: "Red Zone analytics measure team performance inside the opponent's 20-yard line, where field compression changes offensive and defensive strategies. Metrics include red zone success rate (scoring touchdowns), red zone efficiency (points per trip), goal line success rate (scoring from inside the 5), and defensive red zone stop rate. These situations have the highest leverage in determining game outcomes.",
      simple: "The red zone is like the final boss battle in a video game. You've made it 80% of the way to beating the level (the end zone), but now everything gets much harder. The field gets smaller, defenses get tougher, and every mistake is costly. Some teams are great at beating the final boss, others always seem to mess up at the end!",
      importance: "Red zone performance is critical because it's the difference between 3 points (field goal) and 7 points (touchdown). A team that consistently scores touchdowns instead of field goals will win more games. In close games, red zone efficiency often determines the winner - it's where games are truly won and lost.",
      icon: "fas fa-bullseye",
      color: "bg-orange-500"
    }
  };

  const renderMetricContent = () => {
    const metric = metricDefinitions[selectedMetric];
    if (!metric) return null;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
               style={{ background: modernRedGradient }}>
            <i className={`${metric.icon} text-white text-3xl`}></i>
          </div>
          <h2 className="text-3xl font-bold mb-4" 
              style={{ 
                background: modernRedGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
            {metric.title}
          </h2>
        </div>

        {/* Analytical Definition */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <i className="fas fa-microscope mr-3 gradient-text"></i>
            Analytical Definition
          </h3>
          <div className="bg-white/30 rounded-2xl p-6">
            <p className="text-gray-700 leading-relaxed font-medium">
              {metric.analytical}
            </p>
          </div>
        </div>

        {/* Simple Explanation */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <i className="fas fa-user-graduate mr-3 gradient-text"></i>
            Beginner Friendly Explanation
          </h3>
          <div className="bg-white/30 rounded-2xl p-6">
            <p className="text-green-600 leading-relaxed font-medium text-lg">
              {metric.simple}
            </p>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <i className="fas fa-exclamation-triangle mr-3 gradient-text"></i>
            Why This Matters (Importance)
          </h3>
          <div className="bg-white/30 rounded-2xl p-6">
            <p className="text-red-600 leading-relaxed font-medium text-lg">
              {metric.importance}
            </p>
          </div>
        </div>

        {/* Quick Reference Card */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl border border-gray-200 p-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
            <i className="fas fa-clipboard-list mr-2 gradient-text"></i>Quick Reference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <i className="fas fa-brain text-2xl mb-2 gradient-text"></i>
              <h4 className="font-bold text-gray-800">Technical</h4>
              <p className="text-sm text-gray-600">For the analysts</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <i className="fas fa-user-graduate text-2xl mb-2 gradient-text"></i>
              <h4 className="font-bold text-gray-800">Beginner</h4>
              <p className="text-sm text-gray-600">For everyone</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <i className="fas fa-trophy text-2xl mb-2 gradient-text"></i>
              <h4 className="font-bold text-gray-800">Impact</h4>
              <p className="text-sm text-gray-600">Why it wins games</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <style>{`
        .gradient-text {
          background: ${modernRedGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: modernRedGradient }}>
            <i className="fas fa-graduation-cap text-white text-2xl"></i>
          </div>
        </div>
        
        <h2 className="text-4xl font-bold mb-4 gradient-text">
          Football Knowledge Center
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Learn what every football metric means and why it matters
        </p>
      </div>

      {/* Metric Selection Bar */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedMetric === metric.id
                  ? 'text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30 hover:border-white/50'
              }`}
              style={selectedMetric === metric.id ? { background: modernRedGradient } : {}}
            >
              <i className={`${metric.icon} text-sm`}></i>
              <span className="text-xs text-center leading-tight">{metric.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="transition-all duration-500">
        {renderMetricContent()}
      </div>

      {/* Bottom Navigation Hint */}
      <div className="mt-12 text-center">
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] p-4">
          <p className="text-gray-600 mb-3 text-sm">
            <i className="fas fa-lightbulb mr-2 gradient-text text-sm"></i><strong>Pro Tip:</strong> Understanding these metrics will help you analyze games like a professional scout!
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <i className="fas fa-brain gradient-text text-xs"></i>
              <span>Technical = In-depth analysis</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-user-graduate gradient-text text-xs"></i>
              <span>Beginner = Easy to understand</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-trophy gradient-text text-xs"></i>
              <span>Impact = Why it matters for winning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FootballKnowledgeTab;
