import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AuditForm from './AuditForm';
import Dashboard from './Dashboard';
import AuditHistory from './AuditHistory';
import Reports from './Reports';
import ActionItemsList from './ActionItems/ActionItemsList';
import AdminPanel from './AdminPanel';

const MainLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Check if user is admin or coordinator
  const isAdmin = user && (user.role === 'admin' || user.role === 'coordinator');

  const placeholderStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    fontSize: '18px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  if (loading) {
    return <div style={placeholderStyle}>Loading...</div>;
  }

  if (!user) {
    return <div style={placeholderStyle}>User not found. Please login again.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' }}>
      <Navbar user={user} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          isAdmin={isAdmin}
          userRole={user.role}
        />
        <main style={{ flex: 1, overflowY: 'auto', background: '#f5f5f5' }}>
          {currentPage === 'audit' && <AuditForm key="audit-form" user={user} />}
          {currentPage === 'dashboard' && <Dashboard user={user} />}
          {currentPage === 'audits' && <AuditHistory user={user} />}
          {currentPage === 'reports' && <Reports user={user} />}
          {currentPage === 'actionItems' && <ActionItemsList />}
          {currentPage === 'teams' && <div style={placeholderStyle}>Teams (Coming Soon)</div>}
          {currentPage === 'admin' && isAdmin && <AdminPanel user={user} />}
          {currentPage === 'admin' && !isAdmin && <div style={placeholderStyle}>Access Denied - Admin Only</div>}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
