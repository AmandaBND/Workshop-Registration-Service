
import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyForm = {
  code: "",
  title: "",
  instructor: "",
  location: "Colombo",
  starts_at: "",
  capacity: 12,
  status: "open"
};

export default function Workshops({ user, onOpen }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [available, setAvailable] = useState(false);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await api("/workshops");
      setItems(data);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function showForm(workshop) {
    setEditing(workshop ? workshop.id : "new");

    if (workshop) {
      const localDate = new Date(
        new Date(workshop.starts_at).getTime() -
        new Date().getTimezoneOffset() * 60000
      ).toISOString().slice(0, 16);

      setForm({
        ...workshop,
        starts_at: localDate
      });
    } else {
      setForm({ ...emptyForm });
    }

    setError("");
  }

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = {
        ...form,
        capacity: Number(form.capacity),
        starts_at: new Date(form.starts_at).toISOString()
      };

      const isNew = editing === "new";

      await api(
        isNew ? "/workshops" : `/workshops/${editing}`,
        isNew ? "POST" : "PUT",
        body
      );

      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const filtered = items.filter((w) => {
    const day = new Date(w.starts_at).toLocaleDateString("en-CA");

    const matchesText = `${w.title} ${w.code} ${w.location}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      status === "all" || w.status === status;

    const hasSeats =
      w.status === "open" &&
      new Date(w.starts_at) > new Date() &&
      w.reserved_seats < w.capacity;

    const matchesDates =
      (!from || day >= from) &&
      (!to || day <= to);

    return (
      matchesText &&
      matchesStatus &&
      (!available || hasSeats) &&
      matchesDates
    );
  });

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PLAN & ORGANISE</span>
          <h1>Workshops</h1>
          <p>Find sessions and manage attendee registrations.</p>
        </div>

        {user.role === "manager" && (
          <button
            className="primary-btn"
            onClick={() => showForm(null)}
          >
            + New workshop
          </button>
        )}
      </div>

      <div className="panel filters-panel">
        <input
          aria-label="Search workshops"
          placeholder="Search workshops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          aria-label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <label className="filter-date">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>

        <label className="filter-date">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          Seats available
        </label>
      </div>

      {error && <p className="error-box">{error}</p>}

      <p className="results-label">
        {filtered.length} WORKSHOPS FOUND
      </p>

      <div className="workshop-grid">
        {filtered.map((w) => {
          const left =
            Number(w.capacity) - Number(w.reserved_seats);

          const title = w.title.toLowerCase();

          const illustration = title.includes("code")
            ? "⌘"
            : title.includes("pot")
              ? "◒"
              : "✳";

          const progress =
            (Number(w.reserved_seats) / Number(w.capacity)) * 100;

          return (
            <article className="workshop-card" key={w.id}>
              <div className="card-top">
                <span className="code-tag">{w.code}</span>

                <span
                  className={`seat-tag ${left === 0 ? "full" : ""}`}
                >
                  {left} seats left
                </span>
              </div>

              

              <h3 style={{ marginTop: '1.5rem' }}>{w.title}</h3>

              <p className="muted">
                With {w.instructor}
              </p>

              <div className="card-details">
                <span>
                  ◷{" "}
                  {new Date(w.starts_at).toLocaleString("en", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </span>

                <span> {w.location}</span>
              </div>

              <div className="progress">
                <div style={{ width: `${progress}%` }} />
              </div>

              <div className="card-footer">
                <small>
                  {w.reserved_seats} / {w.capacity} registered
                </small>

                <div>
                  <button
                    className="text-btn"
                    onClick={() => onOpen(w)}
                  >
                    Manage →
                  </button>

                  {user.role === "manager" && (
                    <button
                      className="text-btn muted-btn"
                      onClick={() => showForm(w)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!filtered.length && (
        <div className="empty-state">
          No workshops match your filters.
        </div>
      )}

      {editing && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <h2>
                {editing === "new"
                  ? "New workshop"
                  : "Edit workshop"}
              </h2>

              <button
                className="icon-btn"
                onClick={() => setEditing(null)}
              >
                ×
              </button>
            </div>

            <form className="stack-form" onSubmit={save}>
              <div className="form-two">
                <label>
                  Workshop code
                  <input
                    required
                    name="code"
                    value={form.code}
                    onChange={change}
                    placeholder="COD-101"
                  />
                </label>

                <label>
                  Location
                  <select
                    name="location"
                    value={form.location}
                    onChange={change}
                  >
                    <option>Colombo</option>
                    <option>Kandy</option>
                    <option>Galle</option>
                  </select>
                </label>
              </div>

              <label>
                Workshop title
                <input
                  required
                  name="title"
                  value={form.title}
                  onChange={change}
                />
              </label>

              <label>
                Instructor
                <input
                  required
                  name="instructor"
                  value={form.instructor}
                  onChange={change}
                />
              </label>

              <div className="form-two">
                <label>
                  Date and time
                  <input
                    required
                    type="datetime-local"
                    name="starts_at"
                    value={form.starts_at}
                    onChange={change}
                  />
                </label>

                <label>
                  Capacity
                  <input
                    required
                    min="1"
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={change}
                  />
                </label>
              </div>

              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={change}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </label>

              {error && (
                <p className="error-box">{error}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save workshop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
