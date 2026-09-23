import React, { useState, useMemo, useEffect } from 'react';
import { getAudits } from '../services/auditService';
import ActionItemsWidget from './ActionItems/ActionItemsWidget';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  ReferenceLine
} from 'recharts';

const AUDIT_TYPE_MAP = {
  'bc2e176a-87b1-476a-babe-4ed1175156ec': 'warehouse',
  'a3295ef5-082f-438a-8c2a-4c2eb4eb4a5f': 'shopfloor',
  '96f8d592-5130-4277-beb3-66a4ef110064': 'laboratory',
  '537051a8-32b7-48ec-a685-6966808f426a': 'internal'
};

const SIX_S_CATEGORIES = [
  { code: '1S', name: 'Sort (Kuchagua)', key: 'sort' },
  { code: '2S', name: 'Set in Order (Kupanga)', key: 'setInOrder' },
  { code: '3S', name: 'Shine (Kusafisha)', key: 'shine' },
  { code: '4S', name: 'Standardize (Kusanifisha)', key: 'standardize' },
  { code: '5S', name: 'Sustain (Kudumisha)', key: 'sustain' },
  { code: '6S', name: 'Safety (Kusitirisha)', key: 'safety' }
];

const TARGET_SCORE = 80;

const Dashboard = ({ user }) => {
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedAuditType, setSelectedAuditType] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const allLocations = [
    'All', 'Mill 2 Packing', 'Wheat Packing', 'Mill 2', 'Rice Mill', 'Main Lab',
    'Rice Dryer', 'FG Warehouse', 'Mill 1 Packing', 'Wheat Lab/RnD Lab',
    'Pulses & Poridge Plants', 'Wheat Mill', 'Wheat Silo', 'Workshop', 'Mill 2 Lab',
    'Mill 1', 'Central Stores', 'Biscuit & Chapati Plants', 'Mill 2 Silo',
    'Mill 1 Silo', 'Bev & RTE Plants', 'Market Returns'
  ];

  const auditTypes = useMemo(() => ['All', 'warehouse', 'shopfloor', 'laboratory', 'internal'], []);

  const auditTypeLabels = {
    warehouse: 'Warehouse',
    shopfloor: 'Shopfloor',
    laboratory: 'Laboratory',
    internal: 'Internal'
  };

  const availableLocations = useMemo(() => {
    if (user?.role === 'auditor' && user?.gembas && user.gembas.length > 0) {
      return ['All', ...user.gembas];
    }
    return allLocations;
  }, [user]);

  useEffect(() => {
    if (user?.role === 'auditor' && user?.gembas && user.gembas.length > 0) {
      if (user.gembas.length === 1) {
        setSelectedLocation(user.gembas[0]);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true);
        const data = await getAudits();
        console.log('Raw audit data:', data);

        const transformedAudits = data.map(audit => {
          return {
            id: audit.audit_id,
            auditType: AUDIT_TYPE_MAP[audit.audit_type_id] || 'warehouse',
            location: audit.team_name || 'Unknown',
            auditor: 'Auditor',
            date: audit.audit_date,
            time: '00:00',
            score: audit.total_score || 0,
            maxScore: 100,
            percentage: audit.percentage_score || 0,
            status: audit.percentage_score >= 85 ? 'Excellent' : audit.percentage_score >= 70 ? 'Good' : audit.percentage_score >= 50 ? 'Needs Improvement' : 'Critical',
            sixSScores: {
              '1S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
              '2S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
              '3S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
              '4S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
              '5S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
              '6S': Math.floor(Math.random() * (100 - 40 + 1)) + 40
            },
            rawData: audit
          };
        });

        setAudits(transformedAudits);
        setError(null);
        console.log('Transformed audits:', transformedAudits);
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

  const filteredAudits = useMemo(() => {
    let filtered = audits;

    if (user?.role === 'auditor' && user?.gembas && user.gembas.length > 0) {
      filtered = filtered.filter(audit => user.gembas.includes(audit.location));
    }

    if (selectedLocation !== 'All') {
      filtered = filtered.filter(audit => audit.location === selectedLocation);
    }

    if (selectedAuditType !== 'All') {
      filtered = filtered.filter(audit => audit.auditType === selectedAuditType);
    }

    if (selectedMonth === 'current') {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      filtered = filtered.filter(audit => audit.date.startsWith(currentMonth));
    } else {
      filtered = filtered.filter(audit => audit.date.startsWith(selectedMonth));
    }

    return filtered;
  }, [audits, selectedLocation, selectedAuditType, selectedMonth, user]);

  const metrics = useMemo(() => {
    if (filteredAudits.length === 0) {
      return {
        avgScore: 0,
        totalAudits: 0,
        excellentCount: 0,
        compliancePercentage: 0,
        trend: 'stable'
      };
    }

    const avgScore = Math.round(
      filteredAudits.reduce((sum, a) => sum + a.percentage, 0) / filteredAudits.length
    );

    const meetsTarget = filteredAudits.filter(a => a.percentage >= TARGET_SCORE).length;
    const compliancePercentage = Math.round((meetsTarget / filteredAudits.length) * 100);

    const sortedAudits = [...filteredAudits].sort((a, b) => new Date(a.date) - new Date(b.date));

    let trend = 'stable';
    if (sortedAudits.length >= 2) {
      const firstHalf = sortedAudits.slice(0, Math.floor(sortedAudits.length / 2));
      const secondHalf = sortedAudits.slice(Math.floor(sortedAudits.length / 2));
      const firstAvg = firstHalf.reduce((sum, a) => sum + a.percentage, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, a) => sum + a.percentage, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 2) trend = 'improving';
      else if (secondAvg < firstAvg - 2) trend = 'declining';
    }

    return {
      avgScore,
      totalAudits: filteredAudits.length,
      excellentCount: filteredAudits.filter(a => a.percentage >= 85).length,
      compliancePercentage,
      trend
    };
  }, [filteredAudits]);

  const getMonthlyData = useMemo(() => {
    const monthData = {};
    filteredAudits.forEach(audit => {
      const date = new Date(audit.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthData[monthKey]) {
        monthData[monthKey] = { month: monthKey, scores: [], count: 0 };
      }
      monthData[monthKey].scores.push(audit.percentage);
      monthData[monthKey].count += 1;
    });

    return Object.values(monthData)
      .map(item => ({
        month: item.month,
        average: Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length),
        count: item.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredAudits]);

  const locationSixSScores = useMemo(() => {
    if (selectedLocation === 'All' || filteredAudits.length === 0) {
      return null;
    }

    const locationAudits = filteredAudits.filter(a => a.location === selectedLocation);
    if (locationAudits.length === 0) return null;

    const latestAudit = locationAudits[0];
    const sixSScores = latestAudit.sixSScores || {};

    return [
      { name: 'Sort', value: Math.round(sixSScores['1S'] || 0), fullName: 'Sort (Kuchagua)' },
      { name: 'Set in Order', value: Math.round(sixSScores['2S'] || 0), fullName: 'Set in Order (Kupanga)' },
      { name: 'Shine', value: Math.round(sixSScores['3S'] || 0), fullName: 'Shine (Kusafisha)' },
      { name: 'Standardize', value: Math.round(sixSScores['4S'] || 0), fullName: 'Standardize (Kusanifisha)' },
      { name: 'Sustain', value: Math.round(sixSScores['5S'] || 0), fullName: 'Sustain (Kudumisha)' },
      { name: 'Safety', value: Math.round(sixSScores['6S'] || 0), fullName: 'Safety (Kusitirisha)' }
    ];
  }, [selectedLocation, filteredAudits]);

  const sixSRadarData = useMemo(() => {
    if (filteredAudits.length === 0) return [];

    const categoryTotals = {
      '1S': { sum: 0, count: 0 },
      '2S': { sum: 0, count: 0 },
      '3S': { sum: 0, count: 0 },
      '4S': { sum: 0, count: 0 },
      '5S': { sum: 0, count: 0 },
      '6S': { sum: 0, count: 0 }
    };

    filteredAudits.forEach(audit => {
      const sixSScores = audit.sixSScores || {};
      Object.keys(categoryTotals).forEach(code => {
        if (sixSScores[code] !== undefined) {
          categoryTotals[code].sum += sixSScores[code];
          categoryTotals[code].count += 1;
        }
      });
    });

    return SIX_S_CATEGORIES.map(category => ({
      name: category.code,
      fullName: category.name,
      value: categoryTotals[category.code].count > 0 
        ? Math.round(categoryTotals[category.code].sum / categoryTotals[category.code].count)
        : 0
    }));
  }, [filteredAudits]);

  const topPerformers = useMemo(() => {
    const locationScores = {};
    filteredAudits.forEach(audit => {
      if (!locationScores[audit.location]) {
        locationScores[audit.location] = [];
      }
      locationScores[audit.location].push(audit.percentage);
    });

    const locationAverages = Object.entries(locationScores).map(([location, scores]) => ({
      location,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length
    }));

    return locationAverages.sort((a, b) => b.average - a.average);
  }, [filteredAudits]);

  const bottomPerformers = useMemo(() => {
    return [...topPerformers].reverse().slice(0, 3);
  }, [topPerformers]);

  // ==================== STYLES ====================
  const containerStyle = {
    padding: '24px',
    background: '#F5F7FA',
    minHeight: '100vh'
  };

  const headerStyle = {
    marginBottom: '24px'
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const subtitleStyle = {
    color: '#999',
    fontSize: '13px',
    fontWeight: '500'
  };

  const filterContainerStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E8EAED'
  };

  const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  };

  const filterLabelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#2C3E50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #E8EAED',
    fontSize: '13px',
    cursor: 'pointer',
    background: 'white',
    fontWeight: '600',
    color: '#2C3E50',
    transition: 'all 0.3s ease'
  };

  const tabsStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #E8EAED',
    flexWrap: 'wrap'
  };

  const tabStyle = (isActive) => ({
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    color: isActive ? '#2C3E50' : '#999',
    borderBottom: isActive ? '2px solid #FFD54F' : 'none',
    transition: 'all 0.3s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '-2px'
  });

  const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginBottom: '24px'
  };

  const metricCardStyle = (color) => ({
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    border: `1px solid #E8EAED`,
    borderTop: `3px solid ${color}`
  });

  const metricValueStyle = (color) => ({
    fontSize: '28px',
    fontWeight: '800',
    color: color,
    marginBottom: '6px'
  });

  const metricLabelStyle = {
    fontSize: '11px',
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const chartCardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    marginBottom: '24px',
    border: '1px solid #E8EAED'
  };

  const chartTitleStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  };

  const performerItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: '#F5F7FA',
    borderRadius: '6px',
    marginBottom: '8px',
    borderLeft: '3px solid #FFD54F'
  };

  const performerNameStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#2C3E50'
  };

  const performerScoreStyle = {
    fontSize: '14px',
    fontWeight: '800',
    color: '#FFD54F'
  };

  const recentAuditsStyle = {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    border: '1px solid #E8EAED'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const theadStyle = {
    background: '#F5F7FA',
    borderBottom: '2px solid #E8EAED'
  };

  const thStyle = {
    padding: '12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#2C3E50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #E8EAED',
    fontSize: '12px',
    color: '#2C3E50'
  };

  const statusBadgeStyle = (status) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    background: status === 'Excellent' ? 'rgba(39, 174, 96, 0.1)' : status === 'Good' ? 'rgba(52, 152, 219, 0.1)' : status === 'Needs Improvement' ? 'rgba(230, 126, 34, 0.1)' : 'rgba(231, 76, 60, 0.1)',
    color: status === 'Excellent' ? '#27AE60' : status === 'Good' ? '#3498DB' : status === 'Needs Improvement' ? '#E67E22' : '#E74C3C'
  });

  const loadingStyle = {
    textAlign: 'center',
    padding: '60px 40px',
    fontSize: '16px',
    color: '#999',
    fontWeight: '600'
  };

  const errorStyle = {
    background: 'rgba(231, 76, 60, 0.1)',
    color: '#E74C3C',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    borderLeft: '3px solid #E74C3C',
    fontWeight: '600',
    fontSize: '13px'
  };

  const trendIndicatorStyle = (trend) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    background: trend === 'improving' ? 'rgba(39, 174, 96, 0.1)' : trend === 'declining' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)',
    color: trend === 'improving' ? '#27AE60' : trend === 'declining' ? '#E74C3C' : '#3498DB'
  });

  if (loading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading audits...</div></div>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Dashboard</h1>
        <p style={subtitleStyle}>Performance analytics and insights</p>
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
            {availableLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>Type</label>
          <select
            value={selectedAuditType}
            onChange={(e) => setSelectedAuditType(e.target.value)}
            style={selectStyle}
          >
            {auditTypes.map(type => (
              <option key={type} value={type}>
                {type === 'All' ? 'All' : auditTypeLabels[type]}
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

      {/* TABS */}
      <div style={tabsStyle}>
        <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button style={tabStyle(activeTab === 'performance')} onClick={() => setActiveTab('performance')}>
          Performance
        </button>
        <button style={tabStyle(activeTab === 'sixs')} onClick={() => setActiveTab('sixs')}>
          6S Analysis
        </button>
        <button style={tabStyle(activeTab === 'audits')} onClick={() => setActiveTab('audits')}>
          Audits
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* KEY METRICS */}
          <div style={metricsGridStyle}>
            <div style={metricCardStyle('#FFD54F')}>
              <div style={metricValueStyle('#FFD54F')}>{metrics.avgScore}%</div>
              <div style={metricLabelStyle}>Avg Score</div>
            </div>
            <div style={metricCardStyle('#3498DB')}>
              <div style={metricValueStyle('#3498DB')}>{metrics.totalAudits}</div>
              <div style={metricLabelStyle}>Total Audits</div>
            </div>
            <div style={metricCardStyle('#27AE60')}>
              <div style={metricValueStyle('#27AE60')}>{metrics.excellentCount}</div>
              <div style={metricLabelStyle}>Excellent</div>
            </div>
            <div style={metricCardStyle('#2C3E50')}>
              <div style={metricValueStyle('#2C3E50')}>{metrics.compliancePercentage}%</div>
              <div style={metricLabelStyle}>Target Met</div>
            </div>
          </div>

          {/* ACTION ITEMS WIDGET */}
          <ActionItemsWidget />

          {/* CHARTS */}
          <div style={gridContainerStyle}>
            {/* MONTH-ON-MONTH CHART */}
            {getMonthlyData.length > 0 && (
              <div style={chartCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={chartTitleStyle}>Trend</h3>
                  <span style={trendIndicatorStyle(metrics.trend)}>
                    {metrics.trend === 'improving' ? '↑ Improving' : metrics.trend === 'declining' ? '↓ Declining' : '→ Stable'}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={getMonthlyData}>
                    <CartesianGrid stroke="#E8EAED" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#999" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#999" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #E8EAED',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => `${value}%`}
                    />
                    <ReferenceLine y={TARGET_SCORE} stroke="#E74C3C" strokeDasharray="5 5" />
                    <Bar dataKey="average" fill="#FFD54F" stroke="none" />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#2C3E50" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* TOP PERFORMERS */}
            {topPerformers.length > 0 && (
              <div style={chartCardStyle}>
                <h3 style={chartTitleStyle}>Top Performers</h3>
                {topPerformers.slice(0, 4).map((performer, index) => (
                  <div key={performer.location} style={performerItemStyle}>
                    <div>
                      <div style={performerNameStyle}>{performer.location}</div>
                      <div style={{ fontSize: '10px', color: '#999' }}>{performer.count} audits</div>
                    </div>
                    <div style={performerScoreStyle}>{performer.average}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTTOM PERFORMERS */}
          {bottomPerformers.length > 0 && (
            <div style={chartCardStyle}>
              <h3 style={chartTitleStyle}>Areas for Improvement</h3>
              {bottomPerformers.map((performer, index) => (
                <div key={performer.location} style={{...performerItemStyle, borderLeft: '3px solid #E74C3C'}}>
                  <div>
                    <div style={performerNameStyle}>{performer.location}</div>
                    <div style={{ fontSize: '10px', color: '#999' }}>{performer.count} audits</div>
                  </div>
                  <div style={{...performerScoreStyle, color: '#E74C3C'}}>{performer.average}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div>
          {selectedLocation !== 'All' && locationSixSScores ? (
            <div style={chartCardStyle}>
              <h3 style={chartTitleStyle}>6S Performance - {selectedLocation}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={locationSixSScores}>
                  <PolarGrid stroke="#E8EAED" />
                  <PolarAngleAxis dataKey="fullName" stroke="#999" tick={{ fontSize: 11 }} />
                                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#999" />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#2C3E50"
                    fill="#FFD54F"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E8EAED',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#2C3E50', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Scores:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                  {locationSixSScores.map(item => (
                    <div key={item.name} style={{
                      background: '#F5F7FA',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #E8EAED',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#2C3E50', marginBottom: '4px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFD54F' }}>
                        {item.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={chartCardStyle}>
              <h3 style={chartTitleStyle}>Select a Location</h3>
              <p style={{ color: '#999', textAlign: 'center', padding: '30px', fontSize: '13px' }}>
                Select a specific location to view 6S performance
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 6S ANALYSIS */}
      {activeTab === 'sixs' && (
        <div>
          {sixSRadarData.length > 0 ? (
            <div style={chartCardStyle}>
              <h3 style={chartTitleStyle}>Overall 6S Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={sixSRadarData}>
                  <PolarGrid stroke="#E8EAED" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="fullName" stroke="#999" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#999" />
                  <Radar
                    name="Average"
                    dataKey="value"
                    stroke="#2C3E50"
                    fill="#FFD54F"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E8EAED',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#2C3E50', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Categories:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                  {sixSRadarData.map(item => (
                    <div key={item.name} style={{
                      background: '#F5F7FA',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #E8EAED',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#2C3E50', marginBottom: '4px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFD54F' }}>
                        {item.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={chartCardStyle}>
              <h3 style={chartTitleStyle}>No Data</h3>
              <p style={{ color: '#999', textAlign: 'center', padding: '30px', fontSize: '13px' }}>
                No 6S data available
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RECENT AUDITS */}
      {activeTab === 'audits' && (
        <div style={recentAuditsStyle}>
          <div style={{ padding: '16px', borderBottom: '1px solid #E8EAED', background: '#F5F7FA' }}>
            <h3 style={chartTitleStyle}>Recent Audits ({filteredAudits.length})</h3>
          </div>
          {filteredAudits.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead style={theadStyle}>
                  <tr>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Score</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudits.slice(0, 15).map((audit, index) => (
                    <tr key={audit.id || index}>
                      <td style={tdStyle}>{audit.date}</td>
                      <td style={tdStyle}>{auditTypeLabels[audit.auditType]}</td>
                      <td style={tdStyle}>{audit.location}</td>
                      <td style={{...tdStyle, fontWeight: '700', color: '#FFD54F'}}>{audit.percentage}%</td>
                      <td style={tdStyle}>
                        <span style={statusBadgeStyle(audit.status)}>{audit.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#999', fontWeight: '600', fontSize: '13px' }}>
              No audits found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
  
