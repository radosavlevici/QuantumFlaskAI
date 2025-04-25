const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  
  // API endpoints
  if (req.url.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json');
    
    if (req.url === '/api/user') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        id: 1,
        username: 'demo_user',
        email: 'user@example.com',
        firstName: 'Demo',
        lastName: 'User'
      }));
    } else if (req.url === '/api/dashboard/summary') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        securityScore: 75,
        activeSessions: 3,
        weakPasswords: 2,
        recommendations: 4,
        alerts: 1
      }));
    } else if (req.url === '/api/security-events') {
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
    } else if (req.url === '/api/security-alerts') {
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
    } else if (req.url === '/api/sessions') {
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
    } else if (req.url === '/api/passwords') {
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
    } else if (req.url === '/api/recommendations') {
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
    return;
  }
  
  // Serve static HTML dashboard for any other route
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Dashboard</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f7fa;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        h1 {
          margin: 0;
          background: linear-gradient(90deg, #4a56e2, #8a4be2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .card {
          background-color: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .card h2 {
          margin-top: 0;
          font-size: 1.25rem;
          color: #333;
        }
        .stat {
          font-size: 2.5rem;
          font-weight: bold;
          margin: 16px 0;
          background: linear-gradient(90deg, #4a56e2, #8a4be2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        .alert {
          background-color: #ffecec;
          border-left: 4px solid #f44336;
          padding: 16px 20px;
          margin-bottom: 24px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(244, 67, 54, 0.1);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background-color: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          margin-bottom: 30px;
        }
        th, td {
          padding: 16px;
          text-align: left;
        }
        th {
          background-color: #f0f2f5;
          font-weight: 600;
          color: #555;
        }
        tr:nth-child(even) {
          background-color: #f9fafc;
        }
        tr:hover {
          background-color: #f0f4ff;
        }
        .nav {
          background-color: #fff;
          padding: 16px 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .nav a {
          text-decoration: none;
          color: #4a56e2;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        .nav a:hover {
          background-color: #f0f4ff;
        }
        .btn {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(90deg, #4a56e2, #8a4be2);
          color: white;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 86, 226, 0.3);
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-warning {
          background-color: #fff3e0;
          color: #ff9800;
        }
        .badge-info {
          background-color: #e3f2fd;
          color: #2196f3;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Security Dashboard</h1>
        <div>
          <span>Welcome, Demo User</span>
        </div>
      </header>
      
      <div class="nav">
        <a href="#">Dashboard</a>
        <a href="#">Security Status</a>
        <a href="#">Activity Log</a>
        <a href="#">Password Manager</a>
        <a href="#">Sessions</a>
        <a href="#">Settings</a>
      </div>
      
      <div class="alert">
        <strong>⚠️ Security Alert:</strong> Unusual login detected from Moscow, Russia. <a href="#" class="btn">Review activity</a>
      </div>
      
      <div class="cards">
        <div class="card">
          <h2>Security Score</h2>
          <div class="stat">75%</div>
          <p>Your account security needs improvement</p>
          <a href="#" class="btn">View recommendations</a>
        </div>
        
        <div class="card">
          <h2>Active Sessions</h2>
          <div class="stat">3</div>
          <p>Devices currently logged in</p>
          <a href="#" class="btn">Manage sessions</a>
        </div>
        
        <div class="card">
          <h2>Weak Passwords</h2>
          <div class="stat">2</div>
          <p>Passwords that need strengthening</p>
          <a href="#" class="btn">Update passwords</a>
        </div>
        
        <div class="card">
          <h2>Pending Recommendations</h2>
          <div class="stat">4</div>
          <p>Security improvements to make</p>
          <a href="#" class="btn">View recommendations</a>
        </div>
      </div>
      
      <h2>Recent Activity</h2>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Location</th>
            <th>Device</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="badge badge-info">Login</span> Successful login</td>
            <td>San Francisco, CA</td>
            <td>Chrome on macOS</td>
            <td>Just now</td>
          </tr>
          <tr>
            <td><span class="badge badge-info">Change</span> Password changed</td>
            <td>San Francisco, CA</td>
            <td>Chrome on macOS</td>
            <td>Yesterday</td>
          </tr>
          <tr>
            <td><span class="badge badge-warning">Alert</span> Failed login attempt</td>
            <td>Unknown</td>
            <td>Unknown</td>
            <td>2 days ago</td>
          </tr>
        </tbody>
      </table>
      
      <script>
        // Simple client-side JavaScript to handle interactivity
        document.addEventListener('DOMContentLoaded', function() {
          const links = document.querySelectorAll('a');
          links.forEach(link => {
            link.addEventListener('click', function(e) {
              e.preventDefault();
              alert('This is a static demo. In the working application, this would navigate to: ' + link.textContent);
            });
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log('Security Dashboard API is ready to use');
  console.log('Available endpoints:');
  console.log('- GET /api/user');
  console.log('- GET /api/dashboard/summary');
  console.log('- GET /api/security-events');
  console.log('- GET /api/security-alerts');
  console.log('- GET /api/sessions');
  console.log('- GET /api/passwords');
  console.log('- GET /api/recommendations');
});