import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard({ user, openWorkshop, onViewAll }) {
  const [workshops, setWorkshops] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api('/workshops').then(setWorkshops).catch(e=>setError(e.message)); }, []);
  const upcoming = workshops.filter(w => new Date(w.starts_at) > new Date());
  const seats = workshops.reduce((sum,w) => sum + Number(w.capacity) - Number(w.reserved_seats),0);
  const bookings = workshops.reduce((sum,w) => sum + Number(w.reserved_seats),0);
  return <>
    <div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Good to see you, {user.name.split(' ')[0]}.</h1><p>Here's what's happening at your training centre.</p></div><button className="outline-btn" onClick={onViewAll}>View workshops →</button></div>
    {error && <p className="error-box">{error}</p>}
    
    <div className="stats-row">
      <div className="stat-card"><small>Upcoming workshops</small><strong>{upcoming.length}</strong><span>Scheduled sessions</span></div>
      <div className="stat-card"><small>Active registrations</small><strong>{bookings}</strong><span>Reserved seats</span></div>
      <div className="stat-card"><small>Available seats</small><strong>{seats}</strong><span>Across all workshops</span></div>
    </div>
    <div className="section-heading"><div><h2>Coming up next</h2><p>The latest scheduled sessions</p></div><button className="text-btn" onClick={onViewAll}>View all →</button></div>
    <div className="upcoming-list">{upcoming.slice(0,4).map(w => <button key={w.id} className="upcoming-row" onClick={()=>openWorkshop(w)}>
      <span className="date-icon"><strong>{new Date(w.starts_at).getDate()}</strong><small>{new Date(w.starts_at).toLocaleString('en',{month:'short'})}</small></span>
      <span className="upcoming-title"><strong>{w.title}</strong><small>{w.location} · {w.instructor}</small></span>
      <span className={`seat-tag ${w.reserved_seats>=w.capacity?'full':''}`}>{Number(w.capacity)-Number(w.reserved_seats)} seats left</span><span>→</span>
    </button>)}{!upcoming.length && <div className="empty-state">No upcoming workshops yet.</div>}</div>
  </>;
}
