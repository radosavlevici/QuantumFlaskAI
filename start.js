/**
 * start.js - Main startup script for the Security Dashboard
 * 
 * This script automatically starts the simple security dashboard server
 * in the background and provides instructions for accessing it.
 */

// Import required modules
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

console.log('🚀 Starting Security Dashboard Application...');

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

// Function to log a message with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Append to server log file
  fs.appendFileSync('server.log', logMessage + '\n');
}

// Function to start the server
async function startServer() {
  // Check if port 8000 is already in use
  const portInUse = await isPortInUse(8000);
  
  if (portInUse) {
    log('Port 8000 is already in use. Assuming server is already running.');
    displayServerInfo();
    return;
  }
  
  // Store the server PID so we can terminate it later if needed
  const serverProcess = spawn('node', ['simple-server.cjs'], {
    detached: true,
    stdio: 'ignore'
  });
  
  // Write PID to file
  fs.writeFileSync('server.pid', serverProcess.pid.toString());
  
  // Allow the parent process to exit independently
  serverProcess.unref();
  
  log(`Server started with PID: ${serverProcess.pid}`);
  displayServerInfo();
}

// Function to display server information
function displayServerInfo() {
  log(`
=================================================================
🔐 SECURITY DASHBOARD IS RUNNING 🔐
=================================================================
• Dashboard URL: http://localhost:8000/
• API Documentation: http://localhost:8000/api/

Available API Endpoints:
• GET /api/user - User profile data
• GET /api/dashboard/summary - Security overview metrics
• GET /api/security-events - Recent security events
• GET /api/security-alerts - Active security alerts
• GET /api/sessions - Active login sessions
• GET /api/passwords - Stored passwords
• GET /api/recommendations - Security recommendations
=================================================================
`);
}

// Start the server
startServer().catch(err => {
  log(`Error starting server: ${err.message}`);
});