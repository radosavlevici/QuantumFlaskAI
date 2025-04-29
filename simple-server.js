// A simplified server that combines both API and static file serving
const http = require('http');
const fs = require('fs');
const path = require('path');

// Store data in memory
const securityData = {
  user: {
    id: 1,
    name: "Demo User",
    email: "user@example.com",
    role: "user",
    createdAt: "2025-01-15T00:00:00.000Z"
  },
  dashboardSummary: {
    securityScore: 75,
    activeSessions: 3,
    weakPasswords: 2,
    recommendations: 4,
    alerts: 1
  },
  securityEvents: [
    { id: 1, userId: 1, type: "login", severity: "info", description: "Successful login", location: "San Francisco, CA", device: "Chrome on macOS", ipAddress: "192.168.1.1", timestamp: new Date().toISOString() },
    { id: 2, userId: 1, type: "password_change", severity: "info", description: "Password changed", location: "San Francisco, CA", device: "Chrome on macOS", ipAddress: "192.168.1.1", timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, userId: 1, type: "login_failed", severity: "warning", description: "Failed login attempt", location: "Moscow, Russia", device: "Unknown", ipAddress: "45.123.45.67", timestamp: new Date(Date.now() - 172800000).toISOString() }
  ],
  securityAlerts: [
    { id: 1, userId: 1, type: "unusual_login", severity: "high", description: "Unusual login detected from Moscow, Russia", ipAddress: "45.123.45.67", dismissed: false, timestamp: new Date(Date.now() - 172800000).toISOString() }
  ],
  sessions: [
    { id: 1, userId: 1, device: "Chrome on macOS", location: "San Francisco, CA", ipAddress: "192.168.1.1", lastActive: new Date().toISOString(), isCurrentSession: true },
    { id: 2, userId: 1, device: "Safari on iOS", location: "New York, NY", ipAddress: "172.16.254.1", lastActive: new Date(Date.now() - 172800000).toISOString(), isCurrentSession: false },
    { id: 3, userId: 1, device: "Firefox on Windows", location: "San Francisco, CA", ipAddress: "192.168.1.5", lastActive: new Date(Date.now() - 432000000).toISOString(), isCurrentSession: false }
  ],
  passwords: [
    { id: 1, userId: 1, service: "Gmail", username: "username@gmail.com", password: "••••••••••••", strength: "weak", lastUpdated: new Date(Date.now() - 5184000000).toISOString() },
    { id: 2, userId: 1, service: "Facebook", username: "username@gmail.com", password: "••••••••••••••", strength: "weak", lastUpdated: new Date(Date.now() - 31536000000).toISOString() },
    { id: 3, userId: 1, service: "Amazon", username: "username@gmail.com", password: "••••••••••••••••", strength: "medium", lastUpdated: new Date(Date.now() - 1209600000).toISOString() },
    { id: 4, userId: 1, service: "Bank Account", username: "username", password: "••••••••••••••••••••", strength: "strong", lastUpdated: new Date(Date.now() - 604800000).toISOString() }
  ],
  recommendations: [
    { id: 1, userId: 1, type: "enable_2fa", title: "Enable Two-Factor Authentication", description: "Add an extra layer of security by requiring a second verification step when logging in.", implemented: false },
    { id: 2, userId: 1, type: "update_passwords", title: "Update Weak Passwords", description: "You have 2 passwords that are considered weak or have been reused across multiple sites.", implemented: false },
    { id: 3, userId: 1, type: "review_activity", title: "Review Recent Activity", description: "You've recently checked your account activity. Keep monitoring for any suspicious logins.", implemented: true },
    { id: 4, userId: 1, type: "remove_apps", title: "Remove Unused Applications", description: "You have 3 applications that haven't been used in over 6 months but still have access to your account.", implemented: false }
  ]
};

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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const url = req.url;
  console.log(`[${new Date().toISOString()}] ${req.method} ${url}`);
  
  // API endpoints
  if (url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    
    // User endpoint
    if (url === '/api/user') {
      res.writeHead(200);
      res.end(JSON.stringify(securityData.user));
    }
    // Dashboard summary
    else if (url === '/api/dashboard/summary') {
      res.writeHead(200);
      res.end(JSON.stringify(securityData.dashboardSummary));
    }
    // Security events
    else if (url === '/api/security-events') {
      res.writeHead(200);
      res.end(JSON.stringify(securityData.securityEvents));
    }
    // Security alerts
    else if (url === '/api/security-alerts') {
      res.writeHead(200);
      res.end(JSON.stringify(securityData.securityAlerts));
    }
    // Sessions
    else if (url === '/api/sessions') {
      res.writeHead(200);
      res.end(JSON.stringify(securityData.sessions));
    }
    // Passwords
    else if (url === '/api/passwords') {
      res.writeHead(200);
      res.end(JSON.stringify(securityData.passwords));
    }
    // Recommendations
    else if (url === '/api/recommendations') {
      res.writeHead(200);
      res.end(JSON.stringify(securityData.recommendations));
    }
    // API not found
    else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
  }
  // Serve static files
  else {
    // Default to index.html for root
    let filePath = '.' + url;
    if (filePath === './') {
      filePath = './security-dashboard.html';
    }
    
    const extname = path.extname(filePath);
    let contentType = contentTypes[extname] || 'text/plain';
    
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // Try to serve security-dashboard.html as fallback
          fs.readFile('./security-dashboard.html', (err, content) => {
            if (err) {
              res.writeHead(404);
              res.end('404 Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content, 'utf8');
            }
          });
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${error.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf8');
      }
    });
  }
});

const PORT = 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log('Access the Security Dashboard at: http://0.0.0.0:8000/');
  console.log('API endpoints available at: http://0.0.0.0:8000/api/');
  console.log('\nAvailable API endpoints:');
  console.log('- GET /api/user');
  console.log('- GET /api/dashboard/summary');
  console.log('- GET /api/security-events');
  console.log('- GET /api/security-alerts');
  console.log('- GET /api/sessions');
  console.log('- GET /api/passwords');
  console.log('- GET /api/recommendations');
});