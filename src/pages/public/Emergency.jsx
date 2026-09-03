const NATIONAL = [
  { label: 'National Emergency', num: '112' },
  { label: 'Police', num: '100' },
  { label: 'Ambulance', num: '108' },
  { label: "Women's Helpline", num: '1091' },
  { label: 'Fire', num: '101' },
  { label: 'Mental Health Helpline (KIRAN)', num: '1800-599-0019' },
];

const CAMPUS = [
  { label: 'Campus Security (24x7)', num: '+91 98xxx xxxxx' },
  { label: 'Hostel Warden — Block C', num: '+91 98xxx xxxxx' },
  { label: 'Campus Health Centre', num: '+91 98xxx xxxxx' },
  { label: 'Dean of Student Affairs', num: '+91 98xxx xxxxx' },
];

export default function Emergency() {
  return (
    <>
      <section className="public-hero" style={{ background: '#FBEAEA', borderBottomColor: 'var(--coral-deep)' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ color: 'var(--coral-deep)' }}>
            No login needed
          </span>
          <h1 className="mt-8">Emergency Help</h1>
          <p className="muted mt-8" style={{ maxWidth: 560 }}>
            Every number worth having saved, in one place. If it's a real emergency, call
            national helplines first.
          </p>
        </div>
      </section>

      <div className="wrap section">
        <h3 className="mb-16">National helplines</h3>
        <div className="grid-2 mb-24">
          {NATIONAL.map((n) => (
            <div className="emergency-card" key={n.label}>
              <span>{n.label}</span>
              <span className="num">{n.num}</span>
            </div>
          ))}
        </div>

        <h3 className="mb-16 mt-32">On-campus contacts</h3>
        <div className="grid-2">
          {CAMPUS.map((n) => (
            <div className="emergency-card" key={n.label}>
              <span>{n.label}</span>
              <span className="num">{n.num}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
