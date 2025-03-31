import {JobParameters} from "../tool";
import {AwardedBadge, User} from "../../services/types/User";
import { Logger } from "pino";

interface LegacyBadges {
    ally: number;
    enemy: number;
    diplomat: number;
    strategist: number;
    roleplay: number;
    dauntless: number;
    sleepless: number;
    victor32: number;
    special_dark: number;
    special_fog: number;
    special_ultraDark: number;
    special_orbital: number;
    special_battleRoyale: number;
    special_homeStar: number;
    special_homeStarElimination: number;
    special_anonymous: number;
    special_kingOfTheHill: number;
    special_tinyGalaxy: number;
    special_freeForAll: number;
    special_arcade: number;
}

const PLAYER_AWARDED_BADGES_KEYS = [
    'ally',
    'enemy',
    'diplomat',
    'strategist',
    'roleplay',
    'dauntless',
    'sleepless',
];

const mapBadges = (badges: LegacyBadges): AwardedBadge[] => {
    const newBadges: AwardedBadge[] = [];

    for (const playerAwardedKey of PLAYER_AWARDED_BADGES_KEYS) {
        const val = badges[playerAwardedKey];

        for (let i = 0; i < val; i++) {
            newBadges.push({
                badge: playerAwardedKey,
                awardedBy: null,
                awardedByName: null,
                awardedInGame: null,
                awardedInGameName: null,
                playerAwarded: true,
                time: null,
            });
        }
    }

    return newBadges;
}

const migrateBadgesForUser = (log: Logger, user: User) => {
    const badgesO = user.achievements.badges;

    if (typeof badgesO !== 'object') {
        log.error(`User ${user._id} has invalid badges: ${badgesO}. Migration already applied?`);
        return null;
    }

    const badges = badgesO as unknown as LegacyBadges; // this is fine because the model has changed

    const newBadges: AwardedBadge[] = mapBadges(badges);

    return {
        updateOne: {
            filter: { _id: user._id },
            update: {
                $set: {
                    'achievements.badges': newBadges,
                }
            }
        }
    }
}

// We only migrate user-awarded badges, the game-awarded badges will be handled in recalculateRankings.
export const migrateBadges = async (ctx: JobParameters) => {
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

        const writes = users.map((user) => migrateBadgesForUser(log, user)).filter(Boolean);

        console.log(JSON.stringify(writes));

        await userRepository.bulkWrite(writes);

        log.info(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages)
}