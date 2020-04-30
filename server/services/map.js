module.exports = class MapService {

    constructor(randomService, starDistanceService, starMapService) {
        this.randomService = randomService;
        this.starDistanceService = starDistanceService;
        this.starMapService = starMapService;
    }

    generateStars(starCount, playerLimit, warpGatesSetting) {
        let stars = this.starMapService.generate(starCount, warpGatesSetting);

        // If warp gates are enabled, assign random stars to start as warp gates.
        if (warpGatesSetting !== 'none') {
            this.generateGates(stars, warpGatesSetting, playerLimit);
        }

        return stars;
    }

    generateGates(stars, type, playerCount) {
        let gateCount = 0;

        switch(type) {
            case 'rare': gateCount = playerCount; break;            // 1 per player
            case 'common': gateCount = stars.length / playerCount; break;  // fucking loads
        }

        // Pick stars at random and set them to be warp gates.
        do {
            let star = stars[this.randomService.getRandomNumberBetween(0, stars.length - 1)];

            if (star.warpGate) {
                gateCount++; // Increment because the while loop will decrement.
            } else {
                star.warpGate = true;
            }
        } while (gateCount--);
    }

    getGalaxyDiameter(stars) {
        let maxX = stars.sort((a, b) => b.location.x - a.location.x)[0].location.x;
        let maxY = stars.sort((a, b) => b.location.y - a.location.y)[0].location.y;
        let minX = stars.sort((a, b) => a.location.x - b.location.x)[0].location.x;
        let minY = stars.sort((a, b) => a.location.y - b.location.y)[0].location.y;

        return {
            x: Math.abs(minX) + Math.abs(maxX),
            y: Math.abs(minY) + Math.abs(maxY),
        };
    }

    getGalaxyCenter(stars) {
        let maxX = stars.sort((a, b) => b.location.x - a.location.x)[0].location.x;
        let maxY = stars.sort((a, b) => b.location.y - a.location.y)[0].location.y;
        let minX = stars.sort((a, b) => a.location.x - b.location.x)[0].location.x;
        let minY = stars.sort((a, b) => a.location.y - b.location.y)[0].location.y;

        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        };
    }

    getGalaxyCenterOfMass(stars) {
        let totalX = stars.reduce((total, s) => total += s.location.x, 0);
        let totalY = stars.reduce((total, s) => total += s.location.y, 0);

        return {
            x: totalX / stars.length,
            y: totalY / stars.length,
        };
    }

};
