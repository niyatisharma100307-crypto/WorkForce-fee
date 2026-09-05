import { useState } from 'react';
import { Store, fmtDate } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';

export default function StudentAssignments() {
  const { session } = useAuth();
  const toast = useToast();
  const [assignments, setAssignments] = useState(() =>
    Store.get('assignments').filter((a) => a.studentId === session.id)
  );

  function markDone(id) {
    Store.update('assignments', (a) => a.id === id, (a) => ({ ...a, status: 'done' }));
    toast('Marked as done');
    setAssignments(Store.get('assignments').filter((a) => a.studentId === session.id));
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Assignments</h1>
          <div className="sub">Work assigned to you individually by your teachers.</div>
        </div>
      </div>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    
                    No assignments yet.
                  </div>
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.subject}</td>
                  <td>{fmtDate(a.due)}</td>
                  <td>
                    <span className={`status-pill status-${a.status === 'pending' ? 'pending' : 'resolved'}`}>
                      {a.status === 'pending' ? 'Pending' : 'Done'}
                    </span>
                  </td>
                  <td>
                    {a.status === 'pending' ? (
                      <button className="btn btn-sm btn-sage" onClick={() => markDone(a.id)}>
                        Mark done
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
