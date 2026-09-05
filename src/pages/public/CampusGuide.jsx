const GUIDE_SPOTS = [
  { name: 'Main Academic Block', desc: "Lecture halls for 1st & 2nd year, exam control room, and the dean's office on the ground floor.", tag: 'On campus', map: 'https://maps.app.goo.gl/49vhpno2DLp65iLh8' },
  { name: 'Central Library', desc: 'Four floors — silent zone on top, group discussion rooms on the 2nd floor. 24/7 during exams.', tag: 'On campus', map: 'https://maps.app.goo.gl/g3hna98RXrxd4YwFA' },
  { name: 'Turing Block', desc: "Main Block for Students in B.E Course.", tag: 'On campus', map: 'https://maps.app.goo.gl/WLyGws4yYiQoydy28' },
  { name: 'Office of International Affairs', desc: 'For all Students in Exchange and International programs.', tag: 'On campus', map: 'https://maps.app.goo.gl/DhNayt1vZtArADAfA' },
  { name: 'Square 1', desc: '24/7 Open Square for different Cuisine Outlets.', tag: 'On campus', map: 'https://maps.app.goo.gl/eGZcPTu4qwwRHxTq9' },
  { name: 'Girls Hostel', desc: 'Living and Mess Facilites for Girls of the Campus.', tag: 'On campus', map: 'https://maps.app.goo.gl/aq7HFyiizdciSccT8' },
  { name: 'Boys Hostel', desc: 'Living and Mess Facilites for Boys of the Campus.', tag: 'On campus', map: 'https://maps.app.goo.gl/B9ArxS6LEjBB7rUCA' },
];

export default function CampusGuide() {
  return (
    <>
      <section className="public-hero">
        <div className="wrap">
          <span className="eyebrow">No login needed</span>
          <h1 className="mt-8">Campus Guide</h1>
          <p className="muted mt-8" style={{ maxWidth: 560 }}>
            Where every building actually is, plus the essentials nearby — food, ATMs,
            pharmacies — with a map link for each.
          </p>
        </div>
      </section>

      <div className="wrap section">
        <div className="grid-2">
          {GUIDE_SPOTS.map((s) => (
            <div className="card" key={s.name}>
              <div className="flex-between">
                <strong style={{ fontSize: 17 }}>{s.name}</strong>
                <span className={`tag ${s.tag === 'On campus' ? 'tag-amber' : 'tag-sage'}`}>
                  {s.tag}
                </span>
              </div>
              <p className="small mt-8">{s.desc}</p>
              <a
                href={s.map}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-ghost mt-16"
              >
                Open in Maps
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
