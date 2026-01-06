import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

import { app } from './app';

let httpsServer: https.Server | null = null;

// used by shutdownCheck in readinessChecks
app.locals.shutdown = false;

const port: number = parseInt(process.env.PORT || '3100', 10);

// Check if SSL certificates exist
const sslDirectory = path.join(__dirname, 'resources', 'localhost-ssl');
const sslCertPath = path.join(sslDirectory, 'localhost.crt');
const sslKeyPath = path.join(sslDirectory, 'localhost.key');
const sslEnabled = app.locals.ENV === 'development' && fs.existsSync(sslCertPath) && fs.existsSync(sslKeyPath);

if (sslEnabled) {
  const sslOptions = {
    cert: fs.readFileSync(sslCertPath),
    key: fs.readFileSync(sslKeyPath),
  };
  httpsServer = https.createServer(sslOptions, app);
  httpsServer.listen(port, () => {
    console.log(`Application started: https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Application started: http://localhost:${port}`);
  });
}

function gracefulShutdownHandler(signal: string) {
  console.log(`⚠️ Caught ${signal}, gracefully shutting down. Setting readiness to DOWN`);
  // stop the server from accepting new connections
  app.locals.shutdown = true;

  setTimeout(() => {
    console.log('Shutting down application');
    // Close server if it's running
    httpsServer?.close(() => {
      console.log('HTTPS server closed');
    });
  }, 4000);
}

process.on('SIGINT', gracefulShutdownHandler);
process.on('SIGTERM', gracefulShutdownHandler);
