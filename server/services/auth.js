const ValidationError = require('../errors/validation');

module.exports = class AuthService {
    
    constructor(bcrypt, userModel) {
        this.bcrypt = bcrypt;
        this.userModel = userModel;
    }

    async login(email, password) {
        email = email.trim();

        // Try to find the user by email
        let user = await this.userModel.findOne({
            email
        });
        
        if (!user) {
            throw new ValidationError('The email address or password is incorrect.');
        }

        // Compare the passwords and if they match then the user is authenticated.
        let result = await this.bcrypt.compare(password, user.password);

        if (result) {
            return user._id;
        } else {
            throw new ValidationError('The email address or password is incorrect.');
        }
    }
}