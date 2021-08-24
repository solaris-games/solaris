module.exports = class AdminService {
    
    constructor(userModel, gameModel) {
        this.userModel = userModel;
        this.gameModel = gameModel;
    }

    async listUsers(limit) {
        let users = await this.userModel.find({}, {
            username: 1,
            email: 1,
            credits: 1,
            banned: 1,
            roles: 1,
            emailEnabled: 1,
            resetPasswordToken: 1,
            lastSeen: 1,
            lastSeenIP: 1,
            'achievements.rank': 1,
            'achievements.completed': 1
        })
        .sort({
            lastSeen: -1
        })
        .limit(limit)
        .lean({defaults: true})
        .exec();

        for (let user of users) {
            user.isEstablishedPlayer = user.achievements.rank > 0 || user.achievements.completed > 0;
        }

        return users;
    }

    async listGames(limit) {
        return await this.gameModel.find({}, {
            'settings.general': 1,
            'state': 1
        })
        .sort({
            _id: -1
        })
        .limit(limit)
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

    async promoteToEstablishedPlayer(userId) {
        await this.userModel.updateOne({
            _id: userId,
            $and: [
                { 'achievements.rank': { $eq: 0 }},
                { 'achievements.completed': { $eq: 0 }}
            ]
        }, {
            $inc: {
                'achievements.completed': 1
            }
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
