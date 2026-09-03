import { useEffect, useState } from 'react';
import { Store, ALL_GROUPS, getTeacherCourseClasses, courseClassLabel, courseClassGroups, studentsForCourseClass, classKeyOf } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';

const AVATAR_COLORS = ['#E8A33D', '#7A9B76', '#D96C6C', '#4A5568', '#C7822A', '#5C7D58'];
const DEFAULT_PASSWORD = 'pass123';

export default function TeacherRoster() {
  const { session } = useAuth();
  const toast = useToast();
  const teacherCourseClasses = getTeacherCourseClasses(session.id);
  const [courseClassId, setCourseClassId] = useState(teacherCourseClasses[0]?.id || '');
  const courseClass = teacherCourseClasses.find((cc) => cc.id === courseClassId);
  const groups = courseClassGroups(courseClass);
  const [group, setGroup] = useState(groups[0] || 'G1');
  const [bulk, setBulk] = useState('');
  const [fileName, setFileName] = useState('');
  const [lastCreated, setLastCreated] = useState([]);

  useEffect(() => {
    if (!teacherCourseClasses.some((cc) => cc.id === courseClassId)) setCourseClassId(teacherCourseClasses[0]?.id || '');
  }, [courseClassId, teacherCourseClasses]);

  useEffect(() => {
    const nextGroups = courseClassGroups(courseClass);
    if (!nextGroups.includes(group)) setGroup(nextGroups[0] || 'G1');
  }, [courseClassId]);

  function addStudents(records) {
    if (!courseClass) return toast('Select a course class first');
    const db = Store.get('students');
    const enrollments = Store.get('enrollments');
    const courseClasses = Store.get('courseClasses');
    const current = courseClasses.find((cc) => cc.id === courseClass.id);
    if (!current) return toast('Course class not found');
    const studentIds = new Set(Array.isArray(current.studentIds) ? current.studentIds : []);
    let next = Math.max(100, ...db.map((s) => parseInt(String(s.id).replace(/\D/g, ''), 10) || 0)) + 1;
    const created = [];

    records.forEach((r, i) => {
      const name = String(r.name || '').trim();
      if (!name) return;
      const studentGroup = String(r.group || group).trim() || group;
      // Never allow a row for another group into the selected course-class group.
      if (studentGroup !== group) return;
      let student = db.find((s) => s.id === r.id) || db.find((s) => s.name.toLowerCase() === name.toLowerCase() && classKeyOf(s) === current.classKey);
      if (!student) {
        const [branch, ...yearParts] = current.classKey.split('-');
        const year = yearParts.join('-');
        student = { id: r.id || `S${next++}`, name, branch, year, group: studentGroup, password: DEFAULT_PASSWORD, avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length] };
        db.push(student);
      }

      studentIds.add(student.id);
      const alreadyEnrolled = enrollments.some((e) => e.studentId === student.id && e.courseClassId === current.id && e.group === studentGroup);
      if (!alreadyEnrolled) {
        enrollments.push({
          id: Store.uid('enr'), studentId: student.id, courseClassId: current.id,
          classKey: current.classKey, course: current.course, group: studentGroup,
          year: current.classKey.split('-').slice(1).join('-'), branch: current.classKey.split('-')[0],
        });
      }
      created.push({ ...student, group: studentGroup });
    });

    current.studentIds = Array.from(studentIds);
    Store.set('students', db);
    Store.set('enrollments', enrollments);
    Store.set('courseClasses', courseClasses);
    setLastCreated(created);
    toast(`${created.length} student${created.length === 1 ? '' : 's'} uploaded to ${current.course} · ${group}`);
  }

  function parseLines(text) {
    return String(text).split(/\r?\n/).filter(Boolean).map((line) => {
      const [name, g, id] = line.split(',').map((x) => x.trim());
      return { name, group: g || group, id };
    }).filter((r) => r.name);
  }

  function handleBulk(e) {
    e.preventDefault();
    const records = parseLines(bulk);
    if (!records.length) return toast('Paste at least one student');
    addStudents(records);
    setBulk('');
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).split(/\r?\n/).filter(Boolean);
      const start = /^name\s*,/i.test(lines[0]) ? 1 : 0;
      addStudents(parseLines(lines.slice(start).join('\n')));
    };
    reader.readAsText(file);
  }

  const students = studentsForCourseClass(courseClass, group);
  const allowedGroups = courseClassGroups(courseClass).length ? courseClassGroups(courseClass) : ALL_GROUPS;

  if (!teacherCourseClasses.length) return <><div className="app-header"><div><h1>Add Students</h1><div className="sub">Upload students for one specific course, class, group and year.</div></div></div><div className="empty-state"><div className="emoji">📚</div>No course classes are assigned to you yet.</div></>;

  return <>
    <div className="app-header"><div><h1>Add Students</h1><div className="sub">Select the exact course, class, group and year before uploading the student list.</div></div></div>
    <div className="panel">
      <div className="grid-2">
        <div className="field" style={{ margin: 0 }}><label>Course class</label><select value={courseClassId} onChange={(e) => { setCourseClassId(e.target.value); setLastCreated([]); }}>{teacherCourseClasses.map((cc) => <option key={cc.id} value={cc.id}>{courseClassLabel(cc)}</option>)}</select></div>
        <div className="field" style={{ margin: 0 }}><label>Group</label><select value={group} onChange={(e) => { setGroup(e.target.value); setLastCreated([]); }}>{allowedGroups.map((g) => <option key={g}>{g}</option>)}</select></div>
      </div>
      {courseClass && <div className="field-hint mt-8"><strong>Selected:</strong> {courseClass.classKey} · {courseClass.course} · {group}. The uploaded list belongs only to this combination.</div>}
    </div>

    <div className="dash-grid"><div>
      <div className="panel"><div className="panel-head"><h3>Upload Student List</h3></div><p className="small muted mb-16">Upload a CSV for <strong>{courseClass?.course}</strong> and <strong>{group}</strong>. Format: <span className="mono">name,group,id</span>.</p><input type="file" accept=".csv,text/csv" onChange={handleFile} /><div className="field-hint mt-8">{fileName ? `Selected: ${fileName}` : 'This list is saved only for the selected course class and group.'}</div></div>
      <div className="panel"><div className="panel-head"><h3>Paste Student List</h3></div><form onSubmit={handleBulk}><div className="field"><label>One student per line</label><textarea value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={'Rohan Verma,G5,S301\nPriya Nair,G5,S302'} style={{ minHeight: 150 }} /></div><div className="field"><label>Group for rows without a group</label><select value={group} onChange={(e) => setGroup(e.target.value)}>{allowedGroups.map((g) => <option key={g}>{g}</option>)}</select></div><button className="btn btn-primary" type="submit">Upload Student List</button></form></div>
    </div><div>
      <div className="panel"><div className="panel-head"><div><h3>Students in this Course Class · {students.length}</h3>{courseClass && <div className="small muted">{courseClass.classKey} · {courseClass.course} · {group}</div>}</div></div>{students.length ? <div style={{ maxHeight: 480, overflowY: 'auto' }}>{students.map((s) => <div className="list-item" key={s.id}><div className="bullet" style={{ background: 'var(--sage)' }}></div><div><div className="li-title">{s.name}</div><div className="li-meta">{s.id} · {s.group || group} · {s.year}</div></div></div>)}</div> : <div className="empty-state small">No students have been uploaded for this exact course, class, group and year yet.</div>}</div>
      {lastCreated.length > 0 && <div className="panel"><strong>{lastCreated.length} student{lastCreated.length === 1 ? '' : 's'} added to {courseClass?.course} · {group}.</strong><div className="small muted mt-8">They are now available in this course class's attendance, grade card and conversations.</div></div>}
    </div></div>
  </>;
}
