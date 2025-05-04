// Simple WebSocket test script
// Run this with: node test-websocket.js
const WebSocket = require('ws');

// Create WebSocket connection
// Use 127.0.0.1 instead of localhost to force IPv4
const socket = new WebSocket('ws://127.0.0.1:1234/test-room');

// Connection opened
socket.addEventListener('open', (event) => {
  console.log('✅ WebSocket connection established successfully!');
  
  // Send a test message
  socket.send(JSON.stringify({
    type: 'test',
    message: 'Hello from test client',
    time: new Date().toISOString()
  }));
  
  // After 3 seconds, close the connection
  setTimeout(() => {
    console.log('Test complete - closing connection');
    socket.close();
  }, 3000);
});

// Listen for messages
socket.addEventListener('message', (event) => {
  console.log('Message from server:', event.data);
});

// Connection error
socket.addEventListener('error', (event) => {
  console.error('❌ WebSocket connection error:', event);
});

// Connection closed
socket.addEventListener('close', (event) => {
  console.log('WebSocket connection closed:', event.code, event.reason);
  process.exit(0);
});

console.log('Attempting to connect to WebSocket server at ws://localhost:1234/test-room...');