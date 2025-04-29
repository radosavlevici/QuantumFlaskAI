// Simple static file server to serve our security dashboard
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Content type mapping
const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url);
  
  // Get path from URL
  let pathName = parsedUrl.pathname;
  
  // If requesting root, serve the security dashboard
  if (pathName === '/' || pathName === '') {
    pathName = '/security-dashboard.html';
  }
  
  // Get the file path
  const filePath = path.join(__dirname, pathName);
  
  // Get file extension
  const extname = path.extname(filePath);
  
  // Set default content type
  let contentType = contentTypes[extname] || 'text/plain';
  
  // Read file and serve
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        fs.readFile(path.join(__dirname, 'security-dashboard.html'), (err, content) => {
          if (err) {
            // Even the fallback not found
            res.writeHead(404);
            res.end('404 Not Found');
          } else {
            // Fallback to security dashboard
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success - serve the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start server on port 3000
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Static file server running at http://0.0.0.0:${PORT}/`);
  console.log('Security Dashboard available at the root URL');
});