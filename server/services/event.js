module.exports = class EventService {

    EVENT_TYPES = {
        GALACTIC_CYCLE_COMPLETE: 'galacticCycleComplete',
        COMBAT_CARRIER: 'combatCarrier',
        COMBAT_STAR: 'combatStar'
    }

    constructor(eventModel) {
        this.eventModel = eventModel;
    }

    async createEvent(game, player, type, data) {
        let event = new this.eventModel({
            gameId: game._id,
            playerId: null,
            tick: game.state.tick,
            type,
            data
        });

        await event.save();
    }

    async createPlayerEvent(game, player, type, data) {
        let event = new this.eventModel({
            gameId: game._id,
            playerId: player._id,
            tick: game.state.tick,
            type,
            data
        });

        await event.save();
    }

    async getPlayerEvents(game, player) {
        return this.eventModel.find({
            gameId: game._id,
            playerId: {
                $in: [
                    player._id,
                    null
                ]
            }
        })
        .sort({
            tick: -1 // Sort by tick descending
        })
        .exec();
    }

    async createGalacticCycleCompleteEvent(game, player, 
        creditsEconomy, creditsBanking, experimentTechnology, experimentAmount) {
        let data = {
            creditsEconomy,
            creditsBanking,
            experimentTechnology,
            experimentAmount
        };

        return await this.createPlayerEvent(game, player, this.EVENT_TYPES.GALACTIC_CYCLE_COMPLETE, data);
    }

    async createCombatStarEvent(game, defender, attacker, defenderStar, attackerCarrier, combatResult) {
        let data = {
            playerIdDefender: defender._id,
            playerIdAttacker: attacker._id,
            defenderStarId: defenderStar._id,
            attackerCarrierId: attackerCarrier._id,
            attackerCarrierName: attackerCarrier.name,
            combatResult
        };

        await this.createPlayerEvent(game, defender, this.EVENT_TYPES.COMBAT_STAR, data);
        await this.createPlayerEvent(game, attacker, this.EVENT_TYPES.COMBAT_STAR, data);
    }

    async createCombatCarrierEvent(game, defender, attacker, defenderStar, defenderCarrier, attackerCarrier, combatResult) {
        let data = {
            playerIdDefender: defender._id,
            playerIdAttacker: attacker._id,
            defenderStarId: defenderStar._id,
            defenderCarrierId: defenderCarrier._id,
            defenderCarrierName: defenderCarrier.name,
            attackerCarrierId: attackerCarrier._id,
            attackerCarrierName: attackerCarrier.name,
            combatResult
        };

        await this.createPlayerEvent(game, defender, this.EVENT_TYPES.COMBAT_CARRIER, data);
        await this.createPlayerEvent(game, attacker, this.EVENT_TYPES.COMBAT_CARRIER, data);
    }

    // TODO: Player joined
    // TODO: Player left
    // TODO: Player defeated
    // TODO: Player afk
    // TODO: Game started
    // TODO: Game ended
    // TODO: Game paused?
    // TODO: Research complete
    // TODO: Warp gate built
    // TODO: Technology received
    // TODO: Technology sent
    // TODO: Credits received
    // TODO: Credits sent
    // TODO: Renown received
    // TODO: Renown sent
    // TODO: Star abandoned?
    // TODO: Star captured? (or part of combat?)
    // TODO: Carrier built
    // TODO: Infrastructure bulk upgraded

};
