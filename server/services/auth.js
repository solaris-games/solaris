const ValidationError = require('../errors/validation');

module.exports = class AuthService {
    
    constructor(bcrypt, userModel) {
        this.bcrypt = bcrypt;
        this.userModel = userModel;
    }

    async login(username, password) {
        // Try to find the user by username
        let user = await this.userModel.findOne({
            username: username
        });
        
        if (!user) {
            throw new ValidationError('The username or password is incorrect.');
        }

        // Compare the passwords and if they match then the user is authenticated.
        let result = await this.bcrypt.compare(password, user.password);

        if (result) {
            return user._id;
        } else {
            throw new ValidationError('The username or password is incorrect.');
        }
    }
}