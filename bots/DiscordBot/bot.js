const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('dotenv').config();

const prefix = '$'
let publicCommands = null;
const privateCommands = {
    // This order (alphabetical) is also the order in which the commands are propgrammed in the other js file
}

client.once('ready', () => {
    console.log('-----------------------\nBanning Hyperi0n!\n-----------------------');
});

client.on('message', async (msg) => {
    //checking if the message isn't sent by another/the same bot, because the bot may not respond or react to a bot
    if (msg.author.bot) return;

    //non-contenrelated responses; the bot has to react to a message, not for what is in it, but for where it has been sent or whatever non-contentrelated reason. Content may be taken into account later in the function
    // Whether the message is in specialist suggestions is being checked, that id is 841270805920088084
    if (msg.channel.id === '841270805920088084') {
        await Specialist_Suggestion(msg)
        return;
    };

    //Now that the message doesn't need a response for non-contentrelated issues, it needs a prefix before we respond, therefore we check whether or not it has a prefix
    if (!msg.content.startsWith(prefix)) return;

    //Now that we know for certain the player desires to write a command, we can activate the function to figure out which command the player is using to then decide what the proper response is
    await Identify_Command(msg);
});

client.on('messageReactionAdd', (MessageReaction, User) => {
    let msg = MessageReaction.message

    if (!msg.author.bot || User.bot) return;
});

async function Specialist_Suggestion(msg) {
    // The function that places the appropriate reactions to the specialists that can be voted upon.
    //Later this can be improved by also checking if the specialist suggestions actually has the right format, if not, delete it after sending a copy to the specific player in DMs 
    msg.react('👍');
    msg.react('👎');
}

async function Identify_Command(msg) {
    //Splitting the command into the different parts, the command and directions. After that checking if the command exists
    const directions = msg.content.slice(prefix.length).split(' ');
    const cmd = directions[0];
    directions.shift();
    if (msg.channel.type !== 'dm') {
        // Now that the command exists, we can execute the function, which so happens to be named exactly like the command
        if (container.publicCommandService[cmd]) {
            await container.publicCommandService[cmd](msg, directions);
        }
    } else {
        if (!privateCommands[cmd]) return;
        // Now that the command exists, we can execute the function, which so happens to be named exactly like the command
        await privateCommands[cmd](msg, directions);
    }
}

const mongooseLoader = require('../../server/loaders/mongoose.js');
const containerLoader = require('../../server/loaders/container.js');

let mongo;
let container;

async function startup() {
    container = containerLoader({}, null);

    mongo = await mongooseLoader({
        connectionString: process.env.connectionString
    }, {
        syncIndexes: false
    });

    console.log('MongoDB Intialized');

    publicCommands = {
        // This order (alphabetical) is also the order in which the commands are propgrammed in the other js file
        "gameinfo": container.publicCommandService.gameinfo,
        "help": container.publicCommandService.help,
        //invite (with the settings: Mode, Players, Anonymity, TB/RT, Galaxy type, SPP, (time per tick/turn), ticks per cycle, specialist currency, Dark Galaxy, Trade credits, Trade Scanning)
        "leaderboard_global": container.publicCommandService.leaderboard_global,
        "leaderboard_local": container.publicCommandService.leaderboard_local,
        "userinfo": container.publicCommandService.userinfo
    }
}

process.on('SIGINT', async () => {
    console.log('Shutting down...');

    await mongo.disconnect();

    console.log('Shutdown complete.');

    process.exit();
});

startup().then(() => {
    client.login(process.env.BOT_TOKEN);
    console.log('Jobs started.');
});
