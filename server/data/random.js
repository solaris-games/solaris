module.exports = {

    getRandomNumber(max) {
        return Math.floor(Math.random() * max);
    },

    getRandomNumberBetween(min, max) {
        return Math.floor(Math.random() * max) + min;
    },

    getWeightedRandomNumberBetween(min, max) {
        return Math.round(max / (Math.random() * max + min));
    },

    getRandomAngle() {
        return Math.random() * Math.PI * 2;
    },

    getRandomPositionInCircle(radius) {
        let angle = module.exports.getRandomAngle();
        let radiusX = module.exports.getRandomNumber(radius);
        let radiusY = module.exports.getRandomNumber(radius);

        return {
            x: Math.cos(angle) * radiusX,
            y: Math.sin(angle) * radiusY
        };
    }
    
};
