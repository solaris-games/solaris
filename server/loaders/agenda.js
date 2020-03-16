const Agenda = require('agenda');
const config = require('../config');

const gameTickJob = require('../jobs/gameTick');

module.exports = async () => {

    // Set up the agenda instance.
    const agendajs = new Agenda()
        .database(config.connectionString)
        .processEvery('10 seconds')
        .maxConcurrency(20);

    await agendajs._ready;

    // ------------------------------
    // Register jobs

    // game-tick
    agendajs.define('game-tick', {
        priority: 'high', concurrency: 10
    },
    gameTickJob.handler); // reference to the handler, but not executing it! 

    // ...

    // ------------------------------
    
    agendajs.start();

    // Start server jobs
    agendajs.every('10 seconds', 'game-tick'); // Every minute

    return agendajs;
};
