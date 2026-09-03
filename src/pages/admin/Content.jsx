import { useState } from 'react';
import { Store, fmtDate } from '../../store.js';
import { useToast } from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';

const TYPES = [
  ['events', '🎉', 'Events'],
  ['clubs', '🎭', 'Clubs'],
  ['opportunities', '🚀', 'Opportunities'],
  ['campusUpdates', '📣', 'Campus Updates'],
];
const empty = { title: '', date: '', location: '', desc: '', formLink: '', category: '', meets: '', link: '', deadline: '' };

export default function AdminContent() {
  const toast = useToast();
  const [type, setType] = useState('events');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const items = Store.get(type) || [];
  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function submit(e) {
    e.preventDefault();
    const base = { id: Store.uid(type.slice(0, 2)), title: form.title.trim(), desc: form.desc.trim() };
    let item = base;
    if (type === 'events') item = { ...base, date: form.date, location: form.location.trim(), formLink: form.formLink.trim(), audience: 'all' };
    if (type === 'clubs') item = { id: base.id, name: form.title.trim(), category: form.category.trim(), desc: base.desc, meets: form.meets.trim(), formLink: form.formLink.trim() };
    if (type === 'opportunities') item = { ...base, category: form.category.trim(), deadline: form.deadline, link: form.link.trim() };
    if (type === 'campusUpdates') item = { ...base, date: form.date };
    Store.push(type, item); setForm(empty); setOpen(false); toast(`${TYPES.find((x) => x[0] === type)[2]} updated`); window.dispatchEvent(new Event('workforce-content-updated'));
  }
  function del(id) { if (!window.confirm('Delete this public item?')) return; Store.remove(type, (x) => x.id === id); toast('Deleted'); window.dispatchEvent(new Event('workforce-content-updated')); }
  return <>
    <div className="app-header"><div><h1>Public Content</h1><div className="sub">This is the missing publishing role: a content manager maintains everything visitors see on the public dashboard.</div></div><button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add content</button></div>
    <div className="panel"><div className="filter-row">{TYPES.map(([key, icon, label]) => <button key={key} className={`filter-chip ${type === key ? 'active' : ''}`} onClick={() => setType(key)}>{icon} {label}</button>)}</div><div className="small muted mt-8">Changes here appear on the public pages for {type === 'campusUpdates' ? 'Campus Updates' : TYPES.find((x) => x[0] === type)?.[2]}.</div></div>
    <div className="grid-2">{items.length === 0 ? <div className="empty-state"><div className="emoji">📝</div>No content yet.</div> : items.slice().reverse().map((item) => <div className="card" key={item.id}><div className="flex-between"><span className="tag tag-amber">{item.date || item.deadline ? fmtDate(item.date || item.deadline) : item.category || 'Public'}</span><button className="btn btn-sm btn-ghost" onClick={() => del(item.id)}>Delete</button></div><h3 className="mt-16" style={{ fontSize: 18 }}>{item.title || item.name}</h3>{item.location && <p className="small muted mt-8">📍 {item.location}</p>}{item.meets && <p className="small muted mt-8">🗓️ {item.meets}</p>}<p className="small mt-16">{item.desc}</p>{item.formLink && <div className="small mono muted mt-8">{item.formLink}</div>}{item.link && <div className="small mono muted mt-8">{item.link}</div>}</div>)}</div>
    <Modal open={open} onClose={() => setOpen(false)} title={`Add ${TYPES.find((x) => x[0] === type)?.[2]}`}><form onSubmit={submit}>
      <div className="field"><label>{type === 'clubs' ? 'Club name' : 'Title'}</label><input value={form.title} onChange={(e) => update('title', e.target.value)} required /></div>
      {(type === 'events' || type === 'campusUpdates') && <div className="field"><label>Date</label><input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} required /></div>}
      {type === 'opportunities' && <div className="field"><label>Deadline</label><input type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} required /></div>}
      {type === 'events' && <div className="field"><label>Location</label><input value={form.location} onChange={(e) => update('location', e.target.value)} required /></div>}
      {(type === 'clubs' || type === 'opportunities') && <div className="field"><label>Category</label><input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="Technical / Hackathon / Internship" required /></div>}
      {type === 'clubs' && <div className="field"><label>Meeting time</label><input value={form.meets} onChange={(e) => update('meets', e.target.value)} placeholder="Wednesdays, 5 PM" /></div>}
      <div className="field"><label>Description</label><textarea value={form.desc} onChange={(e) => update('desc', e.target.value)} required /></div>
      {(type === 'events' || type === 'clubs') && <div className="field"><label>Participation / join form link</label><input type="url" value={form.formLink} onChange={(e) => update('formLink', e.target.value)} placeholder="https://..." /></div>}
      {type === 'opportunities' && <div className="field"><label>External link</label><input type="url" value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://..." required /></div>}
      <button className="btn btn-primary btn-block" type="submit">Publish</button>
    </form></Modal>
  </>;
}
