import React, { useState } from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ currentPage, setCurrentPage, isAdmin, userRole }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Base menu items (visible to all)
  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'audit', label: 'New Audit', icon: '📝' },
    { id: 'audits', label: 'Audit History', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'actionItems', label: 'Action Items', icon: '✓' },
    { id: 'teams', label: 'Teams', icon: '👥' }
  ];

  // Admin menu item (only for admin/coordinator)
  const adminMenuItem = { id: 'admin', label: 'Admin Panel', icon: '⚙️' };

  // Combine menu items based on user role
  const menuItems = isAdmin ? [...baseMenuItems, adminMenuItem] : baseMenuItems;

  return (
    <aside className="sidebar sidebar-compact">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <div
            key={item.id}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
            </button>

            {/* Tooltip on hover */}
            {hoveredItem === item.id && (
              <div className="nav-tooltip">{item.label}</div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-text">
          <p>6S</p>
          {userRole && (
            <span style={{ fontSize: '10px', color: '#999', marginTop: '4px', display: 'block' }}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
