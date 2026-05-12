import React, { useState, useMemo } from 'react';
import { auditCheckpoints } from '../../data/auditCheckpoints';
import { saveAudit } from '../../services/auditService';
import { locationsList } from '../../data/locations';
import '../../styles/AuditForm.css';

const ShopfloorAuditForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const auditData = auditCheckpoints.shopfloor;

  const [formData, setFormData] = useState({
    gemba: '',
    teamName: '',
    auditors: '',
    auditDate: new Date().toISOString().split('T')[0],
    sections: {}
  });

  // Initialize sections
  const initialSections = useMemo(() => {
    const sections = {};
    auditData.sections.forEach(section => {
      sections[section.code] = {
        checkpoints: {},
        comments: ''
      };
    });
    return sections;
  }, [auditData.sections]);

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, sections: initialSections }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SCORING LOGIC
  const calculateCheckpointScore = (abnormalities, maxPoints) => {
    if (abnormalities === 0) return maxPoints;
    if (abnormalities === 1 || abnormalities === 2) return maxPoints / 2;
    return 0;
  };

  const calculateSectionScore = (sectionCode) => {
    const section = formData.sections[sectionCode];
    if (!section || !section.checkpoints) return 0;

    const sectionData = auditData.sections.find(s => s.code === sectionCode);
    const maxPoints = sectionData?.maxPoints || 0;
    const checkpointCount = sectionData?.checkpoints?.length || 5;
    const pointsPerCheckpoint = maxPoints / checkpointCount;

    let score = 0;
    Object.values(section.checkpoints).forEach(abnormalities => {
      if (abnormalities !== undefined) {
        score += calculateCheckpointScore(abnormalities, pointsPerCheckpoint);
      }
    });

    return Math.round(score * 100) / 100;
  };

  const calculateTotalScore = () => {
    let total = 0;
    auditData.sections.forEach(section => {
      total += calculateSectionScore(section.code);
    });
    return Math.round(total * 100) / 100;
  };

  const calculatePercentage = () => {
    const total = calculateTotalScore();
    return Math.round((total / auditData.maxScore) * 100 * 100) / 100;
  };

  // Calculate 6S scores for storage
  // Calculate 6S scores for storage (as percentages)
const calculate6SScores = () => {
  const sixSScores = {};
  auditData.sections.forEach(section => {
    const sectionScore = calculateSectionScore(section.code);
    const maxPoints = section.maxPoints;
    // Convert to percentage
    const percentage = maxPoints > 0 ? Math.round((sectionScore / maxPoints) * 100) : 0;
    sixSScores[section.code] = percentage;
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

  const handleCheckpointChange = (sectionCode, checkpointIndex, abnormalities) => {
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionCode]: {
          ...prev.sections[sectionCode],
          checkpoints: {
            ...prev.sections[sectionCode].checkpoints,
            [checkpointIndex]: abnormalities
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
    if (currentStep < 5) setCurrentStep(currentStep + 1);
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
        auditType: 'shopfloor',
        location: formData.gemba,
        gemba: formData.gemba,
        teamName: formData.teamName,
        auditors: formData.auditors,
        auditDate: formData.auditDate,
        totalScore: calculateTotalScore(),
        percentage: calculatePercentage(),
        sections: formData.sections,
        sixSScores: sixSScores  // ADD 6S SCORES
      };

      await saveAudit(auditPayload);

      console.log('Shopfloor audit saved successfully:', auditPayload);
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
      gemba: '',
      teamName: '',
      auditors: '',
      auditDate: new Date().toISOString().split('T')[0],
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
    <div className="audit-form-wrapper">
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
        <p className="form-scope">Scope: {auditData.scope}</p>
        <p className="scoring-criteria">Scoring Criteria: {auditData.scoringCriteria}</p>
      </div>

      {/* ALERTS */}
      {error && <div className="alert alert-error">Error: {error}</div>}

      {/* FORM CONTENT */}
      <form onSubmit={handleSubmit} className="audit-form">
        
        {/* STEP 1: METADATA */}
        {currentStep === 1 && !success && (
          <div className="form-step">
            <h2>Audit Information</h2>
            
            <div className="metadata-grid">
              <div className="form-group">
  <label>GEMBA (Location) *</label>
  <select 
    name="gemba" 
    value={formData.gemba}
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
                <label>TEAM NAME *</label>
                <input 
                  type="text" 
                  name="teamName" 
                  value={formData.teamName}
                  onChange={handleInputChange}
                  placeholder="e.g., Production Team"
                  required
                />
              </div>
              <div className="form-group">
                <label>AUDITOR(S) *</label>
                <input 
                  type="text" 
                  name="auditors" 
                  value={formData.auditors}
                  onChange={handleInputChange}
                  placeholder="Auditor names"
                  required
                />
              </div>
              <div className="form-group">
                <label>DATE *</label>
                <input 
                  type="date" 
                  name="auditDate" 
                  value={formData.auditDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEPS 2-4: SECTIONS */}
        {currentStep >= 2 && currentStep <= 4 && !success && (
          <div className="form-step">
            {auditData.sections.slice((currentStep - 2) * 2, (currentStep - 1) * 2).map(section => (
              <div key={section.code} className="section-card">
                <div className="section-header">
                  <div className="section-title">
                    <h3>{section.code}/{section.name}</h3>
                    <p>{section.english}</p>
                  </div>
                  <div className="section-score-badge">
                    <span className="score-value">{calculateSectionScore(section.code)}</span>
                    <span className="score-max">/{section.maxPoints}</span>
                  </div>
                </div>

                <div className="checkpoints-container">
                  {section.checkpoints.map((checkpoint, idx) => (
                    <div key={idx} className="checkpoint-row">
                      <div className="checkpoint-info">
                        <span className="checkpoint-number">C{idx + 1}</span>
                        <div className="checkpoint-text">
                          <p className="checkpoint-question">{checkpoint.question}</p>
                          <p className="checkpoint-description">{checkpoint.description}</p>
                        </div>
                      </div>

                      <div className="scoring-options">
                        {[0, 1, 2, 3].map(abnormalities => (
                          <button
                            key={abnormalities}
                            type="button"
                            className={`score-btn ${
                              formData.sections[section.code]?.checkpoints?.[idx] === abnormalities 
                                ? 'active' 
                                : ''
                            }`}
                            onClick={() => handleCheckpointChange(section.code, idx, abnormalities)}
                            title={`${abnormalities === 3 ? '3+' : abnormalities} abnormalities`}
                          >
                            {abnormalities === 3 ? '3+' : abnormalities}
                          </button>
                        ))}
                      </div>

                      <div className="checkpoint-score">
                        {formData.sections[section.code]?.checkpoints?.[idx] !== undefined && (
                          <span className="score-display">
                            {calculateCheckpointScore(
                              formData.sections[section.code].checkpoints[idx],
                              section.maxPoints / section.checkpoints.length
                            ).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="section-comments">
                  <label>COMMENTS:</label>
                  <textarea 
                    placeholder="Add any observations or notes for this section..."
                    rows="3"
                    value={formData.sections[section.code]?.comments || ''}
                    onChange={(e) => handleCommentsChange(section.code, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {currentStep === 5 && !success && (
          <div className="form-step review-step">
            <h2>Review & Submit</h2>
            
            <div className="review-card">
              <h3>Audit Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">GEMBA:</span>
                  <span className="value">{formData.gemba}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Team Name:</span>
                  <span className="value">{formData.teamName}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Auditor(s):</span>
                  <span className="value">{formData.auditors}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Date:</span>
                  <span className="value">{formData.auditDate}</span>
                </div>
              </div>
            </div>

            <div className="review-card">
              <h3>Section Scores</h3>
              <div className="scores-table">
                {auditData.sections.map(section => (
                  <div key={section.code} className="score-row">
                    <span className="section-name">{section.code} - {section.english}</span>
                    <span className="section-score">
                      {calculateSectionScore(section.code)}/{section.maxPoints}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="review-card total-score-card">
              <h3>Total Score</h3>
              <div className="total-score-display">
                <div className="score-number">{calculateTotalScore()}</div>
                <div className="score-max">/ {auditData.maxScore}</div>
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
              Your shopfloor audit has been recorded and saved.
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
              {[1, 2, 3, 4, 5].map(step => (
                <div 
                  key={step} 
                  className={`step-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                  title={`Step ${step}`}
                />
              ))}
            </div>
            {currentStep < 5 ? (
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

export default ShopfloorAuditForm;
