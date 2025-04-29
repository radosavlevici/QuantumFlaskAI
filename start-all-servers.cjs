// Script to start both API server and static server
const { spawn } = require('child_process');

console.log('Starting Security Dashboard API Server...');
const apiServer = spawn('node', ['fixed-server.cjs'], {
  detached: true,
  stdio: 'ignore'
});
apiServer.unref();
console.log(`API Server started with PID: ${apiServer.pid}`);
console.log('API available at: http://localhost:5000/api');

console.log('\nStarting Static File Server...');
const staticServer = spawn('node', ['static-server.cjs'], {
  detached: true,
  stdio: 'ignore'
});
staticServer.unref();
console.log(`Static Server started with PID: ${staticServer.pid}`);
console.log('Dashboard available at: http://localhost:3000');

console.log('\nBoth servers are running in the background.');
console.log('Access the Security Dashboard at: http://localhost:3000');
console.log('API endpoints available at: http://localhost:5000/api');