import AuthService from '../services/auth';

const fakeBcrypt = {
    compare(password1: string, password2: string) {
        return password1 == password2;
    }
};

const fakeUserModel = {
    async findOne(user) {
        return Promise.resolve([
            {
                _id: 1,
                email: 'test@test.com',
                username: 'hello',
                password: 'test'
            }
        ].find(x => x.email == user.email));
    }
};

describe('auth', () => {
    let service;

    beforeAll(() => {
        // @ts-ignore
        service = new AuthService(fakeUserModel, fakeBcrypt);
    });

    it('should compare passwords of a user', async () => {
        let result = await service.login('test@test.com', 'test');

        expect(result._id).toBe(1);
    });

    it('should fail if the passwords are not the same', async () => {
        try {
            await service.login('test@test.com', 'hello');

            throw new Error('Should have thrown an error');
        } catch (err) {
            
        }
            
    });

    it('should fail if the email is not valid', async () => {
        try {
            await service.login('test', 'hello');

            throw new Error('Should have thrown an error');
        } catch (err) {
            
        }
    });

});
