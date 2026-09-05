import { useState } from 'react';
import { Store, fmtDate } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';

export default function StudentComplaints() {
  const { session } = useAuth();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('Hostel');
  const [text, setText] = useState('');
  const [complaints, setComplaints] = useState(() =>
    Store.get('complaints').filter((c) => c.studentId === session.id).reverse()
  );

  function refresh() {
    setComplaints(Store.get('complaints').filter((c) => c.studentId === session.id).reverse());
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    Store.push('complaints', {
      id: Store.uid('c'),
      studentId: session.id,
      category,
      text: trimmed,
      status: 'open',
      date: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(false);
    setText('');
    setCategory('Hostel');
    toast('Complaint submitted');
    refresh();
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Complaints</h1>
          <div className="sub">Report an issue — hostel, mess, facilities, or anything else.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + New complaint
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          
          No complaints filed yet. If something's wrong, let us know.
        </div>
      ) : (
        complaints.map((c) => (
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
            <p className="small">{c.text}</p>
          </div>
        ))
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New complaint">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Hostel</option>
              <option>Mess / Food</option>
              <option>Academics</option>
              <option>Infrastructure</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label>What's the issue?</label>
            <textarea
              placeholder="Describe it clearly so it can be resolved faster..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Submit complaint
          </button>
        </form>
      </Modal>
    </>
  );
}
