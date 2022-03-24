const cache = require('memory-cache');

export default class CacheService {
    
    put(key: string, obj, time: number) {
        if (this._isCacheEnabled()) {
            return cache.put(key, obj, time);
        }

        return null;
    }

    get(key: string) {
        if (this._isCacheEnabled()) {
            return cache.get(key);
        }

        return null;
    }

    _isCacheEnabled(): boolean {
        return process.env.CACHE_ENABLED === 'true';
    }
    
};
