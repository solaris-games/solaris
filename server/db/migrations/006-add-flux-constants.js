module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'constants.player': { $eq: null }
        }, {
            $set: {
                'constants.player': {
                    bankingCycleRewardMultiplier: 75
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
            'constants.star.researchPointScienceMultiplier': { $eq: null }
        }, {
            $set: {
                'constants.star.researchPointScienceMultiplier': 1
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
