import moment from "moment/moment";

const EventEmitter = require('events');
import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Game } from './types/Game';
import { Player } from './types/Player';
import UserAchievementService from './userAchievement';
import AvatarService from './avatar';
import CarrierService from './carrier';
import GameStateService from './gameState';
import GameTypeService from './gameType';
import PasswordService from './password';
import PlayerService from './player';
import StarService from './star';
import UserService from './user';
import ConversationService from './conversation';
import PlayerReadyService from './playerReady';
import GamePlayerQuitEvent from './types/events/GamePlayerQuit';
import GamePlayerDefeatedEvent from './types/events/GamePlayerDefeated';
import {LeaderboardPlayer} from "./types/Leaderboard";
import GameJoinService from "./gameJoin";
import GameAuthService from "./gameAuth";
import PlayerAfkService from "./playerAfk";

export const GameServiceEvents = {
    onPlayerQuit: 'onPlayerQuit',
    onPlayerDefeated: 'onPlayerDefeated',
    onGameDeleted: 'onGameDeleted'
}

export default class GameService extends EventEmitter {
    gameRepo: Repository<Game>;
    userService: UserService;
    starService: StarService;
    carrierService: CarrierService;
    playerService: PlayerService;
    passwordService: PasswordService;
    achievementService: UserAchievementService;
    avatarService: AvatarService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    conversationService: ConversationService;
    playerReadyService: PlayerReadyService;
    gameJoinService: GameJoinService;
    gameAuthService: GameAuthService;
    playerAfkService: PlayerAfkService;

    constructor(
        gameRepo: Repository<Game>,
        userService: UserService,
        starService: StarService,
        carrierService: CarrierService,
        playerService: PlayerService,
        passwordService: PasswordService,
        achievementService: UserAchievementService,
        avatarService: AvatarService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        conversationService: ConversationService,
        playerReadyService: PlayerReadyService,
        gameJoinService: GameJoinService,
        gameAuthService: GameAuthService,
        playerAfkService: PlayerAfkService,
    ) {
        super();
        
        this.gameRepo = gameRepo;
        this.userService = userService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.playerService = playerService;
        this.passwordService = passwordService;
        this.achievementService = achievementService;
        this.avatarService = avatarService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.conversationService = conversationService;
        this.playerReadyService = playerReadyService;
        this.gameJoinService = gameJoinService;
        this.gameAuthService = gameAuthService;
        this.playerAfkService = playerAfkService;
    }

    async getByIdAll(id: DBObjectId): Promise<Game | null> {
        return await this.gameRepo.findByIdAsModel(id);
    }

    async getByIdAllLean(id: DBObjectId): Promise<Game | null> {
        return await this.gameRepo.findById(id);
    }

    async getById(id: DBObjectId, select?: any): Promise<Game | null> {
        return await this.gameRepo.findByIdAsModel(id, select);
    }

    async getByNameStateSettingsLean(name: string) {
        return await this.gameRepo.find({
            'settings.general.name': name
        }, {
            state: 1,
            settings: 1
        });
    }

    async getByIdSettingsLean(id: DBObjectId) {
        return await this.gameRepo.findById(id, {
            'settings': 1
        });
    }

    async getByIdLean(id: DBObjectId, select): Promise<Game | null> {
        return await this.gameRepo.findById(id, select);
    }

    async getByIdGalaxyLean(id: DBObjectId): Promise<Game | null> {
        return await this.getByIdLean(id, {
            settings: 1,
            state: 1,
            galaxy: 1,
            constants: 1,
            spectators: 1
        });
    }

    getState(game: Game) {
        game.state.leaderboard = null;
        game.state.teamLeaderboard = null;
        return game;
    }

    getDetailInfo(game: Game) {
        game.state.teamLeaderboard = null;
        game.state.leaderboard = null;
        return game;
    }

    async getGameStateTick(id: DBObjectId) {
        let game = await this.getByIdLean(id, {
            'state.tick': 1
        });

        if (!game) {
            return null;
        }

        return game.state.tick;
    }

    async getGameSettings(id: DBObjectId) {
        let game = await this.getByIdLean(id, {
            'settings': 1
        });

        return game?.settings;
    }

    async quit(game: Game, player: Player) {    
        if (game.state.startDate) {
            throw new ValidationError('Cannot quit a game that has started.');
        }

        if (game.state.endDate) {
            throw new ValidationError('Cannot quit a game that has finished.');
        }

        // If its a tutorial game then straight up delete it.
        if (this.gameTypeService.isTutorialGame(game)) {
            await this.delete(game);

            return null;
        }
        
        const alias = player.alias;

        if (player.userId && !this.gameTypeService.isNewPlayerGame(game)) {
            game.quitters.push(player.userId); // Keep a log of players who have quit the game early so they cannot rejoin later.
        }

        // Reset everything the player may have done to their empire.
        // This is to prevent the next player joining this slot from being screwed over.
        this.playerService.resetPlayerForGameStart(game, player);

        this.gameStateService.updateStatePlayerCount(game);
        
        await game.save();

        let e: GamePlayerQuitEvent = {
            gameId: game._id,
            gameTick: game.state.tick,
            playerId: player._id,
            playerAlias: alias
        };

        this.emit(GameServiceEvents.onPlayerQuit, e);

        return player;
    }

    async concedeDefeat(game: Game, player: Player, openSlot: boolean) {
        if (player.defeated) {
            throw new ValidationError('The player has already been defeated.');
        }

        if (!game.state.startDate) {
            throw new ValidationError('Cannot concede defeat in a game that has not yet started.');
        }

        if (game.state.endDate) {
            throw new ValidationError('Cannot concede defeat in a game that has finished.');
        }

        const wasAI = this.playerAfkService.isAIControlled(game, player, false);

        // If its a tutorial game then straight up delete it.
        if (this.gameTypeService.isTutorialGame(game)) {
            return this.delete(game);
        }

        game.quitters.push(player.userId!); // We need to track this to ensure that they don't try to rejoin in another open slot.

        this.playerService.setPlayerAsDefeated(game, player, openSlot);

        if (!wasAI) {
            game.state.players--; // Deduct number of active players from the game.
        }

        // NOTE: The game will check for a winner on each tick so no need to 
        // repeat that here.

        // TODO: This is temporary. The advanced AI will be able to handle this.
        // In the meantime, if we're still using normal AI we should clear looped carriers.
        // TODO: Remove when basic AI is removed.
        if (game.settings.general.advancedAI === 'disabled') {
            this.carrierService.clearPlayerCarrierWaypointsLooped(game, player);
        }

        if (player.userId && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementDefeated(player.userId, 1);
        }

        await game.save();

        let e: GamePlayerDefeatedEvent = {
            gameId: game._id,
            gameTick: game.state.tick,
            playerId: player._id,
            playerAlias: player.alias,
            openSlot
        };

        this.emit(GameServiceEvents.onPlayerDefeated, e);
    }

    async fastForward(game: Game, fastForwardUserId: DBObjectId) {
        if (!await this.gameAuthService.isGameAdmin(game, fastForwardUserId)) {
            throw new ValidationError('You do not have permission to fast forward this game.');
        }

        if (!this.gameStateService.isInProgress(game)) {
            throw new ValidationError('Cannot fast forward a game that is not in progress.');
        }

        if (game.state.forceTick) {
            throw new ValidationError('Cannot fast forward a game that is already fast forwarding.');
        }

        await this.gameRepo.updateOne({
            _id: game._id
        }, {
            $set: {
                'state.forceTick': true
            }
        });
    }

    async kickPlayer(game: Game, kickingUser: DBObjectId, playerToKick: DBObjectId) {
        if (!await this.gameAuthService.isGameAdmin(game, kickingUser)) {
            throw new ValidationError('You do not have permission to kick a player in this game.');
        }

        const player = game.galaxy.players.find(p => p._id.toString() === playerToKick.toString());

        if (!player) {
            throw new ValidationError('Player not found');
        }

        if (game.state.startDate) {
            // if the player is already defeated, we just want to open the slot
            if (player.defeated) {
                player.isOpenSlot = true;
                await game.save();
            } else {
                await this.concedeDefeat(game, player, true);
            }
        } else {
            await this.quit(game, player);
        }
    }

    async forceStart(game: Game, forceStartingUserId: DBObjectId, withOpenSlots: boolean) {
        if (!await this.gameAuthService.isGameAdmin(game, forceStartingUserId)) {
            throw new ValidationError('You do not have permission to force start this game.');
        }

        const players = game.settings.general.playerLimit;
        const filledSlots = game.galaxy.players.filter(p => !p.isOpenSlot).length;
        const aiSlots = players - filledSlots;

        if (filledSlots === players) {
            throw new ValidationError('Cannot force start a game that is already full.');
        }

        if (filledSlots === 0) {
            throw new ValidationError('Cannot force start game: at least one human player is needed');
        }

        if (aiSlots > 3) {
            throw new ValidationError('Cannot force start game: only 3 AI players are allowed');
        }

        this.gameJoinService.assignNonUserPlayersToAI(game, withOpenSlots);

        this.gameJoinService.startGame(game);

        // TODO: Prevent game from ending

        await game.save();
    }

    async setPauseState(game: Game, pauseState: boolean, pausingUserId: DBObjectId) {
        if (!await this.gameAuthService.isGameAdmin(game, pausingUserId)) {
            throw new ValidationError('You do not have permission to pause/unpause this game.');
        }

        if (!this.gameStateService.isInProgress(game)) {
            throw new ValidationError('Cannot pause a game that is not in progress.');
        }

        if (!pauseState) {
            // Reset afk timers of the players
            // Note: We do not want to update last seen of users as those
            // are separate from the game afk logic.
            await this.gameRepo.updateOne({
                _id: game._id,
            }, {
                $set: {
                    'galaxy.players.$[].lastSeen': moment().utc(),
                }
            }, {
                arrayFilters: [
                    { 'player.defeated': false }
                ]
            });
        }
        
        await this.gameRepo.updateOne({
            _id: game._id
        }, {
            $set: {
                'state.paused': pauseState
            }
        });

        const generalChat = this.conversationService.getGeneralConversation(game);

        if (generalChat) {
            await this.conversationService.sendSystemMessage(game, generalChat, `The game has been ${pauseState ? 'paused' : 'resumed'}.`);
        }
    }

    async delete(game: Game, deletedByUserId?: DBObjectId) {
        // If being deleted by a legit user then do some validation.
        if (deletedByUserId && game.state.startDate) {
            throw new ValidationError('Cannot delete games that are in progress or completed.');
        }

        const isAdmin = deletedByUserId && await this.userService.getUserIsAdmin(deletedByUserId);
        const isCreator = deletedByUserId && game.settings.general.createdByUserId && game.settings.general.createdByUserId.toString() === deletedByUserId.toString();

        if (deletedByUserId && !isAdmin && !isCreator) {
            throw new ValidationError('Cannot delete this game, you did not create it.');
        }

        // If the game hasn't started yet, re-adjust user achievements of players
        // who joined the game.
        if (game.state.startDate == null && !this.gameTypeService.isTutorialGame(game)) {
            // Deduct "joined" count for all players who already joined the game.
            for (let player of game.galaxy.players) {
                if (player.userId) {
                    await this.achievementService.incrementJoined(player.userId, -1);
                }
            }
        }

        await this.gameRepo.deleteOne({ 
            _id: game._id 
        });

        this.emit(GameServiceEvents.onGameDeleted, {
            gameId: game._id
        });

        // TODO: Cleanup any orphaned docs
    }

    async getPlayerUser(game: Game, playerId: DBObjectId) {
        if (this.gameTypeService.isAnonymousGame(game)) {
            return null;
        }
        
        let player = game.galaxy.players.find(p => p._id.toString() === playerId.toString())!;

        return await this.userService.getInfoByIdLean(player.userId!, {
            'achievements.level': 1,
            'achievements.rank': 1,
            'achievements.renown': 1,
            'achievements.victories': 1,
            'achievements.eloRating': 1,
            roles: 1
        });
    }

    async getPlayersLean(gameId: DBObjectId): Promise<{ _id: DBObjectId, userId: DBObjectId | null }[] | undefined> {
        return (await this.gameRepo.findOne({ _id: gameId }, { 'galaxy.players._id': 1, 'galaxy.players.userId': 1 }))?.galaxy.players.map(p => { return { _id: p._id, userId: p.userId } });
    }

    async resetQuitters(game: Game) {
        game.quitters = [];

        await this.gameRepo.updateOne({
            _id: game._id
        }, {
            $set: {
                quitters: []
            }
        });
    }

    // TODO: Move to a gameLockService
    async lockAll(locked: boolean = true) {
        await this.gameRepo.updateMany({
            'state.locked': { $ne: locked }
        }, {
            $set: {
                'state.locked': locked
            }
        });
    }

    listAllUndefeatedPlayers(game: Game) {
        if (this.gameTypeService.isTutorialGame(game)) {
            return game.galaxy.players.filter(p => p.userId);
        }

        return game.galaxy.players.filter(p => !p.defeated);
    }

    isAllUndefeatedPlayersReady(game: Game) {
        let undefeatedPlayers = this.listAllUndefeatedPlayers(game);

        return undefeatedPlayers.filter(x => x.ready).length === undefeatedPlayers.length;
    }

    isReadyToQuitOrDefeated(game: Game, player: Player) {
        return player.readyToQuit || player.defeated || this.playerAfkService.isAIControlled(game, player, true);
    }

    isReadyToQuitImmediateEnd(game: Game) {
        // every player is defeated, RTQ or AI
        return game.galaxy.players.every(p => this.isReadyToQuitOrDefeated(game, p));
    }

    checkReadyToQuit(game: Game, leaderboard: LeaderboardPlayer[]) {
        const rtqFraction = game.settings?.general?.readyToQuitFraction || 1.0;
        const starsForEnd = rtqFraction * game.state.stars;

        let rtqStarsSum = 0;
        let allUndefeatedHaveRTQed = true;

        for (const player of game.galaxy.players) {
            if (this.isReadyToQuitOrDefeated(game, player)) {
                rtqStarsSum += leaderboard.find(x => x.player._id.toString() === player._id.toString())?.stats?.totalStars || 0;
            } else {
                allUndefeatedHaveRTQed = false;
            }
        }

        return allUndefeatedHaveRTQed || rtqStarsSum >= starsForEnd;
    }

    async forceEndGame(game: Game) {
        let undefeatedPlayers = this.listAllUndefeatedPlayers(game);

        for (let player of undefeatedPlayers) {
            await this.playerReadyService.declareReadyToQuit(game, player, true);
        }
    }
    
    // TODO: Should be in a player service?
    async quitAllActiveGames(userId: DBObjectId) {
        let allGames = await this.gameRepo.findAsModels({
            'galaxy.players': {
                $elemMatch: { 
                    userId,             // User is in game
                    defeated: false     // User has not been defeated
                }
            },
            $and: [
                { 'state.endDate': { $eq: null } } // The game hasn't ended.
            ]
        });

        // Find all games that are pending start and quit.
        // Find all games that are active and admit defeat.
        for (let game of allGames) {
            let player = this.playerService.getByUserId(game, userId)!;

            if (this.gameStateService.isInProgress(game)) {
                await this.concedeDefeat(game, player, false);
            }
            else {
                await this.quit(game, player);
            }
        }
    }

    async markAsCleaned(gameId: DBObjectId) {
        await this.gameRepo.updateOne({
            _id: gameId
        }, {
            $set: {
                'state.cleaned': true,
                'settings.general.timeMachine': 'disabled'
            }
        });
    }

};
