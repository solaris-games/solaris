module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.diplomacy.tradeRestricted': { $eq: null }
        }, {
            $set: {
                'settings.diplomacy.tradeRestricted': 'disabled'
            }
        });

        await games.updateMany({
            'settings.diplomacy.upkeepCost': { $eq: null }
        }, {
            $set: {
                'settings.diplomacy.upkeepCost': 'none'
            }
        });

        await games.updateMany({
                'settings.diplomacy.maxAlliances': { $eq: null }
        }, [{
            $set: {
                'settings.diplomacy.maxAlliances': {
                    $sum: [
                        '$settings.general.playerLimit',
                        -1
                    ]
                }
            }
        }]);
    }
};
