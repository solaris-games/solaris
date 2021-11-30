module.exports = class PublicCommandService {

    constructor(botResponseService, botHelperService, gameGalaxyService, gameService, leaderboardService, userService) {
        this.botResponseService = botResponseService;
        this.botHelperService = botHelperService;
        this.gameGalaxyService = gameGalaxyService;
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
            try {
                game = await this.gameService.getByIdAllLean(directions[0])
            } catch (err) {
                return msg.channel.send(this.botResponseService.error(msg.author.id, 'noGame'));
            }

            focus = directions[directions.length - 2]
        } else {
            if (directions.length === 1) {
                directions.push('general');
            }
            for (let i = 0; i < directions.length - 1; i++) {
                game_name += directions[i] + ' ';
            }
            game_name = game_name.trim()
            game = await this.gameService.getByNameSettingsLean(game_name); // TODO: The game name is not indexed in this DB so this is going to be slow as shit.
            focus = directions[directions.length - 1]
        }

        let focusObject = {
            general: 0,
            galaxy: 1,
            player: 2,
            technology: 3,
            time: 4
        };

        if (!Object.keys(focusObject).includes(focus)) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noFocus'));
        }

        if (!game || (Array.isArray(game) && !game.length)) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noGame'));
        } else if (Array.isArray(game) && game.length > 1) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'multipleGames'));
        }

        if (Array.isArray(game)) {
            game = game[0];
        }

        const responseFunction = (responseData) => {
            if(responseData.isPC) {
                return this.botResponseService.gameinfoPC;
            }
            return this.botResponseService.gameinfoMobile;
        }

        msg.channel.send(response).then(async message => this.botHelperService.multiPage(message, msg, focusObject.length, true, responseFunction, {game, page: focusObject[focus]}, true));
    }

    async invite(msg, directions) {
        //$invite <gamelink>

        //plain and simple, extract the link to the game, from which we can extract the id from the game, which we then use to find the game
        let gamelink = directions[0];
        let gameId = gamelink.split('?id=')[1];

        if (gameId) {
            let game = await this.gameService.getByIdSettingsLean(gameId)

            if (!game) {
                return msg.channel.send(this.botResponseService.error(msg.author.id, 'noGame'));
            }

            let response = this.botResponseService.invite(game);
            msg.channel.send(response);
        } else {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noGame'));
        }
    }

    async help(msg, directions) {
        //$help
        let id = msg.author.id;
        let response = `Hey <@${id}>,\nPlease visit https://github.com/mike-eason/solaris/blob/master/bots/discord/README.md for help on how to interact with me.`;
        msg.channel.send(response);
    }

    async leaderboard_global(msg, directions) {
        //$leaderboard_global <filter> (<page>)
        // Calculating how the leaderboard looks

        //determining basic values for the leaderboard, which will be used much later in the program
        let sortingKey = directions[0];
        let leaderboardSize = await this.userService.getUserCount();
        let pageCount = Math.ceil(leaderboardSize / 20)

        let sorterArray = ['rank', 'victories', 'renown', 'joined', 'completed', 'quit', 'defeated', 'afk', 'ships-killed', 'carriers-killed', 'specialists-killed', 'ships-lost', 'carriers-lost', 'specialists-lost', 'stars-captured', 'stars-lost', 'home-stars-captured', 'home-stars-lost', 'economy', 'industry', 'science', 'warpgates-built', 'warpgates-destroyed', 'carriers-built', 'specialists-hired', 'scanning', 'hyperspace', 'terraforming', 'experimentation', 'weapons', 'banking', 'manufacturing', 'specialists', 'credits-sent', 'credits-received', 'technologies-sent', 'technologies-received', 'ships-gifted', 'ships-received', 'renown-sent', 'elo-rating'];
        
        if(!sorterArray.includes(sortingKey)){
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'invalidSorter'));
        }

        const generateLeaderboard = async (object) => {
            let page = object.page;
            let isPC = object.isPC;
            let key = object.sortingKey
            //determining the message that has to be sent with the given input
            let limit = 20
            let skip = 20 * page // Page 0 is the first page
            let result = await this.leaderboardService.getLeaderboard(limit, key, skip);
            let leaderboard = result.leaderboard;
            if(isPC){
                //Generates the response if the response has to be in a format readable to PC users
                let position_list = "";
                let username_list = "";
                let sortingKey_list = "";
                for (let i = 0; i < leaderboard.length; i++) {
                    if (!leaderboard[i]) { break; }
                    position_list += (leaderboard[i].position + page * 20) + "\n";
                    username_list += leaderboard[i].username + "\n";
                    sortingKey_list += this.botHelperService.getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + "\n"
                }
                let response = this.botResponseService.leaderboard_globalPC(page, sortingKey, position_list, username_list, sortingKey_list)
                return response;
            }
            //This only runs now if the response is for mobile/tablet users
            let data_list = "";
            for (let i = 0; i<leaderboard.length; i++) {
                if(!leaderboard[i]) { break; }
                data_list += (leaderboard[i].position + page * 20) + ' / ' + this.botHelperService.getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + ' / ' + leaderboard[i].username + '\n';
            }
            let response = this.botResponseService.leaderboard_globalMobile(page, sortingKey, data_list);
            return response;
        }

        let isPC = true;
        msg.channel.send(await generateLeaderboard({page:0, isPC, sortingKey})).then(async message => this.botHelperService.multiPage(message, msg, pageCount, false, generateLeaderboard, {page: 0, isPC, sortingKey}, true));
    }

    async leaderboard_local(msg, directions) {
        //$leaderboard_local <galaxy_name> <filter> ("ID")

        let filter;
        let game = [];

        //checking if the <galaxy_name> is actually the name or just the ID of a game
        if (directions[directions.length - 1] == "ID") {
            game = await this.gameService.getByIdAllLean(directions[0])
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
            game = await this.gameService.getByNameStateSettingsLean(game_name);
            filter = directions[directions.length - 1]
        }

        //checking if we actually got 1 game, instead of 0 or more than 1, in which case we have to send an error message
        let response;
        
        if (!game.length) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noGame'));
        } else if (game.length > 1) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'multipleGames'));
        }

        game = game[0];

        if (game.settings.specialGalaxy.darkGalaxy == 'extra' && !game.state.endDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'extraDark'))
        }
        if (!game.state.startDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'notStarted'))
        }

        //getting the info from a game that may be public for sure, so we cant accidently spill all the secrets
        let gameId = game._id;
        let gameTick = game.state.tick;
        game = await this.gameGalaxyService.getGalaxy(gameId, null, gameTick);

        const responseFunction = (responseData) => {
            let game = responseData.game;
            let filter = responseData.filter;
            let isPC = responseData.isPC;
            let leaderboardReturn = this.leaderboardService.getLeaderboardRankings(game, filter);
            let leaderboard = leaderboardReturn.leaderboard;
            let fullKey = leaderboardReturn.fullKey;
            //creating the rankings so it fits in one message
            if(isPC) {
                let position_list = "";
                let username_list = "";
                let sortingKey_list = "";
                for (let i = 0; i < leaderboard.length; i++) {
                    position_list += (i + 1) + "\n";
                    username_list += leaderboard[i].player.alias + "\n";
                    sortingKey_list += this.botHelperService.getNestedObject(leaderboard[i], fullKey.split('.')) + "\n";
                }
                return this.botResponseService.leaderboard_localPC(game._id, game.state.tick, filter, position_list, username_list, sortingKey_list);
            } else {
                let data_list = "";
                for (let i = 0; i < leaderboard.length; i++) {
                    data_list += (i + 1) + ' / ' + this.botHelperService.getNestedObject(leaderboard[i], fullKey.split('.')) + ' / ' + leaderboard[i].player.alias + '\n';
                }
                return this.botResponseService.leaderboard_localMobile(game._id, game.state.tick, filter, data_list);
            }
        }        

        let isPC = true; //Standard for now, as you define this with a reaction after the message has been sent
        msg.channel.send(await responseFunction({game, filter, isPC})).then(async message => this.botHelperService.PCorMobile(message, msg, isPC, responseFunction, {game, filter, isPC}));
    }

    async status(msg, directions) {
        let game;
        if (directions[directions.length - 1] == "ID") {
            game = await this.gameService.getByIdAllLean(directions[0])
        } else {
            let game_name = "";
            for (let i = 0; i < directions.length; i++) {
                game_name += directions[i] + ' ';
            }
            game_name = game_name.trim()
            game = await this.gameService.getByNameStateSettingsLean(game_name);
        }

        if (!game.length) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noGame'));
        } else if (game.length > 1) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'multipleGames'));
        }

        game = game[0];

        if (game.settings.specialGalaxy.darkGalaxy == 'extra' && !game.state.endDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'extraDark'))
        }
        if (!game.state.startDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'notStarted'))
        }

        let gameId = game._id;
        let gameTick = game.state.tick;
        game = await this.gameGalaxyService.getGalaxy(gameId, null, gameTick);

        const generateResponse = async (responseData) => {
            let isPC = responseData.isPC;
            if (isPC) {
                return this.botResponseService.statusPC(responseData);
            }
            return this.botResponseService.statusMobile(responseData);
        }

        let leaderboardData = {
            stars: this.leaderboardService.getLeaderboardRankings(game, 'stars'),
            ships: this.leaderboardService.getLeaderboardRankings(game, 'ships'),
            newShips: this.leaderboardService.getLeaderboardRankings(game, 'newShips'),
            economy: this.leaderboardService.getLeaderboardRankings(game, 'economy'),
            industry: this.leaderboardService.getLeaderboardRankings(game, 'industry'),
            science: this.leaderboardService.getLeaderboardRankings(game, 'science'),
            weapons: this.leaderboardService.getLeaderboardRankings(game, 'weapons'),
            manufacturing: this.leaderboardService.getLeaderboardRankings(game, 'manufacturing'),
            specialists: this.leaderboardService.getLeaderboardRankings(game, 'specialists')
        }
        let alive = game.galaxy.players.reduce((val, player) => player.afk || player.defeated ? val : val + 1, 0)
        let leaderboard = {};
        let leaderboardSize = game.settings.general.playerLimit <= 3 ? game.settings.general.playerLimit : 3;
        for(let [key, value] of Object.entries(leaderboardData)){
            leaderboard[key] = ""
            for(let i = 0; i < leaderboardSize; i++) {
                leaderboard[key] += await this.botHelperService.getNestedObject(value.leaderboard[i], value.fullKey.split('.')) + ' / ' + value.leaderboard[i].player.alias + '\n';
            }
        }

        let isPC = true;
        let data = {game, leaderboard, alive, isPC};
        msg.channel.send(await generateResponse(data)).then(message => this.PCorMobile(message, msg, generateResponse, data));
    }

    async userinfo(msg, directions) {
        //$userinfo <username> <focus>

        //getting the basic values, like the focus and more importantly the username of the person we want to find
        let focus = directions[directions.length - 1];

        let focusArray = ['games', 'combat', 'infrastructure', 'research', 'trade'];

        if (!focusArray.includes(focus)) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noFocus'));
        }

        let username = "";
        for (let i = 0; i < directions.length - 1; i++) {
            username += directions[i] + ' ';
        }
        username = username.trim();

        if (!(await this.userService.usernameExists(username))) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noUser'));
        }

        let user = await this.userService.getByUsernameAchievementsLean(username);

        let response = this.botResponseService.userinfo(user, focus);

        msg.channel.send(response).then(async message => {
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

    async PCorMobile(botMessage, userMessage, isPC, responseFunction, responseData) {
        try {
            botMessage.react('📱');
        } catch (error) {
            console.log('One of the emojis failed to react:', error);
        }

        const collector = botMessage.createReactionCollector(
            (reaction, user) => (reaction.emoji.name === '📱') && (user.id === userMessage.author.id), { time: 60000 }
        )

        collector.on('collect', () => {
            botMessage.reactions.removeAll().then(async () => {
                isPC = !isPC
                let editedResponse = this.botResponseService[await responseFunction(isPC)](responseData);
                botMessage.edit(editedResponse);

                try {
                    botMessage.react('📱');
                } catch (error) {
                    console.log('One of the emojis failed to react:', error);
                }
            })
        });
    }
}