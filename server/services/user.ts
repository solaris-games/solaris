const EventEmitter = require('events');
import { ObjectId } from 'mongoose';
import ValidationError from '../errors/validation';
import { Game } from '../types/Game';
import { User } from '../types/User';
const moment = require('moment');

function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default class UserService extends EventEmitter {
    
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

    async getById(id: ObjectId, select: any = null) {
        return await this.userRepo.findById(id, select);
    }

    async getByUsername(username: string, select: any = null) {
        return await this.userRepo.findOne({
            username
        }, select);
    }

    async getByUsernameAchievementsLean(username: string) {
        return await this.userRepo.findOne({
            username: username
        }, {
            username: 1,
            achievements: 1
        });
    }

    async getUserCount(): Promise<number> {
        return this.userRepo.countAll();
    }

    async getGameUsers(game: Game) {
        return await this.userRepo.findAsModels({
            _id: {
                $in: game.galaxy.players.map(p => p.userId)
            }
        });
    }

    async getInfoById(id: ObjectId) {
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

    async getInfoByIdLean(id: ObjectId, select: any | null) {
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
    
    async getEmailById(id: ObjectId) {
        return await this.userRepo.findById(id, {
            email: 1,
            emailEnabled: 1
        });
    }

    async getUsernameByEmail(email: string) {
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

    async getUserIsBanned(userId: ObjectId) {
        let user = await this.userRepo.findOne({
            _id: userId
        }, {
            banned: 1
        });

        if (user) {
            return user.banned;
        }

        return null;
    }

    async getUserIsAdmin(userId: ObjectId) {
        let user = await this.userRepo.findOne({
            _id: userId
        }, {
            'roles.administrator': 1
        });

        return user.roles.administrator;
    }

    async getUserIsSubAdmin(userId: ObjectId) {
        let user = await this.userRepo.findOne({
            _id: userId
        }, {
            'roles.administrator': 1,
            'roles.gameMaster': 1,
            'roles.communityManager': 1
        });

        return user.roles.administrator || user.roles.gameMaster || user.roles.communityManager;
    }

    async getUserIsGameMaster(userId: ObjectId) {
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

    async create(user: User, ipAddress: string) {
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

    async userExists(email: string) {
        email = email.trim();
        email = email.toLowerCase();

        let user = await this.userRepo.findOne({
            email
        });

        return user != null;
    }

    async usernameExists(username: string) {
        username = username.trim();

        let user = await this.userRepo.findOne({
            username
        }, { 
            _id: 1 
        });

        return user != null;
    }

    async otherUsernameExists(username: string, ignoreUserId: ObjectId) {
        username = username.trim();

        let user = await this.userRepo.findOne({
            _id: { $ne: ignoreUserId },
            username
        }, { 
            _id: 1 
        });

        return user != null;
    }

    async updateEmailPreference(id: ObjectId, preference: string) {
        await this.userRepo.updateOne({
            _id: id
        }, {
            emailEnabled: preference
        });
    }

    async updateEmailAddress(id: ObjectId, email: string) {
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

    async updateUsername(id: ObjectId, username: string) {
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

    async updatePassword(id: ObjectId, currentPassword: string, newPassword: string) {
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

    async requestResetPassword(email: string) {
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

    async resetPassword(resetPasswordToken: string, newPassword: string) {
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

    async closeAccount(id: ObjectId) {
        await this.userRepo.deleteOne({
            _id: id
        });
    }

    async getGameSettings(userId: ObjectId) {
        if (!userId) {
            return new this.userModel().gameSettings; // Return the default config
        }

        let user = await this.getMe(userId);

        return user.gameSettings;
    }

    async saveGameSettings(userId: ObjectId, settings: any) {
        if (+settings.carrier.defaultAmount < 0) {
            throw new ValidationError(`Carrier default amount must be greater than 0.`);
        }

        await this.userRepo.updateOne({
            _id: userId
        }, {
            gameSettings: settings
        });
    }

    async updateLastSeen(userId: ObjectId, ipAddress: string) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                'lastSeen': moment().utc(),
                'lastSeenIP': ipAddress
            }
        });
    }

    async listUserEloRatingsByIds(userIds: ObjectId[]) {
        return await this.userRepo.find({
            _id: { $in: userIds }
        }, {
            'achievements.eloRating': 1
        });
    }

    async listUsersInGuilds(): Promise<User[]> {
        return await this.userRepo.find({ 
            guildId: { $ne: null }
        }, {
            'achievements.rank': 1
        });
    }

    async listUsersInGuild(guildId: ObjectId, select: any = null) {
        return await this.userRepo.find({
            guildId
        }, select);
    }

    async listUsers(userIds: ObjectId[], select: any = null) {
        return await this.userRepo.find({
            _id: {
                $in: userIds
            }
        }, select);
    }

    async getUserCredits(userId: ObjectId) {
        let userCredits = await this.userRepo.findById(userId, {
            credits: 1
        });

        return userCredits?.credits;
    }

    async setCredits(userId: ObjectId, credits: number) {
        credits = Math.max(credits, 0);
        
        await this.userRepo.updateOne({
            _id: userId
        }, {
            credits
        });
    }

    async incrementCredits(userId: ObjectId, credits: number) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $inc: {
                credits: credits
            }
        });
    }

    async incrementCreditsByPurchase(userId: ObjectId, credits: number) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                'roles.contributor': true
            },
            $inc: {
                credits: credits
            }
        });
    }

};
