import { Store, fmtDate } from '../../store.js';

export default function CampusUpdates() {
  const updates = Store.get('campusUpdates').slice().reverse();
  const events = Store.get('events')
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <section className="public-hero">
        <div className="wrap">
          <span className="eyebrow">No login needed</span>
          <h1 className="mt-8">Campus Updates</h1>
          <p className="muted mt-8" style={{ maxWidth: 560 }}>
            University-wide news and upcoming events — the things everyone on campus should
            know about.
          </p>
        </div>
      </section>

      <div className="wrap section">
        <h3 className="mb-16">Latest updates</h3>
        {updates.length === 0 ? (
          <div className="empty-state">No updates yet.</div>
        ) : (
          updates.map((u) => (
            <div className="panel" key={u.id}>
              <div className="flex-between">
                <strong style={{ fontSize: 16 }}>{u.title}</strong>
                <span className="small muted mono">{fmtDate(u.date)}</span>
              </div>
              <p className="small mt-8">{u.desc}</p>
            </div>
          ))
        )}

        <h3 className="mb-16 mt-32">Upcoming events</h3>
        <div className="grid-2">
          {events.length === 0 ? (
            <div className="empty-state">No events yet.</div>
          ) : (
            events.map((e) => (
              <div className="card card-tilt" key={e.id}>
                <span className="tag tag-amber">{fmtDate(e.date)}</span>
                <h4 className="mt-16" style={{ fontSize: 16 }}>
                  {e.title}
                </h4>
                <p className="small muted mt-8"> {e.location}</p>
                <p className="small mt-16">{e.desc}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
