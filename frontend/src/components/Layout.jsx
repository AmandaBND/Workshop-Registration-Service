export default function Layout({ user, page, onPage, onLogout, children }) {
  const isAdmin = user.role === 'admin';
  const links = isAdmin
    ? [{ id: 'users', label: 'Team members', icon: '◎' }]
    : [{ id: 'dashboard', label: 'Dashboard', icon: '◫' }, { id: 'workshops', label: 'Workshops', icon: '▦' }];
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon">w</span> The workshop<span className="brand-dot">.</span></div>
      <div className="sidebar-label">WORKSPACE</div>
      <nav>{links.map(link => <button key={link.id} className={`nav-item ${page===link.id?'active':''}`} onClick={()=>onPage(link.id)}><span className="nav-icon">{link.icon}</span>{link.label}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="user-chip"><div className="avatar">{user.name.slice(0,1).toUpperCase()}</div><div><strong>{user.name}</strong><small>{user.role}</small></div></div>
        <button className="logout" onClick={onLogout}>↪ &nbsp; Sign out</button>
      </div>
    </aside>
    <div className="content-area">
      <header className="topbar"><span>Training Centre / <b>{page==='detail'?'Workshop details':page}</b></span><span className="role-pill">{user.role}</span></header>
      <main className="main-content">{children}</main>
    </div>
  </div>;
}
