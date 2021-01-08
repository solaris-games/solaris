module.exports = class AchievementService {
    
    constructor(userModel) {
        this.userModel = userModel;
    }

    async getAchievements(id) {
        return await this.userModel.findById(id, {
            // Remove fields we don't want to send back.
            achievements: 1,
            username: 1,
            roles: 1
        })
        .lean({ defaults: true })
        .exec();
    }

    async incrementSpecialistsHired(userId) {
        await this.userModel.updateOne({
            _id: userId
        },
        {
            $inc: { 'achievements.infrastructure.specialistsHired': 1 }
        })
        .exec();
    }

    async incrementGiftsSent(userId, amount) {
        await this.userModel.updateOne({
            _id: userId
        },
        {
            $inc: { 'achievements.trade.giftsSent': amount }
        })
        .exec();
    }

    async incrementGiftsReceived(userId, amount) {
        await this.userModel.updateOne({
            _id: userId
        },
        {
            $inc: { 'achievements.trade.giftsReceived': amount }
        })
        .exec();
    }

    async incrementWarpGatesBuilt(userId) {
        await this.userModel.updateOne({
            _id: userId
        },
        {
            $inc: { 'achievements.infrastructure.warpGates': 1 }
        })
        .exec();
    }

    async incrementWarpGatesDestroyed(userId) {
        await this.userModel.updateOne({
            _id: userId
        },
        {
            $inc: { 'achievements.infrastructure.warpGatesDestroyed': 1 }
        })
        .exec();
    }

    async incrementCarriersBuilt(userId) {
        await this.userModel.updateOne({
            _id: userId
        },
        {
            $inc: { 'achievements.infrastructure.carriers': 1 }
        })
        .exec();
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
        await this.userModel.updateOne({
            _id: userId
        },
        {
            $inc: { 'achievements.infrastructure.economy': amount }
        })
        .exec();
    }

    async incrementIndustryBuilt(userId, amount = 1) {
        await this.userModel.updateOne({
            _id: userId
        },
        {
            $inc: { 'achievements.infrastructure.industry': amount }
        })
        .exec();
    }

    async incrementScienceBuilt(userId, amount = 1) {
        await this.userModel.updateOne({
            _id: userId
        },
        {
            $inc: { 'achievements.infrastructure.science': amount }
        })
        .exec();
    }

};
