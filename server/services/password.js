module.exports = class PasswordService {

    constructor(bcrypt) {
        this.bcrypt = bcrypt;
    }

    async hash(password) {
        return await this.bcrypt.hash(password, 10);
    }

    compare(password1, password2) {
        return await this.bcrypt.compare(password1, password2);
    }
};
