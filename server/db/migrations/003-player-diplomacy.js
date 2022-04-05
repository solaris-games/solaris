module.exports = {
    async migrate(db) {
        const games = db.collection('games');

        // Clear out any old games.
        await games.updateMany({
            $and: [
                { 'state.endDate': { $ne: null } },
                { 'galaxy.players.diplomacy.allies': { $ne: null } },
                { 'galaxy.players.diplomacy.playerId': { $eq: null } }
            ]
        }, {
            $set: {
                'galaxy.players.$[].diplomacy': []
            }
        });

        // In progress games:
        let dbWrites = [];

        await games.find({
            $and: [
                { 'state.endDate': { $eq: null } },
                { 'galaxy.players.diplomacy.allies': { $ne: null } },
                { 'galaxy.players.diplomacy.playerId': { $eq: null } }
            ]
        }).forEach(async game => {
            let players = game.galaxy.players.filter(p => p.diplomacy.allies);
            let diplo;

            for (let player of players) {
                diplo = player.diplomacy.allies.map(a => {
                    return {
                        playerId: a,
                        status: 'allies'
                    }
                });

                // For in progress games, default all other players to enemies.
                if (game.state.startDate != null && game.state.endDate == null) {
                    for (let otherPlayer of game.galaxy.players) {
                        if (otherPlayer._id.toString() === player._id.toString()) {
                            continue;
                        }
        
                        if (diplo.find(p => {
                            return p.playerId.toString() === otherPlayer._id.toString();
                        })) {
                            continue;
                        }
        
                        diplo.push({
                            playerId: otherPlayer._id,
                            status: 'enemies'
                        });
                    }
                }

                dbWrites.push({
                    updateOne: {
                        filter: {
                            _id: game._id,
                            'galaxy.players._id': player._id
                        },
                        update: {
                            $set: {
                                'galaxy.players.$.diplomacy': diplo
                            }
                        }
                    }
                });
            }
        });

        if (dbWrites.length) {
            await games.bulkWrite(dbWrites);
        }
    }
};
