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
    //!gameinfo <galaxy_name> <focus> ("ID")
    let game = [];
    var focus;
    let game_name = "";
    let gameId = "";
    if(directions[directions.length-1] == "ID"){
        game = await container.gameService.getByIdAll(directions[0])
        focus = directions[directions.length-2]
    } else {
        var i;
        for(i=0;i<directions.length-1;i++) {
        game_name += direction[i] + ' ';
        }
        game_name = game_name.slice(0, -1)
        game = await container.gameService.getByNameAll(game_name);
        focus = directions[directions.length-1]
    }

    var NameUniquenessVar = game.length
    if(NameUniquenessVar != 1) {
        if(NameUniquenessVar == 0) {
            msg.channel.send(`Hey <@${msg.author.id}>,\n`+
            "No game was found with this name, check if you spelled it correctly")
            return;
        } else {
            msg.channel.send(`Hey <@${msg.author.id},\n`+
            `Multiple games were found with this name, instead of using the name for this you can use the gameID, which can be found in the link to the game: https://solaris.games/#/game?id=**<gameID>**.\n
            If you do this, add the word "ID" after the filter, as an extra direction.`)
            return;
        }
    }

    game_name = game.settings.general.name;
    gameId = game._id;

    let response = new Discord.MessageEmbed()
    .setColor(`#2d139d`)
    .setURL(`https://solaris.games/#/game?id=${gameId}`)
    .setAuthor(`Solaris`, `https://i.imgur.com/u9fOv2B.png?1`, `https://github.com/mike-eason/solaris/graphs/contributors`)
    .setThumbnail(`https://i.imgur.com/INmYa7P.png?1`)
    .setTimestamp()
    .setFooter('Sponsored by Solaris', 'https://i.imgur.com/INmYa7P.png?1');
    if(game.settings.general.description){
        response = response
        .setDescription(game.settings.general.description);
    }

    switch (focus) {
        case "all":
            response = response
            .setTitle(`All settings of ${game_name}`)
            .addFields(
                {name: "General", value: "\u200B"},
                {name: "Type", value: game.settings.general.type, inline: true},
                {name: "Mode", value: game.settings.general.mode, inline: true},
                {name: "Featured", value: game.settings.general.featured ? "true":"false", inline: true},//next line
                {name: "Star % for Victory", value: game.settings.general.starVictoryPercentage, inline: true},
                {name: "Maximum Players", value: game.settings.general.playerLimit, inline: true},
                {name: "Anonymity", value: game.settings.general.anonymity, inline: true},//next line
                {name: "Online Status", value: game.settings.general.playerOnlineStatus, inline: true},
                {name: "Time Machine", value: game.settings.general.timeMachine, inline: true},
                {name: "\u200B", value: "\u200B"},
                {name: "Galaxy", value: "\u200B"},
                {name: "Galaxy Type", value: game.settings.galaxy.galaxyType, inline: true},
                {name: "Stars per Player", value: game.settings.galaxy.starsPerPlayer, inline: true},
                {name: "Ticks per Cycle", value: game.settings.galaxy.productionTicks, inline: true}, //next line
                {name: "Carrier Cost", value: game.settings.specialGalaxy.carrierCost, inline: true},
                {name: "Carrier Upkeep", value: game.settings.specialGalaxy.carrierUpkeepCost, inline: true},
                {name: "Carrier Speed", value: game.settings.specialGalaxy.carrierSpeed, inline: true},//next line
                {name: "Warpgate Cost", value: game.settings.specialGalaxy.warpgateCost, inline: true},
                {name: "Random Warpgates", value: game.settings.specialGalaxy.randomGates, inline: true},
                {name: "Specialist Cost", value: game.settings.specialGalaxy.specialistCost, inline: true},//next line
                {name: "Specialist Currency", value: game.settings.specialGalaxy.specialistsCurrency, inline: true},
                {name: "Dark Galaxy", value: game.settings.specialGalaxy.darkGalaxy, inline: true},
                {name: "Defender Bonus", value: game.settings.specialGalaxy.defenderBonus, inline: true},//next line
                {name: "Carrier to Carrier Combat", value: game.settings.specialGalaxy.carrierToCarrierCombat, inline: true},
                {name: "Resource Distribution", value: game.settings.specialGalaxy.resourceDistribution, inline: true},
                {name: "Player Distribution", value: game.settings.specialGalaxy.playerDistribution, inline: true},
                {name: "\u200B", value: "\u200B"},
                {name: "Player", value: "\u200B"},
                {name: "Starting Stars", value: game.settings.player.startingStars, inline: true},
                {name: "Starting Ships", value: game.settings.player.startingShips, inline: true},
                {name: "\u200B", value: "\u200B", inline: true},//next line
                {name: "Starting Economy", value: game.settings.player.startingInfrastructure.economy, inline: true},
                {name: "Starting Industry", value: game.settings.player.startingInfrastructure.industry, inline: true},
                {name: "Starting Science", value: game.settings.player.startingInfrastructure.science, inline: true},//next line
                {name: "Economy Cost", value: game.settings.player.developmentCost.economy, inline: true},
                {name: "Industry Cost", value: game.settings.player.developmentCost.industry, inline: true},
                {name: "Science Cost", value: game.settings.player.developmentCost.science, inline: true},//next line
                {name: "Starting Credits", value: game.settings.player.startingCredits, inline: true},
                {name: "Starting Specialist Tokens", value: game.settings.player.startingCreditsSpecialists, inline: true},
                {name: "Trade Scanning", value: game.settings.player.tradeScanning, inline: true},//next line
                {name: "Trade Credits", value: game.settings.player.tradeCredits ? "true":"false", inline: true},
                {name: "Trade Specialist Tokens", value: game.settings.player.tradeCreditsSpecialists ? "true":"false", inline: true},
                {name: "Trade Technology Cost", value: game.settings.player.tradeCost, inline: true},
                {name: "\u200B", value: "\u200B"},
                {name: "Technology", value: "\u200B"},
                {name: "Scanning", value: game.settings.technology.startingTechnologyLevel.scanning, inline: true},
                {name: "Hyperspace Range", value: game.settings.technology.startingTechnologyLevel.hyperspace, inline: true},
                {name: "Terraforming", value: game.settings.technology.startingTechnologyLevel.terraforming, inline: true},//next line
                {name: "Experimentation", value: game.settings.technology.startingTechnologyLevel.experimentation, inline: true},
                {name: "Weapons", value: game.settings.technology.startingTechnologyLevel.weapons, inline: true},
                {name: "Banking", value: game.settings.technology.startingTechnologyLevel.banking, inline: true},//next line
                {name: "Manufacturing", value: game.settings.technology.startingTechnologyLevel.manufacturing, inline: true},
                {name: "Specialists", value: game.settings.technology.startingTechnologyLevel.specialists, inline: true},
                {name: "\u200B", value: "\u200B", inline: true},//next line
                {name: "Scanning", value: game.settings.technology.researchCosts.scanning, inline: true},
                {name: "Hyperspace Range", value: game.settings.technology.researchCosts.hyperspace, inline: true},
                {name: "Terraforming", value: game.settings.technology.researchCosts.terraforming, inline: true},//next line
                {name: "Experimentation", value: game.settings.technology.researchCosts.experimentation, inline: true},
                {name: "Weapons", value: game.settings.technology.researchCosts.weapons, inline: true},
                {name: "Banking", value: game.settings.technology.researchCosts.banking, inline: true},//next line
                {name: "Manufacturing", value: game.settings.technology.researchCosts.manufacturing, inline: true},
                {name: "Specialists", value: game.settings.technology.researchCosts.specialists, inline: true},
                {name: "\u200B", value: "\u200B", inline: true},//next line
                {name: "Banking Reward", value: game.settings.technology.bankingReward},
                {name: "\u200B", value: "\u200B"},
                {name: "Time", value: "\u200B"},
                {name: "Time Type", value: game.settings.gameTime.gameType, inline: true},
                {name: "Start Delay", value: game.settings.gameTime.startDelay, inline: true}
            );
            if(game.settings.gameTime.gameType == 'realTime') {
                response = response.addFields(
                    {name: "Minutes per Tick", value: game.settings.gameTime.speed, inline: true},
                );
            } else {
                response = response.addFields(
                    {name: "Ticks per Turn", value: game.settings.gameTime.turnJumps, inline: true},
                    {name: "Maximum Time per Turn", value: game.settings.gameTime.maxTurnWait, inline: true},
                    {name: "Missed Turn Limit", value: game.settings.gameTime.missedTurnLimit, inline: true}
                );
            }
            break;
        case "general":
            response = response
            .setTitle(`General Settings of ${game_name}`)
            .setFields(
                {name: "General", value: "\u200B"},
                {name: "Type", value: game.settings.general.type, inline: true},
                {name: "Mode", value: game.settings.general.mode, inline: true},
                {name: "Featured", value: game.settings.general.featured ? "true":"false", inline: true},//next line
                {name: "Star % for Victory", value: game.settings.general.starVictoryPercentage, inline: true},
                {name: "Maximum Players", value: game.settings.general.playerLimit, inline: true},
                {name: "Anonymity", value: game.settings.general.anonymity, inline: true},//next line
                {name: "Online Status", value: game.settings.general.playerOnlineStatus, inline: true},
                {name: "Time Machine", value: game.settings.general.timeMachine, inline: true}
            );
            break;
        case "galaxy":
            response = response
            .setTitle(`Galaxy Settings of ${game_name}`)
            .setFields(
                {name: "Galaxy", value: "\u200B"},
                {name: "Galaxy Type", value: game.settings.galaxy.galaxyType, inline: true},
                {name: "Stars per Player", value: game.settings.galaxy.starsPerPlayer, inline: true},
                {name: "Ticks per Cycle", value: game.settings.galaxy.productionTicks, inline: true}, //next line
                {name: "Carrier Cost", value: game.settings.specialGalaxy.carrierCost, inline: true},
                {name: "Carrier Upkeep", value: game.settings.specialGalaxy.carrierUpkeepCost, inline: true},
                {name: "Carrier Speed", value: game.settings.specialGalaxy.carrierSpeed, inline: true},//next line
                {name: "Warpgate Cost", value: game.settings.specialGalaxy.warpgateCost, inline: true},
                {name: "Random Warpgates", value: game.settings.specialGalaxy.randomGates, inline: true},
                {name: "Specialist Cost", value: game.settings.specialGalaxy.specialistCost, inline: true},//next line
                {name: "Specialist Currency", value: game.settings.specialGalaxy.specialistsCurrency, inline: true},
                {name: "Dark Galaxy", value: game.settings.specialGalaxy.darkGalaxy, inline: true},
                {name: "Defender Bonus", value: game.settings.specialGalaxy.defenderBonus, inline: true},//next line
                {name: "Carrier to Carrier Combat", value: game.settings.specialGalaxy.carrierToCarrierCombat, inline: true},
                {name: "Resource Distribution", value: game.settings.specialGalaxy.resourceDistribution, inline: true},
                {name: "Player Distribution", value: game.settings.specialGalaxy.playerDistribution, inline: true},
            );
            break;
        case "player":
            response = response
            .setTitle(`Player Settings of ${game_name}`)
            .setFields(
                {name: "Player", value: "\u200B"},
                {name: "Starting Stars", value: game.settings.player.startingStars, inline: true},
                {name: "Starting Ships", value: game.settings.player.startingShips, inline: true},
                {name: "\u200B", value: "\u200B", inline: true},//next line
                {name: "Starting Economy", value: game.settings.player.startingInfrastructure.economy, inline: true},
                {name: "Starting Industry", value: game.settings.player.startingInfrastructure.industry, inline: true},
                {name: "Starting Science", value: game.settings.player.startingInfrastructure.science, inline: true},//next line
                {name: "Economy Cost", value: game.settings.player.developmentCost.economy, inline: true},
                {name: "Industry Cost", value: game.settings.player.developmentCost.industry, inline: true},
                {name: "Science Cost", value: game.settings.player.developmentCost.science, inline: true},//next line
                {name: "Starting Credits", value: game.settings.player.startingCredits, inline: true},
                {name: "Starting Specialist Tokens", value: game.settings.player.startingCreditsSpecialists, inline: true},
                {name: "Trade Scanning", value: game.settings.player.tradeScanning, inline: true},//next line
                {name: "Trade Credits", value: game.settings.player.tradeCredits ? "true":"false", inline: true},
                {name: "Trade Specialist Tokens", value: game.settings.player.tradeCreditsSpecialists ? "true":"false", inline: true},
                {name: "Trade Technology Cost", value: game.settings.player.tradeCost, inline: true},
            );
            break;
        case "technology": 
            response = response
            .setTitle(`Technology Settings of ${game_name}`)
            .setFields(
                {name: "Technology", value: "\u200B"},
                {name: "Scanning", value: game.settings.technology.startingTechnologyLevel.scanning, inline: true},
                {name: "Hyperspace Range", value: game.settings.technology.startingTechnologyLevel.hyperspace, inline: true},
                {name: "Terraforming", value: game.settings.technology.startingTechnologyLevel.terraforming, inline: true},//next line
                {name: "Experimentation", value: game.settings.technology.startingTechnologyLevel.experimentation, inline: true},
                {name: "Weapons", value: game.settings.technology.startingTechnologyLevel.weapons, inline: true},
                {name: "Banking", value: game.settings.technology.startingTechnologyLevel.banking, inline: true},//next line
                {name: "Manufacturing", value: game.settings.technology.startingTechnologyLevel.manufacturing, inline: true},
                {name: "Specialists", value: game.settings.technology.startingTechnologyLevel.specialists, inline: true},
                {name: "\u200B", value: "\u200B", inline: true},//next line
                {name: "Scanning", value: game.settings.technology.researchCosts.scanning, inline: true},
                {name: "Hyperspace Range", value: game.settings.technology.researchCosts.hyperspace, inline: true},
                {name: "Terraforming", value: game.settings.technology.researchCosts.terraforming, inline: true},//next line
                {name: "Experimentation", value: game.settings.technology.researchCosts.experimentation, inline: true},
                {name: "Weapons", value: game.settings.technology.researchCosts.weapons, inline: true},
                {name: "Banking", value: game.settings.technology.researchCosts.banking, inline: true},//next line
                {name: "Manufacturing", value: game.settings.technology.researchCosts.manufacturing, inline: true},
                {name: "Specialists", value: game.settings.technology.researchCosts.specialists, inline: true},
                {name: "\u200B", value: "\u200B", inline: true},//next line
                {name: "Banking Reward", value: game.settings.technology.bankingReward},
            );
            break;
        case "time":
            response = response
            .setTitle(`Time Settings of ${game_name}`)
            .setFields(
                {name: "Time", value: "\u200B"},
                {name: "Time Type", value: game.settings.gameTime.gameType, inline: true},
                {name: "Start Delay", value: game.settings.gameTime.startDelay, inline: true}
            );
            if(game.settings.gameTime.gameType == 'realTime') {
                response = response.addFields(
                    {name: "Minutes per Tick", value: game.settings.gameTime.speed, inline: true},
                );
            } else {
                response = response.addFields(
                    {name: "Ticks per Turn", value: game.settings.gameTime.turnJumps, inline: true},
                    {name: "Maximum Time per Turn", value: game.settings.gameTime.maxTurnWait, inline: true},
                    {name: "Missed Turn Limit", value: game.settings.gameTime.missedTurnLimit, inline: true}
                );
            }
            break;
        default:
            response = `Hey <@${msg.author.id},\n
            It looks like the focus you specified is not in the list, you can choose between "all", "general", "galaxy", "player", "technology" and "time". If you belief this is a bug, contact @Tristanvds#9505.`
    }

    msg.channel.send(response)

}

async function help(msg, directions) {
    //!help <command>
    id = msg.author.id;

    if (directions.length == 0) {
        msg.channel.send(`Hey <@${id}>,\n` +
            "You can use the following commands in this discord:\n" +
            "``!gameinfo <galaxy_name> <focus>`` - get information about the settings of a galaxy.\n" +
            "``!help <command>`` - get a list of all commands, or more specific information about a command when you add a <command>.\n" +
            "``!leaderboard_global <filter> <limit>`` - rank players over all games they have played based on certain criteria, like wins, losses, ships killed and more.\n" +
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
                    "the ``!leaderboard_global <filter> <limit>`` command gives you the top ``<limit>`` within a certain filter.\n" +
                    "The limit has to be a value between 1 and 50, the leaderboard will return the top x players, where x is that number.\n" +
                    "The filters can be almost anything, the full list of possible filters is: ``victories``, ``rank``, ``renown``, games ``joined``, games ``completed``, games ``quit``, games ``defeated``, games ``afk``, " +
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
    //!leaderboard_global <filter> <limit>
    let limit = directions[1];
    let sortingKey = directions[0];
    if(!(limit >= 1 && limit <= 50)){
        limit = 10;
    };

    // Calculating how the leaderboard looks,
    let leaderboard = await container.leaderboardService.getLeaderboard(limit, sortingKey);

    var position_list = "";
    var username_list = "";
    var sample = Object.keys(leaderboard[0]);
    var nonDesirables = ["username","position", "guild", "guildId", "roles.contributor","roles.developer","roles.communitymanager"]
    var DesiredKey = sample.filter(x => !nonDesirables.includes(x))[0];
    var sortingKey_list = "";

    for(i=0; i<leaderboard.length;i++){
        position_list = position_list + (i+1) + "\n";
        username_list = username_list + leaderboard[i].username + "\n";
        sortingKey_list = sortingKey_list + leaderboard[i][DesiredKey] + "\n"
    }

    const response = new Discord.MessageEmbed()
    .setColor(`#2d139d`)
    .setTitle(`Top ${limit} for ${sortingKey}`)
    .setURL(`https://solaris.games/#/game?id=${gameId}`)
    .setAuthor(`Solaris`, `https://i.imgur.com/u9fOv2B.png?1`, `https://github.com/mike-eason/solaris/graphs/contributors`)
    .setThumbnail(`https://i.imgur.com/INmYa7P.png?1`)
    .addFields(
        {name: "Placing", value: position_list},
        {name: "Name", value: username_list},
        {name: `${sortingKey}`, value: sortingKey_list}
    )
    .setTimestamp()
    .setFooter('Sponsored by Solaris', 'https://i.imgur.com/INmYa7P.png?1');

    msg.channel.send(response);
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
