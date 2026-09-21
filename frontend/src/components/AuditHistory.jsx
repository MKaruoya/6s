import React, { useState, useMemo, useEffect } from 'react';
import { getAudits } from '../services/auditService';
import * as XLSX from 'xlsx';

const AUDIT_TYPE_MAP = {
  '4c67665b-dd1f-43fa-87a5-a7d9477cf303': 'warehouse',
  'bf0e6a59-a9b3-47f6-b6d5-18f0df806d45': 'shopfloor',
  'e1d3647c-aa77-420b-b072-d131f7b1af6a': 'laboratory',
  '5846ef78-480d-499f-92b1-ffdcc158fe93': 'internal'
};

const AuditHistory = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuditType, setFilterAuditType] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const auditTypeLabels = {
    warehouse: 'Warehouse',
    shopfloor: 'Shopfloor',
    laboratory: 'Laboratory',
    internal: 'Internal'
  };

  const itemsPerPage = 20;

  // Fetch audits
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

  // Filter audits
  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const searchMatch = 
        audit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.auditor.toLowerCase().includes(searchTerm.toLowerCase());

      const typeMatch = filterAuditType === 'All' || audit.auditType === filterAuditType;

      let dateMatch = true;
      const auditDate = new Date(audit.date);
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      if (filterDateRange === '7days') {
        dateMatch = auditDate >= sevenDaysAgo;
      } else if (filterDateRange === '30days') {
        dateMatch = auditDate >= thirtyDaysAgo;
      } else if (filterDateRange === 'custom') {
        if (filterFromDate) {
          dateMatch = auditDate >= new Date(filterFromDate);
        }
        if (filterToDate) {
          dateMatch = dateMatch && auditDate <= new Date(filterToDate);
        }
      }

      return searchMatch && typeMatch && dateMatch;
    });
  }, [audits, searchTerm, filterAuditType, filterDateRange, filterFromDate, filterToDate]);

  // Pagination
  const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAudits = filteredAudits.slice(startIndex, startIndex + itemsPerPage);

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredAudits.map(audit => ({
      Date: audit.date,
      'Audit Type': auditTypeLabels[audit.auditType],
      Location: audit.location,
      Auditor: audit.auditor,
      Score: `${audit.percentage}%`,
      Status: audit.status,
      'Total Points': `${audit.score}/${audit.maxScore}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audits');

    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 }
    ];

    XLSX.writeFile(workbook, `Audit_History_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Delete audit
  const handleDeleteAudit = async (auditId) => {
    if (window.confirm('Are you sure you want to delete this audit?')) {
      try {
        console.log('Deleting audit:', auditId);
        alert('Delete functionality coming soon');
      } catch (err) {
        console.error('Error deleting audit:', err);
      }
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

  const filterContainerStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E8EAED'
  };

  const filterRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '12px'
  };

  const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#2C3E50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle = {
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
    marginTop: '12px',
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

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#E8EAED',
    color: '#2C3E50'
  };

  const tableContainerStyle = {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    marginBottom: '24px',
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
    cursor: 'pointer',
    userSelect: 'none',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#2C3E50'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #E8EAED',
    fontSize: '13px',
    color: '#2C3E50'
  };

  const statusBadgeStyle = (status) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    background: status === 'Excellent' ? 'rgba(39, 174, 96, 0.1)' : status === 'Good' ? 'rgba(52, 152, 219, 0.1)' : status === 'Needs Improvement' ? 'rgba(230, 126, 34, 0.1)' : 'rgba(231, 76, 60, 0.1)',
    color: status === 'Excellent' ? '#27AE60' : status === 'Good' ? '#3498DB' : status === 'Needs Improvement' ? '#E67E22' : '#E74C3C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  });

  const actionButtonStyle = {
    padding: '4px 10px',
    margin: '0 3px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
    transition: 'all 0.3s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const viewButtonStyle = {
    ...actionButtonStyle,
    background: '#3498DB',
    color: 'white'
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    background: '#E74C3C',
    color: 'white'
  };

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px'
  };

  const paginationButtonStyle = {
    padding: '6px 12px',
    border: '1px solid #E8EAED',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    background: 'white',
    color: '#2C3E50',
    fontWeight: '700',
    transition: 'all 0.3s'
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #E8EAED'
  };

  const modalHeaderStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E8EAED',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const modalItemStyle = {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E8EAED'
  };

  const modalLabelStyle = {
    fontSize: '11px',
    color: '#999',
    fontWeight: '700',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const modalValueStyle = {
    fontSize: '14px',
    color: '#2C3E50',
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

  const filterTitleStyle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  if (loading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading audit history...</div></div>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Audit History</h1>
        <p style={subtitleStyle}>View and manage all audits</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* FILTERS */}
      <div style={filterContainerStyle}>
        <h3 style={filterTitleStyle}>Filters</h3>

        <div style={filterRowStyle}>
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Search</label>
            <input
              type="text"
              placeholder="Location or auditor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={inputStyle}
            />
          </div>

          <div style={filterGroupStyle}>
            <label style={labelStyle}>Type</label>
            <select
              value={filterAuditType}
              onChange={(e) => {
                setFilterAuditType(e.target.value);
                setCurrentPage(1);
              }}
              style={inputStyle}
            >
              <option value="All">All</option>
              <option value="warehouse">Warehouse</option>
              <option value="shopfloor">Shopfloor</option>
              <option value="laboratory">Laboratory</option>
              <option value="internal">Internal</option>
            </select>
          </div>

          <div style={filterGroupStyle}>
            <label style={labelStyle}>Date Range</label>
            <select
              value={filterDateRange}
              onChange={(e) => {
                setFilterDateRange(e.target.value);
                setCurrentPage(1);
              }}
              style={inputStyle}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {filterDateRange === 'custom' && (
          <div style={filterRowStyle}>
            <div style={filterGroupStyle}>
              <label style={labelStyle}>From</label>
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => {
                  setFilterFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                style={inputStyle}
              />
            </div>

            <div style={filterGroupStyle}>
              <label style={labelStyle}>To</label>
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => {
                  setFilterToDate(e.target.value);
                  setCurrentPage(1);
                }}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <div style={buttonGroupStyle}>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterAuditType('All');
              setFilterDateRange('all');
              setFilterFromDate('');
              setFilterToDate('');
              setCurrentPage(1);
            }}
            style={secondaryButtonStyle}
          >
            Clear
          </button>

          <button
            onClick={exportToExcel}
            style={primaryButtonStyle}
          >
            Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Auditor</th>
              <th style={thStyle}>Score</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedAudits.map((audit, index) => (
              <tr key={audit.id || index}>
                <td style={tdStyle}>{audit.date}</td>
                <td style={tdStyle}>{auditTypeLabels[audit.auditType]}</td>
                <td style={tdStyle}>{audit.location}</td>
                <td style={tdStyle}>{audit.auditor}</td>
                <td style={{...tdStyle, fontWeight: '700', color: '#FFD54F'}}>{audit.percentage}%</td>
                <td style={tdStyle}>
                  <span style={statusBadgeStyle(audit.status)}>{audit.status}</span>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => {
                      setSelectedAudit(audit);
                      setShowDetails(true);
                    }}
                    style={viewButtonStyle}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteAudit(audit.id)}
                    style={deleteButtonStyle}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAudits.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            No audits found
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={paginationStyle}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{ ...paginationButtonStyle, opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>

          <span style={{ fontSize: '12px', fontWeight: '700', color: '#2C3E50' }}>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{ ...paginationButtonStyle, opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails && selectedAudit && (
        <div style={modalOverlayStyle} onClick={() => setShowDetails(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              Audit Details
            </div>

            <div style={modalItemStyle}>
              <div style={modalLabelStyle}>Date</div>
              <div style={modalValueStyle}>{selectedAudit.date}</div>
            </div>

            <div style={modalItemStyle}>
              <div style={modalLabelStyle}>Type</div>
              <div style={modalValueStyle}>{auditTypeLabels[selectedAudit.auditType]}</div>
            </div>

            <div style={modalItemStyle}>
              <div style={modalLabelStyle}>Location</div>
              <div style={modalValueStyle}>{selectedAudit.location}</div>
            </div>

            <div style={modalItemStyle}>
              <div style={modalLabelStyle}>Auditor</div>
              <div style={modalValueStyle}>{selectedAudit.auditor}</div>
            </div>

            <div style={modalItemStyle}>
              <div style={modalLabelStyle}>Score</div>
              <div style={modalValueStyle}>{selectedAudit.percentage}% ({selectedAudit.score}/{selectedAudit.maxScore})</div>
            </div>

            <div style={modalItemStyle}>
              <div style={modalLabelStyle}>Status</div>
              <span style={statusBadgeStyle(selectedAudit.status)}>{selectedAudit.status}</span>
            </div>

            {/* COMMENTS SECTION */}
            {selectedAudit.rawData && selectedAudit.rawData.notes && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E8EAED' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#2C3E50', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Comments
                </h4>

                {(() => {
                  try {
                    const notes = JSON.parse(selectedAudit.rawData.notes);
                    const sections = notes.sections || {};
                    const hasComments = Object.values(sections).some(section => section.comments);

                    if (!hasComments) {
                      return <p style={{ color: '#999', fontSize: '12px' }}>No comments</p>;
                    }

                    return Object.entries(sections).map(([sectionCode, sectionData]) => {
                      if (!sectionData.comments) return null;

                      return (
                        <div key={sectionCode} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E8EAED' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#2C3E50', marginBottom: '6px', textTransform: 'uppercase' }}>
                            Section {sectionCode}
                          </div>
                          <div style={{ fontSize: '13px', color: '#2C3E50', lineHeight: '1.4', background: '#F5F7FA', padding: '8px', borderRadius: '4px' }}>
                            {sectionData.comments}
                          </div>
                        </div>
                      );
                    });
                  } catch (e) {
                    return <p style={{ color: '#999', fontSize: '12px' }}>Unable to load comments</p>;
                  }
                })()}
              </div>
            )}

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E8EAED' }}>
              <button
                onClick={() => setShowDetails(false)}
                style={primaryButtonStyle}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditHistory;
