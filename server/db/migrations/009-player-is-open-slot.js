module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        // Completed games
        await games.updateMany({
            $and: [
                { 'state.endDate': { $ne: null } },
                { 'galaxy.players.isOpenSlot': { $eq: null } }
            ]
        }, {
            $set: {
                'galaxy.players.$[].isOpenSlot': false
            }
        });

        // In progress games
        // Afk players - open slot
        await games.updateMany({
            $and: [
                { 'state.endDate': { $eq: null } },
                { 'galaxy.players.isOpenSlot': { $eq: null } }
            ]
        }, {
            $set: {
                'galaxy.players.$[p].isOpenSlot': true
            }
        }, {
            arrayFilters: [
                {
                    'p.defeated': true,
                    'p.afk': true
                }
            ]
        });

        // Not afk players - closed slot
        await games.updateMany({
            $and: [
                { 'state.endDate': { $eq: null } },
                { 'galaxy.players.isOpenSlot': { $eq: null } }
            ]
        }, {
            $set: {
                'galaxy.players.$[p].isOpenSlot': false
            }
        }, {
            arrayFilters: [
                {
                    'p.afk': false
                }
            ]
        });
    }
};
