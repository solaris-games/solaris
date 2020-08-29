const EventEmitter = require('events');
const ValidationError = require('../errors/validation');

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = class UserService extends EventEmitter {
    
    constructor(userModel, passwordService) {
        super();

        this.userModel = userModel;
        this.passwordService = passwordService;
    }

    async getMe(id) {
        return await this.userModel.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            resetPasswordToken: 0,
            premiumEndDate: 0
        })
        .lean()
        .exec();
    }

    async getById(id) {
        return await this.userModel.findById(id);
    }

    async getInfoById(id) {
        return await this.userModel.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            resetPasswordToken: 0,
            premiumEndDate: 0,
            credits: 0,
            email: 0,
            emailEnabled: 0,
            username: 0
        });
    }

    async getInfoByIdLean(id) {
        return await this.userModel.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            resetPasswordToken: 0,
            premiumEndDate: 0,
            credits: 0,
            email: 0,
            emailEnabled: 0,
            username: 0
        })
        .lean()
        .exec();
    }
    
    async getEmailById(id) {
        return await this.userModel.findById(id, {
            email: 1,
            emailEnabled: 1
        });
    }

    async getAchievements(id) {
        return await this.userModel.findById(id, {
            // Remove fields we don't want to send back.
            achievements: 1,
            username: 1,
            contributor: 1,
            developer: 1
        })
        .lean()
        .exec();
    }

    async getUsernameByEmail(email) {
        email = email.trim();

        let user = await this.userModel.findOne({email}, {
            username: 1
        });

        if (!user) {
            throw new ValidationError(`An account with the email ${email} does not exist.`);
        }

        return user.username;
    }

    async create(user) {
        user.username = user.username.trim();
        user.email = user.email.trim();

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

        let user = await this.userModel.findOne({
            email: email
        });

        return user != null;
    }

    async usernameExists(username) {
        username = username.trim();

        let user = await this.userModel.findOne({
            username
        });

        return user != null;
    }

    async updateEmailPreference(id, preference) {
        let user = await this.userModel.findById(id);

        user.emailEnabled = preference;

        return await user.save();
    }

    async updateEmailAddress(id, email) {
        email = email.trim();

        let user = await this.userModel.findById(id);
        
        if (await this.userExists(email)) {
            throw new ValidationError('Cannot change your email address, the new email address is already in use by another account.');
        }

        user.email = email;

        return await user.save();
    }

    async updateUsername(id, username) {
        username = username.trim();

        if (username.length < 3 || username.length > 24) {
            throw new ValidationError('Username must be between 3 and 24 characters.');
        }

        let user = await this.userModel.findById(id);
        
        if (await this.usernameExists(username)) {
            throw new ValidationError('Cannot change your username, the new username is already in use by another account.');
        }

        user.username = username;

        return await user.save();
    }

    async updatePassword(id, currentPassword, newPassword) {
        let user = await this.userModel.findById(id);
        
        // Make sure the current password matches.
        let result = await this.passwordService.compare(currentPassword, user.password);

        if (result) {
            // Update the current password to the new password.
            let hash = await this.passwordService.hash(newPassword, 10);
            
            user.password = hash;

            return await user.save();
        } else {
            throw new ValidationError('The current password is incorrect.');
        }
    }

    async requestResetPassword(email) {
        email = email.trim();

        let user = await this.userModel.findOne({
            email
        });

        if (user == null) {
            throw new ValidationError(`An account does not exist with the email address: ${email}`);
        }

        user.resetPasswordToken = uuidv4();

        await user.save();

        return user.resetPasswordToken;
    }

    async resetPassword(resetPasswordToken, newPassword) {
        if (resetPasswordToken == null || !resetPasswordToken.length) {
            throw new ValidationError(`The token is required`);
        }

        let user = await this.userModel.findOne({
            resetPasswordToken
        });

        if (user == null) {
            throw new ValidationError(`The token is invalid.`);
        }
        
        // Update the current password to the new password.
        let hash = await this.passwordService.hash(newPassword, 10);
        
        user.password = hash;
        user.resetPasswordToken = null;

        await user.save();
    }

};
