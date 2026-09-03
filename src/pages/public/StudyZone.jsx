import { Store } from '../../store.js';

export default function StudyZone() {
  const spots = Store.get('studySpots');

  return (
    <>
      <section className="public-hero">
        <div className="wrap">
          <span className="eyebrow">No login needed</span>
          <h1 className="mt-8">Study Zone</h1>
          <p className="muted mt-8" style={{ maxWidth: 560 }}>
            Good places to study when the library's full or just not your vibe — sorted by
            what kind of studying they're actually good for.
          </p>
        </div>
      </section>

      <div className="wrap section">
        <div className="grid-2">
          {spots.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">📖</div>
              No spots listed yet.
            </div>
          ) : (
            spots.map((s) => (
              <div className="card" key={s.id}>
                <div className="flex-between mb-8">
                  <strong style={{ fontSize: 17 }}>{s.name}</strong>
                  <span className="tag tag-amber">{s.vibe}</span>
                </div>
                <p className="small muted">📍 {s.building}</p>
                <p className="small mt-16">{s.desc}</p>
                <div className="flex-gap mt-16" style={{ flexWrap: 'wrap' }}>
                  {s.amenities.map((a) => (
                    <span className="tag tag-outline" key={a}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
