// CommonJS version of our server starter
const { spawn } = require('child_process');

console.log('Starting Security Dashboard Server...');

// Start the server in detached mode
const serverProcess = spawn('node', ['fixed-server.cjs'], {
  detached: true,
  stdio: 'ignore'
});

// Let the parent process exit independently
serverProcess.unref();

console.log(`Server started with PID: ${serverProcess.pid}`);
console.log('Access the dashboard at: http://localhost:5000');
console.log('Server is running in the background. Use the web view to access it.');