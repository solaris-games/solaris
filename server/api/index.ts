import {logger, onReady, setupLogging} from "../utils/logging";

const express = require('express');
const http = require('http');
import config from '../config';
import expressLoader from './express';
import mongooseLoader from '../db';
import socketLoader from './sockets';
import containerLoader from '../services';

let mongo;
Error.stackTraceLimit = 1000;

setupLogging();

const log = logger();

log.info(`Node ${process.version}`);

async function startServer() {
  mongo = await mongooseLoader(config, {});

  const app = express();
  const server = http.createServer(app);
  
  const container = containerLoader(config);

  const { sessionStorage } = await expressLoader(config, app, container);
  container.sessionService.setSessionStorage(sessionStorage);

  const io = socketLoader(config, server, sessionStorage);
  container.broadcastService.setIOController(io);

  server.listen(config.port, (err) => {
    if (err) {
      log.error(err);
      return;
    }

    log.info(`Server is running on port ${config.port}.`);
  });

  await container.discordService.initialize();
  container.notificationService.initialize();
}

process.on('SIGINT', async () => {
  log.info('Shutting down...');

  log.info('Disconnecting from MongoDB...');
  await mongo.disconnect();
  log.info('MongoDB disconnected.');

  log.info('Shutdown complete.');

  onReady(() => process.exit());
});

startServer();

export {};
