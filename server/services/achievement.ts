import { DBObjectId } from "./types/DBObjectId";
import Repository from "./repository";
import { User } from "./types/User";
import GuildService from "./guild";
import UserLevelService from "./userLevel";

export default class AchievementService {
    
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

    async incrementAchievement(userId: DBObjectId, achievement: string, amount: number = 1) {
        let updateQuery = {
            $inc: {}
        };

        updateQuery.$inc[achievement] = amount;

        await this.userRepo.updateOne({
            _id: userId
        }, updateQuery);
    }

    async incrementSpecialistsHired(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.specialistsHired', amount);
    }

    async incrementWarpGatesBuilt(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.warpGates', amount);
    }

    async incrementWarpGatesDestroyed(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.warpGatesDestroyed', amount);
    }

    async incrementCarriersBuilt(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.carriers', amount);
    }

    async incrementInfrastructureBuilt(type: string, userId: DBObjectId, amount: number = 1) {
        switch (type) {
            case 'economy':
                await this.incrementEconomyBuilt(userId, amount);
                break;
            case 'industry':
                await this.incrementIndustryBuilt(userId, amount);
                break;
            case 'science':
                await this.incrementScienceBuilt(userId, amount);
                break;
        }
    }

    async incrementEconomyBuilt(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.economy', amount);
    }

    async incrementIndustryBuilt(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.industry', amount);
    }

    async incrementScienceBuilt(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.science', amount);
    }

    async incrementTradeCreditsSent(userId: DBObjectId, amount: number = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsSent', amount);
    }

    async incrementTradeCreditsReceived(userId: DBObjectId, amount: number = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsReceived', amount);
    }

    async incrementTradeCreditsSpecialistsSent(userId: DBObjectId, amount: number = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsSpecialistsSent', amount);
    }

    async incrementTradeCreditsSpecialistsReceived(userId: DBObjectId, amount: number = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsSpecialistsReceived', amount);
    }

    async incrementTradeTechnologySent(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.trade.technologySent', amount);
    }

    async incrementTradeTechnologyReceived(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.trade.technologyReceived', amount);
    }

    async incrementRenownSent(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.trade.renownSent', amount);
    }

    async incrementRenownReceived(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.renown', amount);
    }

    async incrementDefeated(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.defeated', amount);
    }

    async incrementJoined(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.joined', amount);
    }

    async incrementQuit(userId: DBObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.quit', amount);
    }
};
