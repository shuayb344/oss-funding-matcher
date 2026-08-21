const { spawn } = require('child_process');
const path = require('path');

// Keep process event loop alive to prevent Node 24 premature exit bug
const keepAlive = setInterval(() => {}, 5000);

const binPath = path.resolve(__dirname, '../node_modules/.bin/next');

// Use Node flags to prevent Turbopack SIGSEGV crashes on Node 24
const child = spawn(process.execPath, [
  '--max-old-space-size=4096',
  binPath,
  'dev',
  '--webpack',
  ...process.argv.slice(2),
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Force IPv4 to avoid DNS resolution issues  
    NODE_OPTIONS: (process.env.NODE_OPTIONS || '') + ' --dns-result-order=ipv4first',
  },
});

child.on('error', (err) => {
  console.error('Failed to start next dev:', err);
  clearInterval(keepAlive);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`next dev exited with signal: ${signal}`);
  }
  clearInterval(keepAlive);
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  clearInterval(keepAlive);
  setTimeout(() => process.exit(0), 500);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  clearInterval(keepAlive);
  setTimeout(() => process.exit(0), 500);
});
