import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginChecked, setLoginChecked] = useState(false);

  // One-time check for login status on app initialization
  useEffect(() => {
    console.log('App component mounted - checking login status');
    
    try {
      // Check for username in localStorage
      const username = localStorage.getItem('username');
      console.log('Username from localStorage:', username);
      
      // Set login status based on presence of username
      if (username && username.trim() !== '') {
        console.log('User is logged in:', username);
        setIsLoggedIn(true);
      } else {
        console.log('No user logged in');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      // Always mark loading as complete and login as checked
      setIsLoading(false);
      setLoginChecked(true);
    }
  }, []); // Empty dependency array ensures this runs only once

  // Handle login and logout actions
  const handleLogin = (username) => {
    localStorage.setItem('username', username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  // Only render routes once login check is complete
  if (!loginChecked) {
    return null;
  }

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/note/:noteTitle" 
            element={isLoggedIn ? <Editor /> : <Navigate to="/login" />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/" />} 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;