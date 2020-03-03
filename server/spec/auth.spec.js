const AuthService = require('../services/auth');

const fakeBcrypt = {
    compare(password1, password2) {
        return password1 == password2;
    }
};

const fakeUserModel = {
    findOne(user) {
        return [
            {
                _id: 1,
                username: 'hello',
                password: 'test'
            }
        ].find(x => x.username == user.username);
    }
};

describe('auth', () => {
    let service;

    beforeAll(() => {
        service = new AuthService(fakeBcrypt, fakeUserModel);
    });

    it('should compare passwords of a user', async () => {
        let result = await service.login('hello', 'test');

        expect(result).toBe(1);
    });

    it('should fail if the passwords are not the same', async (done) => {
        try {
            await service.login('hello', 'hello');

            done('Should have thrown an error');
        } catch (err) {
            done();
        }
    });

    it('should fail if the username is not valid', async (done) => {
        try {
            await service.login('test', 'hello');

            done('Should have thrown an error');
        } catch (err) {
            done();
        }
    });

});
