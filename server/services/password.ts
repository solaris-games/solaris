export default class PasswordService {
    bcrypt: any;

    constructor(
        bcrypt: any
    ) {
        this.bcrypt = bcrypt;
    }

    async hash(password: string, length: number = 10) {
        return await this.bcrypt.hash(password, length);
    }

    async compare(password1: string, password2: string) {
        return await this.bcrypt.compare(password1, password2);
    }
};
