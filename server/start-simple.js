// Simple starter script to run our simplified server
import { spawn } from 'child_process';
console.log('Starting simplified server...');
spawn('node', ['--import', 'tsx', 'server/simple-server.ts'], {
  stdio: 'inherit',
  shell: true
});