export default class PasswordService {
    bcryptjs;

    constructor(
        bcryptjs
    ) {
        this.bcryptjs = bcryptjs;
    }

    async hash(password: string, length: number = 10) {
        return await this.bcryptjs.hash(password, length);
    }

    async compare(password1: string, password2: string) {
        return await this.bcryptjs.compare(password1, password2);
    }
};
