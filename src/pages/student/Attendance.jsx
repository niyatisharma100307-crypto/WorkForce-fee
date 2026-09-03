import { Store, fmtDate, getStudentCourseClasses, courseClassLabel } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';

const THRESHOLD = 0.75;

/**
 * Given present/total classes so far, work out either:
 * - how many more classes can be skipped in a row and still stay >= 75%, or
 * - how many classes in a row need to be attended to climb back to 75%.
 */
function attendanceOutlook(present, total) {
  const pct = total ? present / total : 0;

  if (pct >= THRESHOLD) {
    // present / (total + x) >= 0.75  =>  x <= present/0.75 - total
    const skippable = Math.floor(present / THRESHOLD - total);
    return { safe: true, count: Math.max(skippable, 0) };
  }

  // (present + y) / (total + y) >= 0.75  =>  y >= 3*total - 4*present
  const needed = Math.max(Math.ceil(3 * total - 4 * present), 1);
  return { safe: false, count: needed };
}

export default function StudentAttendance() {
  const { session } = useAuth();
  const allAttendance = Store.get('attendance').filter((a) => a.studentId === session.id);
  const teachers = Store.get('teachers');
  const courseClasses = getStudentCourseClasses(session.id);
  const teacherName = (id) => teachers.find((t) => t.id === id)?.name || null;

  const groups = {};
  allAttendance.forEach((a) => {
    const key = a.courseClassId || `${a.subject}__${a.teacherId || 'unknown'}__${a.classKey || ''}`;
    groups[key] = groups[key] || { key, subject: a.subject, teacherId: a.teacherId, classKey: a.classKey, courseClassId: a.courseClassId, present: 0, total: 0 };
    groups[key].total++;
    if (a.status === 'present') groups[key].present++;
  });
  const subjectGroups = Object.values(groups).sort((a, b) => a.subject.localeCompare(b.subject));

  return <>
    <div className="app-header"><div><h1>Attendance</h1><div className="sub">Only attendance uploaded for your own course classes and teachers is shown.</div></div></div>
    {courseClasses.length > 0 && <div className="panel mb-24"><div className="panel-head"><h3>My course classes</h3></div><div className="grid-2">{courseClasses.map((cc) => <div className="card" key={cc.id}><strong>{cc.course}</strong><div className="small muted mt-8">{courseClassLabel(cc)}</div></div>)}</div></div>}
    <div className="grid-2 mb-24">
      {subjectGroups.length === 0 ? <div className="empty-state"><div className="emoji">✅</div>No attendance recorded by your teachers yet.</div> : subjectGroups.map((grp) => {
        const { subject, teacherId, present, total, classKey, courseClassId } = grp;
        const pct = Math.round((present / total) * 100);
        const cls = pct >= 75 ? '' : pct >= 60 ? 'mid' : 'low';
        const outlook = attendanceOutlook(present, total);
        const cc = courseClasses.find((c) => c.id === courseClassId);
        return <div className="card" key={grp.key}>
          <div className="flex-between mb-8"><div className="flex-gap"><strong>{subject}</strong>{!outlook.safe && <span className="tag tag-coral">Danger zone</span>}</div><span className="mono small">{present}/{total} · {pct}%</span></div>
          <div className="small muted mb-8">{cc ? courseClassLabel(cc) : `${classKey || 'Class'} · ${teacherName(teacherId) || 'Teacher'}`}</div>
          <div className="attend-bar-track"><div className={`attend-bar-fill ${cls}`} style={{ width: `${pct}%` }}></div></div>
          <div className="small mt-8" style={{ color: outlook.safe ? 'var(--sage-deep)' : 'var(--coral-deep)' }}>{outlook.safe ? (outlook.count > 0 ? `You can skip up to ${outlook.count} more class${outlook.count === 1 ? '' : 'es'} and stay at or above 75%.` : `Right at the edge — don't miss the next one.`) : `Below 75% requirement. Attend the next ${outlook.count} class${outlook.count === 1 ? '' : 'es'} in a row to get back on track.`}</div>
        </div>;
      })}
    </div>
    <div className="panel"><div className="panel-head"><h3>Full log</h3></div><table className="data-table"><thead><tr><th>Date</th><th>Course</th><th>Teacher</th><th>Status</th></tr></thead><tbody>{allAttendance.length === 0 ? <tr><td colSpan={4} className="muted">Nothing to show yet.</td></tr> : [...allAttendance].reverse().map((a, i) => <tr key={i}><td>{fmtDate(a.date)}</td><td>{a.subject}<div className="small muted">{a.classKey || '—'}</div></td><td className="small muted">{teacherName(a.teacherId) || '—'}</td><td><span className={`status-pill status-${a.status}`}>{a.status === 'present' ? 'Present' : 'Absent'}</span></td></tr>)}</tbody></table></div>
  </>;
}
