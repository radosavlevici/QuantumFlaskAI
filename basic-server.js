// Very basic server to test connectivity
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a simple server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Serve the test dashboard for any request
  fs.readFile('test-dashboard.html', (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error: ${err.message}`);
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

// Start the server on port 9000 (different from other servers)
const PORT = 9000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Basic test server running at http://0.0.0.0:${PORT}/`);
  console.log('Open this URL in your browser to test basic connectivity');
});