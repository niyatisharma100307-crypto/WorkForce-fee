import { Store, courseClassLabel, getStudentCourseClasses } from '../../store.js';
import { useState } from 'react';
import { useAuth } from '../../components/AuthContext.jsx';

export default function StudentGrades() {
  const { session } = useAuth();
  const courseClasses = getStudentCourseClasses(session.id);
  const [courseClassId, setCourseClassId] = useState(courseClasses[0]?.id || 'all');
  const grades = Store.get('grades').filter((g) => { if (g.studentId !== session.id) return false; if (courseClassId === 'all') return true; if (g.courseClassId) return g.courseClassId === courseClassId; const cc = courseClasses.find((c) => c.course === g.subject && c.teacherId === g.teacherId); return cc?.id === courseClassId; });
  const gpaRecords = Store.get('gpaRecords')
    .filter((r) => r.studentId === session.id)
    .reverse();

  const avg = grades.length
    ? Math.round(grades.reduce((s, g) => s + g.marks, 0) / grades.length)
    : null;
  const totalCredits = grades.reduce((s, g) => s + (g.credit || 0), 0);
  const latestGpa = gpaRecords[0];

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Grade Card</h1>
          <div className="sub">Grades uploaded by your teachers for your enrolled course classes.</div>
        </div>
      </div>

      {courseClasses.length > 0 && <div className="panel mb-24"><div className="field" style={{ margin: 0, maxWidth: 680 }}><label>Course class</label><select value={courseClassId} onChange={(e) => setCourseClassId(e.target.value)}><option value="all">All my course classes</option>{courseClasses.map((cc) => <option key={cc.id} value={cc.id}>{courseClassLabel(cc)}</option>)}</select></div></div>}

      {latestGpa && (
        <div className="stat-row">
          <div className="stat-card stat-amber">
            <div className="icon">🎯</div>
            <div className="num">{latestGpa.sgpa.toFixed(2)}</div>
            <div className="label">SGPA — {latestGpa.term}</div>
          </div>
          <div className="stat-card stat-sage">
            <div className="icon">🏆</div>
            <div className="num">{latestGpa.cgpa.toFixed(2)}</div>
            <div className="label">CGPA (overall)</div>
          </div>
          <div className="stat-card stat-slate">
            <div className="icon">📚</div>
            <div className="num">{totalCredits}</div>
            <div className="label">Total credits</div>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <h3>Subject-wise performance</h3>
          <span className="tag tag-amber">{avg !== null ? `AVG ${avg}%` : 'AVG —'}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Term</th>
              <th>Marks</th>
              <th>Credit</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {grades.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="emoji">📊</div>
                    No grades posted yet. Check back after your next exam.
                  </div>
                </td>
              </tr>
            ) : (
              grades.map((g, i) => (
                <tr key={i}>
                  <td>{g.subject}</td>
                  <td>{g.term}</td>
                  <td>{g.marks}</td>
                  <td>{g.credit ?? '—'}</td>
                  <td>
                    <strong>{g.grade}</strong>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {gpaRecords.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <h3>SGPA / CGPA by term</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>SGPA</th>
                <th>CGPA</th>
              </tr>
            </thead>
            <tbody>
              {gpaRecords.map((r) => (
                <tr key={r.id}>
                  <td>{r.term}</td>
                  <td>{r.sgpa.toFixed(2)}</td>
                  <td>{r.cgpa.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
