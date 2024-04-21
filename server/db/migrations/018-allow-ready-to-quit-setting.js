module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.general.readyToQuit': { $eq: null },
            'settings.general.type': { $ne: 'tutorial' }
        }, {
            $set: {
                'settings.general.readyToQuit': 'enabled'
            }
        });

        await games.updateMany({
            'settings.general.readyToQuit': { $eq: null },
            'settings.general.type': { $eq: 'tutorial' }
        }, {
            $set: {
                'settings.general.readyToQuit': 'disabled'
            }
        });
    }
};
