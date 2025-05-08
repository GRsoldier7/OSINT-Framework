/**
 * Simple HTTP server for the OSINT Framework
 * This is a minimal server that serves static files
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Define the port
const PORT = 5000;

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create the server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle API requests
  if (req.url.startsWith('/api/')) {
    if (req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'OSINT Framework API is running'
      }));
      return;
    }
    
    // Handle other API endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not Found',
      message: 'The requested API endpoint does not exist'
    }));
    return;
  }
  
  // Serve static files
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'basic.html' : req.url);
  
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If the file doesn't exist, serve the basic.html file
      filePath = path.join(__dirname, 'public', 'basic.html');
    }
    
    // Get the file extension
    const extname = path.extname(filePath);
    
    // Set the content type based on the file extension
    const contentType = MIME_TYPES[extname] || 'text/plain';
    
    // Read the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // If there's an error reading the file, return a 500 error
        res.writeHead(500);
        res.end('Server Error');
        console.error(`Error reading file: ${err}`);
        return;
      }
      
      // If the file is read successfully, return it with the correct content type
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`
  ┌───────────────────────────────────────────────────┐
  │                                                   │
  │   OSINT Framework Simple Server Running           │
  │                                                   │
  │   - URL: http://localhost:${PORT}                   │
  │                                                   │
  │   Press Ctrl+C to stop                            │
  │                                                   │
  └───────────────────────────────────────────────────┘
  `);
});
