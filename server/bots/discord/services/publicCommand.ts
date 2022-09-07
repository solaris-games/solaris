import ResponseService from "./response";
import BotHelperService from "./botHelper";
import GameGalaxyService from '../../../services/gameGalaxy';
import GameService from '../../../services/game';
import LeaderboardService from '../../../services/leaderboard';
import UserService from '../../../services/user';
import GameTypeService from '../../../services/gameType';
import SpecialistBanService from "../../../services/specialistBan";
import GameFluxService from "../../../services/gameFlux";
import SpecialStarBanService from "../../../services/specialStarBan";

export default class PublicCommandService {
    botResponseService: ResponseService;
    botHelperService: BotHelperService;
    gameGalaxyService: GameGalaxyService;
    gameService: GameService;
    leaderboardService: LeaderboardService;
    userService: UserService;
    gameTypeService: GameTypeService;
    gameFluxService: GameFluxService;
    specialistBanService: SpecialistBanService;
    specialStarBanService: SpecialStarBanService;

    constructor(
        botResponseService: ResponseService,
        botHelperService: BotHelperService,
        gameGalaxyService: GameGalaxyService,
        gameService: GameService,
        leaderboardService: LeaderboardService,
        userService: UserService,
        gameTypeService: GameTypeService,
        gameFluxService: GameFluxService,
        specialistBanService: SpecialistBanService,
        specialStarBanService: SpecialStarBanService
    ) {
        this.botResponseService = botResponseService;
        this.botHelperService = botHelperService;
        this.gameGalaxyService = gameGalaxyService;
        this.gameService = gameService;
        this.leaderboardService = leaderboardService;
        this.userService = userService;
        this.gameTypeService = gameTypeService;
        this.gameFluxService = gameFluxService;
        this.specialistBanService = specialistBanService;
        this.specialStarBanService = specialStarBanService;
    }

    async gameinfo(msg, directions: string[]) {
        //!gameinfo <galaxy_name> <focus> ("ID")

        // Extracting the focus and game from the message in one simple command, while also validating the game
        if(!(await this.botHelperService.getGame(directions, true, msg))) return;
        let [game, focus] = await this.botHelperService.getGame(directions, true, msg) as any;

        const focusObject = {
            general: 0,
            galaxy: 1,
            player: 2,
            technology: 3,
            time: 4
        };
        const focusArray = Object.keys(focusObject);

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
            .then(async (message) => this.botHelperService.multiPage(message, msg, Object.keys(focusObject).length, true, responseFunction, responseData, true));
    }

    async invite(msg, directions: string[]) {
        // $invite <gamelink>

        // Check if it has the right amount of directions
        if(directions.length != 1) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noDirections'));
        }
        // Plain and simple, extract the link to the game, from which we can extract the id from the game, which we then use to find the game
        let gamelink = directions[0];
        let gameId = (gamelink.split('?id='))[1];
        let game;

        // This checks if the gameID is valid and fetches the game with that ID if it exists
        if (gameId) {
            if (this.botHelperService.isValidID(gameId)) {
                game = await this.gameService.getByIdSettingsLean(gameId as any);
            } else {
                return msg.channel.send(this.botResponseService.error(msg.author.id, 'invalidID'));
            }

            if (!game) {
                return msg.channel.send(this.botResponseService.error(msg.author.id, 'noGame'));
            }

        } else {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'invalidID'));
        }

        // Sending the final message
        return msg.channel.send(this.botResponseService.invite(game));
    }

    async help(msg, directions: string[]) {
        //$help
        let id = msg.author.id;
        let response = `Hey <@${id}>,\nPlease visit https://github.com/solaris-games/solaris/blob/master/server/bots/discord/README.md for help on how to interact with me.`;
        return msg.channel.send(response);
    }

    async leaderboard_global(msg, directions: string[]) {
        //$leaderboard_global <filter>

        // Check if it has the right amount of directions
        if(directions.length != 1) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noDirections'));
        }

        // Determining basic values for the leaderboard, which will be used much later in the program
        let sortingKey = directions[0];
        let leaderboardSize = await this.userService.getUserCount();
        let pageCount = Math.ceil(leaderboardSize / 20);

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
            let limit = 20;
            let skip = 20 * page; // Page 0 is the first page
            let result = await this.leaderboardService.getUserLeaderboard(limit, key, skip);
            let leaderboard = result.leaderboard;
            if (isPC) {
                // Generates the response if the response has to be in a format optimised for PC users
                let position_list = "";
                let username_list = "";
                let sortingKey_list = "";
                for (let i = 0; i < leaderboard.length; i++) {
                    if (!leaderboard[i]) { break; };
                    position_list += (leaderboard[i].position + page * 20) + "\n";
                    username_list += leaderboard[i].username + "\n";
                    sortingKey_list += await this.botHelperService.getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + "\n";
                }
                let response = this.botResponseService.leaderboard_globalPC(page, sortingKey, position_list, username_list, sortingKey_list);
                return response;
            }
            // This only runs now if the response is for mobile/tablet users
            // It is made to generate a response that makes sense to those users
            let data_list = "";
            for (let i = 0; i < leaderboard.length; i++) {
                if (!leaderboard[i]) { break; };
                data_list += (leaderboard[i].position + page * 20) + ' / ' + await this.botHelperService.getNestedObject(leaderboard[i], result.sorter.fullKey.split('.')) + ' / ' + leaderboard[i].username + '\n';
            }
            let response = this.botResponseService.leaderboard_globalMobile(page, sortingKey, data_list);
            return response;
        };

        // Generating the responseData, which in turn, fixes the message of the bot together with the responseFunction
        let responseData = {
            page: 0,
            isPC: true,
            sortingKey
        };

        // Sending the message, and activating the multiPage function, as the global leaderboard has tons and tons of non-looping pages
        msg.channel.send(await responseFunction(responseData))
            .then(async (message) => this.botHelperService.multiPage(message, msg, pageCount, false, responseFunction, responseData, true));
    }

    async leaderboard_local(msg, directions: string[]) {
        //$leaderboard_local <galaxy_name> <filter> ("ID")

        // Extracting the sorter and game from the message in one simple command, while also validating the game
        if(!(await this.botHelperService.getGame(directions, true, msg))) return;
        let [game, sortingKey] = await this.botHelperService.getGame(directions, true, msg) as any;

        const sorterArray = ['stars', 'carriers', 'ships', 'economy', 'industry', 'science', 'newShips', 'warpgates', 'starSpecialists', 'carrierSpecialists',
            'totalSpecialists', 'scanning', 'hyperspace', 'terraforming', 'experimentation', 'weapons', 'banking', 'manufacturing', 'specialists'];

        // Checking if the sorter that the player specified is actually allowed
        if (!this.botHelperService.isValidFocus(sortingKey, sorterArray, msg)) return;

        // Checking if we may actually give information about the game, so if it is an ongoing dark game, or an unstarted game
        if (this.gameTypeService.isDarkModeExtra(game) && !game.state.endDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'extraDark'));
        }
        if (!game.state.startDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'notStarted'));
        }

        // This function is used to calculate from the responsedata what the response looks like
        // This function can then, combined with the responseData, be passed onto a generic multiPage/PCorMobile function
        // That allows all unique commands to use the same multiPage/PCorMobile function, as they have a unique responseFunction and data
        const responseFunction = async (responseData) => {
            // Getting the basic info that we'll need from the responseData
            let game = responseData.game;
            let sortingKey = responseData.sortingKey;
            let isPC = responseData.isPC;

            // Generating a leaderboard in the official format
            let leaderboardReturn = this.leaderboardService.getGameLeaderboard(game, sortingKey);
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
        };

        // Generating the responseData, which in turn, fixes the message of the bot together with the responseFunction
        let responseData = {
            game,
            sortingKey,
            isPC: true
        };

        // Sending the message, and activating the PCorMobile function, as the local leaderboard is usable for both mobile and PC users
        msg.channel.send(await responseFunction(responseData))
            .then(async (message) => this.botHelperService.PCorMobile(message, msg, responseFunction, responseData));
    }

    async status(msg, directions: string[]) {
        // $status <galaxy_name> ("ID")

        // Extracting the sorter and game from the message in one simple command, while also validating the game
        if(!(await this.botHelperService.getGame(directions, false, msg))) return;
        let [game, focus] = await this.botHelperService.getGame(directions, false, msg) as any;

        // Checking if we may actually give information about the game, so if it is an ongoing dark game, or an unstarted game
        if (this.gameTypeService.isDarkModeExtra(game) && !game.state.endDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'extraDark'));
        }
        if (!game.state.startDate) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'notStarted'));
        }

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
        };

        // Generating the local leaderboards for the requested game
        let leaderboardData = {
            stars: this.leaderboardService.getGameLeaderboard(game, 'stars'),
            ships: this.leaderboardService.getGameLeaderboard(game, 'ships'),
            newShips: this.leaderboardService.getGameLeaderboard(game, 'newShips'),
            economy: this.leaderboardService.getGameLeaderboard(game, 'economy'),
            industry: this.leaderboardService.getGameLeaderboard(game, 'industry'),
            science: this.leaderboardService.getGameLeaderboard(game, 'science'),
            weapons: this.leaderboardService.getGameLeaderboard(game, 'weapons'),
            manufacturing: this.leaderboardService.getGameLeaderboard(game, 'manufacturing'),
            specialists: this.leaderboardService.getGameLeaderboard(game, 'specialists')
        };

        // Calculating the count of living players
        let alive = game.galaxy.players.reduce((val, player) => player.defeated ? val : val + 1, 0);
        let leaderboard = {};
        let leaderboardSize = game.settings.general.playerLimit <= 3 ? game.settings.general.playerLimit : 3;

        // Generating the leaderboard in the right format
        for (let [key, value] of Object.entries(leaderboardData)) {
            leaderboard[key] = "";
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
            .then(async (message) => this.botHelperService.PCorMobile(message, msg, responseFunction, responseData));
    }

    async userinfo(msg, directions: string[]) {
        //$userinfo <username> <focus>

        // Check if it has the bare minimum amount of directions
        if(directions.length < 2) {
            return msg.channel.send(this.botResponseService.error(msg.author.id, 'noDirections'));
        }

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
        };

        // Generating the responseData, which in turn, fixes the message of the bot together with the responseFunction
        let pageCount = focusArray.length;
        let responseData = {
            user: await this.userService.getByUsernameAchievementsLean(username),
            page: focusObject[focus],
            isPC: true
        };

        // Sending the message, and activating the multiPage function, as the userinfo has 5 looping pages
        msg.channel.send(await responseFunction(responseData))
            .then(async (message) => this.botHelperService.multiPage(message, msg, pageCount, true, responseFunction, responseData, true));
    }

    async bans(msg, directions: string[]) {
        //$bans
        let authorId = msg.author.id;

        const amount = this.gameFluxService.getThisMonthSpecialistBanAmount();
        const specialistBans = this.specialistBanService.getCurrentMonthBans(amount);
        const specialStarBans = this.specialStarBanService.getCurrentMonthBans();

        const starBans = specialistBans.star.map(s => `- ${s.name}\n`).join('');
        const carrBans = specialistBans.carrier.map(s => `- ${s.name}\n`).join('');
        const specStarBans = specialStarBans.specialStar.map(s => `- ${s.name}\n`).join('');

        let response = `Hey <@${authorId}>,\n\nThis month's bans are as follows.\n\nStar specialists:\n${starBans}\n\nCarrier specialists:\n${carrBans}\n\Special stars:\n${specStarBans}\n\nThe ban list affects official games only and changes on the 1st of every month, for information see the wiki.`;

        return msg.channel.send(response);
    }

    async flux(msg, directions: string[]) {
        //$flux
        let authorId = msg.author.id;

        const flux = this.gameFluxService.getCurrentFlux()!;

        let response = `Hey <@${authorId}>,\n\nThis month's flux is:\n\n*${flux.description}*\n\nFlux changes on the 1st of every month, for information see the wiki.`;

        return msg.channel.send(response);
    }
}