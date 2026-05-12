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
      // Search filter
      const searchMatch = 
        audit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.auditor.toLowerCase().includes(searchTerm.toLowerCase());

      // Audit type filter
      const typeMatch = filterAuditType === 'All' || audit.auditType === filterAuditType;

      // Date range filter
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

    // Set column widths
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
        // TODO: Implement delete in auditService
        console.log('Deleting audit:', auditId);
        alert('Delete functionality coming soon');
      } catch (err) {
        console.error('Error deleting audit:', err);
      }
    }
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

  const filterContainerStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const filterRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '15px'
  };

  const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  };

  const inputStyle = {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  };

  const buttonStyle = {
    padding: '10px 20px',
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

  const tableContainerStyle = {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginBottom: '30px'
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
    fontWeight: '600',
    cursor: 'pointer',
    userSelect: 'none'
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

  const actionButtonStyle = {
    padding: '6px 12px',
    margin: '0 4px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.3s'
  };

  const viewButtonStyle = {
    ...actionButtonStyle,
    background: '#3B82F6',
    color: 'white'
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    background: '#EF4444',
    color: 'white'
  };

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px'
  };

  const paginationButtonStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    background: 'white',
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
    padding: '30px',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
  };

  const modalHeaderStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e5e7eb'
  };

  const modalItemStyle = {
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e5e7eb'
  };

  const modalLabelStyle = {
    fontSize: '12px',
    color: '#666',
    fontWeight: '600',
    marginBottom: '5px'
  };

  const modalValueStyle = {
    fontSize: '16px',
    color: '#333',
    fontWeight: '500'
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

  if (loading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading audit history...</div></div>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Audit History</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>View and manage all audits</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* FILTERS */}
      <div style={filterContainerStyle}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '15px' }}>Filters</h3>

        <div style={filterRowStyle}>
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Search (Location/Auditor)</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={inputStyle}
            />
          </div>

          <div style={filterGroupStyle}>
            <label style={labelStyle}>Audit Type</label>
            <select
              value={filterAuditType}
              onChange={(e) => {
                setFilterAuditType(e.target.value);
                setCurrentPage(1);
              }}
              style={inputStyle}
            >
              <option value="All">All Types</option>
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
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {filterDateRange === 'custom' && (
          <div style={filterRowStyle}>
            <div style={filterGroupStyle}>
              <label style={labelStyle}>From Date</label>
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
              <label style={labelStyle}>To Date</label>
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
            Clear Filters
          </button>

          <button
            onClick={exportToExcel}
            style={primaryButtonStyle}
          >
            📥 Export to Excel
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Audit Type</th>
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
                <td style={tdStyle}>
                  <strong>{audit.percentage}%</strong>
                </td>
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
                    onMouseEnter={(e) => e.target.style.background = '#2563EB'}
                    onMouseLeave={(e) => e.target.style.background = '#3B82F6'}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteAudit(audit.id)}
                    style={deleteButtonStyle}
                    onMouseEnter={(e) => e.target.style.background = '#DC2626'}
                    onMouseLeave={(e) => e.target.style.background = '#EF4444'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAudits.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
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
            ← Previous
          </button>

          <span style={{ fontSize: '14px', fontWeight: '600' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{ ...paginationButtonStyle, opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
{/* DETAILS MODAL */}
{showDetails && selectedAudit && (
  <div style={modalOverlayStyle} onClick={() => setShowDetails(false)}>
    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
      <div style={modalHeaderStyle}>
        Audit Details & Comments
      </div>

      <div style={modalItemStyle}>
        <div style={modalLabelStyle}>Date</div>
        <div style={modalValueStyle}>{selectedAudit.date}</div>
      </div>

      <div style={modalItemStyle}>
        <div style={modalLabelStyle}>Audit Type</div>
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
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1E40AF', marginBottom: '15px' }}>
            Section Comments
          </h4>
          {(() => {
            try {
              const notes = JSON.parse(selectedAudit.rawData.notes);
              const sections = notes.sections || {};
              const hasComments = Object.values(sections).some(section => section.comments);

              if (!hasComments) {
                return <p style={{ color: '#999', fontSize: '14px' }}>No comments recorded</p>;
              }

              return Object.entries(sections).map(([sectionCode, sectionData]) => {
                if (!sectionData.comments) return null;

                return (
                  <div key={sectionCode} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E40AF', marginBottom: '8px' }}>
                      Section {sectionCode.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.5', background: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
                      {sectionData.comments}
                    </div>
                  </div>
                );
              });
            } catch (e) {
              return <p style={{ color: '#999', fontSize: '14px' }}>Unable to load comments</p>;
            }
          })()}
        </div>
      )}

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
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
