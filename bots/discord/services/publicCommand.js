module.exports = class PublicCommandService {

    constructor(botResponseService, botHelperService, gameGalaxyService, gameService, leaderboardService, userService, gameTypeService) {
        this.botResponseService = botResponseService;
        this.botHelperService = botHelperService;
        this.gameGalaxyService = gameGalaxyService;
        this.gameService = gameService;
        this.leaderboardService = leaderboardService;
        this.userService = userService;
        this.gameTypeService = gameTypeService;
    }

    async gameinfo(msg, directions) {
        //!gameinfo <galaxy_name> <focus> ("ID")

        // This checks if the gameID/name is valid and fetches the game with that ID/name if it exists
        let game = [];
        let focus;
        let game_name = "";
        if (directions[directions.length - 1] == "ID") {
            if (this.botHelperService.isValidID(directions[0])) {
                game = await this.gameService.getByIdAllLean(directions[0])
            } else {
                return msg.channel.send(this.botResponseService.error(msg.author.id, 'invalidID'))
            }

            focus = directions[directions.length - 2]
        } else {
            // Gamename can be searched, as it is filtered for uniqueness and existance later
            if (directions.length === 1) {
                directions.push('general');
            }
            for (let i = 0; i < directions.length - 1; i++) {
                game_name += directions[i] + ' ';
            }
            game_name = game_name.trim()
            game = await this.gameService.getByNameSettingsLean(game_name); // Slow...
            focus = directions[directions.length - 1]
        }

        const focusObject = {
            general: 0,
            galaxy: 1,
            player: 2,
            technology: 3,
            time: 4
        };
        const focusArray = Object.keys(focusObject);

        // Checking if a game was found with the specified ID or name
        if (!this.botHelperService.isValidGame(game, msg)) {
            return;
        }
        game = this.botHelperService.isValidGame(game, msg);

        // Checking if the focus exists, which must be done after the game has been verified
        if (!this.botHelperService.isValidFocus(focus, focusArray, msg)) return;

        // This function is used to calculate from the responsedata what the response looks like
        // This function can then, combined with the responseData, be passed onto a generic multiPage/PCorMobile function
        // That allows all unique commands to use the same multiPage/PCorMobile function, as they have a unique responseFunction and data
        const responseFunction = async (responseData) => {
            let game = responseData.game;
            let page = responseData.page;
            let isPC = responseData.isPC;
            return await this.botResponseService.gameinfo(game, page, isPC);
        }

        // This is the response data previously discussed that gets passed into the multiPage and the response function
        let responseData = {
            game,
            page: focusObject[focus],
            isPC: true
        };

        // Sending the message, and activating the multiPage function, as the gameinfo has 5 looping pages
        msg.channel.send(await responseFunction(responseData))
            .then(async message => this.botHelperService.multiPage(message, msg, Object.keys(focusObject).length, true, responseFunction, responseData, true));
    }

    async invite(msg, directions) {
        // $invite <gamelink>

        // Plain and simple, extract the link to the game, from which we can extract the id from the game, which we then use to find the game
        let gamelink = directions[0];
        let gameId = (gamelink.split('?id='))[1];
        let game;

        // This checks if the gameID is valid and fetches the game with that ID if it exists
        if (gameId) {
            if (this.botHelperService.isValidID(gameId)) {
                game = await this.gameService.getByIdSettingsLean(gameId)
            } else {
                return msg.channel.send(this.botResponseService.error(msg.author.id, 'invalidID'))
            }

            if (!game) {
                return msg.channel.send(this.botResponseService.error(msg.author.id, 'noGame'));
            }

        } else {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'invalidID'));
        }

        // Sending the final message
        return msg.channel.send(this.botResponseService.invite(game))
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

        // Determining basic values for the leaderboard, which will be used much later in the program
        let sortingKey = directions[0];
        let leaderboardSize = await this.userService.getUserCount();
        let pageCount = Math.ceil(leaderboardSize / 20)

        // All possible and allowed sorters that can be used
        let sorterArray = ['rank', 'victories', 'renown', 'joined', 'completed', 'quit', 'defeated', 'afk', 'ships-killed',
            'carriers-killed', 'specialists-killed', 'ships-lost', 'carriers-lost', 'specialists-lost', 'stars-captured', 'stars-lost',
            'home-stars-captured', 'home-stars-lost', 'economy', 'industry', 'science', 'warpgates-built', 'warpgates-destroyed',
            'carriers-built', 'specialists-hired', 'scanning', 'hyperspace', 'terraforming', 'experimentation', 'weapons', 'banking',
            'manufacturing', 'specialists', 'credits-sent', 'credits-received', 'technologies-sent', 'technologies-received',
            'ships-gifted', 'ships-received', 'renown-sent', 'elo-rating'];

        // Checking if the sorter that the player specified is actually allowed
        if (!this.botHelperService.isValidFocus(sortingKey, sorterArray, msg)) return;

        // This function is used to calculate from the responsedata what the response looks like
        // This function can then, combined with the responseData, be passed onto a generic multiPage/PCorMobile function
        // That allows all unique commands to use the same multiPage/PCorMobile function, as they have a unique responseFunction and data
        const responseFunction = async (responseData) => {
            // Calculating the basic variables that set all others from the responseData
            let page = responseData.page;
            let isPC = responseData.isPC;
            let key = responseData.sortingKey;

            // Getting all the actual detailed information from the global leaderboard
            let limit = 20
            let skip = 20 * page // Page 0 is the first page
            let result = await this.leaderboardService.getLeaderboard(limit, key, skip);
            let leaderboard = result.leaderboard;
            if (isPC) {
                // Generates the response if the response has to be in a format optimised for PC users
                let position_list = "";
                let username_list = "";
                let sortingKey_list = "";
                for (let i = 0; i < leaderboard.length; i++) {
                    if (!leaderboard[i]) { break; }
                    position_list += (leaderboard[i].position + page * 20) + "\n";
                    username_list += leaderboard[i].username + "\n";
                    sortingKey_list += await this.botHelperService.getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + "\n"
                }
                let response = this.botResponseService.leaderboard_globalPC(page, sortingKey, position_list, username_list, sortingKey_list)
                return response;
            }
            // This only runs now if the response is for mobile/tablet users
            // It is made to generate a response that makes sense to those users
            let data_list = "";
            for (let i = 0; i < leaderboard.length; i++) {
                if (!leaderboard[i]) { break; }
                data_list += (leaderboard[i].position + page * 20) + ' / ' + await this.botHelperService.getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + ' / ' + leaderboard[i].username + '\n';
            }
            let response = this.botResponseService.leaderboard_globalMobile(page, sortingKey, data_list);
            return response;
        }

        // Generating the responseData, which in turn, fixes the message of the bot together with the responseFunction
        let responseData = {
            page: 0,
            isPC: true,
            sortingKey
        }

        // Sending the message, and activating the multiPage function, as the global leaderboard has tons and tons of non-looping pages
        msg.channel.send(await responseFunction(responseData))
            .then(async message => this.botHelperService.multiPage(message, msg, pageCount, false, responseFunction, responseData, true));
    }

    async leaderboard_local(msg, directions) {
        //$leaderboard_local <galaxy_name> <filter> ("ID")

        let sortingKey;
        let game = [];

        // Checking if the <galaxy_name> is actually the name or just the ID of a game
        // And when that has been determined, extract the game and ID
        if (directions[directions.length - 1] == "ID") {
            if (this.botHelperService.isValidID(directions[0])) {
                game = await this.gameService.getByIdAllLean(directions[0])
            } else {
                return msg.channel.send(this.botResponseService.error(msg.author.id, 'invalidID'))
            }
            sortingKey = directions[directions.length - 2]
        } else {
            if (directions.length === 1) {
                directions.push('stars');
            }
            let game_name = "";
            for (let i = 0; i < directions.length - 1; i++) {
                game_name += directions[i] + ' ';
            }
            game_name = game_name.trim()
            game = await this.gameService.getByNameStateSettingsLean(game_name);
            sortingKey = directions[directions.length - 1]
        }

        const sorterArray = ['stars', 'carriers', 'ships', 'economy', 'industry', 'science', 'newShips', 'warpgates', 'starSpecialists', 'carrierSpecialists',
            'totalSpecialists', 'scanning', 'hyperspace', 'terraforming', 'experimentation', 'weapons', 'banking', 'manufacturing', 'specialists']

        // Checking if the sorter that the player specified is actually allowed
        if (!this.botHelperService.isValidFocus(sortingKey, sorterArray, msg)) return;

        // Checking if we actually got 1 game, instead of 0 or more than 1, in which case we have to send an error message
        if (!this.botHelperService.isValidGame(game, msg)) {
            return;
        }
        game = this.botHelperService.isValidGame(game, msg);

        // Checking if we may actually give information about the game, so if it is an ongoing dark game, or an unstarted game
        if (this.gameTypeService.isDarkModeExtra(game) && !game.state.endDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'extraDark'))
        }
        if (!game.state.startDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'notStarted'))
        }

        // Getting the game from a neutral observer with the getGalaxy function, this makes sure that all info that goes in will be public for sure
        let gameId = game._id;
        let gameTick = game.state.tick;
        game = await this.gameGalaxyService.getGalaxy(gameId, null, gameTick);

        // This function is used to calculate from the responsedata what the response looks like
        // This function can then, combined with the responseData, be passed onto a generic multiPage/PCorMobile function
        // That allows all unique commands to use the same multiPage/PCorMobile function, as they have a unique responseFunction and data
        const responseFunction = async (responseData) => {
            // Getting the basic info that we'll need from the responseData
            let game = responseData.game;
            let sortingKey = responseData.sortingKey;
            let isPC = responseData.isPC;

            // Generating a leaderboard in the official format
            let leaderboardReturn = this.leaderboardService.getLeaderboardRankings(game, sortingKey);
            let leaderboard = leaderboardReturn.leaderboard;
            let fullKey = leaderboardReturn.fullKey;

            // Turning the leaderboard in a message format
            if (isPC) {
                // Generating the format for the PC users
                let position_list = "";
                let username_list = "";
                let sortingKey_list = "";
                for (let i = 0; i < leaderboard.length; i++) {
                    position_list += (i + 1) + "\n";
                    username_list += leaderboard[i].player.alias + "\n";
                    sortingKey_list += await this.botHelperService.getNestedObject(leaderboard[i], fullKey.split('.')) + "\n";
                }
                return this.botResponseService.leaderboard_localPC(game._id, game.state.tick, sortingKey, position_list, username_list, sortingKey_list);
            }
            // Generating the format for mobile/tablet users
            let data_list = "";
            for (let i = 0; i < leaderboard.length; i++) {
                data_list += (i + 1) + ' / ' + await this.botHelperService.getNestedObject(leaderboard[i], fullKey.split('.')) + ' / ' + leaderboard[i].player.alias + '\n';
            }
            return this.botResponseService.leaderboard_localMobile(game._id, game.state.tick, sortingKey, data_list);
        }

        // Generating the responseData, which in turn, fixes the message of the bot together with the responseFunction
        let responseData = {
            game,
            sortingKey,
            isPC: true
        }

        // Sending the message, and activating the PCorMobile function, as the local leaderboard is usable for both mobile and PC users
        msg.channel.send(await responseFunction(responseData))
            .then(async message => this.botHelperService.PCorMobile(message, msg, responseFunction, responseData));
    }

    async status(msg, directions) {
        // $status <galaxy_name> ("ID")

        // Checking if the <galaxy_name> is actually the name or just the ID of a game
        // And when that has been determined, extract the game and ID
        let game;
        if (directions[directions.length - 1] == "ID") {
            if (this.botHelperService.isValidID(directions[0])) {
                game = await this.gameService.getByIdAllLean(directions[0])
            } else {
                return msg.channel.send(this.botResponseService.error(msg.author.id, 'invalidID'))
            }
        } else {
            let game_name = "";
            for (let i = 0; i < directions.length; i++) {
                game_name += directions[i] + ' ';
            }
            game_name = game_name.trim()
            game = await this.gameService.getByNameStateSettingsLean(game_name);
        }

        // Checking if we actually got 1 game, instead of 0 or more than 1, in which case we have to send an error message
        if (!this.botHelperService.isValidGame(game, msg)) {
            return;
        }
        game = this.botHelperService.isValidGame(game, msg);

        // Checking if we may actually give information about the game, so if it is an ongoing dark game, or an unstarted game
        if (this.gameTypeService.isDarkModeExtra(game) && !game.state.endDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'extraDark'))
        }
        if (!game.state.startDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'notStarted'))
        }

        // Getting the game from a neutral observer with the getGalaxy function, this makes sure that all info that goes in will be public for sure
        let gameId = game._id;
        let gameTick = game.state.tick;
        game = await this.gameGalaxyService.getGalaxy(gameId, null, gameTick);

        // This function is used to calculate from the responsedata what the response looks like
        // This function can then, combined with the responseData, be passed onto a generic multiPage/PCorMobile function
        // That allows all unique commands to use the same multiPage/PCorMobile function, as they have a unique responseFunction and data
        const responseFunction = async (responseData) => {
            // Getting the basic info that we'll need from the responseData
            let isPC = responseData.isPC;
            let game = responseData.game;
            let leaderboard = responseData.leaderboard;
            let alive = responseData.alive;
            if (isPC) {
                // Generating the format for PC users
                return this.botResponseService.statusPC(game, leaderboard, alive);
            }
            // Generating the format for mobile/tablet users
            return this.botResponseService.statusMobile(game, leaderboard);
        }

        // Generating the local leaderboards for the requested game
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

        // Calculating the count of living players
        let alive = game.galaxy.players.reduce((val, player) => player.defeated ? val : val + 1, 0)
        let leaderboard = {};
        let leaderboardSize = game.settings.general.playerLimit <= 3 ? game.settings.general.playerLimit : 3;

        // Generating the leaderboard in the right format
        for (let [key, value] of Object.entries(leaderboardData)) {
            leaderboard[key] = ""
            for (let i = 0; i < leaderboardSize; i++) {
                leaderboard[key] += await this.botHelperService.getNestedObject(value.leaderboard[i], value.fullKey.split('.')) + ' / ' + value.leaderboard[i].player.alias + '\n';
            }
        }

        // Generating the responseData, which in turn, fixes the message of the bot together with the responseFunction
        let responseData = {
            game,
            leaderboard,
            alive,
            isPC: true
        };

        // Sending the message, and activating the PCorMobile function, as the status is usable for both mobile and PC users
        msg.channel.send(await responseFunction(responseData))
            .then(async message => this.botHelperService.PCorMobile(message, msg, responseFunction, responseData));
    }

    async userinfo(msg, directions) {
        //$userinfo <username> <focus>

        //getting the basic values about the focus
        let focus = directions[directions.length - 1];

        const focusObject = {
            games: 0,
            combat: 1,
            infrastructure: 2,
            research: 3,
            trade: 4
        };
        const focusArray = Object.keys(focusObject);

        // Checking if the focus exists
        if (!this.botHelperService.isValidFocus(focus, focusArray, msg)) return;

        // Getting the username
        let username = "";
        for (let i = 0; i < directions.length - 1; i++) {
            username += directions[i] + ' ';
        }
        username = username.trim();

        // Checking if the user exists
        if (!(await this.userService.usernameExists(username))) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noUser'));
        }

        // This function is used to calculate from the responsedata what the response looks like
        // This function can then, combined with the responseData, be passed onto a generic multiPage/PCorMobile function
        // That allows all unique commands to use the same multiPage/PCorMobile function, as they have a unique responseFunction and data
        const responseFunction = async (responseData) => {
            let isPC = responseData.isPC;
            let page = responseData.page;
            let user = responseData.user;
            return this.botResponseService.userinfo(user, page, isPC);
        }

        // Generating the responseData, which in turn, fixes the message of the bot together with the responseFunction
        let pageCount = focusArray.length;
        let responseData = {
            user: await this.userService.getByUsernameAchievementsLean(username),
            page: focusObject[focus],
            isPC: true
        }

        // Sending the message, and activating the multiPage function, as the userinfo has 5 looping pages
        msg.channel.send(await responseFunction(responseData))
            .then(async message => this.botHelperService.multiPage(message, msg, pageCount, true, responseFunction, responseData, true));
    }
}