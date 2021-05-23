const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');
const socketLoader = require('./sockets');
const containerLoader = require('./container');

let mongo;

module.exports = {
  
  async init(expressApp, expressServer) {
    mongo = await mongooseLoader({
      syncIndexes: false
    });
    console.log('MongoDB Intialized');
    
    const io = socketLoader(expressServer);
    console.log('Sockets Initialized');

    const container = containerLoader(io);
    console.log('Dependency container loaded');
  
    await expressLoader(expressApp, io, container);
    console.log('Express Intialized');
  },

  async cleanup() {
    console.log('Disconnecting from MongoDB...');
    await mongo.disconnect();
    console.log('MongoDB disconnected.');
  }

};
