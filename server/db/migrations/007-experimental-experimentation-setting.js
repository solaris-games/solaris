module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.technology.experimentationReward': { $eq: null }
        }, {
            $set: {
                'settings.technology.experimentationReward': 'standard'
            }
        });
    }
};
