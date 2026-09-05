import { Link } from 'react-router-dom';

const PUBLIC_TILES = [
  ['/campus-guide', '', 'Campus Guide', 'Where everything is, plus nearby essentials with map links.'],
  ['/study-zone', '', 'Study Zone', 'Good places to study when the library is full — sorted by vibe.'],
  ['/junior-hub', '', 'Junior Hub', 'Notes by year and subject, plus a place to ask seniors anything.'],
  ['/opportunities', '', 'Opportunities', 'Hackathons, internships, and international programs, by deadline.'],
  ['/clubs', '', 'Clubs', "See what a club's about and join straight from the page."],
  ['/emergency', '', 'Emergency Help', "Every number you'd need in a hurry, in one place."],
  ['/suggestions', '', 'Anonymous Suggestions', 'Say what needs fixing — no name attached.'],
  ['/campus-updates', '', 'Campus Updates', 'University-wide events and announcements, always current.'],
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Campus-wide · one integrated platform</span>
            <h1>
              Your whole campus, <span className="underline">actually organized</span>.
            </h1>
            <p className="hero-sub">
              Grades, attendance, timetables, hostel complaints, hackathon teammates, club forms,
              and the emergency numbers you actually need — no ten different apps, no login walls
              for the public stuff.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary">
                Log in to your portal
              </Link>
              <Link to="/campus-guide" className="btn btn-ghost">
                Browse without logging in →
              </Link>
            </div>
            <div className="hero-stats">
              <div><strong>3</strong><span>portals</span></div>
              <div><strong>12+</strong><span>tools inside</span></div>
              <div><strong>0</strong><span>logins to browse public pages</span></div>
            </div>
          </div>

          <div className="hero-mockup" aria-hidden="true">
            <div className="mockup-badge mockup-badge-1">
              <span className="mono">92%</span>
              <span>attendance</span>
            </div>
            <div className="mockup-badge mockup-badge-2">
              <span className="mono">4</span>
              <span>new messages</span>
            </div>

            <div className="mockup-window">
              <div className="mockup-topbar">
                <span className="mockup-dot" style={{ background: 'var(--coral)' }}></span>
                <span className="mockup-dot" style={{ background: 'var(--amber)' }}></span>
                <span className="mockup-dot" style={{ background: 'var(--sage)' }}></span>
                <span className="mockup-url mono">workforce.app/dashboard</span>
              </div>
              <div className="mockup-body">
                <div className="mockup-greet">Today, at a glance</div>
                <div className="mockup-stats">
                  <div className="mockup-stat">
                    <span className="mockup-stat-num">3</span>
                    <span className="mockup-stat-label">classes</span>
                  </div>
                  <div className="mockup-stat">
                    <span className="mockup-stat-num">1</span>
                    <span className="mockup-stat-label">test soon</span>
                  </div>
                  <div className="mockup-stat">
                    <span className="mockup-stat-num">2</span>
                    <span className="mockup-stat-label">pending</span>
                  </div>
                </div>
                <div className="mockup-list">
                  <div className="mockup-row">
                    <span className="mockup-check done"></span>
                    <span>Data Structures — marked present</span>
                  </div>
                  <div className="mockup-row">
                    <span className="mockup-check"></span>
                    <span>DBMS assignment due Aug 25</span>
                  </div>
                  <div className="mockup-row">
                    <span className="mockup-check"></span>
                    <span>Team Nullptr needs a designer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTALS */}
      <section className="wrap section">
        <span className="eyebrow">Choose your side</span>
        <h2 className="section-title">Three portals. One login page.</h2>
        <div className="portal-grid">
          <div className="portal-card portal-student">
            
            <h3>Student Portal</h3>
            <p className="muted">
              Your dashboard, grade card, attendance record, announcements, complaints, upcoming tests,
              and weekly timetable.
            </p>
            <ul className="portal-list">
              <li>Personal dashboard</li>
              <li>Grade card & attendance</li>
              <li>Events & complaints</li>
              <li>Assignments & announcements</li>
            </ul>
            <Link to="/login" className="btn btn-primary btn-block">
              Student login
            </Link>
          </div>
          <div className="portal-card portal-teacher">
            
            <h3>Teacher Portal</h3>
            <p className="muted">
              Post announcements and events, mark attendance, assign work per student, and
              message students privately.
            </p>
            <ul className="portal-list">
              <li>Attendance — present / absent</li>
              <li>Per-student assignments</li>
              <li>Private student messaging</li>
              <li>Announcements & events</li>
            </ul>
            <Link to="/login" className="btn btn-ink btn-block">
              Teacher login
            </Link>
          </div>
        </div>
      </section>

      {/* PUBLIC SIDE */}
      <section className="public-band">
        <div className="wrap section">
          <span className="eyebrow" style={{ color: 'var(--paper)', opacity: 0.7 }}>
            No login needed
          </span>
          <h2 className="section-title" style={{ color: 'var(--paper)' }}>
            Open to anyone on campus
          </h2>
          <div className="grid-3 mt-32">
            {PUBLIC_TILES.map(([to, emoji, title, desc]) => (
              <Link key={to} to={to} className="public-tile">
                <span className="public-tile-emoji">{emoji}</span>
                <h4>{title}</h4>
                <p>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CREATE ACCOUNT CTA */}
      <section className="wrap section try-section">
        <div className="try-card">
          <div>
            <span className="eyebrow">New here?</span>
            <h3>Set up your account in under a minute.</h3>
            <p className="muted">
              Register with your student or staff ID to unlock your dashboard, grades,
              attendance, and everything else built for you.
            </p>
          </div>
          <div className="try-actions">
            <Link to="/signup" className="btn btn-primary">
              Create an account
            </Link>
            <Link to="/login" className="btn btn-ink">
              Log in
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
