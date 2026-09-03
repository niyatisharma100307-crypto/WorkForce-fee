import { useState } from 'react';
import { Store, fmtDate } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const emptyForm = {
  name: '',
  desc: '',
  category: '',
  level: 'Beginner',
  tech: '',
  team: '',
  github: '',
  demo: '',
  status: 'In progress',
  lookingForTeammates: false,
  rolesNeeded: '',
};

export default function StudentProjects() {
  const { session } = useAuth();
  const toast = useToast();

  const [activeLevel, setActiveLevel] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [projects, setProjects] = useState(() => Store.get('projects').slice().reverse());

  function refresh() {
    setProjects(Store.get('projects').slice().reverse());
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    Store.push('projects', {
      id: Store.uid('pr'),
      name: form.name.trim(),
      desc: form.desc.trim(),
      category: form.category.trim() || 'Other',
      level: form.level,
      tech: form.tech.trim(),
      team: form.team.trim() || session.name,
      github: form.github.trim(),
      demo: form.demo.trim(),
      status: form.status,
      lookingForTeammates: form.lookingForTeammates,
      rolesNeeded: form.rolesNeeded.trim(),
      ownerId: session.id,
      date: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(false);
    setForm(emptyForm);
    toast('Project posted');
    refresh();
  }

  const visible = activeLevel === 'All' ? projects : projects.filter((p) => p.level === activeLevel);

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Project Showcase</h1>
          <div className="sub">Show off what you're building, or find teammates for what's next.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Submit project
        </button>
      </div>

      <div className="filter-row">
        {LEVELS.map((l) => (
          <button
            key={l}
            className={`filter-chip ${activeLevel === l ? 'active' : ''}`}
            onClick={() => setActiveLevel(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {visible.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="emoji">💡</div>
            No projects here yet — be the first to post one.
          </div>
        ) : (
          visible.map((p) => (
            <div className="card" key={p.id}>
              <div className="flex-between">
                <span className="tag tag-outline">{p.category}</span>
                <span className="tag tag-amber">{p.level}</span>
              </div>
              <h4 className="mt-16" style={{ fontSize: 17 }}>
                {p.name}
              </h4>
              <p className="small mt-8">{p.desc}</p>
              <p className="small muted mt-16">
                <strong>Tech:</strong> {p.tech || '—'}
              </p>
              <p className="small muted mt-8">
                <strong>Team:</strong> {p.team}
              </p>
              <div className="flex-gap mt-16" style={{ flexWrap: 'wrap' }}>
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                    GitHub ↗
                  </a>
                )}
                {p.demo && (
                  <a href={p.demo} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                    Live demo ↗
                  </a>
                )}
              </div>
              {p.lookingForTeammates && (
                <div
                  className="small mt-16"
                  style={{ color: 'var(--sage-deep)', fontWeight: 600 }}
                >
                  🙋 Looking for: {p.rolesNeeded || 'teammates'}
                </div>
              )}
              <p className="small muted mt-8" style={{ fontSize: 11.5 }}>
                Posted {fmtDate(p.date)} · {p.status}
              </p>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submit your project">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Project name</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.desc} onChange={(e) => update('desc', e.target.value)} required></textarea>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Category</label>
              <input
                placeholder="e.g. Web App, Mobile, ML"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Difficulty level</label>
              <select value={form.level} onChange={(e) => update('level', e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Tech stack</label>
            <input
              placeholder="e.g. React, Node.js, MongoDB"
              value={form.tech}
              onChange={(e) => update('tech', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Team members</label>
            <input
              placeholder={`Defaults to your name (${session.name})`}
              value={form.team}
              onChange={(e) => update('team', e.target.value)}
            />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>GitHub link</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={form.github}
                onChange={(e) => update('github', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Demo link</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.demo}
                onChange={(e) => update('demo', e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option>Idea</option>
              <option>In progress</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={form.lookingForTeammates}
                onChange={(e) => update('lookingForTeammates', e.target.checked)}
                style={{ width: 'auto' }}
              />
              Looking for teammates
            </label>
          </div>
          {form.lookingForTeammates && (
            <div className="field">
              <label>Roles needed</label>
              <input
                placeholder="e.g. UI designer, backend dev"
                value={form.rolesNeeded}
                onChange={(e) => update('rolesNeeded', e.target.value)}
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block">
            Post project
          </button>
        </form>
      </Modal>
    </>
  );
}
