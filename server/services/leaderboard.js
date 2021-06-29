module.exports = class LeaderboardService {
    static SORTERS = {
        rank: {
            'achievements.rank': -1,
            'achievements.victories': -1,
            'achievements.renown': -1
        },
        victories: {
            'achievements.victories': -1,
            'achievements.rank': -1,
            'achievements.renown': -1
        },
        renown: {
            'achievements.renown': -1,
            'achievements.rank': -1,
            'achievements.victories': -1
        }
    }

    constructor(userModel, userService, playerService, guildUserService) {
        this.userModel = userModel;
        this.userService = userService;
        this.playerService = playerService;
        this.guildUserService = guildUserService;
    }

    async getLeaderboard(limit, sortingKey) {
        const sorter = LeaderboardService.SORTERS[sortingKey] || LeaderboardService.SORTERS['rank']
        let leaderboard = await this.userModel.find({})
        .limit(limit)
        .sort(sorter)
        .select({
            username: 1,
            guildId: 1,
            'roles.contributor': 1,
            'roles.developer': 1,
            'roles.communityManager': 1,
            'roles.gameMaster': 1,
            'achievements.victories': 1,
            'achievements.rank': 1,
            'achievements.renown': 1,
        })
        .lean({ defaults: true })
        .exec();

        let userIds = leaderboard.map(x => x._id);
        let guildUsers = await this.guildUserService.listUsersWithGuildTags(userIds);

        for (let i = 0; i < leaderboard.length; i++) {
            let user = leaderboard[i];

            user.position = i + 1;

            user.guild = guildUsers.find(x => x._id.equals(user._id)).guild;
        }

        let totalPlayers = await this.userModel.countDocuments();

        return {
            totalPlayers,
            leaderboard
        };
    }

    getLeaderboardRankings(game) {
        let playerStats = game.galaxy.players.map(p => {
            return {
                player: p,
                stats: this.playerService.getStats(game, p)
            }
        });

        function sortPlayers(a, b) {
            // Sort by total stars descending
            if (a.stats.totalStars > b.stats.totalStars) return -1;
            if (a.stats.totalStars < b.stats.totalStars) return 1;

            // Then by total ships descending
            if (a.stats.totalShips > b.stats.totalShips) return -1;
            if (a.stats.totalShips < b.stats.totalShips) return 1;

            // Then by total carriers descending
            if (a.stats.totalCarriers > b.stats.totalCarriers) return -1;
            if (a.stats.totalCarriers < b.stats.totalCarriers) return 1;

            // Then by defeated date descending
            if (a.defeated && b.defeated) {
                if (moment(a.defeatedDate) > moment(b.defeatedDate)) return -1;
                if (moment(a.defeatedDate) < moment(b.defeatedDate)) return 1;
            }

            return 0; // Both are equal
        }

        // Sort the undefeated players first.
        let undefeatedLeaderboard = playerStats
            .filter(x => !x.player.defeated)
            .sort(sortPlayers);

        // Sort the defeated players next.
        let defeatedLeaderboard = playerStats
            .filter(x => x.player.defeated)
            .sort(sortPlayers);

        // Join both sorted arrays together to produce the leaderboard.
        let leaderboard = undefeatedLeaderboard.concat(defeatedLeaderboard);

        return leaderboard;
    }

    async addGameRankings(game, gameUsers, leaderboard) {
        let leaderboardPlayers = leaderboard.map(x => x.player);

        // Remove any afk players from the leaderboard, they will not
        // receive any achievements.
        leaderboardPlayers = leaderboardPlayers.filter(p => !p.afk);

        for (let i = 0; i < leaderboardPlayers.length; i++) {
            let player = leaderboardPlayers[i];

            let user = gameUsers.find(u => u._id.equals(player.userId));

            // Double check user isn't deleted.
            if (!user) {
                continue;
            }

            // Add to rank:
            // (Number of players / 2) - index of leaderboard
            // But 1st place will receive rank equal to the total number of players.
            // So 1st place of 4 players will receive 4 rank
            // 2nd place will receive 1 rank (4 / 2 - 1)
            // 3rd place will receive 0 rank (4 / 2 - 2)
            // 4th place will receive -1 rank (4 / 2 - 3)

            // TODO: Maybe a better ranking system would be to simply award players
            // rank equal to the number of stars they have at the end of the game?
        
            // Official games are either not user created or featured (featured games can be user created)
            let isOfficialGame = game.settings.general.type != 'custom' || game.settings.general.featured;

            if (isOfficialGame) {
                if (i == 0) {
                    user.achievements.victories++; // Increase the winner's victory count
                    user.credits++; // Give the winner a galactic credit.
                    user.achievements.rank += leaderboard.length; // Note: Using leaderboard length as this includes ALL players (including afk)

                    // Break out here if the rank is awarded to the winner only.
                    if (game.settings.general.awardRankTo === 'winner') {
                        break;
                    }
                } else {
                    user.achievements.rank += leaderboard.length / 2 - i;
                    user.achievements.rank = Math.max(user.achievements.rank, 0); // Cannot go less than 0.
                }

                user.achievements.rank = Math.round(user.achievements.rank);    
            }

            // If the player hasn't been defeated then add completed stats.
            if (!player.defeated) {
                user.achievements.completed++;
            }
        }
    }

    getGameWinner(game) {
        if (game.settings.general.mode === 'conquest') {
            let starWinner = this.getStarCountWinner(game);
    
            if (starWinner) {
                return starWinner;
            }
        }

        let lastManStanding = this.getLastManStanding(game);

        if (lastManStanding) {
            return lastManStanding;
        }

        return null;
    }

    getStarCountWinner(game) {
        // There could be more than one player who has reached
        // the number of stars required at the same time.
        // In this case we pick the player who has the most ships.
        // If that's equal, then pick the player who has the most carriers.
        let leaderboard = this.getLeaderboardRankings(game);

        let starWinners = leaderboard
            .filter(p => !p.player.defeated && p.stats.totalStars >= game.state.starsForVictory)
            .map(p => p.player);

        if (starWinners.length) {
            return starWinners[0];
        }

        return null;
    }

    getLastManStanding(game) {
        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated);

        if (undefeatedPlayers.length === 1) {
            return undefeatedPlayers[0];
        }

        // If all players have been defeated somehow then pick the player
        // who is currently in first place.
        let defeatedPlayers = game.galaxy.players.filter(p => p.defeated);

        if (defeatedPlayers.length === game.settings.general.playerLimit) {
            let leaderboard = this.getLeaderboardRankings(game);

            return leaderboard[0].player;
        }

        return null;
    }

};
