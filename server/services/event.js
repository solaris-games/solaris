module.exports = class EventService {

    constructor(eventModel) {
        this.eventModel = eventModel;
    }

    async create(game, type, data) {
        let event = new this.eventModel({
            gameId: game._id,
            tick: game.state.tick,
            type,
            data
        });

        await event.save();
    }


};
