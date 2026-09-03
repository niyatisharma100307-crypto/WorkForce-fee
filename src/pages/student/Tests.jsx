import { Store, fmtDate } from '../../store.js';

export default function StudentTests() {
  const tests = Store.get('tests').slice().sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Upcoming Tests</h1>
          <div className="sub">Dates and syllabus for tests scheduled by your teachers.</div>
        </div>
      </div>
      <div className="grid-2">
        {tests.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📝</div>
            No tests scheduled right now.
          </div>
        ) : (
          tests.map((t) => (
            <div className="card" key={t.id}>
              <div className="flex-between">
                <strong style={{ fontSize: 17 }}>{t.subject}</strong>
                <span className="tag tag-coral">{fmtDate(t.date)}</span>
              </div>
              <p className="small muted mt-8">🕐 {t.time}</p>
              <p className="small mt-16">
                <strong>Syllabus:</strong> {t.syllabus}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
