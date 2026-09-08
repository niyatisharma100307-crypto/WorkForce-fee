import { useState } from 'react';
import { Store } from '../../store.js';

export default function Clubs() {
  const clubs = Store.get('clubs');

  const [selectedClub, setSelectedClub] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    collegeYear: '',
    reason: '',
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function openForm(club) {
    setSelectedClub(club);
    setSubmitted(false);
    setForm({
      name: '',
      email: '',
      phone: '',
      collegeYear: '',
      reason: '',
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <section className="public-hero">
        <div className="wrap">
          <span className="eyebrow">No login needed</span>

          <h1 className="mt-8">Clubs</h1>

          <p
            className="muted mt-8"
            style={{ maxWidth: 560 }}
          >
            See what each club is about, when they meet, and join straight from here.
          </p>
        </div>
      </section>

      <div className="wrap section">
        <div className="grid-3">
          {clubs.map((c) => (
            <div className="card" key={c.id}>
              <div className="flex-between mb-8">
                <div>
                  <strong style={{ fontSize: 17 }}>
                    {c.name}
                  </strong>

                  {c.category && (
                    <span className="tag tag-outline">
                      {c.category}
                    </span>
                  )}
                </div>
              </div>

              <p className="small">
                {c.desc}
              </p>

              {c.meets && (
                <p className="small muted mt-16">
                  {c.meets}
                </p>
              )}

              <button
                type="button"
                className="btn btn-primary btn-block mt-16"
                onClick={() => openForm(c)}
              >
                Join {c.name} →
              </button>
            </div>
          ))}
        </div>

        {selectedClub && (
          <div className="card mt-24">
            <div className="flex-between">
              <div>
                <h2>Join {selectedClub.name}</h2>
                <p className="muted">
                  Fill in the details below to join this club.
                </p>
              </div>

              <button
                type="button"
                className="btn"
                onClick={() => setSelectedClub(null)}
              >
                ✕ Close
              </button>
            </div>

            {submitted ? (
              <div className="mt-24">
                <h3>Application submitted! 🎉</h3>

                <p className="muted mt-8">
                  Thanks for your interest in {selectedClub.name}.
                </p>

                <button
                  type="button"
                  className="btn btn-primary mt-16"
                  onClick={() => setSelectedClub(null)}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-24">

                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="field">
                  <label>College / Year</label>
                  <input
                    type="text"
                    name="collegeYear"
                    value={form.collegeYear}
                    onChange={handleChange}
                    placeholder="Example: B.Tech 2nd Year"
                    required
                  />
                </div>

                <div className="field">
                  <label>Why do you want to join?</label>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself..."
                    rows="4"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit Application
                </button>

              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}