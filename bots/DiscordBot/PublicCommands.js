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

        let response;
        let NameUniquenessVar = game.length;
        if (NameUniquenessVar != 1) {
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

        switch (focus) {
            /*case 'all':
                response = await this.botResponseService.gameinfoAll(game);
                break;
            Temporarily removed this option because it is too much of a pain, too big of a message. Has to be solved in the future by making this a multipage response. */
            case 'general':
                response = await this.botResponseService.gameinfoGeneral(game);
                break;
            case 'galaxy':
                response = await this.botResponseService.gameinfoGalaxy(game);
            case 'player':
                response = await this.botResponseService.gameinfoPlayer(game);
            case 'technology':
                response = await this.botResponseService.gameinfoTechnology(game);
            case 'time':
                response = await this.botResponseService.gameinfoTime(game);
            default:
                response = await this.botResponseService.gameinfoError(msg.author.id, 'noFocus');
        }

        msg.channel.send(response)

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
        //!leaderboard_global <filter> <limit>
        let limit = directions[1];
        limit = +limit;
        let sortingKey = directions[0];
        if (!(limit >= 1 && limit <= 20)) {
            limit = 10;
        };

        // Calculating how the leaderboard looks,
        let result = await this.leaderboardService.getLeaderboard(limit, sortingKey);
        let leaderboard = result.leaderboard;

        // here be dragons
        const getNestedObject = (nestedObj, pathArr) => {
            return pathArr.reduce((obj, key) =>
            (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
        }

        let position_list = "";
        let username_list = "";
        let sortingKey_list = "";

        for (let i = 0; i < leaderboard.length; i++) {
            position_list = position_list + (i + 1) + "\n";
            username_list = username_list + leaderboard[i].username + "\n";
            sortingKey_list = sortingKey_list + getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + "\n"
        }

        let response = await this.botResponseService.leaderboard_global(limit, sortingKey, position_list, username_list, sortingKey_list)

        msg.channel.send(response);
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

        if(game.setting.specialGalaxy.darkGalaxy == 'extra' || game.galaxy.state.endDate) {
            response = await this.botResponseService.leaderboard_localError(msg.author.id, 'extraDark');
            msg.channel.send(response)
            return;
        }
        if(!game.galaxy.state.startDate){
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
        for (let i=0;i<directions.length;i++) {
            username += directions[i] + ' ';
        }
        username = username.trim();

        if(!(await this.userService.usernameExists(username))) return;
        
        let user = await this.userService.getByUsername(username);

        const response = await this.botResponseService.userinfo(user)

        msg.channel.send(response);
    }
}