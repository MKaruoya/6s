import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AuditForm from './AuditForm';
import Dashboard from './Dashboard';
import AuditHistory from './AuditHistory';
import Reports from './Reports';
import AdminPanel from './AdminPanel';

const MainLayout = () => {
  const [currentPage, setCurrentPage] = useState('audit');
  const [user] = useState({ name: 'Mercy Karuoya', role: 'Auditor' });

  const placeholderStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    fontSize: '18px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' }}>
      <Navbar user={user} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main style={{ flex: 1, overflowY: 'auto', background: '#f5f5f5' }}>
          {currentPage === 'audit' && <AuditForm key="audit-form" />}
          {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'audits' && <AuditHistory />}
         {currentPage === 'reports' && <Reports />}

          {currentPage === 'teams' && <div style={placeholderStyle}>Teams (Coming Soon)</div>}
          {currentPage === 'admin' && <AdminPanel />}

        </main>
      </div>
    </div>
  );
};

export default MainLayout;




