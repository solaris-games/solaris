const Discord = require('discord.js');

module.exports = class ReponseService {

    baseResponse() {
        const response = new Discord.MessageEmbed()
            .setColor(`#2d139d`)
            .setURL(`https://solaris.games/`)
            .setAuthor(`Solaris`, `https://i.imgur.com/u9fOv2B.png?1`, `https://github.com/mike-eason/solaris/graphs/contributors`)
            .setThumbnail(`https://i.imgur.com/INmYa7P.png?1`)
            .setTimestamp()
            .setFooter('Sponsored by Solaris', 'https://i.imgur.com/INmYa7P.png?1');
        return response;
    }

    gameinfo(game, type) {
        switch (type) {
            case 'general':
                return this.gameinfoGeneral(game);
            case 'galaxy':
                return this.gameinfoGalaxy(game);
            case 'player':
                return this.gameinfoPlayer(game);
            case 'technology':
                return this.gameinfoTechnology(game);
            case 'time':
                return this.gameinfoTime(game);
            default:
                throw new Error('Unknown type: ' + type);
        }
    }

    gameinfoGeneral(game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
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
                { name: "Star % for Victory", value: game.settings.conquest.victoryPercentage, inline: true },
                { name: "Maximum Players", value: game.settings.general.playerLimit, inline: true },
                { name: "Anonymity", value: game.settings.general.anonymity, inline: true },//next line
                { name: "Online Status", value: game.settings.general.playerOnlineStatus, inline: true },
                { name: "Time Machine", value: game.settings.general.timeMachine, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Time", value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "Galaxy", value: "➡️➡️➡️", inline: true }
            );
        return response;
    }

    gameinfoGalaxy(game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
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
                { name: "Player Distribution", value: game.settings.specialGalaxy.playerDistribution, inline: true },//next line
                { name: "General", value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "Player", value: "➡️➡️➡️", inline: true }
            );
        return response;
    }

    gameinfoPlayer(game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
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
                { name: "Trade Technology Cost", value: game.settings.player.tradeCost, inline: true },//next line
                { name: "Galaxy", value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "Technology", value: "➡️➡️➡️", inline: true }
            );
        return response;
    }

    gameinfoTechnology(game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
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
                { name: "Banking Reward", value: game.settings.technology.bankingReward, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Player", value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "Time", value: "➡️➡️➡️", inline: true }
            );
        return response;
    }

    gameinfoTime(game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
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
                { name: "Minutes per Tick", value: game.settings.gameTime.speed, inline: true }//next line
            );
        } else {
            response = response.addFields(
                { name: "Ticks per Turn", value: game.settings.gameTime.turnJumps, inline: true },//next line
                { name: "Maximum Time per Turn", value: game.settings.gameTime.maxTurnWait, inline: true },
                { name: "Missed Turn Limit", value: game.settings.gameTime.missedTurnLimit, inline: true },
                { name: "\u200B", value: "\u200B", inline: true }//next line
            );
        }
        response = response.addFields(
            { name: "Technology", value: "⬅️⬅️⬅️", inline: true },
            { name: "\u200B", value: "\u200B", inline: true },
            { name: "General", value: "➡️➡️➡️", inline: true }
        );
        return response;
    }

    gameinfoError(authorId, reason) {
        let response;
        switch (reason) {
            case 'noFocus':
                response = `Hey <@${authorId}>,\n` +
                    `It looks like the focus you specified is not in the list, you can choose between "all", "general", "galaxy", "player", "technology" and "time". If you belief this is a bug, contact @Tristanvds#9505.`
                break;
            case 'noGame':
                response = `Hey <@${authorId}>,\n` +
                    `No game was found with this name, check if you spelt it correctly`;
                break;
            case 'multipleGames':
                response = `Hey <@${authorId}>,\n` +
                    `Multiple games were found with this name, instead of using the name for this you can use the gameID, which can be found in the link to the game: https://solaris.games/#/game?id=**<gameID>**.\n` +
                    `If you do this, add the word "ID" after the filter, as an extra direction.`
        }
        return response;
    }

    invite(game) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Please join ${game.settings.general.name}`)
            .setURL(`https://solaris.games/#/game?id=${game._id}`)
            .addFields(
                { name: "Gamemode", value: game.settings.general.mode, inline: true },
                { name: "Anonymity", value: game.settings.general.anonymity, inline: true },
                { name: "Dark Galaxy", value: game.settings.specialGalaxy.darkGalaxy, inline: true },//next line
                { name: "Player count", value: game.settings.general.playerLimit, inline: true },
                { name: "Stars Per Player", value: game.settings.galaxy.starsPerPlayer, inline: true },
                { name: "Galaxy Type", value: game.settings.galaxy.galaxyType, inline: true },//next line
                { name: "Specialist Currency", value: game.settings.specialGalaxy.specialistsCurrency, inline: true },
                { name: "Trade Credits", value: game.settings.player.tradeCredits, inline: true },
                { name: "Trade Technologies", value: game.settings.player.tradeScanning, inline: true },//next line
                { name: "Time Setting", value: game.settings.gameTime.gameType, inline: true },
                { name: "Ticks per Cycle", value: game.settings.galaxy.productionTicks, inline: true }
            );
        if (game.settings.gameTime.gameType == 'realTime') {
            response = response.addFields(
                { name: "Time per Tick", value: game.settings.gameTime.speed / 60 + "minutes", inline: true }//next line
            );
        } else {
            response = response.addFields(
                { name: "Time per Turn", value: game.settings.gameTime.turnJumps + "hours", inline: true }//next line
            );
        }
        return response;
    }

    async inviteError(authorId, reason) {
        let response = `Hey @<${authorId}>,`
        switch (reason) {
            case 'noUser':
                response += "It seems like the user you tried to look up does not exist, check if you spelled it correctly, and used capitalised letters at the right places." +
                    "If you belief this is a bug, please contact @Tristanvds#9505"
        }
        return response;
    }

    leaderboard_global(page, sortingKey, position_list, username_list, sortingKey_list) {
        let lowerLimit = (page - 1) * 20 + 1
        let upperLimit = page * 20
        let response = this.baseResponse()
        response = response
            .setTitle(`Top ${lowerLimit}-${upperLimit} for ${sortingKey}`)
            .setURL(`https://solaris.games/#/leaderboard`)
            .addFields(
                { name: "Position", value: position_list, inline: true },
                { name: "Name", value: username_list, inline: true },
                { name: `${sortingKey}`, value: sortingKey_list, inline: true }
            );
        return response;
    }

    async leaderboard_globalError(authorId, reason) {
        let response = `Hey @<${authorId}>,`
        switch (reason) {
            case 'invalidSorter':
                response += 'The filter you specified is not on the list, make sure to check your sorter.\n' +
                    'If you belief this is a bug, contact Tristanvds#9505'
        }
        return response;
    }

    leaderboard_local(gameId, sortingKey, position_list, username_list, sortingKey_list) {
        let response = this.baseResponse()
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

    leaderboard_localError(authorId, reason) {
        let response;
        switch (reason) {
            case 'noGame':
                response = `Hey <@${authorId}>,\n` +
                `No game was found with this name, check if you spelled it correctly`;
                break;
            case 'multipleGames':
                response = `Hey <@${authorId}>,\n` +
                    `Multiple games were found with this name, instead of using the name for this you can use the gameID, which can be found in the link to the game: https://solaris.games/#/game?id=**<gameID>**.\n` +
                    `If you do this, add the word "ID" after the filter, as an extra direction.`
                break;
            case 'extraDark':
                response = `Hey <@${authorId}>,\n` +
                    `The game you looked up is an extra Dark Galaxy, we can't spill you the secrets of those games`;
                break;
            case 'notStarted':
                response = `Hey <@${authorId}>,\n` +
                    `The game you looked up has not started yet, we can't tell you anything about it now...`;
        }
        return response;
    }

    userinfo(user, type) {
        switch (type) {
            case 'games':
                return this.userinfoGames(user);
            case 'combat':
                return this.userinfoCombat(user);
            case 'infrastructure':
                return this.userinfoInfrastructure(user);
            case 'research':
                return this.userinfoResearch(user);
            case 'trade':
                return this.userinfoTrade(user);
            default:
                throw new Error('Unknown type: ' + type);
        }
    }

    userinfoGames(user) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Userinfo of ${user.username}`)
            .setURL(`https://solaris.games/#/account/achievements/${user._id}`)
            .addFields(
                { name: "Games", value: "\u200B" },
                { name: "Victories", value: user.achievements.victories, inline: true },
                { name: "Rank", value: user.achievements.rank, inline: true },
                { name: "Renown", value: user.achievements.renown, inline: true },//next line
                { name: "Games Joined", value: user.achievements.joined, inline: true },
                { name: "Games Completed", value: user.achievements.completed, inline: true },
                { name: "Games Defeated", value: user.achievements.defeated, inline: true },//next line
                { name: "Games Quit", value: user.achievements.quit, inline: true },
                { name: "Games AFK", value: user.achievements.afk, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Trade", value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "Combat", value: "➡️➡️➡️", inline: true }
            );
        return response;
    }

    userinfoCombat(user) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Userinfo of ${user.username}`)
            .setURL(`https://solaris.games/#/account/achievements/${user._id}`)
            .addFields(
                { name: "Combat", value: "\u200B" },
                { name: "Ships Killed", value: user.achievements.combat.kills.ships, inline: true },
                { name: "Carriers Killed", value: user.achievements.combat.kills.carriers, inline: true },
                { name: "Specialists Killed", value: user.achievements.combat.kills.specialists, inline: true },//next line
                { name: "Ships Lost", value: user.achievements.combat.losses.ships, inline: true },
                { name: "Carriers Lost", value: user.achievements.combat.losses.carriers, inline: true },
                { name: "Specialists Lost", value: user.achievements.combat.losses.specialists, inline: true },//next line
                { name: "Stars Captured", value: user.achievements.combat.stars.captured, inline: true },
                { name: "Stars Lost", value: user.achievements.combat.stars.lost, inline: true },
                { name: "Capitals Captured", value: user.achievements.combat.homeStars.captured, inline: true },
                { name: "Capitals Lost", value: user.achievements.combat.homeStars.lost, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Games", value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "Infrastructure", value: "➡️➡️➡️", inline: true }
            );
        return response;
    }

    userinfoInfrastructure(user) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Userinfo of ${user.username}`)
            .setURL(`https://solaris.games/#/account/achievements/${user._id}`)
            .addFields(
                { name: "Infrastructure", value: "\u200B" },
                { name: "Economy", value: user.achievements.infrastructure.economy, inline: true },
                { name: "Industry", value: user.achievements.infrastructure.industry, inline: true },
                { name: "Science", value: user.achievements.infrastructure.science, inline: true },//next line
                { name: "Warp Gates built", value: user.achievements.infrastructure.warpGates, inline: true },
                { name: "Carriers built", value: user.achievements.infrastructure.carriers, inline: true },
                { name: "Specialists Hired", value: user.achievements.infrastructure.specialistsHired, inline: true },//next line
                { name: "Warp Gates Destroyed", value: user.achievements.infrastructure.warpGatesDestroyed, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Combat", value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "Research", value: "➡️➡️➡️", inline: true }
            );
        return response;
    }

    userinfoResearch(user) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Userinfo of ${user.username}`)
            .setURL(`https://solaris.games/#/account/achievements/${user._id}`)
            .addFields(
                { name: "Research", value: "\u200B" },
                { name: "Scanning", value: user.achievements.research.scanning, inline: true },
                { name: "Hyperspace Range", value: user.achievements.research.hyperspace, inline: true },
                { name: "Terraforming", value: user.achievements.research.terraforming, inline: true },//next line
                { name: "Experimentation", value: user.achievements.research.experimentation, inline: true },
                { name: "Weapons", value: user.achievements.research.weapons, inline: true },
                { name: "Banking", value: user.achievements.research.banking, inline: true },//next line
                { name: "Manufacturing", value: user.achievements.research.manufacturing, inline: true },
                { name: "Specialists", value: user.achievements.research.specialists, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Infrastructure", value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "Trade", value: "➡️➡️➡️", inline: true }
            );
        return response;
    }

    userinfoTrade(user) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Userinfo of ${user.username}`)
            .setURL(`https://solaris.games/#/account/achievements/${user._id}`)
            .addFields(
                { name: "Trade", value: "\u200B" },
                { name: "Credits Sent", value: user.achievements.trade.creditsSent, inline: true },
                { name: "Specialist Tokens Sent", value: user.achievements.trade.creditsSpecialistsSent, inline: true },
                { name: "Technologies Sent", value: user.achievements.trade.technologySent, inline: true },//next line
                { name: "Credits Received", value: user.achievements.trade.creditsReceived, inline: true },
                { name: "Specialists Tokens Received", value: user.achievements.trade.creditsSpecialistsReceived, inline: true },
                { name: "Technologies Received", value: user.achievements.trade.technologyReceived, inline: true },//next line
                { name: "Ships Gifted", value: user.achievements.trade.giftsSent, inline: true },
                { name: "Ships Recieved", value: user.achievements.trade.giftsReceived, inline: true },
                { name: "Renown Sent", value: user.achievements.trade.renownSent, inline: true },//next line
                { name: "Research", value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "Games", value: "➡️➡️➡️", inline: true }
            );
        return response;
    }
    
    async userinfoError (authorId, reason) {
        let response = `Hey @<${authorId}>,\n`
        switch (reason) {
            case 'noUser':
                response += 'No user was found with this name, check if you spelled it correctly.'
                break;
            case 'noFocus':
                response += 'No focus was specified, make sure to add it to your command.'
        }
        return response;
    }

    reactThumbsUp(msg) {
        msg.react('👍');
    }

    reactThumbsDown(msg) {
        msg.react('👎');
    }
}