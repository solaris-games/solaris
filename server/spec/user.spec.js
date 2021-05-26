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
        return userList.find(x => x.email == user.email);
    },
    updateOne(user) {
        return user;
    }
};

describe('user', () => {
    let service;

    beforeAll(() => {
        service = new UserService(fakeUserModel, fakeBcrypt);

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

    it('should get a user by ID', async (done) => {
        let result = await service.getById(2);

        expect(result._id).toBe(2);

        done();
    });

    it('should check if a user exists', async (done) => {
        let result = await service.userExists('test@test.com');

        expect(result).toBeTruthy();

        done();
    });

    it('should check if a user exists in a different case', async (done) => {
        let result = await service.userExists('tesT@test.com');

        expect(result).toBeTruthy();

        done();
    });


    it('should check if a user does not exist', async (done) => {
        let result = await service.userExists('fffff');

        expect(result).toBeFalsy();

        done();
    });

    it('should fail to update the password of a user if the passwords do not match', async (done) => {
        let userId = 1;
        let oldPassword = 'yyyy';
        let newPassword = 'xxxx';

        try {
            await service.updatePassword(userId, oldPassword, newPassword);

            done();
        } catch (err) {
            expect(err.message).toBe('The current password is incorrect.');

            done();
        }
    });

});
