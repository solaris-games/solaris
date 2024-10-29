import { Location } from "../types/Location";
import { Carrier } from "../types/Carrier";
import { Game } from "../types/Game";
import CarrierService from '../carrier';

const mongoose = require('mongoose');
import ValidationError from "../../errors/validation";
import { Star } from "../types/Star";

export default class CustomMapService {
    carrierService: CarrierService;

    constructor (
      carrierService: CarrierService
    ) {
      this.carrierService = carrierService;
    }

    generateLocations(customJSON: string, playerLimit: number): Location[] {
        let json;

        try {
          json = JSON.parse(customJSON)
        }
        catch (e) {
          throw new ValidationError('The custom map JSON is malformed.')
        }

        const locations: any[] = [];
        let playerIds: string[] = [];
        //const nameList = new Set()
        const homeStars: any[] = [];

        for (const star of json.stars) {
          // Fill in optional setting values.
          if (star.id != null) {
            if (typeof star.id === 'number') star.id = star.id.toString();
          } else star.id = null; // undefined, null -> null
          star.homeStar = star.homeStar == null ? false : star.homeStar;
          if (star.playerId != null) {
            if (typeof star.playerId === 'number') star.playerId = star.playerId.toString();
          } else star.playerId = null; // undefined, null -> null
          star.warpGate = star.warpGate == null ? false : star.warpGate;
          star.isNebula = star.isNebula == null ? false : star.isNebula;
          star.isAsteroidField = star.isAsteroidField == null ? false : star.isAsteroidField;
          star.isBinaryStar = star.isBinaryStar == null ? false : star.isBinaryStar;
          star.isBlackHole = star.isBlackHole == null ? false : star.isBlackHole;
          star.isPulsar = star.isPulsar == null ? false : star.isPulsar;
          if (star.wormHoleToStarId != null) {
            if (typeof star.wormHoleToStarId === 'number') star.wormHoleToStarId = star.wormHoleToStarId.toString();
          } else star.wormHoleToStarId = null; // undefined, null -> null
          star.specialistId = star.specialistId == null ? null : star.specialistId;
          star.shipsActual = star.shipsActual == null ? null : star.shipsActual;
          star.ships = star.shipsActual == null ? null : Math.floor(star.shipsActual!);
          if (star.infrastructure != null) {
            star.infrastructure.economy = star.infrastructure.economy == null ? 0 : star.infrastructure.economy;
            star.infrastructure.industry = star.infrastructure.industry == null ? 0 : star.infrastructure.industry;
            star.infrastructure.science = star.infrastructure.science == null ? 0 : star.infrastructure.science;
          }

          // Validate star properties are of the right type.
          // id and playerId are later replaced with ObjectIDs, so they can be of any type here.
          this._checkStarProperty(star, 'id', 'string', false);
          this._checkStarProperty(star, 'playerId', 'string', true);
          this._checkStarProperty(star?.location, 'x', 'number', false);
          this._checkStarProperty(star?.location, 'y', 'number', false);
          this._checkStarProperty(star?.naturalResources, 'economy', 'number', false);
          this._checkStarProperty(star?.naturalResources, 'industry', 'number', false);
          this._checkStarProperty(star?.naturalResources, 'science', 'number', false);
          this._checkStarProperty(star, 'warpGate', 'boolean', true);
          this._checkStarProperty(star, 'isNebula', 'boolean', true);
          this._checkStarProperty(star, 'isAsteroidField', 'boolean', true);
          this._checkStarProperty(star, 'isBinaryStar', 'boolean', true);
          this._checkStarProperty(star, 'isBlackHole', 'boolean', true);
          this._checkStarProperty(star, 'isPulsar', 'boolean', true);
          this._checkStarProperty(star, 'wormHoleToStarId', 'string', true);
          this._checkStarProperty(star, 'homeStar', 'boolean', true);
          this._checkStarProperty(star, 'specialistId', 'number', true);
          this._checkStarProperty(star, 'shipsActual', 'number', true);
          this._checkStarProperty(star, 'ships', 'number', true);
          if (star.infrastructure != null) {
            this._checkStarProperty(star?.infrastructure, 'economy', 'number', false);
            this._checkStarProperty(star?.infrastructure, 'industry', 'number', false);
            this._checkStarProperty(star?.infrastructure, 'science', 'number', false);
          }

          let mappedStar = {
            id: star.id,
            homeStar: star.homeStar,
            playerId: star.playerId,
            linkedLocations: [],
            warpGate: star.warpGate,
            isNebula: star.isNebula,
            isAsteroidField: star.isAsteroidField,
            isBinaryStar: star.isBinaryStar,
            isBlackHole: star.isBlackHole,
            isPulsar: star.isPulsar,
            wormHoleToStarId: star.wormHoleToStarId,
            specialistId: star.specialistId,
            location: {
              x: star.location.x,
              y: star.location.y
            },
            naturalResources: {
              economy: star.naturalResources.economy,
              industry: star.naturalResources.industry,
              science: star.naturalResources.science
            },
            shipsActual: star.shipsActual,
            ships: star.ships,
            ...(star.infrastructure ? {infrastructure: star.infrastructure} : undefined)
          };

          if (star?.homeStar) {
            homeStars.push(mappedStar);

            if (mappedStar.playerId != null) { 
              playerIds.push(mappedStar.playerId);
            }
          }

          locations.push(mappedStar);
        }

        playerIds = [...new Set(playerIds)]; // ignore repeated player indexes

        if (homeStars.length !== playerLimit) {
          throw new ValidationError(`Must have ${playerLimit} capital stars in the custom map.`);
        }

        if (homeStars.length === playerIds.length) {
          this._linkStars(homeStars, locations);
        } else if (playerIds.length !== 0) {
          throw new ValidationError('Unequal amount of home stars and players, or repeated player IDs');
        } // its fine to have all stars without players, in this case the other parts of game generation will asign players and initial stars

        // Populate actual IDs for all stars
        for (let loc of locations) {
          loc._id = mongoose.Types.ObjectId();
        }

        // Populate worm hole IDs of stars
        for (let loc of locations.filter(l => l.wormHoleToStarId != null)) {
          loc.wormHoleToStarId = locations.find(l => l.id === loc.wormHoleToStarId)?._id;

          if (!loc.wormHoleToStarId || loc.wormHoleToStarId.toString() === loc._id.toString()) {
            throw new ValidationError(`Worm hole to star id is invalid for ${JSON.stringify(loc)}`);
          }
        }

        return locations;
    }

    generateCarriers(game: Game, customJSON: string, stars: any[]): Carrier[] {
      let json;

      try {
        json = JSON.parse(customJSON)
      }
      catch (e) {
        throw new ValidationError('The custom map JSON is malformed.')
      }

      let carriers: any[] = [];
      for (const carrier of json.carriers) {
        if (carrier.orbiting != null) {
          if (typeof carrier.orbiting === 'number') carrier.orbiting = carrier.orbiting.toString();
        } else carrier.orbiting = null; // undefined, null -> null
        carrier.specialistId = carrier.specialistId == null ? null : carrier.specialistId;
        carrier.specialistExpireTick = carrier.specialistExpireTick == null ? null : carrier.specialistExpireTick;
        carrier.isGift = carrier.isGift == null ? false : carrier.isGift;

        this._checkCarrierProperty(carrier, 'orbiting', 'string', false);
        this._checkCarrierProperty(carrier, 'specialistId', 'number', true);
        this._checkCarrierProperty(carrier, 'specialistExpireTick', 'number', true);
        this._checkCarrierProperty(carrier, 'isGift', 'boolean', true);
        this._checkCarrierProperty(carrier, 'ships', 'number', false);

        let star = stars.find(s => s.id === carrier.orbiting); // star has all fields generated in generateLocations() as well as _id.
        if (star == null) {
          throw new ValidationError(`The carrier ${JSON.stringify(carrier)} is orbiting a non-existent star (id ${carrier.orbiting}).`);
        }
        let name = this.carrierService.generateCarrierName(star, carriers);

        let newCarrier: Carrier = {
            _id: mongoose.Types.ObjectId(),
            ownedByPlayerId: star.ownedByPlayerId,
            orbiting: star._id,
            name,
            ships: carrier.ships,
            specialistId: carrier.specialistId,
            specialistExpireTick: carrier.specialistExpireTick,
            isGift: carrier.isGift,
            waypoints: [],
            locationNext: null,
            waypointsLooped: false,
            specialist: null,
            location: star.location,
            toObject(): Carrier {
                return this;
            }
        };
        carriers.push(newCarrier);
      }
      return carriers;
    }

    _checkStarProperty(star, property: string, type: string, allowNull: boolean): boolean {
        if (star === undefined) throw new ValidationError(`Missing property of star ${star}`);
        if (star?.[property] === undefined) throw new ValidationError(`Missing property '${property}' of star ${JSON.stringify(star)}`);

        if (allowNull && star[property] === null) {
          return true;
        }

        if (typeof star[property] !== type) throw new ValidationError(`Invalid type property '${property}' of star ${JSON.stringify(star)}`);

        return true;
    }

     /*link owned stars to their home stars so at a latter stage players will claim the correct stars*/
    _linkStars(homeStars, stars) {
      let commonStars = stars.filter(star => !star.homeStar);

      for (let homeStar of homeStars) {
        homeStar.linkedLocations = [];

        for (let commonStar of commonStars) {
          if (commonStar.playerId === homeStar.playerId) {
            homeStar.linkedLocations.push(commonStar);
            commonStar.linked = true;
          }
        }
      }
    }

    _checkCarrierProperty(carrier, property: string, type: string, allowNull: boolean): boolean {
      if (carrier === undefined) throw new ValidationError(`Missing property of carrier ${carrier}.`);
      if (carrier?.[property] === undefined) throw new ValidationError(`Missing property '${property}' of carrier ${JSON.stringify(carrier)}`);

      if (allowNull && carrier[property] === null) {
        return true;
      }

      if (typeof carrier[property] !== type) throw new ValidationError(`Invalid type property '${property}' of carrier ${JSON.stringify(carrier)}`);

      return true;
    }
}
