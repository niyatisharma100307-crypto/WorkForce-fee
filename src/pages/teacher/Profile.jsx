import { useState } from 'react';
import { Store, allClassKeys, ALL_GROUPS, subjectsForClass, KNOWN_BRANCHES, YEARS } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';

export default function TeacherProfile() {
  const { session, login } = useAuth();
  const toast = useToast();
  const teacher = Store.get('teachers').find((t) => t.id === session.id);

  const [name, setName] = useState(teacher?.name ?? '');
  const [dept, setDept] = useState(teacher?.dept ?? '');

  // Teacher class & subject state (mirrors Signup.jsx)
  const [teacherYear, setTeacherYear] = useState('1st Year');
  const [teacherBranch, setTeacherBranch] = useState('CSE');
  const [teacherCustomBranch, setTeacherCustomBranch] = useState('');

  const initialClasses = teacher?.classes && teacher.classes.length > 0 ? teacher.classes : ['CSE-1st Year'];
  const [selectedClasses, setSelectedClasses] = useState(initialClasses);
  const [activeClassTab, setActiveClassTab] = useState(initialClasses[0] || 'CSE-1st Year');

  // Per-class groups state mapping classKey -> string[]
  const [classGroups, setClassGroups] = useState(() => {
    if (!session?.id) return teacher?.classGroups ?? {};
    const teacherCCs = (Store.get('courseClasses') || []).filter((cc) => cc.teacherId === session.id);
    const initialMap = { ...(teacher?.classGroups || {}) };
    teacherCCs.forEach((cc) => {
      if (cc.classKey && Array.isArray(cc.groups) && cc.groups.length > 0) {
        initialMap[cc.classKey] = cc.groups;
      }
    });
    return initialMap;
  });

  // Initialize selected courseClasses for this teacher
  const [selectedCourseClasses, setSelectedCourseClasses] = useState(() => {
    if (!session?.id) return [];
    const teacherCCs = (Store.get('courseClasses') || []).filter((cc) => cc.teacherId === session.id);
    if (teacherCCs.length > 0) {
      return teacherCCs.map((cc) => ({
        key: `${cc.classKey}::${cc.course}`,
        classKey: cc.classKey,
        course: cc.course,
      }));
    }
    // Fallback: pre-select default subjects for assigned classes if courseClasses table hasn't been set up yet
    const defaults = [];
    initialClasses.forEach((classKey) => {
      const subjects = subjectsForClass(classKey);
      subjects.forEach((course) => {
        defaults.push({ key: `${classKey}::${course}`, classKey, course });
      });
    });
    return defaults;
  });

  const [error, setError] = useState('');

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [passError, setPassError] = useState('');

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

  function handleDetailsSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (selectedClasses.length === 0) {
      setError('Pick at least one class you teach.');
      return;
    }
    if (selectedCourseClasses.length === 0) {
      setError('Pick at least one subject for the class you teach.');
      return;
    }
    setError('');

    const allTeacherGroups = [...new Set(Object.values(classGroups).flat())];

    // Update teacher record in Store
    Store.update(
      'teachers',
      (t) => t.id === session.id,
      (t) => ({
        ...t,
        name: name.trim(),
        dept: dept.trim() || 'Undeclared',
        classes: selectedClasses,
        groups: allTeacherGroups,
        classGroups: classGroups,
      })
    );

    // Synchronize courseClasses table in Store
    const allCCs = Store.get('courseClasses') || [];
    const otherCCs = allCCs.filter((cc) => cc.teacherId !== session.id);
    const existingMyCCs = allCCs.filter((cc) => cc.teacherId === session.id);

    const updatedMyCCs = selectedCourseClasses.map(({ classKey, course }) => {
      const existing = existingMyCCs.find((cc) => cc.classKey === classKey && cc.course === course);
      const groupsForClass = classGroups[classKey] || [];
      if (existing) {
        return {
          ...existing,
          groups: [...groupsForClass],
        };
      } else {
        return {
          id: Store.uid('cc'),
          teacherId: session.id,
          classKey,
          course,
          section: 'A',
          groups: [...groupsForClass],
          studentIds: [],
        };
      }
    });

    Store.set('courseClasses', [...otherCCs, ...updatedMyCCs]);

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
