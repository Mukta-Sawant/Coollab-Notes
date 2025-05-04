import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      navigate('/dashboard');
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Welcome to Notes App 📚</h1>
      <input
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button style={styles.button} onClick={handleLogin}>Continue</button>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#121212', color: 'white' },
  title: { fontSize: '32px', marginBottom: '20px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid gray', marginBottom: '10px', width: '250px', backgroundColor: '#1e1e1e', color: 'white' },
  button: { padding: '10px 20px', borderRadius: '8px', backgroundColor: '#4caf50', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }
};

export default Login;
