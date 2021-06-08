module.exports = class AdminService {
    
    constructor(userModel, gameModel) {
        this.userModel = userModel;
        this.gameModel = gameModel;
    }

    async listUsers() {
        return await this.userModel.find({}, {
            username: 1,
            email: 1,
            credits: 1,
            banned: 1,
            roles: 1,
            emailEnabled: 1,
            resetPasswordToken: 1,
            lastSeen: 1,
            lastSeenIP: 1
        })
        .sort({
            lastSeen: -1
        })
        .lean({defaults: true})
        .exec();
    }

    async listGames() {
        return await this.gameModel.find({}, {
            'settings.general': 1,
            'state': 1
        })
        .lean({defaults: true})
        .exec();
    }

    async setRoleContributor(userId, enabled = true) {
        await this.userModel.updateOne({
            _id: userId
        }, {
            'roles.contributor': enabled
        }).exec();
    }

    async setRoleDeveloper(userId, enabled = true) {
        await this.userModel.updateOne({
            _id: userId
        }, {
            'roles.developer': enabled
        }).exec();
    }

    async setRoleCommunityManager(userId, enabled = true) {
        await this.userModel.updateOne({
            _id: userId
        }, {
            'roles.communityManager': enabled
        }).exec();
    }

    async setRoleGameMaster(userId, enabled = true) {
        await this.userModel.updateOne({
            _id: userId
        }, {
            'roles.gameMaster': enabled
        }).exec();
    }

    async ban(userId) {
        await this.userModel.updateOne({
            _id: userId
        }, {
            'banned': true
        }).exec();
    }

    async unban(userId) {
        await this.userModel.updateOne({
            _id: userId
        }, {
            'banned': false
        }).exec();
    }

    async setCredits(userId, credits) {
        credits = Math.max(credits, 0);
        
        await this.userModel.updateOne({
            _id: userId
        }, {
            'credits': credits
        }).exec();
    }

    async setGameFeatured(gameId, featured) {
        await this.gameModel.updateOne({
            _id: gameId
        }, {
            'settings.general.featured': featured
        }).exec();
    }

};
