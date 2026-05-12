import React, { useState, useEffect } from 'react';
import { getAudits } from '../services/auditService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AUDIT_TYPE_MAP = {
  '4c67665b-dd1f-43fa-87a5-a7d9477cf303': 'warehouse',
  'bf0e6a59-a9b3-47f6-b6d5-18f0df806d45': 'shopfloor',
  'e1d3647c-aa77-420b-b072-d131f7b1af6a': 'laboratory',
  '5846ef78-480d-499f-92b1-ffdcc158fe93': 'internal'
};

const SIX_S_CATEGORIES = [
  { code: '1S', name: 'Sort (Kuchagua)' },
  { code: '2S', name: 'Set in Order (Kupanga)' },
  { code: '3S', name: 'Shine (Kusafisha)' },
  { code: '4S', name: 'Standardize (Kusanifisha)' },
  { code: '5S', name: 'Sustain (Kudumisha)' },
  { code: '6S', name: 'Safety (Kusitirisha)' }
];


const Reports = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReport, setActiveReport] = useState('audit');
  const [selectedAuditId, setSelectedAuditId] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');


  const auditTypeLabels = {
    warehouse: 'Warehouse',
    shopfloor: 'Shopfloor',
    laboratory: 'Laboratory',
    internal: 'Internal'
  };

  // Fetch audits
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true);
        const data = await getAudits();
        console.log('Raw audits from API:', data.length);

        const transformedAudits = data.map(audit => {
          let auditorName = 'Auditor';
          let sixSScores = {};

          try {
            const notes = JSON.parse(audit.notes);
            auditorName = notes.auditors || 'Auditor';
            sixSScores = notes.sixSScores || {};
          } catch (e) {
            console.warn('Notes is not JSON:', audit.notes);
            auditorName = audit.notes || 'Auditor';
            sixSScores = {};
          }

          return {
            id: audit.id,
            auditType: AUDIT_TYPE_MAP[audit.audit_type_id] || 'warehouse',
            location: audit.team_name || 'Unknown',
            auditor: auditorName,
            date: audit.audit_date,
            score: audit.total_score || 0,
            maxScore: 100,
            percentage: audit.percentage_score || 0,
            status: audit.percentage_score >= 85 ? 'Excellent' : audit.percentage_score >= 70 ? 'Good' : audit.percentage_score >= 50 ? 'Needs Improvement' : 'Critical',
            sixSScores: sixSScores,
            rawData: audit
          };
        });

        console.log('Transformed audits:', transformedAudits.length);
        setAudits(transformedAudits);
        setError(null);
      } catch (err) {
        console.error('Error fetching audits:', err);
        setError('Failed to load audits: ' + err.message);
        setAudits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  const locations = [...new Set(audits.map(a => a.location))].sort();

  // Export to PDF with html2canvas
  const exportToPDF = async (elementId, filename) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        alert('Report element not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(filename);
      console.log('PDF saved:', filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF: ' + err.message);
    }
  };

  // ==================== REPORT 1: AUDIT REPORT ====================
  const AuditReportPreview = () => {
    const audit = audits.find(a => a.id === selectedAuditId);
    if (!audit) return <div style={{ padding: '20px', color: '#999' }}>Select an audit to preview</div>;

    const sixSData = SIX_S_CATEGORIES.map(category => ({
      name: category.code,
      value: audit.sixSScores[category.code] || 0
    }));

    return (
      <div id="audit-report-preview" style={reportPreviewStyle}>
        {/* Header */}
        <div style={reportHeaderStyle}>
          <div style={reportTitleStyle}>AUDIT REPORT</div>
          <div style={reportSubtitleStyle}>CAPWELL INDUSTRIES LIMITED</div>
          <div style={reportDateStyle}>{new Date().toLocaleDateString()}</div>
        </div>

        {/* Audit Info Cards */}
        <div style={reportCardsGridStyle}>
          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Location</div>
            <div style={cardValueStyle}>{audit.location}</div>
          </div>
          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Audit Type</div>
            <div style={cardValueStyle}>{auditTypeLabels[audit.auditType]}</div>
          </div>
          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Auditor</div>
            <div style={cardValueStyle}>{audit.auditor}</div>
          </div>
          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Date</div>
            <div style={cardValueStyle}>{audit.date}</div>
          </div>
        </div>

        {/* Score Summary */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Score Summary</div>
          <div style={scoreSummaryGridStyle}>
            <div style={scoreSummaryCardStyle}>
              <div style={scoreLargeStyle}>{audit.percentage}%</div>
              <div style={scoreSmallStyle}>Overall Score</div>
            </div>
            <div style={scoreSummaryCardStyle}>
              <div style={scoreLargeStyle}>{audit.score}/{audit.maxScore}</div>
              <div style={scoreSmallStyle}>Total Points</div>
            </div>
            <div style={{
              ...scoreSummaryCardStyle,
              background: audit.percentage >= 85 ? '#D1FAE5' : audit.percentage >= 70 ? '#DBEAFE' : audit.percentage >= 50 ? '#FEF3C7' : '#FEE2E2'
            }}>
              <div style={{
                ...scoreLargeStyle,
                color: audit.percentage >= 85 ? '#065F46' : audit.percentage >= 70 ? '#1E40AF' : audit.percentage >= 50 ? '#92400E' : '#991B1B'
              }}>
                {audit.status}
              </div>
              <div style={scoreSmallStyle}>Status</div>
            </div>
          </div>
        </div>

        {/* 6S Radar Chart */}
        {sixSData.length > 0 && (
          <div style={reportSectionStyle}>
            <div style={reportSectionTitleStyle}>6S Category Performance</div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={sixSData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="name" stroke="#666" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#999" />
                <Radar name="Score %" dataKey="value" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.6} />
                <Tooltip formatter={(value) => `${value}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 6S Scores Table */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>6S Scores Breakdown</div>
          <div style={tableStyle}>
            {SIX_S_CATEGORIES.map((category, idx) => (
              <div key={category.code} style={tableRowStyle}>
                <div style={tableColStyle}>{category.code}</div>
                <div style={tableColStyle}>{category.name}</div>
                <div style={{
                  ...tableColStyle,
                  fontWeight: '700',
                  color: audit.sixSScores[category.code] >= 70 ? '#10B981' : '#EF4444'
                }}>
                  {audit.sixSScores[category.code] || 0}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={reportFooterStyle}>
          <div>Generated on {new Date().toLocaleString()}</div>
          <div>CAPWELL INDUSTRIES LIMITED - Confidential</div>
        </div>
      </div>
    );
  };

  // ==================== REPORT 2: LOCATION PERFORMANCE ====================
  const LocationReportPreview = () => {
    const locationAudits = audits.filter(a => a.location === selectedLocation);
    if (locationAudits.length === 0) return <div style={{ padding: '20px', color: '#999' }}>Select a location to preview</div>;

    const avgScore = Math.round(
      locationAudits.reduce((sum, a) => sum + a.percentage, 0) / locationAudits.length
    );

    const trendData = [...locationAudits].sort((a, b) => new Date(a.date) - new Date(b.date)).map(a => ({
      date: a.date,
      score: a.percentage
    }));

    const sixSAverages = SIX_S_CATEGORIES.map(category => {
      const scores = locationAudits
        .map(a => a.sixSScores[category.code] || 0)
        .filter(s => s > 0);
      return {
        name: category.code,
        value: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      };
    });

    const statusCounts = {
      excellent: locationAudits.filter(a => a.percentage >= 85).length,
      good: locationAudits.filter(a => a.percentage >= 70 && a.percentage < 85).length,
      needsImprovement: locationAudits.filter(a => a.percentage >= 50 && a.percentage < 70).length,
      critical: locationAudits.filter(a => a.percentage < 50).length
    };

    const statusData = [
      { name: 'Excellent', value: statusCounts.excellent, fill: '#10B981' },
      { name: 'Good', value: statusCounts.good, fill: '#3B82F6' },
      { name: 'Needs Improvement', value: statusCounts.needsImprovement, fill: '#F59E0B' },
      { name: 'Critical', value: statusCounts.critical, fill: '#EF4444' }
    ].filter(item => item.value > 0);

    return (
      <div id="location-report-preview" style={reportPreviewStyle}>
        {/* Header */}
        <div style={reportHeaderStyle}>
          <div style={reportTitleStyle}>LOCATION PERFORMANCE REPORT</div>
          <div style={reportSubtitleStyle}>{selectedLocation}</div>
          <div style={reportDateStyle}>{new Date().toLocaleDateString()}</div>
        </div>

        {/* Summary Cards */}
        <div style={reportCardsGridStyle}>
          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Average Score</div>
            <div style={cardValueStyle}>{avgScore}%</div>
          </div>
          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Total Audits</div>
            <div style={cardValueStyle}>{locationAudits.length}</div>
          </div>
          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Excellent</div>
            <div style={{ ...cardValueStyle, color: '#10B981' }}>{statusCounts.excellent}</div>
          </div>
          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Good</div>
            <div style={{ ...cardValueStyle, color: '#3B82F6' }}>{statusCounts.good}</div>
          </div>
        </div>

        {/* Trend Chart */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Performance Trend</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#1E40AF" strokeWidth={2} dot={{ fill: '#1E40AF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 6S Performance Radar */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>6S Category Performance</div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={sixSAverages}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="name" stroke="#666" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#999" />
              <Radar name="Average %" dataKey="value" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.6} />
              <Tooltip formatter={(value) => `${value}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        {statusData.length > 0 && (
          <div style={reportSectionStyle}>
            <div style={reportSectionTitleStyle}>Audit Status Distribution</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Footer */}
        <div style={reportFooterStyle}>
          <div>Generated on {new Date().toLocaleString()}</div>
          <div>CAPWELL INDUSTRIES LIMITED - Confidential</div>
        </div>
      </div>
    );
  };

  // ==================== REPORT 3: 6S CATEGORY ANALYSIS ====================
  const CategoryReportPreview = () => {
    if (audits.length === 0) return <div style={{ padding: '20px', color: '#999' }}>No audits available</div>;

    const categoryData = SIX_S_CATEGORIES.map(category => {
      const scores = audits
        .map(a => a.sixSScores[category.code] || 0)
        .filter(s => s > 0);
      return {
        name: category.code,
        average: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        min: scores.length > 0 ? Math.min(...scores) : 0,
        max: scores.length > 0 ? Math.max(...scores) : 0
      };
    });

    const sortedByAverage = [...categoryData].sort((a, b) => b.average - a.average);

    return (
      <div id="category-report-preview" style={reportPreviewStyle}>
        {/* Header */}
        <div style={reportHeaderStyle}>
          <div style={reportTitleStyle}>6S CATEGORY ANALYSIS REPORT</div>
          <div style={reportSubtitleStyle}>Performance Across All Categories</div>
          <div style={reportDateStyle}>{new Date().toLocaleDateString()}</div>
        </div>

        {/* Category Performance Chart */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Average Performance by Category</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="average" fill="#1E40AF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rankings */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Category Rankings</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Best Performing */}
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#10B981', marginBottom: '15px' }}>
                🏆 Best Performing
              </div>
              {sortedByAverage.slice(0, 3).map((cat, idx) => (
                <div key={cat.name} style={rankingItemStyle}>
                  <div style={rankingNumberStyle}>{idx + 1}</div>
                  <div>
                    <div style={rankingNameStyle}>{cat.name}</div>
                    <div style={rankingScoreStyle}>{cat.average}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Needs Improvement */}
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#EF4444', marginBottom: '15px' }}>
                ⚠️ Needs Improvement
              </div>
              {sortedByAverage.slice(-3).reverse().map((cat, idx) => (
                <div key={cat.name} style={rankingItemStyle}>
                  <div style={rankingNumberStyle}>{idx + 1}</div>
                  <div>
                    <div style={rankingNameStyle}>{cat.name}</div>
                    <div style={rankingScoreStyle}>{cat.average}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Detailed Statistics</div>
          <div style={tableStyle}>
            <div style={{ ...tableRowStyle, background: '#1E40AF', color: 'white' }}>
              <div style={tableColStyle}>Category</div>
              <div style={tableColStyle}>Average</div>
              <div style={tableColStyle}>Min</div>
              <div style={tableColStyle}>Max</div>
            </div>
            {categoryData.map(cat => (
              <div key={cat.name} style={tableRowStyle}>
                <div style={tableColStyle}>{cat.name}</div>
                <div style={tableColStyle}>{cat.average}%</div>
                <div style={tableColStyle}>{cat.min}%</div>
                <div style={tableColStyle}>{cat.max}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={reportFooterStyle}>
          <div>Generated on {new Date().toLocaleString()}</div>
          <div>CAPWELL INDUSTRIES LIMITED - Confidential</div>
        </div>
      </div>
    );
  };

  // ==================== REPORT 4: TREND ANALYSIS ====================
  const TrendReportPreview = () => {
    if (audits.length === 0) return <div style={{ padding: '20px', color: '#999' }}>No audits available</div>;

    const sortedAudits = [...audits].sort((a, b) => new Date(a.date) - new Date(b.date));
    const trendData = sortedAudits.map(a => ({
      date: a.date,
      score: a.percentage,
      location: a.location
    }));

    const locationTrends = locations.map(location => {
      const locAudits = sortedAudits.filter(a => a.location === location);
      const firstAvg = locAudits[0]?.percentage || 0;
      const lastAvg = locAudits[locAudits.length - 1]?.percentage || 0;
      const trend = lastAvg - firstAvg;
      return {
        location,
        first: firstAvg,
        last: lastAvg,
        trend,
        direction: trend > 0 ? '↑' : trend < 0 ? '↓' : '→'
      };
    });

    return (
      <div id="trend-report-preview" style={reportPreviewStyle}>
        {/* Header */}
        <div style={reportHeaderStyle}>
          <div style={reportTitleStyle}>TREND ANALYSIS REPORT</div>
          <div style={reportSubtitleStyle}>Performance Over Time</div>
          <div style={reportDateStyle}>{new Date().toLocaleDateString()}</div>
        </div>

        {/* Overall Trend */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Overall Performance Trend</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#1E40AF" strokeWidth={2} name="Score %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Location Trends */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Location Performance Trends</div>
          <div style={tableStyle}>
            <div style={{ ...tableRowStyle, background: '#1E40AF', color: 'white' }}>
              <div style={tableColStyle}>Location</div>
              <div style={tableColStyle}>First</div>
              <div style={tableColStyle}>Latest</div>
              <div style={tableColStyle}>Change</div>
              <div style={tableColStyle}>Trend</div>
            </div>
            {locationTrends.map(loc => (
              <div key={loc.location} style={tableRowStyle}>
                <div style={tableColStyle}>{loc.location}</div>
                <div style={tableColStyle}>{loc.first}%</div>
                <div style={tableColStyle}>{loc.last}%</div>
                <div style={{
                  ...tableColStyle,
                  color: loc.trend > 0 ? '#10B981' : loc.trend < 0 ? '#EF4444' : '#666',
                  fontWeight: '700'
                }}>
                  {loc.trend > 0 ? '+' : ''}{loc.trend}%
                </div>
                <div style={tableColStyle}>{loc.direction}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={reportFooterStyle}>
          <div>Generated on {new Date().toLocaleString()}</div>
          <div>CAPWELL INDUSTRIES LIMITED - Confidential</div>
        </div>
      </div>
    );
  };

  // Styles
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

  const tabsStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #e5e7eb',
    flexWrap: 'wrap'
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: isActive ? '#1E40AF' : '#666',
    borderBottom: isActive ? '3px solid #1E40AF' : 'none',
    transition: 'all 0.3s'
  });

  const cardStyle = {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px'
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e5e7eb'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
    display: 'block'
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    flexWrap: 'wrap'
  };

  const buttonStyle = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: '#1E40AF',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#6b7280',
    color: 'white'
  };

  // Report Preview Styles
  const reportPreviewStyle = {
    background: 'white',
    padding: '40px',
    borderRadius: '8px',
    marginTop: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  const reportHeaderStyle = {
    textAlign: 'center',
    marginBottom: '40px',
    paddingBottom: '30px',
    borderBottom: '3px solid #1E40AF'
  };

  const reportTitleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '10px'
  };

  const reportSubtitleStyle = {
    fontSize: '18px',
    color: '#666',
    marginBottom: '10px'
  };

  const reportDateStyle = {
    fontSize: '14px',
    color: '#999'
  };

  const reportCardsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  };

  const reportCardStyle = {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  };

  const cardLabelStyle = {
    fontSize: '12px',
    color: '#999',
    fontWeight: '600',
    marginBottom: '8px'
  };

  const cardValueStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1E40AF'
  };

  const reportSectionStyle = {
    marginBottom: '40px'
  };

    const reportSectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e5e7eb'
  };

  const scoreSummaryGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px'
  };

  const scoreSummaryCardStyle = {
    background: '#f0f9ff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '2px solid #bfdbfe'
  };

  const scoreLargeStyle = {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '8px'
  };

  const scoreSmallStyle = {
    fontSize: '12px',
    color: '#666',
    fontWeight: '600'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px'
  };

  const tableRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '15px',
    padding: '15px',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center'
  };

  const tableColStyle = {
    fontSize: '14px',
    color: '#333'
  };

  const rankingItemStyle = {
    display: 'flex',
    gap: '15px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '6px',
    marginBottom: '10px',
    alignItems: 'center'
  };

  const rankingNumberStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1E40AF',
    minWidth: '30px',
    textAlign: 'center'
  };

  const rankingNameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  };

  const rankingScoreStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1E40AF'
  };

  const reportFooterStyle = {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '2px solid #e5e7eb',
    textAlign: 'center',
    fontSize: '12px',
    color: '#999'
  };

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

  const infoBoxStyle = {
    background: '#DBEAFE',
    color: '#1E40AF',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  };

  if (loading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading reports...</div></div>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Reports</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>Generate and export professional audit reports</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* INFO BOX */}
      {audits.length > 0 && (
        <div style={infoBoxStyle}>
          ℹ️ Total Audits Available: {audits.length} | Locations: {locations.length}
        </div>
      )}

      {/* TABS */}
      <div style={tabsStyle}>
        <button
          style={tabStyle(activeReport === 'audit')}
          onClick={() => setActiveReport('audit')}
        >
          📋 Audit Report
        </button>
        <button
          style={tabStyle(activeReport === 'location')}
          onClick={() => setActiveReport('location')}
        >
          📍 Location Performance
        </button>
        <button
          style={tabStyle(activeReport === 'category')}
          onClick={() => setActiveReport('category')}
        >
          📊 6S Category Analysis
        </button>
        <button
          style={tabStyle(activeReport === 'trend')}
          onClick={() => setActiveReport('trend')}
        >
          📈 Trend Analysis
        </button>
      </div>

      {/* REPORT 1: AUDIT REPORT */}
      {activeReport === 'audit' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>📋 Audit Report</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Generate a detailed executive report for a specific audit with visual charts and metrics.
          </p>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Select Audit</label>
            <select
              value={selectedAuditId}
              onChange={(e) => setSelectedAuditId(e.target.value)}
              style={selectStyle}
            >
              <option value="">-- Choose an audit --</option>
              {audits.map(audit => (
                <option key={audit.id} value={audit.id}>
                  {audit.date} - {audit.location} ({auditTypeLabels[audit.auditType]}) - {audit.percentage}%
                </option>
              ))}
            </select>
          </div>

          {selectedAuditId && (
            <div style={buttonGroupStyle}>
              <button
                onClick={() => exportToPDF('audit-report-preview', `Audit_Report_${audits.find(a => a.id === selectedAuditId)?.location}_${audits.find(a => a.id === selectedAuditId)?.date}.pdf`)}
                style={primaryButtonStyle}
                onMouseEnter={(e) => e.target.style.background = '#1e3a8a'}
                onMouseLeave={(e) => e.target.style.background = '#1E40AF'}
              >
                📥 Download as PDF
              </button>
              <button
                onClick={() => exportAuditReportExcel()}
                style={secondaryButtonStyle}
                onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                onMouseLeave={(e) => e.target.style.background = '#6b7280'}
              >
                📊 Export as Excel
              </button>
            </div>
          )}

          {/* Preview */}
          <AuditReportPreview />
        </div>
      )}

      {/* REPORT 2: LOCATION PERFORMANCE */}
      {activeReport === 'location' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>📍 Location Performance Report</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Generate a comprehensive performance report with trends, charts, and 6S breakdown.
          </p>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Select Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={selectStyle}
            >
              <option value="">-- Choose a location --</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {selectedLocation && (
            <div style={buttonGroupStyle}>
              <button
                onClick={() => exportToPDF('location-report-preview', `Location_Report_${selectedLocation}_${new Date().toISOString().split('T')[0]}.pdf`)}
                style={primaryButtonStyle}
                onMouseEnter={(e) => e.target.style.background = '#1e3a8a'}
                onMouseLeave={(e) => e.target.style.background = '#1E40AF'}
              >
                📥 Download as PDF
              </button>
              <button
                onClick={() => exportLocationReportExcel()}
                style={secondaryButtonStyle}
                onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                onMouseLeave={(e) => e.target.style.background = '#6b7280'}
              >
                📊 Export as Excel
              </button>
            </div>
          )}

          {/* Preview */}
          <LocationReportPreview />
        </div>
      )}

      {/* REPORT 3: 6S CATEGORY ANALYSIS */}
      {activeReport === 'category' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>📊 6S Category Analysis Report</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Analyze performance across all 6S categories with rankings and detailed statistics.
          </p>

          <div style={buttonGroupStyle}>
            <button
              onClick={() => exportToPDF('category-report-preview', `6S_Category_Analysis_${new Date().toISOString().split('T')[0]}.pdf`)}
              style={primaryButtonStyle}
              onMouseEnter={(e) => e.target.style.background = '#1e3a8a'}
              onMouseLeave={(e) => e.target.style.background = '#1E40AF'}
            >
              📥 Download as PDF
            </button>
            <button
              onClick={() => exportCategoryAnalysisExcel()}
              style={secondaryButtonStyle}
              onMouseEnter={(e) => e.target.style.background = '#4b5563'}
              onMouseLeave={(e) => e.target.style.background = '#6b7280'}
            >
              📊 Export as Excel
            </button>
          </div>

          {/* Preview */}
          <CategoryReportPreview />
        </div>
      )}

      {/* REPORT 4: TREND ANALYSIS */}
      {activeReport === 'trend' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>📈 Trend Analysis Report</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Analyze performance trends over time with location-specific insights.
          </p>

          <div style={buttonGroupStyle}>
            <button
              onClick={() => exportToPDF('trend-report-preview', `Trend_Analysis_${new Date().toISOString().split('T')[0]}.pdf`)}
              style={primaryButtonStyle}
              onMouseEnter={(e) => e.target.style.background = '#1e3a8a'}
              onMouseLeave={(e) => e.target.style.background = '#1E40AF'}
            >
              📥 Download as PDF
            </button>
            <button
              onClick={() => exportTrendAnalysisExcel()}
              style={secondaryButtonStyle}
              onMouseEnter={(e) => e.target.style.background = '#4b5563'}
              onMouseLeave={(e) => e.target.style.background = '#6b7280'}
            >
              📊 Export as Excel
            </button>
          </div>

          {/* Preview */}
          <TrendReportPreview />
        </div>
      )}
    </div>
  );

  // Excel Export Functions
  function exportAuditReportExcel() {
    const audit = audits.find(a => a.id === selectedAuditId);
    if (!audit) return;

    const workbook = XLSX.utils.book_new();

    const auditInfoData = [
      { Field: 'Date', Value: audit.date },
      { Field: 'Audit Type', Value: auditTypeLabels[audit.auditType] },
      { Field: 'Location', Value: audit.location },
      { Field: 'Auditor', Value: audit.auditor },
      { Field: 'Status', Value: audit.status },
      { Field: 'Total Score', Value: `${audit.score}/${audit.maxScore}` },
      { Field: 'Percentage', Value: `${audit.percentage}%` }
    ];

    const sixSData = SIX_S_CATEGORIES.map(category => ({
      'Category Code': category.code,
      'Category Name': category.name,
      'Score %': audit.sixSScores[category.code] || 0
    }));

    const auditSheet = XLSX.utils.json_to_sheet(auditInfoData);
    const sixSSheet = XLSX.utils.json_to_sheet(sixSData);

    XLSX.utils.book_append_sheet(workbook, auditSheet, 'Audit Info');
    XLSX.utils.book_append_sheet(workbook, sixSSheet, '6S Scores');

    XLSX.writeFile(workbook, `Audit_Report_${audit.location}_${audit.date}.xlsx`);
  }

  function exportLocationReportExcel() {
    const locationAudits = audits.filter(a => a.location === selectedLocation);
    if (locationAudits.length === 0) return;

    const workbook = XLSX.utils.book_new();

    const avgScore = Math.round(
      locationAudits.reduce((sum, a) => sum + a.percentage, 0) / locationAudits.length
    );

    const summaryData = [
      { Metric: 'Location', Value: selectedLocation },
      { Metric: 'Total Audits', Value: locationAudits.length },
      { Metric: 'Average Score', Value: `${avgScore}%` },
      { Metric: 'Excellent (≥85%)', Value: locationAudits.filter(a => a.percentage >= 85).length },
      { Metric: 'Good (70-84%)', Value: locationAudits.filter(a => a.percentage >= 70 && a.percentage < 85).length },
      { Metric: 'Needs Improvement (50-69%)', Value: locationAudits.filter(a => a.percentage >= 50 && a.percentage < 70).length },
      { Metric: 'Critical (<50%)', Value: locationAudits.filter(a => a.percentage < 50).length }
    ];

    const sixSAverages = {};
    SIX_S_CATEGORIES.forEach(category => {
      const scores = locationAudits
        .map(a => a.sixSScores[category.code] || 0)
        .filter(s => s > 0);
      sixSAverages[category.code] = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    });

    const sixSData = SIX_S_CATEGORIES.map(category => ({
      'Category Code': category.code,
      'Category Name': category.name,
      'Average Score %': sixSAverages[category.code]
    }));

    const auditListData = locationAudits.map(audit => ({
      Date: audit.date,
      'Audit Type': auditTypeLabels[audit.auditType],
      Score: `${audit.percentage}%`,
      Status: audit.status,
      'Total Points': `${audit.score}/${audit.maxScore}`
    }));

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const sixSSheet = XLSX.utils.json_to_sheet(sixSData);
    const auditSheet = XLSX.utils.json_to_sheet(auditListData);

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, sixSSheet, '6S Performance');
    XLSX.utils.book_append_sheet(workbook, auditSheet, 'Audits');

    XLSX.writeFile(workbook, `Location_Report_${selectedLocation}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  function exportCategoryAnalysisExcel() {
    const workbook = XLSX.utils.book_new();

    const categoryData = SIX_S_CATEGORIES.map(category => {
      const scores = audits
        .map(a => a.sixSScores[category.code] || 0)
        .filter(s => s > 0);
      
      return {
        'Category Code': category.code,
        'Category Name': category.name,
        'Average Score %': scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        'Min Score %': scores.length > 0 ? Math.min(...scores) : 0,
        'Max Score %': scores.length > 0 ? Math.max(...scores) : 0,
        'Audit Count': scores.length
      };
    });

    const locationCategoryData = [];
    locations.forEach(location => {
      const locationAudits = audits.filter(a => a.location === location);
      SIX_S_CATEGORIES.forEach(category => {
        const scores = locationAudits
          .map(a => a.sixSScores[category.code] || 0)
          .filter(s => s > 0);
        
        locationCategoryData.push({
          Location: location,
          'Category Code': category.code,
          'Category Name': category.name,
          'Average Score %': scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
        });
      });
    });

    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    const locationSheet = XLSX.utils.json_to_sheet(locationCategoryData);

    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Overall');
    XLSX.utils.book_append_sheet(workbook, locationSheet, 'By Location');

    XLSX.writeFile(workbook, `6S_Category_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  function exportTrendAnalysisExcel() {
    const workbook = XLSX.utils.book_new();

    const sortedAudits = [...audits].sort((a, b) => new Date(a.date) - new Date(b.date));

    const trendData = sortedAudits.map(audit => ({
      Date: audit.date,
      Location: audit.location,
      'Audit Type': auditTypeLabels[audit.auditType],
      'Score %': audit.percentage,
      Status: audit.status
    }));

    const locationSummary = locations.map(location => {
      const locationAudits = sortedAudits.filter(a => a.location === location);
      const firstAvg = locationAudits[0]?.percentage || 0;
      const lastAvg = locationAudits[locationAudits.length - 1]?.percentage || 0;
      const trend = lastAvg - firstAvg;

      return {
        Location: location,
        'First Audit %': firstAvg,
        'Latest Audit %': lastAvg,
        'Change %': trend,
        'Trend': trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable',
        'Audit Count': locationAudits.length
      };
    });

    const trendSheet = XLSX.utils.json_to_sheet(trendData);
    const summarySheet = XLSX.utils.json_to_sheet(locationSummary);

    XLSX.utils.book_append_sheet(workbook, trendSheet, 'Trend Data');
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Location Summary');

    XLSX.writeFile(workbook, `Trend_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};

export default Reports;

