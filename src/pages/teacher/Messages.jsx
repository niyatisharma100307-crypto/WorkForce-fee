import { useEffect, useRef, useState } from 'react';
import { Store, courseClassLabel, courseClassGroups, getTeacherCourseClasses, studentsForCourseClass } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';

export default function TeacherMessages() {
  const { session } = useAuth();
  const courseClasses = getTeacherCourseClasses(session.id);
  const [courseClassId, setCourseClassId] = useState(courseClasses[0]?.id ?? '');
  const courseClass = courseClasses.find((cc) => cc.id === courseClassId);
  const groups = courseClassGroups(courseClass);
  const [group, setGroup] = useState(groups[0] || 'G1');
  const students = studentsForCourseClass(courseClass, group);
  const [activeStudent, setActiveStudent] = useState(students[0]?.id ?? null);
  const [input, setInput] = useState('');
  const [, forceUpdate] = useState(0);
  const messagesRef = useRef(null);

  useEffect(() => { const gs = courseClassGroups(courseClass); if (!gs.includes(group)) setGroup(gs[0] || 'G1'); }, [courseClassId]);
  useEffect(() => { setActiveStudent(students[0]?.id ?? null); setInput(''); }, [courseClassId, group, students.length]);
  const msgs = activeStudent ? Store.get('messages').filter((m) => m.teacherId === session.id && m.studentId === activeStudent && m.courseClassId === courseClassId && (!m.group || m.group === group)) : [];

  useEffect(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight; }, [msgs.length, activeStudent, courseClassId]);

  function sendMsg() {
    const text = input.trim();
    if (!text || !activeStudent || !courseClass) return;
    Store.push('messages', { id: Store.uid('m'), teacherId: session.id, studentId: activeStudent, courseClassId, group, classKey: courseClass.classKey, subject: courseClass.course, sender: 'teacher', text, date: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) });
    setInput(''); forceUpdate((n) => n + 1);
  }
  const activeStudentObj = students.find((s) => s.id === activeStudent);

  if (!courseClasses.length) return <><div className="app-header"><div><h1>Conversations</h1><div className="sub">Private threads are separated by course class.</div></div></div><div className="empty-state"><div className="emoji">💬</div>No course classes assigned yet.</div></>;

  return <>
    <div className="app-header"><div><h1>Conversations</h1><div className="sub">Choose a course class first. Each student thread stays private to that course.</div></div></div>
    <div className="panel" style={{ marginBottom: 16 }}><div className="grid-2"><div className="field" style={{ margin: 0 }}><label>Course class</label><select value={courseClassId} onChange={(e) => setCourseClassId(e.target.value)}>{courseClasses.map((cc) => <option key={cc.id} value={cc.id}>{courseClassLabel(cc)}</option>)}</select></div><div className="field" style={{ margin: 0 }}><label>Group</label><select value={group} onChange={(e) => setGroup(e.target.value)}>{groups.map((g) => <option key={g}>{g}</option>)}</select></div></div><div className="field-hint mt-8">The list below contains only students uploaded for this exact course class and group.</div></div>
    {!students.length ? <div className="empty-state"><div className="emoji">👥</div>No students assigned to this course class. Add them from Add Students.</div> : <div className="chat-shell">
      <div className="chat-list"><div className="small muted" style={{ padding: '0 0 10px' }}>{students.length} student{students.length === 1 ? '' : 's'} in this exact course class</div>{students.map((s) => <div key={s.id} className={`chat-list-item ${activeStudent === s.id ? 'active' : ''}`} onClick={() => { setActiveStudent(s.id); setInput(''); }}><div className="clname">{s.name}</div><div className="clmeta">{s.id} · {s.group || 'No group'}</div></div>)}</div>
      <div className="chat-main"><div className="chat-header">{activeStudentObj ? `${activeStudentObj.name} · ${courseClass.course}` : 'Select a student'}</div><div className="chat-messages" ref={messagesRef}>{msgs.length === 0 ? <div className="empty-state small">No messages in this course thread yet.</div> : msgs.map((m) => <div key={m.id} className={`bubble ${m.sender === 'teacher' ? 'bubble-out' : 'bubble-in'}`}>{m.text}<div className="bubble-time">{m.date}</div></div>)}</div><div className="chat-input-row"><input type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} /><button className="btn btn-primary" onClick={sendMsg}>Send</button></div></div>
    </div>}
  </>;
}
