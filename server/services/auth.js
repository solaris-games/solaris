const ValidationError = require('../errors/validation');

module.exports = class AuthService {
    
    constructor(userModel, passwordService) {
        this.userModel = userModel;
        this.passwordService = passwordService;
    }

    async login(email, password) {
        email = email.trim();
        email = email.toLowerCase();

        // Try to find the user by email
        let user = await this.userModel.findOne({
            email
        }, {
            username: 1,
            password: 1,
            banned: 1
        })
        .lean()
        .exec();
        
        if (!user) {
            throw new ValidationError('The email address or password is incorrect.');
        }

        if (user.banned) {
            throw new ValidationError('The account has been banned.');
        }

        if (user.password == null) {
            return user._id;
        }

        // Compare the passwords and if they match then the user is authenticated.
        let result = await this.passwordService.compare(password, user.password);

        if (result) {
            return user;
        } else {
            throw new ValidationError('The email address or password is incorrect.');
        }
    }

    async updateOauthDiscord(userId, discordUserId, oauth) {
        await this.userModel.updateOne({
            _id: userId
        }, {
            $set: {
                'oauth.discord.userId': discordUserId,
                'oauth.discord.token.access_token': oauth.access_token,
                'oauth.discord.token.token_type': oauth.token_type,
                'oauth.discord.token.expires_in': oauth.expires_in,
                'oauth.discord.token.refresh_token': oauth.refresh_token,
                'oauth.discord.token.scope': oauth.scope,
            }
        })
        .exec();
    }

    async clearOauthDiscord(userId) {
        await this.userModel.updateOne({
            _id: userId
        }, {
            $set: {
                'oauth.discord.userId': null,
                'oauth.discord.token': {}
            }
        })
        .exec();
    }
}