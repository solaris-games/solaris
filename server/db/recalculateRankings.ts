import config from '../config';
import mongooseLoader from '../loaders/mongoose';
import containerLoader from '../loaders/container';
import { DependencyContainer } from '../types/DependencyContainer';

let mongo,
    container: DependencyContainer;

async function startup() {
    mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1
    });

    container = containerLoader(config, null);
    
    console.log('Recalculating all player ranks...');

    console.log(`Resetting users...`);
    await container.userService.userRepo.updateMany({}, {
        $set: {
            'achievements.rank': 0,
            'achievements.eloRating': null,
            'achievements.victories': 0,
            'achievements.completed': 0,
            'achievements.badges.victor32': 0
        }
    });
    console.log(`Done.`);

    let users = await container.userService.userRepo.find({});

    console.log(`Total users: ${users.length}`);

    let dbQuery = {
        'state.endDate': { $ne: null }
    };

    let total = (await container.gameService.gameRepo.count(dbQuery));

    console.log(`Recalculating rank for ${total} games...`);
    
    let page = 0;
    let pageSize = 10;
    let totalPages = Math.ceil(total / pageSize);

    do {
        let games = await container.gameService.gameRepo.find(dbQuery, {},
        { _id: 1 },
        pageSize,
        pageSize * page);

        for (let game of games) {
            container.gameTickService._tryAwardEndGameRank(game, users, false);
        }

        page++;

        console.log(`Page ${page}/${totalPages}`);
    } while (page < totalPages);

    console.log(`Done.`);

    let dbWrites = users.map(user => {
        return {
            updateOne: {
                filter: {
                    _id: user._id
                },
                update: {
                    'achievements.rank': user.achievements.rank,
                    'achievements.eloRating': user.achievements.eloRating,
                    'achievements.victories': user.achievements.victories,
                    'achievements.completed': user.achievements.completed,
                    'achievements.badges.victor32': user.achievements.badges['victor32']
                }
            }
        }
    });

    console.log(`Updating users...`);
    await container.userService.userRepo.bulkWrite(dbWrites);
    console.log(`Users updated.`);
}

process.on('SIGINT', async () => {
    await shutdown();
});

async function shutdown() {
    console.log('Shutting down...');

    await mongo.disconnect();

    console.log('Shutdown complete.');
    
    process.exit();
}

startup().then(async () => {
    console.log('Done.');

    await shutdown();
}).catch(async err => {
    console.error(err);

    await shutdown();
});

export {};
