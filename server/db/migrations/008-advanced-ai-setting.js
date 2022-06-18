module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.general.advancedAI': { $eq: null }
        }, {
            $set: {
                'settings.general.advancedAI': 'disabled'
            }
        });
    }
};
