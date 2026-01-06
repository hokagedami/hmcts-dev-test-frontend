#!/usr/bin/env node
/**
 * Cross-platform E2E test runner
 * Starts the server, waits for it to be ready, runs tests, then cleans up
 */

const { spawn } = require('child_process');
const http = require('http');

const SERVER_URL = 'http://localhost:3100';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000;

let serverProcess = null;

function log(message) {
  console.log(`[e2e-runner] ${message}`);
}

function waitForServer(retries = 0) {
  return new Promise((resolve, reject) => {
    const req = http.get(SERVER_URL, res => {
      log(`Server is ready (status: ${res.statusCode})`);
      resolve();
    });

    req.on('error', () => {
      if (retries >= MAX_RETRIES) {
        reject(new Error(`Server not ready after ${MAX_RETRIES} attempts`));
        return;
      }
      setTimeout(() => {
        waitForServer(retries + 1)
          .then(resolve)
          .catch(reject);
      }, RETRY_INTERVAL);
    });

    req.setTimeout(1000, () => {
      req.destroy();
      if (retries >= MAX_RETRIES) {
        reject(new Error(`Server not ready after ${MAX_RETRIES} attempts`));
        return;
      }
      setTimeout(() => {
        waitForServer(retries + 1)
          .then(resolve)
          .catch(reject);
      }, RETRY_INTERVAL);
    });
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    log('Starting server...');

    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';

    serverProcess = spawn(npmCmd, ['run', 'start:test'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows,
      detached: !isWindows,
    });

    serverProcess.stdout.on('data', data => {
      const output = data.toString();
      if (output.includes('Application started')) {
        log('Server started');
        resolve();
      }
    });

    serverProcess.stderr.on('data', data => {
      console.error(data.toString());
    });

    serverProcess.on('error', err => {
      reject(new Error(`Failed to start server: ${err.message}`));
    });

    // Fallback: resolve after waiting for server to be ready via HTTP
    setTimeout(() => {
      waitForServer().then(resolve).catch(reject);
    }, 2000);
  });
}

function runTests() {
  return new Promise((resolve, reject) => {
    log('Running e2e tests...');

    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';

    const testProcess = spawn(npmCmd, ['run', 'test:functional'], {
      stdio: 'inherit',
      shell: isWindows,
    });

    testProcess.on('close', code => {
      resolve(code);
    });

    testProcess.on('error', err => {
      reject(new Error(`Failed to run tests: ${err.message}`));
    });
  });
}

function killServer() {
  if (!serverProcess) return;

  log('Stopping server...');

  const isWindows = process.platform === 'win32';

  if (isWindows) {
    // On Windows, use taskkill to kill the process tree
    spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t'], { shell: true });
  } else {
    // On Unix, kill the process group
    process.kill(-serverProcess.pid, 'SIGTERM');
  }
}

async function main() {
  let exitCode = 1;

  try {
    await startServer();
    await waitForServer();
    exitCode = await runTests();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    exitCode = 1;
  } finally {
    killServer();
  }

  process.exit(exitCode);
}

// Handle cleanup on process termination
process.on('SIGINT', () => {
  killServer();
  process.exit(1);
});

process.on('SIGTERM', () => {
  killServer();
  process.exit(1);
});

main();
