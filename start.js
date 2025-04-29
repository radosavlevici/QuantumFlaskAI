// Simple server runner
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

// Serve files from the public directory
async function serveFile(req, res) {
  try {
    // Get the file path
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(PUBLIC_DIR, filePath);
    
    // Get the file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read the file
    const data = await fs.promises.readFile(filePath);
    
    // Set the content type and send the file
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
    
    log(`Served ${req.url} (${contentType})`);
  } catch (err) {
    // If the file doesn't exist, try serving index.html (SPA fallback)
    if (err.code === 'ENOENT' && req.url !== '/index.html') {
      try {
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        const data = await fs.promises.readFile(indexPath);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
        
        log(`Served index.html as fallback for ${req.url}`);
      } catch (indexErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        log(`404: ${req.url}`);
      }
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      console.error(err);
      log(`500: ${req.url}`);
    }
  }
}

// Create the server
const server = http.createServer(async (req, res) => {
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
  
  // Serve files
  await serveFile(req, res);
});

// Start the server
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  log(`🚀 Server running at http://0.0.0.0:${PORT}/`);
});