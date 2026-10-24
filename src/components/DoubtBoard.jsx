import { useState, useEffect } from 'react';
import { Store, fmtDate, courseClassLabel } from '../store.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './Toast.jsx';
import Modal from './Modal.jsx';

const emptyForm = { title: '', detail: '', anonymous: false };

function nameOf(id, role) {
  const table = role === 'teacher' ? 'teachers' : 'students';
  return (Store.get(table) || []).find((p) => p.id === id)?.name || id;
}

/**
 * Shared Class Doubt Queue.
 * role="student": post doubts, upvote, reply to peers.
 * role="teacher": same board for the teacher's own course classes, plus a
 *                 "teacher answer" badge and Resolve button.
 */
export default function DoubtBoard({ role, courseClasses }) {
  const { session } = useAuth();
  const toast = useToast();
  const isTeacher = role === 'teacher';

  // Teachers start on "All my subjects" so a new doubt is never hidden behind another subject.
  const [courseClassId, setCourseClassId] = useState(isTeacher ? 'all' : courseClasses[0]?.id || '');
  const [filter, setFilter] = useState('open');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [replyText, setReplyText] = useState({});
  const [doubts, setDoubts] = useState(() => Store.get('doubts') || []);

  const refresh = () => {
    const next = Store.get('doubts') || [];
    // Only re-render when something actually changed.
    setDoubts((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  };

  // Keep the board live: the other role may have posted from another tab/window.
  useEffect(() => {
    const onStorage = () => refresh();
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, []);

  const myClassIds = courseClasses.map((cc) => cc.id);
  const openCount = (ccId) => doubts.filter((d) => d.courseClassId === ccId && d.status === 'open').length;
  const courseName = (ccId) => courseClasses.find((cc) => cc.id === ccId)?.course || '';

  const visible = doubts
    .filter((d) => (courseClassId === 'all' ? myClassIds.includes(d.courseClassId) : d.courseClassId === courseClassId))
    .filter((d) => filter === 'all' || d.status === filter)
    .sort((a, b) => (b.upvotes.length - a.upvotes.length) || (new Date(b.date) - new Date(a.date)));

  function postDoubt(e) {
    e.preventDefault();
    Store.push('doubts', {
      id: Store.uid('db'),
      courseClassId,
      studentId: session.id,
      title: form.title.trim(),
      detail: form.detail.trim(),
      anonymous: form.anonymous,
      date: new Date().toISOString().slice(0, 10),
      upvotes: [],
      status: 'open',
      replies: [],
    });
    setModalOpen(false);
    setForm(emptyForm);
    toast('Doubt posted');
    refresh();
  }

  function toggleUpvote(id) {
    Store.update('doubts', (d) => d.id === id, (d) => ({
      ...d,
      upvotes: d.upvotes.includes(session.id) ? d.upvotes.filter((u) => u !== session.id) : [...d.upvotes, session.id],
    }));
    refresh();
  }

  function addReply(id) {
    const text = (replyText[id] || '').trim();
    if (!text) return;
    Store.update('doubts', (d) => d.id === id, (d) => ({
      ...d,
      replies: [...d.replies, { id: Store.uid('rp'), byId: session.id, role, text, date: new Date().toISOString().slice(0, 10) }],
    }));
    setReplyText((r) => ({ ...r, [id]: '' }));
    toast('Reply posted');
    refresh();
  }

  function setStatus(id, status) {
    Store.update('doubts', (d) => d.id === id, (d) => ({ ...d, status }));
    toast(status === 'resolved' ? 'Marked as resolved' : 'Reopened');
    refresh();
  }

  if (courseClasses.length === 0) {
    return <div className="empty-state">No course classes found for your account yet.</div>;
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Class Doubt Queue</h1>
          <div className="sub">
            {isTeacher
              ? 'Doubts from your students, ranked by how many classmates share them.'
              : 'Post a doubt, upvote ones you share, and help classmates. Most-voted doubts rise to the top.'}
          </div>
        </div>
        {!isTeacher && <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Post a doubt</button>}
      </div>

      <div className="panel mb-24">
  <div className="field" style={{ margin: 0, maxWidth: 680 }}>
    <label>Subject</label>

    <select
      value={courseClassId}
      onChange={(e) => setCourseClassId(e.target.value)}
    >
      {isTeacher && (
        <option value="all">
          All my subjects ({courseClasses.reduce((n, cc) => n + openCount(cc.id), 0)} open)
        </option>
      )}
      {courseClasses.map((cc) => (
        <option key={cc.id} value={cc.id}>
          {isTeacher
            ? `${cc.classKey} · ${cc.course} (${openCount(cc.id)} open)`
            : `${cc.course} — ${nameOf(cc.teacherId, 'teacher')}`}
        </option>
      ))}
    </select>

    {courseClasses.length > 0 && (
      <div className="small muted mt-8">
        {isTeacher
          ? 'Pick a subject to focus on it, or stay on "All my subjects".'
          : 'Select a subject to view and post doubts. Your doubt goes to that subject\'s teacher.'}
      </div>
    )}
  </div>
</div>

      <div className="filter-row">
        {['open', 'resolved', 'all'].map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">No {filter === 'all' ? '' : filter} doubts here yet.</div>
      ) : (
        visible.map((d) => {
          const voted = d.upvotes.includes(session.id);
          const canResolve = isTeacher || d.studentId === session.id;
          const asker = d.anonymous && !(d.studentId === session.id) ? 'Anonymous' : nameOf(d.studentId, 'student');
          return (
            <div className="card mb-16 doubt-card" key={d.id}>
              <div className="doubt-row">
                <button className={`doubt-vote ${voted ? 'on' : ''}`} onClick={() => toggleUpvote(d.id)} title="Me too">
                  <span>▲</span><strong>{d.upvotes.length}</strong>
                </button>
                <div style={{ flex: 1 }}>
                  <div className="flex-between">
                    <strong style={{ fontSize: 16 }}>{d.title}</strong>
                    <span className={`status-pill status-${d.status === 'open' ? 'open' : 'resolved'}`}>{d.status === 'open' ? 'Open' : 'Resolved'}</span>
                  </div>
                  {d.detail && <p className="small mt-8">{d.detail}</p>}
                  <p className="small muted mt-8">
                    {asker} · {fmtDate(d.date)}
                    {courseClassId === 'all' && <> · <span className="tag tag-sage">{courseName(d.courseClassId)}</span></>}
                  </p>

                  {d.replies.length > 0 && (
                    <div className="doubt-replies">
                      {d.replies.map((r) => (
                        <div key={r.id} className="doubt-reply">
                          <div className="small">
                            <strong>{nameOf(r.byId, r.role)}</strong>{' '}
                            {r.role === 'teacher' && <span className="tag tag-sage">Teacher</span>}
                            <span className="muted"> · {fmtDate(r.date)}</span>
                          </div>
                          <div className="small mt-8">{r.text}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex-gap mt-16">
                    <input
                      style={{ flex: 1 }}
                      placeholder={isTeacher ? 'Write an answer…' : 'Help out with an answer…'}
                      value={replyText[d.id] || ''}
                      onChange={(e) => setReplyText((r) => ({ ...r, [d.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addReply(d.id)}
                    />
                    <button className="btn btn-sm btn-primary" onClick={() => addReply(d.id)}>Reply</button>
                    {canResolve && (
                      <button className="btn btn-sm btn-sage" onClick={() => setStatus(d.id, d.status === 'open' ? 'resolved' : 'open')}>
                        {d.status === 'open' ? 'Resolve' : 'Reopen'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post a doubt">
        <form onSubmit={postDoubt}>
          <div className="field">
            <label>Doubt (short)</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Why does BST delete need a successor?" required />
          </div>
          <div className="field">
            <label>Details (optional)</label>
            <textarea value={form.detail} onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}></textarea>
          </div>
          <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
            <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm((f) => ({ ...f, anonymous: e.target.checked }))} />
            Hide my name from classmates
          </label>
          <button type="submit" className="btn btn-primary btn-block">Post doubt</button>
        </form>
      </Modal>
    </>
  );
}