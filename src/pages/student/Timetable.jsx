import { useState } from 'react';
import { Store, courseClassLabel, getStudentCourseClasses } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';

const PERIODS = ['P1', 'P2', 'P3', 'P4', 'P5'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function StudentTimetable() {
  const { session } = useAuth();
  const courseClasses = getStudentCourseClasses(session.id);
  const [courseClassId, setCourseClassId] = useState(courseClasses[0]?.id || '');
  const courseClass = courseClasses.find((cc) => cc.id === courseClassId);
  const group = (Store.get('enrollments') || []).find((e) => e.studentId === session.id && e.courseClassId === courseClassId)?.group || Store.get('students').find((s) => s.id === session.id)?.group || 'G1';
  const timetableDb = Store.get('timetable') || {};
  const scoped = timetableDb[courseClassId]?.[group];
  const legacy = courseClass ? timetableDb[courseClass.classKey] : null;
  const tt = scoped || legacy;

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Timetable</h1>
          <div className="sub">Your timetable for the selected course class and group.</div>
        </div>
      </div>

      {courseClasses.length === 0 ? (
        <div className="empty-state"><div className="emoji">🗓️</div>No course classes are assigned to you yet.</div>
      ) : (
      <><div className="panel mb-24"><div className="field" style={{ margin: 0, maxWidth: 680 }}><label>Course class</label><select value={courseClassId} onChange={(e) => setCourseClassId(e.target.value)}>{courseClasses.map((cc) => <option key={cc.id} value={cc.id}>{courseClassLabel(cc)}</option>)}</select><div className="field-hint">{courseClass?.classKey} · {courseClass?.course} · {group}</div></div></div>{!tt ? (
        <div className="empty-state">
          <div className="emoji">🗓️</div>
          No timetable has been set for this course class ({courseClass?.classKey} · {courseClass?.course} · {group}) yet. Check back once your
          teacher has added it.
        </div>
      ) : (
      <div className="panel" style={{ overflowX: 'auto' }}>
        <table className="tt-table">
          <tbody>
            <tr>
              <th>Period</th>
              {DAYS.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
            {PERIODS.map((p, i) => (
              <tr key={p}>
                <td>{p}</td>
                {DAYS.map((d) => (
                  <td key={d}>{tt[d]?.[i] ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}</>
      )}
    </>
  );
}
