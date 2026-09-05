import { useEffect, useState } from 'react';
import { Store, getTeacherCourseClasses, courseClassLabel, courseClassGroups } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';

const PERIODS = ['P1', 'P2', 'P3', 'P4', 'P5'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function emptyGrid() { const g = {}; DAYS.forEach((d) => { g[d] = PERIODS.map(() => '—'); }); return g; }
function cloneGrid(value) { const g = emptyGrid(); DAYS.forEach((d) => { g[d] = [...(value?.[d] || g[d])]; }); return g; }

export default function TeacherTimetable() {
  const { session } = useAuth();
  const toast = useToast();
  const courseClasses = getTeacherCourseClasses(session.id);
  const [courseClassId, setCourseClassId] = useState(courseClasses[0]?.id || '');
  const courseClass = courseClasses.find((cc) => cc.id === courseClassId);
  const groups = courseClassGroups(courseClass);
  const [group, setGroup] = useState(groups[0] || 'G1');
  const [grid, setGrid] = useState(emptyGrid());

  useEffect(() => { if (!courseClasses.some((cc) => cc.id === courseClassId)) setCourseClassId(courseClasses[0]?.id || ''); }, [courseClassId, courseClasses]);
  useEffect(() => { const gs = courseClassGroups(courseClass); if (!gs.includes(group)) setGroup(gs[0] || 'G1'); }, [courseClassId]);
  useEffect(() => {
    const db = Store.get('timetable') || {};
    const scoped = db[courseClassId]?.[group];
    const legacy = courseClass ? db[courseClass.classKey] : null;
    setGrid(cloneGrid(scoped || legacy));
  }, [courseClassId, group]);

  function updateCell(day, index, value) { setGrid((g) => ({ ...g, [day]: [...g[day].slice(0, index), value, ...g[day].slice(index + 1)] })); }
  function handleSave() {
    if (!courseClass) return;
    const db = Store.get('timetable') || {};
    if (!db[courseClassId] || DAYS.every((d) => Array.isArray(db[courseClassId]?.[d]))) db[courseClassId] = { ...(db[courseClassId] || {}) };
    db[courseClassId][group] = grid;
    Store.set('timetable', db);
    toast(`Timetable saved for ${courseClass.course} · ${group}`);
  }

  if (!courseClasses.length) return <><div className="app-header"><div><h1>Timetable</h1><div className="sub">Upload/update a timetable for a specific course class.</div></div></div><div className="empty-state">No course classes assigned yet.</div></>;

  return <>
    <div className="app-header"><div><h1>Timetable</h1><div className="sub">Select the exact course, class, group and year. Students in that course class will see this timetable.</div></div></div>
    <div className="panel"><div className="grid-2"><div className="field" style={{ margin: 0 }}><label>Course class</label><select value={courseClassId} onChange={(e) => setCourseClassId(e.target.value)}>{courseClasses.map((cc) => <option key={cc.id} value={cc.id}>{courseClassLabel(cc)}</option>)}</select></div><div className="field" style={{ margin: 0 }}><label>Group</label><select value={group} onChange={(e) => setGroup(e.target.value)}>{groups.map((g) => <option key={g}>{g}</option>)}</select></div></div>{courseClass && <div className="field-hint mt-8"><strong>{courseClass.classKey} · {courseClass.course} · {group}</strong>. Save here and only this course-class group receives it.</div>}</div>
    <div className="panel"><div className="flex-between mb-16"><div><h3>Upload / Update Timetable</h3><div className="small muted">Edit the weekly schedule for this selected course class.</div></div><button className="btn btn-primary" onClick={handleSave}>Save timetable</button></div><div style={{ overflowX: 'auto' }}><table className="tt-table"><tbody><tr><th>Period</th>{DAYS.map((d) => <th key={d}>{d}</th>)}</tr>{PERIODS.map((p, i) => <tr key={p}><td>{p}</td>{DAYS.map((d) => <td key={d}><input type="text" value={grid[d]?.[i] ?? ''} onChange={(e) => updateCell(d, i, e.target.value)} style={{ width: '100%', border: '1.5px solid var(--line-strong)', borderRadius: 6, padding: '6px 8px', fontSize: 12.5, textAlign: 'center', background: 'var(--paper)' }} /></td>)}</tr>)}</tbody></table></div><div className="field-hint mt-16">Use — for a free period. The saved timetable is scoped to this exact course class and group.</div></div>
  </>;
}
