import React from 'react';

const Navbar = ({ user }) => {
  const navbarStyle = {
    background: '#1E40AF',
    color: 'white',
    padding: '16px 30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    borderBottom: '3px solid #10B981'
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1600px',
    margin: '0 auto'
  };

  const brandStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    minWidth: '300px'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  };

  const companyNameStyle = {
    fontSize: '11px',
    color: '#dbeafe',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  };

  const centerStyle = {
    flex: 1,
    textAlign: 'center',
    paddingX: '20px'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '0.3px'
  };

  const rightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    minWidth: '250px',
    justifyContent: 'flex-end'
  };

  const userMenuStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const userNameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#dbeafe'
  };

  const logoutBtnStyle = {
    backgroundColor: '#DC2626',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
  };

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        <div style={brandStyle}>
          <div style={logoStyle}>
            <span style={{ fontSize: '22px' }}>■</span>
            <span></span>
          </div>
          <span style={companyNameStyle}>Capwell Industries Limited</span>
        </div>

        <div style={centerStyle}>
          <h1 style={titleStyle}>
            6S Digital Audit Management System
          </h1>
        </div>

        <div style={rightStyle}>
          <div style={userMenuStyle}>
            <span style={userNameStyle}>
              {user?.name || 'Auditor'}
            </span>
            <button 
              style={logoutBtnStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#B91C1C';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#DC2626';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
