import { useEffect, useRef, useState } from 'react';
import { Store, courseClassLabel, getStudentCourseClasses, studentsForCourseClass } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';

export default function StudentMessages() {
  const { session } = useAuth();
  const courseClasses = getStudentCourseClasses(session.id);
  const teachers = Store.get('teachers');
  const [courseClassId, setCourseClassId] = useState(courseClasses[0]?.id ?? '');
  const courseClass = courseClasses.find((cc) => cc.id === courseClassId);
  const students = courseClass ? studentsForCourseClass(courseClass) : [];
  const enrollment = (Store.get('enrollments') || []).find((e) => e.studentId === session.id && e.courseClassId === courseClassId);
  const group = enrollment?.group || Store.get('students').find((s) => s.id === session.id)?.group || 'G1';
  const teacher = teachers.find((t) => t.id === courseClass?.teacherId);
  const [input, setInput] = useState('');
  const [, forceUpdate] = useState(0);
  const messagesRef = useRef(null);
  const msgs = courseClass ? Store.get('messages').filter((m) => m.teacherId === courseClass.teacherId && m.studentId === session.id && m.courseClassId === courseClassId && (!m.group || m.group === group)) : [];

  useEffect(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight; }, [msgs.length, courseClassId]);
  function sendMsg() {
    const text = input.trim(); if (!text || !courseClass) return;
    Store.push('messages', { id: Store.uid('m'), teacherId: courseClass.teacherId, studentId: session.id, courseClassId, classKey: courseClass.classKey, subject: courseClass.course, sender: 'student', text, date: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) });
    setInput(''); forceUpdate((n) => n + 1);
  }
  return <>
    <div className="app-header"><div><h1>Messages</h1><div className="sub">Each conversation belongs to one course class and its teacher.</div></div></div>
    {courseClasses.length === 0 ? <div className="empty-state">You have no course classes assigned yet.</div> : <>
      <div className="panel" style={{ marginBottom: 16 }}><div className="field" style={{ margin: 0, maxWidth: 680 }}><label>Course class</label><select value={courseClassId} onChange={(e) => { setCourseClassId(e.target.value); setInput(''); }}>{courseClasses.map((cc) => <option key={cc.id} value={cc.id}>{courseClassLabel(cc)}</option>)}</select></div></div>
      <div className="chat-shell"><div className="chat-list">{courseClasses.map((cc) => <div key={cc.id} className={`chat-list-item ${courseClassId === cc.id ? 'active' : ''}`} onClick={() => { setCourseClassId(cc.id); setInput(''); }}><div className="clname">{cc.course}</div><div className="clmeta">{teacher?.name || 'Teacher'} · {cc.classKey}</div></div>)}</div><div className="chat-main"><div className="chat-header">{teacher ? `${teacher.name} · ${courseClass.course}` : 'Select a course class'}</div><div className="chat-messages" ref={messagesRef}>{msgs.length === 0 ? <div className="empty-state small">No messages in this course thread yet. Say hello!</div> : msgs.map((m) => <div key={m.id} className={`bubble ${m.sender === 'student' ? 'bubble-out' : 'bubble-in'}`}>{m.text}<div className="bubble-time">{m.date}</div></div>)}</div><div className="chat-input-row"><input type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} /><button className="btn btn-primary" onClick={sendMsg}>Send</button></div></div></div>
    </>}
  </>;
}
