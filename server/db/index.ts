import config from '../config';
import mongooseLoader from '../loaders/mongoose';
import fs from 'fs';
import path from 'path';

let mongo;

async function startup() {
    mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1
    });
    
    console.log('MongoDB Intialized');

    console.log('Running migrations...');

    const dirPath: string = path.join(__dirname, 'migrations');

    let files: string[] = fs.readdirSync(dirPath).sort((a, b) => a.localeCompare(b));

    for (let file of files) {
        console.log(file);
    
        const filePath = path.join(dirPath, file);
        const script = require(filePath);

        await script.migrate(mongo.connection.db);
    }

    console.log('Database migrated.');
}

process.on('SIGINT', async () => {
    console.log('Shutting down...');

    await mongo.disconnect();

    console.log('Shutdown complete.');

    process.exit();
});

startup().then(() => {
    console.log('Database migration started.');
});

export {};
