module.exports = {
    async migrate(db) {
        const users = db.collection('users');

        await users.updateMany({
            'oauth': { $eq: null }
        }, {
            $set: {
                'oauth': {
                    'discord': null
                }
            }
        });

        await users.updateMany({
            'subscriptions': { $eq: null }
        }, {
            $set: {
                'subscriptions': {
                    'discord': {
                        'gameStarted': true,
                        'gameEnded': true,
                        'playerGalacticCycleComplete': true,
                        'playerCombatStar': true,
                        'playerCombatCarrier': true,
                        'playerResearchComplete': true,
                        'playerTechnologyReceived': true,
                        'playerCreditsReceived': true,
                        'playerCreditsSpecialistsReceived': true,
                        'playerRenownReceived': true
                    }
                }
            }
        });
    }
};
