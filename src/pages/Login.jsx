import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from '../store.js';
import { useAuth } from '../components/AuthContext.jsx';

export default function Login() {
  const [role, setRole] = useState('student');
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const remembered = Store.rememberedLogin();
  const [rememberMe, setRememberMe] = useState(Boolean(remembered));
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = Store.rememberedLogin();
    if (!saved) return;
    setRole(saved.role || 'student');
    setId(saved.id || '');
    setPass(saved.password || '');
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const table = role === 'student' ? 'students' : role === 'teacher' ? 'teachers' : 'admins';
    const users = Store.get(table);
    const user = users.find(
      (u) => u.id.toLowerCase() === id.trim().toLowerCase() && u.password === pass
    );

    if (!user) {
      setError("That ID or password doesn't match our WorkForce account records. Use the same ID and password you used when creating the account.");
      return;
    }

    if (rememberMe) Store.setRememberedLogin({ role, id: user.id, password: pass });
    else Store.setRememberedLogin(null);

    login({ role, id: user.id, name: user.name });
    navigate(role === 'student' ? '/student/dashboard' : role === 'teacher' ? '/teacher/dashboard' : '/admin/content');
  }

  return (
    <div className="login-wrap">
      <span className="eyebrow">Welcome back</span>
      <h1 className="mt-8" style={{ fontSize: 32 }}>
        Log in to Workforce
      </h1>
      <p className="muted mt-8">Choose your portal, then use the ID and password you created. Your WorkForce account stays saved after logout on this device.</p>

      <div className="role-switch">
        <button
          type="button"
          className={`role-btn ${role === 'student' ? 'active' : ''}`}
          onClick={() => {
            setRole('student');
            setError('');
          }}
        >
           Student
        </button>
        <button
          type="button"
          className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
          onClick={() => {
            setRole('teacher');
            setError('');
          }}
        >
           Teacher
        </button>
        <button
          type="button"
          className={`role-btn ${role === 'admin' ? 'active' : ''}`}
          onClick={() => { setRole('admin'); setError(''); }}
        >
           Content Manager
        </button>
      </div>

      <div className="login-card">
        <div className={`login-error ${error ? 'show' : ''}`}>{error}</div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="field">
            <label htmlFor="login-id">{role === 'student' ? 'Student ID' : role === 'teacher' ? 'Teacher ID' : 'Manager ID'}</label>
            <input
              id="login-id"
              type="text"
              placeholder={role === 'student' ? 'e.g. S101' : role === 'teacher' ? 'e.g. T201' : 'Manager ID'}
              value={id}
              onChange={(e) => setId(e.target.value)}
              name="workforce-login-id"
              autoComplete="off"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="login-pass">Password</label>
            <input
              id="login-pass"
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              name="workforce-login-password"
              autoComplete="new-password"
              required
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 16px', fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Remember me on this device
          </label>
          <button type="submit" className="btn btn-primary btn-block">
            Log in
          </button>
        </form>
      </div>

      <div className="signup-row">
        Don't have an account? <Link to="/signup">Create one</Link>
      </div>

    </div>
  );
}
