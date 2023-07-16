module.exports = {
    async migrate(db) {
        const games = db.collection('games');
        const users = db.collection('users');

        await games.updateMany({
            'settings.specialGalaxy.starCaptureReward': { $eq: null }
        }, {
            $set: {
                'settings.specialGalaxy.starCaptureReward': 'enabled'
            }
        });

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

        await users.updateMany({
            'achievements.badges.special_arcade': { $eq: null }
        }, {
            $set: {
                'achievements.badges.special_arcade': 0
            }
        })
    }
};
