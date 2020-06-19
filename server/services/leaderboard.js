module.exports = class LeaderboardService {

    constructor(userModel, userService, playerService) {
        this.userModel = userModel;
        this.userService = userService;
        this.playerService = playerService;
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

    getLeaderboardRankings(game) {
        let playerStats = game.galaxy.players.map(p => {
            return {
                player: p,
                stats: this.playerService.getStats(game, p)
            }
        });

        let leaderboard = playerStats
            .sort((a, b) => b.stats.totalStars - a.stats.totalStars)
            .sort((a, b) => b.stats.totalShips - a.stats.totalShips)
            .sort((a, b) => b.stats.totalCarriers - a.stats.totalCarriers);

        return leaderboard;
    }

    async addGameRankings(leaderboard) {
        let leaderboardPlayers = leaderboard.map(x => x.player);

        for (let i = 0; i < leaderboardPlayers.length; i++) {
            let player = leaderboard[i];

            let user = this.userService.getById(player.userId);

            // Add to rank:
            // (Number of players / 2) - index of leaderboard
            // But 1st place will receive rank equal to the total number of players.
            // So 1st place of 4 players will receive 4 rank
            // 2nd place will receive 1 rank (4 / 2 - 1)
            // 3rd place will receive 0 rank (4 / 2 - 2)
            // 4th place will receive -1 rank (4 / 2 - 3)
            if (i == 0) {
                user.achievements.rank += leaderboard.length;
                user.achievements.victories++; // Increase the winner's victory count
            } else {
                user.achievements.rank += leaderboard.length / 2 - i;
                user.achievements.rank = Math.max(user.achievements.rank, 0); // Cannot go less than 0.
            }

            await user.save();
        }
    }

};
