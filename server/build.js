
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure the dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy the server files to dist
fs.cpSync('server', 'dist/server', { recursive: true });

console.log('Server files copied to dist');

// Copy the shared files to dist
if (fs.existsSync('shared')) {
  fs.cpSync('shared', 'dist/shared', { recursive: true });
  console.log('Shared files copied to dist');
}

console.log('Build complete!');
