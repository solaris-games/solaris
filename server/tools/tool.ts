import { DependencyContainer } from "../services/types/DependencyContainer";
import mongoose from "mongoose";
import config from "../config";
import containerLoader from "../services";
import mongooseLoader from "../db/index";
import { serverStub } from "../sockets/serverStub";
import { logger } from "../utils/logging";
import { Logger } from "pino";

let mongo,
    container: DependencyContainer;

const startup = async (jobName) => {
    const log = logger(jobName);

    mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1,
    });

    container = containerLoader(config, serverStub, log);

    log.info(`${jobName} initialized`);

    return {
        mongo,
        container,
        log
    }
} 

export type JobParameters = {
    mongo: any,
    container: DependencyContainer,
    log: Logger,
}

export const makeJob = (jobName: string, job: (params: JobParameters) => Promise<void>) => async () => {
    const params = await startup(jobName);

    const log = params.log;

    const shutdown = async () => { 
        log.info('Shutting down...');
    
        await mongo.disconnect();
    
        log.info('Shutdown complete.');
    
        process.exit();
    }

    process.on('SIGINT', async () => {
        await shutdown();
    });
    
    try {
        await job(params);
        log.info(`${jobName}: done.`);
    } catch (e) {
        log.error(e);
    } finally {
        await shutdown();
    }
}