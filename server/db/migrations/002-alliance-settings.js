module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            $and: [
                { 'settings.player.alliances': { $ne: null } },
                { 'settings.diplomacy': { $eq: null } }
            ]
        }, [{
            $set: {
                'settings.diplomacy': {
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
