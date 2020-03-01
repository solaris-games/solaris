const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = class UserService {

    async getMe(id) {
        return await User.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            premiumEndDate: 0
        });
    }

    async getById(id) {
        return await User.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            premiumEndDate: 0,
            credits: 0,
            email: 0,
            emailEnabled: 0,
            username: 0
        });
    }

    async create(user, callback) {
        const newUser = new User(user);
    
        newUser.password = await bcrypt.hash(newUser.password, 10);

        let doc = await newUser.save();

        return doc._id;
    }

    async userExists(username, callback) {
        let user = await User.findOne({
            username: username
        });

        return user != null;
    }

    async updateEmailPreference(id, preference, callback) {
        let user = await User.findById(id);

        user.emailEnabled = preference;

        await user.save();
    }

    async updateEmailAddress(id, email, callback) {
        let user = await User.findById(id);
        
        user.email = email;

        await user.save();
    }

    async updatePassword(id, currentPassword, newPassword, callback) {
        let user = await User.findById(id);
        
        // Make sure the current password matches.
        let result = await bcrypt.compare(currentPassword, user.password);

        if (result) {
            // Update the current password to the new password.
            let hash = await bcrypt.hash(newPassword, 10);
            
            user.password = hash;

            await user.save();
        } else {
            throw new Error('The current password is incorrect.');
        }
    }

    clearData(callback) {
        User.deleteMany({}, callback);
    }

};
