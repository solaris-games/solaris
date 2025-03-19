import {Logger, default as pino } from "pino";
import config from '../config';

let baseLogger;

export const setupLogging = () => {
    const loggingT = config.logging || 'stdout';
    let logDestination;

    if (loggingT === 'pretty') {
        logDestination = {
            target: 'pino-pretty'
        };
    } else if (loggingT === 'stdout') {
        logDestination = {
            target: 'pino/file',
            options: {destination: 1}
        };
    } else {
        throw new Error(`Invalid logging type: ${loggingT}`);
    }

    baseLogger = pino({
        level: config.logLevel || 'info',
        transport: logDestination,
    });
}

export const logger = (name?: string): Logger => {
    if (!baseLogger) {
        setupLogging();
    }

    if (name) {
        return baseLogger.child({name});
    } else {
        return baseLogger;
    }
}