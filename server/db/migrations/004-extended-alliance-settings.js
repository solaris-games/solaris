module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.alliances.allianceOnlyTrading': { $eq: null }
        }, {
            $set: {
                'settings.alliances.allianceOnlyTrading': 'disabled'
            }
        });

        await games.updateMany({
            'settings.alliances.allianceUpkeepCost': { $eq: null }
        }, {
            $set: {
                'settings.alliances.allianceUpkeepCost': 'none'
            }
        });

        await games.find({
            'settings.alliances.maxAlliances': { $eq: null }
        }).forEach(function(game) {
            game.settings.alliances.maxAlliances = game.settings.general.playerLimit - 1;

            db.games.save(game);
        });
    }
};
