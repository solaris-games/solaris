/*
    Setting up games for UI testing is tedious, so here we automate it.
*/

const env = require('dotenv').config();

const db = require('../db/connection')

const userHelper = require('../user');
const gameHelper = require('../game');

function setupTestEnvironment(callback) {
    // Clear all data.
    console.log('Clearing database...');

    gameHelper.clearData((err) => {
        if (err) {
            return callback(err);
        }

        userHelper.clearData((err) => {
            if (err) {
                return callback(err);
            }

            console.log('Database cleared.');
            console.log('Creating first user...');
            
            // Create 2 users.
            userHelper.create({
                email: 'test1@test.com',
                username: 'test1',
                password: 'test1'
            }, (err, user1) => {
                if (err) {
                    return callback(err);
                }

                console.log('First user created.');
                console.log('Creating second user...');
    
                userHelper.create({
                    email: 'test2@test.com',
                    username: 'test2',
                    password: 'test2'
                }, (err, user2) => {
                    if (err) {
                        return callback(err);
                    }

                    console.log('Second user created.');
                    console.log('Creating game...');
        
                    // Get the default settings for a game.
                    let defaultSettings = require('../db/misc/defaultGameSettings.json');
                    let gameSettings = defaultSettings.settings;

                    // Most basic game settings possible.
                    gameSettings.general.name = 'Test';
                    gameSettings.general.description = 'Test Game';
                    gameSettings.general.playerLimit = 2;
                    
                    // Create a 2 player game hosted by Player 1.
                    gameHelper.create(gameSettings, (err, game) => {
                        if (err) {
                            return callback(err);
                        }

                        console.log('Game created.');
            
                        return callback(null);
                    });
                });
            });
        });
    });
}

console.log('Connecting to DB...');

db.connect({
    connectionString: process.env.CONNECTION_STRING
})
.then(() => {
    console.log('Connected.');

    setupTestEnvironment(err => {
        if (err) {
            console.error(err);
        } else {
            console.log('Complete.');
        }
    });
})
.catch(err => {
    console.error(err);
});
