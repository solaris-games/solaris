const Game = require('./db/models/Game');

module.exports = {

    listOfficialGames() {
        return Promise.resolve([
            {
                _id: 1,
                name: 'New Player Game',
                description: 'Test official game',
                playerLimit: 8,
                playerCount: 2
            }
        ]);
    },

    listUserGames() {
        return Promise.resolve([
            {
                _id: 1,
                name: 'Test User Game',
                description: 'Test user game',
                playerLimit: 8,
                playerCount: 2
            }
        ]);
    },

    getById(id) {
        return Promise.resolve({
            _id: id,
            name: 'Test Game',
            description: 'Test game',
            playerLimit: 8,
            playerCount: 2
        });
    },

};
