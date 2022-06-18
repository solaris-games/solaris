import { Config } from "../config/types/Config";

const cache = require('memory-cache');

export default class CacheService {
    
    config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    put(key: string, obj, time: number) {
        if (this.config.cacheEnabled) {
            return cache.put(key, obj, time);
        }

        return null;
    }

    get(key: string) {
        if (this.config.cacheEnabled) {
            return cache.get(key);
        }

        return null;
    }
    
};
