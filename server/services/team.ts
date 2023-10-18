import {DBObjectId} from "./types/DBObjectId";
import {Game, Team} from "./types/Game";

export default class TeamService {
    getById(game: Game, id: DBObjectId): Team | null {
        return game.galaxy?.teams?.find(team => team._id === id) || null;
    }
}