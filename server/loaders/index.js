const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');
const agendaLoader = require('./agenda');
const socketLoader = require('./sockets');

module.exports = {
  
  async init(expressApp, expressServer) {
    await mongooseLoader();
    console.log('MongoDB Intialized');
  
    await expressLoader(expressApp);
    console.log('Express Intialized');

    await agendaLoader();
    console.log('Agenda Initialized');
  
    socketLoader(expressServer);
    console.log('Sockets Initialized');
  }

};
