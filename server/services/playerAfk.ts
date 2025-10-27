import {User} from "./types/User";

import moment from "moment";
import EventEmitter from "events";
import Repository from './repository';
import { Game } from './types/Game';
import { Player } from './types/Player';
import CarrierService from './carrier';
import { GameTypeService } from 'solaris-common'
import StarService from './star';
import GameStateService from './gameState';
import PlayerService from './player';

export default class PlayerAfkService extends EventEmitter {
    gameRepo: Repository<Game>;
    playerService: PlayerService;
    starService: StarService;
    carrierService: CarrierService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;

    constructor(
        gameRepo: Repository<Game>,
        playerService: PlayerService,
        starService: StarService,
        carrierService: CarrierService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService
    ) {
        super();

        this.gameRepo = gameRepo;
        this.playerService = playerService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
    }

    incrementAfkCount (user: User) {
        user.achievements.afk++;

        // Even better would be to look only at recent games, but there is no data for that at the moment
        const hasHighAfkRate = (user.achievements.afk / user.achievements.joined) > 0.4;
        const hasJoinedSeveralGames = user.achievements.joined > 2;
        const hasRecentAfkWarning = user.warnings.find(w => w.text === 'Frequent AFK' && moment(w.date).isAfter(moment().subtract(1, 'month')));

        if (hasHighAfkRate && hasJoinedSeveralGames && !hasRecentAfkWarning) {
            user.warnings.push({
                date: new Date(),
                text: 'Frequent AFK'
            });
        }
    }

    performDefeatedOrAfkCheck(game: Game, player: Player) {
        if (player.defeated) {
            throw new Error(`Cannot perform a defeated check on an already defeated player.`);
        }

        if (!player.afk) {
            // Check if the player has been AFK.
            const isAfk = this.isAfk(game, player);
    
            if (isAfk) {
                this.setPlayerAsAfk(game, player);
            }
        }

        // Check if the player has been defeated by conquest.
        if (!player.defeated) {
            const stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

            // If there are no stars and there are no carriers then the player is defeated.
            if (stars.length === 0) {
                const carriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id); // Note: This logic looks a bit weird, but its more performant.

                if (carriers.length === 0) {
                    this.playerService.setPlayerAsDefeated(game, player, false);
                }
            }

            // For capital star elimination games, if the player doesn't own their original home star then they are defeated.
            if (this.gameTypeService.isCapitalStarEliminationMode(game) && !this.playerService.ownsOriginalHomeStar(game, player)) {
                this.playerService.setPlayerAsDefeated(game, player, false);
            }
        }
    }

    setPlayerAsAfk(game: Game, player: Player) {
        this.playerService.setPlayerAsDefeated(game, player, game.settings.general.afkSlotsOpen === 'enabled');
        player.afk = true;
    }


    isAIControlled(game: Game, player: Player, includePseudoAfk: boolean) {
        // Defeated players or players not controlled by a user are controlled by AI.
        if (player.defeated || !player.userId) {
            return true;
        }

        // Pseudo AFK players are players who haven't been online for a while but haven't yet reached the AFK timeout,
        // we want these players to be controlled by AI until they come online or are kicked.
        if (includePseudoAfk) {
            return this.isPsuedoAfk(game, player);
        }
        
        return false;
    }

    isPsuedoAfk(game: Game, player: Player) {
        if (!this.gameStateService.isStarted(game)) {
            return false;
        }
        
        let startDate = moment(game.state.startDate).utc();
        let startDatePlus12h = moment(game.state.startDate).add(12, 'hours');
        let now = moment().utc();

        // We want to give players at least a 12h from the start of the game.
        if (now < startDatePlus12h) {
            return false;
        }

        // If the player hasn't been seen since the start of the game then let the AI take over.
        if (player.lastSeen == null || moment(player.lastSeen).utc() <= startDate) {
            return true;
        }
        
        return false;
    }

    isAfk(game: Game, player: Player) {
        if (player.afk) {
            return true;
        }

        // The player is afk if:
        // 1. They haven't been seen for X days.
        // 2. They missed the turn limit in a turn based game.
        // 3. They missed X cycles in a real time game (minimum of 12 hours)

        // If the player is AI controlled, then they are not AFK.
        // Note: Don't include pseudo afk, only legit actual afk players.
        if (this.isAIControlled(game, player, false)) {
            return false;
        }

        // if the player is ready for turn/cycle in a TB game, they are not afk
        if (player.ready) {
            return false;
        }

        let lastSeenMoreThanXDaysAgo = moment(player.lastSeen).utc() <= moment().utc().subtract(game.settings.gameTime.afk.lastSeenTimeout, 'days');

        if (lastSeenMoreThanXDaysAgo) {
            return true;
        }

        if (this.gameTypeService.isTurnBasedGame(game)) {
            return player.missedTurns >= game.settings.gameTime.afk.turnTimeout;
        }

        let secondsXCycles = game.settings.galaxy.productionTicks * game.settings.gameTime.speed * game.settings.gameTime.afk.cycleTimeout;
        let secondsToAfk = Math.max(secondsXCycles, 43200); // Minimum of 12 hours.
        let lastSeenMoreThanXSecondsAgo = moment(player.lastSeen).utc() <= moment().utc().subtract(secondsToAfk, 'seconds');

        return lastSeenMoreThanXSecondsAgo;
    }

}
