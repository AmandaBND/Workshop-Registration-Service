import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function WorkshopDetail({ workshop, onBack }) {
  const [records, setRecords] = useState([]);
  const [current, setCurrent] = useState(workshop);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      const [registrations, workshops] = await Promise.all([api(`/workshops/${workshop.id}/registrations`),api('/workshops')]);
      setRecords(registrations);
      setCurrent(workshops.find(w=>w.id===workshop.id) || workshop);
    } catch(e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [workshop.id]);

  async function register(e) {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    try {
      await api(`/workshops/${workshop.id}/registrations`,'POST',{name,email,website});
      setName(''); setEmail(''); setSuccess('Attendee registered successfully.');
      await load();
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function cancel(id) {
  setCancelId(null);
  setError("");
  setSuccess("");

  try {
    await api(`/registrations/${id}/cancel`, "PATCH");
    setSuccess("Registration cancelled and seat released.");
    await load();
  } catch (e) {
    setError(e.message);
  }
}

const filteredRecords = records.filter((r) => {
  const text = `${r.name} ${r.email} ${r.status}`.toLowerCase();
  return text.includes(search.toLowerCase());
});

function downloadExcel() {
  const headers = [
    "Name",
    "Email",
    "Status",
    "Registered By",
    "Registered At",
    "Cancelled By",
    "Cancelled At"
  ];

  const rows = filteredRecords.map((r) => [
    r.name,
    r.email,
    r.status,
    r.registered_by || "",
    r.registered_at
      ? new Date(r.registered_at).toLocaleString()
      : "",
    r.cancelled_by_name || "",
    r.cancelled_at
      ? new Date(r.cancelled_at).toLocaleString()
      : ""
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((value) => {
        let text = String(value ?? "");

        if (/^[\s]*[=+\-@\t\r]/.test(text)) {
          text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
      }).join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${current.code}-registrations.csv`;
  link.click();

  URL.revokeObjectURL(url);
}


  const left = Number(current.capacity) - Number(current.reserved_seats);
  return <>
    <button className="back-link" onClick={onBack}>← Back to workshops</button>
    <div className="page-heading"><div><span className="eyebrow">{current.code} · {current.location}</span><h1>{current.title}</h1><p>{new Date(current.starts_at).toLocaleString('en',{dateStyle:'full',timeStyle:'short'})} · {current.instructor}</p></div><span className={`seat-tag big ${left===0?'full':''}`}>{left} of {current.capacity} seats available</span></div>
    {error && <p className="error-box">{error}</p>}{success && <p className="success-box">{success}</p>}
    <div className="detail-columns">
      
<section className="panel">
  <div className="section-heading compact">
    <div>
      <h2>Registration history</h2>
      <p>Active and cancelled attendees</p>
    </div>

    <span className="code-tag">
      {records.length} records
    </span>
  </div>

  <div className="registration-tools">
    <input
      type="search"
      placeholder="Search name, email or status..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      aria-label="Search registrations"
    />

    <button
      type="button"
      className="primary-btn"
      onClick={downloadExcel}
      disabled={filteredRecords.length === 0}
    >
      ↓ Download Excel
    </button>
  </div>

  <p className="registration-count">
    Showing {filteredRecords.length} of {records.length} registrations
  </p>

  <div className="records-table">
    {filteredRecords.map((r) => (
      <div className="record" key={r.id}>
        <div>
          <strong>{r.name}</strong>
          <small>{r.email}</small>

          <small>
            Registered by {r.registered_by} ·{" "}
            {new Date(r.registered_at).toLocaleString()}
          </small>

          {r.cancelled_at && (
            <small>
              Cancelled by {r.cancelled_by_name} ·{" "}
              {new Date(r.cancelled_at).toLocaleString()}
            </small>
          )}
        </div>

        <div className="record-actions">
          <span className={`status ${r.status}`}>
            {r.status}
          </span>

          {r.status === "active" && (
            <button
              className="text-btn danger"
              onClick={() => setCancelId(r.id)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    ))}

    {filteredRecords.length === 0 && (
      <div className="empty-state">
        {records.length === 0
          ? "No registrations yet."
          : "No matching registrations found."}
      </div>
    )}
  </div>
</section>

      <section className="panel"><div className="section-heading compact"><div><h2>Registration history</h2><p>Active and cancelled attendees</p></div><span className="code-tag">{records.length} records</span></div>
        <div className="records-table">{records.map(r=><div className="record" key={r.id}>
          <div><strong>{r.name}</strong><small>{r.email}</small><small>Registered by {r.registered_by} · {new Date(r.registered_at).toLocaleString()}</small>{r.cancelled_at && <small>Cancelled by {r.cancelled_by_name} · {new Date(r.cancelled_at).toLocaleString()}</small>}</div>
          <div className="record-actions"><span className={`status ${r.status}`}>{r.status}</span>{r.status==='active' && <button
  className="text-btn danger"
  onClick={() => setCancelId(r.id)}
>
  Cancel
</button>}</div>
        </div>)}{!records.length && <div className="empty-state">No registrations yet.</div>}</div>
      </section>
    </div>

    {cancelId && (
  <div className="modal-backdrop">
    <div
      className="modal confirm-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-title"
    >
      <div className="confirm-icon">!</div>

      <h2 id="cancel-title">Cancel Registration?</h2>

      <p>
        Are you sure you want to cancel this registration?
        The seat will become available for another attendee.
      </p>

      <div className="confirm-actions">
        <button
          className="outline-btn"
          onClick={() => setCancelId(null)}
        >
          Keep Registration
        </button>

        <button
          className="danger-btn"
          onClick={() => cancel(cancelId)}
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
)}
  </>;
}
