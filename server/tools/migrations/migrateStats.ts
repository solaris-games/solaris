import {JobParameters} from "../tool";
import {AwardedBadge, StatsSlice, UserAchievements} from "@solaris-common";
import {User} from "../../services/types/User";
import {DBObjectId} from "../../services/types/DBObjectId";
import {Statistics} from "solaris-common/dist/api/types/common/stats";

type OldUserAchievements<ID> = {
    victories: number;
    victories1v1: number;
    level: number;
    rank: number;
    eloRating: number | null;
    renown: number;
    joined: number;
    completed: number;
    quit: number;
    defeated: number;
    defeated1v1: number;
    afk: number;
    badges: AwardedBadge<ID>[];
    combat: {
        kills: {
            ships: number;
            carriers: number;
            specialists: number;
        },
        losses: {
            ships: number;
            carriers: number;
            specialists: number;
        },
        stars: {
            captured: number;
            lost: number;
        },
        homeStars: {
            captured: number;
            lost: number;
        }
    },
    infrastructure: {
        economy: number;
        industry: number;
        science: number;
        warpGates: number;
        warpGatesDestroyed: number;
        carriers: number;
        specialistsHired: number;
    },
    research: {
        scanning: number;
        hyperspace: number;
        terraforming: number;
        experimentation: number;
        weapons: number;
        banking: number;
        manufacturing: number;
        specialists: number;
    },
    trade: {
        creditsSent: number;
        creditsReceived: number;
        creditsSpecialistsSent: number;
        creditsSpecialistsReceived: number;
        technologySent: number;
        technologyReceived: number;
        giftsSent: number;
        giftsReceived: number;
        renownSent: number;
    },
}

const moveStats = (user: User) => {
    // @ts-ignore
    const oldAchievements = user.achievements as OldUserAchievements<DBObjectId>;

    const stats: Statistics = {
        trade: oldAchievements.trade,
        research: oldAchievements.research,
        combat: oldAchievements.combat,
        infrastructure: oldAchievements.infrastructure,
    };

    const newAchievements: UserAchievements<DBObjectId> = {
        stats,
        victories: oldAchievements.victories,
        victories1v1: oldAchievements.victories1v1,
        level: oldAchievements.level,
        rank: oldAchievements.rank,
        eloRating: oldAchievements.eloRating,
        renown: oldAchievements.renown,
        joined: oldAchievements.joined,
        completed: oldAchievements.completed,
        quit: oldAchievements.quit,
        defeated: oldAchievements.defeated,
        defeated1v1: oldAchievements.defeated1v1,
        afk: oldAchievements.afk,
        badges: oldAchievements.badges,
    };

    return {
        updateOne: {
            filter: {
                _id: user._id,
            },
            update: {
                $set: {
                    'achievements': newAchievements,
                }
            }
        }
    };
};

const createStatsSlice = (user: User): StatsSlice<DBObjectId> => {
    const stats: Statistics = user.achievements.stats;

    return {
        stats,
        userId: user._id,
        processed: false,
        gameId: undefined,
    };
};

export const migrateStats = async (ctx: JobParameters) => {
    const statsSliceRepo = ctx.container.statisticsService.statsSliceRepository;

    const log = ctx.log;

    const userRepository = ctx.container.userService.userRepo;

    let page = 0;
    const pageSize = 10;

    const total = await userRepository.countAll();
    const totalPages = Math.ceil(total / pageSize);

    do {
        const users = await userRepository.find({}, {
            'achievements': 1,
        }, { _id: 1 }, pageSize, page * pageSize);

        const writes = users.map(moveStats);

        await userRepository.bulkWrite(writes);

        log.info(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages)

    log.info("Finished migrating stats in user data");

    do {
        const users = await userRepository.find({}, {
            'achievements': 1,
        }, { _id: 1 }, pageSize, page * pageSize);

        const statsWrites = users.map(createStatsSlice);

        await statsSliceRepo.bulkWrite(statsWrites);

        log.info(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages)

    log.info("Finished migrating stats slices");
};
