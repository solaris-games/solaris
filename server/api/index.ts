const express = require('express');
const http = require('http');
import config from '../config';
import expressLoader from './express';
import mongooseLoader from '../models/mongoose';
import socketLoader from './sockets';
import containerLoader from '../services';

let mongo;

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  mongo = await mongooseLoader(config, {});
    
  const io = socketLoader(config, server);
  const container = containerLoader(config, io);

  await expressLoader(config, app, io, container);

  // await container.donateService.listRecentDonations();
  // console.log('Loaded recent donations to cache');

  await container.discordService.initialize();
  container.notificationService.initialize();

  server.listen(config.port, (err) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log(`Server is running on port ${config.port}.`);
  });
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
