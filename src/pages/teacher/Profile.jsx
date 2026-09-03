import { useState } from 'react';
import { Store, allClassKeys } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';

export default function TeacherProfile() {
  const { session, login } = useAuth();
  const toast = useToast();
  const teacher = Store.get('teachers').find((t) => t.id === session.id);
  const existingClasses = allClassKeys();

  const [name, setName] = useState(teacher?.name ?? '');
  const [dept, setDept] = useState(teacher?.dept ?? '');
  const [classesTaught, setClassesTaught] = useState((teacher?.classes ?? []).join(', '));
  const [error, setError] = useState('');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [passError, setPassError] = useState('');

  function handleDetailsSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setError('');

    const classes = classesTaught
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    Store.update(
      'teachers',
      (t) => t.id === session.id,
      (t) => ({ ...t, name: name.trim(), dept: dept.trim() || 'Undeclared', classes })
    );

    login({ ...session, name: name.trim() });
    toast('Profile updated');
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!teacher || currentPass !== teacher.password) {
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

    Store.update('teachers', (t) => t.id === session.id, (t) => ({ ...t, password: newPass }));
    setCurrentPass('');
    setNewPass('');
    setNewPass2('');
    toast('Password changed');
  }

  if (!teacher) {
    return (
      <div className="empty-state">
        <div className="emoji">⚠️</div>
        We couldn't find your teacher record. Try logging out and back in.
      </div>
    );
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>My Profile</h1>
          <div className="sub">
            Your ID (<span className="mono">{teacher.id}</span>) can't be changed, but
            everything else can.
          </div>
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
          <div className="field">
            <label>Department</label>
            <input value={dept} onChange={(e) => setDept(e.target.value)} />
          </div>
          <div className="field">
            <label>Class(es) you teach</label>
            <input
              placeholder="e.g. CSE-2nd Year, CSE-3rd Year"
              value={classesTaught}
              onChange={(e) => setClassesTaught(e.target.value)}
            />
            <div className="field-hint">
              Comma-separated, matching Branch-Year exactly (e.g. "CSE-2nd Year"). This
              controls which students show up in your Grade Card, Attendance, Timetable,
              Assignments, and Conversations pages.
              {existingClasses.length > 0 && <> Existing classes: {existingClasses.join(', ')}.</>}
            </div>
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
