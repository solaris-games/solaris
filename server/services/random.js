const minResourceScore = 10;
const maxResourceScore = 50;

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

    getRandomPositionInCircleFromOrigin(originX, originY, radius) {
        let position = this.getRandomPositionInCircle(radius);

        position.x += originX;
        position.y += originY;

        return position;
    }
    

    getResourceScore(radius, x, y){
        let vector = Math.hypot(x, y);
        
        //How far from the outside (%) is the point
        let vectorScale = (radius - vector)/radius;

        let resourceRange = maxResourceScore - minResourceScore;

        let score = minResourceScore + (resourceRange * vectorScale);

        return score;
    }
};
