const EventEmitter = require('events');
const ValidationError = require('../errors/validation');
const moment = require('moment');

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = class UserService extends EventEmitter {
    
    constructor(userModel, userRepo, passwordService) {
        super();

        this.userModel = userModel;
        this.userRepo = userRepo;
        this.passwordService = passwordService;
    }

    async getMe(id) {
        return await this.userRepo.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            resetPasswordToken: 0,
            premiumEndDate: 0,
            banned: 0,
            lastSeen: 0,
            lastSeenIP: 0
        });
    }

    async getById(id, select = null) {
        return await this.userRepo.findById(id, select);
    }

    async getByUsername(username, select = null) {
        return await this.userRepo.findOne({
            username
        }, select);
    }

    async getByUsernameAchievementsLean(username) {
        return await this.userRepo.findOne({
            username: username
        }, {
            username: 1,
            achievements: 1
        });
    }

    async getUserCount() {
        return this.userRepo.countAll();
    }

    async getGameUsers(game) {
        return await this.userRepo.findAsModels({
            _id: {
                $in: game.galaxy.players.map(p => p.userId)
            }
        });
    }

    async getInfoById(id) {
        return await this.userRepo.findByIdAsModel(id, {
            // Remove fields we don't want to send back.
            password: 0,
            resetPasswordToken: 0,
            premiumEndDate: 0,
            banned: 0,
            credits: 0,
            email: 0,
            emailEnabled: 0,
            username: 0,
            gameSettings: 0,
            lastSeen: 0,
            lastSeenIP: 0
        });
    }

    async getInfoByIdLean(id, select) {
        select = select || {
            // Remove fields we don't want to send back.
            password: 0,
            resetPasswordToken: 0,
            premiumEndDate: 0,
            banned: 0,
            credits: 0,
            email: 0,
            emailEnabled: 0,
            username: 0,
            gameSettings: 0,
            lastSeen: 0,
            lastSeenIP: 0
        };

        return await this.userRepo.findById(id, select);
    }
    
    async getEmailById(id) {
        return await this.userRepo.findById(id, {
            email: 1,
            emailEnabled: 1
        });
    }

    async getUsernameByEmail(email) {
        email = email.trim();
        email = email.toLowerCase();

        let user = await this.userRepo.findOne({
            email
        }, {
            username: 1
        });

        if (!user) {
            throw new ValidationError(`An account with the email ${email} does not exist.`);
        }

        return user.username;
    }

    async getUserIsBanned(userId) {
        let user = await this.userRepo.findOne({
            _id: userId
        }, {
            banned: 1
        });

        return user.banned;
    }

    async getUserIsAdmin(userId) {
        let user = await this.userRepo.findOne({
            _id: userId
        }, {
            'roles.administrator': 1
        });

        return user.roles.administrator;
    }

    async getUserIsSubAdmin(userId) {
        let user = await this.userRepo.findOne({
            _id: userId
        }, {
            'roles.administrator': 1,
            'roles.gameMaster': 1,
            'roles.communityManager': 1
        });

        return user.roles.administrator || user.roles.gameMaster || user.roles.communityManager;
    }

    async getUserIsGameMaster(userId) {
        let user = await this.userRepo.findOne({
            _id: userId,
            $or: [
                { 'roles.administrator': 1 },
                { 'roles.gameMaster': 1 }
            ]
        }, {
            _id: 1
        });

        return user != null;
    }

    async create(user, ipAddress) {
        user.username = user.username.trim();
        user.email = user.email.trim();
        user.email = user.email.toLowerCase();
        user.lastSeen = moment().utc();
        user.lastSeenIP = ipAddress;

        if (user.username.length < 3 || user.username.length > 24) {
            throw new ValidationError('Username must be between 3 and 24 characters.');
        }

        const newUser = new this.userModel(user);
    
        newUser.password = await this.passwordService.hash(newUser.password, 10);

        let doc = await newUser.save();

        this.emit('onUserCreated', doc);

        return doc._id;
    }

    async userExists(email) {
        email = email.trim();
        email = email.toLowerCase();

        let user = await this.userRepo.findOne({
            email
        });

        return user != null;
    }

    async usernameExists(username) {
        username = username.trim();

        let user = await this.userRepo.findOne({
            username
        }, { 
            _id: 1 
        });

        return user != null;
    }

    async otherUsernameExists(username, ignoreUserId) {
        username = username.trim();

        let user = await this.userRepo.findOne({
            _id: { $ne: ignoreUserId },
            username
        }, { 
            _id: 1 
        });

        return user != null;
    }

    async updateEmailPreference(id, preference) {
        await this.userRepo.updateOne({
            _id: id
        }, {
            emailEnabled: preference
        });
    }

    async updateEmailAddress(id, email) {
        email = email.trim();
        email = email.toLowerCase();

        if (await this.userExists(email)) {
            throw new ValidationError('Cannot change your email address, the new email address is already in use by another account.');
        }

        await this.userRepo.updateOne({
            _id: id
        }, {
            email
        });
    }

    async updateUsername(id, username) {
        username = username.trim();

        if (username.length < 3 || username.length > 24) {
            throw new ValidationError('Username must be between 3 and 24 characters.');
        }

        if (await this.usernameExists(username)) {
            throw new ValidationError('Cannot change your username, the new username is already in use by another account.');
        }

        await this.userRepo.updateOne({
            _id: id
        }, {
            username
        });
    }

    async updatePassword(id, currentPassword, newPassword) {
        let user = await this.userRepo.findById(id);
        
        // Make sure the current password matches.
        let result = await this.passwordService.compare(currentPassword, user.password);

        if (result) {
            // Update the current password to the new password.
            let hash = await this.passwordService.hash(newPassword, 10);
            
            await this.userRepo.updateOne({
                _id: user._id
            }, {
                password: hash
            });
        } else {
            throw new ValidationError('The current password is incorrect.');
        }
    }

    async requestResetPassword(email) {
        email = email.trim();
        email = email.toLowerCase();

        let user = await this.userRepo.findOne({
            email
        });

        if (user == null) {
            throw new ValidationError(`An account does not exist with the email address: ${email}`);
        }

        let resetPasswordToken = uuidv4();

        await this.userRepo.updateOne({
            _id: user._id
        }, {
            resetPasswordToken
        });

        return resetPasswordToken;
    }

    async resetPassword(resetPasswordToken, newPassword) {
        if (resetPasswordToken == null || !resetPasswordToken.length) {
            throw new ValidationError(`The token is required`);
        }

        let user = await this.userRepo.findOne({
            resetPasswordToken
        });

        if (user == null) {
            throw new ValidationError(`The token is invalid.`);
        }
        
        // Update the current password to the new password.
        let hash = await this.passwordService.hash(newPassword, 10);
        
        await this.userRepo.updateOne({
            _id: user._id
        }, {
            password: hash,
            resetPasswordToken: null
        });
    }

    async closeAccount(id) {
        await this.userRepo.deleteOne({
            _id: id
        });
    }

    async getGameSettings(userId) {
        if (!userId) {
            return new this.userModel().gameSettings; // Return the default config
        }

        let user = await this.getMe(userId);

        return user.gameSettings;
    }

    async saveGameSettings(userId, settings) {
        if (+settings.carrier.defaultAmount < 0) {
            throw new ValidationError(`Carrier default amount must be greater than 0.`);
        }

        await this.userRepo.updateOne({
            _id: userId
        }, {
            gameSettings: settings
        });
    }

    async updateLastSeen(userId, ipAddress) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                'lastSeen': moment().utc(),
                'lastSeenIP': ipAddress
            }
        });
    }

    async listUserEloRatingsByIds(userIds) {
        return await this.userRepo.find({
            _id: { $in: userIds }
        }, {
            'achievements.eloRating': 1
        });
    }

    async listUsersInGuilds() {
        return await this.userRepo.find({ 
            guildId: { $ne: null }
        }, {
            'achievements.rank': 1
        });
    }

    async listUsersInGuild(guildId, select = null) {
        return await this.userRepo.find({
            guildId
        }, select);
    }

    async listUsers(userIds, select = null) {
        return await this.userRepo.find({
            _id: {
                $in: userIds
            }
        }, select);
    }

    async getUserCredits(userId) {
        let userCredits = await this.userRepo.findById(userId, {
            credits: 1
        });

        return userCredits?.credits;
    }

};
