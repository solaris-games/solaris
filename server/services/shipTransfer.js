const ValidationError = require('../errors/validation');

module.exports = class ShipTransferService {

    constructor(carrierService, starService, playerService) {
        this.carrierService = carrierService;
        this.starService = starService;
        this.playerService = playerService;
    }

    async transfer(game, userId, carrierId, carrierShips, starId, starShips) {
        let userPlayer = this.playerService.getByUserId(game, userId);
        let carrier = this.carrierService.getById(game, carrierId);
        let star = this.starService.getById(game, starId);

        if (!carrier.ownedByPlayerId.equals(userPlayer._id)) {
            throw new ValidationError('The player does not own this carrier.');
        }

        if (!star.ownedByPlayerId.equals(userPlayer._id)) {
            throw new ValidationError('The player does not own this star.');
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
        star.garrison = starShips;

        await game.save();
    }

};
