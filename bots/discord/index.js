const config = require('dotenv').config({path:__dirname + '/.env'});

const Discord = require('discord.js');
const client = new Discord.Client();

const mongooseLoader = require('../../server/loaders/mongoose.js');
const containerLoader = require('../../server/loaders/container.js');

const BotResponseService = require('./services/response.js');
const BotHelperService = require('./services/botHelper.js');
const CommandService = require('./services/command.js');
const ReactionService = require('./services/reaction.js');
const PublicCommandService = require('./services/publicCommand.js');
const PrivateCommandService = require('./services/privateCommand.js');

const prefix = process.env.BOT_PREFIX || '$';

let mongo,
    container,
    botResponseService,
    botHelperService,
    commandService,
    reactionService,
    publicCommandService,
    privateCommandService;

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
    if([process.env.CHAT_ID_GENERAL_SUGGESTIONS, process.env.CHAT_ID_SPECIALIST_SUGGESTIONS, process.env.CHAT_ID_POLLS].includes(msg.channel.id)) {
        await contentUnrelated(msg);
    }

    if (commandService.isCommand(msg, prefix)) {
        await executeCommand(msg);
    }
});

async function contentUnrelated(msg) {
    let suggestionChannels = [process.env.CHAT_ID_SPECIALIST_SUGGESTIONS, process.env.CHAT_ID_GENERAL_SUGGESTIONS];

    if (suggestionChannels.includes(msg.channel.id)) {
        await reactionService.thumbsUpDown(msg);
    }

    if (msg.channel.id === process.env.CHAT_ID_POLLS) {
        await reactionService.messageEmojis(msg);
    }
}

async function executeCommand(msg) {
    const command = commandService.identify(msg, prefix);

    if (command.type === 'text') { // A normal server channel
        if (publicCommandService[command.cmd] && commandService.isCorrectChannel(msg, command.cmd)) {
            //Executes the command, and then deletes the message that ordered it
            await publicCommandService[command.cmd](msg, command.directions);

            msg.delete();
        }
    } else if (command.type === 'dm') { // A chat with one specific person
        if (privateCommandService[command.cmd]) {
            await privateCommandService[command.cmd](msg, command.directions);

            msg.delete();
        }
    }
}

async function startup() {
    container = containerLoader({}, null);

    botResponseService = new BotResponseService();
    botHelperService = new BotHelperService();
    commandService = new CommandService();
    reactionService = new ReactionService();
    publicCommandService = new PublicCommandService(botResponseService, botHelperService,
        container.gameGalaxyService, container.gameService, 
        container.leaderboardService, container.userService, container.gameTypeService);
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
