import config from '../config';
import expressLoader from './express';
import mongooseLoader from './mongoose';
import socketLoader from './sockets';
import containerLoader from './container';

let mongo;

export default {
  
  async init(expressApp, expressServer) {
    mongo = await mongooseLoader(config, {});
    
    const io = socketLoader(config, expressServer);
    const container = containerLoader(config, io);
  
    await expressLoader(config, expressApp, io, container);

    // await container.donateService.listRecentDonations();
    // console.log('Loaded recent donations to cache');
  },

  async cleanup() {
    console.log('Disconnecting from MongoDB...');
    await mongo.disconnect();
    console.log('MongoDB disconnected.');
  }

};
