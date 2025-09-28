import {JobParameters} from "../tool";
import {AwardedBadge, UserAchievements} from "solaris-common";
import {User} from "../../services/types/User";
import {DBObjectId} from "../../services/types/DBObjectId";
import {Statistics} from "solaris-common";

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
        legacyStats: { ... stats },
        victories: oldAchievements.victories,
        victories1v1: oldAchievements.victories1v1,
        level: oldAchievements.level,
        rank: oldAchievements.rank,
        eloRating: oldAchievements.eloRating,
        renown: oldAchievements.renown,
        renownSent: oldAchievements.trade.renownSent,
        joined: oldAchievements.joined,
        completed: oldAchievements.completed,
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

export const migrateStats = async (ctx: JobParameters) => {
    const log = ctx.log;

    const userRepository = ctx.container.userService.userRepo;

    let page = 0;
    const pageSize = 10;

    const total = await userRepository.countAll();
    const totalPages = Math.ceil(total / pageSize);

    do {
        const users = await userRepository.find({}, {
            '_id': 1,
            'achievements': 1,
        }, { _id: 1 }, pageSize, page * pageSize);

        const writes = users.map(moveStats);

        await userRepository.bulkWrite(writes);

        log.info(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages)

    log.info("Finished migrating user achievements");
};
