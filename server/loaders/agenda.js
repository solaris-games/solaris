const Agenda = require('agenda');
const config = require('../config');

module.exports = async (container) => {

    const gameTickJob = require('../jobs/gameTick')(container);
    const officialGamesCheckJob = require('../jobs/officialGamesCheck')(container);
    
    // Set up the agenda instance.
    const agendajs = new Agenda()
        .database(config.connectionString)
        .processEvery('1 second')
        .maxConcurrency(20);

    await agendajs._ready;

    // ------------------------------
    // Register jobs

    // Game tick
    agendajs.define('game-tick', {
        priority: 'high', concurrency: 10
    },
    gameTickJob.handler); // reference to the handler, but not executing it! 

    // New player game check
    agendajs.define('new-player-game-check', {
        priority: 'high', concurrency: 1
    },
    officialGamesCheckJob.handler);

    // ...

    // ------------------------------

    agendajs.start();

    // Start server jobs
    agendajs.every('1 second', 'game-tick'); // TODO: Every minute?
    agendajs.every('10 seconds', 'new-player-game-check'); // TODO: Every minute?

    return agendajs;
};
