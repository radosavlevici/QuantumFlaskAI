// Startup script for our simplified server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'static-server.js');

console.log('Starting simplified security dashboard server...');

// Start the server process
const serverProcess = spawn('node', ['--import', 'tsx', serverPath], {
  stdio: 'inherit',
  detached: false
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Log process events
serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  if (!serverProcess.killed) {
    serverProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  if (!serverProcess.killed) {
    serverProcess.kill();
  }
  process.exit(0);
});