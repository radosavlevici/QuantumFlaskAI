// Script to launch our security dashboard
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Security Dashboard...');

// Start the server in detached mode
const serverProcess = spawn('node', ['run-dashboard.cjs'], {
  detached: true,
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});

console.log(`Server started with PID: ${serverProcess.pid}`);
console.log('Access the dashboard at: http://localhost:5000');
console.log('The server is now running in the background.');

// Save the PID to a file for later cleanup
fs.writeFileSync('server.pid', serverProcess.pid.toString());