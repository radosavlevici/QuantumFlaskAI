// ES Module version of our server starter
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

console.log('Starting Security Dashboard Server...');

// First check if the server is already running
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/user', (res) => {
      console.log(`Server already running! Status: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Server response:', data);
        resolve(true);
      });
    });
    
    req.on('error', () => {
      console.log('Server not running, starting new instance...');
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  const isRunning = await checkServerRunning();
  
  if (!isRunning) {
    // Start the server in its own process
    const serverProcess = spawn('node', ['fixed-server.cjs'], {
      detached: true,
      stdio: 'inherit'
    });
    
    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
    });
    
    console.log(`Server started with PID: ${serverProcess.pid}`);
    console.log('Access the dashboard at: http://localhost:5000');
    
    // Save the PID for later cleanup if needed
    fs.writeFileSync('server.pid', serverProcess.pid.toString());
  }
  
  console.log('\nSecurity Dashboard HTML interface available at:');
  console.log('http://localhost:5000/security-dashboard.html');
  
  // Now serve the security-dashboard.html file
  const dashboardHtml = fs.readFileSync('security-dashboard.html', 'utf8');
  http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(dashboardHtml);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }).listen(8000);
  
  console.log('\nAlternative simple interface available at:');
  console.log('http://localhost:8000');
}

main();