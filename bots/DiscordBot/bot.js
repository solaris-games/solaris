const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('dotenv').config();

const prefix = '$'

//readying the public and private commands for later specification, so they can be compared to what the player gives
let publicCommands = null;
const privateCommands = {
    // This order (alphabetical) is also the order in which the commands are propgrammed in the other js file
}

client.once('ready', () => {
    //signalling that the bot is ready to go
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
    //in the future, the bot could respond in case you might add a reaction to a certain message, like a message that gives you a role when you react.
    //this piece of code prepares for this future instance where we might want it, though it is not used now.
    let msg = MessageReaction.message

    if (!msg.author.bot || User.bot) return;
});

async function Specialist_Suggestion(msg) {
    // The function that places the appropriate reactions to the specialists that can be voted upon.
    msg.react('👍');
    msg.react('👎');
}

async function Identify_Command(msg) {
    //Splitting the command into the different parts, the command and directions. After that checking if the command exists
    const directions = msg.content.slice(prefix.length).split(' ');
    const cmd = directions[0];
    directions.shift();
    if (msg.channel.type !== 'dm') {
        //the check in the if statement is there so we can see if we want to check the private or the public commands, one side of the if statement for each.

        // Now that the command exists, we can execute the function, which so happens to be named exactly like the command
        if (container.publicCommandService[cmd]) {
            await container.publicCommandService[cmd](msg, directions);
        }
    } else {
        if (!container.privateCommandService[cmd]) return;
        // Now that the command exists, we can execute the function, which so happens to be named exactly like the command
        await container.privateCommandsService[cmd](msg, directions);
    }
}

//creating the connection with the mongoose databases and the container with all other programs that we will need
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
        //These are all commands, so it can be checked whether they exist and what redirect is required.
        "gameinfo": container.publicCommandService.gameinfo,
        "help": container.publicCommandService.help,
        "invite": container.publicCommandService.invite,
        "leaderboard_global": container.publicCommandService.leaderboard_global,
        "leaderboard_local": container.publicCommandService.leaderboard_local,
        "userinfo": container.publicCommandService.userinfo
    }

    privateCommands = {
        //To be expanded when required;
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
