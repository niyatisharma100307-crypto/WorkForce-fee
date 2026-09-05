import { useState } from 'react';
import { Store, fmtDate } from '../../store.js';

const CATEGORIES = ['All', 'Hackathon', 'Internship', 'International'];

export default function Opportunities() {
  const [activeCategory, setActiveCategory] = useState('All');
  const opportunities = Store.get('opportunities')
    .slice()
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const visible =
    activeCategory === 'All'
      ? opportunities
      : opportunities.filter((o) => o.category === activeCategory);

  return (
    <>
      <section className="public-hero">
        <div className="wrap">
          <span className="eyebrow">No login needed</span>
          <h1 className="mt-8">Opportunities</h1>
          <p className="muted mt-8" style={{ maxWidth: 560 }}>
            Hackathons, internships, and international programs worth applying to — sorted
            by deadline so nothing sneaks up on you.
          </p>
        </div>
      </section>

      <div className="wrap section">
        <div className="filter-row">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`filter-chip ${activeCategory === c ? 'active' : ''}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid-2">
          {visible.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              
              Nothing in this category right now.
            </div>
          ) : (
            visible.map((o) => (
              <div className="card" key={o.id}>
                <div className="flex-between">
                  <span className="tag tag-amber">{o.category}</span>
                  <span className="small muted mono">Deadline: {fmtDate(o.deadline)}</span>
                </div>
                <h4 className="mt-16" style={{ fontSize: 17 }}>
                  {o.title}
                </h4>
                <p className="small mt-8">{o.desc}</p>
                <a
                  href={o.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary mt-16"
                >
                  Learn more →
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
