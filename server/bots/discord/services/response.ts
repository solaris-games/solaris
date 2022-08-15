import { Game } from "../../../services/types/Game";
import { User } from "../../../services/types/User";

const Discord = require('discord.js');

export default class ReponseService {

    baseResponse() {
        const response = new Discord.MessageEmbed()
            .setColor(`#2d139d`)
            .setURL(`https://solaris.games/`)
            .setAuthor(`Solaris`, `https://i.imgur.com/u9fOv2B.png?1`, `https://github.com/solaris-games/solaris/graphs/contributors`)
            .setThumbnail(`https://i.imgur.com/INmYa7P.png?1`)
            .setTimestamp()
            .setFooter('Sponsored by Solaris', 'https://i.imgur.com/INmYa7P.png?1');
        return response;
    }

    gameinfo(game: Game, type: number, isPC: boolean) {
        let response;
        let sidePages: string[] = [];
        switch (type) {
            case 0: //General
                response = this.gameinfoGeneral(game);
                sidePages[0] = 'Time';
                sidePages[1] = 'Galaxy';
                break;
            case 1: //Galaxy
                response = this.gameinfoGalaxy(game);
                sidePages[0] = 'General';
                sidePages[1] = 'Player';
                break;
            case 2: //Player
                response = this.gameinfoPlayer(game);
                sidePages[0] = 'Galaxy';
                sidePages[1] = 'Technology';
                break;
            case 3: //Technology
                response = this.gameinfoTechnology(game);
                sidePages[0] = 'Player';
                sidePages[1] = 'Time';
                break;
            case 4: //Time
                response = this.gameinfoTime(game);
                sidePages[0] = 'Technology';
                sidePages[1] = 'General';
                break;
            default:
                throw new Error('Unknown type: ' + type);
        }
        if (isPC) {
            response = response
                .addFields(
                    { name: sidePages[0], value: "⬅️⬅️⬅️", inline: true },
                    { name: "\u200B", value: "\u200B", inline: true },
                    { name: sidePages[1], value: "➡️➡️➡️", inline: true }
                );
        } else {
            response = response
                .addFields(
                    { name: sidePages[0] + " / " + sidePages[1], value: "⬅️ / ➡️" }
                );
        }
        return response;
    }

    gameinfoGeneral(game: Game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`);
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`General Settings of ${game_name}`)
            .addFields(
                { name: "General", value: "\u200B" },
                { name: "Type", value: this.getFriendlyText(game.settings.general.type), inline: true },
                { name: "Mode", value: this.getFriendlyText(game.settings.general.mode), inline: true },
                { name: "Featured", value: this.getFriendlyText(game.settings.general.featured) ? "true" : "false", inline: true },//next line
                { name: "Star % for Victory", value: this.getFriendlyText(game.settings.conquest.victoryPercentage), inline: true },
                { name: "Maximum Players", value: this.getFriendlyText(game.settings.general.playerLimit), inline: true },
                { name: "Anonymity", value: this.getFriendlyText(game.settings.general.anonymity), inline: true },//next line
                { name: "Online Status", value: this.getFriendlyText(game.settings.general.playerOnlineStatus), inline: true },
                { name: "Time Machine", value: this.getFriendlyText(game.settings.general.timeMachine), inline: true },
                { name: "\u200B", value: "\u200B", inline: true }
            );
        return response;
    }

    gameinfoGalaxy(game: Game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`);
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`Galaxy Settings of ${game_name}`)
            .addFields(
                { name: "Galaxy", value: "\u200B" },
                { name: "Galaxy Type", value: this.getFriendlyText(game.settings.galaxy.galaxyType), inline: true },
                { name: "Stars per Player", value: this.getFriendlyText(game.settings.galaxy.starsPerPlayer), inline: true },
                { name: "Ticks per Cycle", value: this.getFriendlyText(game.settings.galaxy.productionTicks), inline: true }, //next line
                { name: "Carrier Cost", value: this.getFriendlyText(game.settings.specialGalaxy.carrierCost), inline: true },
                { name: "Carrier Upkeep", value: this.getFriendlyText(game.settings.specialGalaxy.carrierUpkeepCost), inline: true },
                { name: "Carrier Speed (ly/tick)", value: this.getFriendlyText(game.settings.specialGalaxy.carrierSpeed/50), inline: true },//next line
                { name: "Warpgate Cost", value: this.getFriendlyText(game.settings.specialGalaxy.warpgateCost), inline: true },
                { name: "Random Warpgates (%)", value: this.getFriendlyText(game.settings.specialGalaxy.randomWarpGates), inline: true },
                { name: "Specialist Cost", value: this.getFriendlyText(game.settings.specialGalaxy.specialistCost), inline: true },//next line
                { name: "Specialist Currency", value: this.getFriendlyText(game.settings.specialGalaxy.specialistsCurrency), inline: true },
                { name: "Dark Galaxy", value: this.getFriendlyText(game.settings.specialGalaxy.darkGalaxy), inline: true },
                { name: "Defender Bonus", value: this.getFriendlyText(game.settings.specialGalaxy.defenderBonus), inline: true },//next line
                { name: "Carrier to Carrier Combat", value: this.getFriendlyText(game.settings.specialGalaxy.carrierToCarrierCombat), inline: true },
                { name: "Resource Distribution", value: this.getFriendlyText(game.settings.specialGalaxy.resourceDistribution), inline: true },
                { name: "Player Distribution", value: this.getFriendlyText(game.settings.specialGalaxy.playerDistribution), inline: true },
                { name: "Formal Alliances", value: this.getFriendlyText(game.settings.diplomacy.enabled), inline: true }
            );
        return response;
    }

    gameinfoPlayer(game: Game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`);
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`Player Settings of ${game_name}`)
            .addFields(
                { name: "Player", value: "\u200B" },
                { name: "Starting Stars", value: this.getFriendlyText(game.settings.player.startingStars), inline: true },
                { name: "Starting Ships", value: this.getFriendlyText(game.settings.player.startingShips), inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Starting Economy", value: this.getFriendlyText(game.settings.player.startingInfrastructure.economy), inline: true },
                { name: "Starting Industry", value: this.getFriendlyText(game.settings.player.startingInfrastructure.industry), inline: true },
                { name: "Starting Science", value: this.getFriendlyText(game.settings.player.startingInfrastructure.science), inline: true },//next line
                { name: "Economy Cost", value: this.getFriendlyText(game.settings.player.developmentCost.economy), inline: true },
                { name: "Industry Cost", value: this.getFriendlyText(game.settings.player.developmentCost.industry), inline: true },
                { name: "Science Cost", value: this.getFriendlyText(game.settings.player.developmentCost.science), inline: true },//next line
                { name: "Starting Credits", value: this.getFriendlyText(game.settings.player.startingCredits), inline: true },
                { name: "Starting Specialist Tokens", value: this.getFriendlyText(game.settings.player.startingCreditsSpecialists), inline: true },
                { name: "Trade Scanning", value: this.getFriendlyText(game.settings.player.tradeScanning), inline: true },//next line
                { name: "Trade Credits", value: this.getFriendlyText(game.settings.player.tradeCredits) ? "true" : "false", inline: true },
                { name: "Trade Specialist Tokens", value: this.getFriendlyText(game.settings.player.tradeCreditsSpecialists) ? "true" : "false", inline: true },
                { name: "Trade Technology Cost", value: this.getFriendlyText(game.settings.player.tradeCost), inline: true }
            );
        return response;
    }

    gameinfoTechnology(game: Game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`);
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`Technology Settings of ${game_name}`)
            .addFields(
                { name: "Technology", value: "\u200B" },
                { name: "Scanning", value: this.getFriendlyText(game.settings.technology.startingTechnologyLevel.scanning), inline: true },
                { name: "Hyperspace Range", value: this.getFriendlyText(game.settings.technology.startingTechnologyLevel.hyperspace), inline: true },
                { name: "Terraforming", value: this.getFriendlyText(game.settings.technology.startingTechnologyLevel.terraforming), inline: true },//next line
                { name: "Experimentation", value: this.getFriendlyText(game.settings.technology.startingTechnologyLevel.experimentation), inline: true },
                { name: "Weapons", value: this.getFriendlyText(game.settings.technology.startingTechnologyLevel.weapons), inline: true },
                { name: "Banking", value: this.getFriendlyText(game.settings.technology.startingTechnologyLevel.banking), inline: true },//next line
                { name: "Manufacturing", value: this.getFriendlyText(game.settings.technology.startingTechnologyLevel.manufacturing), inline: true },
                { name: "Specialists", value: this.getFriendlyText(game.settings.technology.startingTechnologyLevel.specialists), inline: true },
                { name: "\u200B", value: "\u200B", inline: true },//next line
                { name: "Scanning", value: this.getFriendlyText(game.settings.technology.researchCosts.scanning), inline: true },
                { name: "Hyperspace Range", value: this.getFriendlyText(game.settings.technology.researchCosts.hyperspace), inline: true },
                { name: "Terraforming", value: this.getFriendlyText(game.settings.technology.researchCosts.terraforming), inline: true },//next line
                { name: "Experimentation", value: this.getFriendlyText(game.settings.technology.researchCosts.experimentation), inline: true },
                { name: "Weapons", value: this.getFriendlyText(game.settings.technology.researchCosts.weapons), inline: true },
                { name: "Banking", value: this.getFriendlyText(game.settings.technology.researchCosts.banking), inline: true },//next line
                { name: "Manufacturing", value: this.getFriendlyText(game.settings.technology.researchCosts.manufacturing), inline: true },
                { name: "Specialists", value: this.getFriendlyText(game.settings.technology.researchCosts.specialists), inline: true },
                { name: "Banking Reward", value: this.getFriendlyText(game.settings.technology.bankingReward), inline: true }//next line
            );
        return response;
    }

    gameinfoTime(game: Game) {
        let game_name = game.settings.general.name;
        let gameId = game._id;
        let response = this.baseResponse();
        response = response
            .setURL(`https://solaris.games/#/game?id=${gameId}`);
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        response = response
            .setTitle(`Time Settings of ${game_name}`)
            .addFields(
                { name: "Time", value: "\u200B" },
                { name: "Time Type", value: this.getFriendlyText(game.settings.gameTime.gameType), inline: true },
                { name: "Start Delay", value: this.getFriendlyText(game.settings.gameTime.startDelay), inline: true }
            );
        if (game.settings.gameTime.gameType == 'realTime') {
            response = response.addFields(
                { name: "Minutes per Tick", value: game.settings.gameTime.speed, inline: true }//next line
            );
        } else {
            response = response.addFields(
                { name: "Ticks per Turn", value: this.getFriendlyText(game.settings.gameTime.turnJumps), inline: true },//next line
                { name: "Maximum Time per Turn", value: this.getFriendlyText(game.settings.gameTime.maxTurnWait), inline: true },
                { name: "AFK Missed Turn Limit", value: this.getFriendlyText(game.settings.gameTime.afk.turnTimeout), inline: true },
                { name: "\u200B", value: "\u200B", inline: true }//next line
            );
        }
        return response;
    }

    invite(game: Game) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Please join ${game.settings.general.name}`)
            .setURL(`https://solaris.games/#/game?id=${game._id}`)
            .addFields(
                { name: "Gamemode", value: this.getFriendlyText(game.settings.general.mode), inline: true },
                { name: "Anonymity", value: this.getFriendlyText(game.settings.general.anonymity), inline: true },
                { name: "Dark Galaxy", value: this.getFriendlyText(game.settings.specialGalaxy.darkGalaxy), inline: true },//next line
                { name: "Player count", value: this.getFriendlyText(game.settings.general.playerLimit), inline: true },
                { name: "Stars Per Player", value: this.getFriendlyText(game.settings.galaxy.starsPerPlayer), inline: true },
                { name: "Galaxy Type", value: this.getFriendlyText(game.settings.galaxy.galaxyType), inline: true },//next line
                { name: "Specialist Currency", value: this.getFriendlyText(game.settings.specialGalaxy.specialistsCurrency), inline: true },
                { name: "Trade Credits", value: this.getFriendlyText(game.settings.player.tradeCredits), inline: true },
                { name: "Trade Technologies", value: this.getFriendlyText(game.settings.player.tradeScanning), inline: true },//next line
                { name: "Time Setting", value: this.getFriendlyText(game.settings.gameTime.gameType), inline: true },
                { name: "Ticks per Cycle", value: this.getFriendlyText(game.settings.galaxy.productionTicks), inline: true }
            );
        if (game.settings.gameTime.gameType == 'realTime') {
            response = response.addFields(
                { name: "Time per Tick", value: game.settings.gameTime.speed / 60 + " minutes", inline: true }//next line
            );
        } else {
            response = response.addFields(
                { name: "Time per Turn", value: game.settings.gameTime.turnJumps + " hours", inline: true }//next line
            );
        }
        if (game.settings.general.description) {
            response = response
                .setDescription(game.settings.general.description);
        }
        return response;
    }

    leaderboard_globalPC(page: number, sortingKey: string, position_list: string, username_list: string, sortingKey_list: string) {
        let lowerLimit = page * 20 + 1;
        let upperLimit = (page + 1) * 20;
        let response = this.baseResponse();
        response = response
            .setTitle(`Top ${lowerLimit}-${upperLimit} for ${this.getFriendlyText(sortingKey)}`)
            .setURL(`https://solaris.games/#/leaderboard`)
            .addFields(
                { name: "Position", value: position_list, inline: true },
                { name: "Name", value: username_list, inline: true },
                { name: this.getFriendlyText(sortingKey), value: sortingKey_list, inline: true }
            );
        return response;
    }

    leaderboard_globalMobile(page: number, sortingKey: string, data_list: string) {
        let lowerLimit = page * 20 + 1;
        let upperLimit = (page + 1) * 20;
        let response = this.baseResponse();
        response = response
            .setTitle(`Top ${lowerLimit}-${upperLimit} for ${this.getFriendlyText(sortingKey)}`)
            .setURL(`https://solaris.games/#/leaderboard`)
            .addFields(
                { name: `position / ${this.getFriendlyText(sortingKey)} / username`, value: data_list }
            );
        return response;
    }

    leaderboard_localPC(gameId: string, tick: number, sortingKey: string, position_list: string, username_list: string, sortingKey_list: string) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Leaderboard for ${this.getFriendlyText(sortingKey)}`)
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
            .setDescription(`Currently at tick ${tick}`)
            .addFields(
                { name: "Position", value: position_list, inline: true },
                { name: "Name", value: username_list, inline: true },
                { name: this.getFriendlyText(sortingKey), value: sortingKey_list, inline: true }
            );
        return response;
    }

    leaderboard_localMobile(gameId: string, tick: number, sortingKey: string, data_list: string) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Leaderboard for ${this.getFriendlyText(sortingKey)}`)
            .setURL(`https://solaris.games/#/game?id=${gameId}`)
            .setDescription(`Currently at tick ${tick}`)
            .addFields(
                { name: `position / ${this.getFriendlyText(sortingKey)} / username`, value: data_list },
            );
        return response;
    }

    statusPC(game: Game, leaderboard, alive: boolean) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Status of ${game.settings.general.name}`)
            .setURL(`https://solaris.games/#/game?id=${game._id}`)
            .addFields(
                { name: 'Finished?', value: game.state.endDate ? 'Game has ended' : 'Ongoing', inline: true }, //1
                { name: 'Tick', value: game.state.tick, inline: true }, //1
                { name: 'Living Players', value: alive, inline: true }, //1
                { name: 'Stars Ranking', value: leaderboard.stars, inline: true }, //2
                { name: 'Ships Ranking', value: leaderboard.ships, inline: true }, //2
                { name: 'New Ships Ranking', value: leaderboard.newShips, inline: true }, //2
                { name: 'Economy Ranking', value: leaderboard.economy, inline: true }, //3
                { name: 'Industry Ranking', value: leaderboard.industry, inline: true }, //3
                { name: 'Science Ranking', value: leaderboard.science, inline: true }, //3
                { name: 'Weapons Ranking', value: leaderboard.weapons, inline: true }, //4
                { name: 'Manufacturing Ranking', value: leaderboard.manufacturing, inline: true }, //4
                { name: 'Specialists Ranking', value: leaderboard.specialists, inline: true }, //4
            );
        return response;
    }

    statusMobile(game: Game, leaderboard) {
        let response = this.baseResponse();
        response = response
            .setTitle(`Status of ${game.settings.general.name}`)
            .setURL(`https://solaris.games/#/game?id=${game._id}`)
            .addFields(
                { name: 'Tick', value: game.state.tick },
                { name: 'Stars Ranking', value: leaderboard.stars },
                { name: 'Ships Ranking', value: leaderboard.ships },
                { name: 'Economy Ranking', value: leaderboard.economy },
                { name: 'Industry Ranking', value: leaderboard.industry },
                { name: 'Science Ranking', value: leaderboard.science },
                { name: 'Weapons Ranking', value: leaderboard.weapons },
                { name: 'Manufacturing Ranking', value: leaderboard.manufacturing },
                { name: 'Specialists Ranking', value: leaderboard.specialists }
            );
        return response;
    }

    userinfo(user: User, type: number, isPC: boolean) {
        let response;
        let sidePages: string[] = [];
        switch (type) {
            case 0:
                response = this.userinfoGames(user);
                sidePages[0] = 'Trade';
                sidePages[1] = 'Combat';
                break;
            case 1:
                response = this.userinfoCombat(user);
                sidePages[0] = 'Games';
                sidePages[1] = 'Infrastructure';
                break;
            case 2:
                response = this.userinfoInfrastructure(user);
                sidePages[0] = 'Combat';
                sidePages[1] = 'Research';
                break;
            case 3:
                response = this.userinfoResearch(user);
                sidePages[0] = 'Infrastructure';
                sidePages[1] = 'Trade';
                break;
            case 4:
                response = this.userinfoTrade(user);
                sidePages[0] = 'Research';
                sidePages[1] = 'Games';
                break;
            default:
                throw new Error('Unknown type: ' + type);
        }
        if (isPC) {
            response = response
                .addFields(
                    { name: sidePages[0], value: "⬅️⬅️⬅️", inline: true },
                    { name: "\u200B", value: "\u200B", inline: true },
                    { name: sidePages[1], value: "➡️➡️➡️", inline: true }
                );
        } else {
            response = response
                .addFields(
                    { name: sidePages[0] + " / " + sidePages[1], value: "⬅️ / ➡️" }
                );
        }
        return response;
    }

    userinfoGames(user: User) {
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

    userinfoCombat(user: User) {
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
                { name: "Capitals Captured", value: user.achievements.combat.homeStars.captured, inline: true },//next line
                { name: "Capitals Lost", value: user.achievements.combat.homeStars.lost, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "\u200B", value: "\u200B", inline: true }//next line
            );
        return response;
    }

    userinfoInfrastructure(user: User) {
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

    userinfoResearch(user: User) {
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

    userinfoTrade(user: User) {
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

    error(authorId: string, reason?: string) {
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
                response += 'No focus was specified or the specified focus was not recognised, make sure to check what focusses you can add.';
                break;
            case 'extraDark':
                response += 'The game you asked about is an Extra Dark game, which means I cannot tell you anything about it.';
                break;
            case 'invalidSorter':
                response += 'The sorter you specified does not exist, make sure you spelled it correctly.';
                break;
            case 'notStarted':
                response += 'The game has not started yet, so no usefull information can be given about it.';
                break;
            case 'invalidID':
                response += 'The ID of the game you gave is invalid, please check if it is correct.';
                break;
            case 'noDirections':
                response += 'The command you executed had too little or invalid directions (that what comes after the first word), check `$help` for a detailed explanation on each command.';
                break;
            default:
                //This should never happen
                response += 'Something horribly went wrong';
        }
        response += '\nIf you believe this is a bug, contact Tristanvds';
        return response;
    }

    getFriendlyText(key) {
        let friendlyText = this.friendlyObject[key];
        if(!friendlyText) {
            return key;
        }
        return friendlyText;
    }

    friendlyObject = {
        'tutorial': 'Tutorial',
        'new_player_rt': 'New Players',
        'standard_rt': 'Standard',
        'standard_tb': 'Standard - TB',
        '1v1_rt': '1 vs. 1',
        '1v1_tb': '1 vs. 1 - TB',
        '32_player_rt': '32 Players',
        'custom': 'Custom',
        'special_dark': 'Dark Galaxy',
        'special_ultraDark': 'Ultra Dark Galaxy',
        'special_orbital': 'Orbital',
        'special_battleRoyale': 'Battle Royale',
        'special_homeStar': 'Capital Stars',
        'special_homeStarElimination': 'Elimination',
        'special_anonymous': 'Anonymous',
        'special_kingOfTheHill': 'King Of The Hill',
        'special_tinyGalaxy': 'Tiny Galaxy',
        'special_freeForAll': 'Free For All',
        'scanning': 'Scanning',
        'hyperspace': 'Hyperspace Range',
        'terraforming': 'Terraforming',
        'experimentation': 'Experimentation',
        'weapons': 'Weapons',
        'banking': 'Banking',
        'manufacturing': 'Manufacturing',
        'specialists': 'Specialists',
        'all': 'All',
        'premium': 'Premium',
        'cheap': 'Cheap',
        'standard': 'Standard',
        'expensive': 'Expensive',
        'veryExpensive': 'Very Expensive',
        'crazyExpensive': 'Crazy Expensive',
        'none': 'None',
        'rare': 'Rare',
        'common': 'Common',
        'disabled': 'Disabled',
        'enabled': 'Enabled',
        'start': 'Start Only',
        'scanned': 'Scanned Only',
        'realTime': 'Real Time',
        'turnBased': 'Turn Based',
        'random': 'Random',
        'weightedCenter': 'Weighted (Center)',
        'irregular': 'Irregular',
        'circular': 'Circular',
        'spiral': 'Spiral',
        'doughnut': 'Doughnut',
        'circular-balanced': 'Circular Balanced',
        'normal': 'Normal',
        'extra': 'Extra',
        'hidden': 'Hidden',
        'visible': 'Visible',
        'experimental': 'Experimental',
        'credits': 'Credits',
        'creditsSpecialists': 'Specialist Tokens',
        'conquest': 'Conquest',
        'battleRoyale': 'Battle Royale',
        'establishedPlayers': 'Established Players Only',
        'galacticCenter': 'Galactic Center',
        'galacticCenterOfMass': 'Galactic Center of Mass',
        'starPercentage': 'Star Percentage',
        'homeStarPercentage': 'Capital Star Percentage',
        'kingOfTheHill': 'King Of The Hill',
        'true': 'Enabled',
        'false': 'Disabled'
    }
}
