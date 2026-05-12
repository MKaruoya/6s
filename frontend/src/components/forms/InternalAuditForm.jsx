import React, { useState, useMemo } from 'react';
import { auditCheckpoints } from '../../data/auditCheckpoints';
import { saveAudit } from '../../services/auditService';
import { locationsList } from '../../data/locations';
import '../../styles/InternalAuditForm.css';
import '../../styles/AuditForm.css';

const InternalAuditForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const auditData = auditCheckpoints.internal;

  const [formData, setFormData] = useState({
    areaAudited: '',
    auditor: '',
    auditPeriodStart: new Date().toISOString().split('T')[0],
    auditPeriodEnd: new Date().toISOString().split('T')[0],
    sections: {}
  });

  // Initialize sections with weekly data
  const initialSections = useMemo(() => {
    const sections = {};
    auditData.sections.forEach(section => {
      sections[section.code] = {
        criteria: {},
        comments: ''
      };

      section.criteria.forEach((criterion, idx) => {
        sections[section.code].criteria[idx] = {
          W1: '',
          W2: '',
          W3: '',
          W4: ''
        };
      });
    });
    return sections;
  }, [auditData.sections]);

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, sections: initialSections }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SCORING LOGIC FOR INTERNAL AUDIT
  const calculateCriterionAverage = (sectionCode, criterionIndex) => {
    const criterion = formData.sections[sectionCode]?.criteria?.[criterionIndex];
    if (!criterion) return 0;

    const values = [criterion.W1, criterion.W2, criterion.W3, criterion.W4]
      .map(v => v ? parseInt(v) : 0)
      .filter(v => v !== 0);

    if (values.length === 0) return 0;

    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  };

  const calculateSectionAverage = (sectionCode) => {
    const section = formData.sections[sectionCode];
    if (!section || !section.criteria) return 0;

    const sectionData = auditData.sections.find(s => s.code === sectionCode);
    const criteriaCount = sectionData?.criteria?.length || 0;

    let total = 0;
    for (let i = 0; i < criteriaCount; i++) {
      total += calculateCriterionAverage(sectionCode, i);
    }

    return Math.round((total / criteriaCount) * 100) / 100;
  };

  const calculateTotalAverage = () => {
    let total = 0;
    auditData.sections.forEach(section => {
      total += calculateSectionAverage(section.code);
    });

    return Math.round((total / auditData.sections.length) * 100) / 100;
  };

  const calculatePercentage = () => {
    const total = calculateTotalAverage();
    return Math.round((total / 25) * 100 * 100) / 100;
  };

  // Calculate 6S scores for storage
  const calculate6SScores = () => {
    const sixSScores = {};
    auditData.sections.forEach(section => {
      sixSScores[section.code] = calculateSectionAverage(section.code);
    });
    return sixSScores;
  };

  // HANDLERS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWeeklyChange = (sectionCode, criterionIndex, week, value) => {
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionCode]: {
          ...prev.sections[sectionCode],
          criteria: {
            ...prev.sections[sectionCode].criteria,
            [criterionIndex]: {
              ...prev.sections[sectionCode].criteria[criterionIndex],
              [week]: value
            }
          }
        }
      }
    }));
  };

  const handleCommentsChange = (sectionCode, comments) => {
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionCode]: {
          ...prev.sections[sectionCode],
          comments
        }
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Calculate 6S scores
      const sixSScores = calculate6SScores();

      const auditPayload = {
        auditType: 'internal',
        location: formData.areaAudited,
        areaAudited: formData.areaAudited,
        auditor: formData.auditor,
        auditPeriodStart: formData.auditPeriodStart,
        auditPeriodEnd: formData.auditPeriodEnd,
        totalScore: calculateTotalAverage(),
        percentage: calculatePercentage(),
        sections: formData.sections,
        sixSScores: sixSScores  // ADD 6S SCORES
      };

      await saveAudit(auditPayload);

      console.log('Internal audit saved successfully:', auditPayload);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to submit audit');
      console.error('Submit error:', err);
      setLoading(false);
    }
  };

  const handleNewAudit = () => {
    setCurrentStep(1);
    setFormData({
      areaAudited: '',
      auditor: '',
      auditPeriodStart: new Date().toISOString().split('T')[0],
      auditPeriodEnd: new Date().toISOString().split('T')[0],
      sections: {}
    });
    setSuccess(false);
  };

  // STYLES
  const successScreenStyle = {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  const checkmarkStyle = {
    fontSize: '64px',
    marginBottom: '20px',
    color: '#10B981'
  };

  const successTitleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '10px'
  };

  const successMessageStyle = {
    fontSize: '16px',
    color: '#666',
    marginBottom: '40px'
  };

  const newAuditBtnStyle = {
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s'
  };

  return (
    <div className="internal-audit-wrapper">
      {/* FORM HEADER */}
      <div className="form-header-section">
        <div className="form-header-top">
          <div className="company-info">
            <h2>CAPWELL INDUSTRIES LIMITED</h2>
            <p>"The Home of Wholesome Brands"</p>
          </div>
          <div className="form-reference">
            <p><strong>Document:</strong> {auditData.code}</p>
            <p><strong>Revision:</strong> {auditData.revision}</p>
          </div>
        </div>
        <h1 className="form-title">{auditData.name}</h1>
        <p className="form-scope">Weekly Tracking Format</p>
      </div>

      {/* ALERTS */}
      {error && <div className="alert alert-error">Error: {error}</div>}

      {/* FORM CONTENT */}
      <form onSubmit={handleSubmit} className="internal-audit-form">
        
        {/* STEP 1: METADATA */}
        {currentStep === 1 && !success && (
          <div className="form-step">
            <h2>Audit Period Information</h2>
            
            <div className="metadata-grid">
              <div className="form-group">
  <label>Area Audited *</label>
  <select 
    name="areaAudited" 
    value={formData.areaAudited}
    onChange={handleInputChange}
    required
  >
    <option value="">-- Select Location --</option>
    {locationsList.map(location => (
      <option key={location} value={location}>
        {location}
      </option>
    ))}
  </select>
</div>

              <div className="form-group">
                <label>Auditor *</label>
                <input 
                  type="text" 
                  name="auditor" 
                  value={formData.auditor}
                  onChange={handleInputChange}
                  placeholder="Auditor name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Audit Period Start *</label>
                <input 
                  type="date" 
                  name="auditPeriodStart" 
                  value={formData.auditPeriodStart}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Audit Period End *</label>
                <input 
                  type="date" 
                  name="auditPeriodEnd" 
                  value={formData.auditPeriodEnd}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="scoring-guide">
              <h3>Scoring System</h3>
              <p><strong>High:</strong> 5 or more problems found</p>
              <p><strong>3-4:</strong> 3 to 4 problems found</p>
              <p><strong>2:</strong> 2 problems found</p>
              <p><strong>1:</strong> 1 problem found</p>
              <p><strong>0:</strong> No abnormality found</p>
            </div>
          </div>
        )}

        {/* STEP 2: WEEKLY DATA ENTRY */}
        {currentStep === 2 && !success && (
          <div className="form-step">
            <h2>Weekly Audit Data</h2>
            
            {auditData.sections.map(section => (
              <div key={section.code} className="section-card">
                <div className="section-header">
                  <div className="section-title">
                    <h3>{section.code}/{section.name}</h3>
                    <p>{section.english}</p>
                  </div>
                  <div className="section-score-badge">
                    <span className="score-value">{calculateSectionAverage(section.code)}</span>
                    <span className="score-max">/25</span>
                  </div>
                </div>

                <div className="weekly-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Criteria</th>
                        <th>W1</th>
                        <th>W2</th>
                        <th>W3</th>
                        <th>W4</th>
                        <th>Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.criteria.map((criterion, idx) => (
                        <tr key={idx}>
                          <td className="criterion-name">
                            <span className="criterion-number">C{idx + 1}</span>
                            <span>{criterion.question}</span>
                          </td>
                          <td>
                            <input 
                              type="number" 
                              min="0" 
                              max="5"
                              value={formData.sections[section.code]?.criteria?.[idx]?.W1 || ''}
                              onChange={(e) => handleWeeklyChange(section.code, idx, 'W1', e.target.value)}
                              placeholder="0-5"
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              min="0" 
                              max="5"
                              value={formData.sections[section.code]?.criteria?.[idx]?.W2 || ''}
                              onChange={(e) => handleWeeklyChange(section.code, idx, 'W2', e.target.value)}
                              placeholder="0-5"
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              min="0" 
                              max="5"
                              value={formData.sections[section.code]?.criteria?.[idx]?.W3 || ''}
                              onChange={(e) => handleWeeklyChange(section.code, idx, 'W3', e.target.value)}
                              placeholder="0-5"
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              min="0" 
                              max="5"
                              value={formData.sections[section.code]?.criteria?.[idx]?.W4 || ''}
                              onChange={(e) => handleWeeklyChange(section.code, idx, 'W4', e.target.value)}
                              placeholder="0-5"
                            />
                          </td>
                          <td className="average-cell">
                            {calculateCriterionAverage(section.code, idx).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="section-comments">
                  <label>COMMENTS:</label>
                  <textarea 
                    placeholder="Add any observations or notes for this section..."
                    rows="2"
                    value={formData.sections[section.code]?.comments || ''}
                    onChange={(e) => handleCommentsChange(section.code, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: REVIEW & SUBMIT */}
        {currentStep === 3 && !success && (
          <div className="form-step review-step">
            <h2>Audit Summary</h2>
            
            <div className="review-card">
              <h3>Audit Information</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Area Audited:</span>
                  <span className="value">{formData.areaAudited}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Auditor:</span>
                  <span className="value">{formData.auditor}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Period:</span>
                  <span className="value">{formData.auditPeriodStart} to {formData.auditPeriodEnd}</span>
                </div>
              </div>
            </div>

            <div className="review-card">
              <h3>Section Averages</h3>
              <div className="scores-table">
                {auditData.sections.map(section => (
                  <div key={section.code} className="score-row">
                    <span className="section-name">{section.code} - {section.english}</span>
                    <span className="section-score">
                      {calculateSectionAverage(section.code)}/25
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="review-card total-score-card">
              <h3>Total Audit Score</h3>
              <div className="total-score-display">
                <div className="score-number">{calculateTotalAverage()}</div>
                <div className="score-max">/ 25</div>
                <div className="score-percentage">{calculatePercentage()}%</div>
              </div>
              <div className="score-status">
                {calculatePercentage() >= 85 && <span className="status excellent">Excellent</span>}
                {calculatePercentage() >= 70 && calculatePercentage() < 85 && <span className="status good">Good</span>}
                {calculatePercentage() >= 50 && calculatePercentage() < 70 && <span className="status needs-improvement">Needs Improvement</span>}
                {calculatePercentage() < 50 && <span className="status critical">Critical</span>}
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {success && (
          <div style={successScreenStyle}>
            <div style={checkmarkStyle}>✓</div>
            <h2 style={successTitleStyle}>Audit Submitted Successfully</h2>
            <p style={successMessageStyle}>
              Your internal audit has been recorded and saved.
            </p>
            <button
              type="button"
              onClick={handleNewAudit}
              style={newAuditBtnStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10B981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Start New Audit
            </button>
          </div>
        )}

        {/* NAVIGATION */}
        {!success && (
          <div className="form-navigation">
            <button 
              type="button" 
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="btn btn-secondary"
            >
              ← Previous
            </button>
            <div className="step-indicator">
              {[1, 2, 3].map(step => (
                <div 
                  key={step} 
                  className={`step-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                  title={`Step ${step}`}
                />
              ))}
            </div>
            {currentStep < 3 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="btn btn-primary"
              >
                Next →
              </button>
            ) : (
              <button 
                type="submit"
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? 'Submitting...' : 'Submit Audit'}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default InternalAuditForm;
