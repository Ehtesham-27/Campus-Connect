import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Users2,
  Radio,
  Sparkles,
  Rocket,
  BookOpen,
  UserCheck,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  User as UserIcon,
  Flame,
} from 'lucide-react';
import { NavItem } from './NavItem';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../features/auth/AuthContext';

// Exact order required by specification
const studentNavItems = [
  { path: '/app/discover', label: 'Discover', icon: <Compass size={20} />, badge: 'NEW' },
  { path: '/app/communities', label: 'Communities', icon: <Users2 size={20} />, badge: undefined },
  { path: '/app/feed', label: 'Campus Feed', icon: <Radio size={20} />, badge: 'LIVE' },
  { path: '/app/opportunities', label: 'Opportunities', icon: <Sparkles size={20} />, badge: 'HOT' },
  { path: '/app/team-finder', label: 'Team Finder', icon: <Rocket size={20} />, badge: undefined },
  { path: '/app/study-circles', label: 'Study Circles', icon: <BookOpen size={20} />, badge: undefined },
  { path: '/app/connections', label: 'Connections', icon: <UserCheck size={20} />, badge: undefined },
];

export const StudentLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CC';

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/app/discover?search=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch('');
    }
  };

  // Determine current page context title
  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes('/app/discover')) return { title: 'Discover Students', badge: 'PEOPLE' };
    if (path.includes('/app/communities')) return { title: 'College Communities', badge: 'CLUBS' };
    if (path.includes('/app/feed')) return { title: 'Campus Feed', badge: 'ANNOUNCEMENTS' };
    if (path.includes('/app/opportunities')) return { title: 'Campus Opportunities', badge: 'CAREER' };
    if (path.includes('/app/team-finder')) return { title: 'Team Finder', badge: 'HACKATHONS' };
    if (path.includes('/app/study-circles')) return { title: 'Study Circles', badge: 'LEARNING' };
    if (path.includes('/app/connections')) return { title: 'My Network', badge: 'CONNECTIONS' };
    if (path.includes('/app/profile')) return { title: 'Student Profile', badge: 'ACCOUNT' };
    if (path.includes('/app/settings')) return { title: 'Settings', badge: 'PREFERENCES' };
    return { title: 'Campus Hub', badge: 'DASHBOARD' };
  };

  const pageContext = getPageContext();

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="cc-shell">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`cc-backdrop ${mobileMenuOpen ? 'cc-backdrop-visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ====================================================================
          SIDEBAR
         ==================================================================== */}
      <aside className={`cc-sidebar ${mobileMenuOpen ? 'cc-sidebar-open' : ''}`}>
        {/* Brand Wordmark Header */}
        <div className="cc-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <NavLink to="/app" className="cc-sidebar-brand" onClick={() => setMobileMenuOpen(false)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="cc-sidebar-brand-title">CAMPUS CONNECT</span>
              </div>
              <span className="cc-sidebar-brand-subtitle">
                YOUR CAMPUS. YOUR PEOPLE.
              </span>
            </NavLink>

            {/* Mobile Close Button */}
            <button
              type="button"
              className="cc-mobile-toggle"
              style={{ padding: '0.25rem' }}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
            >
              <X size={22} />
            </button>
          </div>

          {/* Quick Hub Sticker Link */}
          <div style={{ marginTop: '0.75rem' }}>
            <NavLink
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.75rem',
                fontWeight: 800,
                textDecoration: 'none',
                textTransform: 'uppercase',
                backgroundColor: isActive ? 'var(--color-electric-blue)' : 'var(--color-white)',
                color: isActive ? 'var(--color-white)' : 'var(--color-ink-black)',
                border: 'var(--border-thin) solid var(--color-ink-black)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-xs)',
              })}
            >
              <Flame size={13} />
              <span>Campus Hub Dashboard</span>
            </NavLink>
          </div>
        </div>

        {/* Seven Core Navigation Items (in exact documented order) */}
        <nav className="cc-sidebar-nav">
          <span className="cc-sidebar-section-title">Seven Core Modules</span>

          {studentNavItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              badgeCount={item.badge}
              badgeVariant={item.badge === 'LIVE' ? 'orange' : item.badge === 'HOT' ? 'yellow' : 'pink'}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>

        {/* Sidebar Footer with Account & Logout */}
        <div className="cc-sidebar-footer">
          <NavLink
            to="/app/profile"
            className="cc-user-card"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Avatar src={user?.profileImage} initials={userInitials} size="md" shape="rounded" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 800,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.fullName || 'Student'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  color: 'var(--color-ink-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.course || 'Degree Enrolled'}{user?.branch ? ` • ${user.branch}` : ''}
              </div>
            </div>
          </NavLink>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <NavLink
              to="/app/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="cc-btn cc-btn-outline cc-btn-sm"
              style={{ flex: 1, textDecoration: 'none' }}
              title="Settings"
            >
              <Settings size={14} />
              <span>Settings</span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="cc-btn cc-btn-yellow cc-btn-sm"
              title="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================================================
          TOPBAR & CONTENT AREA
         ==================================================================== */}
      <div className="cc-content-wrapper">
        <header className="cc-topbar">
          <div className="cc-topbar-left">
            {/* Hamburger Button for Mobile */}
            <button
              type="button"
              className="cc-mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={24} />
            </button>

            {/* Current Context Heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                {pageContext.title}
              </span>
              <Badge variant="yellow" size="sm" sticker rotate="right">
                {pageContext.badge}
              </Badge>
            </div>
          </div>

          <div className="cc-topbar-right">
            {/* Search Entry Point */}
            <form onSubmit={handleGlobalSearch} className="cc-topbar-search">
              <Search size={16} color="var(--color-ink-muted)" />
              <input
                type="text"
                placeholder="Search students, skills, opps..."
                aria-label="Search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </form>

            {/* Notification Bell */}
            <button
              type="button"
              className="cc-btn cc-btn-outline cc-btn-sm"
              style={{ padding: '0.55rem', borderRadius: 'var(--radius-full)' }}
              title="Campus notifications"
              onClick={() => alert('All campus notifications are up to date. Explore the Campus Feed for the latest notices!')}
            >
              <Bell size={17} />
            </button>

            {/* Profile Avatar Dropdown Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Account menu"
              >
                <Avatar
                  src={user?.profileImage}
                  initials={userInitials}
                  size="md"
                  shape="rounded"
                />
              </button>

              {/* Account Dropdown Menu */}
              {accountMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    width: '230px',
                    backgroundColor: 'var(--color-white)',
                    border: 'var(--border-thick) solid var(--color-ink-black)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 'var(--space-3)',
                    zIndex: 50,
                  }}
                >
                  <div
                    style={{
                      paddingBottom: 'var(--space-3)',
                      borderBottom: 'var(--border-thin) solid var(--color-ink-black)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem' }}>
                      {user?.fullName || 'Student Account'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                      {user?.email || ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <NavLink
                      to="/app/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="cc-nav-item"
                      style={{ padding: '0.45rem 0.65rem' }}
                    >
                      <UserIcon size={15} /> <span>View Profile</span>
                    </NavLink>
                    <NavLink
                      to="/app/settings"
                      onClick={() => setAccountMenuOpen(false)}
                      className="cc-nav-item"
                      style={{ padding: '0.45rem 0.65rem' }}
                    >
                      <Settings size={15} /> <span>Settings</span>
                    </NavLink>

                    <div style={{ borderTop: 'var(--border-thin) solid var(--color-ink-black)', margin: '0.25rem 0' }} />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="cc-nav-item"
                      style={{
                        padding: '0.45rem 0.65rem',
                        color: 'var(--color-hot-pink)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        justifyContent: 'flex-start',
                      }}
                    >
                      <LogOut size={15} /> <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="cc-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
