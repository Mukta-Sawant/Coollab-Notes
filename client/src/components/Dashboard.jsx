import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

function Dashboard(props) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [username, setUsername] = useState('Loading...');

  // Use a separate namespaced room for the notes list
  const SHARED_NOTES_ROOM = 'shared-notes-list';

  // Get username from localStorage with safeguards
  useEffect(() => {
    try {
      const storedUsername = localStorage.getItem('username');
      
      // If username exists and is not empty
      if (storedUsername && storedUsername.trim() !== '') {
        console.log('Dashboard: Retrieved username:', storedUsername);
        setUsername(storedUsername);
      } else {
        console.warn('Dashboard: No username found in localStorage');
        // Redirect to login if no username found
        navigate('/login');
      }
    } catch (error) {
      console.error('Dashboard: Error getting username:', error);
      setUsername('User');
    }
  }, [navigate]);

  useEffect(() => {
    console.log('Dashboard component mounted');
    
    // Initialize notes from local storage
    const localNotes = JSON.parse(localStorage.getItem('notes-list')) || [];
    setNotes(localNotes);
    
    // Set up a WebSocket connection to sync notes across clients
    try {
      console.log('Setting up YDoc for notes list');
      const ydoc = new Y.Doc();
      
      // Use environment variable with fallback
      const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1234';
      console.log(`Connecting to WebSocket server at ${websocketUrl}/${SHARED_NOTES_ROOM}`);
      console.log('Environment variables:', import.meta.env);
      console.log('WebSocket URL being used:', websocketUrl);
      
      // Connect to the WebSocket server
      const provider = new WebsocketProvider(
        websocketUrl,
        SHARED_NOTES_ROOM,
        ydoc
      );
      
      // Get the shared notes array
      const sharedNotes = ydoc.getArray('notes');
      
      // Handle connection status
      provider.on('status', event => {
        console.log('WebSocket status changed:', event.status);
        setConnectionStatus(event.status);
        
        // If connected, update notes list
        if (event.status === 'connected') {
          console.log('Connected! Current shared notes:', sharedNotes.toArray());
          
          // If shared notes is empty but we have local notes, initialize
          if (sharedNotes.length === 0 && localNotes.length > 0) {
            console.log('Adding local notes to shared list:', localNotes);
            // Clear existing shared notes just to be safe
            sharedNotes.delete(0, sharedNotes.length);
            // Add each note once
            localNotes.forEach(note => {
              sharedNotes.push([note]);
            });
          } else {
            // Use the shared notes
            updateNotesState(sharedNotes.toArray());
          }
          
          setLoading(false);
        }
      });
      
      // Handle synced event
      provider.on('sync', isSynced => {
        console.log('Synchronized with peers:', isSynced);
        if (isSynced) {
          console.log('Synced! Current shared notes:', sharedNotes.toArray());
          updateNotesState(sharedNotes.toArray());
          setLoading(false);
        }
      });
      
      // Listen for changes to the shared array
      sharedNotes.observe(event => {
        console.log('Notes list changed:', event);
        console.log('New notes array:', sharedNotes.toArray());
        updateNotesState(sharedNotes.toArray());
      });
      
      // Log any errors
      provider.on('connection-error', error => {
        console.error('WebSocket connection error:', error);
      });
      
      // Add awareness information for this user
      provider.awareness.setLocalStateField('user', {
        name: username,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Random color
      });
      
      // Function to update notes state and remove duplicates
      function updateNotesState(notesArray) {
        // Convert flat array to unique array (remove duplicates)
        const uniqueNotes = [...new Set(notesArray)];
        console.log('Unique notes:', uniqueNotes);
        
        setNotes(uniqueNotes);
        
        // Also update local storage
        localStorage.setItem('notes-list', JSON.stringify(uniqueNotes));
      }
      
      // Clean up on unmount
      return () => {
        console.log('Dashboard component unmounting, cleaning up YJS');
        provider.disconnect();
        ydoc.destroy();
      };
    } catch (error) {
      console.error('Error setting up YJS:', error);
      // If YJS setup fails, fall back to local storage
      setLoading(false);
    }
  }, []);

  const handleCreateNote = () => {
    console.log('Creating new note');
    const title = prompt('Enter Note Title:');
    
    if (title && title.trim()) {
      console.log(`New note title: ${title}`);
      
      try {
        // Set up a temporary YDoc to add the note
        const ydoc = new Y.Doc();
        const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1234';
        const provider = new WebsocketProvider(websocketUrl, SHARED_NOTES_ROOM, ydoc);
        
        provider.on('status', event => {
          if (event.status === 'connected') {
            // Get the shared notes
            const sharedNotes = ydoc.getArray('notes');
            
            // Check if the note already exists
            const currentNotes = sharedNotes.toArray();
            if (!currentNotes.includes(title.trim())) {
              // Add the new note
              sharedNotes.push([title.trim()]);
              console.log('Added new note to shared list:', title.trim());
              
              // Also create an empty document for this note
              // This ensures a blank note is created
              try {
                const noteDoc = new Y.Doc();
                const noteProvider = new WebsocketProvider(
                  websocketUrl,
                  `notes/${title.trim()}`,  // Use namespaced room ID
                  noteDoc
                );
                
                // Make sure to clean up this temporary connection
                setTimeout(() => {
                  noteProvider.disconnect();
                  noteDoc.destroy();
                }, 1000);
              } catch (error) {
                console.error('Error creating empty note document:', error);
              }
            }
            
            // Navigate to the note
            navigate(`/note/${encodeURIComponent(title.trim())}`);
            
            // Clean up
            setTimeout(() => {
              provider.disconnect();
              ydoc.destroy();
            }, 500);
          }
        });
      } catch (error) {
        console.error('Error creating note with YJS:', error);
        
        // Fallback to local only
        const newNotes = [...new Set([...notes, title.trim()])];
        setNotes(newNotes);
        localStorage.setItem('notes-list', JSON.stringify(newNotes));
        navigate(`/note/${encodeURIComponent(title.trim())}`);
      }
    }
  };

  const handleEditNote = (title) => {
    navigate(`/note/${encodeURIComponent(title)}`);
  };

  const handleLogout = () => {
    console.log('Logging out user');
    
    // Use the onLogout prop if provided
    if (props.onLogout) {
      props.onLogout();
      console.log('Used onLogout prop to handle logout');
    } else {
      // Fallback to direct localStorage manipulation
      localStorage.removeItem('username');
      console.log('Used direct localStorage removal for logout');
    }
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>Your Notes 📝</h1>
          <p>Logged in as: {username}</p>
          <div style={{
            ...styles.statusIndicator,
            backgroundColor: connectionStatus === 'connected' ? '#4caf50' : '#ff9800'
          }}>
            Status: {connectionStatus}
          </div>
        </div>
        <div>
          <button style={styles.button} onClick={handleCreateNote}>Create New Note</button>
          <button style={{...styles.button, backgroundColor:'#ff4d4f'}} onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      {loading ? (
        <div style={styles.loading}>Loading notes...</div>
      ) : (
        <div style={styles.notesList}>
          {notes.length === 0 ? (
            <div style={styles.emptyMessage}>No notes yet. Create your first note!</div>
          ) : (
            notes.map((note, index) => (
              <div 
                key={index} 
                style={styles.noteCard} 
                onClick={() => handleEditNote(note)}
              >
                {note}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  // Styles unchanged - same as provided before
  page: { 
    backgroundColor: '#0d1117', 
    minHeight: '100vh', 
    width: '100%',
    padding: '20px', 
    color: 'white', 
    fontFamily: 'Arial',
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: '20px', 
    flexWrap: 'wrap' 
  },
  statusIndicator: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '5px',
    marginBottom: '15px'
  },
  button: { 
    margin: '5px', 
    padding: '10px 20px', 
    backgroundColor: '#4caf50', 
    borderRadius: '8px', 
    color: 'white', 
    border: 'none', 
    fontWeight: 'bold', 
    cursor: 'pointer' 
  },
  notesList: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '20px' 
  },
  noteCard: { 
    backgroundColor: '#161b22', 
    padding: '20px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    minWidth: '200px',
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', 
    textAlign: 'center', 
    fontWeight: 'bold',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    marginTop: '50px',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: '18px',
    marginTop: '50px',
    color: '#6c7793',
  }
};

export default Dashboard;