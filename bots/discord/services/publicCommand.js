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
            game = await this.gameService.getByNameAll(game_name); // TODO: The game name is not indexed in this DB so this is going to be slow as shit.
            focus = directions[directions.length - 1]
        }

        if (!game.length) {
            return msg.channel.send(this.botResponseService.gameinfoError(msg.author.id, 'noGame'));
        } else if (game.length > 1) {
            return msg.channel.send(this.botResponseService.gameinfoError(msg.author.id, 'multipleGames'));
        }

        game = game[0];

        let focusArray = ['general', 'galaxy', 'player', 'technology', 'time'];
        if (!focusArray.includes(focus)) {
            let response = this.botResponseService.gameinfoError(msg.author.id, 'noFocus');
            msg.channel.send(response);
        }

        let response = this.botResponseService.gameinfo(game, focus);

        msg.channel.send(response).then(message => {
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

                    let editedResponse = this.botResponseService.gameinfo(game, focusArray[currentPage]);

                    message.edit(editedResponse);
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

    async invite(msg, directions) {
        //$invite <gamelink>
        let gamelink = directions[0];
        let gameId = gamelink.split('?id=')[1];

        if (gameId) {
            let game = this.gameService.getByIdAll(gameId)
            let response = this.botResponseService.invite(game);
            msg.channel.send(response);
        } else {
            // TODO: Return an error to the chat.
        }
    }

    async help(msg, directions) {
        //$help
        let id = msg.author.id;
        let response = `Hey <@${id}>,\nPlease visit https://github.com/mike-eason/solaris/bots/discord/README.md for help on how to interact with me.`;
        msg.channel.send(response);
    }

    async leaderboard_global(msg, directions) {
        //$leaderboard_global <filter> (<page>)

        // Calculating how the leaderboard looks
        let sortingKey = directions[0];
        let leaderboardSize = await this.userService.getUserCount();
        let pageCount = Math.ceil(leaderboardSize / 20)

        //Here be dragons
        const getNestedObject = (nestedObj, pathArr) => {
            return pathArr.reduce((obj, key) =>
                (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
        }

        const generateLeaderboard = page => {
            let limit = 20
            let skip = 20 * (page - 1)
            let result = await this.leaderboardService.getLeaderboard(limit, sortingKey, skip);
            let leaderboard = result.leaderboard;
            let position_list = "";
            let username_list = "";
            let sortingKey_list = "";
            for (let i = 0; i < leaderboard.length; i++) {
                if (!leaderboard[i]) { break; }
                position_list += leaderboard[i].position + "\n";
                username_list += leaderboard[i].username + "\n";
                sortingKey_list += getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + "\n"
            }
            let response = this.botResponseService.leaderboard_global(page, sortingKey, position_list, username_list, sortingKey_list)
            return response;
        }

        //Here be demons
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
                            currentPage -= 5 // TODO: This should go to page 1?
                            break;
                        case '⬅️':
                            currentPage -= 1
                            break;
                        case '➡️':
                            currentPage += 1
                            break;
                        default:
                            //⏩
                            currentPage += 5 // TODO: This should go to the last page?
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
        //$leaderboard_local <galaxy_name> <filter> ("ID")

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
        
        if (!game.length) {
            return msg.channel.send(this.botResponseService.gameinfoError(msg.author.id, 'noGame'));
        } else if (game.length > 1) {
            return msg.channel.send(this.botResponseService.gameinfoError(msg.author.id, 'multipleGames'));
        }

        let gameId = game[0]._id;
        let gameTick = game[0].galaxy.state.tick;
        game = await this.gameGalaxyService.getGalaxy(gameId, null, gameTick);

        if (game.setting.specialGalaxy.darkGalaxy == 'extra' || game.galaxy.state.endDate) {
            response = this.botResponseService.leaderboard_localError(msg.author.id, 'extraDark');
            msg.channel.send(response)
            return;
        }
        if (!game.galaxy.state.startDate) {
            response = this.botResponseService.leaderboard_localError(msg.author.id, 'notStarted');
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

        let response = this.botResponseService.leaderboard_local(gameId, sortingKey, position_list, username_list, sortingKey_list);

        msg.channel.send(response);
    }

    async userinfo(msg, directions) {
        //$userinfo <username> <focus>

        let focus = directions[directions.length - 1];
        let username = "";
        for (let i = 0; i < directions.length - 1; i++) {
            username += directions[i] + ' ';
        }
        username = username.trim();

        if (!(await this.userService.usernameExists(username))) {
            //Send error message
            return;
        }

        let user = await this.userService.getByUsername(username);

        let focusArray = ['games', 'combat', 'infrastructure', 'research', 'trade'];
        if (!focusArray.includes(focus)) {
            let response = this.botResponseService.gameinfoError(msg.author.id, 'noFocus');
            msg.channel.send(response);
        }

        let response = this.botResponseService.userinfo(user, focus);

        msg.channel.send(response).then(message => {
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

                    let editedResponse = this.botResponseService.userinfo(user, focusArray[currentPage]);

                    message.edit(editedResponse);

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
}