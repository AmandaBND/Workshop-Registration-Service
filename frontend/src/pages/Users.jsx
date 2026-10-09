import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function load() { try { setUsers(await api('/users')); } catch(e) { setError(e.message); } }
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      await api('/users','POST',{name,email,password,role});
      setName(''); setEmail(''); setPassword(''); setSuccess('Account created.'); await load();
    } catch(e) { setError(e.message); }
  }
  return <>
    <div className="page-heading"><div><span className="eyebrow">ACCOUNT ADMINISTRATION</span><h1>Team members</h1><p>Add staff accounts and decide who can access each feature.</p></div></div>
    {error && <p className="error-box">{error}</p>}{success && <p className="success-box">{success}</p>}
    <div className="detail-columns">
      <section className="panel"><h2>Create an account</h2><p className="muted">Only administrators can create accounts.</p><form onSubmit={submit} className="stack-form">
        <label>Full name<input required value={name} onChange={e=>setName(e.target.value)}/></label>
        <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label>Password (8+ characters)<input required type="password" minLength="8" value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <label>Role<select value={role} onChange={e=>setRole(e.target.value)}><option value="staff">Staff</option><option value="manager">Manager</option><option value="admin">Admin</option></select></label>
        <button className="primary-btn wide">Create account →</button>
      </form></section>
      <section className="panel"><h2>Current team</h2><p className="muted">{users.length} team members</p>{users.map(u=><div className="user-row" key={u.id}><div className="avatar light-avatar">{u.name[0]}</div><div className="upcoming-title"><strong>{u.name}</strong><small>{u.email}</small></div><span className="role-pill">{u.role}</span></div>)}</section>
    </div>
  </>;
}
