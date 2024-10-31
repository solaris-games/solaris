import {Config} from "../config/types/Config";
import {Logger} from "pino";

const pino = require('pino');
let transport;
let baseLogger;

export const setupLogging = (config: Config) => {
    const loggingT = config.logging || 'stdout';

    if (loggingT === 'stdout') {
        transport = pino.transport({
            target: 'pino-pretty'
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
    if (name) {
        return baseLogger.child({ name });
    } else {
        return baseLogger;
    }
}