module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.player.allowAbandonStars': { $eq: null }
        }, {
            $set: {
                'settings.player.allowAbandonStars': 'enabled'
            }
        });
    }
};
