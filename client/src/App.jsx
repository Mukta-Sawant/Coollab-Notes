import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import './App.css';

function App() {
  const username = localStorage.getItem('username');

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={username ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={username ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/note/:noteTitle" element={username ? <Editor /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;