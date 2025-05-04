import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    console.log('Stored username:', storedUsername);
    
    if (storedUsername) {
      // User is already logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      // No stored username, show login form
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    
    if (username.trim()) {
      console.log('Logging in with username:', username.trim());
      
      // Store username in localStorage
      localStorage.setItem('username', username.trim());
      
      // Double check that it was stored correctly
      const storedUsername = localStorage.getItem('username');
      console.log('Verification - stored username:', storedUsername);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      // Show error if username is empty
      alert('Please enter a username');
    }
  };

  // Show loading state while checking for existing login
  if (isLoading) {
    return (
      <div style={styles.page}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Welcome to Collab Notes 📚</h1>
      <form style={styles.form} onSubmit={handleLogin}>
        <input
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <button 
          style={styles.button} 
          type="submit"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh', 
    backgroundColor: '#121212', 
    color: 'white' 
  },
  title: { 
    fontSize: '32px', 
    marginBottom: '20px' 
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '300px',
  },
  input: { 
    padding: '10px', 
    borderRadius: '8px', 
    border: '1px solid gray', 
    marginBottom: '10px', 
    width: '100%', 
    backgroundColor: '#1e1e1e', 
    color: 'white' 
  },
  button: { 
    padding: '10px 20px', 
    borderRadius: '8px', 
    backgroundColor: '#4caf50', 
    color: 'white', 
    border: 'none', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    width: '100%'
  }
};

export default Login;