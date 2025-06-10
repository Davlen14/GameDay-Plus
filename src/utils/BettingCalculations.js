/**
 * Centralized utility for all betting calculations and odds conversions
 * React/JavaScript implementation of the Swift BettingCalculations
 */

export class BettingCalculations {
  // MARK: - Odds Conversion

  /**
   * Convert American odds to decimal odds
   * @param {number|null} americanOdds - Odds in American format (e.g. +150, -110)
   * @returns {number|null} Odds in decimal format (e.g. 2.5, 1.91)
   */
  static americanToDecimal(americanOdds) {
    if (!americanOdds || americanOdds === 0) return null;
    
    if (americanOdds > 0) {
      return (americanOdds / 100.0) + 1.0;
    } else {
      return (100.0 / Math.abs(americanOdds)) + 1.0;
    }
  }

  /**
   * Convert decimal odds to American odds
   * @param {number|null} decimalOdds - Odds in decimal format (e.g. 2.5, 1.91)
   * @returns {number|null} Odds in American format (e.g. +150, -110)
   */
  static decimalToAmerican(decimalOdds) {
    if (!decimalOdds || decimalOdds <= 1.0) return null;
    
    if (decimalOdds >= 2.0) {
      return Math.round((decimalOdds - 1.0) * 100.0);
    } else {
      return Math.round(-100.0 / (decimalOdds - 1.0));
    }
  }

  /**
   * Convert decimal odds to fractional odds (string representation)
   * @param {number|null} decimalOdds - Odds in decimal format (e.g. 2.5, 1.91)
   * @returns {string|null} Odds in fractional format as a string (e.g. "3/2", "10/11")
   */
  static decimalToFractional(decimalOdds) {
    if (!decimalOdds || decimalOdds <= 1.0) return null;
    
    const decimal = decimalOdds - 1.0;
    
    // Common fractional representations
    const commonFractions = [
      { threshold: 0.5, fraction: "1/2" },
      { threshold: 0.33, fraction: "1/3" },
      { threshold: 0.25, fraction: "1/4" },
      { threshold: 0.2, fraction: "1/5" },
      { threshold: 0.66, fraction: "2/3" },
      { threshold: 0.75, fraction: "3/4" },
      { threshold: 1.0, fraction: "1/1" },
      { threshold: 1.5, fraction: "3/2" },
      { threshold: 2.0, fraction: "2/1" },
      { threshold: 3.0, fraction: "3/1" },
      { threshold: 4.0, fraction: "4/1" },
      { threshold: 5.0, fraction: "5/1" }
    ];
    
    // Check for common fractions
    for (const { threshold, fraction } of commonFractions) {
      if (Math.abs(decimal - threshold) < 0.01) {
        return fraction;
      }
    }
    
    // Convert to fraction using GCD algorithm
    return this.decimalToFractionApproximation(decimal);
  }

  /**
   * Helper function to convert a decimal to a fractional representation
   * @private
   */
  static decimalToFractionApproximation(decimal) {
    const precision = 1000.0;
    const numerator = Math.round(decimal * precision);
    const denominator = precision;
    const gcd = this.greatestCommonDivisor(numerator, denominator);
    
    return `${numerator/gcd}/${denominator/gcd}`;
  }

  /**
   * Find the greatest common divisor using Euclidean algorithm
   * @private
   */
  static greatestCommonDivisor(a, b) {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * Calculate implied probability from decimal odds
   * @param {number|null} decimalOdds - Odds in decimal format (e.g. 2.5, 1.91)
   * @returns {number|null} Implied probability as a percentage (e.g. 40, 52.36)
   */
  static decimalToImpliedProbability(decimalOdds) {
    if (!decimalOdds || decimalOdds <= 1.0) return null;
    return (1.0 / decimalOdds) * 100.0;
  }

  /**
   * Convert implied probability to decimal odds
   * @param {number|null} impliedProbability - Probability as a percentage (e.g. 40, 52.36)
   * @returns {number|null} Odds in decimal format (e.g. 2.5, 1.91)
   */
  static impliedProbabilityToDecimal(impliedProbability) {
    if (!impliedProbability || impliedProbability <= 0 || impliedProbability >= 100) return null;
    return 100.0 / impliedProbability;
  }

  /**
   * Calculate implied probability from American odds
   * @param {number|null} americanOdds - Odds in American format (e.g. +150, -110)
   * @returns {number|null} Implied probability as a percentage (e.g. 40, 52.36)
   */
  static americanToImpliedProbability(americanOdds) {
    const decimalOdds = this.americanToDecimal(americanOdds);
    return this.decimalToImpliedProbability(decimalOdds);
  }

  /**
   * Pretty format for American odds with + or - sign
   * @param {number|null} odds - Odds in American format
   * @returns {string} Formatted string representation
   */
  static formatAmericanOdds(odds) {
    if (!odds) return "N/A";
    return odds > 0 ? `+${odds}` : `${odds}`;
  }

  // MARK: - Vigorish (Vig) Calculations

  /**
   * Calculate the vigorish (juice/vig) percentage for a two-way market
   * @param {number|null} odds1 - First odds (American format)
   * @param {number|null} odds2 - Second odds (American format)
   * @returns {number|null} Vig percentage (e.g. 4.5)
   */
  static calculateVig(odds1, odds2) {
    const prob1 = this.americanToImpliedProbability(odds1);
    const prob2 = this.americanToImpliedProbability(odds2);
    
    if (!prob1 || !prob2) return null;
    
    const totalImpliedProbability = prob1 + prob2;
    return totalImpliedProbability - 100.0;
  }

  /**
   * Remove vig from a pair of odds and get fair odds
   * @param {number|null} odds1 - First odds (American format)
   * @param {number|null} odds2 - Second odds (American format)
   * @returns {Object|null} Object with fairOdds1 and fairOdds2 properties
   */
  static removeVig(odds1, odds2) {
    const prob1 = this.americanToImpliedProbability(odds1);
    const prob2 = this.americanToImpliedProbability(odds2);
    
    if (!prob1 || !prob2) return null;
    
    const totalProb = prob1 + prob2;
    if (totalProb <= 0) return null;
    
    const fairProb1 = (prob1 / totalProb) * 100.0;
    const fairProb2 = (prob2 / totalProb) * 100.0;
    
    const fairDecimal1 = this.impliedProbabilityToDecimal(fairProb1);
    const fairDecimal2 = this.impliedProbabilityToDecimal(fairProb2);
    
    return {
      fairOdds1: this.decimalToAmerican(fairDecimal1),
      fairOdds2: this.decimalToAmerican(fairDecimal2)
    };
  }

  /**
   * Calculate fair value (no-vig) odds from a set of market odds
   * @param {Array<number|null>} marketOdds - Array of market odds (American format)
   * @returns {number|null} Fair value odds in American format
   */
  static calculateFairValueOdds(marketOdds) {
    const validOdds = marketOdds.filter(odds => odds != null);
    if (validOdds.length === 0) return null;
    
    const impliedProbabilities = validOdds
      .map(odds => this.americanToImpliedProbability(odds))
      .filter(prob => prob != null);
    
    if (impliedProbabilities.length === 0) return null;
    
    const avgImpliedProbability = impliedProbabilities.reduce((sum, prob) => sum + prob, 0) / impliedProbabilities.length;
    const fairDecimalOdds = this.impliedProbabilityToDecimal(avgImpliedProbability);
    
    return this.decimalToAmerican(fairDecimalOdds);
  }

  // MARK: - Arbitrage Calculations

  /**
   * Check if there's an arbitrage opportunity between two odds
   * @param {number|null} odds1 - First odds in American format
   * @param {number|null} odds2 - Second odds in American format
   * @returns {boolean} True if there's an arbitrage opportunity
   */
  static isArbitrageOpportunity(odds1, odds2) {
    const decimal1 = this.americanToDecimal(odds1);
    const decimal2 = this.americanToDecimal(odds2);
    
    if (!decimal1 || !decimal2) return false;
    
    const impliedProb1 = 1.0 / decimal1;
    const impliedProb2 = 1.0 / decimal2;
    
    return (impliedProb1 + impliedProb2) < 1.0;
  }

  /**
   * Calculate the profit margin for an arbitrage opportunity
   * @param {number|null} odds1 - First odds in American format
   * @param {number|null} odds2 - Second odds in American format
   * @returns {number|null} Profit margin as a percentage (e.g. 3.5)
   */
  static calculateArbitrageMargin(odds1, odds2) {
    const decimal1 = this.americanToDecimal(odds1);
    const decimal2 = this.americanToDecimal(odds2);
    
    if (!decimal1 || !decimal2) return null;
    
    const impliedProb1 = 1.0 / decimal1;
    const impliedProb2 = 1.0 / decimal2;
    const totalImpliedProb = impliedProb1 + impliedProb2;
    
    if (totalImpliedProb >= 1.0) return null;
    
    return (1.0 - totalImpliedProb) * 100.0;
  }

  /**
   * Calculate optimal stake allocation for an arbitrage opportunity
   * @param {number|null} odds1 - First odds in American format
   * @param {number|null} odds2 - Second odds in American format
   * @param {number} totalStake - Total amount to stake
   * @returns {Object|null} Object with stake1, stake2, profit, and profitMargin properties
   */
  static calculateArbitrageStakes(odds1, odds2, totalStake) {
    const decimal1 = this.americanToDecimal(odds1);
    const decimal2 = this.americanToDecimal(odds2);
    
    if (!decimal1 || !decimal2) return null;
    
    const impliedProb1 = 1.0 / decimal1;
    const impliedProb2 = 1.0 / decimal2;
    const totalImpliedProb = impliedProb1 + impliedProb2;
    
    if (totalImpliedProb >= 1.0) return null;
    
    const stake1 = (impliedProb1 / totalImpliedProb) * totalStake;
    const stake2 = (impliedProb2 / totalImpliedProb) * totalStake;
    
    const profit = (totalStake / totalImpliedProb) - totalStake;
    const profitMargin = (1.0 - totalImpliedProb) * 100.0;
    
    return { stake1, stake2, profit, profitMargin };
  }

  /**
   * Find the best arbitrage opportunity from a list of market odds
   * @param {Array<Object>} lines - Array of objects with provider, homeOdds, awayOdds
   * @returns {Object|null} Best arbitrage opportunity details
   */
  static findBestArbitrageOpportunity(lines) {
    let bestArbitrage = null;
    
    for (let i = 0; i < lines.length; i++) {
      for (let j = 0; j < lines.length; j++) {
        if (i === j) continue;
        
        const homeBook = lines[i].provider;
        const homeOdds = lines[i].homeOdds;
        
        const awayBook = lines[j].provider;
        const awayOdds = lines[j].awayOdds;
        
        const margin = this.calculateArbitrageMargin(homeOdds, awayOdds);
        
        if (margin && (!bestArbitrage || margin > bestArbitrage.margin)) {
          bestArbitrage = {
            homeBook,
            homeOdds,
            awayBook,
            awayOdds,
            margin
          };
        }
      }
    }
    
    return bestArbitrage;
  }

  /**
   * Check if there's a middle opportunity between two spreads
   * @param {number} spread1 - First spread value (e.g. -3.5)
   * @param {number} spread2 - Second spread value (e.g. +4.5)
   * @returns {boolean} True if there's a middle opportunity
   */
  static isMiddleOpportunity(spread1, spread2) {
    return spread1 < spread2;
  }

  // MARK: - EV (Expected Value) Calculations

  /**
   * Calculate the Expected Value (EV) percentage for a bet
   * @param {number|null} odds - Market odds in American format
   * @param {number|null} fairOdds - Fair odds in American format (no-vig odds)
   * @returns {number|null} EV as a percentage
   */
  static calculateEV(odds, fairOdds) {
    const decimalOdds = this.americanToDecimal(odds);
    const decimalFairOdds = this.americanToDecimal(fairOdds);
    
    if (!decimalOdds || !decimalFairOdds) return null;
    
    return (decimalOdds / decimalFairOdds - 1.0) * 100.0;
  }

  /**
   * Calculate the Expected Value (EV) percentage given win probability
   * @param {number|null} odds - Market odds in American format
   * @param {number} winProbability - Actual win probability as a percentage (0-100)
   * @returns {number|null} EV as a percentage
   */
  static calculateEVWithProbability(odds, winProbability) {
    const decimalOdds = this.americanToDecimal(odds);
    
    if (!decimalOdds || winProbability < 0 || winProbability > 100) return null;
    
    const probDecimal = winProbability / 100.0;
    const ev = (probDecimal * (decimalOdds - 1.0)) - (1.0 - probDecimal);
    
    return ev * 100.0;
  }

  /**
   * Calculate the edge percentage - how much better your odds are vs market
   * @param {number|null} odds - Market odds in American format
   * @param {number|null} fairOdds - Fair odds in American format
   * @returns {number|null} Edge as a percentage
   */
  static calculateEdge(odds, fairOdds) {
    const prob = this.americanToImpliedProbability(odds);
    const fairProb = this.americanToImpliedProbability(fairOdds);
    
    if (!prob || !fairProb) return null;
    
    return fairProb - prob;
  }

  // MARK: - Kelly Criterion Calculations

  /**
   * Calculate the optimal stake percentage using the Kelly Criterion
   * @param {number|null} odds - Market odds in American format
   * @param {number} winProbability - True win probability as a percentage (0-100)
   * @returns {number|null} Kelly stake as a percentage of bankroll
   */
  static calculateKelly(odds, winProbability) {
    const decimalOdds = this.americanToDecimal(odds);
    
    if (!decimalOdds || winProbability < 0 || winProbability > 100) return null;
    
    const prob = winProbability / 100.0;
    const b = decimalOdds - 1.0;
    const q = 1.0 - prob;
    
    const kelly = (b * prob - q) / b;
    
    return Math.max(0, kelly) * 100.0;
  }

  /**
   * Calculate the optimal stake percentage using the Kelly Criterion from market and fair odds
   * @param {number|null} odds - Market odds in American format
   * @param {number|null} fairOdds - Fair odds in American format
   * @returns {number|null} Kelly stake as a percentage of bankroll
   */
  static calculateKellyFromOdds(odds, fairOdds) {
    const fairProb = this.americanToImpliedProbability(fairOdds);
    if (!fairProb) return null;
    
    return this.calculateKelly(odds, fairProb);
  }

  /**
   * Calculate the fractional Kelly (adjusted Kelly) stake percentage
   * @param {number|null} odds - Market odds in American format
   * @param {number} winProbability - True win probability as a percentage (0-100)
   * @param {number} fraction - Fraction of full Kelly to use (e.g. 0.5 for half Kelly)
   * @returns {number|null} Fractional Kelly stake as a percentage of bankroll
   */
  static calculateFractionalKelly(odds, winProbability, fraction = 0.5) {
    const kelly = this.calculateKelly(odds, winProbability);
    if (!kelly) return null;
    
    return kelly * fraction;
  }

  // MARK: - Staking Calculations

  /**
   * Calculate the expected return on a stake
   * @param {number|null} odds - Odds in American format
   * @param {number} stake - Stake amount
   * @returns {number|null} Expected return amount
   */
  static calculateExpectedReturn(odds, stake) {
    const decimalOdds = this.americanToDecimal(odds);
    if (!decimalOdds) return null;
    
    return stake * decimalOdds;
  }

  /**
   * Calculate the profit on a winning bet
   * @param {number|null} odds - Odds in American format
   * @param {number} stake - Stake amount
   * @returns {number|null} Profit amount
   */
  static calculateProfit(odds, stake) {
    const expected = this.calculateExpectedReturn(odds, stake);
    if (!expected) return null;
    
    return expected - stake;
  }

  /**
   * Calculate the EV (in monetary terms) of a bet
   * @param {number|null} odds - Market odds in American format
   * @param {number|null} fairOdds - Fair odds in American format
   * @param {number} stake - Stake amount
   * @returns {number|null} Expected value in monetary terms
   */
  static calculateExpectedValue(odds, fairOdds, stake) {
    const evPercentage = this.calculateEV(odds, fairOdds);
    if (!evPercentage) return null;
    
    return stake * (evPercentage / 100.0);
  }

  /**
   * Calculate the ROI (Return on Investment) percentage
   * @param {number} profit - Profit amount
   * @param {number} stake - Stake amount
   * @returns {number|null} ROI as a percentage
   */
  static calculateROI(profit, stake) {
    if (stake <= 0) return null;
    return (profit / stake) * 100.0;
  }

  // MARK: - Closing Line Value (CLV) Calculations

  /**
   * Calculate Closing Line Value - how much value you captured vs the closing line
   * @param {number|null} placedOdds - Odds you got when placing the bet
   * @param {number|null} closingOdds - Final odds before the market closed
   * @returns {number|null} CLV as a percentage
   */
  static calculateCLV(placedOdds, closingOdds) {
    const placedDecimal = this.americanToDecimal(placedOdds);
    const closingDecimal = this.americanToDecimal(closingOdds);
    
    if (!placedDecimal || !closingDecimal) return null;
    
    const isFavorite = placedDecimal < 2.0;
    
    if (isFavorite) {
      return ((closingDecimal - placedDecimal) / (closingDecimal - 1.0)) * 100.0;
    } else {
      return ((placedDecimal - closingDecimal) / (placedDecimal - 1.0)) * 100.0;
    }
  }

  // MARK: - Parlay Calculations

  /**
   * Calculate the total odds for a parlay bet
   * @param {Array<number|null>} odds - Array of odds in American format
   * @returns {number|null} Total parlay odds in American format
   */
  static calculateParlayOdds(odds) {
    const decimalOdds = odds.map(o => this.americanToDecimal(o)).filter(o => o != null);
    
    if (decimalOdds.length !== odds.length) return null;
    
    const totalDecimalOdds = decimalOdds.reduce((total, odd) => total * odd, 1.0);
    
    return this.decimalToAmerican(totalDecimalOdds);
  }

  // MARK: - Utility Functions

  /**
   * Get color category for EV values based on a threshold
   * @param {number|null} ev - EV percentage
   * @returns {string} Color category for the EV
   */
  static getEVCategory(ev) {
    if (!ev) return 'neutral';
    
    if (ev < 0) return 'negative';
    if (ev < 3) return 'low';
    if (ev < 7) return 'medium';
    return 'high';
  }

  /**
   * Get a human-readable description of an EV value
   * @param {number|null} ev - EV percentage
   * @returns {string} Descriptive string
   */
  static getEVDescription(ev) {
    if (!ev) return "Unknown value";
    
    const category = this.getEVCategory(ev);
    switch (category) {
      case 'negative':
        return "Negative expected value";
      case 'neutral':
        return "No clear edge";
      case 'low':
        return "Slight edge";
      case 'medium':
        return "Good value";
      case 'high':
        return "Excellent value";
      default:
        return "Unknown value";
    }
  }

  /**
   * Format a monetary amount with currency symbol
   * @param {number|null} amount - Money amount
   * @returns {string} Formatted currency string
   */
  static formatMoney(amount) {
    if (!amount && amount !== 0) return "N/A";
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format a percentage value
   * @param {number|null} percentage - Percentage value
   * @returns {string} Formatted percentage string
   */
  static formatPercentage(percentage) {
    if (!percentage && percentage !== 0) return "N/A";
    
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(percentage) + "%";
  }
}

// Supporting constants
export const EVCategory = {
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};
