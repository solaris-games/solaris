module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.general.type': 'flux_rt'
        }, {
            $set: {
                'settings.general.type': 'standard_rt'
            }
        });

        await games.updateMany({
            'settings.general.type': { 
                $in: [
                    'standard_rt',
                    'standard_tb',
                    '32_player_rt',
                    'special_dark',
                    'special_fog',
                    'special_ultraDark',
                    'special_orbital',
                    'special_battleRoyale',
                    'special_homeStar',
                    'special_homeStarElimination',
                    'special_anonymous',
                    'special_kingOfTheHill',
                    'special_tinyGalaxy',
                    'special_freeForAll',
                    'special_arcade'
                ]
            },
            'state.startDate': { $eq: null },
            'settings.general.fluxId': { $eq: null },
            'settings.general.fluxEnabled': 'disabled'
        }, {
            $set: {
                'settings.general.fluxEnabled': 'enabled',
                'settings.general.fluxId': 5
            }
        })
    }
};
