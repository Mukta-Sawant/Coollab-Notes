import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Add to main.jsx at the top of the file
console.log('==== APP INITIALIZATION ====');
// Check current localStorage state
console.log('Current localStorage username:', localStorage.getItem('username'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
