import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [notes, setNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  // Helper function: Status check aur JSON parsing ke liye
  const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  };

  const fetchNotes = async () => {
    if (!token) return; 
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await handleResponse(res);
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? 'login' : 'signup';
    try {
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authForm)
      });
      
      const data = await handleResponse(res);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setToken(data.token);
      setUsername(data.username);
    } catch (err) {
      setError(err.message || 'Authentication Failed');
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteForm.title || !noteForm.content) return;
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Fresh token dynamically passed
        },
        body: JSON.stringify(noteForm)
      });
      
      await handleResponse(res);
      setNoteForm({ title: '', content: '' });
      fetchNotes();
    } catch (err) { 
      console.error("Error creating note:", err.message); 
    }
  };

  const deleteNote = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Fresh token dynamically passed
        }
      });
      
      await handleResponse(res);
      fetchNotes();
    } catch (err) { 
      console.error("Error deleting note:", err.message); 
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken('');
    setUsername('');
    setNotes([]);
  };

  // --- Auth Screen UI ---
  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'Arial' }}>
        <h2>{isLogin ? '🔑 Login to NotesApp' : '🚀 Register Account'}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Username" required value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} style={{ padding: '10px' }} />
          <input type="password" placeholder="Password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} style={{ padding: '10px' }} />
          <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} style={{ color: '#007bff', cursor: 'pointer', marginTop: '15px', textAlign: 'center' }}>
          {isLogin ? 'Create an account? Register here' : 'Already have an account? Login here'}
        </p>
      </div>
    );
  }

  // --- Main Notes Screen UI ---
  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span>Welcome, <b>{username}</b>! 👋</span>
        <button onClick={logout} style={{ padding: '5px 10px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}>Logout</button>
      </div>
      <h1 style={{ textAlign: 'center' }}>🐳 Secure MERN Notes App</h1>
      
      <form onSubmit={handleNoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', background: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
        <h3>Add a Secret Note</h3>
        <input type="text" placeholder="Title" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} style={{ padding: '10px' }} />
        <textarea placeholder="Content" value={noteForm.content} onChange={e => setNoteForm({...noteForm, content: e.target.value})} style={{ padding: '10px', height: '80px' }} />
        <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Save Note</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {notes.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>No secure notes found.</p>}
        {notes.map(note => (
          <div key={note._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', position: 'relative' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{note.title}</h4>
            <p style={{ color: '#555' }}>{note.content}</p>
            <button onClick={() => deleteNote(note._id)} style={{ position: 'absolute', bottom: '15px', right: '15px', background: '#dc3545', color: 'white', border: 'none', padding: '3px 8px', cursor: 'pointer' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;