import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { Store, classKeyOf } from '../store.js';

const STUDENT_NAV = [
  ['/student/dashboard', '', 'Dashboard'],
  ['/student/grades', '', 'Grade Card'],
  ['/student/attendance', '', 'Attendance'],
  ['/student/events', '', 'Events'],
  ['/student/announcements', '', 'Announcements'],
  ['/student/complaints', '', 'Complaints'],
  ['/student/tests', '', 'Upcoming Tests'],
  ['/student/timetable', '', 'Timetable'],
  ['/student/assignments', '', 'Assignments'],
  ['/student/exchange', '', 'Campus Exchange'],
  ['/student/service-requests', '', 'Service Requests'],
  ['/student/messages', '', 'Messages'],
];

const ADMIN_NAV = [
  ['/admin/content', '', 'Public Content'],
];

const TEACHER_NAV = [
  ['/teacher/dashboard', '', 'Dashboard'],
  ['/teacher/roster', '', 'Add Students'],
  ['/teacher/announcements', '', 'Announcements'],
  ['/teacher/events', '', 'Events'],
  ['/teacher/attendance', '', 'Attendance'],
  ['/teacher/grades', '', 'Grade Card'],
  ['/teacher/timetable', '', 'Timetable'],
  ['/teacher/complaints', '', 'Complaints'],
  ['/teacher/assignments', '', 'Assignments'],
  ['/teacher/messages', '', 'Conversations'],
];

export default function Sidebar() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  if (!session) return null;

  const nav = session.role === 'student' ? STUDENT_NAV : session.role === 'teacher' ? TEACHER_NAV : ADMIN_NAV;
  const initials = session.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const studentGroup =
    session.role === 'student'
      ? Store.get('students').find((s) => s.id === session.id)?.group
      : null;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <aside className="app-sidebar">
      <Link
        to={session.role === 'student' ? '/student/profile' : session.role === 'teacher' ? '/teacher/profile' : '/admin/content'}
        className="who"
        style={{ cursor: 'pointer' }}
        title="Edit your profile"
      >
        <div className="who-avatar" style={{ background: 'var(--amber)' }}>
          {initials}
        </div>
        <div>
          <div className="who-name">{session.name}</div>
          <div className="who-role">
            {session.role === 'student'
              ? `STUDENT · ${session.id}${studentGroup ? ` · ${studentGroup}` : ''}`
              : session.role === 'teacher' ? `FACULTY · ${session.id}` : `CONTENT MANAGER · ${session.id}`}
          </div>
        </div>
      </Link>

      <nav className="side-links">
        {nav.map(([to, icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="icon">{icon}</span> {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '2px dashed var(--line-strong)' }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--coral-deep)',
          }}
        >
          <span className="icon"></span> Log out
        </a>
      </div>
    </aside>
  );
}
