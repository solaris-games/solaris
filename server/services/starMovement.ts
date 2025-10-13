import { Carrier } from "./types/Carrier";
import { Game } from "./types/Game";
import { Location } from "./types/Location";
import { Star } from "./types/Star";
import MapService from "./map";
import { StarDistanceService } from 'solaris-common';
import SpecialistService from "./specialist";
import { WaypointService } from 'solaris-common';
import CullWaypointsService from "./cullWaypoints";

export default class starMovementService {
    mapService: MapService;
    starDistanceService: StarDistanceService;
    specialistService: SpecialistService;
    cullWaypointsService: CullWaypointsService;

    constructor(
        mapService: MapService,
        starDistanceService: StarDistanceService,
        specialistService: SpecialistService,
        cullWaypointsService: CullWaypointsService,
    ) {
        this.mapService = mapService;
        this.starDistanceService = starDistanceService;
        this.specialistService = specialistService;
        this.cullWaypointsService = cullWaypointsService;
    }

    orbitGalaxy(game: Game) {
        for (let star of game.galaxy.stars) {
            this.orbitStar(game, star);
        }

        for (let carrier of game.galaxy.carriers) {
            this.orbitCarrier(game, carrier);
        }

        for (let carrier of game.galaxy.carriers) {
            this.cullWaypointsService.cullWaypointsByHyperspaceRange(game, carrier);
        }
    }

    orbitStar(game: Game, star: Star) {
        this.orbitObject(game, star);
    }

    orbitCarrier(game: Game, carrier: Carrier) {
        this.orbitObject(game, carrier);
    }

    orbitObject(game: Game, objectWithLocation: Star | Carrier) {
        objectWithLocation.location = this.getNextLocation(game, objectWithLocation);
    }

    getNextLocation(game: Game, objectWithLocation: Star | Carrier) {
        if (game.settings.orbitalMechanics.enabled === 'disabled') {
            throw new Error('Game settings disallow orbital mechanics.');
        }

        let galaxyCenter = game.constants.distances.galaxyCenterLocation!; // TODO: Refresh this constant(?) on rotation?

        let speed = game.settings.orbitalMechanics.orbitSpeed;
        let direction = 1; // TODO: Fuck it, clockwise everything.

        // Much shorter function that does the same thing, calculate the distance to (0,0)
        let r = Math.hypot(galaxyCenter.x - objectWithLocation.location.x, galaxyCenter.y - objectWithLocation.location.y);
        
        let arcLength = 0;

        if (r !== 0) {
            arcLength = speed / r * 100;
        }
        
        return this.rotate(
            galaxyCenter.x, galaxyCenter.y,
            objectWithLocation.location.x, objectWithLocation.location.y, 
            arcLength);
    }

    rotate(cx: number, cy: number, x: number, y: number, angle: number): Location {
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

    moveStellarEngines(game: Game) {
        const beaconStars = game.galaxy.stars.filter(s => this.specialistService.getStarAttract(s));

        if (beaconStars.length === 0) {
            return;
        }

        const engineStars = game.galaxy.stars.filter(s => this.specialistService.getStarMovement(s));

        for (let star of engineStars) {
            let closestStar = this.starDistanceService.getClosestStar(star, beaconStars);
            let distanceToClosestStar = this.starDistanceService.getDistanceBetweenStars(star, closestStar);
            let starSpeed = this.specialistService.getStarMovementPerTick(star) * game.settings.specialGalaxy.carrierSpeed;

            // This line makes sure the Stellar Engine never moves too close to the target star
            starSpeed = distanceToClosestStar - starSpeed <= 0.5 * game.constants.distances.minDistanceBetweenStars ? distanceToClosestStar - 0.5 * game.constants.distances.minDistanceBetweenStars : starSpeed;

            this.moveStarTowardsLocation(game, star, closestStar.location, starSpeed);
        }

        const nonEngineStars = game.galaxy.stars.filter(s => !this.specialistService.getStarMovement(s));

        this.maintainDistance(game, engineStars, nonEngineStars)
    }

    maintainDistance(game: Game, movedStars: Star[], stars: Star[]) {
        for (let star of movedStars) {
            let nearbyStars = this.starDistanceService.getStarsWithinRadiusOfStar(star, stars, game.constants.distances.minDistanceBetweenStars);
            let tooCloseStars = this.starDistanceService.getStarsWithinRadiusOfStar(star, stars, 0.49 * game.constants.distances.minDistanceBetweenStars);

            if (tooCloseStars.length === 0) {
                continue;
            }

            let k: number = 0

            while(tooCloseStars.length !== 0 && k < 50) {
                let closestStar = this.starDistanceService.getClosestStar(star, tooCloseStars);

                this.shiftAway(game, star, closestStar, (0.501-k*0.01)*game.constants.distances.minDistanceBetweenStars);

                tooCloseStars = this.starDistanceService.getStarsWithinRadiusOfStar(star, nearbyStars, (0.49 - k*0.01) * game.constants.distances.minDistanceBetweenStars);

                k++;
            }
        }
    }

    shiftAway(game: Game, movingStar: Star, stationaryStar: Star, range: number) {
        let shift = this.starDistanceService.getDistanceBetweenStars(movingStar, stationaryStar) - range;

        this.moveStarTowardsLocation(game, movingStar, stationaryStar.location, shift);
    }

    moveStarTowardsLocation(game: Game, star: Star, location: Location, speed: number) {
        // This function is used to move a star either towards a location with positive speed, or shift it away with negative speed.
        if (star.location === location) {
            return;
        }

        let dx = location.x - star.location.x,
            dy = location.y - star.location.y;

        let mag = Math.hypot(dx, dy);

        let delta = {
            x: speed * dx/mag,
            y: speed * dy/mag
        };

        star.location.x += delta.x;
        star.location.y += delta.y;

        // Move all carriers that are in orbit of that star to the same location.
        const carriersInOrbit = game.galaxy.carriers.filter(c => c.orbiting && c.orbiting.toString() === star._id.toString());

        for (let carrier of carriersInOrbit) {
            carrier.location = star.location;
        }
    }
    
};
