import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

function Editor() {
  const { noteTitle } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [yText, setYText] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [collaboratorCount, setCollaboratorCount] = useState(0);
  const textareaRef = useRef(null);
  const username = localStorage.getItem('username') || 'Anonymous';

  useEffect(() => {
    console.log(`Editor component mounted for note: ${noteTitle}`);
    
    try {
      // CRITICAL: Generate a truly unique document ID for this specific note
      const cleanTitle = noteTitle.replace(/[^a-zA-Z0-9]/g, '-');
      const uniqueDocId = `note-doc-${cleanTitle}`;
      console.log(`Creating document with unique ID: ${uniqueDocId}`);
      
      // Create a new Y document with the unique ID
      const ydoc = new Y.Doc({ guid: uniqueDocId });
      
      // Use environment variable with fallback
      const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1234';
      
      // Use a more specific namespaced room ID
      const uniqueRoomId = `note-room-${cleanTitle}`;
      console.log(`Connecting to WebSocket server at ${websocketUrl} for room: ${uniqueRoomId}`);
      
      // Connect to the WebSocket server with the unique room ID
      const wsProvider = new WebsocketProvider(
        websocketUrl,
        uniqueRoomId,
        ydoc,
        { connect: true }
      );
      
      // Use a unique name for IndexedDB persistence
      const uniqueStorageId = `note-storage-${cleanTitle}`;
      console.log(`Setting up IndexedDB persistence with ID: ${uniqueStorageId}`);
      const indexeddbProvider = new IndexeddbPersistence(uniqueStorageId, ydoc);
      
      // Get the shared text from the document with a unique key
      const sharedTextKey = 'content';
      const sharedText = ydoc.getText(sharedTextKey);
      console.log(`Initial shared text for ${sharedTextKey}:`, sharedText.toString());
      
      // Set initial text
      setText(sharedText.toString());
      
      // Store in state for updating
      setYText(sharedText);
      
      // Update UI when text changes
      sharedText.observe(event => {
        console.log(`Text changed for ${noteTitle}:`, sharedText.toString());
        setText(sharedText.toString());
      });
      
      // Handle connection status
      wsProvider.on('status', event => {
        console.log(`WebSocket status changed for ${noteTitle}:`, event.status);
        setConnectionStatus(event.status);
      });
      
      // Log errors
      wsProvider.on('connection-error', error => {
        console.error(`WebSocket connection error for ${noteTitle}:`, error);
      });
      
      // Track collaborators using awareness
      wsProvider.awareness.on('change', () => {
        // Count clients excluding ourselves
        const clients = Array.from(wsProvider.awareness.getStates().keys());
        console.log(`Connected clients for ${noteTitle}:`, clients);
        setCollaboratorCount(clients.length);
      });
      
      // Set local user info in awareness
      wsProvider.awareness.setLocalStateField('user', {
        name: username,
        id: `${username}-${Date.now()}`, // Add unique ID
        color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Random color
      });
      
      // Load from IndexedDB when synced
      indexeddbProvider.on('synced', () => {
        console.log(`Loaded content from IndexedDB for ${noteTitle}`);
        
        // If the text is empty but we have a local copy, use that
        if (sharedText.toString() === '') {
          const savedContent = localStorage.getItem(`note-content-${noteTitle}`);
          if (savedContent) {
            console.log('Using saved content from local storage');
            sharedText.insert(0, savedContent);
          }
        }
      });
      
      // Clean up on unmount
      return () => {
        console.log(`Editor component unmounting for ${noteTitle}, cleaning up YJS`);
        wsProvider.disconnect();
        ydoc.destroy();
      };
    } catch (error) {
      console.error(`Error setting up YJS for ${noteTitle}:`, error);
      
      // If YJS fails, load from local storage
      const savedContent = localStorage.getItem(`note-content-${noteTitle}`);
      if (savedContent) {
        setText(savedContent);
      }
    }
  }, [noteTitle, username]);

  const handleChange = (e) => {
    if (yText) {
      console.log(`Updating text for ${noteTitle}:`, e.target.value);
      // Replace the entire text
      yText.delete(0, yText.length);
      yText.insert(0, e.target.value);
    } else {
      // If YJS not initialized, just update state
      setText(e.target.value);
    }
  };

  const handleSave = () => {
    const currentText = yText ? yText.toString() : text;
    localStorage.setItem(`note-content-${noteTitle}`, currentText);
    alert('✅ Note saved successfully to local storage!');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{noteTitle}</h2>
          <div style={styles.statusContainer}>
            <div style={{
              ...styles.statusIndicator,
              backgroundColor: connectionStatus === 'connected' ? '#4caf50' : '#ff9800'
            }}></div>
            <span>{connectionStatus === 'connected' ? 'Online' : 'Connecting...'}</span>
            {connectionStatus === 'connected' && collaboratorCount > 0 && (
              <span style={styles.collaborators}>
                {collaboratorCount} active connection{collaboratorCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div>
          <button style={styles.saveButton} onClick={handleSave}>Save</button>
          <button style={styles.leaveButton} onClick={handleBack}>Back to Dashboard</button>
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        style={styles.textarea}
        placeholder="Start writing your note..."
      />
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#0d1117',
    minHeight: '100vh',
    width: '100%',
    padding: '20px',
    color: 'white',
    fontFamily: 'Arial',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    width: '90%',
    maxWidth: '800px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '24px',
    marginBottom: '5px',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  statusIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: '5px',
  },
  collaborators: {
    marginLeft: '15px',
    fontSize: '14px',
    opacity: 0.8,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginRight: '10px',
    marginTop: '5px',
  },
  leaveButton: {
    backgroundColor: '#ff4d4f',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '5px',
  },
  textarea: {
    width: '90%',
    maxWidth: '800px',
    height: '400px',
    backgroundColor: '#161b22',
    color: 'white',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '15px',
    fontSize: '16px',
    resize: 'vertical',
  }
};

export default Editor;