// Simple HTTP server for the security dashboard
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// MIME types for common file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Log utility
function log(message, source = "server") {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [${source}] ${message}`);
}

// Mock API data
const mockData = {
  user: {
    id: 1,
    username: 'demo_user',
    email: 'user@example.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
    createdAt: new Date().toISOString()
  },
  dashboardSummary: {
    securityScore: 75,
    activeSessions: 3,
    weakPasswords: 2,
    recommendations: 4,
    alerts: 1
  },
  securityEvents: [
    {
      id: 1, 
      userId: 1,
      type: 'login',
      severity: 'info',
      description: 'Successful login from known device',
      ipAddress: '192.168.1.1',
      location: 'San Francisco, CA',
      deviceInfo: 'Chrome on macOS',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      userId: 1,
      type: 'password_change',
      severity: 'info',
      description: 'Password changed successfully',
      ipAddress: '192.168.1.1',
      location: 'San Francisco, CA',
      deviceInfo: 'Chrome on macOS',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      userId: 1,
      type: 'login_failed',
      severity: 'warning',
      description: 'Failed login attempt',
      ipAddress: '203.0.113.42',
      location: 'Unknown',
      deviceInfo: 'Unknown',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  securityAlerts: [
    {
      id: 1,
      userId: 1,
      title: 'Unusual login detected',
      description: 'A login was detected from a new location: Moscow, Russia',
      severity: 'high',
      dismissed: false,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  sessions: [
    {
      id: 1,
      userId: 1,
      ipAddress: '192.168.1.1',
      location: 'San Francisco, CA',
      deviceInfo: 'Chrome on macOS',
      lastActive: new Date().toISOString(),
      isCurrentSession: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      userId: 1,
      ipAddress: '192.168.1.10',
      location: 'San Francisco, CA',
      deviceInfo: 'Safari on iOS',
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      isCurrentSession: false,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  storedPasswords: [
    {
      id: 1,
      userId: 1,
      website: 'example.com',
      username: 'user@example.com',
      password: '********',
      notes: 'Work account',
      strength: 'medium',
      lastUpdated: new Date(Date.now() - 2592000000).toISOString()
    },
    {
      id: 2,
      userId: 1,
      website: 'social-network.com',
      username: 'demo_user',
      password: '********',
      notes: 'Personal account',
      strength: 'weak',
      lastUpdated: new Date(Date.now() - 7776000000).toISOString()
    }
  ],
  recommendations: [
    {
      id: 1,
      userId: 1,
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      priority: 'high',
      implementedAt: null,
      type: 'security'
    },
    {
      id: 2,
      userId: 1,
      title: 'Update weak passwords',
      description: 'You have 2 passwords that are considered weak',
      priority: 'high',
      implementedAt: null,
      type: 'password'
    },
    {
      id: 3,
      userId: 1,
      title: 'Review third-party access',
      description: 'Review applications with access to your account',
      priority: 'medium',
      implementedAt: null,
      type: 'security'
    }
  ]
};

// Handle API requests
async function handleApiRequest(req, res, url) {
  res.setHeader('Content-Type', 'application/json');
  
  if (url === '/api/user') {
    return mockData.user;
  } else if (url === '/api/dashboard/summary') {
    return mockData.dashboardSummary;
  } else if (url === '/api/security-events') {
    return mockData.securityEvents;
  } else if (url === '/api/security-alerts') {
    return mockData.securityAlerts;
  } else if (url === '/api/sessions') {
    return mockData.sessions;
  } else if (url === '/api/passwords') {
    return mockData.storedPasswords;
  } else if (url === '/api/recommendations') {
    return mockData.recommendations;
  } else {
    res.statusCode = 404;
    return { message: "API endpoint not found" };
  }
}

// Serve a static file
async function serveStaticFile(req, res, filePath) {
  try {
    // Default to index.html if path is '/'
    const fullPath = filePath === '/' ? join(publicDir, 'index.html') : join(publicDir, filePath);
    
    // Get file extension for MIME type
    const ext = extname(fullPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Read and serve the file
    const content = await readFile(fullPath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    return content;
  } catch (err) {
    // If file not found, fall back to index.html (for SPA)
    if (err.code === 'ENOENT') {
      try {
        const content = await readFile(join(publicDir, 'index.html'));
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        return content;
      } catch (indexErr) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        return 'Not Found';
      }
    } else {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      console.error(err);
      return 'Internal Server Error';
    }
  }
}

// Create and start the HTTP server
const server = createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // Get the URL path
  const url = req.url || '/';
  const method = req.method || 'GET';
  
  // Log the request
  const start = Date.now();
  let responseContent;

  try {
    // Handle API requests
    if (url.startsWith('/api')) {
      responseContent = await handleApiRequest(req, res, url);
      res.end(JSON.stringify(responseContent));
    } else {
      // Serve static files
      responseContent = await serveStaticFile(req, res, url);
      res.end(responseContent);
    }
    
    // Log the response time
    const duration = Date.now() - start;
    log(`${method} ${url} ${res.statusCode} in ${duration}ms`);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Internal Server Error');
    console.error(err);
  }
});

// Start the server
const port = 5000;
server.listen(port, '0.0.0.0', () => {
  log(`🚀 Server running at http://0.0.0.0:${port}/`);
});