import { Store, fmtDate } from '../../store.js';

export default function StudentEvents() {
  const events = Store.get('events');

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Events</h1>
          <div className="sub">Everything happening on campus, posted by faculty.</div>
        </div>
      </div>
      <div className="grid-2">
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🎉</div>
            No events posted yet.
          </div>
        ) : (
          events.map((e) => (
            <div className="card card-tilt" key={e.id}>
              <span className="tag tag-amber">{fmtDate(e.date)}</span>
              <h3 className="mt-16" style={{ fontSize: 19 }}>
                {e.title}
              </h3>
              <p className="small muted mt-8">📍 {e.location}</p>
              <p className="small mt-16">{e.desc}</p>
              {e.formLink ? (
                <a
                  href={e.formLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm mt-16"
                >
                  Participate →
                </a>
              ) : (
                <p className="field-hint mt-16">No registration needed for this one.</p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
