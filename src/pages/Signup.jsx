import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, allClassKeys, ALL_GROUPS, subjectsForClass } from '../store.js';
import { useAuth } from '../components/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

const KNOWN_BRANCHES = ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function Signup() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [id, setId] = useState('');

  // student fields
  const [year, setYear] = useState('1st Year');
  const [branch, setBranch] = useState('CSE');
  const [customBranch, setCustomBranch] = useState('');
  const [group, setGroup] = useState('G1');

  // teacher fields
  const [dept, setDept] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedCourseClasses, setSelectedCourseClasses] = useState([]);

  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const existingClasses = allClassKeys();
  const contentManagerExists = Store.get('admins').length >= 1;

  function switchRole(nextRole) {
    if (nextRole === 'admin' && contentManagerExists) {
      setError('The Content Manager account has already been created. Only one Content Manager account is allowed.');
      return;
    }
    setRole(nextRole);
    setError('');
  }

  function toggleClass(key) {
    setSelectedClasses((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  }

  function toggleGroup(g) {
    setSelectedGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function toggleCourseClass(classKey, course) {
    const key = `${classKey}::${course}`;
    setSelectedCourseClasses((prev) =>
      prev.some((x) => x.key === key)
        ? prev.filter((x) => x.key !== key)
        : [...prev, { key, classKey, course }]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim() || !id.trim() || !pass) {
      setError('Please fill in every field.');
      return;
    }
    if (pass.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    if (pass !== pass2) {
      setError("Passwords don't match.");
      return;
    }
    if (role === 'teacher' && selectedClasses.length === 0) {
      setError('Pick at least one class you teach.');
      return;
    }
    if (role === 'teacher' && selectedCourseClasses.length === 0) {
      setError('Pick at least one subject for the class you teach.');
      return;
    }

    if (role === 'admin' && Store.get('admins').length >= 1) {
      setError('Only one Content Manager account is allowed. Please log in with the existing account.');
      return;
    }

    const table = role === 'student' ? 'students' : role === 'teacher' ? 'teachers' : 'admins';
    const existing = Store.get(table);
    if (existing.some((u) => u.id.toLowerCase() === id.trim().toLowerCase())) {
      setError(
        `That ${role === 'student' ? 'Student' : role === 'teacher' ? 'Teacher' : 'Manager'} ID is already registered — try logging in instead.`
      );
      return;
    }

    const finalBranch = branch === 'Other' ? customBranch.trim() || 'Undeclared' : branch;

    const newUser =
      role === 'student'
        ? {
            id: id.trim(),
            name: name.trim(),
            password: pass,
            year,
            branch: finalBranch,
            group,
            avatarColor: '#E8A33D',
          }
        : role === 'teacher'
        ? {
            id: id.trim(),
            name: name.trim(),
            password: pass,
            dept: dept.trim() || 'Undeclared',
            classes: selectedClasses,
            groups: selectedGroups,
          }
        : { id: id.trim(), name: name.trim(), password: pass };

    Store.push(table, newUser);

    // A teacher's selected class + subject becomes an actual Course Class.
    // This is the common scope used by Add Students, Attendance, Grades, Timetable and Conversations.
    if (role === 'teacher') {
      const courseClasses = Store.get('courseClasses') || [];
      selectedCourseClasses.forEach(({ classKey, course }) => {
        const exists = courseClasses.some((cc) => cc.teacherId === newUser.id && cc.classKey === classKey && cc.course === course);
        if (!exists) {
          courseClasses.push({
            id: Store.uid('cc'),
            teacherId: newUser.id,
            classKey,
            course,
            section: 'A',
            groups: [...selectedGroups],
            studentIds: [],
          });
        }
      });
      Store.set('courseClasses', courseClasses);
    }

    Store.setRememberedLogin({ role, id: newUser.id, password: pass });
    login({ role, id: newUser.id, name: newUser.name });
    toast('Account created');
    navigate(role === 'student' ? '/student/dashboard' : role === 'teacher' ? '/teacher/dashboard' : '/admin/content');
  }

  return (
    <div className="login-wrap">
      <span className="eyebrow">Get started</span>
      <h1 className="mt-8" style={{ fontSize: 32 }}>
        Create your account
      </h1>
      <p className="muted mt-8">
        Set up your login once — your ID and password unlock everything in your portal.
      </p>

      <div className="role-switch">
        <button
          type="button"
          className={`role-btn ${role === 'student' ? 'active' : ''}`}
          onClick={() => switchRole('student')}
        >
           Student
        </button>
        <button
          type="button"
          className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
          onClick={() => switchRole('teacher')}
        >
           Teacher
        </button>
        {!contentManagerExists && (
          <button
            type="button"
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => switchRole('admin')}
          >
             Content Manager
          </button>
        )}
      </div>

      <div className="login-card">
        <div className={`login-error ${error ? 'show' : ''}`}>{error}</div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input
              type="text"
              placeholder="e.g. Aarav Mehta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>{role === 'student' ? 'Student ID' : role === 'teacher' ? 'Teacher ID' : 'Manager ID'}</label>
            <input
              type="text"
              placeholder={role === 'student' ? 'e.g. S104' : 'e.g. T202'}
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
            <div className="field-hint">
              Pick something you'll remember — this is what you'll log in with.
            </div>
          </div>

          {role === 'student' ? (
            <div className="role-fields show">
              <div className="grid-2">
                <div className="field">
                  <label>Year</label>
                  <select value={year} onChange={(e) => setYear(e.target.value)}>
                    {YEARS.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Branch</label>
                  <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                    {KNOWN_BRANCHES.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              {branch === 'Other' && (
                <div className="field">
                  <label>Enter your branch</label>
                  <input
                    type="text"
                    placeholder="e.g. Chemical Engineering"
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                  />
                </div>
              )}
              <div className="field">
                <label>Group</label>
                <select value={group} onChange={(e) => setGroup(e.target.value)}>
                  {ALL_GROUPS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                <div className="field-hint">Your lab/tutorial batch — ask your class rep if unsure.</div>
              </div>
              <div className="field-hint mb-16">
                Year + Branch is what connects you to your class's timetable, roster, and
                teacher — pick the ones that actually match your class.
              </div>
            </div>
          ) : role === 'teacher' ? (
            <div className="role-fields show">
              <div className="field">
                <label>Department</label>
                <input
                  type="text"
                  placeholder="e.g. CSE"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Class(es) you teach</label>
                {existingClasses.length === 0 ? (
                  <div className="field-hint">
                    No classes exist yet — add a student first, or ask an admin to set one up.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {existingClasses.map((c) => (
                      <label
                        key={c}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          border: '2px solid var(--line-strong)',
                          borderRadius: 999,
                          padding: '6px 12px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: selectedClasses.includes(c) ? 'var(--amber)' : '#fff',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(c)}
                          onChange={() => toggleClass(c)}
                          style={{ width: 'auto' }}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                )}
                <div className="field-hint mt-8">
                  Pick every class you teach — this is a checklist, not free text, so it can't
                  accidentally not match. You'll only see and manage students in these classes.
                </div>
              </div>

              <div className="field">
                <label>Subjects / course classes you teach</label>
                {selectedClasses.length === 0 ? (
                  <div className="field-hint">Select a class above first. Its subjects will appear here.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {selectedClasses.flatMap((classKey) =>
                      subjectsForClass(classKey).map((course) => {
                        const key = `${classKey}::${course}`;
                        const checked = selectedCourseClasses.some((x) => x.key === key);
                        return (
                          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '2px solid var(--line-strong)', borderRadius: 10, padding: '8px 10px', background: checked ? 'var(--amber)' : '#fff', cursor: 'pointer' }}>
                            <input type="checkbox" checked={checked} onChange={() => toggleCourseClass(classKey, course)} style={{ width: 'auto' }} />
                            <span><strong>{course}</strong><span className="small muted"> · {classKey}</span></span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
                <div className="field-hint mt-8">These selections create your Course Classes. Each one is kept separate by year, class, group and subject.</div>
              </div>

              <div className="field">
                <label>Restrict to specific groups (optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ALL_GROUPS.map((g) => (
                    <label
                      key={g}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        border: '2px solid var(--line-strong)',
                        borderRadius: 999,
                        padding: '6px 12px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: selectedGroups.includes(g) ? 'var(--sage)' : '#fff',
                        color: selectedGroups.includes(g) ? '#fff' : 'inherit',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(g)}
                        onChange={() => toggleGroup(g)}
                        style={{ width: 'auto' }}
                      />
                      {g}
                    </label>
                  ))}
                </div>
                <div className="field-hint mt-8">
                  Leave all unchecked to see your whole class. Only check groups if you're a
                  lab/tutorial instructor for specific batches.
                </div>
              </div>
            </div>
          ) : (
            <div className="role-fields show">
              <div className="field-hint mb-16"><strong>One-time setup:</strong> only one Content Manager account can be created for the website. That person manages Events, Clubs, Opportunities and Campus Updates.</div>
            </div>
          )}

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              minLength={6}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Confirm password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Create account
          </button>
        </form>
      </div>

      <div className="signup-row">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}
