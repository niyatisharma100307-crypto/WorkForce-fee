import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const PUBLIC_LINKS = [
  ['/', 'Home'],
  ['/campus-guide', 'Campus Guide'],
  ['/study-zone', 'Study Zone'],
  ['/junior-hub', 'Junior Hub'],
  ['/opportunities', 'Opportunities'],
  ['/clubs', 'Clubs'],
  ['/campus-updates', 'Updates'],
  ['/emergency', 'Emergency'],
];

export default function Nav() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <div className="passbar">
        <div className="wrap">
          <span>ONE PLACE FOR CLASSES, CLUBS &amp; EVERYTHING ELSE</span>
          <span className="passbar-status">
            <span className="status-dot"></span> ALL SYSTEMS RUNNING
          </span>
        </div>
      </div>

      <header className="nav">
        <div className="wrap">
          <Link to="/" className="brand">
            <span className="chip">W</span> Workforce
          </Link>

          <nav className="nav-links">
            {PUBLIC_LINKS.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-cta">
            {session ? (
              <>
                <Link
                  to={session.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'}
                  className="btn btn-sm btn-ghost"
                >
                  {session.name.split(' ')[0]}
                </Link>
                <button className="btn btn-sm btn-primary" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-ghost">
                  Log in
                </Link>
                <Link to="/signup" className="btn btn-sm btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="nav-toggle"
            aria-label="Menu"
            onClick={() => document.querySelector('.nav-links')?.classList.toggle('open')}
          >
            ☰
          </button>
        </div>
      </header>
    </>
  );
}
