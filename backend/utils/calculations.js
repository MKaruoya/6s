/**
 * CAPWELL 6S AUDIT MANAGEMENT SYSTEM
 * Scoring Calculations Engine
 * Handles all scoring logic for all audit types
 */

// ============================================
// 1. ABNORMALITY-BASED SCORING
// ============================================
/**
 * Calculate points based on abnormalities found
 * Standard scoring: 0 abnormalities = full marks, 1-2 = half marks, 3+ = zero marks
 * 
 * @param {number} abnormalities - Number of abnormalities found
 * @param {number} maxPoints - Maximum points for this checkpoint
 * @returns {number} Points awarded
 */
function calculateAbnormalityScore(abnormalities, maxPoints) {
  if (abnormalities === 0) {
    return maxPoints; // Full marks
  } else if (abnormalities === 1 || abnormalities === 2) {
    return maxPoints / 2; // Half marks
  } else if (abnormalities >= 3) {
    return 0; // Zero marks
  }
  return 0;
}

// ============================================
// 2. SECTION SCORE CALCULATION
// ============================================
/**
 * Calculate total score for a section
 * Sums all checkpoint scores in the section
 * 
 * @param {array} checkpointScores - Array of checkpoint scores
 * @returns {number} Total section score
 */
function calculateSectionScore(checkpointScores) {
  return checkpointScores.reduce((sum, score) => sum + score, 0);
}

// ============================================
// 3. TOTAL AUDIT SCORE
// ============================================
/**
 * Calculate total audit score
 * Sums all section scores
 * 
 * @param {array} sectionScores - Array of section scores
 * @returns {number} Total audit score
 */
function calculateTotalScore(sectionScores) {
  return sectionScores.reduce((sum, score) => sum + score, 0);
}

// ============================================
// 4. PERCENTAGE SCORE
// ============================================
/**
 * Calculate percentage score
 * (Total Score / Max Score) * 100
 * 
 * @param {number} totalScore - Total audit score
 * @param {number} maxScore - Maximum possible score
 * @returns {number} Percentage score (0-100)
 */
function calculatePercentageScore(totalScore, maxScore) {
  if (maxScore === 0) return 0;
  return (totalScore / maxScore) * 100;
}

// ============================================
// 5. DECLINE SCORING PENALTY (5S - SUSTAIN)
// ============================================
/**
 * Apply decline scoring penalty
 * If current score is lower than previous month, apply penalty
 * 
 * Penalty rules:
 * - 0-5 marks decline: No penalty
 * - 5.1-10 marks decline: Award half the marks
 * - Above 10 marks decline: No marks awarded (0 points)
 * 
 * @param {number} currentScore - Current audit score
 * @param {number} previousScore - Previous month's audit score
 * @param {number} maxSectionScore - Max score for 5S section
 * @returns {object} { penaltyApplied: boolean, pointsDeducted: number, reason: string }
 */
function calculateDeclinePenalty(currentScore, previousScore, maxSectionScore) {
  if (!previousScore || currentScore >= previousScore) {
    return {
      penaltyApplied: false,
      pointsDeducted: 0,
      reason: 'No decline detected'
    };
  }

  const declineAmount = previousScore - currentScore;

  if (declineAmount <= 5) {
    return {
      penaltyApplied: false,
      pointsDeducted: 0,
      reason: `Minor decline of ${declineAmount.toFixed(2)} marks (≤5)`
    };
  } else if (declineAmount > 5 && declineAmount <= 10) {
    const penaltyPoints = maxSectionScore / 2; // Half marks
    return {
      penaltyApplied: true,
      pointsDeducted: penaltyPoints,
      reason: `Moderate decline of ${declineAmount.toFixed(2)} marks (5.1-10): Award half marks`
    };
  } else {
    const penaltyPoints = maxSectionScore; // Full deduction
    return {
      penaltyApplied: true,
      pointsDeducted: penaltyPoints,
      reason: `Significant decline of ${declineAmount.toFixed(2)} marks (>10): No marks awarded`
    };
  }
}

// ============================================
// 6. LOST TIME INJURY (LTI) PENALTY (6S - SAFETY)
// ============================================
/**
 * Apply LTI penalty to safety section
 * 
 * Penalty rules:
 * - 0-15 minutes lost: No penalty
 * - 16-30 minutes lost: Award half marks
 * - More than 30 minutes lost: No marks awarded
 * 
 * @param {number} ltiMinutes - Lost time injury duration in minutes
 * @param {number} maxSectionScore - Max score for 6S section
 * @returns {object} { penaltyApplied: boolean, pointsDeducted: number, reason: string }
 */
function calculateLTIPenalty(ltiMinutes, maxSectionScore) {
  if (!ltiMinutes || ltiMinutes === 0) {
    return {
      penaltyApplied: false,
      pointsDeducted: 0,
      reason: 'No LTI recorded'
    };
  }

  if (ltiMinutes <= 15) {
    return {
      penaltyApplied: false,
      pointsDeducted: 0,
      reason: `LTI of ${ltiMinutes} minutes (≤15): No penalty`
    };
  } else if (ltiMinutes > 15 && ltiMinutes <= 30) {
    const penaltyPoints = maxSectionScore / 2; // Half marks
    return {
      penaltyApplied: true,
      pointsDeducted: penaltyPoints,
      reason: `LTI of ${ltiMinutes} minutes (16-30): Award half marks`
    };
  } else {
    const penaltyPoints = maxSectionScore; // Full deduction
    return {
      penaltyApplied: true,
      pointsDeducted: penaltyPoints,
      reason: `LTI of ${ltiMinutes} minutes (>30): No marks awarded`
    };
  }
}

// ============================================
// 7. INNOVATION SCORING BONUS (5S - SUSTAIN)
// ============================================
/**
 * Apply innovation bonus to sustain section
 * 
 * Bonus rules:
 * - One innovation: Half marks (2 points)
 * - More than one innovation: Full marks (4 points)
 * - No innovation: 0 marks
 * 
 * @param {number} innovationCount - Number of innovations implemented
 * @param {number} maxSectionScore - Max score for 5S section
 * @returns {object} { bonusApplied: boolean, pointsAwarded: number, reason: string }
 */
function calculateInnovationBonus(innovationCount, maxSectionScore) {
  if (!innovationCount || innovationCount === 0) {
    return {
      bonusApplied: false,
      pointsAwarded: 0,
      reason: 'No innovations recorded'
    };
  }

  if (innovationCount === 1) {
    const bonusPoints = maxSectionScore / 2; // Half marks
    return {
      bonusApplied: true,
      pointsAwarded: bonusPoints,
      reason: `One innovation: Award half marks (${bonusPoints} points)`
    };
  } else {
    const bonusPoints = maxSectionScore; // Full marks
    return {
      bonusApplied: true,
      pointsAwarded: bonusPoints,
      reason: `${innovationCount} innovations: Award full marks (${bonusPoints} points)`
    };
  }
}

// ============================================
// 8. FINAL SECTION SCORE WITH PENALTIES/BONUSES
// ============================================
/**
 * Calculate final section score after applying all penalties and bonuses
 * 
 * @param {number} sectionScore - Base section score
 * @param {object} penalties - Penalties object { decline, lti }
 * @param {object} bonuses - Bonuses object { innovation }
 * @returns {object} { finalScore: number, breakdown: object }
 */
function calculateFinalSectionScore(sectionScore, penalties = {}, bonuses = {}) {
  let finalScore = sectionScore;
  const breakdown = {
    baseScore: sectionScore,
    penaltiesDeducted: 0,
    bonusesAwarded: 0,
    finalScore: 0
  };

  // Apply penalties
  if (penalties.decline && penalties.decline.penaltyApplied) {
    finalScore -= penalties.decline.pointsDeducted;
    breakdown.penaltiesDeducted += penalties.decline.pointsDeducted;
  }

  if (penalties.lti && penalties.lti.penaltyApplied) {
    finalScore -= penalties.lti.pointsDeducted;
    breakdown.penaltiesDeducted += penalties.lti.pointsDeducted;
  }

  // Apply bonuses
  if (bonuses.innovation && bonuses.innovation.bonusApplied) {
    finalScore += bonuses.innovation.pointsAwarded;
    breakdown.bonusesAwarded += bonuses.innovation.pointsAwarded;
  }

  // Ensure score doesn't go below 0
  finalScore = Math.max(0, finalScore);

  breakdown.finalScore = finalScore;
  return { finalScore, breakdown };
}

// ============================================
// 9. COMPLETE AUDIT SCORING
// ============================================
/**
 * Calculate complete audit score with all sections, penalties, and bonuses
 * 
 * @param {object} auditData - Complete audit data
 * @returns {object} Complete scoring breakdown
 */
function calculateCompleteAuditScore(auditData) {
  const {
    sections,
    maxScore,
    previousAuditScore,
    ltiMinutes,
    innovationCount
  } = auditData;

  const sectionScores = [];
  const sectionBreakdowns = [];

  // Calculate each section
  sections.forEach((section) => {
    const sectionScore = calculateSectionScore(section.checkpointScores);
    
    // Calculate penalties and bonuses for this section
    const penalties = {};
    const bonuses = {};

    // Apply decline penalty to 5S (Sustain)
    if (section.sectionCode === '5S' && previousAuditScore) {
      penalties.decline = calculateDeclinePenalty(
        sectionScore,
        previousAuditScore,
        section.maxPoints
      );
    }

    // Apply LTI penalty to 6S (Safety)
    if (section.sectionCode === '6S' && ltiMinutes) {
      penalties.lti = calculateLTIPenalty(ltiMinutes, section.maxPoints);
    }

    // Apply innovation bonus to 5S (Sustain)
    if (section.sectionCode === '5S' && innovationCount) {
      bonuses.innovation = calculateInnovationBonus(
        innovationCount,
        section.maxPoints
      );
    }

    // Calculate final section score
    const { finalScore, breakdown } = calculateFinalSectionScore(
      sectionScore,
      penalties,
      bonuses
    );

    sectionScores.push(finalScore);
    sectionBreakdowns.push({
      sectionCode: section.sectionCode,
      sectionName: section.sectionName,
      baseScore: sectionScore,
      maxPoints: section.maxPoints,
      penalties,
      bonuses,
      finalScore,
      breakdown
    });
  });

  // Calculate total and percentage
  const totalScore = calculateTotalScore(sectionScores);
  const percentageScore = calculatePercentageScore(totalScore, maxScore);

  return {
    totalScore,
    percentageScore,
    maxScore,
    sectionBreakdowns,
    summary: {
      totalScore: totalScore.toFixed(2),
      percentageScore: percentageScore.toFixed(2),
      status: getAuditStatus(percentageScore)
    }
  };
}

// ============================================
// 10. AUDIT STATUS DETERMINATION
// ============================================
/**
 * Determine audit status based on percentage score
 * 
 * @param {number} percentageScore - Percentage score (0-100)
 * @returns {string} Status: 'Excellent', 'Good', 'Needs Improvement', 'Critical'
 */
function getAuditStatus(percentageScore) {
  if (percentageScore >= 85) return 'Excellent';
  if (percentageScore >= 70) return 'Good';
  if (percentageScore >= 50) return 'Needs Improvement';
  return 'Critical';
}

// ============================================
// 11. TREND ANALYSIS
// ============================================
/**
 * Calculate trend direction and velocity
 * 
 * @param {array} recentScores - Array of recent audit scores (last 4-12 audits)
 * @returns {object} { direction: string, velocity: number, trend: string }
 */
function calculateTrend(recentScores) {
  if (recentScores.length < 2) {
    return {
      direction: 'stable',
      velocity: 0,
      trend: 'Insufficient data'
    };
  }

  const currentScore = recentScores[recentScores.length - 1];
  const previousScore = recentScores[recentScores.length - 2];
  const change = currentScore - previousScore;
  const velocity = (change / previousScore) * 100; // Percentage change

  let direction = 'stable';
  if (change > 2) direction = 'up';
  if (change < -2) direction = 'down';

  return {
    direction,
    velocity: velocity.toFixed(2),
    trend: `${direction.toUpperCase()} (${velocity > 0 ? '+' : ''}${velocity.toFixed(2)}%)`
  };
}

// ============================================
// 12. COMPLIANCE FLAGGING
// ============================================
/**
 * Flag compliance issues
 * 
 * @param {object} auditScore - Complete audit score object
 * @param {number} complianceThreshold - Minimum acceptable score (default 70%)
 * @returns {array} Array of compliance flags
 */
function flagComplianceIssues(auditScore, complianceThreshold = 70) {
  const flags = [];

  if (auditScore.percentageScore < complianceThreshold) {
    flags.push({
      severity: 'high',
      message: `Score below threshold: ${auditScore.percentageScore.toFixed(2)}% (threshold: ${complianceThreshold}%)`
    });
  }

  // Check for sections below 50%
  auditScore.sectionBreakdowns.forEach((section) => {
    const sectionPercentage = (section.finalScore / section.maxPoints) * 100;
    if (sectionPercentage < 50) {
      flags.push({
        severity: 'high',
        message: `${section.sectionName} (${section.sectionCode}) critically low: ${sectionPercentage.toFixed(2)}%`
      });
    }
  });

  return flags;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  calculateAbnormalityScore,
  calculateSectionScore,
  calculateTotalScore,
  calculatePercentageScore,
  calculateDeclinePenalty,
  calculateLTIPenalty,
  calculateInnovationBonus,
  calculateFinalSectionScore,
  calculateCompleteAuditScore,
  getAuditStatus,
  calculateTrend,
  flagComplianceIssues
};
