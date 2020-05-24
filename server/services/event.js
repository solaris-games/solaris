module.exports = class EventService {

    EVENT_TYPES = {
        GALACTIC_CYCLE_COMPLETE: 'galacticCycleComplete',
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

};
