// Simple HTTP server for development purposes
import { createServer } from "http";
import fs from "fs";
import path from "path";

// Logging utility function
function log(message: string, source = "server") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Create a simple HTTP server
const server = createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  
  // Log the request
  const start = Date.now();
  const url = req.url || '/';
  const method = req.method || 'GET';
  
  // Handle API requests
  if (url.startsWith('/api')) {
    // Mock response for now
    res.setHeader('Content-Type', 'application/json');
    
    // Simplified API responses
    if (url === '/api/user') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        id: 1,
        username: 'demo_user',
        email: 'user@example.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        createdAt: new Date().toISOString()
      }));
    } else if (url === '/api/dashboard/summary') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        securityScore: 75,
        activeSessions: 3,
        weakPasswords: 2,
        recommendations: 4,
        alerts: 1
      }));
    } else if (url === '/api/security-events') {
      res.statusCode = 200;
      res.end(JSON.stringify([
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
      ]));
    } else if (url === '/api/security-alerts') {
      res.statusCode = 200;
      res.end(JSON.stringify([
        {
          id: 1,
          userId: 1,
          title: 'Unusual login detected',
          description: 'A login was detected from a new location: Moscow, Russia',
          severity: 'high',
          dismissed: false,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]));
    } else if (url === '/api/sessions') {
      res.statusCode = 200;
      res.end(JSON.stringify([
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
      ]));
    } else if (url === '/api/passwords') {
      res.statusCode = 200;
      res.end(JSON.stringify([
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
      ]));
    } else if (url === '/api/recommendations') {
      res.statusCode = 200;
      res.end(JSON.stringify([
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
      ]));
    } else {
      // API endpoint not found
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "API endpoint not found" }));
    }
    
    // Log API request
    const duration = Date.now() - start;
    log(`${method} ${url} ${res.statusCode} in ${duration}ms`);
  } else {
    try {
      // Serve the client index.html for non-API requests
      const clientPath = path.resolve(process.cwd(), 'client');
      const indexPath = path.join(clientPath, 'index.html');
      
      if (fs.existsSync(indexPath)) {
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        const content = fs.readFileSync(indexPath, 'utf-8');
        res.end(content);
        log(`Served index.html`);
      } else {
        // Fallback response
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Security Dashboard</title>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
              <div id="root">
                <h1>Security Dashboard Demo</h1>
                <p>This is a simplified server for the Security Dashboard application.</p>
                <p>API endpoints are available at /api/* paths.</p>
              </div>
            </body>
          </html>
        `);
        log(`Served fallback HTML`);
      }
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Internal Server Error');
      console.error(err);
    }
  }
});

// Start the server
const port = 5000;
server.listen(port, '0.0.0.0', () => {
  log(`🚀 Server running at http://0.0.0.0:${port}/`);
});