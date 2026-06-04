import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const API = axios.create({ baseURL: 'https://wedontgamble.yulcyberhub.click/api' });
const socket = io('https://wedontgamble.yulcyberhub.click');

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth(true);
    } catch (err) { alert(err.response?.data?.error || 'Login failed'); }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
      <button type="submit">Login</button>
    </form>
  );
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/signup', { name, email, password });
      alert('Check your email to verify account');
    } catch (err) { alert(err.response?.data?.error); }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /><br/>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
      <button type="submit">Register</button>
    </form>
  );
};

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('/uploads/file', formData);
      alert('Uploaded: ' + res.data.filename);
    } catch (err) { alert('Upload failed'); }
  };
  return (
    <div>
      <input type="file" onChange={e=>setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

const RealTime = () => {
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState([]);
  useEffect(() => {
    socket.on('message', (data) => setMsgs(prev => [...prev, data]));
    return () => socket.off('message');
  }, []);
  const send = () => {
    socket.emit('message', msg);
    setMsg('');
  };
  return (
    <div>
      <div>{msgs.map((m,i) => <div key={i}>{m}</div>)}</div>
      <input value={msg} onChange={e=>setMsg(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
};

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    API.get('/users').then(res => setUsers(res.data)).catch(()=>{});
  }, []);
  const changeRole = async (id, role) => {
    await API.put(`/users/${id}/role`, { role });
    setUsers(users.map(u => u._id === id ? {...u, role} : u));
  };
  return (
    <div>
      <h3>Admin Panel</h3>
      {users.map(u => (
        <div key={u._id}>{u.email} ({u.role}) 
          <button onClick={()=>changeRole(u._id, u.role === 'admin' ? 'user' : 'admin')}>
            Toggle Role
          </button>
        </div>
      ))}
    </div>
  );
};

const Dashboard = ({ user }) => {
  return (
    <div>
      <h2>Welcome to the Wedontgamble App</h2>
      <FileUpload />
      <hr />
      <RealTime />
      {user.role === 'admin' && <AdminPanel />}
    </div>
  );
};

function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  const user = auth ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  if (!auth) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div>
        <Link to="/dashboard">Dashboard</Link> | 
        <button onClick={()=>{ localStorage.clear(); setAuth(false); }}>Logout</button>
        <Routes>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
