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
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
    return;
  }
  
  // Serve static HTML dashboard
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
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        h1 {
          margin: 0;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .card h2 {
          margin-top: 0;
        }
        .stat {
          font-size: 2rem;
          font-weight: bold;
          color: #4a56e2;
          margin: 10px 0;
        }
        .alert {
          background-color: #ffecec;
          border-left: 4px solid #f44336;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        th {
          background-color: #f5f5f5;
        }
        .nav {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .nav a {
          margin-right: 15px;
          text-decoration: none;
          color: #4a56e2;
          font-weight: 500;
        }
        .nav a:hover {
          text-decoration: underline;
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
        <strong>Security Alert:</strong> Unusual login detected from Moscow, Russia. <a href="#">Review activity</a>
      </div>
      
      <div class="cards">
        <div class="card">
          <h2>Security Score</h2>
          <div class="stat">75%</div>
          <p>Your account security needs improvement</p>
          <a href="#">View recommendations</a>
        </div>
        
        <div class="card">
          <h2>Active Sessions</h2>
          <div class="stat">3</div>
          <p>Devices currently logged in</p>
          <a href="#">Manage sessions</a>
        </div>
        
        <div class="card">
          <h2>Weak Passwords</h2>
          <div class="stat">2</div>
          <p>Passwords that need strengthening</p>
          <a href="#">Update passwords</a>
        </div>
        
        <div class="card">
          <h2>Pending Recommendations</h2>
          <div class="stat">4</div>
          <p>Security improvements to make</p>
          <a href="#">View recommendations</a>
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
            <td>Successful login</td>
            <td>San Francisco, CA</td>
            <td>Chrome on macOS</td>
            <td>Just now</td>
          </tr>
          <tr>
            <td>Password changed</td>
            <td>San Francisco, CA</td>
            <td>Chrome on macOS</td>
            <td>Yesterday</td>
          </tr>
          <tr>
            <td>Failed login attempt</td>
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
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});