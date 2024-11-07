import config from '../config';
import mongooseLoader from '.';
import containerLoader from '../services';
import {DependencyContainer} from '../services/types/DependencyContainer';
import {User} from '../services/types/User';
import {GameWinnerKind} from "../services/leaderboard";
import {logger} from "../utils/logging";

let mongo,
    container: DependencyContainer;

const log = logger("Recalculate Rankings");

function binarySearchUsers(users: User[], id: string) {
    let start = 0;
    let end = users.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);
        let user = users[middle];

        if (user._id.toString() === id.toString()) {
            // found the id
            return user;
        } else if (user._id.toString() < id.toString()) {
            // continue searching to the right
            start = middle + 1;
        } else {
            // search searching to the left
            end = middle - 1;
        }
    }

    // id wasn't found
    // Return the old way
    return users.find(s => s._id.toString() === id.toString())!;
}

async function startup() {
    mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1
    });

    container = containerLoader(config);
    
    log.info('Recalculating all player ranks...');

    log.info(`Resetting users...`);
    await container.userService.userRepo.updateMany({}, {
        $set: {
            'achievements.level': 1,
            'achievements.rank': 0,
            'achievements.eloRating': null,
            'achievements.victories': 0,
            'achievements.victories1v1': 0,
            'achievements.completed': 0,
            'achievements.quit': 0,
            'achievements.afk': 0,
            'achievements.defeated': 0,
            'achievements.defeated1v1': 0,
            'achievements.joined': 0,
            'achievements.badges.victor32': 0,
            'achievements.badges.special_dark': 0,
            'achievements.badges.special_fog': 0,
            'achievements.badges.special_ultraDark': 0,
            'achievements.badges.special_orbital': 0,
            'achievements.badges.special_battleRoyale': 0,
            'achievements.badges.special_homeStar': 0,
            'achievements.badges.special_homeStarElimination': 0,
            'achievements.badges.special_anonymous': 0,
            'achievements.badges.special_kingOfTheHill': 0,
            'achievements.badges.special_tinyGalaxy': 0,
            'achievements.badges.special_freeForAll': 0,
            'achievements.badges.special_arcade': 0,
        }
    });
    log.info(`Done.`);

    let users = await container.userService.userRepo.find({}, {
        _id: 1,
        achievements: 1
    },
    { _id: 1 });

    log.info(`Total users: ${users.length}`);

    let dbQuery = {
        'state.endDate': { $ne: null },
        'settings.general.type': { $ne: 'tutorial' }
    };

    let total = (await container.gameService.gameRepo.count(dbQuery));

    log.info(`Recalculating rank for ${total} games...`);
    
    let page = 0;
    let pageSize = 10;
    let totalPages = Math.ceil(total / pageSize);

    const incAchievement = (userId: string, key: string) => {
        let u = binarySearchUsers(users, userId);

        if (u) {
            u.achievements[key]++;
        }
    };

    const eventRepo = container.eventService.eventRepo;

    do {
        let games = await container.gameService.gameRepo.find(dbQuery, {},
        { 'state.endDate': 1 },
        pageSize,
        pageSize * page);

        for (let game of games) {
            // All players
            let playerUserIds: string[] = game.galaxy.players.filter(p => p.userId).map(p => p.userId!.toString());
            // Quitters
            let quitterUserIds: string[] = game.quitters.filter(q => q != null).map(q => q.toString());
            // Afkers and in game afk players
            let afkerUserIds: string[] = [...new Set(game.afkers.filter(a => a != null).map(a => a.toString()).concat(game.galaxy.players.filter(p => p.userId && p.afk).map(p => p.userId!.toString())))] as string[];
            // In game defeated players (not afk)
            let defeatedUserIds: string[] = game.galaxy.players.filter(p => p.userId && p.defeated && !p.afk).map(p => p.userId!.toString());
            // In game completed players (not defeated or afk)
            let completedUserIds: string[] = game.galaxy.players.filter(p => p.userId && !p.defeated && !p.afk).map(p => p.userId!.toString());
            // All players + quitters + afkers
            let joinerUserIds: string[] = [...new Set(playerUserIds.concat(quitterUserIds).concat(afkerUserIds))];

            joinerUserIds.forEach(j => incAchievement(j, 'joined'));
            quitterUserIds.forEach(q => incAchievement(q, 'quit'));
            afkerUserIds.forEach(a => incAchievement(a, 'afk'));
            completedUserIds.forEach(c => incAchievement(c, 'completed'));
            defeatedUserIds.forEach(d => incAchievement(d, 'defeated'));

            // Recalculate the final leaderboard state.
            let leaderboard = container.leaderboardService.getGameLeaderboard(game).leaderboard;

            game.state.leaderboard = leaderboard.map(l => l.player._id);

            if (container.gameTypeService.isTeamConquestGame(game)) {
                let teamLeaderboard = container.leaderboardService.getTeamLeaderboard(game)!;

                game.state.teamLeaderboard = teamLeaderboard.leaderboard.map(l => l.team._id);

                const winningTeam = container.leaderboardService.getGameWinnerTeam(game, teamLeaderboard.leaderboard);
                if (winningTeam?.kind === GameWinnerKind.Team) {
                    game.state.winningTeam = winningTeam.team._id;
                } else {
                    throw new Error('Invalid team game winner');
                }
            } else {
                const winner = container.leaderboardService.getGameWinner(game, leaderboard);
                if (winner?.kind === GameWinnerKind.Player) {
                    game.state.winner = winner.player._id;
                }
            }

            // Recalculate rank and victories
            const rankingResult = container.gameTickService._awardEndGameRank(game, users, false);

            const gameEndEvent = await eventRepo.findOne({ gameId: game._id, type: container.eventService.EVENT_TYPES.GAME_ENDED });

            if (gameEndEvent) {
                await eventRepo.updateOne({ _id: gameEndEvent!._id }, {
                    $set: {
                        data: rankingResult
                    }
                });
            }
        }

        let leaderboardWrites = games.map(game => {
            return {
                updateOne: {
                    filter: {
                        _id: game._id
                    },
                    update: {
                        'state.leaderboard': game.state.leaderboard,
                        'state.teamLeaderboard': game.state.teamLeaderboard,
                        'state.winner': game.state.winner,
                        'state.winningTeam': game.state.winningTeam,
                    }
                }
            }
        });

        await container.gameService.gameRepo.bulkWrite(leaderboardWrites);

        log.info(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages);

    log.info(`Done.`);

    let dbWrites = users.map(user => {
        return {
            updateOne: {
                filter: {
                    _id: user._id
                },
                update: {
                    'achievements.level': user.achievements.level,
                    'achievements.rank': user.achievements.rank,
                    'achievements.eloRating': user.achievements.eloRating,
                    'achievements.victories': user.achievements.victories,
                    'achievements.victories1v1': user.achievements.victories1v1,
                    'achievements.completed': user.achievements.completed,
                    'achievements.quit': user.achievements.quit,
                    'achievements.afk': user.achievements.afk,
                    'achievements.defeated': user.achievements.defeated,
                    'achievements.defeated1v1': user.achievements.defeated1v1,
                    'achievements.joined': user.achievements.joined,
                    'achievements.badges.victor32': user.achievements.badges.victor32,
                    'achievements.badges.special_dark': user.achievements.badges.special_dark,
                    'achievements.badges.special_fog': user.achievements.badges.special_fog,
                    'achievements.badges.special_ultraDark': user.achievements.badges.special_ultraDark,
                    'achievements.badges.special_orbital': user.achievements.badges.special_orbital,
                    'achievements.badges.special_battleRoyale': user.achievements.badges.special_battleRoyale,
                    'achievements.badges.special_homeStar': user.achievements.badges.special_homeStar,
                    'achievements.badges.special_homeStarElimination': user.achievements.badges.special_homeStarElimination,
                    'achievements.badges.special_anonymous': user.achievements.badges.special_anonymous,
                    'achievements.badges.special_kingOfTheHill': user.achievements.badges.special_kingOfTheHill,
                    'achievements.badges.special_tinyGalaxy': user.achievements.badges.special_tinyGalaxy,
                    'achievements.badges.special_freeForAll': user.achievements.badges.special_freeForAll,
                    'achievements.badges.special_arcade': user.achievements.badges.special_arcade,
                }
            }
        }
    });

    log.info(`Updating users...`);
    await container.userService.userRepo.bulkWrite(dbWrites);
    log.info(`Users updated.`);
}

process.on('SIGINT', async () => {
    await shutdown();
});

async function shutdown() {
    log.info('Shutting down...');

    await mongo.disconnect();

    log.info('Shutdown complete.');
    
    process.exit();
}

startup().then(async () => {
    log.info('Done.');

    await shutdown();
}).catch(async err => {
    log.error(err);

    await shutdown();
});

export {};
