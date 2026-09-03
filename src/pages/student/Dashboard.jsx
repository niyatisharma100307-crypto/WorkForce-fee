import { Link } from 'react-router-dom';
import { Store, fmtDate } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';

export default function StudentDashboard() {
  const { session } = useAuth();

  const grades = Store.get('grades').filter((g) => g.studentId === session.id);
  const attendance = Store.get('attendance').filter((a) => a.studentId === session.id);
  const tests = Store.get('tests');
  const events = Store.get('events');
  const assignments = Store.get('assignments').filter(
    (a) => a.studentId === session.id && a.status === 'pending'
  );

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const pct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Welcome back, {session.name.split(' ')[0]}</h1>
          <div className="sub">Here's what's happening across your classes and campus.</div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card stat-sage">
          <div className="icon">✅</div>
          <div className="num">{pct}%</div>
          <div className="label">Overall attendance</div>
        </div>
        <div className="stat-card stat-amber">
          <div className="icon">📝</div>
          <div className="num">{tests.length}</div>
          <div className="label">Upcoming tests</div>
        </div>
        <div className="stat-card stat-coral">
          <div className="icon">📎</div>
          <div className="num">{assignments.length}</div>
          <div className="label">Pending assignments</div>
        </div>
        <div className="stat-card stat-slate">
          <div className="icon">🎉</div>
          <div className="num">{events.length}</div>
          <div className="label">Events this month</div>
        </div>
      </div>

      <div className="dash-grid">
        <div>
          <div className="panel">
            <div className="panel-head">
              <h3>Recent grades</h3>
              <Link to="/student/grades" className="btn btn-sm btn-ghost">
                View grade card
              </Link>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Term</th>
                  <th>Marks</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      No grades posted yet.
                    </td>
                  </tr>
                ) : (
                  grades.slice(0, 4).map((g, i) => (
                    <tr key={i}>
                      <td>{g.subject}</td>
                      <td>{g.term}</td>
                      <td>{g.marks}</td>
                      <td>
                        <strong>{g.grade}</strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Upcoming tests</h3>
              <Link to="/student/tests" className="btn btn-sm btn-ghost">
                See all
              </Link>
            </div>
            {tests.length === 0 ? (
              <div className="empty-state small">No tests scheduled.</div>
            ) : (
              tests.slice(0, 3).map((t) => (
                <div className="list-item" key={t.id}>
                  <div className="bullet"></div>
                  <div>
                    <div className="li-title">{t.subject}</div>
                    <div className="li-meta">
                      {fmtDate(t.date)} · {t.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="panel">
            <div className="panel-head">
              <h3>Campus events</h3>
            </div>
            {events.slice(0, 3).map((e) => (
              <div className="list-item" key={e.id}>
                <div className="bullet" style={{ background: 'var(--sage)' }}></div>
                <div>
                  <div className="li-title">{e.title}</div>
                  <div className="li-meta">
                    {fmtDate(e.date)} · {e.location}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Pending assignments</h3>
            </div>
            {assignments.length === 0 ? (
              <div className="empty-state small">All caught up — nothing pending 🎉</div>
            ) : (
              assignments.map((a) => (
                <div className="list-item" key={a.id}>
                  <div className="bullet" style={{ background: 'var(--coral)' }}></div>
                  <div>
                    <div className="li-title">{a.title}</div>
                    <div className="li-meta">
                      {a.subject} · due {fmtDate(a.due)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
