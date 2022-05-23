import config from '../config';
import mongooseLoader from '.';
import fs from 'fs';
import path from 'path';

let mongo;

async function startup() {
    mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1
    });
    
    console.log('Running migrations...');

    const dirPath: string = path.join(__dirname, 'migrations');

    let files: string[] = fs.readdirSync(dirPath)
        .filter(a => !a.endsWith('js.map'))
        .sort((a, b) => a.localeCompare(b));

    for (let file of files) {
        console.log(file);
    
        const filePath = path.join(dirPath, file);
        const script = require(filePath);

        try {
            await script.migrate(mongo.connection.db);
        } catch (e) {
            console.error(e);

            return Promise.reject(e);
        }
    }
    
    return Promise.resolve();
}

process.on('SIGINT', async () => {
    await shutdown();
});

async function shutdown() {
    console.log('Shutting down...');

    await mongo.disconnect();

    console.log('Shutdown complete.');
    
    process.exit();
}

startup().then(async () => {
    console.log('Database migrated.');

    await shutdown();
}).catch(async err => {
    await shutdown();
});

export {};
