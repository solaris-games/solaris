module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'galaxy.players.scheduledActions': { $eq: null }
        }, {
            $set: {
                'galaxy.players.$[].scheduledActions': []
            }
        }
        );
    }
};