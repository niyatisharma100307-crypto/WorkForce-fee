import { useState } from 'react';
import { Store, fmtDate } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';

export default function TeacherAnnouncements() {
  const { session } = useAuth();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [list, setList] = useState(() =>
    Store.get('announcements').filter((a) => a.teacherId === session.id).reverse()
  );

  function refresh() {
    setList(Store.get('announcements').filter((a) => a.teacherId === session.id).reverse());
  }

  function handleSubmit(e) {
    e.preventDefault();
    Store.push('announcements', {
      id: Store.uid('a'),
      title: title.trim(),
      body: body.trim(),
      teacherId: session.id,
      date: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(false);
    setTitle('');
    setBody('');
    toast('Announcement posted');
    refresh();
  }

  function del(id) {
    if (!window.confirm('Delete this announcement? This can\'t be undone.')) return;
    Store.remove('announcements', (a) => a.id === id);
    toast('Deleted');
    refresh();
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Announcements</h1>
          <div className="sub">Post something all your students will see.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + New announcement
        </button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          
          Nothing posted yet.
        </div>
      ) : (
        list.map((a) => (
          <div className="panel" key={a.id}>
            <div className="panel-head">
              <h3>{a.title}</h3>
              <div className="flex-gap">
                <span className="small muted mono">{fmtDate(a.date)}</span>
                <button className="btn btn-sm btn-ghost" onClick={() => del(a.id)}>
                  Delete
                </button>
              </div>
            </div>
            <p className="small">{a.body}</p>
          </div>
        ))
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New announcement">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label>Details</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required></textarea>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Post
          </button>
        </form>
      </Modal>
    </>
  );
}
