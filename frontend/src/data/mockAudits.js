export const generateMockAudits = () => {
  const locations = ['Wheat', 'Maize Mill 1', 'Maize Mill 2', 'Beverage', 'Pulses', 'Workshop', 'Rice Mill'];
  const auditTypes = ['warehouse', 'shopfloor', 'laboratory', 'internal'];
  
  const audits = [];
  const today = new Date();

  // Generate 20 audits for the last 12 weeks
  for (let i = 0; i < 20; i++) {
    const weeksAgo = Math.floor(Math.random() * 12);
    const auditDate = new Date(today);
    auditDate.setDate(auditDate.getDate() - (weeksAgo * 7));

    const auditType = auditTypes[Math.floor(Math.random() * auditTypes.length)];
    const maxScores = {
      warehouse: 100,
      shopfloor: 120,
      laboratory: 100,
      internal: 25
    };

    const score = Math.floor(Math.random() * (maxScores[auditType] * 0.8)) + (maxScores[auditType] * 0.2);
    const percentage = Math.round((score / maxScores[auditType]) * 100);

    audits.push({
      id: i + 1,
      auditType,
      location: locations[Math.floor(Math.random() * locations.length)],
      auditor: `Auditor ${Math.floor(Math.random() * 5) + 1}`,
      date: auditDate.toISOString().split('T')[0],
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      score,
      maxScore: maxScores[auditType],
      percentage,
      status: percentage >= 85 ? 'Excellent' : percentage >= 70 ? 'Good' : percentage >= 50 ? 'Needs Improvement' : 'Critical'
    });
  }

  return audits.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const mockAudits = generateMockAudits();
