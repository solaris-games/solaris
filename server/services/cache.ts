const cache = require('memory-cache');

export default class CacheService {
    
    put(key, obj, time) {
        if (this._isCacheEnabled()) {
            return cache.put(key, obj, time);
        }

        return null;
    }

    get(key) {
        if (this._isCacheEnabled()) {
            return cache.get(key);
        }

        return null;
    }

    _isCacheEnabled() {
        return process.env.CACHE_ENABLED === 'true';
    }
    
};
