module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        // Completed games
        await games.updateMany({
            'galaxy.players.isOpenSlot': { $eq: null }
        }, {
            $set: {
                'galaxy.players.$[].isOpenSlot': false
            }
        });

        // In progress games
        // Ensure that AFK players have their slots open.
        await games.updateMany({
            'state.endDate': { $eq: null }
        }, {
            $set: {
                'galaxy.players.$[p].isOpenSlot': true
            }
        }, {
            arrayFilters: [
                {
                    'p.isOpenSlot': false,
                    'p.defeated': true,
                    'p.afk': true
                }
            ]
        });
    }
};
