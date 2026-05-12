const calculations = require('./utils/calculations');

// Test data
const testAudit = {
  sections: [
    {
      sectionCode: '1S',
      sectionName: 'Sort',
      maxPoints: 10,
      checkpointScores: [4, 4, 2, 4, 4]
    },
    {
      sectionCode: '2S',
      sectionName: 'Set in Order',
      maxPoints: 15,
      checkpointScores: [4, 4, 4, 2, 4]
    },
    {
      sectionCode: '3S',
      sectionName: 'Shine',
      maxPoints: 15,
      checkpointScores: [4, 4, 4, 4, 4]
    },
    {
      sectionCode: '4S',
      sectionName: 'Standardize',
      maxPoints: 20,
      checkpointScores: [4, 4, 4, 4, 4]
    },
    {
      sectionCode: '5S',
      sectionName: 'Sustain',
      maxPoints: 20,
      checkpointScores: [4, 4, 4, 4, 4]
    },
    {
      sectionCode: '6S',
      sectionName: 'Safety',
      maxPoints: 20,
      checkpointScores: [4, 4, 4, 4, 4]
    }
  ],
  maxScore: 100,
  previousAuditScore: 85,
  ltiMinutes: 25,
  innovationCount: 2
};

console.log('\n========================================');
console.log('6S AUDIT SCORING TEST');
console.log('========================================\n');

const result = calculations.calculateCompleteAuditScore(testAudit);
console.log(JSON.stringify(result, null, 2));

console.log('\n========================================');
console.log('COMPLIANCE FLAGS');
console.log('========================================\n');

const flags = calculations.flagComplianceIssues(result, 70);
console.log(JSON.stringify(flags, null, 2));

console.log('\n========================================');
console.log('TREND ANALYSIS');
console.log('========================================\n');

const recentScores = [75, 78, 82, 85, 88];
const trend = calculations.calculateTrend(recentScores);
console.log(JSON.stringify(trend, null, 2));

console.log('\n✅ Test completed successfully!\n');
