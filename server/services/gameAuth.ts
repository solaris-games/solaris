import {Game} from "./types/Game";
import {DBObjectId} from "./types/DBObjectId";
import UserService from "./user";

export default class GameAuthService {
    userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async isGameAdmin(game: Game, userId: DBObjectId | null | undefined): Promise<boolean> {
        if (!userId) {
            return false;
        }

        if (await this.userService.getUserIsAdmin(userId)) {
            return true;
        }

        if (game.settings.general.createdByUserId) {
            return game.settings.general.createdByUserId.toString() === userId.toString();
        }

        return false;
    }
}