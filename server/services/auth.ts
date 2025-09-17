import EventEmitter from 'events';
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { User } from './types/User';
import PasswordService from './password';

export default class AuthService extends EventEmitter {
    userRepo: Repository<User>;
    passwordService: PasswordService;
    
    constructor(
        userRepo: Repository<User>,
        passwordService: PasswordService
    ) {
        super();

        this.userRepo = userRepo;
        this.passwordService = passwordService;
    }

    async login(email: string, password: string) {
        email = email.trim();
        email = email.toLowerCase();

        // Try to find the user by email
        let user = await this.userRepo.findOne({
            email
        }, {
            username: 1,
            password: 1,
            banned: 1,
            roles: 1,
            credits: 1
        });
        
        if (!user) {
            throw new ValidationError('The email address or password is incorrect.');
        }

        if (user.banned) {
            throw new ValidationError('The account has been banned.');
        }

        if (user.password == null) {
            return user;
        }

        // Compare the passwords and if they match then the user is authenticated.
        let result = await this.passwordService.compare(password, user.password);

        if (result) {
            return user;
        } else {
            throw new ValidationError('The email address or password is incorrect.');
        }
    }
}