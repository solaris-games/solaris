import {logger, setupLogging} from "../utils/logging";

import config from '../config';
import mongooseLoader from '../db';
import containerLoader from '../services';

import { gameTickJob } from './jobs/gameTick';
import { officialGamesCheckJob } from './jobs/officialGamesCheck';
import { cleanupGamesTimedOutJob } from './jobs/cleanupGamesTimedOut';
import { cleanupOldGameHistoryJob } from './jobs/cleanupOldGameHistory';
import { cleanupOldTutorialsJob } from './jobs/cleanupOldTutorials';
import { serverStub } from "../sockets/serverStub";
import {Scheduler, SchedulerOptions} from "./scheduler/scheduler";
import events from "node:events";

let mongo;
Error.stackTraceLimit = 1000;

events.setMaxListeners(20);

setupLogging();

const TEN_SECONDS = 10000;

const ONE_MINUTE = 60000;

const ONE_HOUR = ONE_MINUTE * 60;

const ONE_DAY = 3600000 * 24;

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

    const schedulerOptions: SchedulerOptions = {
        checkInterval: 5000,
    };

    const scheduler = new Scheduler([
        {
            name: 'game-tick',
            job: gameTickJob(container),
            interval: TEN_SECONDS
        },
        {
            name: 'new-player-game-check',
            job: officialGamesCheckJob(container),
            interval: ONE_MINUTE
        },
        {
            name: 'cleanup-games-timed-out',
            job: cleanupGamesTimedOutJob(container),
            interval: ONE_HOUR
        },
        {
            name: 'cleanup-old-game-history',
            job: cleanupOldGameHistoryJob(container),
            interval: ONE_DAY
        },
        {
            name: 'cleanup-old-tutorials',
            job: cleanupOldTutorialsJob(container),
            interval: ONE_DAY
        }
    ], schedulerOptions);

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
