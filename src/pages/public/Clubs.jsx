import { Store } from '../../store.js';

export default function Clubs() {
  const clubs = Store.get('clubs');

  return (
    <>
      <section className="public-hero">
        <div className="wrap">
          <span className="eyebrow">No login needed</span>
          <h1 className="mt-8">Clubs</h1>
          <p className="muted mt-8" style={{ maxWidth: 560 }}>
            See what each club is about, when they meet, and join straight from here.
          </p>
        </div>
      </section>

      <div className="wrap section">
        <div className="grid-3">
          {clubs.map((c) => (
            <div className="card" key={c.id}>
              <div className="flex-between mb-8">
                <strong style={{ fontSize: 17 }}>{c.name}</strong>
                {c.category && <span className="tag tag-outline">{c.category}</span>}
              </div>
              <p className="small">{c.desc}</p>
              {c.meets && <p className="small muted mt-16"> {c.meets}</p>}
              <a
                href={c.formLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-block mt-16"
              >
                Join {c.name} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
