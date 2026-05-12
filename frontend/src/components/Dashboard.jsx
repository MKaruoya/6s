import React, { useState, useMemo, useEffect } from 'react';
import { getAudits } from '../services/auditService';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AUDIT_TYPE_MAP = {
  '4c67665b-dd1f-43fa-87a5-a7d9477cf303': 'warehouse',
  'bf0e6a59-a9b3-47f6-b6d5-18f0df806d45': 'shopfloor',
  'e1d3647c-aa77-420b-b072-d131f7b1af6a': 'laboratory',
  '5846ef78-480d-499f-92b1-ffdcc158fe93': 'internal'
};

// 6S Categories
const SIX_S_CATEGORIES = [
  { code: '1S', name: 'Sort (Kuchagua)', key: 'sort' },
  { code: '2S', name: 'Set in Order (Kupanga)', key: 'setInOrder' },
  { code: '3S', name: 'Shine (Kusafisha)', key: 'shine' },
  { code: '4S', name: 'Standardize (Kusanifisha)', key: 'standardize' },
  { code: '5S', name: 'Sustain (Kudumisha)', key: 'sustain' },
  { code: '6S', name: 'Safety (Kusitirisha)', key: 'safety' }
];

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedAuditType, setSelectedAuditType] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // All locations from the 6S data
  const locations = [
    'All',
    'Mill 2 Packing',
    'Wheat Packing',
    'Mill 2',
    'Rice Mill',
    'Main Lab',
    'Rice Dryer',
    'FG Warehouse',
    'Mill 1 Packing',
    'Wheat Lab/RnD Lab',
    'Pulses & Poridge Plants',
    'Wheat Mill',
    'Wheat Silo',
    'Workshop',
    'Mill 2 Lab',
    'Mill 1',
    'Central Stores',
    'Biscuit & Chapati Plants',
    'Mill 2 Silo',
    'Mill 1 Silo',
    'Bev & RTE Plants'
  ];

  const auditTypes = useMemo(() => ['All', 'warehouse', 'shopfloor', 'laboratory', 'internal'], []);

  const auditTypeLabels = {
    warehouse: 'Warehouse',
    shopfloor: 'Shopfloor',
    laboratory: 'Laboratory',
    internal: 'Internal'
  };

  // Fetch audits from Supabase on mount
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true);
        const data = await getAudits();

       

        const transformedAudits = data.map(audit => {
          let auditorName = 'Auditor';
          try {
            const notes = JSON.parse(audit.notes);
            auditorName = notes.auditors || 'Auditor';
          } catch (e) {
            auditorName = 'Auditor';
          }

          return {
            id: audit.id,
            auditType: AUDIT_TYPE_MAP[audit.audit_type_id] || 'warehouse',
            location: audit.team_name || 'Unknown',
            auditor: auditorName,
            date: audit.audit_date,
            time: '00:00',
            score: audit.total_score || 0,
            maxScore: 100,
            percentage: audit.percentage_score || 0,
            status: audit.percentage_score >= 85 ? 'Excellent' : audit.percentage_score >= 70 ? 'Good' : audit.percentage_score >= 50 ? 'Needs Improvement' : 'Critical',
            rawData: audit
          };
        });

        setAudits(transformedAudits);
        setError(null);
      } catch (err) {
        console.error('Error fetching audits:', err);
        setError('Failed to load audits');
        setAudits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  // Generate month options
  const monthOptions = useMemo(() => {
    const months = [{ value: 'current', label: 'Current Month' }];
    for (let i = 1; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      months.push({ value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, label: monthName });
    }
    return months;
  }, []);

  // Filter audits
  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const locationMatch = selectedLocation === 'All' || audit.location === selectedLocation;
      const typeMatch = selectedAuditType === 'All' || audit.auditType === selectedAuditType;

      let monthMatch = true;
      if (selectedMonth === 'current') {
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        monthMatch = audit.date.startsWith(currentMonth);
      } else {
        monthMatch = audit.date.startsWith(selectedMonth);
      }

      return locationMatch && typeMatch && monthMatch;
    });
  }, [audits, selectedLocation, selectedAuditType, selectedMonth]);

  // Calculate 6S scores for selected location - EXTRACT FROM REAL DATA
  const locationSixSScores = useMemo(() => {
    if (selectedLocation === 'All' || filteredAudits.length === 0) {
      return null;
    }

    // Get the most recent audit for this location
    const locationAudits = filteredAudits.filter(a => a.location === selectedLocation);
    if (locationAudits.length === 0) return null;

    const latestAudit = locationAudits[0]; // Most recent

    // Extract 6S scores from the audit data
    try {
      const notes = JSON.parse(latestAudit.rawData?.notes || '{}');
      const sixSScores = notes.sixSScores || {};

      console.log('Extracted 6S Scores:', sixSScores);

      return [
        { name: 'Sort', value: Math.round(sixSScores['1S'] || 0), fullName: 'Sort (Kuchagua)' },
        { name: 'Set in Order', value: Math.round(sixSScores['2S'] || 0), fullName: 'Set in Order (Kupanga)' },
        { name: 'Shine', value: Math.round(sixSScores['3S'] || 0), fullName: 'Shine (Kusafisha)' },
        { name: 'Standardize', value: Math.round(sixSScores['4S'] || 0), fullName: 'Standardize (Kusanifisha)' },
        { name: 'Sustain', value: Math.round(sixSScores['5S'] || 0), fullName: 'Sustain (Kudumisha)' },
        { name: 'Safety', value: Math.round(sixSScores['6S'] || 0), fullName: 'Safety (Kusitirisha)' }
      ];
    } catch (e) {
      console.error('Error parsing 6S scores:', e);
      return null;
    }
  }, [selectedLocation, filteredAudits]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (filteredAudits.length === 0) {
      return {
        avgScore: 0,
        totalAudits: 0,
        excellentCount: 0,
        goodCount: 0,
        needsImprovementCount: 0,
        criticalCount: 0
      };
    }

    const avgScore = Math.round(
      filteredAudits.reduce((sum, a) => sum + a.percentage, 0) / filteredAudits.length
    );

    return {
      avgScore,
      totalAudits: filteredAudits.length,
      excellentCount: filteredAudits.filter(a => a.percentage >= 85).length,
      goodCount: filteredAudits.filter(a => a.percentage >= 70 && a.percentage < 85).length,
      needsImprovementCount: filteredAudits.filter(a => a.percentage >= 50 && a.percentage < 70).length,
      criticalCount: filteredAudits.filter(a => a.percentage < 50).length
    };
  }, [filteredAudits]);

  // Calculate average by location
  const avgByLocation = useMemo(() => {
    const locationData = {};
    filteredAudits.forEach(audit => {
      if (!locationData[audit.location]) {
        locationData[audit.location] = { scores: [], count: 0 };
      }
      locationData[audit.location].scores.push(audit.percentage);
      locationData[audit.location].count += 1;
    });

    const result = {};
    Object.keys(locationData).forEach(location => {
      result[location] = Math.round(
        locationData[location].scores.reduce((a, b) => a + b, 0) / locationData[location].count
      );
    });

    return result;
  }, [filteredAudits]);

  // Get 6S category breakdown - EXTRACT FROM REAL DATA
  const sixSBreakdown = useMemo(() => {
    if (filteredAudits.length === 0) return [];

    // Calculate average for each 6S category across all filtered audits
    const categoryTotals = {
      '1S': { sum: 0, count: 0 },
      '2S': { sum: 0, count: 0 },
      '3S': { sum: 0, count: 0 },
      '4S': { sum: 0, count: 0 },
      '5S': { sum: 0, count: 0 },
      '6S': { sum: 0, count: 0 }
    };

    filteredAudits.forEach(audit => {
      try {
        const notes = JSON.parse(audit.rawData?.notes || '{}');
        const sixSScores = notes.sixSScores || {};

        Object.keys(categoryTotals).forEach(code => {
          if (sixSScores[code] !== undefined) {
            categoryTotals[code].sum += sixSScores[code];
            categoryTotals[code].count += 1;
          }
        });
      } catch (e) {
        // Skip if parsing fails
      }
    });

    return SIX_S_CATEGORIES.map(category => ({
      name: category.name,
      code: category.code,
      avgScore: categoryTotals[category.code].count > 0 
        ? Math.round(categoryTotals[category.code].sum / categoryTotals[category.code].count)
        : 0
    }));
  }, [filteredAudits]);

  // Styles (keep all existing styles)
  const containerStyle = {
    padding: '30px',
    background: '#f5f5f5',
    minHeight: '100vh'
  };

  const headerStyle = {
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '10px'
  };

  const filterContainerStyle = {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  };

  const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const filterLabelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  };

  const selectStyle = {
    padding: '10px 15px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'white'
  };

  const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const metricCardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  };

  const metricValueStyle = {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '10px'
  };

  const metricLabelStyle = {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  };

  const chartsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const chartCardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const chartTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '20px'
  };

  const barStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    gap: '10px'
  };

  const barLabelStyle = {
    minWidth: '120px',
    fontSize: '14px',
    fontWeight: '500'
  };

  const barContainerStyle = {
    flex: 1,
    height: '30px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  };

  const barFillStyle = (percentage) => ({
    height: '100%',
    width: `${percentage}%`,
    background: percentage >= 85 ? '#10B981' : percentage >= 70 ? '#3B82F6' : percentage >= 50 ? '#F59E0B' : '#EF4444',
    transition: 'width 0.3s ease'
  });

  const barValueStyle = {
    minWidth: '50px',
    textAlign: 'right',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1E40AF'
  };

  const recentAuditsStyle = {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const theadStyle = {
    background: '#1E40AF',
    color: 'white'
  };

  const thStyle = {
    padding: '15px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600'
  };

  const tdStyle = {
    padding: '15px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px'
  };

  const statusBadgeStyle = (status) => ({
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: status === 'Excellent' ? '#D1FAE5' : status === 'Good' ? '#DBEAFE' : status === 'Needs Improvement' ? '#FEF3C7' : '#FEE2E2',
    color: status === 'Excellent' ? '#065F46' : status === 'Good' ? '#1E40AF' : status === 'Needs Improvement' ? '#92400E' : '#991B1B'
  });

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  };

  const errorStyle = {
    background: '#FEE2E2',
    color: '#991B1B',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px'
  };

  if (loading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading audits...</div></div>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>6S Audit Dashboard</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>Real-time audit performance and analytics</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* FILTERS */}
      <div style={filterContainerStyle}>
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>Location</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={selectStyle}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>Audit Type</label>
          <select
            value={selectedAuditType}
            onChange={(e) => setSelectedAuditType(e.target.value)}
            style={selectStyle}
          >
            {auditTypes.map(type => (
              <option key={type} value={type}>
                {type === 'All' ? 'All Types' : auditTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={selectStyle}
          >
            {monthOptions.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KEY METRICS */}
      <div style={metricsGridStyle}>
        <div style={metricCardStyle}>
          <div style={metricValueStyle}>{metrics.avgScore}%</div>
          <div style={metricLabelStyle}>Average Score</div>
        </div>

        <div style={metricCardStyle}>
          <div style={metricValueStyle}>{metrics.totalAudits}</div>
          <div style={metricLabelStyle}>Total Audits</div>
        </div>

        <div style={metricCardStyle}>
          <div style={{ ...metricValueStyle, color: '#10B981' }}>
            {metrics.excellentCount}
          </div>
          <div style={metricLabelStyle}>Excellent</div>
        </div>

        <div style={metricCardStyle}>
          <div style={{ ...metricValueStyle, color: '#3B82F6' }}>
            {metrics.goodCount}
          </div>
          <div style={metricLabelStyle}>Good</div>
        </div>

        <div style={metricCardStyle}>
          <div style={{ ...metricValueStyle, color: '#F59E0B' }}>
            {metrics.needsImprovementCount}
          </div>
          <div style={metricLabelStyle}>Needs Improvement</div>
        </div>

        <div style={metricCardStyle}>
          <div style={{ ...metricValueStyle, color: '#EF4444' }}>
            {metrics.criticalCount}
          </div>
          <div style={metricLabelStyle}>Critical</div>
        </div>
      </div>

      {/* 6S RADAR CHART - Location Specific */}
      {selectedLocation !== 'All' && locationSixSScores && (
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>📊 6S Performance Radar - {selectedLocation}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={locationSixSScores}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="name" stroke="#666" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#999" />
              <Radar
                name="Score %"
                dataKey="value"
                stroke="#1E40AF"
                fill="#1E40AF"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '10px'
                }}
                formatter={(value) => `${value}%`}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 6S CATEGORY BREAKDOWN */}
      <div style={chartCardStyle}>
        <h3 style={chartTitleStyle}>📈 6S Category Performance</h3>
        {sixSBreakdown.length > 0 ? (
          sixSBreakdown.map(category => (
            <div key={category.code} style={barStyle}>
              <div style={barLabelStyle}>{category.code} - {category.name}</div>
              <div style={barContainerStyle}>
                <div style={barFillStyle(category.avgScore)}></div>
              </div>
              <div style={barValueStyle}>{category.avgScore}%</div>
            </div>
          ))
        ) : (
          <p style={{ color: '#999' }}>No data available</p>
        )}
      </div>

      {/* CHARTS */}
      <div style={chartsGridStyle}>
        {/* Average by Location */}
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>📍 Average Score by Location</h3>
          {Object.keys(avgByLocation).length > 0 ? (
            Object.entries(avgByLocation).map(([location, avg]) => (
              <div key={location} style={barStyle}>
                <div style={barLabelStyle}>{location}</div>
                <div style={barContainerStyle}>
                  <div style={barFillStyle(avg)}></div>
                </div>
                <div style={barValueStyle}>{avg}%</div>
              </div>
            ))
          ) : (
            <p style={{ color: '#999' }}>No data available</p>
          )}
        </div>
      </div>

      {/* RECENT AUDITS */}
      <div style={recentAuditsStyle}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={chartTitleStyle}>Recent Audits (Last 10)</h3>
        </div>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Audit Type</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Auditor</th>
              <th style={thStyle}>Score</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.slice(0, 10).map((audit, index) => (
              <tr key={audit.id || index}>
                <td style={tdStyle}>{audit.date}</td>
                <td style={tdStyle}>{auditTypeLabels[audit.auditType]}</td>
                <td style={tdStyle}>{audit.location}</td>
                <td style={tdStyle}>{audit.auditor}</td>
                <td style={tdStyle}>
                  <strong>{audit.percentage}%</strong> ({audit.score}/{audit.maxScore})
                </td>
                <td style={tdStyle}>
                  <span style={statusBadgeStyle(audit.status)}>{audit.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAudits.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No audits found for the selected filters
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
