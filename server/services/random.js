module.exports = {

    getRandomNumber(max) {
        return Math.floor(Math.random() * max);
    },

    getRandomNumberBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
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
