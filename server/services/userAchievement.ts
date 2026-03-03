import { ValidationError } from "solaris-common";
import { DBObjectId } from "./types/DBObjectId";
import Repository from "./repository";
import { User } from "./types/User";
import GuildService from "./guild";
import UserLevelService from "./userLevel";

export default class UserAchievementService {
    userRepo: Repository<User>;
    guildService: GuildService;
    userLevelService: UserLevelService;

    constructor(userRepo: Repository<User>, guildService: GuildService, userLevelService: UserLevelService) {
        this.userRepo = userRepo;
        this.guildService = guildService;
        this.userLevelService = userLevelService;
    }

    async getAchievements(id: DBObjectId, requestingUserId?: DBObjectId) {
        const user = await this.userRepo.findById(id, {
            // Remove fields we don't want to send back.
            achievements: 1,
            guildId: 1,
            username: 1,
            isAnonymous: 1,
            'roles.contributor': 1,
            'roles.developer': 1,
            'roles.communityManager': 1,
            'roles.gameMaster': 1
        });

        if (!user) {
            throw new ValidationError('User not found.', 404);
        }

        // If the user is anonymous and the requester is not the user themselves, return 404.
        const isSelf = requestingUserId && requestingUserId.toString() === user._id.toString();

        if (user.isAnonymous && !isSelf) {
            throw new ValidationError('User not found.', 404);
        }

        user.level = this.userLevelService.getByRankPoints(user.achievements.rank);

        // Strip isAnonymous from the response.
        const { isAnonymous, ...userWithoutAnonymous } = user;

        if (userWithoutAnonymous.guildId) {
            return {
                ...userWithoutAnonymous,
                guild: await this.guildService.getInfoById(userWithoutAnonymous.guildId)
            }
        }

        return userWithoutAnonymous;
    }

    async _incrementAchievement(userId: DBObjectId, achievement: string, amount: number = 1) {
        let updateQuery = {
            $inc: {}
        };

        updateQuery.$inc[achievement] = amount;

        await this.userRepo.updateOne({
            _id: userId
        }, updateQuery);
    }

    async incrementDefeated(userId: DBObjectId, amount: number = 1) {
        return await this._incrementAchievement(userId, 'achievements.defeated', amount);
    }

    async incrementJoined(userId: DBObjectId, amount: number = 1) {
        return await this._incrementAchievement(userId, 'achievements.joined', amount);
    }

    async incrementRenown(userId: DBObjectId, amount: number = 1) {
        return await this._incrementAchievement(userId, 'achievements.renown', amount);
    }

    async incrementRenownSent(userId: DBObjectId, amount: number = 1) {
        return await this._incrementAchievement(userId, 'achievements.renownSent', amount);
    }
};
