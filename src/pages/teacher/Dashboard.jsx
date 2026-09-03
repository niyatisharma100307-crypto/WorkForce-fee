import { Link } from 'react-router-dom';
import { Store, fmtDate, rosterForTeacher } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';

export default function TeacherDashboard() {
  const { session } = useAuth();

  const students = rosterForTeacher(session.id);
  const studentIds = students.map((s) => s.id);
  const announcements = Store.get('announcements').filter((a) => a.teacherId === session.id);
  const assignments = Store.get('assignments').filter((a) => a.teacherId === session.id);
  const complaints = Store.get('complaints').filter(
    (c) => studentIds.includes(c.studentId) && c.status === 'open'
  );

  const greetName = session.name.split(' ')[1] || session.name;

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Welcome back, {greetName}</h1>
          <div className="sub">A quick look at your classes today.</div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card stat-sage">
          <div className="icon">👥</div>
          <div className="num">{students.length}</div>
          <div className="label">Students in your class</div>
        </div>
        <div className="stat-card stat-amber">
          <div className="icon">📣</div>
          <div className="num">{announcements.length}</div>
          <div className="label">Announcements posted</div>
        </div>
        <div className="stat-card stat-coral">
          <div className="icon">📎</div>
          <div className="num">{assignments.filter((a) => a.status === 'pending').length}</div>
          <div className="label">Assignments pending review</div>
        </div>
        <Link to="/teacher/complaints" className="stat-card stat-slate" style={{ display: 'block' }}>
          <div className="icon">📮</div>
          <div className="num">{complaints.length}</div>
          <div className="label">Open complaints</div>
        </Link>
      </div>

      <div className="dash-grid">
        <div>
          <div className="panel">
            <div className="panel-head">
              <h3>Your recent announcements</h3>
              <Link to="/teacher/announcements" className="btn btn-sm btn-ghost">
                Manage
              </Link>
            </div>
            {announcements.length === 0 ? (
              <div className="empty-state small">No announcements posted yet.</div>
            ) : (
              announcements.slice(0, 3).map((a) => (
                <div className="list-item" key={a.id}>
                  <div className="bullet"></div>
                  <div>
                    <div className="li-title">{a.title}</div>
                    <div className="li-meta">{fmtDate(a.date)}</div>
                    <div className="li-desc">{a.body}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="panel">
            <div className="panel-head">
              <h3>Assignments you've set</h3>
              <Link to="/teacher/assignments" className="btn btn-sm btn-ghost">
                Manage
              </Link>
            </div>
            {assignments.length === 0 ? (
              <div className="empty-state small">No assignments set yet.</div>
            ) : (
              assignments.slice(0, 4).map((a) => {
                const student = students.find((s) => s.id === a.studentId);
                return (
                  <div className="list-item" key={a.id}>
                    <div className="bullet" style={{ background: 'var(--sage)' }}></div>
                    <div>
                      <div className="li-title">{a.title}</div>
                      <div className="li-meta">
                        {student ? student.name : a.studentId} · due {fmtDate(a.due)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div>
          <div className="panel">
            <div className="panel-head">
              <h3>Quick actions</h3>
            </div>
            <div className="flex" style={{ flexDirection: 'column', gap: 10 }}>
              <Link to="/teacher/attendance" className="btn btn-primary btn-block">
                Mark attendance
              </Link>
              <Link to="/teacher/grades" className="btn btn-sage btn-block">
                Update grade card
              </Link>
              <Link to="/teacher/timetable" className="btn btn-ghost btn-block">
                Edit timetable
              </Link>
              <Link to="/teacher/assignments" className="btn btn-sage btn-block">
                Assign work
              </Link>
              <Link to="/teacher/complaints" className="btn btn-ghost btn-block">
                Review complaints
              </Link>
              <Link to="/teacher/messages" className="btn btn-ink btn-block">
                Message a student
              </Link>
              <Link to="/teacher/announcements" className="btn btn-ghost btn-block">
                Post announcement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
