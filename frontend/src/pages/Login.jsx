import { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('');
    try { onLogin(await api('/auth/login', 'POST', { email, password, website })); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  return <div className="login-layout">
    <section className="login-art">
      <div className="brand login-brand"><span className="brand-icon">w</span> The workshop<span className="brand-dot">.</span></div>
      <div className="login-art-copy">
        <span className="eyebrow light">MADE FOR BETTER WORKSHOPS</span>
        <h1>Every seat.<br/>Every session.<br/><em>Sorted.</em></h1>
        <p>One calm place to manage your workshops, bookings and team.</p>
        
      </div>
      <small className="login-foot">THE WORKSHOP · TRAINING CENTRE MANAGEMENT</small>
    </section>
    <section className="login-form-side"><div className="login-form-card">
      <span className="mini-kicker">WELCOME BACK</span><h2>Sign in to your space</h2><p className="muted">Enter your staff credentials to continue.</p>
      <form onSubmit={submit} className="stack-form">
        <label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@centre.com" /></label>
        <label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" /></label>
        <div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
        {error && <p className="error-box">{error}</p>}
        <button className="primary-btn wide" disabled={loading}>{loading?'Signing in...':'Sign in →'}</button>
      </form><div className="login-note">Accounts are created by your administrator.</div>
    </div></section>
  </div>;
}
