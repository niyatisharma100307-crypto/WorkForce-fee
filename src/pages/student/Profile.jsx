import { useState } from 'react';
import { Store, ALL_GROUPS, classKeyOf } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';

export default function StudentProfile() {
  const { session, login } = useAuth();
  const toast = useToast();
  const student = Store.get('students').find((s) => s.id === session.id);

  const [name, setName] = useState(student?.name ?? '');
  const [year, setYear] = useState(student?.year ?? '1st Year');
  const [branch, setBranch] = useState(student?.branch ?? '');
  const [group, setGroup] = useState(student?.group ?? 'G1');
  const [error, setError] = useState('');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [passError, setPassError] = useState('');

  function handleDetailsSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !branch.trim()) {
      setError('Name and branch cannot be empty.');
      return;
    }
    setError('');

    Store.update(
      'students',
      (s) => s.id === session.id,
      (s) => ({ ...s, name: name.trim(), year, branch: branch.trim(), group })
    );

    // keep the session's display name in sync
    login({ ...session, name: name.trim() });
    toast('Profile updated');
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!student || currentPass !== student.password) {
      setPassError('Current password is incorrect.');
      return;
    }
    if (newPass.length < 6) {
      setPassError('New password should be at least 6 characters.');
      return;
    }
    if (newPass !== newPass2) {
      setPassError("New passwords don't match.");
      return;
    }
    setPassError('');

    Store.update('students', (s) => s.id === session.id, (s) => ({ ...s, password: newPass }));
    setCurrentPass('');
    setNewPass('');
    setNewPass2('');
    toast('Password changed');
  }

  if (!student) {
    return (
      <div className="empty-state">
        
        We couldn't find your student record. Try logging out and back in.
      </div>
    );
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>My Profile</h1>
          <div className="sub">
            Your ID (<span className="mono">{student.id}</span>) can't be changed, but
            everything else can.
          </div>
        </div>
      </div>

      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card stat-amber">
          <div className="icon"></div>
          <div className="num" style={{ fontSize: 18 }}>
            {classKeyOf(student)}
          </div>
          <div className="label">Your class</div>
        </div>
        <div className="stat-card stat-sage">
          <div className="icon"></div>
          <div className="num">{student.group || '—'}</div>
          <div className="label">Your group</div>
        </div>
        <div className="stat-card stat-slate">
          <div className="icon"></div>
          <div className="num" style={{ fontSize: 18 }}>
            {student.id}
          </div>
          <div className="label">Student ID</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Your details</h3>
        </div>
        <div className={`login-error ${error ? 'show' : ''}`}>{error}</div>
        <form onSubmit={handleDetailsSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
            <div className="field">
              <label>Branch</label>
              <input value={branch} onChange={(e) => setBranch(e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label>Group</label>
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              {ALL_GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <div className="field-hint">Your lab/tutorial batch.</div>
          </div>
          <div className="field-hint mb-16">
            Your class is derived from Year + Branch (e.g. "CSE-2nd Year") — this is what
            connects you to your teacher's roster, timetable, and grades. Get it exactly
            right, matching what your teacher uses.
          </div>
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Change password</h3>
        </div>
        <div className={`login-error ${passError ? 'show' : ''}`}>{passError}</div>
        <form onSubmit={handlePasswordSubmit}>
          <div className="field">
            <label>Current password</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              required
            />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>New password</label>
              <input
                type="password"
                minLength={6}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input
                type="password"
                value={newPass2}
                onChange={(e) => setNewPass2(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-ink">
            Change password
          </button>
        </form>
      </div>
    </>
  );
}
