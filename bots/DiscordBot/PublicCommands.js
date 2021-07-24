const Discord = require('discord.js')


module.exports = class PublicCommandService {

    constructor(botResponseService, gameGalaxyService, gameService, leaderboardService, userService) {
        this.botResponseService = botResponseService
        this.gameGalaxyService = gameGalaxyService
        this.gameService = gameService;
        this.leaderboardService = leaderboardService;
        this.userService = userService;
    }

    async gameinfo(msg, directions) {
        //!gameinfo <galaxy_name> <focus> ("ID")
        let game = [];
        let focus;
        let game_name = "";
        if (directions[directions.length - 1] == "ID") {
            game = await this.gameService.getByIdAll(directions[0])
            focus = directions[directions.length - 2]
        } else {
            if (directions.length === 1) {
                directions.push('general');
            }
            for (let i = 0; i < directions.length - 1; i++) {
                game_name += directions[i] + ' ';
            }
            game_name = game_name.trim()
            game = await this.gameService.getByNameAll(game_name);
            focus = directions[directions.length - 1]
        }

        let NameUniquenessVar = game.length;
        if (NameUniquenessVar != 1) {
            let response;
            if (NameUniquenessVar == 0) {
                response = await this.botResponseService.gameinfoError(msg.author.id, 'noGame');
                msg.channel.send(response);
                return;
            } else {
                response = await this.botResponseService.gameinfoError(msg.author.id, 'multipleGames');
                msg.channel.send(response)
                return;
            }
        }

        game = game[0];

        let focusArray = ['general', 'galaxy', 'player', 'technology', 'time'];
        if (!focusArray.includes(focus)) {
            let response = await this.botResponseService.gameinfoError(msg.author.id, 'noFocus');
            msg.channel.send(response);
        }

        const generateResponse = start => {
            let response;
            switch (start) {
                case 'general':
                    response = await this.botResponseService.gameinfoGeneral(game);
                    break;
                case 'galaxy':
                    response = await this.botResponseService.gameinfoGalaxy(game);
                    break;
                case 'player':
                    response = await this.botResponseService.gameinfoPlayer(game);
                    break;
                case 'technology':
                    response = await this.botResponseService.gameinfoTechnology(game);
                    break;
                case 'time':
                    response = await this.botResponseService.gameinfoTime(game);
            }
            return response;
        }

        msg.channel.send(generateResponse(focus)).then(message => {
            try {
                await message.react('⬅️')
                await message.react('➡️')
            } catch (error) {
                console.log('One of the emojis failed to react:', error);
            }
            const collector = message.createReactionCollector(
                (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === msg.author.id, { time: 60000 }
            );

            let currentPage = focusArray.indexOf(focus);
            collector.on('collect', reaction => {
                message.reactions.removeAll().then(async () => {
                    reaction.emoji.name === '⬅️' ? currentPage -= 1 : currentPage += 1;
                    if (currentPage < 0) currentPage = 4;
                    if (currentPage > 4) currentPage = 0;
                    message.edit(generateResponse(focusArray[currentPage]));
                    try {
                        await message.react('⬅️')
                        await message.react('➡️')
                    } catch (error) {
                        console.log('One of the emojis failed to react:', error);
                    }
                });
            });
        });
    }

    async help(msg, directions) {
        //!help <command>
        let id = msg.author.id;
        let response = `Hey <@${id}>,\n`;
        if (directions.length == 0) {
            response += this.botResponseService.helpMain;
            msg.channel.send(response);
        } else {
            switch (directions[0]) {
                case 'gameinfo':
                    response += this.botResponseService.helpGameinfo;
                    msg.channel.send(response);
                    break;
                case 'help':
                    response += this.botResponseService.helpHelp;
                    msg.channel.send(response);
                    break;
                case 'leaderboard_global':
                    response += this.botResponseService.helpLeaderboard_global
                    msg.channel.send(response);
                    break;
                case 'leaderboard_local':
                    response += this.botResponseService.helpLeaderboard_local
                    msg.channel.send(response);
                    break;
                case 'userinfo':
                    response += this.botResponseService.helpUserinfo
                    msg.channel.send(response);
                    break;
                default:
                    response += this.botResponseService.helpUnidentified
                    msg.channel.send(response);
            }
        }
    }

    async leaderboard_global(msg, directions) {
        //!leaderboard_global <filter> (<page>)

        // Calculating how the leaderboard looks
        let sortingKey = directions[0];
        let limit = await this.userService.getUserCount();
        let result = await this.leaderboardService.getLeaderboard(limit, sortingKey);
        let leaderboard = result.leaderboard;
        let pageCount = Math.ceil(leaderboard.length / 20)

        // here be dragons
        const getNestedObject = (nestedObj, pathArr) => {
            return pathArr.reduce((obj, key) =>
                (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
        }

        const generateLeaderboard = page => {
            let position_list = "";
            let username_list = "";
            let sortingKey_list = "";
            let lowerLimit = (page - 1) * 20 + 1
            let upperLimit = page * 20
            for (let i = lowerLimit; i < upperLimit; i++) {
                if (!leaderboard[i]) { break; }
                position_list += leaderboard[i].position + "\n";
                username_list += leaderboard[i].username + "\n";
                sortingKey_list += getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + "\n"
            }
            let response = await this.botResponseService.leaderboard_global(page, sortingKey, position_list, username_list, sortingKey_list)
            return response;
        }

        msg.channel.send(generateLeaderboard(1)).then(message => {
            try {
                await message.react('➡️')
                await message.react('⏩')
            } catch (error) {
                console.log('One of the emojis failed to react:', error);
            }
            const collector = message.createReactionCollector(
                (reaction, user) => ['⏪', '⬅️', '➡️', '⏩'].includes(reaction.emoji.name) && user.id == msg.author.id, { time: 60000 }
            )


            let currentPage = 1
            collector.on('collect', reaction => {
                message.reactions.removeAll().then(async () => {
                    switch (reaction.emoji.name) {
                        case '⏪':
                            currentPage -= 5
                            break;
                        case '⬅️':
                            currentPage -= 1
                            break;
                        case '➡️':
                            currentPage += 1
                            break;
                        default:
                            //⏩
                            currentPage += 5
                    }
                    if (currentPage < 1) currentPage = 1;
                    if (currentPage > pageCount) currentPage = pageCount;
                    message.edit(generateLeaderboard(currentPage));
                    if (currentPage > 2) await message.react('⏪');
                    if (currentPage != 1) await message.react('⬅️');
                    if (currentPage != pageCount) await message.react('➡️');
                    if (currentPage < pageCount - 1) message.react('⏩');
                });
            });
        });
    }

    async leaderboard_local(msg, directions) {
        //!leaderboard_local <galaxy_name> <filter> ("ID")

        let filter;
        let game = [];

        if (directions[directions.length - 1] == "ID") {
            game = await this.gameService.getByIdAll(directions[0])
            filter = directions[directions.length - 2]
        } else {
            if (directions.length === 1) {
                directions.push('general');
            }
            let game_name = "";
            for (let i = 0; i < directions.length - 1; i++) {
                game_name += directions[i] + ' ';
            }
            game_name = game_name.trim()
            game = await this.gameService.getByNameAll(game_name);
            filter = directions[directions.length - 1]
        }

        let response;
        let NameUniquenessVar = game.length;
        if (NameUniquenessVar != 1) {
            if (NameUniquenessVar == 0) {
                response = await this.botResponseService.leaderboard_localError(msg.author.id, 'noGame');
                msg.channel.send(response);
                return;
            } else {
                response = await this.botResponseService.leaderboard_localError(msg.author.id, 'multipleGames');
                msg.channel.send(response)
                return;
            }
        }

        let gameId = game[0]._id;
        let gameTick = game[0].galaxy.state.tick;
        game = await this.gameGalaxyService.getGalaxy(gameId, null, gameTick);

        if (game.setting.specialGalaxy.darkGalaxy == 'extra' || game.galaxy.state.endDate) {
            response = await this.botResponseService.leaderboard_localError(msg.author.id, 'extraDark');
            msg.channel.send(response)
            return;
        }
        if (!game.galaxy.state.startDate) {
            response = await this.botResponseService.leaderboard_localError(msg.author.id, 'notStarted');
            msg.channel.send(response)
            return;
        }

        let leaderboardReturn = await this.leaderboardService.getLeaderboardRankings(game, filter);
        let leaderboard = leaderboardReturn.leaderboard;
        let fullKey = leaderboardReturn.fullKey;

        let position_list = "";
        let username_list = "";
        let sortingKey_list = "";

        for (let i = 0; i < leaderboard.length; i++) {
            position_list += (i + 1) + "\n";
            username_list += leaderboard[i].player.alias + "\n";
            sortingKey_list += getNestedObject(leaderboard[i], fullKey.split('.')) + "\n"
        }


        let response = await this.botResponseService.leaderboard_local(gameId, sortingKey, position_list, username_list, sortingKey_list);

        msg.channel.send(response);
    }

    async userinfo(msg, directions) {
        //!userinfo <username>

        //Very important here to temporarily take down the userinfo function, because the response is too big. Has to be cut down using multipage responses combined with a focus.
        return;

        let username = "";
        for (let i = 0; i < directions.length; i++) {
            username += directions[i] + ' ';
        }
        username = username.trim();

        if (!(await this.userService.usernameExists(username))) return;

        let user = await this.userService.getByUsername(username);

        const response = await this.botResponseService.userinfo(user)

        msg.channel.send(response);
    }
}