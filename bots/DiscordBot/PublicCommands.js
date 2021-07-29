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

        //getting the gameObject from the database
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

        //checking if we indeed got just a single game from the database
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

        //checking if the focus the player specified actually exists
        let focusArray = ['general', 'galaxy', 'player', 'technology', 'time'];
        if (!focusArray.includes(focus)) {
            let response = await this.botResponseService.gameinfoError(msg.author.id, 'noFocus');
            msg.channel.send(response);
        }

        //determining which focus is required, and calling the appropriate bot response
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
            //after sending the message, respond with the right reactions in the right order so a player can move to the next page
            try {
                await message.react('⬅️')
                await message.react('➡️')
            } catch (error) {
                console.log('One of the emojis failed to react:', error);
            }
            const collector = message.createReactionCollector(
                //checking if the response was from the right person and with the right response
                (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === msg.author.id, { time: 60000 }
            );

            let currentPage = focusArray.indexOf(focus);
            collector.on('collect', reaction => {
                //remove all reactions to add the correct ones after the edit
                message.reactions.removeAll().then(async () => {
                    //checking what change has to be made to the current message
                    reaction.emoji.name === '⬅️' ? currentPage -= 1 : currentPage += 1;
                    if (currentPage < 0) currentPage = 4;
                    if (currentPage > 4) currentPage = 0;
                    //editing the old message to the appropriate new message
                    message.edit(generateResponse(focusArray[currentPage]));
                    //adding new reactions to the edited message
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

        //plain and simple, extract the link to the game, from which we can extract the id from the game, which we then use to find the game
        let gamelink = directions[0];
        let gameId = gamelink.split('?id=');
        let game = this.gameService.getByIdAll(gameId);
        let response;
        if(!game.settings.general.name) {
            response = await this.botResponseService.inviteError(msg.author.id, 'noUser');
            msg.channel.send(response);
            return;
        }
        //formulate the response using the gamedata we have extracted
        response = this.botResponseService.invite(game);
        msg.channel.send(response);
    }

    async help(msg, directions) {
        //$help <command>
        let id = msg.author.id;
        //setting up the basic response here so a constant message can be added after it, basically personalising the help message that tiny bit
        let response = `Hey <@${id}>,\n`;

        //determining which help message should be added to the personalised start of the message
        if (directions.length == 0) {
            response += this.botResponseService.helpMain;
        } else {
            switch (directions[0]) {
                case 'gameinfo':
                    response += this.botResponseService.helpGameinfo;
                    break;
                case 'invite':
                    response += this.botResponseService.helpInvite
                    break;
                case 'help':
                    response += this.botResponseService.helpHelp;
                    break;
                case 'leaderboard_global':
                    response += this.botResponseService.helpLeaderboard_global
                    break;
                case 'leaderboard_local':
                    response += this.botResponseService.helpLeaderboard_local
                    break;
                case 'userinfo':
                    response += this.botResponseService.helpUserinfo
                    break;
                default:
                    response += this.botResponseService.helpUnidentified
            }
        }
        msg.channel.send(response);
    }

    async leaderboard_global(msg, directions) {
        //$leaderboard_global <filter> (<page>)
        // Calculating how the leaderboard looks

        //determining basic values for the leaderboard, which will be used much later in the program
        let sortingKey = directions[0];
        let leaderboardSize = await this.userService.getUserCount();
        let pageCount = Math.ceil(leaderboardSize / 20)

        //Here be dragons
        const getNestedObject = (nestedObj, pathArr) => {
            return pathArr.reduce((obj, key) =>
                (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
        }

        const generateLeaderboard = page => {
            //determining the message that has to be sent with the given input
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
            let response = await this.botResponseService.leaderboard_global(page, sortingKey, position_list, username_list, sortingKey_list)
            return response;
        }

        msg.channel.send(generateLeaderboard(1)).then(message => {
            //reacting with the appropriate reactions so a player can move to the next page
            try {
                await message.react('➡️')
                await message.react('⏩')
            } catch (error) {
                console.log('One of the emojis failed to react:', error);
            }
            const collector = message.createReactionCollector(
                //defining the collector so it only responds to reactions of the right person and the right reaction
                (reaction, user) => ['⏪', '⬅️', '➡️', '⏩'].includes(reaction.emoji.name) && user.id == msg.author.id, { time: 60000 }
            )


            let currentPage = 1
            collector.on('collect', reaction => {
                //removing all reactions after one was added by the right person
                message.reactions.removeAll().then(async () => {
                    //determining which reaction was added, and what change has to be made to the page number
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
                    //editing the existing message so the new page is displayed for the discord user
                    message.edit(generateLeaderboard(currentPage));
                    //adding the reactions so the player can go to another page from here
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

        //checking if the <galaxy_name> is actually the name or just the ID of a game
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

        //checking if we actually got 1 game, instead of 0 or more than 1, in which case we have to send an error message
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

        //getting the info from a game that may be public for sure, so we cant accidently spill all the secrets
        let gameId = game[0]._id;
        let gameTick = game[0].galaxy.state.tick;
        game = await this.gameGalaxyService.getGalaxy(gameId, null, gameTick);

        //checking if we may actually say anything about a game or whether it hasnt started yet, or is extraDark and ongoing
        if (game.setting.specialGalaxy.darkGalaxy == 'extra' && !game.galaxy.state.endDate) {
            response = await this.botResponseService.leaderboard_localError(msg.author.id, 'extraDark');
            msg.channel.send(response)
            return;
        }
        if (!game.galaxy.state.startDate) {
            response = await this.botResponseService.leaderboard_localError(msg.author.id, 'notStarted');
            msg.channel.send(response)
            return;
        }

        //getting the local leaderboards for our chosen sortingkey
        let leaderboardReturn = await this.leaderboardService.getLeaderboardRankings(game, filter);
        let leaderboard = leaderboardReturn.leaderboard;
        let fullKey = leaderboardReturn.fullKey;

        let position_list = "";
        let username_list = "";
        let sortingKey_list = "";

        //creating the rankings so it fits in one message
        for (let i = 0; i < leaderboard.length; i++) {
            position_list += (i + 1) + "\n";
            username_list += leaderboard[i].player.alias + "\n";
            sortingKey_list += getNestedObject(leaderboard[i], fullKey.split('.')) + "\n"
        }

        //generating and sending a response from the calculated variables
        let response = await this.botResponseService.leaderboard_local(gameId, sortingKey, position_list, username_list, sortingKey_list);
        msg.channel.send(response);
    }

    async userinfo(msg, directions) {
        //$userinfo <username> <focus>

        //getting the basic values, like the focus and more importantly the username of the person we want to find
        let focus = directions[directions.length - 1];
        let username = "";
        for (let i = 0; i < directions.length - 1; i++) {
            username += directions[i] + ' ';
        }
        username = username.trim();

        let response;
        if (!(await this.userService.usernameExists(username))) {
            response = await this.botResponseService.gameinfoError(msg.author.id, 'noUser')
            return;
        }

        let user = await this.userService.getByUsername(username);

        //checking if the specified focus exists
        let focusArray = ['games', 'combat', 'infrastructure', 'research', 'trade'];
        if (!focusArray.includes(focus)) {
            response = await this.botResponseService.gameinfoError(msg.author.id, 'noFocus');
            msg.channel.send(response);
        }

        //defining a response based on the focus specified by the player
        const generateResponse = start => {
            switch (start) {
                case 'games':
                    response = await this.botResponseService.userinfoGames(user);
                    break;
                case 'combat':
                    response = await this.botResponseService.userinfoCombat(user);
                    break;
                case 'infrastructure':
                    response = await this.botResponseService.userinfoInfrastructure(user);
                    break;
                case 'research':
                    response = await this.botResponseService.userinfoResearch(user);
                    break;
                case 'trade':
                    response = await this.botResponseService.userinfoTrade(user);
            }
            return response;
        }

        msg.channel.send(generateResponse(focus)).then(message => {
            //sending the message and responding with a reaction to make sure people can get to the next page of userinfo
            try {
                await message.react('⬅️')
                await message.react('➡️')
            } catch (error) {
                console.log('One of the emojis failed to react:', error);
            }
            const collector = message.createReactionCollector(
                //defining a collector that checks if the right user reacted with the right reaction
                (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === msg.author.id, { time: 60000 }
            );

            let currentPage = focusArray.indexOf(focus);
            collector.on('collect', reaction => {
                //removing all reactions to add them later, so the user his reaction is also removed
                message.reactions.removeAll().then(async () => {
                    //determining which reaction was used and with that checking what page we have to turn to
                    reaction.emoji.name === '⬅️' ? currentPage -= 1 : currentPage += 1;
                    if (currentPage < 0) currentPage = 4;
                    if (currentPage > 4) currentPage = 0;
                    //generating a response based of the new page and editing the message to that
                    message.edit(generateResponse(focusArray[currentPage]));
                    //reacting with the new reactions so the person who started the chain can move to even another page if desired
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