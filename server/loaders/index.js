const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');
const agendaLoader = require('./agenda');

module.exports = {
  
  async init(expressApp) {
    await mongooseLoader();
    console.log('MongoDB Intialized');
  
    await expressLoader(expressApp);
    console.log('Express Intialized');

    await agendaLoader();
    console.log('Agenda Initialized');
  
    // ... More loaders
  }

};
