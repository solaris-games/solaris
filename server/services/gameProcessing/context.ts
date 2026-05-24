import UserService from "../user";
import {Game} from "../types/Game";
import {ActiveModel} from "../types/ActiveModel";
import {User} from "../types/User";

export class GameTickContext {
    game: Game;
    gameUsers: ActiveModel<User>[];

    static async load(userService: UserService, game: Game) {
        const gameUsers = await userService.getGameUsers(game);

        return new GameTickContext(game, gameUsers);
    }

    constructor(game: Game, gameUsers: ActiveModel<User>[]) {
        this.game = game;
        this.gameUsers = gameUsers;
    }

    async save() {
        for (let user of this.gameUsers) {
            await user.save();
        }
    }

    getGameUsers(): ActiveModel<User>[] {
        return this.gameUsers;
    }
}