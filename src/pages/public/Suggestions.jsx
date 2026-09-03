import { useState } from 'react';
import { Store, fmtDate } from '../../store.js';
import { useToast } from '../../components/Toast.jsx';

export default function Suggestions() {
  const toast = useToast();
  const [text, setText] = useState('');
  const [list, setList] = useState(() => Store.get('suggestions').slice().reverse());

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    Store.push('suggestions', {
      id: Store.uid('sg'),
      text: trimmed,
      date: new Date().toISOString().slice(0, 10),
    });
    setText('');
    toast('Submitted anonymously');
    setList(Store.get('suggestions').slice().reverse());
  }

  return (
    <>
      <section className="public-hero">
        <div className="wrap">
          <span className="eyebrow">No login needed · fully anonymous</span>
          <h1 className="mt-8">Anonymous Suggestions</h1>
          <p className="muted mt-8" style={{ maxWidth: 560 }}>
            No name, no ID, no login — just tell us what needs fixing. Suggestions are visible
            to everyone browsing this page.
          </p>
        </div>
      </section>

      <div className="wrap section">
        <div className="panel wrap-narrow" style={{ margin: '0 auto 32px' }}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Your suggestion</label>
              <textarea
                placeholder="Be specific — it helps things actually get fixed."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Submit anonymously
            </button>
          </form>
        </div>

        <div className="wrap-narrow">
          {list.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">💬</div>
              No suggestions yet.
            </div>
          ) : (
            list.map((s) => (
              <div className="panel" key={s.id}>
                <p className="small">{s.text}</p>
                <div className="small muted mono mt-16">{fmtDate(s.date)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
