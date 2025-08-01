// Core matchup types and constants
export const MatchupTypes = {
  STRONG_TEAM1: 'strongTeam1',
  SLIGHT_TEAM1: 'slightTeam1', 
  EVEN: 'even',
  SLIGHT_TEAM2: 'slightTeam2',
  STRONG_TEAM2: 'strongTeam2'
};

// Advanced stats structure mapping
export const advancedStatsStructure = {
  offense: {
    ppa: 0,
    successRate: 0,
    explosiveness: 0,
    passingPlays: { rate: 0, successRate: 0 },
    rushingPlays: { rate: 0, successRate: 0 },
    fieldPosition: { averageStart: 0 },
    pointsPerOpportunity: 0,
    standardDowns: { successRate: 0 },
    passingDowns: { successRate: 0 }
  },
  defense: {
    ppa: 0,
    successRate: 0,
    havoc: { total: 0, frontSeven: 0, secondary: 0 },
    stuffRate: 0,
    lineYards: 0,
    secondLevelYards: 0,
    openFieldYards: 0
  }
};

/**
 * ComparisonAnalyzer - Core analysis engine for team matchup analysis
 * Based on Swift implementation from GamedayPlus
 */
class ComparisonAnalyzer {
  constructor(team1, team2, team1Stats, team2Stats) {
    this.team1 = team1;
    this.team2 = team2;
    this.team1Stats = team1Stats;
    this.team2Stats = team2Stats;
  }

  /**
   * Main analysis function - performs complete matchup analysis
   * @returns {Object} Complete analysis including advantage, matchup type, styles
   */
  performAnalysis() {
    const advantage = this.calculateOverallAdvantage();
    const matchupType = this.getMatchupType(advantage);
    const team1Styles = this.calculateTeamStyle(this.team1Stats);
    const team2Styles = this.calculateTeamStyle(this.team2Stats);
    const analysisVariant = Math.floor(Math.random() * 3) + 1;

    return {
      overallAdvantage: advantage,
      matchupType: matchupType,
      team1Styles: team1Styles,
      team2Styles: team2Styles,
      analysisVariant: analysisVariant,
      team1: this.team1,
      team2: this.team2,
      team1Stats: this.team1Stats,
      team2Stats: this.team2Stats
    };
  }

  /**
   * Calculate overall advantage (-1 to 1 scale)
   * Negative values favor team1, positive values favor team2
   */
  calculateOverallAdvantage() {
    if (!this.team1Stats || !this.team2Stats) {
      console.warn('Insufficient stats for advantage calculation');
      return 0; // Even matchup if no stats
    }

    let advantagePoints = 0;

    try {
      // Offensive metrics (20% weight each)
      if (this.team1Stats.offense.ppa > this.team2Stats.offense.ppa) {
        advantagePoints -= 0.2;
      } else if (this.team2Stats.offense.ppa > this.team1Stats.offense.ppa) {
        advantagePoints += 0.2;
      }

      if (this.team1Stats.offense.successRate > this.team2Stats.offense.successRate) {
        advantagePoints -= 0.15;
      } else if (this.team2Stats.offense.successRate > this.team1Stats.offense.successRate) {
        advantagePoints += 0.15;
      }

      // Defensive metrics (20% weight each) - lower is better for defense
      if (this.team1Stats.defense.ppa < this.team2Stats.defense.ppa) {
        advantagePoints -= 0.2;
      } else if (this.team2Stats.defense.ppa < this.team1Stats.defense.ppa) {
        advantagePoints += 0.2;
      }

      if (this.team1Stats.defense.successRate < this.team2Stats.defense.successRate) {
        advantagePoints -= 0.15;
      } else if (this.team2Stats.defense.successRate < this.team1Stats.defense.successRate) {
        advantagePoints += 0.15;
      }

      // Situational metrics (10% weight each)
      if (this.team1Stats.offense.fieldPosition?.averageStart > this.team2Stats.offense.fieldPosition?.averageStart) {
        advantagePoints -= 0.1;
      } else if (this.team2Stats.offense.fieldPosition?.averageStart > this.team1Stats.offense.fieldPosition?.averageStart) {
        advantagePoints += 0.1;
      }

      if (this.team1Stats.offense.pointsPerOpportunity > this.team2Stats.offense.pointsPerOpportunity) {
        advantagePoints -= 0.1;
      } else if (this.team2Stats.offense.pointsPerOpportunity > this.team1Stats.offense.pointsPerOpportunity) {
        advantagePoints += 0.1;
      }

      if (this.team1Stats.defense.havoc?.total > this.team2Stats.defense.havoc?.total) {
        advantagePoints -= 0.1;
      } else if (this.team2Stats.defense.havoc?.total > this.team1Stats.defense.havoc?.total) {
        advantagePoints += 0.1;
      }

    } catch (error) {
      console.error('Error calculating advantage:', error);
      return 0;
    }

    // Clamp to -1 to 1 range
    return Math.max(-1, Math.min(1, advantagePoints));
  }

  /**
   * Determine matchup type based on advantage calculation
   */
  getMatchupType(advantage) {
    if (advantage < -0.5) {
      return MatchupTypes.STRONG_TEAM1;
    } else if (advantage < -0.2) {
      return MatchupTypes.SLIGHT_TEAM1;
    } else if (advantage <= 0.2) {
      return MatchupTypes.EVEN;
    } else if (advantage <= 0.5) {
      return MatchupTypes.SLIGHT_TEAM2;
    } else {
      return MatchupTypes.STRONG_TEAM2;
    }
  }

  /**
   * Calculate team playing style based on statistical tendencies
   */
  calculateTeamStyle(stats) {
    if (!stats) return ['Unknown'];

    const styles = [];

    try {
      // Offensive identity
      if (stats.offense.passingPlays?.rate > 0.55) {
        styles.push('Pass-Heavy');
      } else if (stats.offense.passingPlays?.rate < 0.45) {
        styles.push('Run-Heavy');
      } else {
        styles.push('Balanced');
      }

      // Explosiveness vs consistency
      if (stats.offense.explosiveness > 1.2) {
        styles.push('Explosive');
      } else if (stats.offense.successRate > 0.45) {
        styles.push('Consistent');
      } else if (stats.offense.successRate < 0.38) {
        styles.push('Volatile');
      }

      // Defensive identity
      if (stats.defense.havoc?.total > 0.18) {
        styles.push('Disruptive');
      } else if (stats.defense.successRate < 0.4) {
        styles.push('Stout');
      } else if (stats.defense.ppa < 0) {
        styles.push('Bend-Don\'t-Break');
      } else {
        styles.push('Permissive');
      }

      // Special characteristics
      if (stats.offense.standardDowns?.successRate > 0.5 && stats.offense.passingDowns?.successRate < 0.35) {
        styles.push('Frontrunner');
      }

      if (stats.offense.pointsPerOpportunity > 5) {
        styles.push('Red Zone Efficient');
      }

      if (stats.defense.stuffRate > 0.2) {
        styles.push('D-Line Dominance');
      }

    } catch (error) {
      console.error('Error calculating team style:', error);
      styles.push('Unknown');
    }

    return styles.length > 0 ? styles : ['Unknown'];
  }

  /**
   * Get category advantage for UI highlighting
   */
  getCategoryAdvantage(content) {
    if (content.includes(`${this.team1.school} has`) || 
        content.includes(`${this.team1.school}'s`) || 
        content.includes(`${this.team1.school} is more`)) {
      return { team: this.team1.school, strength: 0.7 };
    } else if (content.includes(`${this.team2.school} has`) || 
               content.includes(`${this.team2.school}'s`) || 
               content.includes(`${this.team2.school} is more`)) {
      return { team: this.team2.school, strength: 0.7 };
    }
    return { team: '', strength: 0 };
  }

  /**
   * Generate matchup headline based on analysis
   */
  getMatchupHeadline() {
    const matchupType = this.getMatchupType(this.calculateOverallAdvantage());
    
    switch (matchupType) {
      case MatchupTypes.STRONG_TEAM1:
        return `${this.team1.school} Has Clear Advantage`;
      case MatchupTypes.SLIGHT_TEAM1:
        return `${this.team1.school} Has Slight Edge`;
      case MatchupTypes.EVEN:
        return 'Evenly Matched Teams';
      case MatchupTypes.SLIGHT_TEAM2:
        return `${this.team2.school} Has Slight Edge`;
      case MatchupTypes.STRONG_TEAM2:
        return `${this.team2.school} Has Clear Advantage`;
      default:
        return 'Statistical Analysis';
    }
  }

  /**
   * Get team color for UI elements
   */
  getTeamColor(team) {
    return team?.color || '#dc2626'; // Fallback to red
  }

  // MARK: - Detailed Analysis Text Generation

  matchupAnalysis1(matchupType) {
    switch (matchupType) {
      case MatchupTypes.STRONG_TEAM1:
        return `Based on advanced stats analysis, ${this.team1.school} has significant advantages in most key areas. They're more efficient on both offense and defense, creating a substantial overall edge that would likely be difficult for ${this.team2.school} to overcome without dramatic improvements or a specific game plan to neutralize ${this.team1.school}'s strengths.`;
      case MatchupTypes.SLIGHT_TEAM1:
        return `${this.team1.school} holds slight but meaningful advantages in several important metrics. While not overwhelmingly dominant, their edge in efficiency and situational performance gives them a modest advantage. ${this.team2.school} could certainly overcome this difference with good execution or by exploiting specific matchup advantages.`;
      case MatchupTypes.EVEN:
        return "These teams are remarkably well-matched according to advanced metrics. Each has their own strengths that seem to balance out any advantages the other might have. This projects to be a competitive matchup that could be decided by game planning, in-game adjustments, or simply which team executes better on gameday.";
      case MatchupTypes.SLIGHT_TEAM2:
        return `${this.team2.school} shows a slight edge in overall performance metrics. While the advantage isn't overwhelming, their superior efficiency in key situations gives them a modest advantage. ${this.team1.school} could certainly overcome this difference with good execution or by exploiting specific matchup advantages.`;
      case MatchupTypes.STRONG_TEAM2:
        return `Advanced metrics strongly favor ${this.team2.school} in this matchup. They demonstrate superior performance across most key statistical categories, creating a substantial overall advantage. ${this.team1.school} would likely need to make significant adjustments or dramatic improvements to overcome this statistical disadvantage.`;
      default:
        return "Statistical analysis provides insights into this matchup.";
    }
  }

  matchupAnalysis2(matchupType) {
    switch (matchupType) {
      case MatchupTypes.STRONG_TEAM1:
        return `Why does ${this.team1.school} have such an advantage? Their offensive efficiency is substantially higher, generating more points per opportunity while their defense limits opponents' success at a much higher rate. ${this.team2.school} struggles to match ${this.team1.school}'s performance in nearly every key statistical category, creating a significant gap in projected performance.`;
      case MatchupTypes.SLIGHT_TEAM1:
        return `What gives ${this.team1.school} the edge? They're slightly more efficient in critical situations and demonstrate better overall balance between offense and defense. However, ${this.team2.school} isn't far behind and has shown flashes of potential that could make this matchup closer than the numbers suggest.`;
      case MatchupTypes.EVEN:
        return "What makes this such an even matchup? Both teams have remarkably similar efficiency metrics, with any advantage in one area being offset by a disadvantage elsewhere. Neither team has a decisive edge in overall offensive or defensive performance, suggesting a close, competitive contest where execution and specific matchups will likely determine the outcome.";
      case MatchupTypes.SLIGHT_TEAM2:
        return `Why does ${this.team2.school} have a slight advantage? Their performance in key efficiency metrics is marginally better, particularly in how they capitalize on scoring opportunities and limit opponents in critical situations. While not a dominant edge, these small advantages across multiple categories add up to give ${this.team2.school} a modest overall advantage.`;
      case MatchupTypes.STRONG_TEAM2:
        return `What makes ${this.team2.school} so favored in this matchup? They demonstrate superior performance in nearly every key statistical category, with significantly better efficiency on both sides of the ball. ${this.team1.school} faces an uphill battle, as the metrics suggest a substantial gap in overall team quality and performance potential.`;
      default:
        return "Further analysis reveals additional insights into team capabilities.";
    }
  }

  matchupAnalysis3(matchupType) {
    if (!this.team1Stats || !this.team2Stats) {
      return "Insufficient statistical data for technical analysis.";
    }

    switch (matchupType) {
      case MatchupTypes.STRONG_TEAM1:
        return `Technical analysis reveals a statistically significant advantage for ${this.team1.school} across multiple key performance indicators. With superior efficiency metrics on both offense (PPA +${(this.team1Stats.offense.ppa - this.team2Stats.offense.ppa).toFixed(2)}) and defense (success rate differential of ${((this.team2Stats.defense.successRate - this.team1Stats.defense.successRate) * 100).toFixed(1)}%), the data strongly suggests ${this.team1.school} holds a substantial overall advantage.`;
      case MatchupTypes.SLIGHT_TEAM1:
        return `Quantitative analysis indicates a modest statistical edge for ${this.team1.school}. Key performance indicators show advantages in offensive efficiency (success rate +${((this.team1Stats.offense.successRate - this.team2Stats.offense.successRate) * 100).toFixed(1)}%) and defensive disruption metrics. While not decisive, these advantages create a measurable but surmountable edge for ${this.team1.school}.`;
      case MatchupTypes.EVEN:
        return "Statistical analysis demonstrates remarkable parity between these programs. Performance indicators show nearly identical efficiency metrics with differentials of less than 5% across most key categories. Neither team demonstrates a statistically significant advantage in offensive or defensive performance, suggesting a highly competitive matchup with minimal projected performance gap.";
      case MatchupTypes.SLIGHT_TEAM2:
        return `Data analysis indicates a modest statistical advantage for ${this.team2.school}. Performance metrics show edges in critical efficiency categories (PPA +${(this.team2Stats.offense.ppa - this.team1Stats.offense.ppa).toFixed(2)}) and situational success rates. These advantages, while not overwhelming, create a measurable but surmountable edge for ${this.team2.school}.`;
      case MatchupTypes.STRONG_TEAM2:
        return `Comprehensive statistical analysis reveals significant advantages for ${this.team2.school} across multiple key performance indicators. With superior metrics in offensive efficiency (success rate +${((this.team2Stats.offense.successRate - this.team1Stats.offense.successRate) * 100).toFixed(1)}%) and defensive performance (PPA differential of ${(this.team1Stats.defense.ppa - this.team2Stats.defense.ppa).toFixed(2)}), the data strongly indicates ${this.team2.school} holds a substantial overall advantage.`;
      default:
        return "Technical metrics provide additional context for this matchup.";
    }
  }

  // MARK: - Detailed Category Analysis

  offensiveAnalysis() {
    if (!this.team1Stats || !this.team2Stats) {
      return "Insufficient data to analyze offensive capabilities.";
    }

    const team1PPA = this.team1Stats.offense.ppa;
    const team2PPA = this.team2Stats.offense.ppa;
    const team1SR = this.team1Stats.offense.successRate;
    const team2SR = this.team2Stats.offense.successRate;
    const team1Rush = this.team1Stats.offense.rushingPlays?.successRate || 0;
    const team2Rush = this.team2Stats.offense.rushingPlays?.successRate || 0;
    const team1Pass = this.team1Stats.offense.passingPlays?.successRate || 0;
    const team2Pass = this.team2Stats.offense.passingPlays?.successRate || 0;

    let analysis = "";

    if (team1PPA > team2PPA && team1SR > team2SR) {
      analysis = `${this.team1.school} has a more efficient offense overall, generating more predicted points per play (${team1PPA.toFixed(2)} vs ${team2PPA.toFixed(2)}) and maintaining a higher success rate (${(team1SR * 100).toFixed(1)}% vs ${(team2SR * 100).toFixed(1)}%).`;
    } else if (team2PPA > team1PPA && team2SR > team1SR) {
      analysis = `${this.team2.school} demonstrates superior offensive efficiency, generating more predicted points per play (${team2PPA.toFixed(2)} vs ${team1PPA.toFixed(2)}) and maintaining a higher success rate (${(team2SR * 100).toFixed(1)}% vs ${(team1SR * 100).toFixed(1)}%).`;
    } else {
      analysis = `Offensively, these teams show different strengths. ${team1PPA > team2PPA ? this.team1.school : this.team2.school} generates more predicted points per play, while ${team1SR > team2SR ? this.team1.school : this.team2.school} maintains a higher success rate.`;
    }

    // Add rushing vs passing analysis
    if (team1Rush > team2Rush && team1Pass <= team2Pass) {
      analysis += ` ${this.team1.school} has a notably stronger rushing attack, while ${this.team2.school} shows more efficiency in the passing game.`;
    } else if (team1Rush <= team2Rush && team1Pass > team2Pass) {
      analysis += ` ${this.team1.school} has a more efficient passing game, while ${this.team2.school} demonstrates greater success in the running game.`;
    } else if (team1Rush > team2Rush && team1Pass > team2Pass) {
      analysis += ` ${this.team1.school} shows greater efficiency in both the running and passing game.`;
    } else if (team1Rush <= team2Rush && team1Pass <= team2Pass) {
      analysis += ` ${this.team2.school} demonstrates superior efficiency in both passing and rushing.`;
    }

    return analysis;
  }

  defensiveAnalysis() {
    if (!this.team1Stats || !this.team2Stats) {
      return "Insufficient data to analyze defensive capabilities.";
    }

    const team1PPA = this.team1Stats.defense.ppa;
    const team2PPA = this.team2Stats.defense.ppa;
    const team1SR = this.team1Stats.defense.successRate;
    const team2SR = this.team2Stats.defense.successRate;
    const team1Havoc = this.team1Stats.defense.havoc?.total || 0;
    const team2Havoc = this.team2Stats.defense.havoc?.total || 0;
    const team1Stuff = this.team1Stats.defense.stuffRate || 0;
    const team2Stuff = this.team2Stats.defense.stuffRate || 0;

    let analysis = "";

    // For defense, lower numbers are better
    if (team1PPA < team2PPA && team1SR < team2SR) {
      analysis = `${this.team1.school}'s defense is more effective overall, allowing fewer predicted points per play (${team1PPA.toFixed(2)} vs ${team2PPA.toFixed(2)}) and a lower success rate (${(team1SR * 100).toFixed(1)}% vs ${(team2SR * 100).toFixed(1)}%).`;
    } else if (team2PPA < team1PPA && team2SR < team1SR) {
      analysis = `${this.team2.school} shows superior defensive performance, allowing fewer predicted points per play (${team2PPA.toFixed(2)} vs ${team1PPA.toFixed(2)}) and a lower success rate (${(team2SR * 100).toFixed(1)}% vs ${(team1SR * 100).toFixed(1)}%).`;
    } else {
      analysis = `Defensively, these teams show different strengths. ${team1PPA < team2PPA ? this.team1.school : this.team2.school} allows fewer predicted points per play, while ${team1SR < team2SR ? this.team1.school : this.team2.school} maintains a lower opponent success rate.`;
    }

    // Add havoc and stuff rate analysis
    if (team1Havoc > team2Havoc && team1Stuff > team2Stuff) {
      analysis += ` ${this.team1.school}'s defense is more disruptive, with higher havoc rate (${(team1Havoc * 100).toFixed(1)}% vs ${(team2Havoc * 100).toFixed(1)}%) and better stuff rate on rushing plays.`;
    } else if (team2Havoc > team1Havoc && team2Stuff > team1Stuff) {
      analysis += ` ${this.team2.school}'s defense generates more negative plays, with superior havoc rate (${(team2Havoc * 100).toFixed(1)}% vs ${(team1Havoc * 100).toFixed(1)}%) and better stuff rate against the run.`;
    } else {
      if (team1Havoc > team2Havoc) {
        analysis += ` ${this.team1.school} is better at creating disruptive plays (havoc rate ${(team1Havoc * 100).toFixed(1)}%).`;
      } else {
        analysis += ` ${this.team2.school} is more disruptive defensively (havoc rate ${(team2Havoc * 100).toFixed(1)}%).`;
      }

      if (team1Stuff > team2Stuff) {
        analysis += ` ${this.team1.school} is more effective at stopping runs at or behind the line.`;
      } else {
        analysis += ` ${this.team2.school} is better at stuffing running plays.`;
      }
    }

    return analysis;
  }

  efficiencyAnalysis() {
    if (!this.team1Stats || !this.team2Stats) {
      return "Insufficient data to analyze efficiency metrics.";
    }

    const team1PPO = this.team1Stats.offense.pointsPerOpportunity;
    const team2PPO = this.team2Stats.offense.pointsPerOpportunity;
    const team1Expl = this.team1Stats.offense.explosiveness;
    const team2Expl = this.team2Stats.offense.explosiveness;

    const team1StdSR = this.team1Stats.offense.standardDowns?.successRate || 0;
    const team2StdSR = this.team2Stats.offense.standardDowns?.successRate || 0;
    const team1PassSR = this.team1Stats.offense.passingDowns?.successRate || 0;
    const team2PassSR = this.team2Stats.offense.passingDowns?.successRate || 0;

    let analysis = "";

    if (team1PPO > team2PPO) {
      analysis = `${this.team1.school} is more efficient at converting scoring opportunities into points, averaging ${team1PPO.toFixed(2)} points per trip inside the opponent's 40-yard line compared to ${team2PPO.toFixed(2)} for ${this.team2.school}.`;
    } else {
      analysis = `${this.team2.school} maximizes scoring chances more effectively, averaging ${team2PPO.toFixed(2)} points per opportunity (drives reaching the opponent's 40-yard line) compared to ${team1PPO.toFixed(2)} for ${this.team1.school}.`;
    }

    // Add explosiveness analysis
    if (Math.abs(team1Expl - team2Expl) > 0.1) {
      if (team1Expl > team2Expl) {
        analysis += ` ${this.team1.school}'s offense creates more explosive plays (explosiveness rating of ${team1Expl.toFixed(2)} vs ${team2Expl.toFixed(2)}).`;
      } else {
        analysis += ` ${this.team2.school}'s offense generates more big plays (explosiveness rating of ${team2Expl.toFixed(2)} vs ${team1Expl.toFixed(2)}).`;
      }
    } else {
      analysis += " Both teams show similar explosiveness ratings in their offensive production.";
    }

    // Add down efficiency analysis
    if (team1StdSR > team2StdSR && team1PassSR > team2PassSR) {
      analysis += ` ${this.team1.school} is more efficient on both standard downs (${(team1StdSR * 100).toFixed(1)}% success rate) and passing downs (${(team1PassSR * 100).toFixed(1)}% success rate).`;
    } else if (team2StdSR > team1StdSR && team2PassSR > team1PassSR) {
      analysis += ` ${this.team2.school} maintains better efficiency on both standard downs (${(team2StdSR * 100).toFixed(1)}% success rate) and passing downs (${(team2PassSR * 100).toFixed(1)}% success rate).`;
    } else {
      if (team1StdSR > team2StdSR) {
        analysis += ` ${this.team1.school} is more efficient on standard downs, while`;
      } else {
        analysis += ` ${this.team2.school} is more efficient on standard downs, while`;
      }

      if (team1PassSR > team2PassSR) {
        analysis += ` ${this.team1.school} performs better on passing downs.`;
      } else {
        analysis += ` ${this.team2.school} performs better on passing downs.`;
      }
    }

    return analysis;
  }

  fieldPositionAnalysis() {
    if (!this.team1Stats || !this.team2Stats) {
      return "Insufficient data to analyze field position metrics.";
    }

    const team1Start = this.team1Stats.offense.fieldPosition?.averageStart || 25;
    const team2Start = this.team2Stats.offense.fieldPosition?.averageStart || 25;
    const team1DefStart = this.team1Stats.defense.fieldPosition?.averageStart || 25;
    const team2DefStart = this.team2Stats.defense.fieldPosition?.averageStart || 25;
    const team1PP = this.team1Stats.offense.fieldPosition?.averagePredictedPoints || 0;
    const team2PP = this.team2Stats.offense.fieldPosition?.averagePredictedPoints || 0;

    let analysis = "";

    if (team1Start > team2Start) {
      analysis = `${this.team1.school} typically starts offensive drives in better field position (own ${team1Start.toFixed(1)} yard line vs own ${team2Start.toFixed(1)} for ${this.team2.school}).`;
    } else if (team2Start > team1Start) {
      analysis = `${this.team2.school} enjoys better starting field position on average (own ${team2Start.toFixed(1)} yard line vs own ${team1Start.toFixed(1)} for ${this.team1.school}).`;
    } else {
      analysis = `Both teams have similar average starting field position around their own ${team1Start.toFixed(1)} yard line.`;
    }

    // Add defensive field position
    const team1FieldAdvantage = team1Start - team1DefStart;
    const team2FieldAdvantage = team2Start - team2DefStart;

    if (team1FieldAdvantage > team2FieldAdvantage) {
      analysis += ` ${this.team1.school} maintains a stronger overall field position advantage (${team1FieldAdvantage.toFixed(1)} yards) compared to ${this.team2.school} (${team2FieldAdvantage.toFixed(1)} yards).`;
    } else if (team2FieldAdvantage > team1FieldAdvantage) {
      analysis += ` ${this.team2.school} creates a better overall field position advantage (${team2FieldAdvantage.toFixed(1)} yards) compared to ${this.team1.school} (${team1FieldAdvantage.toFixed(1)} yards).`;
    } else {
      analysis += " Both teams maintain similar overall field position advantages.";
    }

    // Add predicted points from field position
    if (Math.abs(team1PP - team2PP) > 0.1) {
      if (team1PP > team2PP) {
        analysis += ` ${this.team1.school}'s field position translates to ${team1PP.toFixed(2)} expected points per drive, giving them an advantage over ${this.team2.school}'s ${team2PP.toFixed(2)}.`;
      } else {
        analysis += ` ${this.team2.school}'s field position translates to ${team2PP.toFixed(2)} expected points per drive, giving them an advantage over ${this.team1.school}'s ${team1PP.toFixed(2)}.`;
      }
    }

    return analysis;
  }

  situationalAnalysis() {
    if (!this.team1Stats || !this.team2Stats) {
      return "Insufficient data to analyze situational performance.";
    }

    const team1PPO = this.team1Stats.offense.pointsPerOpportunity;
    const team2PPO = this.team2Stats.offense.pointsPerOpportunity;
    const team1StdSR = this.team1Stats.offense.standardDowns?.successRate || 0;
    const team2StdSR = this.team2Stats.offense.standardDowns?.successRate || 0;
    const team1PassSR = this.team1Stats.offense.passingDowns?.successRate || 0;
    const team2PassSR = this.team2Stats.offense.passingDowns?.successRate || 0;

    let analysis = "";

    // Red zone / scoring opportunities analysis
    if (Math.abs(team1PPO - team2PPO) > 0.3) {
      if (team1PPO > team2PPO) {
        analysis = `${this.team1.school} is significantly more efficient at converting scoring opportunities, averaging ${team1PPO.toFixed(2)} points per trip inside the opponent's 40-yard line compared to ${team2PPO.toFixed(2)} for ${this.team2.school}.`;
      } else {
        analysis = `${this.team2.school} is notably better at capitalizing on scoring chances, averaging ${team2PPO.toFixed(2)} points per opportunity compared to ${team1PPO.toFixed(2)} for ${this.team1.school}.`;
      }
    } else {
      analysis = `Both teams show similar efficiency in converting scoring opportunities, with ${this.team1.school} averaging ${team1PPO.toFixed(2)} points and ${this.team2.school} averaging ${team2PPO.toFixed(2)} points per trip inside the opponent's 40-yard line.`;
    }

    // Down and distance situation analysis
    const team1StdPassRatio = (team1StdSR > 0 && team1PassSR > 0) ? team1PassSR / team1StdSR : 0;
    const team2StdPassRatio = (team2StdSR > 0 && team2PassSR > 0) ? team2PassSR / team2StdSR : 0;

    analysis += ` On standard downs (less pressure situations), ${team1StdSR > team2StdSR ? this.team1.school : this.team2.school} is more successful (${(Math.max(team1StdSR, team2StdSR) * 100).toFixed(1)}% vs ${(Math.min(team1StdSR, team2StdSR) * 100).toFixed(1)}%).`;

    analysis += ` In passing downs (higher pressure situations), ${team1PassSR > team2PassSR ? this.team1.school : this.team2.school} performs better with a ${(Math.max(team1PassSR, team2PassSR) * 100).toFixed(1)}% success rate.`;

    // Add pressure performance insight
    if (Math.abs(team1StdPassRatio - team2StdPassRatio) > 0.1) {
      if (team1StdPassRatio > team2StdPassRatio) {
        analysis += ` ${this.team1.school} maintains their efficiency better when facing pressure situations.`;
      } else {
        analysis += ` ${this.team2.school} handles pressure situations more effectively relative to their standard down performance.`;
      }
    } else {
      analysis += " Both teams show similar performance drops when moving from standard to passing downs.";
    }

    return analysis;
  }
}

export default ComparisonAnalyzer;
