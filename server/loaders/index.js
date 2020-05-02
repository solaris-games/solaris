const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');
const agendaLoader = require('./agenda');
const socketLoader = require('./sockets');
const containerLoader = require('./container');

module.exports = {
  
  async init(expressApp, expressServer) {
    await mongooseLoader();
    console.log('MongoDB Intialized');
    
    const io = socketLoader(expressServer);
    console.log('Sockets Initialized');

    const container = containerLoader(io);
    console.log('Dependency container loaded');
  
    await expressLoader(expressApp, io, container);
    console.log('Express Intialized');

    await agendaLoader(container);
    console.log('Agenda Initialized');
  }

};
