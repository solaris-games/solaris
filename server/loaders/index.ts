import config from '../config';
import expressLoader from './express';
import mongooseLoader from './mongoose';
import socketLoader from './sockets';
import containerLoader from './container';

let mongo;

export default {
  
  async init(expressApp, expressServer) {
    mongo = await mongooseLoader(config, {
      syncIndexes: false
    });
    console.log('MongoDB Intialized');
    
    const io = socketLoader(config, expressServer);
    console.log('Sockets Initialized');

    const container = containerLoader(config, io);
    console.log('Dependency container loaded');
  
    await expressLoader(config, expressApp, io, container);
    console.log('Express Intialized');
  },

  async cleanup() {
    console.log('Disconnecting from MongoDB...');
    await mongo.disconnect();
    console.log('MongoDB disconnected.');
  }

};
