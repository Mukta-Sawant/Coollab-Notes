import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for username in localStorage
    const username = localStorage.getItem('username');
    
    if (username) {
      console.log('User is logged in:', username);
      setIsLoggedIn(true);
    } else {
      console.log('No user logged in');
      setIsLoggedIn(false);
    }
    
    setIsLoading(false);
  }, []);

  // Setup listener for storage changes (in case user logs out in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const username = localStorage.getItem('username');
      setIsLoggedIn(!!username);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/note/:noteTitle" element={isLoggedIn ? <Editor /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;