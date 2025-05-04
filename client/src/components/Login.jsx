import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login(props) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in when component mounts
  useEffect(() => {
    console.log('Login component mounted');
    
    try {
      // Clear any previous errors
      setError('');
      
      // Get username from localStorage
      const storedUsername = localStorage.getItem('username');
      console.log('Stored username from Login component:', storedUsername);
      
      // If username exists and is not empty
      if (storedUsername && storedUsername.trim() !== '') {
        console.log('User already logged in, redirecting to dashboard');
        
        // Use the props.onLogin to properly register the login
        if (props.onLogin) {
          props.onLogin(storedUsername);
        }
        
        navigate('/dashboard');
      } else {
        // No stored username, show login form
        console.log('No username found, showing login form');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error during login check:', err);
      setError('An error occurred while checking login status');
      setIsLoading(false);
    }
  }, [navigate, props]);

  const handleLogin = (e) => {
    if (e) e.preventDefault(); // Prevent form submission default behavior
    
    try {
      setError(''); // Clear any previous errors
      
      if (!username || username.trim() === '') {
        setError('Please enter a username');
        return;
      }
      
      const trimmedUsername = username.trim();
      console.log('Setting username in localStorage:', trimmedUsername);
      
      // Use onLogin prop if available (preferred method)
      if (props.onLogin) {
        props.onLogin(trimmedUsername);
        console.log('Used onLogin prop to register login');
      } else {
        // Fallback - direct localStorage manipulation
        localStorage.setItem('username', trimmedUsername);
        console.log('Used direct localStorage manipulation for login');
      }
      
      // Verify storage worked
      const storedUsername = localStorage.getItem('username');
      console.log('Verification - stored username:', storedUsername);
      
      if (!storedUsername || storedUsername !== trimmedUsername) {
        throw new Error('Failed to save username');
      }
      
      // Navigate to dashboard
      console.log('Login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Please try again.');
    }
  };

  // Show loading state while checking for existing login
  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Loading...</div>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Welcome to Collab Notes 📚</h1>
      
      {error && <div style={styles.errorMessage}>{error}</div>}
      
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
    color: 'white',
    padding: '20px'
  },
  title: { 
    fontSize: '32px', 
    marginBottom: '20px',
    textAlign: 'center'
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
    color: 'white',
    fontSize: '16px'
  },
  button: { 
    padding: '10px 20px', 
    borderRadius: '8px', 
    backgroundColor: '#4caf50', 
    color: 'white', 
    border: 'none', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    width: '100%',
    fontSize: '16px'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    width: '100%',
    maxWidth: '300px',
    textAlign: 'center'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontSize: '20px',
    marginBottom: '15px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '4px solid #4caf50',
    animation: 'spin 1s linear infinite'
  }
};

export default Login;