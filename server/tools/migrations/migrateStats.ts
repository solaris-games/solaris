import {JobParameters} from "../tool";
import {AwardedBadge} from "@solaris-common";

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

        

        log.info(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages)
};
