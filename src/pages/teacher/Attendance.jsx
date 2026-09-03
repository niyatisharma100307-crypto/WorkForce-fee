import { useEffect, useState } from 'react';
import {
  Store,
  fmtDate,
  courseClassLabel,
  courseClassGroups,
  getTeacherCourseClasses,
  getTeacherClasses,
  subjectsForClass,
  studentsForCourseClass,
} from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal.jsx';

export default function TeacherAttendance() {
  const { session } = useAuth();
  const toast = useToast();
  const [refreshTick, setRefreshTick] = useState(0);
  const courseClasses = getTeacherCourseClasses(session.id);
  void refreshTick;
  const [newClassOpen, setNewClassOpen] = useState(false);
  const [newClass, setNewClass] = useState({ classKey: '', course: '', section: '', groups: 'All' });
  const [courseClassId, setCourseClassId] = useState(courseClasses[0]?.id ?? '');
  const courseClass = courseClasses.find((cc) => cc.id === courseClassId);
  const groups = courseClassGroups(courseClass);
  const [group, setGroup] = useState(groups[0] || 'G1');
  const students = studentsForCourseClass(courseClass, group);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [roster, setRoster] = useState({});
  const [recent, setRecent] = useState(() => Store.get('attendance').filter((a) => a.teacherId === session.id).slice(-12).reverse());

  useEffect(() => {
    if (!courseClasses.some((cc) => cc.id === courseClassId)) setCourseClassId(courseClasses[0]?.id ?? '');
  }, [courseClassId, courseClasses]);
  useEffect(() => {
    const gs = courseClassGroups(courseClass);
    if (!gs.includes(group)) setGroup(gs[0] || 'G1');
  }, [courseClassId]);

  useEffect(() => {
    const existing = Store.get('attendance');
    const next = {};
    students.forEach((s) => {
      const rec = existing.find((a) =>
        a.studentId === s.id &&
        a.teacherId === session.id &&
        a.courseClassId === courseClassId &&
        (a.group || students.find((st) => st.id === a.studentId)?.group) === group &&
        a.date === date
      );
      next[s.id] = rec ? rec.status : 'present';
    });
    setRoster(next);
  }, [courseClassId, group, date]);

  function setStatus(studentId, status) {
    setRoster((r) => ({ ...r, [studentId]: status }));
  }

  function refreshRecent() {
    setRecent(Store.get('attendance').filter((a) => a.teacherId === session.id).slice(-12).reverse());
  }

  function createCourseClass(e) {
    e.preventDefault();
    if (!newClass.classKey || !newClass.course) { toast('Choose a class and course'); return; }
    const groups = newClass.groups === 'All' ? [] : newClass.groups.split(',').map((g) => g.trim()).filter(Boolean);
    const item = { id: Store.uid('cc'), teacherId: session.id, classKey: newClass.classKey, course: newClass.course, section: newClass.section.trim() || 'Main', groups, studentIds: [] };
    Store.push('courseClasses', item);
    setNewClassOpen(false); setNewClass({ classKey: '', course: '', section: '', groups: 'All' }); setRefreshTick((n) => n + 1); setCourseClassId(item.id);
    toast('Course class created');
  }

  function saveAttendance() {
    if (!courseClass) {
      toast('Create or select a course class first');
      return;
    }
    const db = Store.get('attendance');
    Object.keys(roster).forEach((studentId) => {
      const idx = db.findIndex((a) =>
        a.studentId === studentId &&
        a.teacherId === session.id &&
        a.courseClassId === courseClassId &&
        (a.group || students.find((st) => st.id === a.studentId)?.group) === group &&
        a.date === date
      );
      const record = {
        id: idx === -1 ? Store.uid('att') : db[idx].id,
        studentId,
        teacherId: session.id,
        courseClassId,
        classKey: courseClass.classKey,
        subject: courseClass.course,
        group: students.find((s) => s.id === studentId)?.group || null,
        date,
        status: roster[studentId],
      };
      if (idx !== -1) db[idx] = record;
      else db.push(record);
    });
    Store.set('attendance', db);
    toast('Attendance saved for this course class');
    refreshRecent();
  }

  if (courseClasses.length === 0) {
    return (
      <>
        <div className="app-header"><div><h1>Attendance</h1><div className="sub">Attendance is separated by your specific course class.</div></div></div>
        <div className="empty-state">
          <div className="emoji">📚</div>
          No course classes have been assigned to you yet. Ask the administrator to assign a course, year, class and group.
          <div className="mt-16"><Link to="/teacher/roster" style={{ textDecoration: 'underline', fontWeight: 700 }}>Add Students →</Link></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="app-header">
        <div><h1>Attendance</h1><div className="sub">Select one course class. Only its own student list is shown and updated.</div></div>
        <button className="btn btn-primary" onClick={() => { const first = courseClasses[0]; setNewClass({ classKey: first?.classKey || '', course: first?.course || '', section: '', groups: 'All' }); setNewClassOpen(true); }}>+ New course class</button>
      </div>

      <div className="panel">
        <div className="field" style={{ margin: 0, maxWidth: 620 }}>
          <label>Course class</label>
          <select value={courseClassId} onChange={(e) => setCourseClassId(e.target.value)}>
            {courseClasses.map((cc) => <option key={cc.id} value={cc.id}>{courseClassLabel(cc)}</option>)}
          </select>
          <div className="field-hint">This identifies the year, class and subject. Choose the group below so attendance is kept separate for each group.</div>
        </div>
        <div className="field mt-16" style={{ marginBottom: 0, maxWidth: 620 }}>
          <label>Group</label>
          <select value={group} onChange={(e) => setGroup(e.target.value)}>{groups.map((g) => <option key={g}>{g}</option>)}</select>
        </div>
        {courseClass && <div className="small muted mt-16"><strong>{students.length}</strong> students in {courseClass.course} · {group}.</div>}
      </div>

      <div className="panel">
        <div className="flex-between mb-16">
          <div><h3>{courseClass?.course}</h3><div className="small muted">{courseClass?.classKey} · {group}</div></div>
          <div className="flex-gap"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><button className="btn btn-primary" onClick={saveAttendance} disabled={students.length === 0}>Save attendance</button></div>
        </div>
        {students.length === 0 ? (
          <div className="empty-state"><div className="emoji">👥</div>No students are assigned to this course class. Use <Link to="/teacher/roster" style={{ textDecoration: 'underline', fontWeight: 700, marginLeft: 4 }}>Add Students</Link> first.</div>
        ) : (
          <table className="data-table"><thead><tr><th>Student</th><th>ID</th><th>Group</th><th style={{ textAlign: 'right' }}>Status</th></tr></thead><tbody>
            {students.map((s) => <tr key={s.id}><td>{s.name}</td><td className="mono small">{s.id}</td><td className="small muted">{s.group || '—'}</td><td style={{ textAlign: 'right' }}><div className="flex-gap" style={{ justifyContent: 'flex-end' }}><button type="button" className={`btn btn-sm ${roster[s.id] === 'present' ? 'btn-sage' : 'btn-ghost'}`} onClick={() => setStatus(s.id, 'present')}>Present</button><button type="button" className={`btn btn-sm ${roster[s.id] === 'absent' ? 'btn-coral' : 'btn-ghost'}`} onClick={() => setStatus(s.id, 'absent')}>Absent</button></div></td></tr>)}
          </tbody></table>
        )}
      </div>

      <Modal open={newClassOpen} onClose={() => setNewClassOpen(false)} title="Create course class">
        <form onSubmit={createCourseClass}>
          <div className="field"><label>Class / year</label><select value={newClass.classKey} onChange={(e) => setNewClass((f) => ({ ...f, classKey: e.target.value, course: subjectsForClass(e.target.value)[0] }))}>{getTeacherClasses(session.id).map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label>Course</label><select value={newClass.course} onChange={(e) => setNewClass((f) => ({ ...f, course: e.target.value }))}>{subjectsForClass(newClass.classKey || getTeacherClasses(session.id)[0]).map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="field"><label>Section / special class name</label><input value={newClass.section} onChange={(e) => setNewClass((f) => ({ ...f, section: e.target.value }))} placeholder="e.g. Lab G1-G3" /></div>
          <div className="field"><label>Groups</label><input value={newClass.groups} onChange={(e) => setNewClass((f) => ({ ...f, groups: e.target.value }))} placeholder="All or G1,G2,G3" /><div className="field-hint">Use the Add Students page to upload the distinct student list for this course.</div></div>
          <button className="btn btn-primary btn-block" type="submit">Create course class</button>
        </form>
      </Modal>

      <div className="panel"><div className="panel-head"><h3>Recently marked by you</h3></div><table className="data-table"><thead><tr><th>Date</th><th>Course class</th><th>Student</th><th>Status</th></tr></thead><tbody>
        {recent.length === 0 ? <tr><td colSpan={4} className="muted">No records yet.</td></tr> : recent.map((r, i) => <tr key={i}><td>{fmtDate(r.date)}</td><td>{r.subject}<div className="small muted">{r.classKey || '—'}</div></td><td>{Store.get('students').find((s) => s.id === r.studentId)?.name || r.studentId}</td><td><span className={`status-pill status-${r.status}`}>{r.status === 'present' ? 'Present' : 'Absent'}</span></td></tr>)}
      </tbody></table></div>
    </>
  );
}
