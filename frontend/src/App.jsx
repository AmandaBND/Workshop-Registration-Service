import { useState } from 'react';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Workshops from './pages/Workshops';
import WorkshopDetail from './pages/WorkshopDetail';
import Users from './pages/Users';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('workshoply_user') || 'null'));
  const [page, setPage] = useState(() => JSON.parse(localStorage.getItem('workshoply_user') || 'null')?.role === 'admin' ? 'users' : 'dashboard');
  const [selected, setSelected] = useState(null);
  function login(data) {
    localStorage.setItem('workshoply_token', data.token);
    localStorage.setItem('workshoply_user', JSON.stringify(data.user));
    setUser(data.user);
    setPage(data.user.role==='admin'?'users':'dashboard');
  }
  function logout() {
    localStorage.removeItem('workshoply_token');
    localStorage.removeItem('workshoply_user');
    setUser(null); setSelected(null);
  }
  if (!user) return <Login onLogin={login}/>;
  return <Layout user={user} page={page} onPage={setPage} onLogout={logout}>
    {user.role==='admin' ? <Users/> : <>
      {page==='dashboard' && <Dashboard user={user} onViewAll={()=>setPage('workshops')} openWorkshop={w=>{setSelected(w);setPage('detail');}}/>}
      {page==='workshops' && <Workshops user={user} onOpen={w=>{setSelected(w);setPage('detail');}}/>}
      {page==='detail' && selected && <WorkshopDetail workshop={selected} onBack={()=>setPage('workshops')}/>} 
    </>}
  </Layout>;
}
