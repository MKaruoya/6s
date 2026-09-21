import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const navbarStyle = {
    background: '#FFFFFF',
    color: '#2C3E50',
    padding: '16px 40px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    borderBottom: '2px solid #FFD54F',
    position: 'sticky',
    top: 0,
    zIndex: 100
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1800px',
    margin: '0 auto'
  };

  const brandStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 'fit-content'
  };

  const logoStyle = {
    fontSize: '20px',
    fontWeight: '800',
    color: '#2C3E50',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const rightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    minWidth: 'fit-content'
  };

  const userMenuStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingLeft: '24px',
    borderLeft: '1px solid #E8EAED'
  };

  const userNameStyle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#2C3E50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const userRoleStyle = {
    fontSize: '11px',
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const logoutBtnStyle = {
    backgroundColor: '#E74C3C',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        {/* Brand */}
        <div style={brandStyle}>
          <div style={logoStyle}>6S</div>
        </div>

        {/* User Menu */}
        <div style={rightStyle}>
          <div style={userMenuStyle}>
            <div>
              <div style={userNameStyle}>{user?.name || 'User'}</div>
              <div style={userRoleStyle}>{user?.role || 'Auditor'}</div>
            </div>

            <button 
              onClick={handleLogout}
              style={logoutBtnStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#C0392B';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#E74C3C';
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
