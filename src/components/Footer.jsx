import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ color: 'var(--paper)', marginBottom: 10 }}>
              <span className="chip">W</span> Workforce
            </div>
            <p className="small" style={{ opacity: 0.7, maxWidth: 280 }}>
              Built by students, for students & teachers — one place for classes, communication, and everything in
              between.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/campus-guide">Campus Guide</Link></li>
              <li><Link to="/study-zone">Study Zone</Link></li>
              <li><Link to="/junior-hub">Junior Hub</Link></li>
              <li><Link to="/opportunities">Opportunities</Link></li>
              <li><Link to="/clubs">Clubs</Link></li>
              <li><Link to="/campus-updates">Campus Updates</Link></li>
            </ul>
          </div>
          <div>
            <h4>Portals</h4>
            <ul>
              <li><Link to="/login">Student Login</Link></li>
              <li><Link to="/login">Teacher Login</Link></li>
              <li><Link to="/login">Content Manager Login</Link></li>
              <li><Link to="/suggestions">Anonymous Suggestions</Link></li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li><Link to="/emergency">Emergency Numbers</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span> 2026 Workforce</span>
          <span>MADE WITH REACT</span>
        </div>
      </div>
    </footer>
  );
}
