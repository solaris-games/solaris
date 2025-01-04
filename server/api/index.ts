import http from 'http';
import { Server } from "socket.io";
import config from '../config';
import mongooseLoader from '../db';
import containerLoader from '../services';
import { logger, setupLogging } from "../utils/logging";
import expressLoader from './express';
const express = require('express');

let mongo;
Error.stackTraceLimit = 1000;

setupLogging();

const log = logger();

log.info(`Node ${process.version}`);

async function startServer() {
  mongo = await mongooseLoader(config, {});

  const app = express();
  const server: http.Server = http.createServer(app);

  const socketServer = new Server(server, {
    cors: {
      origin: config.corsUrls,
      methods: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE', 'OPTIONS'],
      credentials: true
    }
  });

  log.info('Sockets initialized.');

  const container = containerLoader(config, socketServer, log);

  const { sessionStorage } = await expressLoader(config, app, container);
  container.sessionService.setSessionStorage(sessionStorage);
  container.socketService.setSessionStorage(sessionStorage);

  server.on('error', (err) => {
    if (err) {
      log.error(err);
    }
  });

  server.listen(config.port, () => {
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

  process.exit(0);
});

startServer();

export {};
