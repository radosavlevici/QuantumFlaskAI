// Simple script to start the security dashboard server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

console.log('Starting Security Dashboard Server...');

const serverProcess = spawn('node', ['fixed-server.cjs'], {
  detached: true,
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});

console.log(`Server started with PID: ${serverProcess.pid}`);
console.log('Access the dashboard at: http://localhost:5000');