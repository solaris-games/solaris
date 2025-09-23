import {LeaderboardUser} from "./types/Leaderboard";
import Repository from "./repository";
import {User} from "./types/User";
import UserGuildService from "./guildUser";

export default class UserLeaderboardService {
    static GLOBALSORTERS = {
        rank: {
            fullKey: 'achievements.rank',
            sort: {
                'achievements.rank': -1,
                'achievements.victories': -1,
                'achievements.renown': -1
            },
            select: {
                username: 1,
                guildId: 1,
                'roles.contributor': 1,
                'roles.developer': 1,
                'roles.communityManager': 1,
                'roles.gameMaster': 1,
                'achievements.level': 1,
                'achievements.rank': 1,
                'achievements.victories': 1,
                'achievements.renown': 1,
                'achievements.eloRating': 1
            }
        },
        victories: {
            fullKey: 'achievements.victories',
            sort: {
                'achievements.victories': -1,
                'achievements.rank': -1,
                'achievements.renown': -1
            },
            select: {
                username: 1,
                guildId: 1,
                'roles.contributor': 1,
                'roles.developer': 1,
                'roles.communityManager': 1,
                'roles.gameMaster': 1,
                'achievements.level': 1,
                'achievements.rank': 1,
                'achievements.victories': 1,
                'achievements.renown': 1,
                'achievements.eloRating': 1
            }
        },
        renown: {
            fullKey: 'achievements.renown',
            sort: {
                'achievements.renown': -1,
                'achievements.rank': -1,
                'achievements.victories': -1
            },
            select: {
                username: 1,
                guildId: 1,
                'roles.contributor': 1,
                'roles.developer': 1,
                'roles.communityManager': 1,
                'roles.gameMaster': 1,
                'achievements.level': 1,
                'achievements.rank': 1,
                'achievements.victories': 1,
                'achievements.renown': 1,
                'achievements.eloRating': 1
            }
        },
        joined: {
            fullKey: 'achievements.joined',
            sort: {
                'achievements.joined': -1
            },
            select: {
                username: 1,
                'achievements.joined': 1
            }
        },
        completed: {
            fullKey: 'achievements.completed',
            sort: {
                'achievements.completed': -1
            },
            select: {
                username: 1,
                'achievements.completed': 1
            }
        },
        quit: {
            fullKey: 'achievements.quit',
            sort: {
                'achievements.quit': -1
            },
            select: {
                username: 1,
                'achievements.quit': 1
            }
        },
        defeated: {
            fullKey: 'achievements.defeated',
            sort: {
                'achievements.defeated': -1
            },
            select: {
                username: 1,
                'achievements.defeated': 1
            }
        },
        afk: {
            fullKey: 'achievements.afk',
            sort: {
                'achievements.afk': -1
            },
            select: {
                username: 1,
                'achievements.afk': 1
            }
        },
        "ships-killed": {
            fullKey: 'achievements.combat.kills.ships',
            sort: {
                'achievements.combat.kills.ships': -1
            },
            select: {
                username: 1,
                'achievements.combat.kills.ships': 1
            }
        },
        "carriers-killed": {
            fullKey: 'achievements.combat.kills.carriers',
            sort: {
                'achievements.combat.kills.carriers': -1
            },
            select: {
                username: 1,
                'achievements.combat.kills.carriers': 1
            }
        },
        "specialists-killed": {
            fullKey: 'achievements.combat.kills.specialists',
            sort: {
                'achievements.combat.kills.specialists': -1
            },
            select: {
                username: 1,
                'achievements.combat.kills.specialists': 1
            }
        },
        "ships-lost": {
            fullKey: 'achievements.combat.losses.ships',
            sort: {
                'achievements.combat.losses.ships': -1
            },
            select: {
                username: 1,
                'achievements.combat.losses.ships': 1
            }
        },
        "carriers-lost": {
            fullKey: 'achievements.combat.losses.carriers',
            sort: {
                'achievements.combat.losses.carriers': -1
            },
            select: {
                username: 1,
                'achievements.combat.losses.carriers': 1
            }
        },
        "specialists-lost": {
            fullKey: 'achievements.combat.losses.specialists',
            sort: {
                'achievements.combat.losses.specialists': -1
            },
            select: {
                username: 1,
                'achievements.combat.losses.specialists': 1
            }
        },
        "stars-captured": {
            fullKey: 'achievements.combat.stars.captured',
            sort: {
                'achievements.combat.stars.captured': -1
            },
            select: {
                username: 1,
                'achievements.combat.stars.captured': 1
            }
        },
        "stars-lost": {
            fullKey: 'achievements.combat.stars.lost',
            sort: {
                'achievements.combat.stars.lost': -1
            },
            select: {
                username: 1,
                'achievements.combat.stars.lost': 1
            }
        },
        "home-stars-captured": {
            fullKey: 'achievements.combat.homeStars.captured',
            sort: {
                'achievements.combat.homeStars.captured': -1
            },
            select: {
                username: 1,
                'achievements.combat.homeStars.captured': 1
            }
        },
        "home-stars-lost": {
            fullKey: 'achievements.combat.homeStars.lost',
            sort: {
                'achievements.combat.homeStars.lost': -1
            },
            select: {
                username: 1,
                'achievements.combat.homeStars.lost': 1
            }
        },
        "economy": {
            fullKey: 'achievements.infrastructure.economy',
            sort: {
                'achievements.infrastructure.economy': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.economy': 1
            }
        },
        "industry": {
            fullKey: 'achievements.infrastructure.industry',
            sort: {
                'achievements.infrastructure.industry': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.industry': 1
            }
        },
        "science": {
            fullKey: 'achievements.infrastructure.science',
            sort: {
                'achievements.infrastructure.science': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.science': 1
            }
        },
        "warpgates-built": {
            fullKey: 'achievements.infrastructure.warpGates',
            sort: {
                'achievements.infrastructure.warpGates': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.warpGates': 1
            }
        },
        "warpgates-destroyed": {
            fullKey: 'achievements.infrastructure.warpGatesDestroyed',
            sort: {
                'achievements.infrastructure.warpGatesDestroyed': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.warpGatesDestroyed': 1
            }
        },
        "carriers-built": {
            fullKey: 'achievements.infrastructure.carriers',
            sort: {
                'achievements.infrastructure.carriers': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.carriers': 1
            }
        },
        "specialists-hired": {
            fullKey: 'achievements.infrastructure.specialistsHired',
            sort: {
                'achievements.infrastructure.specialistsHired': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.specialistsHired': 1
            }
        },
        "scanning": {
            fullKey: 'achievements.research.scanning',
            sort: {
                'achievements.research.scanning': -1
            },
            select: {
                username: 1,
                'achievements.research.scanning': 1
            }
        },
        "hyperspace": {
            fullKey: 'achievements.research.hyperspace',
            sort: {
                'achievements.research.hyperspace': -1
            },
            select: {
                username: 1,
                'achievements.research.hyperspace': 1
            }
        },
        "terraforming": {
            fullKey: 'achievements.research.terraforming',
            sort: {
                'achievements.research.terraforming': -1
            },
            select: {
                username: 1,
                'achievements.research.terraforming': 1
            }
        },
        "experimentation": {
            fullKey: 'achievements.research.experimentation',
            sort: {
                'achievements.research.experimentation': -1
            },
            select: {
                username: 1,
                'achievements.research.experimentation': 1
            }
        },
        "weapons": {
            fullKey: 'achievements.research.weapons',
            sort: {
                'achievements.research.weapons': -1
            },
            select: {
                username: 1,
                'achievements.research.weapons': 1
            }
        },
        "banking": {
            fullKey: 'achievements.research.banking',
            sort: {
                'achievements.research.banking': -1
            },
            select: {
                username: 1,
                'achievements.research.banking': 1
            }
        },
        "manufacturing": {
            fullKey: 'achievements.research.manufacturing',
            sort: {
                'achievements.research.manufacturing': -1
            },
            select: {
                username: 1,
                'achievements.research.manufacturing': 1
            }
        },
        "specialists": {
            fullKey: 'achievements.research.specialists',
            sort: {
                'achievements.research.specialists': -1
            },
            select: {
                username: 1,
                'achievements.research.specialists': 1
            }
        },
        "credits-sent": {
            fullKey: 'achievements.trade.creditsSent',
            sort: {
                'achievements.trade.creditsSent': -1
            },
            select: {
                username: 1,
                'achievements.trade.creditsSent': 1
            }
        },
        "credits-received": {
            fullKey: 'achievements.trade.creditsReceived',
            sort: {
                'achievements.trade.creditsReceived': -1
            },
            select: {
                username: 1,
                'achievements.trade.creditsReceived': 1
            }
        },
        "technologies-sent": {
            fullKey: 'achievements.trade.technologySent',
            sort: {
                'achievements.trade.technologySent': -1
            },
            select: {
                username: 1,
                'achievements.trade.technologySent': 1
            }
        },
        "technologies-received": {
            fullKey: 'achievements.trade.technologyReceived',
            sort: {
                'achievements.trade.technologyReceived': -1
            },
            select: {
                username: 1,
                'achievements.trade.technologyReceived': 1
            }
        },
        "ships-gifted": {
            fullKey: 'achievements.trade.giftsSent',
            sort: {
                'achievements.trade.giftsSent': -1
            },
            select: {
                username: 1,
                'achievements.trade.giftsSent': 1
            }
        },
        "ships-received": {
            fullKey: 'achievements.trade.giftsReceived',
            sort: {
                'achievements.trade.giftsReceived': -1
            },
            select: {
                username: 1,
                'achievements.trade.giftsReceived': 1
            }
        },
        "renown-sent": {
            fullKey: 'achievements.trade.renownSent',
            sort: {
                'achievements.trade.renownSent': -1
            },
            select: {
                username: 1,
                'achievements.trade.renownSent': 1
            }
        },
        "elo-rating": {
            fullKey: 'achievements.eloRating',
            query: {
                'achievements.eloRating': { $ne: null }
            },
            sort: {
                'achievements.eloRating': -1,
                'achievements.rank': -1,
                'achievements.victories1v1': -1,
                'achievements.renown': -1
            },
            select: {
                username: 1,
                guildId: 1,
                'roles.contributor': 1,
                'roles.developer': 1,
                'roles.communityManager': 1,
                'roles.gameMaster': 1,
                'achievements.level': 1,
                'achievements.rank': 1,
                'achievements.victories': 1,
                'achievements.victories1v1': 1,
                'achievements.defeated1v1': 1,
                'achievements.renown': 1,
                'achievements.eloRating': 1
            }
        }
    }

    userRepo: Repository<User>;
    guildUserService: UserGuildService;

    constructor(userRepo: Repository<User>, guildUserService: UserGuildService) {
        this.userRepo = userRepo;
        this.guildUserService = guildUserService;
    }


    async getUserLeaderboard(limit: number | null, sortingKey: string, skip: number = 0) {
        const sorter = UserLeaderboardService.GLOBALSORTERS[sortingKey] || UserLeaderboardService.GLOBALSORTERS['rank'];

        const leaderboard = await this.userRepo
            .find(
                sorter.query || {},
                sorter.select,
                sorter.sort,
                limit,
                skip
            );

        const userIds = leaderboard.map(x => x._id);
        const guildUsers = await this.guildUserService.listUsersWithGuildTags(userIds);

        const guildUserPositions: LeaderboardUser[] = [];

        for (let i = 0; i < leaderboard.length; i++) {
            const user = leaderboard[i];

            const position = i + 1;
            const guild = guildUsers.find(x => x._id.toString() === user._id.toString())?.guild || null;

            guildUserPositions.push({
                ...user,
                position,
                guild
            });
        }

        const totalPlayers = await this.userRepo.countAll();

        return {
            totalPlayers,
            leaderboard: guildUserPositions,
            sorter
        };
    }

}