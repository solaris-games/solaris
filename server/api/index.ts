const express = require('express');
const http = require('http');
import config from '../config';
import expressLoader from './express';
import mongooseLoader from '../db';
import socketLoader from './sockets';
import containerLoader from '../services';

let mongo;

console.log(`Node ${process.version}`);

async function startServer() {
  mongo = await mongooseLoader(config, {});

  const app = express();
  const server = http.createServer(app);
  
  const container = containerLoader(config);

  const { sessionStorage } = await expressLoader(config, app, container);

  const io = socketLoader(config, server, sessionStorage);
  container.broadcastService.setIOController(io);

  server.listen(config.port, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`Server is running on port ${config.port}.`);
  });

  await container.discordService.initialize();
  container.notificationService.initialize();
}

process.on('SIGINT', async () => {
  console.log('Shutting down...');

  console.log('Disconnecting from MongoDB...');
  await mongo.disconnect();
  console.log('MongoDB disconnected.');

  console.log('Shutdown complete.');
  
  process.exit();
});

startServer();

export {};
