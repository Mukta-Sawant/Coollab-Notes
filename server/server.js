const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// Your existing WebSocket logic from test-websocket.js goes here
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Serve static files from the client build directory
app.use(express.static(path.resolve(__dirname, '../client/dist')));

// All other requests go to the React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});