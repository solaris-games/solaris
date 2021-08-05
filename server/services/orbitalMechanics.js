module.exports = class OrbitalMechanicsService {

    constructor(mapService) {
        this.mapService = mapService;
    }

    orbitStar(game, star) {
        this.orbitObject(game, star);
    }

    orbitCarrier(game, carrier) {
        this.orbitObject(game, carrier);
    }

    orbitObject(game, objectWithLocation) {
        if (game.settings.orbitalMechanics.enabled === 'disabled') {
            throw new Error('Game settings disallow orbital mechanics.');
        }

        const starLocations = game.galaxy.stars.map(s => s.location);

        let galaxyCenter;

        switch (game.settings.orbitalMechanics.orbitOrigin) {
            case 'galacticCenter':
                galaxyCenter = this.mapService.getGalaxyCenter(starLocations);
                break;
            case 'galacticCenterOfMass':
                galaxyCenter = this.mapService.getGalaxyCenterOfMass(starLocations);
                break;
            default:
                throw new Error('Unknown orbit origin setting.');
        }
        
        let speed = game.settings.orbitalMechanics.orbitSpeed;
        let direction = 1; // TODO: Fuck it, clockwise everything.

        // TODO: Get this logic checked by someone who knows what maths is.
        let r = Math.sqrt(Math.pow(Math.abs(objectWithLocation.location.x), 2) + Math.pow(objectWithLocation.location.y, 2));
        
        let arcLength = 0;

        if (r !== 0) {
            arcLength = speed / r * 100;
        }
        
        objectWithLocation.location = this.rotate(
            galaxyCenter.x, galaxyCenter.y,
            objectWithLocation.location.x, objectWithLocation.location.y, 
            arcLength);
    }

    rotate(cx, cy, x, y, angle) {
        let radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

        return {
            x: nx,
            y: ny
        };
    }
    
};
