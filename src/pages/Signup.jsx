import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, allClassKeys, ALL_GROUPS, subjectsForClass, KNOWN_BRANCHES, YEARS } from '../store.js';
import { useAuth } from '../components/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

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
  const [teacherYear, setTeacherYear] = useState('1st Year');
  const [teacherBranch, setTeacherBranch] = useState('CSE');
  const [teacherCustomBranch, setTeacherCustomBranch] = useState('');
  const [selectedClasses, setSelectedClasses] = useState(['CSE-1st Year']);
  const [activeClassTab, setActiveClassTab] = useState('CSE-1st Year');
  const [classGroups, setClassGroups] = useState({});
  const [selectedCourseClasses, setSelectedCourseClasses] = useState([]);

  function handleTeacherYearChange(newYear) {
    setTeacherYear(newYear);
  }

  function handleTeacherBranchChange(newBranch) {
    setTeacherBranch(newBranch);
  }

  function handleTeacherCustomBranchChange(newCustomBranch) {
    setTeacherCustomBranch(newCustomBranch);
  }

  function addCurrentTeacherClass() {
    const finalB = teacherBranch === 'Other' ? (teacherCustomBranch.trim() || 'Other') : teacherBranch;
    const classKey = `${finalB}-${teacherYear}`;
    if (!selectedClasses.includes(classKey)) {
      const nextClasses = [...selectedClasses, classKey];
      setSelectedClasses(nextClasses);
      setActiveClassTab(classKey);
    } else {
      setActiveClassTab(classKey);
    }
  }

  function removeTeacherClass(classKey, e) {
    if (e) e.stopPropagation();
    if (selectedClasses.length > 1) {
      const nextClasses = selectedClasses.filter((c) => c !== classKey);
      setSelectedClasses(nextClasses);
      if (activeClassTab === classKey) {
        setActiveClassTab(nextClasses[0]);
      }
      setSelectedCourseClasses((prev) => prev.filter((x) => x.classKey !== classKey));
    }
  }

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

  function toggleClassGroup(classKey, g) {
    if (!classKey) return;
    setClassGroups((prev) => {
      const current = prev[classKey] || [];
      const next = current.includes(g) ? current.filter((x) => x !== g) : [...current, g];
      return { ...prev, [classKey]: next };
    });
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
    const allTeacherGroups = [...new Set(Object.values(classGroups).flat())];

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
            groups: allTeacherGroups,
            classGroups: classGroups,
          }
        : { id: id.trim(), name: name.trim(), password: pass };

    Store.push(table, newUser);

    if (role === 'teacher') {
      const courseClasses = Store.get('courseClasses') || [];
      selectedCourseClasses.forEach(({ classKey, course }) => {
        const exists = courseClasses.some((cc) => cc.teacherId === newUser.id && cc.classKey === classKey && cc.course === course);
        if (!exists) {
          const groupsForThisClass = classGroups[classKey] || [];
          courseClasses.push({
            id: Store.uid('cc'),
            teacherId: newUser.id,
            classKey,
            course,
            section: 'A',
            groups: [...groupsForThisClass],
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
                <div className="grid-2">
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Year</label>
                    <select value={teacherYear} onChange={(e) => handleTeacherYearChange(e.target.value)}>
                      {YEARS.map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Branch</label>
                    <select value={teacherBranch} onChange={(e) => handleTeacherBranchChange(e.target.value)}>
                      {KNOWN_BRANCHES.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {teacherBranch === 'Other' && (
                  <div className="field mt-8" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Enter your branch</label>
                    <input
                      type="text"
                      placeholder="e.g. Chemical Engineering"
                      value={teacherCustomBranch}
                      onChange={(e) => handleTeacherCustomBranchChange(e.target.value)}
                    />
                  </div>
                )}

                <div className="mt-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Selected Class(es):</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={addCurrentTeacherClass}
                    style={{ fontSize: 12, padding: '5px 12px', fontWeight: 600 }}
                  >
                    + Add Class ({teacherBranch === 'Other' ? (teacherCustomBranch.trim() || 'Other') : teacherBranch}-{teacherYear})
                  </button>
                </div>

                <div className="mt-8" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedClasses.map((c) => {
                    const isActive = c === (selectedClasses.includes(activeClassTab) ? activeClassTab : selectedClasses[0]);
                    const checkedCount = selectedCourseClasses.filter((x) => x.classKey === c).length;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setActiveClassTab(c)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          border: isActive ? '2px solid var(--ink)' : '2px solid var(--line-strong)',
                          borderRadius: 999,
                          padding: '6px 14px',
                          fontSize: 13,
                          fontWeight: 600,
                          background: isActive ? 'var(--amber)' : '#fff',
                          color: 'var(--ink)',
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{c}</span>
                        {checkedCount > 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              background: isActive ? '#fff' : 'var(--amber)',
                              borderRadius: 10,
                              padding: '1px 6px',
                              fontWeight: 700,
                            }}
                          >
                            {checkedCount}
                          </span>
                        )}
                        {selectedClasses.length > 1 && (
                          <span
                            onClick={(e) => removeTeacherClass(c, e)}
                            style={{
                              marginLeft: 4,
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: 14,
                              opacity: 0.7,
                            }}
                            title="Remove class"
                          >
                            ×
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="field-hint mt-8">
                  Click any selected class above to view and choose its subjects below.
                </div>
              </div>

              <div className="field">
                {(() => {
                  const currentTab = selectedClasses.includes(activeClassTab) ? activeClassTab : (selectedClasses[0] || '');
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ margin: 0 }}>Subjects / course classes you teach</label>
                        {currentTab && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 6 }}>
                            Showing for: <strong>{currentTab}</strong>
                          </span>
                        )}
                      </div>
                      {!currentTab ? (
                        <div className="field-hint">Select a class above first. Its subjects will appear here.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: 8 }}>
                          {subjectsForClass(currentTab).map((course) => {
                            const key = `${currentTab}::${course}`;
                            const checked = selectedCourseClasses.some((x) => x.key === key);
                            return (
                              <label
                                key={key}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  border: '2px solid var(--line-strong)',
                                  borderRadius: 10,
                                  padding: '8px 10px',
                                  background: checked ? 'var(--amber)' : '#fff',
                                  cursor: 'pointer',
                                  fontWeight: checked ? 600 : 400,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleCourseClass(currentTab, course)}
                                  style={{ width: 'auto' }}
                                />
                                <span>
                                  <strong>{course}</strong>
                                  <span className="small muted"> · {currentTab}</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      <div className="field-hint mt-8">
                        Pick subjects for <strong>{currentTab || 'each class'}</strong>. Click different classes under "Selected Class(es)" above to set subjects for each one.
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="field">
                {(() => {
                  const currentTab = selectedClasses.includes(activeClassTab) ? activeClassTab : (selectedClasses[0] || '');
                  const currentTabGroups = currentTab ? (classGroups[currentTab] || []) : [];
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ margin: 0 }}>Restrict to specific groups (optional)</label>
                        {currentTab && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 6 }}>
                            Configuring for: <strong>{currentTab}</strong>
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {ALL_GROUPS.map((g) => {
                          const isChecked = currentTabGroups.includes(g);
                          return (
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
                                background: isChecked ? 'var(--sage)' : '#fff',
                                color: isChecked ? '#fff' : 'inherit',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleClassGroup(currentTab, g)}
                                style={{ width: 'auto' }}
                              />
                              {g}
                            </label>
                          );
                        })}
                      </div>
                      <div className="field-hint mt-8">
                        Leave all unchecked to see your whole class for <strong>{currentTab || 'each class'}</strong>. Only check groups if you're a lab/tutorial instructor for specific batches in this class.
                      </div>
                    </>
                  );
                })()}
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
