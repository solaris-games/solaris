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
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = await this.baseResponse();
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
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = await this.baseResponse();
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
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = await this.baseResponse();
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
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = await this.baseResponse();
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
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = await this.baseResponse();
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
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = await this.baseResponse();
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
        let response;
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
        "``$gameinfo <galaxy_name> <focus>`` - get information about the settings of a galaxy.\n" +
        "``$help <command>`` - get a list of all commands, or more specific information about a command when you add a <command>.\n" +
        "``$leaderboard_global <filter> <limit>`` - rank players over all games they have played based on certain criteria, like wins, losses, ships killed and more.\n" +
        "``$leaderboard_local <galaxy_name> <filter>`` - rank players in a galaxy based on a certain criteria, like stars, economy, ships and more.\n" +
        "``$userinfo <username> <focus>`` - get information about a user, like rank, renown or made economy.\n" +
        "I hope this automated response has helped you in understanding commands for the bot. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpGameinfo = "The ``$gameinfo <galaxy_name> <focus>`` command gives you information about the settings of a completed, in progress or waiting game.\n" +
        "The first direction, the <galaxy_name>, is the name of the game you want to know the settings of. You can find this name in the top left of the screen when you are in the game. If however the galaxy name is not unique, you will be asked to use the galaxy-id instead, this is a unique code that can be found at the end of the url when you are in the game.\n" +
        "The second direction, the <focus>, asks what kind of settings you want to know of. There are five kinds of settings.\n" +
        "If you want to see all settings, use ``all``.\n" +
        "If you want to see the general settings, such as the stars required for victory, playerLimit, anonymity and more, use ``general``.\n" +
        "If you want to see the galaxy settings, such as carrier cost, warpgate cost, specialist cost and more, use ``galaxy``.\n" +
        "If you want to see the player settings, such as the starting conditions and trading conditions, use ``player``.\n" +
        "If you want to see the technology settings, such as the starting technologies and their cost, use ``technology``.\n" +
        "If you want to see the time settings, such as the tick/turn duration or whether or not a game is real time, use ``time``.\n" +
        "I hope this automated response has helped you in understanding the gameinfo command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpHelp = "The ``$help <command>`` command gives you information about the commands you can give this bot. " +
        "Using just the command without a direction will give you a list of all commands with a short explanation of what they do. " +
        "Using the command with a direction, the ``<command>`` gets you a more detailed explanation of a command and its directions.\n" +
        "But you probably already knew that, since you used the ``$help help`` command.\n" +
        "I hope this automated response has helped you in understanding the help command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpLeaderboard_global = "the ``$leaderboard_global <filter> <limit>`` command gives you the top ``<limit>`` within a certain filter.\n" +
        "The limit has to be a value between 1 and 20, the leaderboard will return the top x players, where x is that number.\n" +
        "The filters can be almost anything, the full list of possible filters is: \n``victories``\n``rank``\n``renown``\ngames ``joined``\ngames ``completed``\ngames ``quit``\ngames ``defeated``\ngames ``afk``\n" +
        "``ships-killed``\n``carriers-killed``\n``specialists-killed``\n``ships-lost``\n``carriers-lost``\n``specialists-lost``\n``stars-captured``\n``stars-lost``\n" +
        "``economy`` built\n``industry`` built\n``science`` built\n``warpgates-built``\n``warpgates-destroyed``\n``carriers-built``\n``specialists-hired``\n``scanning`` researched\n``hyperspace`` range researched\n``terraforming`` researched\n" +
        "``experimentation`` researched\n``weapons`` researched\n``banking`` researched\n``manufacturing`` researched\n``specialists`` researched\n``credits-sent``\n``credits-received``\n``technologies-sent``\n``technologies-received``\n" +
        "``ships-gifted``\n``ships-received``\n``renown-sent``.\n" +
        "Remember to use the word in the ``code-block`` as the word for the filter.\n" +
        "I hope this automated response has helped you in understanding the leaderboard_global command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpLeaderboard_local = "The ``$leaderboard_local <galaxy_name> <filter>`` gives you a leaderboard of the game you name based on a filter you supplied.\n" +
        "The first direction, the <galaxy_name>, is the name of the game you want to know the settings of. You can find this name in the top left of the screen when you are in the game. If however the galaxy name is not unique, you will be asked to use the galaxy-id instead, this is a unique code that can be found at the end of the url when you are in the game.\n" +
        "The second direction, the <filter>, is what the leaderboard will be sorted on. The full list of possible filters is: \ntotal ``stars``\ntotal ``carriers``\ntotal ``ships``\ntotal ``economy``\ntotal ``industry``\n" +
        "total ``science``\n``newShip`` production\ntotal ``warpgates``\ntotal ``starSpecialists``\ntotal ``carrierSpecialists``\n``totalSpecialists``\n``scanning`` level\n``hyperspace`` range level\n``terraforming`` level\n``experimentation`` level\n``weapons`` level\n``banking`` level\n" +
        "``manufacturing`` level\n``specialists`` level.\n" +
        "Remember to use the word in the ``code-block`` as the word for the filter.\n" +
        "I hope this automated response has helped you in understanding the leaderboard_local command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpUserinfo = "The ``$userinfo <username>`` gives you a profile of the player with lot's of information. This information can also be found at https://solaris.games/#/account/achievements/<user_ID>.\n" +
        "The first direction, the <username>, is the name of a user, like The Last Hero, or LimitingFactor, the username is case-sensitive, so make sure to spell it properly.\n" +
        "The second direction, the <focus>, is the category you want information on. There are five categories:\n" +
        "If you want to see all information about someone, use ``all``.\n" +
        "If you want to see information about someone's played games, such as victories, completed games or how often he went afk, use ``games``.\n" +
        "If you want to see information about someone's military accomplishments, such as ships killed, ships lost or stars killed, use ``military``.\n" +
        "If you want to see information about someone's infastructure, such as built economy, industry, science and warpgates, use ``infastructure``.\n" +
        "If you want to see information about someone's research, such as points spent in scanning, hyperspace, terraforming, use ``research``.\n" +
        "If you want to see information about someone's trade history, such as credits sent, technologies sent, ships gifted or even renown gifted, use ``trade``.\n" +
        "I hope this automated response has helped you in understanding the userinfo command. If you have a suggestion in how this response or the bot in general can be improved, send it to @Tristanvds#9505.";

    helpUnidentified = "It seems like the command you are looking up isn't registered in our list. Do ``$help`` to get a full list of all commands.\nIf you belief that this is a bug, please contact @Tristanvds#9505.";

    async leaderboard_global(limit, sortingKey, position_list, username_list, sortingKey_list) {
        let response = await this.baseResponse()
        response = response
            .setTitle(`Top ${limit} for ${sortingKey}`)
            .setURL(`https://solaris.games/#/leaderboard`)
            .addFields(
                { name: "Position", value: position_list, inline: true },
                { name: "Name", value: username_list, inline: true },
                { name: `${sortingKey}`, value: sortingKey_list, inline: true }
            );
        return response;

    }

    async leaderboard_local (gameId, sortingKey, position_list, username_list, sortingKey_list) {
        let response = await this.baseResponse()
        response = response
            .setTitle(`Leaderboard for ${sortingKey}`)
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
            .addFields(
                { name: "Position", value: position_list, inline: true },
                { name: "Name", value: username_list, inline: true },
                { name: `${sortingKey}`, value: sortingKey_list, inline: true }
            );
        return response;
    }

    async leaderboard_localError(authorId, reason) {
        let response;
        switch(reason){
            case 'noGame':
                response = `Hey <@${authorId}>,\n
                    No game was found with this name, check if you spelled it correctly`;
                break;
            case 'multipleGames':
                response = `Hey <@${msg.author.id},\n
                    Multiple games were found with this name, instead of using the name for this you can use the gameID, which can be found in the link to the game: https://solaris.games/#/game?id=**<gameID>**.\n
                    If you do this, add the word "ID" after the filter, as an extra direction.`
                break;
            case 'extraDark':
                response = `Hey <@${authorId}>,\n
                    The game you looked up is an extra Dark Galaxy, we can't spill you the secrets of those games`;
                break;
            case 'notStarted':
                response = `Hey <@${authorId}>,\n
                    The game you looked up has not started yet, we can't tell you anything about it now...`;
                break;
            default:
                //this will never happen
        }
        return response;
    }

    async userinfo(user) {
        let response = await this.baseResponse();
        response = response
        .setTitle(`Userinfo of ${user.username}`)
        .setURL(`https://solaris.games/#/account/achievements/${user._id}`)
        .addFields(
            { name: "General achievements", value: "\u200B" },
            { name: "Victories", value: user.achievements.victories, inline: true},
            { name: "Rank", value: user.achievements.rank, inline: true},
            { name: "Renown", value: user.achievements.renown, inline: true},//next line
            { name: "Games Joined", value: user.achievements.joined, inline: true},
            { name: "Games Completed", value: user.achievements.completed, inline: true},
            { name: "Games Defeated", value: user.achievements.defeated, inline: true},//next line
            { name: "Games Quit", value: user.achievements.quit, inline: true},
            { name: "Games AFK", value: user.achievements.afk, inline: true},
            { name: "\u200B", value: "\u200B", inline: true},//next line
            { name: "\u200B", value: "\u200B"},
            { name: "Combat", value: "\u200B"},
            { name: "Ships Killed", value: user.achievements.combat.kills.ships, inline: true},
            { name: "Carriers Killed", value: user.achievements.combat.kills.carriers, inline: true},
            { name: "Specialists Killed", value: user.achievements.combat.kills.specialists, inline: true},//next line
            { name: "Ships Lost", value: user.achievements.combat.losses.ships, inline: true},
            { name: "Carriers Lost", value: user.achievements.combat.losses.carriers, inline: true},
            { name: "Specialists Lost", value: user.achievements.combat.losses.specialists, inline: true},//next line
            { name: "Stars Captured", value: user.achievements.combat.stars.captured, inline: true},
            { name: "Stars Lost", value: user.achievements.combat.stars.lost, inline: true},
            { name: "\u200B", value: "\u200B", inline: true},//next line
            { name: "\u200B", value: "\u200B"},
            { name: "Infrastructure", value: "\u200B"},
            { name: "Economy", value: user.achievements.infrastructure.economy, inline: true},
            { name: "Industry", value: user.achievements.infrastructure.industry, inline: true},
            { name: "Science", value: user.achievements.infrastructure.science, inline: true},//next line
            { name: "Warp Gates built", value: user.achievements.infrastructure.warpGates, inline: true},
            { name: "Carriers built", value: user.achievements.infrastructure.carriers, inline: true},
            { name: "Specialists Hired", value: user.achievements.infrastructure.specialistsHired, inline: true},//next line
            { name: "Warp Gates Destroyed", value: user.achievements.infrastructure.warpGatesDestroyed  , inline: true},
            { name: "\u200B", value: "\u200B", inline: true},
            { name: "\u200B", value: "\u200B", inline: true},//next line
            { name: "\u200B", value: "\u200B"},
            { name: "Research", value: "\u200B"},
            { name: "Scanning", value: user.achievements.research.scanning, inline: true},
            { name: "Hyperspace Range", value: user.achievements.research.hyperspace, inline: true},
            { name: "Terraforming", value: user.achievements.research.terraforming, inline: true},//next line
            { name: "Experimentation", value: user.achievements.research.experimentation, inline: true},
            { name: "Weapons", value: user.achievements.research.weapons, inline: true},
            { name: "Banking", value: user.achievements.research.banking, inline: true},//next line
            { name: "Manufacturing", value: user.achievements.research.manufacturing, inline: true},
            { name: "Specialists", value: user.achievements.research.specialists, inline: true},
            { name: "\u200B", value: "\u200B", inline: true},//next line
            { name: "\u200B", value: "\u200B"},
            { name: "Trade", value: "\u200B"},
            { name: "Credits Sent", value: user.achievements.trade.creditsSent, inline: true},
            { name: "Specialist Tokens Sent", value: user.achievements.trade.creditsSpecialistsSent, inline: true},
            { name: "Technologies Sent", value: user.achievements.trade.technologySent, inline: true},//next line
            { name: "Credits Received", value: user.achievements.trade.creditsReceived, inline: true},
            { name: "Specialists Tokens Received", value: user.achievements.trade.creditsSpecialistsReceived, inline: true},
            { name: "Technologies Received", value: user.achievements.trade.technologyReceived, inline: true},//next line
            { name: "Ships Gifted", value: user.achievements.trade.giftsSent, inline: true},
            { name: "Ships Recieved", value: user.achievements.trade.giftsReceived, inline: true},
            { name: "Renown Sent", value: user.achievements.trade.renownSent, inline: true},
        );
        return response;
    }
}