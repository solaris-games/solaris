import { DBObjectId } from "./types/DBObjectId";
import Repository from "./repository";
import { User } from "./types/User";
import GuildService from "./guild";
import UserLevelService from "./userLevel";
import {nullObject} from "./utils";

export default class UserAchievementService {
    userRepo: Repository<User>;
    guildService: GuildService;
    userLevelService: UserLevelService;

    constructor(userRepo: Repository<User>, guildService: GuildService, userLevelService: UserLevelService) {
        this.userRepo = userRepo;
        this.guildService = guildService;
        this.userLevelService = userLevelService;
    }

    async getAchievements(id: DBObjectId) {
        const user = await this.userRepo.findById(id, {
            // Remove fields we don't want to send back.
            achievements: 1,
            guildId: 1,
            username: 1,
            'roles.contributor': 1,
            'roles.developer': 1,
            'roles.communityManager': 1,
            'roles.gameMaster': 1
        });

        if (user) {
            user.level = this.userLevelService.getByRankPoints(user.achievements.rank);
        }

        if (user && user.guildId) {
            return {
                ...user,
                guild: await this.guildService.getInfoById(user.guildId)
            }
        }

        return user;
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

    async incrementQuit(userId: DBObjectId, amount: number = 1) {
        return await this._incrementAchievement(userId, 'achievements.quit', amount);
    }

    async incrementRenown(userId: DBObjectId, amount: number = 1) {
        return await this._incrementAchievement(userId, 'achievements.renown', amount);
    }
};
