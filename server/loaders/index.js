const config = require('../config');
const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');
const socketLoader = require('./sockets');
const containerLoader = require('./container');

let mongo;

module.exports = {
  
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

    await container.donateService.listRecentDonations();
    console.log('Loaded recent donations to cache');
  },

  async cleanup() {
    console.log('Disconnecting from MongoDB...');
    await mongo.disconnect();
    console.log('MongoDB disconnected.');
  }

};
