// Simple server for security dashboard (CommonJS version)
const http = require('http');
const fs = require('fs');
const path = require('path');

// Directory configuration
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Log helper
function log(message) {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [server] ${message}`);
}

// Create the server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Get the file path
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(PUBLIC_DIR, filePath);

  // Get the file extension
  const extname = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Check if the file exists
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If the file doesn't exist, try serving index.html (SPA fallback)
      if (err.code === 'ENOENT') {
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        
        fs.readFile(indexPath, (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            log(`404: ${req.url}`);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexData);
            log(`Served index.html as fallback for ${req.url}`);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        console.error(err);
        log(`500: ${req.url}`);
      }
      return;
    }

    // Set the content type and send the file
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
    log(`Served ${req.url} (${contentType})`);
  });
});

// Start the server
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  log(`🚀 Server running at http://0.0.0.0:${PORT}/`);
});