// Import the y-websocket server
const { setupWSConnection } = require('y-websocket/bin/utils');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// Create HTTP server with detailed logging
const server = http.createServer((request, response) => {
  console.log(`HTTP Request: ${request.method} ${request.url}`);
  
  // Set CORS headers to allow connections from any origin
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Request-Method', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  response.setHeader('Access-Control-Allow-Headers', '*');
  
  if (request.method === 'OPTIONS') {
    console.log('Responding to OPTIONS request');
    response.writeHead(200);
    response.end();
    return;
  }
  
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Collaborative Notes WebSocket Server is running');
  console.log('Sent 200 response');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });
console.log('WebSocket server created');

// File path for persistence
const persistencePath = path.join(__dirname, 'storage');
console.log(`Storage path: ${persistencePath}`);

// Create the storage directory if it doesn't exist
if (!fs.existsSync(persistencePath)) {
  console.log(`Creating storage directory: ${persistencePath}`);
  fs.mkdirSync(persistencePath, { recursive: true });
}

// Track connected clients
const connectedClients = new Map();

// Listen for WebSocket connections
wss.on('connection', (conn, req) => {
  // Get the URL of the connection
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const roomName = url.pathname.slice(1) || 'default'; // Remove leading '/'
  
  console.log(`New WebSocket connection to room: ${roomName}`);
  console.log(`Client IP: ${req.socket.remoteAddress}`);
  console.log(`Request headers:`, req.headers);
  
  // Store client connection with room info
  connectedClients.set(conn, { room: roomName });
  
  // Log total connections
  console.log(`Total clients connected: ${connectedClients.size}`);
  
  // Handle basic WebSocket messages directly for testing
  conn.on('message', (message) => {
    try {
      console.log(`Received message from client in room ${roomName}:`, message.toString());
      
      // Attempt to parse as JSON
      try {
        const jsonMessage = JSON.parse(message);
        console.log('Parsed as JSON:', jsonMessage);
        
        // Echo back for testing
        if (jsonMessage.type === 'test') {
          conn.send(JSON.stringify({
            type: 'response',
            message: 'Server received your test message',
            originalMessage: jsonMessage
          }));
        }
      } catch (e) {
        console.log('Message is not JSON or could not be parsed');
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });
  
  // Set up the WebSocket connection for Yjs
  try {
    console.log('Setting up Yjs WebSocket connection');
    setupWSConnection(conn, req, {
      gc: true,
      pingTimeout: 30000,
      docName: roomName
    });
    console.log('Yjs WebSocket connection established successfully');
  } catch (error) {
    console.error('Error setting up Yjs WebSocket connection:', error);
  }
  
  // Handle disconnection
  conn.on('close', (code, reason) => {
    console.log(`WebSocket connection closed with code ${code}${reason ? ': ' + reason : ''}`);
    
    const clientInfo = connectedClients.get(conn);
    if (clientInfo) {
      console.log(`Connection closed in room: ${clientInfo.room}`);
      connectedClients.delete(conn);
      console.log(`Total clients connected: ${connectedClients.size}`);
    }
  });
  
  // Handle connection errors
  conn.on('error', (error) => {
    console.error('WebSocket connection error:', error);
  });
});

// Handle WebSocket server errors
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

// Start the server
const PORT = process.env.PORT || 1234;
const HOSTNAME = '0.0.0.0'; // Listen on all network interfaces

server.listen(PORT, HOSTNAME, () => {
  console.log(`============================================`);
  console.log(`Collaborative Notes WebSocket Server running`);
  console.log(`Listening on: ${HOSTNAME}:${PORT}`);
  console.log(`Local URL: ws://localhost:${PORT}`);
  console.log(`Storage path: ${persistencePath}`);
  console.log(`============================================`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});