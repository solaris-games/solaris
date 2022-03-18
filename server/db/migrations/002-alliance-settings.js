module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            $and: [
                { 'settings.player.alliances': { $ne: null } },
                { 'settings.alliances': { $eq: null } }
            ]
        }, [{
            $set: {
                'settings.alliances': {
                    enabled: '$settings.player.alliances',
                    globalEvents: 'disabled'
                }
            }
        }]);

        await games.updateMany({
            'settings.player.alliances': { $ne: null }
        }, {
            $unset: {
                'settings.player.alliances': undefined
            }
        });
    }
};
