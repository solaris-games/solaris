import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "@solaris-common";
import Repository from './repository';
import { Game } from './types/Game';
import { Player } from './types/Player';
import CarrierService from './carrier';
import StarService from './star';

export default class ShipTransferService {
    gameRepo: Repository<Game>;
    carrierService: CarrierService;
    starService: StarService;

    constructor(
        gameRepo: Repository<Game>,
        carrierService: CarrierService,
        starService: StarService
    ) {
        this.gameRepo = gameRepo;
        this.carrierService = carrierService;
        this.starService = starService;
    }

    async garrisonAllShips(game: Game, player: Player, starId: DBObjectId, writeToDB: boolean = true) {
        let star = this.starService.getById(game, starId);
        let carriersAtStar = this.carrierService.getCarriersAtStar(game, starId)
            .filter(c => c.ownedByPlayerId!.toString() === player._id.toString());

        if (!star.ownedByPlayerId || star.ownedByPlayerId.toString() !== player._id.toString()) {
            throw new ValidationError('The player does not own this star.');
        }

        if (!carriersAtStar.length) {
            throw new ValidationError('The player does not own any carriers in orbit of this star.');
        }

        let shipsToTransfer = 0;
        
        for (let carrier of carriersAtStar) {
            if (carrier.ships! > 1) {
                shipsToTransfer += (carrier.ships!-1)
                carrier.ships = 1
            }
        }

        star.shipsActual! += shipsToTransfer;
        star.ships = Math.floor(star.shipsActual!);

        if (writeToDB) {
            // Generate an array of all requires DB updates.
            let dbWrites: any[] = carriersAtStar.map(c => {
                return {
                    updateOne: {
                        filter: {
                            _id: game._id,
                            'galaxy.carriers._id': c._id
                        },
                        update: {
                            'galaxy.carriers.$.ships': c.ships
                        }
                    }
                };
            });
    
            dbWrites.push({
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.stars._id': star._id
                    },
                    update: {
                        'galaxy.stars.$.shipsActual': star.shipsActual,
                        'galaxy.stars.$.ships': star.ships
                    }
                }
            });
    
            // Update the DB.
            await this.gameRepo.bulkWrite(dbWrites);
        }

        return {
            star: {
                _id: star._id,
                ships: star.ships
            },
            carriers: carriersAtStar.map(c => {
                return {
                    _id: c._id,
                    ships: c.ships
                }
            })
        };
    }

    async distributeAllShips(game: Game, player: Player, starId: DBObjectId, writeToDB: boolean = true) {
        let star = this.starService.getById(game, starId);
        let carriersAtStar = this.carrierService.getCarriersAtStar(game, starId)
            .filter(c => c.ownedByPlayerId!.toString() === player._id.toString());

        if (!star.ownedByPlayerId || star.ownedByPlayerId.toString() !== player._id.toString()) {
            throw new ValidationError('The player does not own this star.');
        }

        if (!carriersAtStar.length) {
            throw new ValidationError('The player does not own any carriers in orbit of this star.');
        }

        // Garrison all ships to the star first.
        let shipsToTransfer = 0;
        
        for (let carrier of carriersAtStar) {
            if (carrier.ships! > 1) {
                shipsToTransfer += (carrier.ships!-1)
                carrier.ships = 1
            }
        }

        star.shipsActual! += shipsToTransfer;
        star.ships = Math.floor(star.shipsActual!);

        if (star.ships > 0) {
            // Now, evenly distribute all of the ships on the star to the carriers.
            let shipsPerCarrier = Math.floor(star.ships / carriersAtStar.length);

            for (let carrier of carriersAtStar) {
                carrier.ships! += shipsPerCarrier;
                star.shipsActual! -= shipsPerCarrier;
                star.ships = Math.floor(star.shipsActual!);
            }
        }

        if (writeToDB) {
            // Generate an array of all requires DB updates.
            let dbWrites: any[] = carriersAtStar.map(c => {
                return {
                    updateOne: {
                        filter: {
                            _id: game._id,
                            'galaxy.carriers._id': c._id
                        },
                        update: {
                            'galaxy.carriers.$.ships': c.ships
                        }
                    }
                };
            });
    
            dbWrites.push({
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.stars._id': star._id
                    },
                    update: {
                        'galaxy.stars.$.shipsActual': star.shipsActual,
                        'galaxy.stars.$.ships': star.ships
                    }
                }
            });
    
            // Update the DB.
            await this.gameRepo.bulkWrite(dbWrites);
        }

        return {
            star: {
                _id: star._id,
                ships: star.ships
            },
            carriers: carriersAtStar.map(c => {
                return {
                    _id: c._id,
                    ships: c.ships
                }
            })
        };
    }

    async transfer(game: Game, player: Player, carrierId: DBObjectId, carrierShips: number, starId: DBObjectId, starShips: number, writeDB: boolean = true) {
        let carrier = this.carrierService.getById(game, carrierId);
        let star = this.starService.getById(game, starId);

        if (!carrier || carrier.ownedByPlayerId!.toString() !== player._id.toString()) {
            throw new ValidationError('The player does not own this carrier.');
        }

        if (!star || !star.ownedByPlayerId || star.ownedByPlayerId.toString() !== player._id.toString()) {
            throw new ValidationError('The player does not own this star.');
        }

        if (!carrier.orbiting) {
            throw new ValidationError('The carrier must be in orbit of a star to transfer ships.');
        }

        if (carrier.orbiting.toString() !== star._id.toString()) {
            throw new ValidationError('The carrier must be in orbit of a the desired star to transfer ships.');
        }

        let totalTransferShips = carrierShips + starShips;
        let totalShips = carrier.ships! + star.ships!;

        if (totalTransferShips != totalShips) {
            throw new ValidationError('The total number of ships in the transfer does not equal to the total number of ships garrisoned');
        }

        if (carrierShips <= 0) {
            throw new ValidationError('The number of carrier ships in the transfer must be greater than 0. Carriers must have at least 1 ship.');
        }

        if (starShips < 0) {
            throw new ValidationError('The number of carrier ships in the transfer must be 0 or greater.');
        }

        if (carrierShips !== parseInt(carrierShips.toString()) || starShips !== parseInt(starShips.toString())) {
            throw new ValidationError('The number of ships in the transfer must be a whole number.');
        }

        carrier.ships = carrierShips;

        let shipsFraction = star.shipsActual! - star.ships!; // Keep hold of the fractional amount of ships so we can add it back later.
        
        star.shipsActual = starShips + shipsFraction;
        star.ships = Math.floor(star.shipsActual);

        // Update the DB.
        if (writeDB) {
            await this.gameRepo.bulkWrite([
                {
                    updateOne: {
                        filter: {
                            _id: game._id,
                            'galaxy.stars._id': star._id
                        },
                        update: {
                            'galaxy.stars.$.shipsActual': star.shipsActual,
                            'galaxy.stars.$.ships': star.ships
                        }
                    }
                },
                {
                    updateOne: {
                        filter: {
                            _id: game._id,
                            'galaxy.carriers._id': carrier._id
                        },
                        update: {
                            'galaxy.carriers.$.ships': carrier.ships
                        }
                    }
                }
            ]);
        }

        return {
            player,
            star,
            carrier
        };
    }

};
