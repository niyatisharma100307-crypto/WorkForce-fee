import { useState } from 'react';
import { Store, fmtDate, rosterForTeacher, getTeacherClasses } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal.jsx';

export default function TeacherAssignments() {
  const { session } = useAuth();
  const toast = useToast();
  const students = rosterForTeacher(session.id);
  const myClasses = getTeacherClasses(session.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [studentId, setStudentId] = useState(students[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [due, setDue] = useState('');
  const [assignments, setAssignments] = useState(() =>
    Store.get('assignments').filter((a) => a.teacherId === session.id).reverse()
  );

  function refresh() {
    setAssignments(Store.get('assignments').filter((a) => a.teacherId === session.id).reverse());
  }

  function handleSubmit(e) {
    e.preventDefault();
    Store.push('assignments', {
      id: Store.uid('as'),
      studentId,
      title: title.trim(),
      subject: subject.trim(),
      due,
      status: 'pending',
      teacherId: session.id,
    });
    setModalOpen(false);
    setTitle('');
    setSubject('');
    setDue('');
    toast('Assignment given');
    refresh();
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Assignments</h1>
          <div className="sub">Assign different work to each student individually.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={students.length === 0}>
          + Assign work
        </button>
      </div>

      {students.length === 0 && (
        <div className="empty-state mb-24">
          
          {myClasses.length === 0 ? (
            <>You aren't assigned to a class yet — update this from your profile.</>
          ) : (
            <>
              Your class doesn't have any students yet.{' '}
              <Link to="/teacher/roster" style={{ textDecoration: 'underline', fontWeight: 700 }}>
                Add students →
              </Link>
            </>
          )}
        </div>
      )}

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Title</th>
              <th>Subject</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    
                    No assignments given yet.
                  </div>
                </td>
              </tr>
            ) : (
              assignments.map((a) => {
                const student = students.find((s) => s.id === a.studentId);
                return (
                  <tr key={a.id}>
                    <td>{student ? student.name : a.studentId}</td>
                    <td>{a.title}</td>
                    <td>{a.subject}</td>
                    <td>{fmtDate(a.due)}</td>
                    <td>
                      <span className={`status-pill status-${a.status === 'pending' ? 'pending' : 'resolved'}`}>
                        {a.status === 'pending' ? 'Pending' : 'Done'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Assign work">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Student</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Title</label>
            <input
              placeholder="e.g. Binary Search Tree implementation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="field">
            <label>Due date</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Assign
          </button>
        </form>
      </Modal>
    </>
  );
}
