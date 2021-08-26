const EloRating = require('elo-rating');

module.exports = class RatingService {

    constructor(userModel, gameModel, userService) {
        this.userModel = userModel;
        this.gameModel = gameModel;
        this.userService = userService;
    }

    async resetAllEloRatings() {
        await this.userModel.updateMany({
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

            if (!userA || !userB) {
                continue;
            }

            let userAIsWinner = userA._id.equals(game.state.winner);

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

        await this.userModel.bulkWrite(dbWrites);
    }

    recalculateEloRating(userA, userB, userAIsWinner) {
        let eloResult = EloRating.calculate(
            userA.achievements.eloRating == null ? 1200 : userA.achievements.eloRating, 
            userB.achievements.eloRating == null ? 1200 : userB.achievements.eloRating, 
            userAIsWinner);

        userA.achievements.eloRating = eloResult.playerRating;
        userB.achievements.eloRating = eloResult.opponentRating;
    }

    async _listCompleted1v1s() {
        return await this.gameModel.find({
            'settings.general.type': { $in: ['1v1_rt', '1v1_tb'] },
            'state.endDate': { $ne: null }
        }, {
            'state': 1,
            'galaxy.players.userId': 1
        })
        .sort({
            'state.endDate': 1
        })
        .lean()
        .exec();
    }

};
