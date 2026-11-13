import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { ROLE_LABELS } from '../format.js';

const WORDS = [
  { to: '/requests', label: 'Requests', end: true },
  { to: '/approvals', label: 'Approvals', roles: ['manager', 'admin'] },
  { to: '/queue', label: 'Queue', roles: ['it_support', 'admin'] },
  { to: '/reports', label: 'Reports', roles: ['manager', 'it_support', 'admin'] },
];

const ADMIN = [
  { to: '/admin/requests', label: 'All requests', text: 'Every request, every department' },
  { to: '/admin/software', label: 'Catalog', text: 'Titles and license counts' },
  { to: '/admin/users', label: 'Users', text: 'Roles, departments, access' },
  { to: '/admin/audit', label: 'Audit log', text: 'Who changed what, and when' },
];

function Chevron() {
  return (
    <svg className="nav__chev" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 4.5 6 7.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const words = WORDS.filter((w) => !w.roles || w.roles.includes(user.role));
  const isAdmin = user.role === 'admin';
  const inAdmin = location.pathname.startsWith('/admin');

  useEffect(() => setMenuOpen(false), [location.pathname]);

  async function signOut() {
    await logout();
    navigate('/login');
  }

  return (
    <>
      <header className="nav">
        <div className="wrap">
          <a className="skip-link" href="#main">Skip to content</a>
          <Link to="/" className="brand" aria-label="Software Requests, home">
            <span className="mark" aria-hidden="true" />
            Software Requests
          </Link>

          <nav className="nav__words" aria-label="Main">
            {words.map((w) => (
              <div className="nav__item" key={w.to}>
                <NavLink to={w.to} end={w.end} className="nav__link">
                  {w.label}
                </NavLink>
              </div>
            ))}
            {isAdmin && (
              <div className="nav__item">
                <Link to="/admin/requests" className="nav__link" aria-current={inAdmin ? 'page' : undefined} aria-haspopup="true">
                  Admin <Chevron />
                </Link>
                <div className="nav__panel">
                  <div className="wrap nav__panel-grid">
                    {ADMIN.map((a) => (
                      <NavLink key={a.to} to={a.to}>
                        <strong>{a.label}</strong>
                        <span>{a.text}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </nav>

          <div className="nav__end">
            <p className="nav__who">
              {user.name}
              <span>{ROLE_LABELS[user.role]}{user.departmentName ? `, ${user.departmentName}` : ''}</span>
            </p>
            <button type="button" className="text-button nav__signout" onClick={signOut}>Sign out</button>
            <Link to="/requests/new" className="btn btn--primary btn--go">Request software</Link>
            <button
              type="button"
              className="nav__toggle"
              aria-expanded={menuOpen}
              aria-controls="sheet"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg viewBox="0 0 18 18" aria-hidden="true">
                {menuOpen
                  ? <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  : <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="sheet" id="sheet">
          <p className="label">{user.name}, {ROLE_LABELS[user.role]}</p>
          {words.map((w) => <NavLink key={w.to} to={w.to} end={w.end}>{w.label}</NavLink>)}
          {isAdmin && (
            <>
              <p className="label sheet__group">Admin</p>
              {ADMIN.map((a) => <NavLink key={a.to} to={a.to}>{a.label}</NavLink>)}
            </>
          )}
          <button type="button" className="sheet__row" onClick={signOut}>Sign out</button>
          <Link to="/requests/new" className="btn btn--primary btn--go">Request software</Link>
        </div>
      )}

      <main id="main" className="app-main">
        <div className="wrap">
          <Outlet />
        </div>
      </main>
    </>
  );
}
