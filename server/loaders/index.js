const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');

module.exports = {
  
  async init(expressApp) {
    const mongoConnection = await mongooseLoader();
    console.log('MongoDB Intialized');
  
    await expressLoader(expressApp);
    console.log('Express Intialized');
  
    // ... More loaders
  
    // ... Initialize agenda
  }

};
