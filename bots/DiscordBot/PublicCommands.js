const Discord = require('discord.js')


module.exports = class PublicCommandService {

    constructor(botResponseService, gameService, leaderboardService, userService) {
        this.botResponseService = botResponseService
        this.gameService = gameService;
        this.leaderboardService = leaderboardService;
        this.userService = userService;
    }

    async gameinfo(msg, directions) {
        //!gameinfo <galaxy_name> <focus> ("ID")
        let game = [];
        var focus;
        let game_name = "";
        if (directions[directions.length - 1] == "ID") {
            game = await this.gameService.getByIdAll(directions[0])
            focus = directions[directions.length - 2]
        } else {
            var i;
            if (directions.length === 1) {
                directions.push('general');
            }
            for (i = 0; i < directions.length - 1; i++) {
                game_name += directions[i] + ' ';
            }
            game_name = game_name.trim()
            game = await this.gameService.getByNameAll(game_name);
            focus = directions[directions.length - 1]
        }

        var response;
        var NameUniquenessVar = game.length;
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
            case 'all':
                response = await this.botResponseService.gameinfoAll(game);
                break;
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
        var response = `Hey <@${id}>,\n`;
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
        if (!(limit >= 1 && limit <= 50)) {
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

        var position_list = "";
        var username_list = "";
        var sortingKey_list = "";

        for (let i = 0; i < leaderboard.length; i++) {
            position_list = position_list + (i + 1) + "\n";
            username_list = username_list + leaderboard[i].username + "\n";
            sortingKey_list = sortingKey_list + getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + "\n"
        }

        var response = await this.botResponseService.leaderboard_global(limit, sortingKey, position_list, username_list, sortingKey_list)

        msg.channel.send(response);
    }

    async leaderboard_local(msg, directions) {
        //!leaderboard_local <galaxy_name> <filter>
        // TODO: We don't have anything that does this yet.
    }

    async userinfo(msg, directions) {
        //!userinfo <username>
        let username = "";
        for (let i=0;i<directions.length;i++) {
            username += directions[i] + ' ';
        }
        username = username.trim();

        if(!(await this.userService.usernameExists(username))) return;
        
        let user = this.userService.getByUsername(username);

        const response = await this.botResponseService.userinfo(user)

        msg.channel.send(response);
        // Send message back to discord
    }
}