/**
 * Simple startup script for the OSINT Framework
 * This script helps diagnose startup issues
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

// Create a simple Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic API endpoint for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'OSINT Framework API is running'
  });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`
  ┌───────────────────────────────────────────────────┐
  │                                                   │
  │   OSINT Framework Server Running                  │
  │                                                   │
  │   - Local:    http://localhost:${PORT}              │
  │   - Network:  http://${require('os').hostname()}:${PORT}  │
  │                                                   │
  │   Press Ctrl+C to stop                            │
  │                                                   │
  └───────────────────────────────────────────────────┘
  `);
});
