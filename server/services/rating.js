const EloRating = require('elo-rating');

module.exports = class RatingService {

    constructor(userRepo, gameRepo, userService) {
        this.userRepo = userRepo;
        this.gameRepo = gameRepo;
        this.userService = userService;
    }

    async resetAllEloRatings() {
        await this.userRepo.updateMany({
            'achievements.eloRating': { $ne: null }
        }, {
            $set: {
                'achievements.eloRating': null
            }
        });
    }

    async recalculateAllEloRatings() {
        await this.resetAllEloRatings();

        let completed1v1s = await this._listCompleted1v1s();
        let userIds = [];

        for (let game of completed1v1s) {
            for (let player of game.galaxy.players) {
                userIds.push(player.userId);
            }
        }

        userIds = [...new Set(userIds)];

        let users = await this.userService.listUserEloRatingsByIds(userIds);

        for (let game of completed1v1s) {
            let userA = users.find(u => u._id.toString() === game.galaxy.players[0].userId.toString());
            let userB = users.find(u => u._id.toString() === game.galaxy.players[1].userId.toString());

            let userAIsWinner;

            // Note: This factors in whether user accounts still exist for both players.
            if (!userA) {
                userAIsWinner = false;
            } else if (!userB) {
                userAIsWinner = true;
            } else {
                let winningPlayer = game.galaxy.players.find(p => p._id.equals(game.state.winner));

                userAIsWinner = userA._id.toString() === winningPlayer.userId;
            }
    
            this.recalculateEloRating(userA, userB, userAIsWinner);
        }

        let dbWrites = users.map(u => {
            return {
                updateOne: {
                    filter: {
                        _id: u._id
                    },
                    update: {
                        $set: {
                            'achievements.eloRating': u.achievements.eloRating
                        }
                    }
                }
            };
        });

        await this.userRepo.bulkWrite(dbWrites);
    }

    recalculateEloRating(userA, userB, userAIsWinner) {
        // Note that some players may no longer have accounts, in which case consider it a win for the
        // player against the same rank as their own.
        let userARating = userA == null ? userB.achievements.eloRating : userA.achievements.eloRating;
        let userBRating = userB == null ? userA.achievements.eloRating : userB.achievements.eloRating;

        let eloResult = EloRating.calculate(
            userARating == null ? 1200 : userARating, 
            userBRating == null ? 1200 : userBRating, 
            userAIsWinner);

        if (userA) {
            userA.achievements.eloRating = eloResult.playerRating;
        }

        if (userB) {
            userB.achievements.eloRating = eloResult.opponentRating;
        }
    }

    async _listCompleted1v1s() {
        return await this.gameRepo.find({
            'settings.general.type': { $in: ['1v1_rt', '1v1_tb'] },
            'state.endDate': { $ne: null }
        }, {
            'state': 1,
            'galaxy.players._id': 1,
            'galaxy.players.userId': 1
        }, {
            'state.endDate': 1
        });
    }

};
