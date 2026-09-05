import { useRef, useState } from 'react';
import { Store, fmtDate } from '../../store.js';
import { useToast } from '../../components/Toast.jsx';

const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function JuniorHub() {
  const toast = useToast();

  // ---- Notes ----
  const [activeYear, setActiveYear] = useState('All');
  const [notes, setNotes] = useState(() => Store.get('notes').slice().reverse());
  const [year, setYear] = useState('1st Year');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const fileRef = useRef(null);

  function refreshNotes() {
    setNotes(Store.get('notes').slice().reverse());
  }

  function handleNotesSubmit(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    Store.push('notes', {
      id: Store.uid('n'),
      year,
      subject: subject.trim(),
      title: title.trim() + (file ? ` (${file.name})` : ''),
      uploader: uploaderName.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    setSubject('');
    setTitle('');
    setUploaderName('');
    if (fileRef.current) fileRef.current.value = '';
    toast('Notes added to Junior Hub');
    refreshNotes();
  }

  const visibleNotes =
    activeYear === 'All' ? notes : notes.filter((n) => n.year === activeYear);

  // ---- Ask a Senior ----
  const [questions, setQuestions] = useState(() => Store.get('seniorQuestions').slice().reverse());
  const [newQuestion, setNewQuestion] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [answerNames, setAnswerNames] = useState({});

  function refreshQuestions() {
    setQuestions(Store.get('seniorQuestions').slice().reverse());
  }

  function handleAskSubmit(e) {
    e.preventDefault();
    const text = newQuestion.trim();
    if (!text) return;
    Store.push('seniorQuestions', {
      id: Store.uid('q'),
      question: text,
      askedBy: 'Anonymous',
      date: new Date().toISOString().slice(0, 10),
      answers: [],
    });
    setNewQuestion('');
    toast('Question posted');
    refreshQuestions();
  }

  function handleAnswerSubmit(questionId) {
    const text = (answerDrafts[questionId] || '').trim();
    if (!text) return;
    const name = (answerNames[questionId] || '').trim() || 'A senior';

    const all = Store.get('seniorQuestions');
    const idx = all.findIndex((q) => q.id === questionId);
    if (idx === -1) return;
    all[idx] = {
      ...all[idx],
      answers: [
        ...all[idx].answers,
        { id: Store.uid('ans'), text, answeredBy: name, date: new Date().toISOString().slice(0, 10) },
      ],
    };
    Store.set('seniorQuestions', all);

    setAnswerDrafts((d) => ({ ...d, [questionId]: '' }));
    toast('Answer posted');
    refreshQuestions();
  }

  return (
    <>
      <section className="public-hero">
        <div className="wrap">
          <span className="eyebrow">No login needed</span>
          <h1 className="mt-8">Junior Hub</h1>
          <p className="muted mt-8" style={{ maxWidth: 560 }}>
            Notes shared by seniors, organized by year and subject — plus a place to ask
            seniors anything the syllabus doesn't cover.
          </p>
        </div>
      </section>

      <div className="wrap section">
        {/* ---- Notes upload ---- */}
        <div className="panel" style={{ marginBottom: 32 }}>
          <div className="flex-between mb-16">
            <h3>Upload notes</h3>
          </div>
          <form onSubmit={handleNotesSubmit}>
            <div className="grid-2">
              <div className="field">
                <label>Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
              <div className="field">
                <label>Subject</label>
                <input
                  placeholder="e.g. Data Structures"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Title / description</label>
              <input
                placeholder="e.g. Unit 3 — full handwritten notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Your name</label>
              <input
                placeholder="So people know who to thank"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>PDF file</label>
              <div className="upload-box">
                <input type="file" accept="application/pdf" ref={fileRef} style={{ margin: '0 auto' }} />
                <div className="field-hint mt-8">
                  This is a frontend demo — the file name is saved, not the file itself. Real
                  uploads come with the backend.
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              + Add to Junior Hub
            </button>
          </form>
        </div>

        <div className="flex-between mb-16">
          <h3>Browse notes</h3>
        </div>
        <div className="filter-row">
          {YEARS.map((y) => (
            <button
              key={y}
              className={`filter-chip ${activeYear === y ? 'active' : ''}`}
              onClick={() => setActiveYear(y)}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="grid-3" style={{ marginBottom: 48 }}>
          {visibleNotes.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              
              No notes here yet — be the first to add some.
            </div>
          ) : (
            visibleNotes.map((n) => (
              <div className="card" key={n.id}>
                <span className="tag tag-outline">{n.year}</span>
                <h4 className="mt-16" style={{ fontSize: 16 }}>
                  {n.title}
                </h4>
                <p className="small muted mt-8">{n.subject}</p>
                <p className="small mt-16">
                  Uploaded by {n.uploader} · {fmtDate(n.date)}
                </p>
                <button
                  className="btn btn-sm btn-ghost mt-16"
                  onClick={() => toast('This is a demo — real downloads need the backend')}
                >
                  Download PDF
                </button>
              </div>
            ))
          )}
        </div>

        {/* ---- Ask a Senior ---- */}
        <h3 className="mb-16">Ask a Senior</h3>
        <div className="panel" style={{ marginBottom: 24 }}>
          <form onSubmit={handleAskSubmit}>
            <div className="field">
              <label>Your question</label>
              <textarea
                placeholder="Ask anything — attendance, internals, which electives are worth it..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                required
              ></textarea>
              <div className="field-hint">Posted anonymously — no login needed.</div>
            </div>
            <button type="submit" className="btn btn-primary">
              Post question
            </button>
          </form>
        </div>

        {questions.length === 0 ? (
          <div className="empty-state">
            
            No questions yet — ask the first one.
          </div>
        ) : (
          questions.map((q) => (
            <div className="panel" key={q.id}>
              <div className="flex-between">
                <strong style={{ fontSize: 15 }}>{q.question}</strong>
                <span className="small muted mono">{fmtDate(q.date)}</span>
              </div>

              {q.answers.length > 0 && (
                <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {q.answers.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        background: 'var(--paper-dim)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        borderLeft: '3px solid var(--sage)',
                      }}
                    >
                      <p className="small">{a.text}</p>
                      <p className="small muted mt-8" style={{ fontSize: 11.5 }}>
                        — {a.answeredBy}, {fmtDate(a.date)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex-gap mt-16" style={{ flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  style={{
                    maxWidth: 160,
                    padding: '9px 12px',
                    border: '2px solid var(--line-strong)',
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                  value={answerNames[q.id] || ''}
                  onChange={(e) => setAnswerNames((n) => ({ ...n, [q.id]: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Write an answer..."
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: '9px 12px',
                    border: '2px solid var(--line-strong)',
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                  value={answerDrafts[q.id] || ''}
                  onChange={(e) => setAnswerDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit(q.id)}
                />
                <button className="btn btn-sm btn-sage" onClick={() => handleAnswerSubmit(q.id)}>
                  Answer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
