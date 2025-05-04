const WebSocket = require('ws');
const http = require('http');
const wss = new WebSocket.Server({ noServer: true });
const port = process.env.PORT || 1234;

// Map to store connections by room
const rooms = new Map();

// Create HTTP server
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('WebSocket server for collaborative notes app');
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  // Extract room ID from URL
  const url = new URL(req.url, 'http://localhost');
  const roomId = url.pathname.slice(1); // Remove leading '/'
  
  console.log(`New connection in room: ${roomId}`);
  
  // Add to the appropriate room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(ws);
  
  // Send number of clients in this room to all clients
  broadcastRoomStatus(roomId);
  
  // Handle messages
  ws.on('message', (message) => {
    // Broadcast to all clients in the same room
    const room = rooms.get(roomId);
    if (room) {
      room.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log(`Connection closed in room: ${roomId}`);
    
    // Remove from room
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(ws);
      
      // If room is empty, delete it
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        // Otherwise update room status
        broadcastRoomStatus(roomId);
      }
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });
});

// Helper function to broadcast room status
function broadcastRoomStatus(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    const clientCount = room.size;
    const statusMsg = JSON.stringify({
      type: 'room-status',
      clients: clientCount
    });
    
    room.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(statusMsg);
      }
    });
  }
}

// Start server
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});