module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'settings.general.fluxEnabled': { $eq: null }
        }, {
            $set: {
                'settings.general.fluxEnabled': 'disabled'
            }
        });

        await games.updateMany({
            'constants.player': { $eq: null }
        }, {
            $set: {
                'constants.player': {
                    rankRewardMultiplier: 1,
                    bankingCycleRewardMultiplier: 75
                }
            }
        });

        await games.updateMany({
            'constants.specialists': { $eq: null }
        }, {
            $set: {
                'constants.specialists': {
                    monthlyBanAmount: 3
                }
            }
        });

        await games.updateMany({
            'constants.star.captureRewardMultiplier': { $eq: null }
        }, {
            $set: {
                'constants.star.captureRewardMultiplier': 10
            }
        });

        await games.updateMany({
            'constants.research.sciencePointMultiplier': { $eq: null }
        }, {
            $set: {
                'constants.research.sciencePointMultiplier': 1
            }
        });

        await games.updateMany({
            'constants.research.experimentationMultiplier': { $eq: null }
        }, {
            $set: {
                'constants.research.experimentationMultiplier': 1
            }
        });

        await games.updateMany({
            'constants.star.homeStarDefenderBonusMultiplier': { $eq: null }
        }, {
            $set: {
                'constants.star.homeStarDefenderBonusMultiplier': 1
            }
        });
    }
};
