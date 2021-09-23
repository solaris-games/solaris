module.exports = class AdminService {
    
    constructor(userRepo, gameRepo) {
        this.userRepo = userRepo;
        this.gameRepo = gameRepo;
    }

    async listUsers(limit) {
        let users = await this.userRepo.find({
            // All users
        }, {
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
        }, {
            lastSeen: -1
        }, limit);

        for (let user of users) {
            user.isEstablishedPlayer = user.achievements.rank > 0 || user.achievements.completed > 0;
        }

        return users;
    }

    async listGames(limit) {
        return await this.gameRepo.find({
            // All games
        }, {
            'settings.general': 1,
            'state': 1
        }, {
            _id: -1
        },
        limit);
    }

    async setRoleContributor(userId, enabled = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.contributor': enabled
        });
    }

    async setRoleDeveloper(userId, enabled = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.developer': enabled
        });
    }

    async setRoleCommunityManager(userId, enabled = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.communityManager': enabled
        });
    }

    async setRoleGameMaster(userId, enabled = true) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'roles.gameMaster': enabled
        });
    }

    async ban(userId) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'banned': true
        });
    }

    async unban(userId) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'banned': false
        });
    }

    async promoteToEstablishedPlayer(userId) {
        await this.userRepo.updateOne({
            _id: userId,
            $and: [
                { 'achievements.rank': { $eq: 0 }},
                { 'achievements.completed': { $eq: 0 }}
            ]
        }, {
            $inc: {
                'achievements.completed': 1
            }
        });
    }

    async setCredits(userId, credits) {
        credits = Math.max(credits, 0);
        
        await this.userRepo.updateOne({
            _id: userId
        }, {
            'credits': credits
        });
    }

    async setGameFeatured(gameId, featured) {
        await this.gameRepo.updateOne({
            _id: gameId
        }, {
            'settings.general.featured': featured
        });
    }

};
