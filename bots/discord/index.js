const config = require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

const mongooseLoader = require('../../server/loaders/mongoose.js');
const containerLoader = require('../../server/loaders/container.js');

const BotResponseService = require('./services/response.js')
const CommandService = require('./services/command.js')
const PublicCommandService = require('./services/publicCommand.js')
const PrivateCommandService = require('./services/privateCommand.js')

const prefix = process.env.BOT_PREFIX || '$';

let mongo,
    container,
    botResponseService,
    commandService,
    publicCommandService, 
    privateCommandService;

const privateCommands = {
    // This order (alphabetical) is also the order in which the commands are propgrammed in the other js file
}

client.once('ready', () => {
    console.log('-----------------------\nBanning Hyperi0n!\n-----------------------');
});

client.on('message', async (msg) => {
    // Do not respond to bots.
    if (commandService.isBot(msg)) {
        return;
    }

    //non-contenrelated responses; the bot has to react to a message, not for what is in it, but for where it has been sent or whatever non-contentrelated reason. Content may be taken into account later in the function
    // Whether the message is in specialist suggestions is being checked.
    if (msg.channel.id === process.env.CHAT_ID_SPECIALIST_SUGGESTIONS || msg.channel.id === process.env.CHAT_ID_GENERAL_SUGGESTIONS) {
        botResponseService.reactThumbsUp(msg);
        botResponseService.reactThumbsDown(msg);
        return;
    };

    if (commandService.isCommand(msg, prefix)) {
        await executeCommand(msg);
    }
});

async function executeCommand(msg) {
    const command = commandService.identify(msg, prefix);
    
    if (command.type !== 'dm') {
        if (publicCommandService[command.cmd]) {
            await publicCommandService[command.cmd](msg, command.directions);
        }
    } else {
        if (privateCommands[command.cmd]) {
            await privateCommands[command.cmd](msg, command.directions);
        }
    }
}

async function startup() {
    container = containerLoader({}, null);

    botResponseService = new BotResponseService();
    commandService = new CommandService();
    publicCommandService = new PublicCommandService(botResponseService, 
        container.gameGalaxyService, container.gameService, 
        container.leaderboardService, container.userService);
    privateCommandService = new PrivateCommandService();

    console.log('Container Initialized');

    mongo = await mongooseLoader({
        connectionString: process.env.CONNECTION_STRING
    }, {
        syncIndexes: false,
        poolSize: 1
    });

    console.log('MongoDB Intialized');

    client.login(process.env.BOT_TOKEN);

    console.log('Discord Initialized');
}

process.on('SIGINT', async () => {
    console.log('Shutting down...');

    await mongo.disconnect();

    console.log('Shutdown complete.');

    process.exit();
});

startup().then(() => {
    console.log('Ready.');
});
