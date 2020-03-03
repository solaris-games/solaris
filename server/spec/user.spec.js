const UserService = require('../services/user');

const fakeBcrypt = {
    compare(password1, password2) {
        return password1 == password2;
    },
    hash(password, iterations) {
        return password; // Doesn't need to do anything fancy.
    }
};

let userList = [];

const fakeUserModel = {
    findById(id) {
        return userList.find(x => x._id == id);
    },
    findOne(user) {
        return userList.find(x => x.username == user.username);
    }
};

describe('carrier', () => {
    let service;

    beforeAll(() => {
        service = new UserService(fakeBcrypt, fakeUserModel);

        userList = [
            {
                _id: 1,
                username: 'hello',
                password: 'test',
                save() {
                    return true;
                }
            },
            {
                _id: 2,
                username: 'world',
                password: 'test',
                save() {
                    return true;
                }
            },
        ];
    });

    it('should get the current user by ID', async () => {
        let result = await service.getMe(1);

        expect(result._id).toBe(1);
    });

    it('should get a user by ID', async () => {
        let result = await service.getById(2);

        expect(result._id).toBe(2);
    });

    it('should check if a user exists', async () => {
        let result = await service.userExists('hello');

        expect(result).toBeTruthy();
    });

    it('should check if a user does not exist', async () => {
        let result = await service.userExists('fffff');

        expect(result).toBeFalsy();
    });

    it('should update the email preference of a user', async () => {
        let result = await service.updateEmailPreference(1, true);

        expect(result).toBeTruthy();
        expect(userList[0].emailEnabled).toBeTruthy();
    });

    it('should update the email address of a user', async () => {
        let email = 'test@test.com';

        let result = await service.updateEmailAddress(1, email);

        let user = userList[0];

        expect(result).toBeTruthy();
        expect(user.email).toBe(email);
    });

    it('should update the password of a user', async () => {
        let userId = 1;
        let oldPassword = 'test';
        let newPassword = 'xxxx';

        let result = await service.updatePassword(userId, oldPassword, newPassword);

        let user = userList[0];

        expect(result).toBeTruthy();
        expect(user.password).toBe(newPassword);
    });

    it('should fail to update the password of a user if the passwords do not match', async () => {
        let userId = 1;
        let oldPassword = 'yyyy';
        let newPassword = 'xxxx';

        try {
            await service.updatePassword(userId, oldPassword, newPassword);
        } catch (err) {
            expect(err.message).toBe('The current password is incorrect.');
        }
    });

});
