module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        await games.updateMany({
            'constants.diplomacy.upkeepExpenseMultipliers': { $eq: null }
        }, {
            $set: {
                'constants.diplomacy.upkeepExpenseMultipliers': {
                    none: 0,
                    cheap: 0.02,
                    standard: 0.05,
                    expensive: 0.10
                }
            }
        });
    }
};
