module.exports = class UserService {
    constructor(bcrypt, userModel) {
        this.bcrypt = bcrypt;
        this.userModel = userModel;
    }

    async getMe(id) {
        return await this.userModel.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            premiumEndDate: 0
        });
    }

    async getById(id) {
        return await this.userModel.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            premiumEndDate: 0,
            credits: 0,
            email: 0,
            emailEnabled: 0,
            username: 0
        });
    }

    async create(user) {
        const newUser = new userModel(user);
    
        newUser.password = await this.bcrypt.hash(newUser.password, 10);

        let doc = await newUser.save();

        return doc._id;
    }

    async userExists(username) {
        let user = await this.userModel.findOne({
            username: username
        });

        return user != null;
    }

    async updateEmailPreference(id, preference) {
        let user = await this.userModel.findById(id);

        this.userModel.emailEnabled = preference;

        await this.userModel.save();
    }

    async updateEmailAddress(id, email) {
        let user = await this.userModel.findById(id);
        
        this.userModel.email = email;

        await this.userModel.save();
    }

    async updatePassword(id, currentPassword, newPassword) {
        let user = await this.userModel.findById(id);
        
        // Make sure the current password matches.
        let result = await this.bcrypt.compare(currentPassword, this.userModel.password);

        if (result) {
            // Update the current password to the new password.
            let hash = await this.bcrypt.hash(newPassword, 10);
            
            this.userModel.password = hash;

            await this.userModel.save();
        } else {
            throw new Error('The current password is incorrect.');
        }
    }

    async clearData() {
        await this.userModel.deleteMany({});
    }

};
