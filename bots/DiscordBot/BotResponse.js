const Discord = require('discord.js');

module.exports = class BotReponseService {

    async baseResponse() {
        const response = new Discord.MessageEmbed()
            .setColor(`#2d139d`)
            .setURL(`https://solaris.games/`)
            .setAuthor(`Solaris`, `https://i.imgur.com/u9fOv2B.png?1`, `https://github.com/mike-eason/solaris/graphs/contributors`)
            .setThumbnail(`https://i.imgur.com/INmYa7P.png?1`)
            .setTimestamp()
            .setFooter('Sponsored by Solaris', 'https://i.imgur.com/INmYa7P.png?1');
        return response;
    }

    async gameinfoAll(game) {
        var game_name = game.settings.general.name;
        var gameId = game._id;
        var response = await this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`All settings of ${game_name}`)
            .addFields(
                { name: "General", value: "\u200B" },
                { name: "Type", value: game.settings.general.type, inline: true },
                { name: "Mode", value: game.settings.general.mode, inline: true },
                { name: "Featured", value: game.settings.general.featured ? "true" : "false", inline: true },//next line
                { name: "Star % for Victory", value: game.settings.general.starVictoryPercentage, inline: true },
                { name: "Maximum Players", value: game.settings.general.playerLimit, inline: true },
                { name: "Anonymity", value: game.settings.general.anonymity, inline: true },//next line
                { name: "Online Status", value: game.settings.general.playerOnlineStatus, inline: true },
                { name: "Time Machine", value: game.settings.general.timeMachine, inline: true },
                { name: "\u200B", value: "\u200B" },
                { name: "Galaxy", value: "\u200B" },
                { name: "Galaxy Type", value: game.settings.galaxy.galaxyType, inline: true },
                { name: "Stars per Player", value: game.settings.galaxy.starsPerPlayer, inline: true },
                { name: "Ticks per Cycle", value: game.settings.galaxy.productionTicks, inline: true }, //next line
                { name: "Carrier Cost", value: game.settings.specialGalaxy.carrierCost, inline: true },
                { name: "Carrier Upkeep", value: game.settings.specialGalaxy.carrierUpkeepCost, inline: true },
                { name: "Carrier Speed", value: game.settings.specialGalaxy.carrierSpeed, inline: true },//next line
                { name: "Warpgate Cost", value: game.settings.specialGalaxy.warpgateCost, inline: true },
                { name: "Random Warpgates", value: game.settings.specialGalaxy.randomGates, inline: true },
                { name: "Specialist Cost", value: game.settings.specialGalaxy.specialistCost, inline: true },//next line
                { name: "Specialist Currency", value: game.settings.specialGalaxy.specialistsCurrency, inline: true },
                { name: "Dark Galaxy", value: game.settings.specialGalaxy.darkGalaxy, inline: true },
                { name: "Defender Bonus", value: game.settings.specialGalaxy.defenderBonus, inline: true },//next line
                { name: "Carrier to Carrier Combat", value: game.settings.specialGalaxy.carrierToCarrierCombat, inline: true },
                { name: "Resource Distribution", value: game.settings.specialGalaxy.resourceDistribution, inline: true },
                { name: "Player Distribution", value: game.settings.specialGalaxy.playerDistribution, inline: true },
                { name: "\u200B", value: "\u200B" },
                { name: "Player", value: "\u200B" },
                { name: "Starting Stars", value: game.settings.player.startingStars, inline: true },
                { name: "Starting Ships", value: game.settings.player.startingShips, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Starting Economy", value: game.settings.player.startingInfrastructure.economy, inline: true },
                { name: "Starting Industry", value: game.settings.player.startingInfrastructure.industry, inline: true },
                { name: "Starting Science", value: game.settings.player.startingInfrastructure.science, inline: true },//next line
                { name: "Economy Cost", value: game.settings.player.developmentCost.economy, inline: true },
                { name: "Industry Cost", value: game.settings.player.developmentCost.industry, inline: true },
                { name: "Science Cost", value: game.settings.player.developmentCost.science, inline: true },//next line
                { name: "Starting Credits", value: game.settings.player.startingCredits, inline: true },
                { name: "Starting Specialist Tokens", value: game.settings.player.startingCreditsSpecialists, inline: true },
                { name: "Trade Scanning", value: game.settings.player.tradeScanning, inline: true },//next line
                { name: "Trade Credits", value: game.settings.player.tradeCredits ? "true" : "false", inline: true },
                { name: "Trade Specialist Tokens", value: game.settings.player.tradeCreditsSpecialists ? "true" : "false", inline: true },
                { name: "Trade Technology Cost", value: game.settings.player.tradeCost, inline: true },
                { name: "\u200B", value: "\u200B" },
                { name: "Technology", value: "\u200B" },
                { name: "Scanning", value: game.settings.technology.startingTechnologyLevel.scanning, inline: true },
                { name: "Hyperspace Range", value: game.settings.technology.startingTechnologyLevel.hyperspace, inline: true },
                { name: "Terraforming", value: game.settings.technology.startingTechnologyLevel.terraforming, inline: true },//next line
                { name: "Experimentation", value: game.settings.technology.startingTechnologyLevel.experimentation, inline: true },
                { name: "Weapons", value: game.settings.technology.startingTechnologyLevel.weapons, inline: true },
                { name: "Banking", value: game.settings.technology.startingTechnologyLevel.banking, inline: true },//next line
                { name: "Manufacturing", value: game.settings.technology.startingTechnologyLevel.manufacturing, inline: true },
                { name: "Specialists", value: game.settings.technology.startingTechnologyLevel.specialists, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Scanning", value: game.settings.technology.researchCosts.scanning, inline: true },
                { name: "Hyperspace Range", value: game.settings.technology.researchCosts.hyperspace, inline: true },
                { name: "Terraforming", value: game.settings.technology.researchCosts.terraforming, inline: true },//next line
                { name: "Experimentation", value: game.settings.technology.researchCosts.experimentation, inline: true },
                { name: "Weapons", value: game.settings.technology.researchCosts.weapons, inline: true },
                { name: "Banking", value: game.settings.technology.researchCosts.banking, inline: true },//next line
                { name: "Manufacturing", value: game.settings.technology.researchCosts.manufacturing, inline: true },
                { name: "Specialists", value: game.settings.technology.researchCosts.specialists, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Banking Reward", value: game.settings.technology.bankingReward },
                { name: "\u200B", value: "\u200B" },
                { name: "Time", value: "\u200B" },
                { name: "Time Type", value: game.settings.gameTime.gameType, inline: true },
                { name: "Start Delay", value: game.settings.gameTime.startDelay, inline: true }
            );
        if (game.settings.gameTime.gameType == 'realTime') {
            response = response.addFields(
                { name: "Minutes per Tick", value: game.settings.gameTime.speed, inline: true },
            );
        } else {
            response = response.addFields(
                { name: "Ticks per Turn", value: game.settings.gameTime.turnJumps, inline: true },
                { name: "Maximum Time per Turn", value: game.settings.gameTime.maxTurnWait, inline: true },
                { name: "Missed Turn Limit", value: game.settings.gameTime.missedTurnLimit, inline: true }
            );
        }
        return response;
    }

    async gameinfoGeneral(game) {
        var game_name = game.settings.general.name;
        var gameId = game._id;
        var response = await this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`General Settings of ${game_name}`)
            .addFields(
                { name: "General", value: "\u200B" },
                { name: "Type", value: game.settings.general.type, inline: true },
                { name: "Mode", value: game.settings.general.mode, inline: true },
                { name: "Featured", value: game.settings.general.featured ? "true" : "false", inline: true },//next line
                { name: "Star % for Victory", value: game.settings.general.starVictoryPercentage, inline: true },
                { name: "Maximum Players", value: game.settings.general.playerLimit, inline: true },
                { name: "Anonymity", value: game.settings.general.anonymity, inline: true },//next line
                { name: "Online Status", value: game.settings.general.playerOnlineStatus, inline: true },
                { name: "Time Machine", value: game.settings.general.timeMachine, inline: true }
            );
        return response;
    }

    async gameinfoGalaxy(game) {
        var game_name = game.settings.general.name;
        var gameId = game._id;
        var response = await this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`Galaxy Settings of ${game_name}`)
            .addFields(
                { name: "Galaxy", value: "\u200B" },
                { name: "Galaxy Type", value: game.settings.galaxy.galaxyType, inline: true },
                { name: "Stars per Player", value: game.settings.galaxy.starsPerPlayer, inline: true },
                { name: "Ticks per Cycle", value: game.settings.galaxy.productionTicks, inline: true }, //next line
                { name: "Carrier Cost", value: game.settings.specialGalaxy.carrierCost, inline: true },
                { name: "Carrier Upkeep", value: game.settings.specialGalaxy.carrierUpkeepCost, inline: true },
                { name: "Carrier Speed", value: game.settings.specialGalaxy.carrierSpeed, inline: true },//next line
                { name: "Warpgate Cost", value: game.settings.specialGalaxy.warpgateCost, inline: true },
                { name: "Random Warpgates", value: game.settings.specialGalaxy.randomGates, inline: true },
                { name: "Specialist Cost", value: game.settings.specialGalaxy.specialistCost, inline: true },//next line
                { name: "Specialist Currency", value: game.settings.specialGalaxy.specialistsCurrency, inline: true },
                { name: "Dark Galaxy", value: game.settings.specialGalaxy.darkGalaxy, inline: true },
                { name: "Defender Bonus", value: game.settings.specialGalaxy.defenderBonus, inline: true },//next line
                { name: "Carrier to Carrier Combat", value: game.settings.specialGalaxy.carrierToCarrierCombat, inline: true },
                { name: "Resource Distribution", value: game.settings.specialGalaxy.resourceDistribution, inline: true },
                { name: "Player Distribution", value: game.settings.specialGalaxy.playerDistribution, inline: true },
            );
        return response;
    }

    async gameinfoPlayer(game) {
        var game_name = game.settings.general.name;
        var gameId = game._id;
        var response = await this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`Player Settings of ${game_name}`)
            .addFields(
                { name: "Player", value: "\u200B" },
                { name: "Starting Stars", value: game.settings.player.startingStars, inline: true },
                { name: "Starting Ships", value: game.settings.player.startingShips, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Starting Economy", value: game.settings.player.startingInfrastructure.economy, inline: true },
                { name: "Starting Industry", value: game.settings.player.startingInfrastructure.industry, inline: true },
                { name: "Starting Science", value: game.settings.player.startingInfrastructure.science, inline: true },//next line
                { name: "Economy Cost", value: game.settings.player.developmentCost.economy, inline: true },
                { name: "Industry Cost", value: game.settings.player.developmentCost.industry, inline: true },
                { name: "Science Cost", value: game.settings.player.developmentCost.science, inline: true },//next line
                { name: "Starting Credits", value: game.settings.player.startingCredits, inline: true },
                { name: "Starting Specialist Tokens", value: game.settings.player.startingCreditsSpecialists, inline: true },
                { name: "Trade Scanning", value: game.settings.player.tradeScanning, inline: true },//next line
                { name: "Trade Credits", value: game.settings.player.tradeCredits ? "true" : "false", inline: true },
                { name: "Trade Specialist Tokens", value: game.settings.player.tradeCreditsSpecialists ? "true" : "false", inline: true },
                { name: "Trade Technology Cost", value: game.settings.player.tradeCost, inline: true },
            );
        return response;
    }

    async gameinfoTechnology(game) {
        var game_name = game.settings.general.name;
        var gameId = game._id;
        var response = await this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`Technology Settings of ${game_name}`)
            .addFields(
                { name: "Technology", value: "\u200B" },
                { name: "Scanning", value: game.settings.technology.startingTechnologyLevel.scanning, inline: true },
                { name: "Hyperspace Range", value: game.settings.technology.startingTechnologyLevel.hyperspace, inline: true },
                { name: "Terraforming", value: game.settings.technology.startingTechnologyLevel.terraforming, inline: true },//next line
                { name: "Experimentation", value: game.settings.technology.startingTechnologyLevel.experimentation, inline: true },
                { name: "Weapons", value: game.settings.technology.startingTechnologyLevel.weapons, inline: true },
                { name: "Banking", value: game.settings.technology.startingTechnologyLevel.banking, inline: true },//next line
                { name: "Manufacturing", value: game.settings.technology.startingTechnologyLevel.manufacturing, inline: true },
                { name: "Specialists", value: game.settings.technology.startingTechnologyLevel.specialists, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Scanning", value: game.settings.technology.researchCosts.scanning, inline: true },
                { name: "Hyperspace Range", value: game.settings.technology.researchCosts.hyperspace, inline: true },
                { name: "Terraforming", value: game.settings.technology.researchCosts.terraforming, inline: true },//next line
                { name: "Experimentation", value: game.settings.technology.researchCosts.experimentation, inline: true },
                { name: "Weapons", value: game.settings.technology.researchCosts.weapons, inline: true },
                { name: "Banking", value: game.settings.technology.researchCosts.banking, inline: true },//next line
                { name: "Manufacturing", value: game.settings.technology.researchCosts.manufacturing, inline: true },
                { name: "Specialists", value: game.settings.technology.researchCosts.specialists, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Banking Reward", value: game.settings.technology.bankingReward },
            );
        return response;
    }

    async gameinfoTime(game) {
        var game_name = game.settings.general.name;
        var gameId = game._id;
        var response = await this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`Time Settings of ${game_name}`)
            .addFields(
                { name: "Time", value: "\u200B" },
                { name: "Time Type", value: game.settings.gameTime.gameType, inline: true },
                { name: "Start Delay", value: game.settings.gameTime.startDelay, inline: true }
            );
        if (game.settings.gameTime.gameType == 'realTime') {
            response = response.addFields(
                { name: "Minutes per Tick", value: game.settings.gameTime.speed, inline: true },
            );
        } else {
            response = response.addFields(
                { name: "Ticks per Turn", value: game.settings.gameTime.turnJumps, inline: true },
                { name: "Maximum Time per Turn", value: game.settings.gameTime.maxTurnWait, inline: true },
                { name: "Missed Turn Limit", value: game.settings.gameTime.missedTurnLimit, inline: true }
            );
        }
        return response;
    }

    async gameinfoError(authorId, reason) {
        var response;
        switch (reason) {
            case 'noFocus':
                response = `Hey <@${authorId},\n
                    It looks like the focus you specified is not in the list, you can choose between "all", "general", "galaxy", "player", "technology" and "time". If you belief this is a bug, contact @Tristanvds#9505.`
                break;
            case 'noGame':
                response = `Hey <@${authorId}>,\n
                    No game was found with this name, check if you spelled it correctly`;
                break;
            case 'multipleGames':
                response = `Hey <@${msg.author.id},\n
                    Multiple games were found with this name, instead of using the name for this you can use the gameID, which can be found in the link to the game: https://solaris.games/#/game?id=**<gameID>**.\n
                    If you do this, add the word "ID" after the filter, as an extra direction.`
                break;
            default:
            //this will never happen, could just as well replace the multipleGames, but this looks a bit nicer in my opinion
        }
        return response;
    }

    helpMain = "You can use the following commands in this discord:\n" +
        "``!gameinfo <galaxy_name> <focus>`` - get information about the settings of a galaxy.\n" +
        "``!help <command>`` - get a list of all commands, or more specific information about a command when you add a <command>.\n" +
        "``!leaderboard_global <filter> <limit>`` - rank players over all games they have played based on certain criteria, like wins, losses, ships killed and more.\n" +
        "``!leaderboard_local <galaxy_name> <filter>`` - rank players in a galaxy based on a certain criteria, like stars, economy, ships and more.\n" +
        "``!userinfo <username> <focus>`` - get information about a user, like rank, renown or made economy.\n" +
        "I hope this automated response has helped you in understanding commands for the bot. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpGameinfo = "The ``!gameinfo <galaxy_name> <focus>`` command gives you information about the settings of a completed, in progress or waiting game.\n" +
        "The first direction, the <galaxy_name>, is the name of the game you want to know the settings of. You can find this name in the top left of the screen when you are in the game. If however the galaxy name is not unique, you will be asked to use the galaxy-id instead, this is a unique code that can be found at the end of the url when you are in the game.\n" +
        "The second direction, the <focus>, asks what kind of settings you want to know of. There are five kinds of settings.\n" +
        "If you want to see all settings, use ``all``.\n" +
        "If you want to see the general settings, such as the stars required for victory, playerLimit, anonymity and more, use ``general``.\n" +
        "If you want to see the galaxy settings, such as carrier cost, warpgate cost, specialist cost and more, use ``galaxy``.\n" +
        "If you want to see the player settings, such as the starting conditions and trading conditions, use ``player``.\n" +
        "If you want to see the technology settings, such as the starting technologies and their cost, use ``technology``.\n" +
        "If you want to see the time settings, such as the tick/turn duration or whether or not a game is real time, use ``time``.\n" +
        "I hope this automated response has helped you in understanding the gameinfo command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpHelp = "The ``!help <command>`` command gives you information about the commands you can give this bot. " +
        "Using just the command without a direction will give you a list of all commands with a short explanation of what they do. " +
        "Using the command with a direction, the ``<command>`` gets you a more detailed explanation of a command and its directions.\n" +
        "But you probably already knew that, since you used the ``!help help`` command.\n" +
        "I hope this automated response has helped you in understanding the help command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpLeaderboard_global = "the ``!leaderboard_global <filter> <limit>`` command gives you the top ``<limit>`` within a certain filter.\n" +
        "The limit has to be a value between 1 and 50, the leaderboard will return the top x players, where x is that number.\n" +
        "The filters can be almost anything, the full list of possible filters is: ``victories``, ``rank``, ``renown``, games ``joined``, games ``completed``, games ``quit``, games ``defeated``, games ``afk``, " +
        "``ships-killed``, ``carriers-killed``, ``specialists-killed``, ``ships-lost``, ``carriers-lost``, ``specialists-lost``, ``stars-captured``, ``stars-lost``, " +
        "``economy`` built, ``industry`` built, ``science`` built, ``warpgates-built``, ``warpgates-destroyed``, ``carriers-built``, ``specialists-hired``, ``scanning`` researched, ``hyperspace`` range researched, ``terraforming`` researched, " +
        "``experimentation`` researched, ``weapons`` researched, ``banking`` researched, ``manufacturing`` researched, ``specialists`` researched, ``credits-sent``, ``credits-received``, ``technologies-sent``, ``technologies-received``, " +
        "``ships-gifted``, ``ships-received`` and ``renown-sent``.\n" +
        "Remember to use the word in the ``code-block`` as the word for the filter.\n" +
        "I hope this automated response has helped you in understanding the leaderboard_global command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpLeaderboard_local = "The ``!leaderboard_local <galaxy_name> <filter>`` gives you a leaderboard of the game you name based on a filter you supplied.\n" +
        "The first direction, the <galaxy_name>, is the name of the game you want to know the settings of. You can find this name in the top left of the screen when you are in the game. If however the galaxy name is not unique, you will be asked to use the galaxy-id instead, this is a unique code that can be found at the end of the url when you are in the game.\n" +
        "The second direction, the <filter>, is what the leaderboard will be sorted on. The full list of possible filters is: total ``stars``, total ``carriers``, total ``ships``, total ``economy``, total ``industry``, " +
        "total ``science``, ``new-ship`` production, total ``warpgates``, ``scanning`` level, ``hyperspace`` range level, ``terraforming`` level, ``experimentation`` level, ``weapons`` level, ``banking`` level, " +
        "``manufacturing`` level and ``specialists`` level.\n" +
        "Remember to use the word in the ``code-block`` as the word for the filter.\n" +
        "I hope this automated response has helped you in understanding the leaderboard_local command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpUserinfo = "The ``!userinfo <username> gives you a profile of the player with lot's of information. This information can also be found at https://solaris.games/#/account/achievements/<user_ID>.\n" +
        "The first direction, the <username>, is the name of a user, like The Last Hero, or LimitingFactor, the username is case-sensitive, so make sure to spell it properly.\n" +
        "The second direction, the <focus>, is the category you want information on. There are five categories:\n" +
        "If you want to see all information about someone, use ``all``.\n" +
        "If you want to see information about someone's played games, such as victories, completed games or how often he went afk, use ``games``.\n" +
        "If you want to see information about someone's military accomplishments, such as ships killed, ships lost or stars killed, use ``military``.\n" +
        "If you want to see information about someone's infastructure, such as built economy, industry, science and warpgates, use ``infastructure``.\n" +
        "If you want to see information about someone's research, such as points spent in scanning, hyperspace, terraforming, use ``research``.\n" +
        "If you want to see information about someone's trade history, such as credits sent, technologies sent, ships gifted or even renown gifted, use ``trade``.\n" +
        "I hope this automated response has helped you in understanding the userinfo command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpUnidentified = "It seems like the command you are looking up isn't registered in our list. Do ``!help`` to get a full list of all commands.\nIf you belief that this is a bug, please contact @Tristanvds#9505.";

    async leaderboard_global(limit, sortingKey, position_list, username_list, sortingKey_list) {
        var response = await this.baseResponse()
        response = response
            .setTitle(`Top ${limit} for ${sortingKey}`)
            .setURL(`https://solaris.games/#/leaderboard`)
            .addFields(
                { name: "Placing", value: position_list, inline: true },
                { name: "Name", value: username_list, inline: true },
                { name: `${sortingKey}`, value: sortingKey_list, inline: true }
            )
        return response
    }

    async userinfo(user) {
        let response = this.baseResponse();
        
    }
}