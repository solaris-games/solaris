module.exports = class AchievementService {
    
    constructor(userRepo) {
        this.userRepo = userRepo;
    }

    async getAchievements(id) {
        return await this.userRepo.findById(id, {
            // Remove fields we don't want to send back.
            achievements: 1,
            username: 1,
            'roles.contributor': 1,
            'roles.developer': 1,
            'roles.communityManager': 1,
            'roles.gameMaster': 1
        });
    }

    async incrementAchievement(userId, achievement, amount = 1) {
        let updateQuery = {
            $inc: {}
        };

        updateQuery.$inc[achievement] = amount;

        await this.userRepo.updateOne({
            _id: userId
        }, updateQuery);
    }

    async incrementSpecialistsHired(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.specialistsHired', amount);
    }

    async incrementWarpGatesBuilt(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.warpGates', amount);
    }

    async incrementWarpGatesDestroyed(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.warpGatesDestroyed', amount);
    }

    async incrementCarriersBuilt(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.carriers', amount);
    }

    async incrementInfrastructureBuilt(type, userId, amount = 1) {
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

    async incrementEconomyBuilt(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.economy', amount);
    }

    async incrementIndustryBuilt(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.industry', amount);
    }

    async incrementScienceBuilt(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.infrastructure.science', amount);
    }

    async incrementTradeCreditsSent(userId, amount = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsSent', amount);
    }

    async incrementTradeCreditsReceived(userId, amount = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsReceived', amount);
    }

    async incrementTradeCreditsSpecialistsSent(userId, amount = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsSpecialistsSent', amount);
    }

    async incrementTradeCreditsSpecialistsReceived(userId, amount = 0) {
        return await this.incrementAchievement(userId, 'achievements.trade.creditsSpecialistsReceived', amount);
    }

    async incrementTradeTechnologySent(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.trade.technologySent', amount);
    }

    async incrementTradeTechnologyReceived(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.trade.technologyReceived', amount);
    }

    async incrementRenownSent(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.trade.renownSent', amount);
    }

    async incrementRenownReceived(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.renown', amount);
    }

    async incrementDefeated(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.defeated', amount);
    }

    async incrementJoined(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.joined', amount);
    }

    async incrementQuit(userId, amount = 1) {
        return await this.incrementAchievement(userId, 'achievements.quit', amount);
    }
};
