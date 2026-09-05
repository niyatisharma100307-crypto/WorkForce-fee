import { useState, useEffect } from 'react';
import { Store, fmtDate } from '../../store.js';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const list = Store.get('announcements').slice().reverse();
    const tList = Store.get('teachers');
    setAnnouncements(list);
    setTeachers(tList);
  }, []);

  function getTeacherInfo(teacherId) {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (teacher) {
      return `${teacher.name}${teacher.dept ? ` (${teacher.dept})` : ''}`;
    }
    return teacherId || 'Faculty';
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Announcements</h1>
          <div className="sub">Updates and notices issued by your teachers.</div>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state">
          No announcements posted by teachers yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {announcements.map((a) => (
            <div className="panel" key={a.id}>
              <div className="panel-head">
                <div>
                  <h3 style={{ fontSize: 18, marginBottom: 4 }}>{a.title}</h3>
                  <div className="small muted">
                    Posted by <strong>{getTeacherInfo(a.teacherId)}</strong>
                  </div>
                </div>
                <span className="small muted mono">{fmtDate(a.date)}</span>
              </div>
              <p className="small" style={{ marginTop: 12, lineHeight: 1.6, color: 'var(--ink)' }}>
                {a.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
