import {Logger} from "pino";
import config from '../config';

const pino = require('pino');
let transport;
let baseLogger;

export const setupLogging = () => {
    const loggingT = config.logging || 'stdout';

    if (loggingT === 'pretty') {
        transport = pino.transport({
            target: 'pino-pretty'
        });
    } else if (loggingT === 'stdout') {
        transport = pino.transport({
            target: 'pino/file',
            options: {destination: 1}
        });
    } else {
        throw new Error(`Invalid logging type: ${loggingT}`);
    }

    baseLogger = pino(transport);
}

export const onReady = (callback: () => void) => {
    transport.on('ready', callback);
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