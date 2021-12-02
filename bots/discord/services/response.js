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
            case 0: //General
                return this.gameinfoGeneral(game);
            case 1: //Galaxy
                return this.gameinfoGalaxy(game);
            case 2: //Player
                return this.gameinfoPlayer(game);
            case 3: //Technology
                return this.gameinfoTechnology(game);
            case 4: //Time
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
                { name: "Random Warpgates (%)", value: game.settings.specialGalaxy.randomWarpGates, inline: true },
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
                { name: "AFK Missed Turn Limit", value: game.settings.gameTime.afk.turnTimeout, inline: true },
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

    leaderboard_globalPC(page, sortingKey, position_list, username_list, sortingKey_list) {
        let lowerLimit = page * 20 + 1
        let upperLimit = (page + 1) * 20
        let response = this.baseResponse()
        response = response
            .setTitle(`Top ${lowerLimit}-${upperLimit} for ${sortingKey}`)
            .setURL(`https://solaris.games/#/leaderboard`)
            .addFields(
                { name: "Position", value: position_list, inline: true },
                { name: "Name", value: username_list, inline: true },
                { name: sortingKey, value: sortingKey_list, inline: true }
            );
        return response;
    }

    leaderboard_globalMobile(page, sortingKey, data_list) {
        let lowerLimit = page * 20 + 1;
        let upperLimit = (page + 1) * 20;
        let response = this.baseResponse();
        response = response
            .setTitle(`Top ${lowerLimit}-${upperLimit} for ${sortingKey}`)
            .setURL(`https://solaris.games/#/leaderboard`)
            .addFields(
                { name: `position / ${sortingKey} / username`, value: data_list }
            );
        return response;
    }

    leaderboard_localPC(gameId, tick, sortingKey, position_list, username_list, sortingKey_list) {
        let response = this.baseResponse()
        response = response
            .setTitle(`Leaderboard for ${sortingKey}`)
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
            .setDescription(`Currently at tick ${tick}`)
            .addFields(
                { name: "Position", value: position_list, inline: true },
                { name: "Name", value: username_list, inline: true },
                { name: sortingKey, value: sortingKey_list, inline: true }
            );
        return response;
    }

    leaderboard_localMobile(gameId, tick, sortingKey, data_list) {
        let response = this.baseResponse()
        response = response
            .setTitle(`Leaderboard for ${sortingKey}`)
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
            .setDescription(`Currently at tick ${tick}`)
            .addFields(
                { name: `position / ${sortingKey} / username`, value: data_list},
            );
        return response;
    }

    statusPC(data) {
        let response = this.baseResponse();
        response = response
        .setTitle(`Status of ${data.game.settings.general.name}`)
        .setURL(`https://solaris.games/#/game?id=${data.game._id}`)
        .addFields(
            { name: 'Finished?', value: data.game.state.endDate ? 'Game has ended' : 'Ongoing', inline: true }, //1
            { name: 'Tick', value: data.game.state.tick, inline: true }, //1
            { name: 'Living Players', value: data.alive, inline: true }, //1
            { name: 'Stars Ranking', value: data.leaderboard.stars, inline: true }, //2
            { name: 'Ships Ranking', value: data.leaderboard.ships, inline: true }, //2
            { name: 'New Ships Ranking', value: data.leaderboard.newShips, inline: true }, //2
            { name: 'Economy Ranking', value: data.leaderboard.economy, inline: true }, //3
            { name: 'Industry Ranking', value: data.leaderboard.industry, inline: true }, //3
            { name: 'Science Ranking', value: data.leaderboard.science, inline: true }, //3
            { name: 'Weapons Ranking', value: data.leaderboard.weapons, inline: true }, //4
            { name: 'Manufacturing Ranking', value: data.leaderboard.manufacturing, inline: true }, //4
            { name: 'Specialists Ranking', value: data.leaderboard.specialists, inline: true }, //4
        );
        return response;
    }

    statusMobile(data) {
        let response = this.baseResponse();
        response = response
        .setTitle(`Status of ${data.game.settings.general.name}`)
        .setURL(`https://solaris.games/#/game?id=${data.game._id}`)
        .addFields(
            { name: 'Tick', value: data.game.state.tick },
            { name: 'Stars Ranking', value: data.leaderboard.stars },
            { name: 'Ships Ranking', value: data.leaderboard.ships },
            { name: 'Economy Ranking', value: data.leaderboard.economy },
            { name: 'Industry Ranking', value: data.leaderboard.industry },
            { name: 'Science Ranking', value: data.leaderboard.science },
            { name: 'Weapons Ranking', value: data.leaderboard.weapons },
            { name: 'Manufacturing Ranking', value: data.leaderboard.manufacturing },
            { name: 'Specialists Ranking', value: data.leaderboard.specialists }
        );
        return response;
    }

    userinfo(user, type, isPC) {
        let response;
        let sidePages = [];
        switch (type) {
            case 0:
                response = this.userinfoGames(user);
                sidePages[0] = 'Trade';
                sidePages[1] = 'Combat';
                break;
            case 1:
                response = userinfoCombat(user);
                sidePages[0] = 'Games';
                sidePages[1] = 'Infrastructure';
                break;
            case 2:
                response = userinfoInfrastructure(user);
                sidePages[0] = 'Combat';
                sidePages[1] = 'Research';
                break;
            case 3:
                response = userinfoResearch(user);
                sidePages[0] = 'Infrastructure';
                sidePages[1] = 'Trade';
                break;
            case 4:
                response = userinfoTrade(user);
                sidePages[0] = 'Research';
                sidePages[1] = 'Games';
                break;
            default:
                throw new Error('Unknown type: ' + type);
        }
        if(isPC) {
            response = response
            .addFields(
                { name: sidePages[0], value: "⬅️⬅️⬅️", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: sidePages[1], value: "➡️➡️➡️", inline: true }
            )
        } else {
            response = response
            .addFields(
                {name: sidePages[0] + " / " + sidePages[1], value: "⬅️ / ➡️"}
            )
        }
        return response;
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
                { name: "\u200B", value: "\u200B", inline: true }
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
                { name: "\u200B", value: "\u200B", inline: true }
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
                { name: "\u200B", value: "\u200B", inline: true }
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
                { name: "\u200B", value: "\u200B", inline: true }
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
                { name: "Renown Sent", value: user.achievements.trade.renownSent, inline: true }
            );
        return response;
    }

    error (authorId, reason) {
        let response = `Something went wrong <@${authorId}>,\n`;
        switch (reason) {
            case 'noGame':
                response += 'No game was found with that name, check if you used the right ID/spelled it correctly.';
                break;
            case 'multipleGames':
                response += 'Multiple games were found with that name. Instead of searching by name, you can search by ID, which is in the gamelink: https://solaris.games/#/game?id="GAMEID". Make sure that when you do this, you add "ID" (without the "") behind the command.';
                break;
            case 'noUser':
                response += 'No user was found with this name, check if you spelled the name correctly.';
                break;
            case 'noFocus':
                response += 'No focus was specified, make sure to add it in the command.';
                break;
            case 'extraDark':
                response += 'The game you asked about is an Extra Dark game, which means I cannot tell you anything about it.'
                break;
            case 'invalidSorter':
                response += 'The sorter you specified does not exist, make sure you spelled it correctly.'
                break;
            case 'notStarted':
                response += 'The game has not started yet, so no usefull information can be given about it.'
                break;
            default:
                //This should never happen
                response += 'Something horribly went wrong';
        }
        response += '\nIf you belief this is a bug, contact Tristanvds';
        return response;
    }
}