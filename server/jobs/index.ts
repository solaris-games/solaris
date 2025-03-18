import {logger, setupLogging} from "../utils/logging";

import config from '../config';
import mongooseLoader from '../db';
import containerLoader from '../services';

import { gameTickJob } from './gameTick';
import {officialGamesCheckJob} from './officialGamesCheck';
import CleanupGamesTimedOutJob from './cleanupGamesTimedOut';
import CleanupOldGameHistoryJob from './cleanupOldGameHistory';
import CleanupOldTutorialsJob from './cleanupOldTutorials';
import SendReviewRemindersJob from './sendReviewReminders';
import { serverStub } from "../sockets/serverStub";
import {Scheduler, SchedulerOptions} from "./scheduler/scheduler";

let mongo;
Error.stackTraceLimit = 1000;

setupLogging();

const log = logger();

async function startup() {

    const container = containerLoader(config, serverStub, log);

    mongo = await mongooseLoader(config, {
        unlockJobs: true,
        poolSize: 1
    });

    await container.discordService.initialize();
    container.notificationService.initialize();
    
    // ------------------------------
    // Jobs that run every time the server restarts.

    log.info('Unlock all games...');
    await container.gameService.lockAll(false);
    log.info('All games unlocked');

    // ------------------------------

    const cleanupGamesTimedOutJob = CleanupGamesTimedOutJob(container);
    const cleanupOldGameHistory = CleanupOldGameHistoryJob(container);
    const cleanupOldTutorials = CleanupOldTutorialsJob(container);
    const sendReviewReminders = SendReviewRemindersJob(container);

    const schedulerOptions: SchedulerOptions = {
        checkInterval: 5000
    };

    const scheduler = new Scheduler([
        {
            name: 'game-tick',
            job: gameTickJob(container),
            interval: 10000
        },
        {
            name: 'new-player-game-check',
            job: officialGamesCheckJob(container),
            interval: 60000
        }
    ], schedulerOptions);

    // TODO: Migrate other jobs too

    //// Cleanup old games that reached timeout
    //agendajs.define('cleanup-games-timed-out', {
    //    priority: 'high', concurrency: 1
    //},
    //cleanupGamesTimedOutJob.handler);
//
    //// Cleanup old game history
    //agendajs.define('cleanup-old-game-history', {
    //    priority: 'high', concurrency: 1
    //},
    //cleanupOldGameHistory.handler);
//
    //// Cleanup old tutorials
    //agendajs.define('cleanup-old-tutorials', {
    //    priority: 'high', concurrency: 1
    //},
    //cleanupOldTutorials.handler);
//
    //// Send review reminders
    //agendajs.define('send-review-reminders', {
    //    priority: 'high', concurrency: 1
    //},
    //sendReviewReminders.handler);

    // ...

    // ------------------------------

    // Start server jobs
    //agendajs.every('1 hour', 'cleanup-games-timed-out');
    //agendajs.every('1 day', 'cleanup-old-game-history');
    //agendajs.every('1 day', 'cleanup-old-tutorials');
    //agendajs.every('10 seconds', 'send-review-reminders'); // TODO: Every 10 seconds until we've gone through all backlogged users.

    await scheduler.startup();

    const schedulerFinished = scheduler.run();

    await new Promise<void>((resolve, _) => {
        process.on('SIGINT', async () => {
            log.info('Shutting down...');

            await schedulerFinished;

            await mongo.disconnect();

            log.info('Shutdown complete.');
            resolve();

            process.exit(0);
        });
    });
}

startup().then(() => {
    log.info('Jobs started.');
});

export {};
