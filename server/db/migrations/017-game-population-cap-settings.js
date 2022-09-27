module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.player.populationCap': { $eq: null }
        }, {
            $set: {
                'settings.player.populationCap': {
                    enabled: 'disabled',
                    shipsPerStar: 100
                }
            }
        });
    }
};
