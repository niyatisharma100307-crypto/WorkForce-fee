import { useState } from 'react';
import { Store, fmtDate } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';

const TYPES = ['All', 'Sell', 'Lend', 'Free'];
const emptyForm = { title: '', category: '', type: 'Sell', price: '', desc: '' };

export default function StudentExchange() {
  const { session } = useAuth();
  const toast = useToast();

  const [activeType, setActiveType] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [listings, setListings] = useState(() => Store.get('exchangeListings').slice().reverse());

  function refresh() {
    setListings(Store.get('exchangeListings').slice().reverse());
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    Store.push('exchangeListings', {
      id: Store.uid('ex'),
      title: form.title.trim(),
      category: form.category.trim() || 'Other',
      type: form.type,
      price: form.type === 'Free' ? 'Free' : form.price.trim() || '—',
      desc: form.desc.trim(),
      sellerId: session.id,
      date: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(false);
    setForm(emptyForm);
    toast('Listing posted');
    refresh();
  }

  const visible = activeType === 'All' ? listings : listings.filter((l) => l.type === activeType);

  return (
    <>
      <div className="app-header">
        <div>
          <h1>Campus Exchange</h1>
          <div className="sub">Buy, sell, lend, or give away things other students need.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Post a listing
        </button>
      </div>

      <div className="filter-row">
        {TYPES.map((t) => (
          <button
            key={t}
            className={`filter-chip ${activeType === t ? 'active' : ''}`}
            onClick={() => setActiveType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {visible.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="emoji">🛍️</div>
            No listings here yet.
          </div>
        ) : (
          visible.map((l) => (
            <div className="card" key={l.id}>
              <div className="flex-between">
                <span className="tag tag-outline">{l.category}</span>
                <span
                  className={`tag ${l.type === 'Sell' ? 'tag-amber' : l.type === 'Lend' ? 'tag-sage' : 'tag-coral'}`}
                >
                  {l.type}
                </span>
              </div>
              <h4 className="mt-16" style={{ fontSize: 17 }}>
                {l.title}
              </h4>
              <p className="small mt-8">{l.desc}</p>
              <div className="flex-between mt-16">
                <strong className="mono">{l.price}</strong>
                <span className="small muted mono">{fmtDate(l.date)}</span>
              </div>
              <p className="small muted mt-8">Contact: {l.sellerId}</p>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post a listing">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Item title</label>
            <input value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Category</label>
              <input
                placeholder="e.g. Electronics, Books"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Listing type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)}>
                <option>Sell</option>
                <option>Lend</option>
                <option>Free</option>
              </select>
            </div>
          </div>
          {form.type !== 'Free' && (
            <div className="field">
              <label>Price</label>
              <input
                placeholder="e.g. ₹500 or Negotiable"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
              />
            </div>
          )}
          <div className="field">
            <label>Description</label>
            <textarea value={form.desc} onChange={(e) => update('desc', e.target.value)} required></textarea>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Post listing
          </button>
        </form>
      </Modal>
    </>
  );
}
