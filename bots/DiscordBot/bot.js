const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('dotenv').config();

const prefix = '!'
const commands = {
    // This order (alphabetical) is also the order in which the commands are propgrammed in the second section
    "gameinfo": gameinfo,
    "help": help,
    "leaderboard_global": leaderboard_global,
    "leaderboard_local": leaderboard_local,
    "userinfo": userinfo
};

client.once('ready', () => {
    console.log('-----------------------\nBanning Hyperi0n!\n-----------------------');
});

client.on('message', async (msg) => {

    //checking if the message isn't sent by another/the same bot, because the bot may not respond or react to a bot
    if (msg.author.bot) return;

    //non-contenrelated responses; the bot has to react to a message, not for what is in it, but for where it has been sent or whatever non-contentrelated reason. Content may be taken into account later in the function
    // Whether the message is in specialist suggestions is being checked, that id is 841270805920088084
    if (msg.channel.id === '841270805920088084') {
        Specialist_Suggestion(msg)
    };

    //Now that the message doesn't need a response for non-contentrelated issues, it needs a prefix before we respond, therefore we check whether or not it has a prefix
    if (!msg.content.startsWith(prefix)) return;

    //Now that we know for certain the player desires to write a command, we can activate the function to figure out which command the player is using to then decide what the proper response is
    await Identify_Command(msg);

})


function Specialist_Suggestion(msg) {
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
    if (!commands.keys().includes(cmd)) return;


    // Now that the command exists, we can execute the function, which so happens to be named exactly like the command
    await commands[cmd](msg, directions);
}

async function gameinfo(msg, directions) {
    //!gameinfo <galaxy_name> <focus>
    let gameId = '...'; // TODO: Extract from message
    let userId = null;

    let info = await container.gameService.getByIdInfo(gameId, userId);

    // Send message back to discord
}

async function help(msg, directions) {
    //!help <command>
    id = msg.author.id;

    if (directions.length == 0) {
        msg.channel.send(`Hey <@${id}>,\n` +
            "You can use the following commands in this discord:\n" +
            "``!gameinfo <galaxy_name> <focus>`` - get information about the settings of a galaxy.\n" +
            "``!help <command>`` - get a list of all commands, or more specific information about a command when you add a <command>.\n" +
            "``!leaderboard_global <filter>`` - rank all players over all games they have played based on certain criteria, like wins, losses, ships killed and more.\n" +
            "``!leaderboard_local <galaxy_name> <filter>`` - rank players in a galaxy based on a certain criteria, like stars, economy, ships and more.\n" +
            "``!userinfo <username> <focus>`` - get information about a user, like rank, renown or made economy.\n" +
            "I hope this automated response has helped you in understanding commands for the bot. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.")
    } else {
        switch (directions[0]) {
            case gameinfo:
                msg.channel.send(`Hey <@${id}>,\n` +
                    "The ``!gameinfo <galaxy_name> <focus>`` command gives you information about the settings of a completed, in progress or waiting game.\n" +
                    "The first direction, the <galaxy_name>, is the name of the game you want to know the settings of. You can find this name in the top left of the screen when you are in the game. If however the galaxy name is not unique, you will be asked to use the galaxy-id instead, this is a unique code that can be found at the end of the url when you are in the game.\n" +
                    "The second direction, the <focus>, asks what kind of settings you want to know of. There are five kinds of settings.\n" +
                    "If you want to see all settings, use ``all``.\n" +
                    "If you want to see the general settings, such as the stars required for victory, playerLimit, anonymity and more, use ``general``.\n" +
                    "If you want to see the galaxy settings, such as carrier cost, warpgate cost, specialist cost and more, use ``galaxy``.\n" +
                    "If you want to see the player settings, such as the starting conditions and trading conditions, use ``player``.\n" +
                    "If you want to see the technology settings, such as the starting technologies and their cost, use ``technology``.\n" +
                    "If you want to see the time settings, such as the tick/turn duration or whether or not a game is real time, use ``time``.\n" +
                    "I hope this automated response has helped you in understanding the gameinfo command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.");
                break;
            case help:
                msg.channel.send(`Hey <@${id}>,\n` +
                    "The ``!help <command>`` command gives you information about the commands you can give this bot. " +
                    "Using just the command without a direction will give you a list of all commands with a short explanation of what they do. " +
                    "Using the command with a direction, the ``<command>`` gets you a more detailed explanation of a command and its directions.\n" +
                    "But you probably already knew that, since you used the ``!help help`` command.\n" +
                    "I hope this automated response has helped you in understanding the help command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.")
                break;
            case leaderboard_global:
                msg.channel.send(`Hey <@${id}>,\n` +
                    "the ``!leaderboard_global <filter> command gives you the top 50 within a certain filter.\n" +
                    "These filters can be almost anything, the full list of possible filters is: ``victories``, ``rank``, ``renown``, games ``joined``, games ``completed``, games ``quit``, games ``defeated``, games ``afk``, " +
                    "``ships-killed``, ``carriers-killed``, ``specialists-killed``, ``ships-lost``, ``carriers-lost``, ``specialists-lost``, ``stars-captured``, ``stars-lost``, " +
                    "``economy`` built, ``industry`` built, ``science`` built, ``warpgates-built``, ``warpgates-destroyed``, ``carriers-built``, ``specialists-hired``, ``scanning`` researched, ``hyperspace`` range researched, ``terraforming`` researched, " +
                    "``experimentation`` researched, ``weapons`` researched, ``banking`` researched, ``manufacturing`` researched, ``specialists`` researched, ``credits-sent``, ``credits-received``, ``technologies-sent``, ``technologies-received``, " +
                    "``ships-gifted``, ``ships-received`` and ``renown-sent``.\n" +
                    "Remember to use the word in the ``code-block`` as the word for the filter.\n" +
                    "I hope this automated response has helped you in understanding the leaderboard_global command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.");
                break;
            case leaderboard_local:
                msg.channel.send(`Hey <@${id}>,\n` +
                    "The ``!leaderboard_local <galaxy_name> <filter>`` gives you a leaderboard of the game you name based on a filter you supplied.\n" +
                    "The first direction, the <galaxy_name>, is the name of the game you want to know the settings of. You can find this name in the top left of the screen when you are in the game. If however the galaxy name is not unique, you will be asked to use the galaxy-id instead, this is a unique code that can be found at the end of the url when you are in the game.\n" +
                    "The second direction, the <filter>, is what the leaderboard will be sorted on. The full list of possible filters is: total ``stars``, total ``carriers``, total ``ships``, total ``economy``, total ``industry``, " +
                    "total ``science``, ``new-ship`` production, total ``warpgates``, ``scanning`` level, ``hyperspace`` range level, ``terraforming`` level, ``experimentation`` level, ``weapons`` level, ``banking`` level, " +
                    "``manufacturing`` level and ``specialists`` level.\n" +
                    "Remember to use the word in the ``code-block`` as the word for the filter.\n" +
                    "I hope this automated response has helped you in understanding the leaderboard_local command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.");
                break;
            case userinfo:
                msg.channel.send(`Hey <@${id}>,\n` +
                    "The ``!userinfo <username> gives you a profile of the player with lot's of information. This information can also be found at https://solaris.games/#/account/achievements/<user_ID>.\n" +
                    "The first direction, the <username>, is the name of a user, like The Last Hero, or LimitingFactor, the username is case-sensitive, so make sure to spell it properly.\n" +
                    "The second direction, the <focus>, is the category you want information on. There are five categories:\n" +
                    "If you want to see all information about someone, use ``all``.\n" +
                    "If you want to see information about someone's played games, such as victories, completed games or how often he went afk, use ``games``.\n" +
                    "If you want to see information about someone's military accomplishments, such as ships killed, ships lost or stars killed, use ``military``.\n" +
                    "If you want to see information about someone's infastructure, such as built economy, industry, science and warpgates, use ``infastructure``.\n" +
                    "If you want to see information about someone's research, such as points spent in scanning, hyperspace, terraforming, use ``research``.\n" +
                    "If you want to see information about someone's trade history, such as credits sent, technologies sent, ships gifted or even renown gifted, use ``trade``.\n" +
                    "I hope this automated response has helped you in understanding the userinfo command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.");
                break;
            default:
                msg.channel.send(`Hey <@${id}>,\n` +
                    "It seems like the command you are looking up isn't registered in our list. Do ``!help`` to get a full list of all commands.\nIf you belief that this is a bug, please contact @Tristanvds#9505.")
        }

    }
}

async function leaderboard_global(msg, directions) {
    //!leaderboard_global <filter>
    let limit = 10;
    let sortingKey = directions[0]; // Extract from message somehow

    let leaderboard = await container.leaderboardService.getLeaderboard(limit, sortingKey);

    // Send message back to discord.
}

async function leaderboard_local(msg, directions) {
    //!leaderboard_local <galaxy_name> <filter>
    // TODO: We don't have anything that does this yet.
}

async function userinfo(msg, directions) {
    //!userinfo <username>
    let userId = ''; // Extract from message

    let user = await container.userService.getInfoByIdLean(req.params.id);

    // Send message back to discord
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
        syncIndexes: true
    });

    console.log('MongoDB Intialized');
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
