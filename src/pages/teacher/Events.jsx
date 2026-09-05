import { Store, fmtDate } from '../../store.js';

export default function TeacherEvents() {
  const events = Store.get('events').slice().reverse();
  return (
    <>
      <div className="app-header"><div><h1>Events</h1><div className="sub">View public events. Public events are published by the Content Manager.</div></div></div>
      <div className="grid-2">
        {events.length === 0 ? <div className="empty-state">No events posted yet.</div> : events.map((e) => <div className="card card-tilt" key={e.id}><span className="tag tag-amber">{fmtDate(e.date)}</span><h3 className="mt-16" style={{ fontSize: 19 }}>{e.title}</h3><p className="small muted mt-8"> {e.location}</p><p className="small mt-16">{e.desc}</p>{e.formLink && <p className="small mt-8 mono muted" style={{ wordBreak: 'break-all' }}>Form: {e.formLink}</p>}</div>)}
      </div>
    </>
  );
}
