import { SessionData } from 'express-session';
import { DBObjectId } from '../services/types/DBObjectId';
import UserService from '../services/user';

const fakeBcrypt = {
    compare(password1, password2) {
        return password1 == password2;
    },
    hash(password) {
        return password; // Doesn't need to do anything fancy.
    }
};

let userList: any[] = [];

const fakeUserModel = {

};

const fakeUserRepo = {
    async findById(id) {
        return Promise.resolve(userList.find(x => x._id == id));
    },
    async findOne(user) {
        return Promise.resolve(userList.find(x => x.email == user.email));
    },
    async updateOne(user) {
        return Promise.resolve(user);
    }
};

const fakeSessionService = {
    updateUserSessions(userId: DBObjectId, action: (session: SessionData) => void) {
    }
}

describe('user', () => {
    let service;

    beforeAll(() => {
        // @ts-ignore
        service = new UserService(fakeUserModel, fakeUserRepo, fakeBcrypt, fakeSessionService);

        userList = [
            {
                _id: 1,
                email: 'test@test.com',
                username: 'hello',
                password: 'test',
                save() {
                    return true;
                }
            },
            {
                _id: 2,
                email: 'test2@test.com',
                username: 'world',
                password: 'test',
                save() {
                    return true;
                }
            },
        ];
    });

    // it('should get the current user by ID', async (done) => {
    //     let result = await service.getMe(1);

    //     expect(result._id).toBe(1);

    //     done();
    // });

    it('should get a user by ID', async () => {
        let result = await service.getById(2);

        expect(result._id).toBe(2);
    });

    it('should check if a user exists', async () => {
        let result = await service.userExists('test@test.com');

        expect(result).toBeTruthy();
    });

    it('should check if a user exists in a different case', async () => {
        let result = await service.userExists('tesT@test.com');

        expect(result).toBeTruthy();
    });


    it('should check if a user does not exist', async () => {
        let result = await service.userExists('fffff');

        expect(result).toBeFalsy();
    });

    it('should fail to update the password of a user if the passwords do not match', async () => {
        let userId = 1;
        let oldPassword = 'yyyy';
        let newPassword = 'xxxx';

        try {
            await service.updatePassword(userId, oldPassword, newPassword);
        } catch (err: any) {
            expect(err.message).toBe('The current password is incorrect.');
        }
    });

});
