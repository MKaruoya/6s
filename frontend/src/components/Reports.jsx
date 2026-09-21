import React, { useState, useMemo, useEffect } from 'react';
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
  Cell,
  ReferenceLine,
  ComposedChart
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

const TARGET_SCORE = 80;

const Reports = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReport, setActiveReport] = useState('monthVsMonth');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

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

        const transformedAudits = data.map(audit => {
          let auditorName = 'Auditor';
          let sixSScores = {};

          try {
            const notes = JSON.parse(audit.notes);
            auditorName = notes.auditors || 'Auditor';
            sixSScores = notes.sixSScores || {};
          } catch (e) {
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

  // ==================== DATE FILTERING ====================

  const getFilteredAudits = () => {
    return audits.filter(audit => {
      const auditDate = new Date(audit.date);
      const today = new Date();

      if (filterDateRange === 'all') {
        return true;
      } else if (filterDateRange === '1month') {
        const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return auditDate >= oneMonthAgo;
      } else if (filterDateRange === '3months') {
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        return auditDate >= threeMonthsAgo;
      } else if (filterDateRange === '6months') {
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        return auditDate >= sixMonthsAgo;
      } else if (filterDateRange === '1year') {
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        return auditDate >= oneYearAgo;
      } else if (filterDateRange === 'custom') {
        let match = true;
        if (filterFromDate) {
          match = match && auditDate >= new Date(filterFromDate);
        }
        if (filterToDate) {
          match = match && auditDate <= new Date(filterToDate);
        }
        return match;
      }

      return true;
    });
  };

  // ==================== DATA PROCESSING ====================

  const getMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getMonthVsMonthData = () => {
    const filteredAudits = getFilteredAudits();
    const monthData = {};

    filteredAudits.forEach(audit => {
      const monthYear = getMonthYear(audit.date);
      if (!monthData[monthYear]) {
        monthData[monthYear] = { month: monthYear, scores: [] };
      }
      monthData[monthYear].scores.push(audit.percentage);
    });

    return Object.values(monthData)
      .map(item => ({
        month: item.month,
        average: Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length),
        target: TARGET_SCORE
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getAverageVsTargetData = () => {
    const filteredAudits = getFilteredAudits();
    const monthData = {};

    filteredAudits.forEach(audit => {
      const monthYear = getMonthYear(audit.date);
      if (!monthData[monthYear]) {
        monthData[monthYear] = { month: monthYear, scores: [] };
      }
      monthData[monthYear].scores.push(audit.percentage);
    });

    return Object.values(monthData)
      .map(item => ({
        month: item.month,
        average: Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length),
        target: TARGET_SCORE,
        status: Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length) >= TARGET_SCORE ? 'Met' : 'Below'
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getEnhancedRadarData = (auditList) => {
    return SIX_S_CATEGORIES.map(category => {
      const scores = auditList
        .map(a => a.sixSScores[category.code] || 0)
        .filter(s => s > 0);

      const average = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      return {
        name: category.code,
        fullName: category.name,
        value: average,
        percentage: `${average}%`
      };
    });
  };

  const getLocationRadarData = (location) => {
    const filteredAudits = getFilteredAudits();
    const locationAudits = filteredAudits.filter(a => a.location === location);
    return getEnhancedRadarData(locationAudits);
  };

  const getOverallRadarData = () => {
    const filteredAudits = getFilteredAudits();
    return getEnhancedRadarData(filteredAudits);
  };

  // ==================== REPORT COMPONENTS ====================

  const EnhancedRadarChart = ({ data, title }) => {
    return (
      <div style={reportSectionStyle}>
        <div style={reportSectionTitleStyle}>{title}</div>
        <div style={{ background: '#F5F7FA', padding: '16px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #E8EAED' }}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid stroke="#E8EAED" strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="fullName" 
                stroke="#2C3E50"
                tick={{ fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                stroke="#999"
                tick={{ fontSize: 10 }}
              />
              <Radar 
                name="Score %" 
                dataKey="value" 
                stroke="#2C3E50" 
                fill="#FFD54F" 
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}%`,
                  props.payload.fullName
                ]}
                contentStyle={{
                  background: 'white',
                  border: '1px solid #E8EAED',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>

          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#2C3E50', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Scores:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
              {data.map(item => (
                <div key={item.name} style={{
                  background: 'white',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #E8EAED',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#2C3E50' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#FFD54F', marginTop: '4px' }}>
                    {item.percentage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DateFilterComponent = () => {
    return (
      <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#2C3E50', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Date Range
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Period</label>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Time</option>
              <option value="1month">Last 1 Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last 1 Year</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {filterDateRange === 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>From</label>
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                style={selectStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>To</label>
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                style={selectStyle}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const MonthVsMonthReport = () => {
    const data = getMonthVsMonthData();

    return (
      <div id="month-vs-month-report" style={reportPreviewStyle}>
        <div style={reportHeaderStyle}>
          <div style={reportTitleStyle}>Month vs Month Performance</div>
          <div style={reportSubtitleStyle}>All Locations - Target: {TARGET_SCORE}%</div>
          <div style={reportDateStyle}>{new Date().toLocaleDateString()}</div>
        </div>

        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Monthly Average Score</div>
          <div style={{ background: '#F5F7FA', padding: '16px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #E8EAED' }}>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={data}>
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
                />
                <Legend />
                <ReferenceLine 
                  y={TARGET_SCORE} 
                  stroke="#E74C3C" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: `Target: ${TARGET_SCORE}%`, position: 'right', fill: '#E74C3C', fontSize: 10 }}
                />
                <Bar 
                  dataKey="average" 
                  fill="#FFD54F" 
                  stroke="none"
                  name="Average Score"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Table */}
        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Summary</div>
          <div style={tableStyle}>
            <div style={{ ...tableRowStyle, background: '#F5F7FA', fontWeight: '700', borderBottom: '2px solid #E8EAED' }}>
              <div style={tableColStyle}>Month</div>
              <div style={tableColStyle}>Average</div>
              <div style={tableColStyle}>Target</div>
              <div style={tableColStyle}>Status</div>
            </div>

            {data.map(item => (
              <div key={item.month} style={tableRowStyle}>
                <div style={tableColStyle}>{item.month}</div>
                <div style={{ ...tableColStyle, fontWeight: '700', color: '#FFD54F' }}>{item.average}%</div>
                <div style={tableColStyle}>{item.target}%</div>
                <div style={{
                  ...tableColStyle,
                  fontWeight: '700',
                  color: item.average >= TARGET_SCORE ? '#27AE60' : '#E74C3C'
                }}>
                  {item.average >= TARGET_SCORE ? 'Met' : 'Below'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={reportFooterStyle}>
          <div>Generated on {new Date().toLocaleString()}</div>
          <div>CAPWELL INDUSTRIES LIMITED</div>
        </div>
      </div>
    );
  };

  const AverageVsTargetReport = () => {
    const data = getAverageVsTargetData();

    return (
      <div id="average-vs-target-report" style={reportPreviewStyle}>
        <div style={reportHeaderStyle}>
          <div style={reportTitleStyle}>Average vs Target</div>
          <div style={reportSubtitleStyle}>All Months - Target: {TARGET_SCORE}%</div>
          <div style={reportDateStyle}>{new Date().toLocaleDateString()}</div>
        </div>

        <div style={reportSectionStyle}>
          <div style={reportSectionTitleStyle}>Performance</div>
          <div style={{ background: '#F5F7FA', padding: '16px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #E8EAED' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data}>
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
                />
                <Legend />
                <ReferenceLine 
                  y={TARGET_SCORE} 
                  stroke="#E74C3C" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: `Target: ${TARGET_SCORE}%`, position: 'right', fill: '#E74C3C', fontSize: 10 }}
                />
                <Bar 
                  dataKey="average" 
                  fill="#FFD54F" 
                  stroke="none"
                  name="Average Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={reportCardsGridStyle}>
          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Met Target</div>
            <div style={cardValueStyle}>{data.filter(d => d.status === 'Met').length}</div>
          </div>

          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Below Target</div>
            <div style={cardValueStyle}>{data.filter(d => d.status === 'Below').length}</div>
          </div>

          <div style={reportCardStyle}>
            <div style={cardLabelStyle}>Overall Avg</div>
            <div style={cardValueStyle}>
              {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.average, 0) / data.length) : 0}%
            </div>
          </div>
        </div>

        <div style={reportFooterStyle}>
          <div>Generated on {new Date().toLocaleString()}</div>
          <div>CAPWELL INDUSTRIES LIMITED</div>
        </div>
      </div>
    );
  };

  const OverallRadarReport = () => {
    const data = getOverallRadarData();

    return (
      <div id="overall-radar-report" style={reportPreviewStyle}>
        <div style={reportHeaderStyle}>
          <div style={reportTitleStyle}>Overall 6S Performance</div>
          <div style={reportSubtitleStyle}>All Locations - All Audits</div>
          <div style={reportDateStyle}>{new Date().toLocaleDateString()}</div>
        </div>

        <EnhancedRadarChart 
          data={data}
          title="6S Category Performance"
        />

        <div style={reportFooterStyle}>
          <div>Generated on {new Date().toLocaleString()}</div>
          <div>CAPWELL INDUSTRIES LIMITED</div>
        </div>
      </div>
    );
  };

  const LocationRadarReport = () => {
    const data = selectedLocation ? getLocationRadarData(selectedLocation) : [];

    return (
      <div id="location-radar-report" style={reportPreviewStyle}>
        <div style={reportHeaderStyle}>
          <div style={reportTitleStyle}>Location 6S Performance</div>
          <div style={reportSubtitleStyle}>{selectedLocation || 'Select a location'}</div>
          <div style={reportDateStyle}>{new Date().toLocaleDateString()}</div>
        </div>

        {selectedLocation && data.length > 0 ? (
          <EnhancedRadarChart 
            data={data}
            title={`6S Performance - ${selectedLocation}`}
          />
        ) : (
          <div style={{ padding: '20px', color: '#999', textAlign: 'center', fontSize: '13px' }}>
            Select a location to view performance
          </div>
        )}

        <div style={reportFooterStyle}>
          <div>Generated on {new Date().toLocaleString()}</div>
          <div>CAPWELL INDUSTRIES LIMITED</div>
        </div>
      </div>
    );
  };

  // Export to PDF
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
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF: ' + err.message);
    }
  };

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

  const cardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    marginBottom: '24px',
    border: '1px solid #E8EAED'
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const formGroupStyle = {
    marginBottom: '16px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const selectStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #E8EAED',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'inherit',
    color: '#2C3E50',
    transition: 'all 0.3s ease'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    flexWrap: 'wrap'
  };

  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    transition: 'all 0.3s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: '#2C3E50',
    color: 'white'
  };

  const reportPreviewStyle = {
    background: 'white',
    padding: '24px',
    borderRadius: '8px',
    marginTop: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E8EAED'
  };

  const reportHeaderStyle = {
    textAlign: 'center',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #E8EAED'
  };

  const reportTitleStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const reportSubtitleStyle = {
    fontSize: '13px',
    color: '#999',
    marginBottom: '8px',
    fontWeight: '600'
  };

  const reportDateStyle = {
    fontSize: '11px',
    color: '#999',
    fontWeight: '500'
  };

  const reportCardsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginBottom: '24px'
  };

  const reportCardStyle = {
    background: '#F5F7FA',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #E8EAED',
    textAlign: 'center'
  };

  const cardLabelStyle = {
    fontSize: '10px',
    color: '#999',
    fontWeight: '700',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const cardValueStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#FFD54F'
  };

  const reportSectionStyle = {
    marginBottom: '24px'
  };

  const reportSectionTitleStyle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #E8EAED',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '12px'
  };

  const tableRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '12px',
    padding: '10px',
    borderBottom: '1px solid #E8EAED',
    alignItems: 'center'
  };

  const tableColStyle = {
    fontSize: '12px',
    color: '#2C3E50',
    fontWeight: '500'
  };

  const reportFooterStyle = {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #E8EAED',
    textAlign: 'center',
    fontSize: '11px',
    color: '#999',
    fontWeight: '600'
  };

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

  const infoBoxStyle = {
    background: 'rgba(255, 213, 79, 0.1)',
    color: '#2C3E50',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '13px',
    border: '1px solid #FFD54F',
    fontWeight: '600'
  };

  if (loading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading reports...</div></div>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Reports</h1>
        <p style={subtitleStyle}>Generate professional audit reports</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* INFO BOX */}
      {audits.length > 0 && (
        <div style={infoBoxStyle}>
          Total Audits: {audits.length} | Locations: {locations.length} | Target: {TARGET_SCORE}%
        </div>
      )}

      {/* DATE FILTER */}
      <DateFilterComponent />

      {/* TABS */}
      <div style={tabsStyle}>
        <button
          style={tabStyle(activeReport === 'monthVsMonth')}
          onClick={() => setActiveReport('monthVsMonth')}
        >
          Month vs Month
        </button>

        <button
          style={tabStyle(activeReport === 'averageVsTarget')}
          onClick={() => setActiveReport('averageVsTarget')}
        >
          Average vs Target
        </button>

        <button
          style={tabStyle(activeReport === 'overallRadar')}
          onClick={() => setActiveReport('overallRadar')}
        >
          Overall Radar
        </button>

        <button
          style={tabStyle(activeReport === 'locationRadar')}
          onClick={() => setActiveReport('locationRadar')}
        >
          Location Radar
        </button>
      </div>

      {/* REPORT 1: MONTH VS MONTH */}
      {activeReport === 'monthVsMonth' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Month vs Month Performance</h2>
          <p style={{ color: '#999', marginBottom: '16px', fontSize: '13px' }}>
            Compare monthly average scores against the {TARGET_SCORE}% target.
          </p>

          <div style={buttonGroupStyle}>
            <button
              onClick={() => exportToPDF('month-vs-month-report', `Month_vs_Month_Report_${new Date().toISOString().split('T')[0]}.pdf`)}
              style={primaryButtonStyle}
            >
              Download PDF
            </button>
          </div>

          <MonthVsMonthReport />
        </div>
      )}

      {/* REPORT 2: AVERAGE VS TARGET */}
      {activeReport === 'averageVsTarget' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Average vs Target</h2>
          <p style={{ color: '#999', marginBottom: '16px', fontSize: '13px' }}>
            View all months showing average score against the {TARGET_SCORE}% target.
          </p>

          <div style={buttonGroupStyle}>
            <button
              onClick={() => exportToPDF('average-vs-target-report', `Average_vs_Target_Report_${new Date().toISOString().split('T')[0]}.pdf`)}
              style={primaryButtonStyle}
            >
              Download PDF
            </button>
          </div>

          <AverageVsTargetReport />
        </div>
      )}

      {/* REPORT 3: OVERALL RADAR */}
      {activeReport === 'overallRadar' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Overall 6S Performance</h2>
          <p style={{ color: '#999', marginBottom: '16px', fontSize: '13px' }}>
            Comprehensive 6S radar chart across all locations and audits.
          </p>

          <div style={buttonGroupStyle}>
            <button
              onClick={() => exportToPDF('overall-radar-report', `Overall_Radar_Report_${new Date().toISOString().split('T')[0]}.pdf`)}
              style={primaryButtonStyle}
            >
              Download PDF
            </button>
          </div>

          <OverallRadarReport />
        </div>
      )}

      {/* REPORT 4: LOCATION RADAR */}
      {activeReport === 'locationRadar' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Location 6S Performance</h2>
          <p style={{ color: '#999', marginBottom: '16px', fontSize: '13px' }}>
            View 6S performance radar for a specific location.
          </p>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Select Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={selectStyle}
            >
              <option value="">-- Choose location --</option>
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
                onClick={() => exportToPDF('location-radar-report', `Location_Radar_${selectedLocation}_${new Date().toISOString().split('T')[0]}.pdf`)}
                style={primaryButtonStyle}
              >
                Download PDF
              </button>
            </div>
          )}

          <LocationRadarReport />
        </div>
      )}
    </div>
  );
};

export default Reports;
