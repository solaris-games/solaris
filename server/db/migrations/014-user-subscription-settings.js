module.exports = {
    async migrate(db) {
        const users = db.collection('users');

        await users.updateMany({
            'subscriptions': { $ne: null },
            'subscriptions.settings': { $eq: null }
        }, {
            $set: {
                'subscriptions.settings': {
                    'notifyActiveGamesOnly': false
                }
            }
        });
    }
};
