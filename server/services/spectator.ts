import { ValidationError } from "solaris-common";
import PlayerService from "./player";
import Repository from "./repository";
import { DBObjectId } from "./types/DBObjectId";
import { Game, GameSpectator } from "./types/Game";
import { Player } from "./types/Player";
import UserService from "./user";
import {notNull} from "./utils";
import {User} from "./types/User";

export default class SpectatorService {
    gameRepo: Repository<Game>;
    playerService: PlayerService;
    userService: UserService;

    constructor(
        gameRepo: Repository<Game>,
        playerService: PlayerService,
        userService: UserService
    ) {
        this.gameRepo = gameRepo;
        this.playerService = playerService;
        this.userService = userService;
    }

    isSpectatingEnabled(game: Game) {
        return game.settings.general.spectators === 'enabled';
    }

    async invite(game: Game, player: Player, usernames: string[]) {
        if (!this.isSpectatingEnabled(game)) {
            throw new ValidationError(`Spectating is not enabled in this game.`);
        }

        const requestUser = async (username: string): Promise<{ username: string, user: User | null }> => {
            const user = await this.userService.getByUsername(username, { _id: 1 });
            return {
                username,
                user
            };
        };

        const attemptedUsers: { username: string, user: User | null }[] = await Promise.all(usernames.map((username) => requestUser(username)));

        const users: User[] = [];
        const missingUsernames: string[] = [];

        for (const { username, user } of attemptedUsers) {
            if (user) {
                users.push(user);
            } else {
                missingUsernames.push(username);
            }
        }

        if (!users.length) {
            throw new ValidationError(`No users found for the provided usernames: ${missingUsernames.join(', ')}`);
        }

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $addToSet: {
                'galaxy.players.$.spectators': {
                    $each: users.map(user => user._id),
                }
            }
        });

        if (missingUsernames.length !== 0) {
            throw new ValidationError(`The following usernames were not found: ${missingUsernames.join(', ')}`);
        }
    }

    async uninvite(game: Game, player: Player, userId: DBObjectId) {
        if (!this.isSpectatingEnabled(game)) {
            throw new ValidationError(`Spectating is not enabled in this game.`);
        }
        
        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $pull: {
                'galaxy.players.$.spectators': userId
            }
        });
    }

    async clearSpectators(game: Game, player: Player) {
        if (!this.isSpectatingEnabled(game)) {
            throw new ValidationError(`Spectating is not enabled in this game.`);
        }
        
        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.spectators': []
            }
        });
    }

    async listSpectators(game: Game): Promise<GameSpectator[] | null> {
        if (!this.isSpectatingEnabled(game)) {
            return null;
        }

        let userIds: string[] = [];

        for (const player of game.galaxy.players.filter(p => p.spectators)) {
            userIds = userIds.concat(player.spectators.map(s => s.toString()))
        }

        userIds = [...new Set(userIds)];

        if (!userIds.length) {
            return [];
        }

        const users = await this.userService.listUsers(userIds as any, {
            _id: 1,
            username: 1
        });

        return users.map(u => {
            // Get all players the user is spectating.
            const playerIds = game.galaxy.players
                .filter(p => p.spectators)
                .filter(p => p.spectators.map(s => s.toString()).includes(u._id.toString()))
                .map(p => p._id);

            return {
                ...u,
                playerIds
            };
        });
    }

    clearSpectating(game: Game, userId: DBObjectId) {
        const spectating = this.listSpectatingPlayers(game, userId);

        for (let player of spectating) {
            player.spectators.splice(player.spectators.indexOf(userId), 1);
        }
    }

    isSpectating(game: Game, userId: DBObjectId) {        
        return this.listSpectatingPlayers(game, userId).length > 0;
    }

    listSpectatingPlayers(game: Game, userId: DBObjectId) {        
        return game.galaxy.players.filter(p => p.spectators.find(s => s.toString() === userId.toString()));
    }
};
