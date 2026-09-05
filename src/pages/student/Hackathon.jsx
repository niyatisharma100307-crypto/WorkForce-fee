import { useState } from 'react';
import { Store } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';

const emptyForm = { name: '', hackathon: '', lookingFor: '', skills: '', members: 1, maxMembers: 4 };

export default function StudentHackathon() {
  const { session } = useAuth();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [teams, setTeams] = useState(() => Store.get('hackathonTeams').slice().reverse());

  function refresh() {
    setTeams(Store.get('hackathonTeams').slice().reverse());
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    Store.push('hackathonTeams', {
      id: Store.uid('h'),
      name: form.name.trim(),
      hackathon: form.hackathon.trim(),
      lookingFor: form.lookingFor.trim(),
      skills: form.skills.trim(),
      members: parseInt(form.members) || 1,
      maxMembers: parseInt(form.maxMembers) || 4,
      contact: session.id,
    });
    setModalOpen(false);
    setForm(emptyForm);
    toast('Team posted');
    refresh();
  }

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Hackathon Team Finder</h1>
          <div className="sub">
            Post your team and what you're looking for, or browse who needs teammates.
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Post your team
        </button>
      </div>

      <div className="grid-2">
        {teams.length === 0 ? (
          <div className="empty-state">
            
            No teams posted yet. Be the first!
          </div>
        ) : (
          teams.map((t) => (
            <div className="card" key={t.id}>
              <div className="flex-between">
                <strong style={{ fontSize: 17 }}>{t.name}</strong>
                <span className="tag tag-sage">
                  {t.members}/{t.maxMembers} members
                </span>
              </div>
              <p className="small muted mt-8"> {t.hackathon}</p>
              <p className="small mt-16">
                <strong>Looking for:</strong> {t.lookingFor}
              </p>
              <p className="small mt-8">
                <strong>Skills:</strong> {t.skills}
              </p>
              <p className="small mt-16 mono muted">Contact: {t.contact}</p>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post your team">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Team name</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div className="field">
            <label>Hackathon</label>
            <input
              placeholder="e.g. Convergence Hacks 2026"
              value={form.hackathon}
              onChange={(e) => update('hackathon', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Looking for</label>
            <input
              placeholder="e.g. UI designer, backend dev"
              value={form.lookingFor}
              onChange={(e) => update('lookingFor', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Team's skills</label>
            <input
              placeholder="e.g. React, Python, Figma"
              value={form.skills}
              onChange={(e) => update('skills', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Current members / max</label>
            <div className="flex-gap">
              <input
                type="number"
                min={1}
                style={{ width: 80 }}
                value={form.members}
                onChange={(e) => update('members', e.target.value)}
              />
              <span>/</span>
              <input
                type="number"
                min={1}
                style={{ width: 80 }}
                value={form.maxMembers}
                onChange={(e) => update('maxMembers', e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Post team
          </button>
        </form>
      </Modal>
    </>
  );
}
