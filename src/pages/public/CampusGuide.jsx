const GUIDE_SPOTS = [
  { name: 'Main Academic Block', desc: "Lecture halls for 1st & 2nd year, exam control room, and the dean's office on the ground floor.", tag: 'On campus', map: 'https://maps.google.com' },
  { name: 'Central Library', desc: 'Four floors — silent zone on top, group discussion rooms on the 2nd floor. 24/7 during exams.', tag: 'On campus', map: 'https://maps.google.com' },
  { name: 'Hostel Block C', desc: "Boys' hostel, rooms 201–450. Warden's office near the main gate.", tag: 'On campus', map: 'https://maps.google.com' },
  { name: 'Sports Complex', desc: 'Football ground, basketball courts, and the indoor badminton hall.', tag: 'On campus', map: 'https://maps.google.com' },
  { name: 'Cafeteria & Food Court', desc: 'Main mess plus 4 food stalls — opens 7:30 AM, closes 10 PM.', tag: 'On campus', map: 'https://maps.google.com' },
  { name: 'ATM — State Bank', desc: '2 minute walk from the main gate, right next to the stationery shop.', tag: 'Nearby', map: 'https://maps.google.com' },
  { name: 'City Pharmacy', desc: 'Open till midnight, right across the main gate.', tag: 'Nearby', map: 'https://maps.google.com' },
  { name: 'Metro Station', desc: '10 minute walk or a 3-minute auto ride from the back gate.', tag: 'Nearby', map: 'https://maps.google.com' },
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
                Open in Maps ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
