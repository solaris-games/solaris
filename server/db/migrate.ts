import config from '../config';
import mongooseLoader from '.';
import fs from 'fs';
import path from 'path';
import {logger} from "../utils/logging";

let mongo;

const log = logger("Migrations")

async function startup() {
    mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1
    });
    
    log.info('Running migrations...');

    const dirPath: string = path.join(__dirname, 'migrations');

    let files: string[] = fs.readdirSync(dirPath)
        .filter(a => !a.endsWith('js.map'))
        .sort((a, b) => a.localeCompare(b));

    for (let file of files) {
        log.info(file);
    
        const filePath = path.join(dirPath, file);
        const script = require(filePath);

        try {
            await script.migrate(mongo.connection.db);
        } catch (e) {
            log.error(e);

            return Promise.reject(e);
        }
    }
    
    return Promise.resolve();
}

process.on('SIGINT', async () => {
    await shutdown();
});

async function shutdown() {
    log.info('Shutting down...');

    await mongo.disconnect();

    log.info('Shutdown complete.');
    
    process.exit();
}

startup().then(async () => {
    log.info('Database migrated.');

    await shutdown();
}).catch(async err => {
    await shutdown();
});

export {};
