const ValidationError = require('../errors/validation');

module.exports = class ShipTransferService {

    constructor(gameRepo, carrierService, starService) {
        this.gameRepo = gameRepo;
        this.carrierService = carrierService;
        this.starService = starService;
    }

    async transferAllToStar(game, player, starId) {
        let star = this.starService.getById(game, starId);
        let carriersAtStar = this.carrierService.getCarriersAtStar(game, starId)
            .filter(c => c.ownedByPlayerId.equals(player._id));

        if (!star.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError('The player does not own this star.');
        }

        let shipsToTransfer = 0;
        
        for (let carrier of carriersAtStar) {
            if (carrier.ships > 1) {
                shipsToTransfer += (carrier.ships-1)
                carrier.ships = 1
            }
        }

        star.shipsActual += shipsToTransfer;
        star.ships = Math.floor(star.shipsActual);

        // Generate an array of all requires DB updates.
        let dbWrites = carriersAtStar.map(c => {
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

    async transfer(game, player, carrierId, carrierShips, starId, starShips) {
        let carrier = this.carrierService.getById(game, carrierId);
        let star = this.starService.getById(game, starId);

        if (!carrier.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError('The player does not own this carrier.');
        }

        if (!star.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError('The player does not own this star.');
        }

        if (!carrier.orbiting) {
            throw new ValidationError('The carrier must be in orbit of a star to transfer ships.');
        }

        if (!carrier.orbiting.equals(star._id)) {
            throw new ValidationError('The carrier must be in orbit of a the desired star to transfer ships.');
        }

        let totalTransferShips = carrierShips + starShips;
        let totalShips = carrier.ships + star.ships;

        if (totalTransferShips != totalShips) {
            throw new ValidationError('The total number of ships in the tranfer does not equal to the total number of ships garrisoned');
        }

        if (carrierShips <= 0) {
            throw new ValidationError('The number of carrier ships in the tranfer must be greater than 0. Carriers must have at least 1 ship.');
        }

        if (starShips < 0) {
            throw new ValidationError('The number of carrier ships in the tranfer must be 0 or greater.');
        }

        carrier.ships = carrierShips;

        let shipsFraction = star.shipsActual - star.ships; // Keep hold of the fractional amount of ships so we can add it back later.
        
        star.shipsActual = starShips + shipsFraction;
        star.ships = Math.floor(star.shipsActual);

        // Update the DB.
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

        return {
            player,
            star,
            carrier
        };
    }

};
