import { Carrier } from "./types/Carrier";
import { Game } from "./types/Game";
import { Location } from "./types/Location";
import { Star } from "./types/Star";
import MapService from "./map";

export default class OrbitalMechanicsService {
    mapService: MapService;

    constructor(
        mapService: MapService
    ) {
        this.mapService = mapService;
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

        // TODO: Get this logic checked by someone who knows what maths is.
        let r = Math.sqrt(Math.pow(Math.abs(objectWithLocation.location.x), 2) + Math.pow(objectWithLocation.location.y, 2));
        
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
    
};
