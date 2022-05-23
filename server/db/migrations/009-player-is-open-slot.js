module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        // Completed games
        await games.updateMany({
            'state.endDate': { $ne: null },
            'galaxy.players.isOpenSlot': { $eq: null }
        }, {
            $set: {
                'galaxy.players.$[].isOpenSlot': false
            }
        });

        // Not started/in progress games
        // Ensure that unfilled slots have their slots open.
        await games.updateMany({
            'state.endDate': { $eq: null },
            'settings.general.type': { $ne: 'tutorial' },
            'galaxy.players.isOpenSlot': { $eq: null }
        }, {
            $set: {
                'galaxy.players.$[p].isOpenSlot': true
            }
        }, {
            arrayFilters: [
                {
                    'p.isOpenSlot': { $eq: null },
                    'p.userId': { $eq: null }
                }
            ]
        });

        // In progress games
        // Ensure that AFK players have their slots open.
        await games.updateMany({
            'state.endDate': { $eq: null },
            'settings.general.type': { $ne: 'tutorial' },
            'galaxy.players.isOpenSlot': { $eq: null }
        }, {
            $set: {
                'galaxy.players.$[p].isOpenSlot': true
            }
        }, {
            arrayFilters: [
                {
                    'p.isOpenSlot': { $eq: null },
                    'p.userId': { $ne: null },
                    'p.defeated': true,
                    'p.afk': true
                }
            ]
        });
    }
};
