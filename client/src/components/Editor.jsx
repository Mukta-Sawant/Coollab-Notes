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
      // Create a new Y document
      const ydoc = new Y.Doc();
      
      // Force connection to localhost
      const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1234';
      console.log(`Connecting to WebSocket server at ${websocketUrl}/${noteTitle}`);
      
      // Connect to the WebSocket server
      const wsProvider = new WebsocketProvider(
        websocketUrl,
        noteTitle,
        ydoc
      );
      
      // The provider has an awareness property, not the other way around
      // No need to set local user info, the WebSocket provider handles this
      
      // Enable persistence to IndexedDB
      const indexeddbProvider = new IndexeddbPersistence(noteTitle, ydoc);
      
      // Get the shared text from the document
      const sharedText = ydoc.getText('shared-text');
      console.log('Initial shared text:', sharedText.toString());
      
      // Set initial text
      setText(sharedText.toString());
      
      // Store in state for updating
      setYText(sharedText);
      
      // Update UI when text changes
      sharedText.observe(() => {
        console.log('Text changed:', sharedText.toString());
        setText(sharedText.toString());
      });
      
      // Handle connection status
      wsProvider.on('status', event => {
        console.log('WebSocket status changed:', event.status);
        setConnectionStatus(event.status);
      });
      
      // Log errors
      wsProvider.on('connection-error', error => {
        console.error('WebSocket connection error:', error);
      });
      
      // Manual tracking of collaborators - don't use awareness directly
      wsProvider.on('sync', isSynced => {
        console.log('Synchronized with peers:', isSynced);
        // For now, just set to 1 (yourself) as we can't use awareness
        setCollaboratorCount(1);
      });
      
      // Load from IndexedDB when synced
      indexeddbProvider.on('synced', () => {
        console.log('Loaded content from IndexedDB');
        
        // If the text is empty but we have a local copy, use that
        if (sharedText.toString() === '') {
          const savedContent = localStorage.getItem(`note-${noteTitle}`);
          if (savedContent) {
            console.log('Using saved content from local storage');
            sharedText.insert(0, savedContent);
          }
        }
      });
      
      // Clean up on unmount
      return () => {
        console.log('Editor component unmounting, cleaning up YJS');
        wsProvider.disconnect();
        ydoc.destroy();
      };
    } catch (error) {
      console.error('Error setting up YJS:', error);
      
      // If YJS fails, load from local storage
      const savedContent = localStorage.getItem(`note-${noteTitle}`);
      if (savedContent) {
        setText(savedContent);
      }
    }
  }, [noteTitle, username]);

  const handleChange = (e) => {
    if (yText) {
      console.log('Updating text:', e.target.value);
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
    localStorage.setItem(`note-${noteTitle}`, currentText);
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