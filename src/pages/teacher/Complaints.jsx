import { useState } from 'react';
import { Store, fmtDate, rosterForTeacher } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';

const FILTERS = ['Open', 'Resolved', 'All'];

export default function TeacherComplaints() {
  const { session } = useAuth();
  const toast = useToast();
  const students = rosterForTeacher(session.id);
  const studentIds = students.map((s) => s.id);

  const [filter, setFilter] = useState('Open');
  const [complaints, setComplaints] = useState(() =>
    Store.get('complaints').filter((c) => studentIds.includes(c.studentId)).reverse()
  );

  function refresh() {
    setComplaints(Store.get('complaints').filter((c) => studentIds.includes(c.studentId)).reverse());
  }

  function setStatus(id, status) {
    Store.update('complaints', (c) => c.id === id, (c) => ({ ...c, status }));
    toast(status === 'resolved' ? 'Marked as resolved' : 'Reopened');
    refresh();
  }

  const visible =
    filter === 'All' ? complaints : complaints.filter((c) => c.status === filter.toLowerCase());

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Complaints</h1>
          <div className="sub">Issues raised by students in your class.</div>
        </div>
      </div>

      {students.length === 0 && (
        <div className="empty-state mb-24">
          <div className="emoji">🏫</div>
          You aren't assigned to a class yet, so there are no complaints to review.
        </div>
      )}

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📮</div>
          {filter === 'Open' ? 'No open complaints — all clear.' : 'Nothing here yet.'}
        </div>
      ) : (
        visible.map((c) => {
          const student = students.find((s) => s.id === c.studentId);
          return (
            <div className="panel" key={c.id}>
              <div className="panel-head">
                <div className="flex-gap">
                  <span className="tag tag-outline">{c.category}</span>
                  <span className={`status-pill status-${c.status}`}>
                    {c.status === 'open' ? 'Open' : 'Resolved'}
                  </span>
                </div>
                <span className="small muted mono">{fmtDate(c.date)}</span>
              </div>
              <p className="small muted mb-8">
                From {student ? student.name : c.studentId}
              </p>
              <p className="small">{c.text}</p>
              <div className="mt-16">
                {c.status === 'open' ? (
                  <button className="btn btn-sm btn-sage" onClick={() => setStatus(c.id, 'resolved')}>
                    Mark resolved
                  </button>
                ) : (
                  <button className="btn btn-sm btn-ghost" onClick={() => setStatus(c.id, 'open')}>
                    Reopen
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
