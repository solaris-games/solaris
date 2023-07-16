module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'spectators': { $eq: null }
        }, {
            $set: {
                'spectators': []
            }
        });
    }
};
