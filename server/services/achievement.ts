import { ObjectId } from "mongoose";
import DatabaseRepository from "../models/DatabaseRepository";
import GuildService from "./guild";

export default class AchievementService {
    
    userRepo: DatabaseRepository;
    guildService: GuildService;

    constructor(userRepo: DatabaseRepository, guildService: GuildService) {
        this.userRepo = userRepo;
        this.guildService = guildService;
    }

    async getAchievements(id: ObjectId) {
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

        if (user.guildId) {
            user.guild = await this.guildService.getInfoById(user.guildId);
        }

        return user;
    }

    async incrementAchievement(userId: ObjectId, achievement: string, amount: number = 1) {
        let updateQuery = {
            $inc: {}
        };

        updateQuery.$inc[achievement] = amount;

        await this.userRepo.updateOne({
            _id: userId
        }, updateQuery);
    }

    async incrementSpecialistsHired(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.specialistsHired', amount);
    }

    async incrementWarpGatesBuilt(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.warpGates', amount);
    }

    async incrementWarpGatesDestroyed(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.warpGatesDestroyed', amount);
    }

    async incrementCarriersBuilt(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.carriers', amount);
    }

    async incrementInfrastructureBuilt(type: string, userId: ObjectId, amount: number = 1) {
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

    async incrementEconomyBuilt(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.economy', amount);
    }

    async incrementIndustryBuilt(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.industry', amount);
    }

    async incrementScienceBuilt(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.science', amount);
    }

    async incrementTradeCreditsSent(userId: ObjectId, amount: number = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsSent', amount);
    }

    async incrementTradeCreditsReceived(userId: ObjectId, amount: number = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsReceived', amount);
    }

    async incrementTradeCreditsSpecialistsSent(userId: ObjectId, amount: number = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsSpecialistsSent', amount);
    }

    async incrementTradeCreditsSpecialistsReceived(userId: ObjectId, amount: number = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsSpecialistsReceived', amount);
    }

    async incrementTradeTechnologySent(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.trade.technologySent', amount);
    }

    async incrementTradeTechnologyReceived(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.trade.technologyReceived', amount);
    }

    async incrementRenownSent(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.trade.renownSent', amount);
    }

    async incrementRenownReceived(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.renown', amount);
    }

    async incrementDefeated(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.defeated', amount);
    }

    async incrementJoined(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.joined', amount);
    }

    async incrementQuit(userId: ObjectId, amount: number = 1) {
        return await this.incrementAchievement(userId, 'achievements.quit', amount);
    }

    async isEstablishedPlayer(userId: ObjectId) {
        let userAchievements = await this.getAchievements(userId);

        return userAchievements.achievements.rank > 0 || userAchievements.achievements.completed > 0;
    }
};
