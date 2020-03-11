module.exports = class RandomService {

    getRandomNumber(max) {
        return Math.floor(Math.random() * max);
    }

    // Note that the max is INCLUSIVE
    getRandomNumberBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getRandomAngle() {
        return Math.random() * Math.PI * 2;
    }

    getRandomPositionInCircle(radius) {
        let angle = this.getRandomAngle();
        let radiusX = this.getRandomNumber(radius);
        let radiusY = this.getRandomNumber(radius);

        return {
            x: Math.cos(angle) * radiusX,
            y: Math.sin(angle) * radiusY
        };
    }
    
};
