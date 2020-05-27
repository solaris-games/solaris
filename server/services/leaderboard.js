module.exports = class LeaderboardService {

    constructor(userModel) {
        this.userModel = userModel;
    }

    async getLeaderboard() {
        let leaderboard = await this.userModel.find({})
        .sort({
            'achievements.rank': -1,
            'achievements.victories': -1,
            'achievements.renown': -1
        })
        .select({
            username: 1,
            'achievements.victories': 1,
            'achievements.rank': 1,
            'achievements.renown': 1
        })
        .lean()
        .exec();

        for (let i = 0; i < leaderboard.length; i++) {
            leaderboard[i].position = i + 1;
        }

        return leaderboard;
    }

};
