// Simple script to start the security dashboard server in foreground mode
console.log('Starting the Security Dashboard Server...');
console.log('Press Ctrl+C to stop the server.\n');

// Import the child_process module to spawn a child process
const { spawn } = require('child_process');

// Run the server in a child process but connect to the parent's standard I/O
const server = spawn('node', ['simple-server.cjs'], {
  stdio: 'inherit'
});

// Handle the server process exit
server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle errors
server.on('error', (err) => {
  console.error('Failed to start server:', err);
});