const EventEmitter = require('events');
const moment = require('moment');
import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "solaris-common";
import { Game } from './types/Game';
import { Player } from './types/Player';
import UserAchievementService from './userAchievement';
import AvatarService from './avatar';
import GameStateService from './gameState';
import GameTypeService from './gameType';
import PasswordService from './password';
import PlayerService from './player';
import StarService from './star';
import UserService from './user';
import ConversationService from './conversation';
import GamePlayerJoinedEvent from './types/events/GamePlayerJoined';
import { BaseGameEvent } from './types/events/BaseGameEvent';
import RandomService from './random';
import SpectatorService from './spectator';

export const GameJoinServiceEvents = {
    onPlayerJoined: 'onPlayerJoined',
    onGameStarted: 'onGameStarted'
}

export default class GameJoinService extends EventEmitter {
    userService: UserService;
    starService: StarService;
    playerService: PlayerService;
    passwordService: PasswordService;
    achievementService: UserAchievementService;
    avatarService: AvatarService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    conversationService: ConversationService;
    randomService: RandomService;
    spectatorService: SpectatorService;

    constructor(
        userService: UserService,
        starService: StarService,
        playerService: PlayerService,
        passwordService: PasswordService,
        achievementService: UserAchievementService,
        avatarService: AvatarService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        conversationService: ConversationService,
        randomService: RandomService,
        spectatorService: SpectatorService
    ) {
        super();
        
        this.userService = userService;
        this.starService = starService;
        this.playerService = playerService;
        this.passwordService = passwordService;
        this.achievementService = achievementService;
        this.avatarService = avatarService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.conversationService = conversationService;
        this.randomService = randomService;
        this.spectatorService = spectatorService;
    }

    async join(game: Game, userId: DBObjectId, playerId: DBObjectId, alias: string, avatar: number, password: string | undefined) {
        // The player cannot join the game if:
        // 1. The game has finished.
        // 2. They quit the game before the game started or they conceded defeat.
        // 3. They are already playing in the game.
        // 4. They are trying to join a slot that isn't open.
        // 5. They are trying to play in a different slot if they have been afk'd.
        // 6. The password entered is invalid.
        // 7. The player does not own any stars.
        // 8. The alias is already taken.
        // 9. The alias (username) is already taken.

        // Only allow join if the game hasn't finished.
        if (game.state.endDate) {
            throw new ValidationError('The game has already finished.');
        }

        if (game.settings.general.password) {
            if (!password) {
                throw new ValidationError("The game requires a password.");
            }

            let passwordMatch = await this.passwordService.compare(password, game.settings.general.password);

            if (!passwordMatch) {
                throw new ValidationError('The password is invalid.');
            }
        }

        // Perform a new player check if the game is for established players only.
        // If the player is new then they cannot join.

        if (this.gameTypeService.isForEstablishedPlayersOnly(game)) {
            const isEstablishedPlayer = await this.userService.isEstablishedPlayer(userId);
            
            // Disallow new players from joining non-new-player-games games if they haven't completed a game yet.
            if (!isEstablishedPlayer && !this.gameTypeService.isNewPlayerGame(game)) {
                throw new ValidationError('You must complete a "New Player" game or a custom game before you can join an official game.');
            }
        }

        // Verify that the user has purchased the avatar they selected.
        const userAvatar = await this.avatarService.getUserAvatar(userId, avatar);

        if (!userAvatar.purchased) {
            throw new ValidationError(`You have not purchased the selected avatar.`);
        }

        // The user cannot rejoin if they quit early or conceded defeat.
        let isQuitter = game.quitters.find(x => x.toString() === userId.toString());

        if (isQuitter) {
            throw new ValidationError('You cannot rejoin this game.');
        }

        // Disallow if they are already in the game as another player.
        // If the player they are in the game as is afk then that's fine.
        let existing = game.galaxy.players.find(x => x.userId && x.userId.toString() === userId.toString());

        if (existing && !existing.afk) {
            throw new ValidationError('You are already participating in this game.');
        }

        // Get the player and update it to assign the user to the player.
        let player = game.galaxy.players.find(x => x._id.toString() === playerId.toString());

        if (!player) {
            throw new ValidationError('The player is not participating in this game.');
        }

        if (!player.isOpenSlot) {
            throw new ValidationError(`The player slot is not open to be filled.`);
        }

        // If the user was an afk-er then they are only allowed to join
        // their slot.
        const isAfker = game.afkers.find(x => x.toString() === userId.toString());
        const isRejoiningAfkSlot = isAfker && player.afk && userId && player.userId && player.userId.toString() === userId.toString();

        // If they have been afk'd then they are only allowed to join their slot again.
        if (player.afk && isAfker && userId && player.userId && player.userId.toString() !== userId.toString()) {
            throw new ValidationError('You can only rejoin this game in your own slot.');
        }

        const stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        if (!stars.length) {
            throw new ValidationError('Cannot fill this slot, the player does not own any stars.');
        }

        const aliasCheckPlayer = game.galaxy.players.find(x => x.userId && x.alias.toLowerCase() === alias.toLowerCase());

        if (aliasCheckPlayer && !isRejoiningAfkSlot) {
            throw new ValidationError(`The alias '${alias}' has already been taken by another player.`);
        }

        // Disallow if they have the same alias as a user.
        const aliasCheckUser = await this.userService.otherUsernameExists(alias, userId);

        if (aliasCheckUser) {
            throw new ValidationError(`The alias '${alias}' is the username of another player.`);
        }

        const gameIsFull = this.assignPlayerToUser(game, player, userId, alias, avatar);

        if (gameIsFull) {
            this.assignNonUserPlayersToAI(game);
        }

        await game.save();

        if (player.userId && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementJoined(player.userId);
        }

        let playerJoinedEvent: GamePlayerJoinedEvent = {
            gameId: game._id,
            gameTick: game.state.tick,
            playerId: player._id,
            playerAlias: player.alias
        };

        this.emit(GameJoinServiceEvents.onPlayerJoined, playerJoinedEvent);

        if (gameIsFull) {
            let e: BaseGameEvent = {
                gameId: game._id,
                gameTick: game.state.tick
            };

            this.emit(GameJoinServiceEvents.onGameStarted, e);
        }

        return gameIsFull; // Return whether the game is now full, the calling API endpoint can broadcast it.
    }
    
    assignPlayerToUser(game: Game, player: Player, userId: DBObjectId | null, alias: string, avatar: number) {
        if (!player.isOpenSlot) {
            throw new ValidationError(`The player slot is not open to be filled`);
        }

        const slotHadPreviousOwner = player.userId && userId && player.userId.toString() !== userId?.toString();
        const isAfker = userId && Boolean(game.afkers.find(x => x.toString() === userId.toString()));
        const isFillingAfkSlot = this.gameStateService.isInProgress(game) && player.afk;
        const isRejoiningOwnAfkSlot = isFillingAfkSlot && isAfker && (userId && player.userId && player.userId.toString() === userId.toString());
        const hasFilledOtherPlayerAfkSlot = isFillingAfkSlot && !isRejoiningOwnAfkSlot;

        // Assign the user to the player.
        player.userId = userId;
        player.alias = alias;
        player.avatar = avatar.toString();
        player.spectators = [];

        // Reset the defeated and afk status as the user may be filling
        // an afk slot.
        player.hasFilledAfkSlot = hasFilledOtherPlayerAfkSlot;
        player.isOpenSlot = false;
        player.defeated = false;
        player.defeatedDate = null;
        player.missedTurns = 0;
        player.afk = false;
        player.hasSentTurnReminder = false;
        player.colourMapping = new Map();

        if (!player.userId) {
            player.ready = true;
        }

        if (userId) {
            // Clear out any players the user may be spectating.
            this.spectatorService.clearSpectating(game, userId);
        }

        // If the max player count is reached then start the game.
        this.gameStateService.updateStatePlayerCount(game);
        
        let shouldStartGame = false;

        // If the game hasn't started yet then check if the game is full
        if (!game.state.startDate) {
            // Start the game if all slots have been filled
            // OR its a new player game, half or more are filled
            // OR its a tutorial game and a player has joined
            shouldStartGame = game.state.players === game.settings.general.playerLimit ||
                (this.gameTypeService.isNewPlayerGame(game) && game.state.players >= game.settings.general.playerLimit / 2) ||
                (this.gameTypeService.isTutorialGame(game) && game.state.players > 0);
    
            if (shouldStartGame) {
                this.startGame(game);
            }
        } else {
            this.playerService.updateLastSeen(game, player);

            // If the player is joining another player's slot, remove them
            // from any conversation that the other player was in.
            if (slotHadPreviousOwner) {
                this.conversationService.leaveAll(game, player._id);
            }
        }

        return shouldStartGame;
    }

    startGame(game: Game) {
        let startDate = moment().utc();

        if (this.gameTypeService.isRealTimeGame(game)) {
            // Add the start delay to the start date.
            startDate.add(game.settings.gameTime.startDelay, 'minute');
        }

        game.state.paused = false;
        game.state.startDate = startDate;
        game.state.lastTickDate = startDate;

        for (let player of game.galaxy.players) {
            this.playerService.updateLastSeen(game, player, startDate);
        }
    }

    assignNonUserPlayersToAI(game: Game, slotsOpen: boolean | undefined = undefined) {
        // For all AI, assign a random alias and an avatar.
        const players = game.galaxy.players.filter(p => p.userId == null);

        if (!players.length) {
            return;
        }

        const aliases = this.avatarService.listAllAliases();
        const avatars = this.avatarService.listAllSolarisAvatars();

        for (const player of players) {
            const aliasIndex = this.randomService.getRandomNumberBetween(0, aliases.length - 1);
            const avatarIndex = this.randomService.getRandomNumberBetween(0, avatars.length - 1);

            const alias = aliases.splice(aliasIndex, 1)[0];
            const avatar = avatars.splice(avatarIndex, 1)[0].id.toString();

            player.alias = alias;
            player.avatar = avatar;
            player.researchingNext = 'random';
            player.missedTurns = 0;
            player.hasSentTurnReminder = false;
            player.afk = false;
            player.defeated = false;
            player.defeatedDate = null;
            player.hasFilledAfkSlot = false;

            if (this.gameTypeService.isTurnBasedGame(game)) {
                player.ready = true;
            }

            if (slotsOpen === undefined) {
                // If it's a tutorial game we want to keep the slot closed.
                player.isOpenSlot = !this.gameTypeService.isTutorialGame(game);
            } else {
                player.isOpenSlot = slotsOpen;
            }
        }
    }

};
