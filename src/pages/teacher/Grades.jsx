import { useEffect, useState } from 'react';
import { Store, getTeacherCourseClasses, courseClassLabel, courseClassGroups, studentsForCourseClass } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import { Link } from 'react-router-dom';

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'];

function autoGradeFromMarks(value) {
  const m = parseInt(value, 10);
  if (Number.isNaN(m)) return 'A';
  if (m >= 90) return 'A+'; if (m >= 80) return 'A'; if (m >= 75) return 'A-'; if (m >= 70) return 'B+'; if (m >= 60) return 'B'; if (m >= 55) return 'B-'; if (m >= 50) return 'C+'; if (m >= 40) return 'C'; if (m >= 33) return 'D'; return 'F';
}

export default function TeacherGrades() {
  const { session } = useAuth();
  const toast = useToast();
  const courseClasses = getTeacherCourseClasses(session.id);
  const [courseClassId, setCourseClassId] = useState(courseClasses[0]?.id || '');
  const courseClass = courseClasses.find((cc) => cc.id === courseClassId);
  const groups = courseClassGroups(courseClass);
  const [group, setGroup] = useState(groups[0] || 'G1');
  const students = studentsForCourseClass(courseClass, group);
  const [term, setTerm] = useState('Sem 3');
  const [credit, setCredit] = useState('4');
  const [entries, setEntries] = useState({});
  const [grades, setGrades] = useState([]);

  useEffect(() => { if (!courseClasses.some((cc) => cc.id === courseClassId)) setCourseClassId(courseClasses[0]?.id || ''); }, [courseClassId, courseClasses]);
  useEffect(() => { const gs = courseClassGroups(courseClass); if (!gs.includes(group)) setGroup(gs[0] || 'G1'); }, [courseClassId]);
  useEffect(() => {
    const db = Store.get('grades') || [];
    setGrades(db.filter((g) => g.teacherId === session.id && (!courseClassId || g.courseClassId === courseClassId) && (!g.group || g.group === group)).reverse());
    setEntries({});
  }, [courseClassId, group]);

  function updateEntry(id, field, value) { setEntries((prev) => ({ ...prev, [id]: { marks: '', grade: 'A', ...prev[id], [field]: value } })); }

  function saveGrades() {
    if (!courseClass) return toast('Select a course class first');
    const db = Store.get('grades'); let added = 0; let updated = 0;
    students.forEach((s) => {
      const e = entries[s.id];
      if (!e || e.marks === '') return;
      const idx = db.findIndex((g) => g.studentId === s.id && g.teacherId === session.id && g.courseClassId === courseClassId && g.term === term);
      const record = { id: idx === -1 ? Store.uid('g') : db[idx].id, studentId: s.id, courseClassId, classKey: courseClass.classKey, group, subject: courseClass.course, marks: parseInt(e.marks, 10) || 0, grade: e.grade || autoGradeFromMarks(e.marks), credit: parseInt(credit, 10) || 0, term, teacherId: session.id };
      if (idx === -1) { db.push(record); added++; } else { db[idx] = record; updated++; }
    });
    if (!added && !updated) return toast('Enter marks for at least one student');
    Store.set('grades', db);
    setEntries({});
    setGrades(db.filter((g) => g.teacherId === session.id && g.courseClassId === courseClassId && (!g.group || g.group === group)).reverse());
    toast(`Grade card saved — ${added} added${updated ? `, ${updated} updated` : ''}`);
  }

  function deleteGrade(id) { if (!window.confirm('Delete this grade entry?')) return; Store.remove('grades', (g) => g.id === id); setGrades((g) => g.filter((x) => x.id !== id)); toast('Grade removed'); }

  if (!courseClasses.length) return <><div className="app-header"><div><h1>Grade Card</h1><div className="sub">Upload marks for a specific course class.</div></div></div><div className="empty-state"><div className="emoji">📊</div>No course classes assigned yet. <Link to="/teacher/roster">Add Students →</Link></div></>;

  return <>
    <div className="app-header"><div><h1>Grade Card</h1><div className="sub">Select the exact course, class, group and year. The marks you save belong only to this course class.</div></div></div>
    <div className="panel"><div className="grid-2"><div className="field" style={{ margin: 0 }}><label>Course class</label><select value={courseClassId} onChange={(e) => setCourseClassId(e.target.value)}>{courseClasses.map((cc) => <option key={cc.id} value={cc.id}>{courseClassLabel(cc)}</option>)}</select></div><div className="field" style={{ margin: 0 }}><label>Group</label><select value={group} onChange={(e) => setGroup(e.target.value)}>{groups.map((g) => <option key={g}>{g}</option>)}</select></div></div>{courseClass && <div className="field-hint mt-8"><strong>Subject:</strong> {courseClass.course} · <strong>Class:</strong> {courseClass.classKey} · <strong>Group:</strong> {group}</div>}</div>
    <div className="panel"><div className="panel-head"><div><h3>Upload Grade Card</h3><div className="small muted">Enter marks for the students in this exact course class.</div></div></div><div className="grid-2 mb-16"><div className="field" style={{ margin: 0 }}><label>Term</label><input value={term} onChange={(e) => setTerm(e.target.value)} /></div><div className="field" style={{ margin: 0, maxWidth: 180 }}><label>Credit</label><input type="number" min="1" max="6" value={credit} onChange={(e) => setCredit(e.target.value)} /></div></div>{students.length ? <><table className="data-table"><thead><tr><th>Student</th><th>ID</th><th>Marks / 100</th><th>Grade</th></tr></thead><tbody>{students.map((s) => { const e = entries[s.id] || { marks: '', grade: 'A' }; return <tr key={s.id}><td>{s.name}</td><td className="mono small">{s.id}</td><td><input type="number" min="0" max="100" value={e.marks} placeholder="—" onChange={(ev) => { const v = ev.target.value; updateEntry(s.id, 'marks', v); updateEntry(s.id, 'grade', autoGradeFromMarks(v)); }} style={{ width: 100 }} /></td><td><select value={e.grade} onChange={(ev) => updateEntry(s.id, 'grade', ev.target.value)} style={{ width: 90 }}>{GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}</select></td></tr>; })}</tbody></table><button className="btn btn-primary mt-16" onClick={saveGrades}>Save Grade Card</button></> : <div className="empty-state"><div className="emoji">👥</div>No students in this exact course, class and group. <Link to="/teacher/roster">Add Students →</Link></div>}</div>
    <div className="panel"><div className="panel-head"><h3>Grades uploaded for this course class</h3></div>{grades.length ? <table className="data-table"><thead><tr><th>Student</th><th>Subject</th><th>Group</th><th>Term</th><th>Marks</th><th>Grade</th><th></th></tr></thead><tbody>{grades.map((g) => <tr key={g.id}><td>{students.find((s) => s.id === g.studentId)?.name || g.studentId}</td><td>{g.subject}</td><td>{g.group || '—'}</td><td>{g.term}</td><td>{g.marks}</td><td><strong>{g.grade}</strong></td><td><button className="btn btn-sm btn-ghost" onClick={() => deleteGrade(g.id)}>Delete</button></td></tr>)}</tbody></table> : <div className="empty-state small">No grades uploaded for this course class yet.</div>}</div>
  </>;
}
