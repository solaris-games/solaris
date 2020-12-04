const ValidationError = require('../errors/validation');

module.exports = class ShipTransferService {

    constructor(gameModel, carrierService, starService) {
        this.gameModel = gameModel;
        this.carrierService = carrierService;
        this.starService = starService;
    }

    async transferAllToStar(game, player, starId) {
        let carriersAtStar = this.carrierService.getCarriersAtStar(game, starId)
        let star = this.starService.getById(game, starId)

        if (!star.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError('The player does not own this star.');
        }

        let shipsToTransfer = 0
        for (let i=0; i < carriersAtStar.length; i++) {
          let carrier = carriersAtStar[i]
          if(carrier.ships > 1) {
              shipsToTransfer += (carrier.ships-1)
              carrier.ships = 1
          }
        }

        star.garrisonActual += shipsToTransfer
        star.garrison = Math.floor(star.garrisonActual);

        // Update the DB.
        await this.gameModel.bulkWrite([
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.stars._id': star._id
                    },
                    update: {
                        'galaxy.stars.$.garrisonActual': star.garrisonActual,
                        'galaxy.stars.$.garrison': star.garrison
                    }
                }
            }
        ]);
        for (let i=0; i < carriersAtStar.length; i++) {
          let carrier = carriersAtStar[i]
          await this.gameModel.bulkWrite([
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
            carriersAtStar
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
        let totalShips = carrier.ships + star.garrison;

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

        let garrisonFraction = star.garrisonActual - star.garrison; // Keep hold of the fractional amount of garrison so we can add it back later.
        
        star.garrisonActual = starShips + garrisonFraction;
        star.garrison = Math.floor(star.garrisonActual);

        // Update the DB.
        await this.gameModel.bulkWrite([
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.stars._id': star._id
                    },
                    update: {
                        'galaxy.stars.$.garrisonActual': star.garrisonActual,
                        'galaxy.stars.$.garrison': star.garrison
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
