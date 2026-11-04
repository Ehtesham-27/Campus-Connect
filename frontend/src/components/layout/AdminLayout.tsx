import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Shield, Users, Building, Radio, Award, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Badge } from '../ui/Badge';

const adminNavItems = [
  { path: '/admin', label: 'Overview', icon: <Shield size={18} /> },
  { path: '/admin/students', label: 'Students', icon: <Users size={18} /> },
  { path: '/admin/communities', label: 'Communities', icon: <Building size={18} /> },
  { path: '/admin/feed', label: 'Feed Moderation', icon: <Radio size={18} /> },
  { path: '/admin/opportunities', label: 'Opportunities', icon: <Award size={18} /> },
  { path: '/admin/reports', label: 'Reports', icon: <AlertTriangle size={18} /> },
];

export const AdminLayout: React.FC = () => {
  return (
    <div className="cc-shell" style={{ backgroundColor: '#102A43', color: '#F0F4F8' }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          backgroundColor: '#0A1C2E',
          borderRight: 'var(--border-heavy) solid var(--color-ink-black)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
        <div style={{ padding: 'var(--space-6) var(--space-5)', borderBottom: 'var(--border-thick) solid #243B53' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#FFFFFF' }}>
              CAMPUS CONNECT
            </h2>
          </div>
          <div style={{ marginTop: '0.4rem' }}>
            <Badge variant="yellow" size="sm" sticker rotate="right">
              ADMIN CONTROL PANEL
            </Badge>
          </div>
        </div>

        <nav style={{ flex: 1, padding: 'var(--space-5) var(--space-3)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {adminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: isActive ? 'var(--color-primary-text)' : '#829AB1',
                backgroundColor: isActive ? 'var(--color-bright-yellow)' : 'transparent',
                border: isActive ? '2px solid var(--color-ink-black)' : '2px solid transparent',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                transition: 'var(--transition-fast)',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 'var(--space-4)', borderTop: 'var(--border-thick) solid #243B53' }}>
          <NavLink
            to="/app"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#9FB3C8',
              textDecoration: 'none',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} /> <span>Back to Student App</span>
          </NavLink>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main style={{ flex: 1, padding: 'var(--space-8)', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};
