const EventEmitter = require('events');
import { ValidationError } from "solaris-common";
import PasswordService from './password';
import Repository from './repository';
import SessionService from './session';
import { DBObjectId } from './types/DBObjectId';
import { Game } from './types/Game';
import { User, UserSubscriptions } from './types/User';
const moment = require('moment');

function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const UserServiceEvents = {
    onUserCreated: 'onUserCreated'
}

export default class UserService extends EventEmitter {
    
    constructor(
        private userModel,
        public userRepo: Repository<User>,
        private passwordService: PasswordService,
        private sessionService: SessionService
    ) {
        super();
    }

    async getMe(id: DBObjectId) {
        const user = await this.userRepo.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            resetPasswordToken: 0,
            premiumEndDate: 0,
            banned: 0,
            lastSeen: 0,
            lastSeenIP: 0,
            'oauth.discord.token': 0,
            tutorialsCompleted: 0,
        });

        if (user) {
            user.warnings = user.warnings.filter(warning => {
                return moment().diff(warning.date, 'months') < 1;
            });
        }

        return user;
    }

    async getById(id: DBObjectId, select: any | null = null) {
        return await this.userRepo.findById(id, select);
    }

    async getByUsername(username: string, select: any | null = null) {
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
        return await this.userRepo.countAll();
    }

    async getGameUsers(game: Game) {
        return await this.userRepo.findAsModels({
            _id: {
                $in: game.galaxy.players.map(p => p.userId)
            }
        });
    }

    async getInfoById(id: DBObjectId) {
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
            lastSeenIP: 0,
            oauth: 0,
            tutorialsCompleted: 0,
        });
    }

    async getInfoByIdLean(id: DBObjectId, select?: any | null) {
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
            lastSeenIP: 0,
            oauth: 0,
            tutorialsCompleted: 0,
        };

        return await this.userRepo.findById(id, select);
    }
    
    async getEmailById(id: DBObjectId) {
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

    async getUserIsBanned(userId: DBObjectId) {
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

    async getUserIsAdmin(userId: DBObjectId): Promise<boolean> {
        let user = await this.userRepo.findOne({
            _id: userId
        }, {
            'roles.administrator': 1
        });

        return Boolean(user?.roles.administrator);
    }

    async getUserIsSubAdmin(userId: DBObjectId) {
        let user = await this.userRepo.findOne({
            _id: userId
        }, {
            'roles.administrator': 1,
            'roles.gameMaster': 1,
            'roles.communityManager': 1
        });

        return user!.roles.administrator || user!.roles.gameMaster || user!.roles.communityManager;
    }

    async getUserIsGameMaster(userId: DBObjectId) {
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

    async getUserIsCommunityManager(userId: DBObjectId) {
        let user = await this.userRepo.findOne({
            _id: userId,
            $or: [
                { 'roles.administrator': 1 },
                { 'roles.communityManager': 1 }
            ]
        }, {
            _id: 1
        });

        return user != null;
    }

    async create(email: string, username: string, password: string, ipAddress: string) {
        let user = {
            username: username.trim(),
            email: email.trim().toLowerCase(),
            lastSeen: moment().utc(),
            lastSeenIP: ipAddress,
        };

        if (user.username.length < 3 || user.username.length > 24) {
            throw new ValidationError('Username must be between 3 and 24 characters.');
        }

        const newUser = new this.userModel(user);
    
        newUser.password = await this.passwordService.hash(password);

        let doc = await newUser.save();

        this.emit(UserServiceEvents.onUserCreated, doc);

        return doc._id;
    }

    async userExists(email: string) {
        email = email.trim();
        email = email.toLowerCase();

        let user = await this.userRepo.findOne({
            email
        }, {
            _id: 1
        });

        return user != null;
    }

    async userIdExists(id: DBObjectId) {
        let user = await this.userRepo.findOne({
            _id: id
        }, {
            _id: 1
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

    async otherUsernameExists(username: string, ignoreUserId: DBObjectId) {
        username = username.trim();

        let user = await this.userRepo.findOne({
            _id: { $ne: ignoreUserId },
            username
        }, { 
            _id: 1 
        });

        return user != null;
    }

    async updateEmailPreference(id: DBObjectId, preference: boolean) {
        await this.userRepo.updateOne({
            _id: id
        }, {
            emailEnabled: preference
        });
    }

    async updateEmailOtherPreference(id: DBObjectId, preference: boolean) {
        await this.userRepo.updateOne({
            _id: id
        }, {
            emailOtherEnabled: preference
        });
    }

    async updateEmailAddress(id: DBObjectId, email: string) {
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

    async updateUsername(id: DBObjectId, username: string) {
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

        this.sessionService.updateUserSessions(id, session => {
            session.username = username;
        });
    }

    async updatePassword(id: DBObjectId, currentPassword: string, newPassword: string) {
        let user = await this.userRepo.findById(id);
        
        if (!user) {
            throw new ValidationError(`Could not find user`, 404);
        }

        // Make sure the current password matches.
        let result = await this.passwordService.compare(currentPassword, user.password!);

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

    async closeAccount(id: DBObjectId) {
        await this.userRepo.deleteOne({
            _id: id
        });
    }

    async getGameSettings(userId: DBObjectId) {
        if (!userId) {
            return new this.userModel().gameSettings; // Return the default config
        }

        let user = await this.getMe(userId);

        return user!.gameSettings;
    }

    async saveGameSettings(userId: DBObjectId, settings) {
        if (+settings.carrier.defaultAmount < 0) {
            throw new ValidationError(`Carrier default amount must be greater than 0.`);
        }

        await this.userRepo.updateOne({
            _id: userId
        }, {
            gameSettings: settings
        });
    }

    async getSubscriptions(userId: DBObjectId) {
        let user = await this.getMe(userId);

        return user!.subscriptions;
    }

    async saveSubscriptions(userId: DBObjectId, subscriptions: any) {
        let obj: UserSubscriptions = {
            settings: {
                notifyActiveGamesOnly: subscriptions.settings?.notifyActiveGamesOnly || false
            }
        };

        if (subscriptions.inapp) {
            obj.inapp = {
                notificationsForOtherGames: Boolean(subscriptions.inapp?.notificationsForOtherGames),
            }
        }

        if (subscriptions.discord) {
            obj.discord = {
                gameEnded: subscriptions.discord.gameEnded || false,
                gameStarted: subscriptions.discord.gameStarted || false,
                gameTurnEnded: subscriptions.discord.gameTurnEnded || false,
                playerCreditsReceived: subscriptions.discord.playerCreditsReceived || false,
                playerCreditsSpecialistsReceived: subscriptions.discord.playerCreditsSpecialistsReceived || false,
                playerGalacticCycleComplete: subscriptions.discord.playerGalacticCycleComplete || false,
                playerRenownReceived: subscriptions.discord.playerRenownReceived || false,
                playerResearchComplete: subscriptions.discord.playerResearchComplete || false,
                playerTechnologyReceived: subscriptions.discord.playerTechnologyReceived || false,
                conversationMessageSent: subscriptions.discord.conversationMessageSent || false
            }
        }

        await this.userRepo.updateOne({
            _id: userId
        }, {
            subscriptions: obj
        });
    }

    async updateLastSeen(userId: DBObjectId, ipAddress: string) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                'lastSeen': moment().utc(),
                'lastSeenIP': ipAddress
            }
        });
    }

    async listUserEloRatingsByIds(userIds: DBObjectId[]) {
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

    async listUsersInGuild(guildId: DBObjectId, select: any | null = null) {
        return await this.userRepo.find({
            guildId
        }, select);
    }

    async listUsers(userIds: DBObjectId[], select: any | null = null) {
        return await this.userRepo.find({
            _id: {
                $in: userIds
            }
        }, select);
    }

    async getCredits(userId: DBObjectId) {
        let userCredits = await this.userRepo.findById(userId, {
            credits: 1
        });

        return userCredits?.credits || 0;
    }

    async setCredits(userId: DBObjectId, credits: number) {
        credits = Math.max(credits, 0);
        
        await this.userRepo.updateOne({
            _id: userId
        }, {
            credits
        });

        this.sessionService.updateUserSessions(userId, session => {
            session.userCredits = credits;
        });

        return credits;
    }

    async incrementCredits(userId: DBObjectId, credits: number) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $inc: {
                credits: credits
            }
        });

        this.sessionService.updateUserSessions(userId, session => {
            session.userCredits += credits;
        });
    }

    async incrementCreditsByPurchase(userId: DBObjectId, credits: number) {
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

        this.sessionService.updateUserSessions(userId, session => {
            session.roles.contributor = true;
            session.userCredits += credits;
        });
    }

    async isEstablishedPlayer(userId: DBObjectId) {
        let user = await this.userRepo.findById(userId, {
            isEstablishedPlayer: 1
        });

        return user?.isEstablishedPlayer || false;
    }

    async listUsersEligibleForReviewReminder(limit: number) {
        const date = moment().utc().add(-30, 'days').toDate();
        const ltId = this.userRepo.objectIdFromDate(date);

        return await this.userRepo.find({
            _id: { $lte: ltId },
            emailOtherEnabled: true,
            hasSentReviewReminder: false
        }, {
            _id: 1,
            username: 1,
            email: 1,
            emailOtherEnabled: 1
        }, {
            _id: 1
        },
        limit);
    }

    async setReviewReminderEmailSent(userId: DBObjectId, sent: boolean) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            $set: {
                hasSentReviewReminder: sent
            }
        });
    }

    async listTutorialsCompleted(userId: DBObjectId) {
        let user = await this.userRepo.findOne({
            _id: userId
        }, {
            tutorialsCompleted: 1
        });

        return user?.tutorialsCompleted || []
    }

    async updateLastReadAnnouncement(userId: DBObjectId, lastAnnouncementId: DBObjectId) {
        await this.userRepo.updateOne({
            _id: userId
        }, {
            lastReadAnnouncement: lastAnnouncementId
        });
    }
};
