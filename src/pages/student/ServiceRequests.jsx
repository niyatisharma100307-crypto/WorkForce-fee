import { useState } from 'react';
import { Store, fmtDate } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';

const SERVICE_TYPES = [
  'Bonafide Certificate',
  'New ID Card',
  'Lost/Damaged ID Replacement',
  'Fee Receipt',
  'Transcript',
  'Migration Certificate',
  'Enrollment Letter',
];

export default function StudentServiceRequests() {
  const { session } = useAuth();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState(SERVICE_TYPES[0]);
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState(() =>
    Store.get('serviceRequests').filter((r) => r.studentId === session.id).reverse()
  );

  function refresh() {
    setRequests(Store.get('serviceRequests').filter((r) => r.studentId === session.id).reverse());
  }

  function handleSubmit(e) {
    e.preventDefault();
    Store.push('serviceRequests', {
      id: Store.uid('sr'),
      studentId: session.id,
      type,
      reason: reason.trim(),
      status: 'pending',
      date: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(false);
    setReason('');
    setType(SERVICE_TYPES[0]);
    toast('Request submitted');
    refresh();
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Service Requests</h1>
          <div className="sub">Request official documents and track their status here.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + New request
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📄</div>
          No requests yet. Need a bonafide certificate or a new ID card? Start here.
        </div>
      ) : (
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Reason</th>
                <th>Requested</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.type}</td>
                  <td>{r.reason || '—'}</td>
                  <td>{fmtDate(r.date)}</td>
                  <td>
                    <span className={`status-pill status-${r.status === 'pending' ? 'pending' : 'resolved'}`}>
                      {r.status === 'pending' ? 'Pending' : 'Ready'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New service request">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>What do you need?</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {SERVICE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Reason (optional)</label>
            <input
              placeholder="e.g. For bank account opening"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Submit request
          </button>
        </form>
      </Modal>
    </>
  );
}
