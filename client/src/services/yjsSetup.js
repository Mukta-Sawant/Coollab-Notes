import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

export function setupYDoc(roomId) {
  // Create a new Y document
  const ydoc = new Y.Doc();
  
  // Use environment variable with fallback
  const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1234';
  
  console.log(`Connecting to WebSocket server: ${websocketUrl}`);
  
  // Connect to the WebSocket server
  const wsProvider = new WebsocketProvider(
    websocketUrl,
    roomId,     // Use the note title as the room ID
    ydoc,       // The Yjs document
    {
      connect: true,
    }
  );
  
  // Enable persistence to IndexedDB (local storage)
  const indexeddbProvider = new IndexeddbPersistence(roomId, ydoc);
  
  // Handle connection status
  wsProvider.on('status', event => {
    console.log('WebSocket connection status:', event.status);
  });
  
  // Log when synced with peers
  wsProvider.on('sync', isSynced => {
    console.log('Synchronized with peers:', isSynced);
  });

  return { ydoc, provider: wsProvider, indexeddbProvider };
}