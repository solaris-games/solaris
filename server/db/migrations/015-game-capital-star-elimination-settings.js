module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.conquest.capitalStarElimination': { $eq: null }
        }, {
            $set: {
                'settings.conquest.capitalStarElimination': 'disabled'
            }
        });
    }
};
