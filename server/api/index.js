const express = require('express');
const http = require('http');
const loaders = require('../loaders');
const config = require('../config');

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  await loaders.init(app, server);

  server.listen(config.port, err => {
    if (err) {
      console.log(err);
      return;
    }

    console.log(`Server is running on port ${config.port}.`);
  });
}

process.on('SIGINT', async () => {
  console.log('Shutting down...');

  await loaders.cleanup();

  console.log('Shutdown complete.');
  
  process.exit();
});

startServer();
