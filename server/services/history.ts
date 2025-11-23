import GameStateService from "./gameState";

const cache = require('memory-cache');
import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Game } from './types/Game';
import { GameHistory, GameHistoryCarrier } from './types/GameHistory';
import GameService from './game';
import PlayerService from './player';
import PlayerStatisticsService from './playerStatistics';

export default class HistoryService {
    historyRepo: Repository<GameHistory>;
    playerService: PlayerService;
    gameService: GameService;
    playerStatisticsService: PlayerStatisticsService;
    gameStateService: GameStateService;

    constructor(
        historyRepo: Repository<GameHistory>,
        playerService: PlayerService,
        gameService: GameService,
        playerStatisticsService: PlayerStatisticsService,
        gameStateService: GameStateService,
    ) {
        this.historyRepo = historyRepo;
        this.playerService = playerService;
        this.gameService = gameService;
        this.playerStatisticsService = playerStatisticsService;
        this.gameStateService = gameStateService;

        this.gameService.on('onGameDeleted', (args) => this.deleteByGameId(args.gameId));
    }

    async listIntel(gameId: DBObjectId, startTick: number | undefined, endTick: number | undefined) {
        const game = await this.gameService.getById(gameId, {
            settings: 1,
            state: 1,
        });

        // change here
        if (!game?.settings || (game?.settings.specialGalaxy.darkGalaxy === 'extra' && !this.gameStateService.isFinished(game))) {
            throw new ValidationError('Intel is not available in this game mode.');
        }

        startTick = startTick || 0;
        endTick = endTick || game.state.tick || 0;

        let cacheKey = `intel_${gameId}_${startTick}_${endTick}`;
        let cached = cache.get(cacheKey);

        if (cached) {
            return cached;
        }

        let intel = await this.historyRepo.find({
            gameId,
            tick: { 
                $gte: startTick,
                $lte: endTick
            }
        }, {
            gameId: 1,
            tick: 1,
            'players.playerId': 1,
            'players.statistics.totalStars': 1,
            'players.statistics.totalHomeStars': 1,
            'players.statistics.totalEconomy': 1,
            'players.statistics.totalIndustry': 1,
            'players.statistics.totalScience': 1,
            'players.statistics.totalShips': 1,
            'players.statistics.totalCarriers': 1,
            'players.statistics.totalSpecialists': 1,
            'players.statistics.totalStarSpecialists': 1,
            'players.statistics.totalCarrierSpecialists': 1,
            'players.statistics.newShips': 1,
            'players.statistics.warpgates': 1,
            'players.research.weapons.level': 1,
            'players.research.banking.level': 1,
            'players.research.manufacturing.level': 1,
            'players.research.hyperspace.level': 1,
            'players.research.scanning.level': 1,
            'players.research.experimentation.level': 1,
            'players.research.terraforming.level': 1,
            'players.research.specialists.level': 1,
        }, { 
            tick: 1 
        });

        cache.put(cacheKey, intel, 3600000); // 1 hour

        return intel;
    }

    async log(game: Game) {
        // Check if there is already a history record with this tick, if so we should ignore this call.
        let history = await this.historyRepo.findOne({
            gameId: game._id,
            tick: game.state.tick
        });

        if (history) {
            return;
        }

        history = {
            gameId: game._id,
            tick: game.state.tick,
            productionTick: game.state.productionTick,
            players: [],
            stars: [],
            carriers: []
        };

        history.players = game.galaxy.players.map(player => {
            let stats = this.playerStatisticsService.getStats(game, player);

            return {
                userId: player.userId,
                playerId: player._id,
                statistics: {
                    totalStars: stats.totalStars,
                    totalHomeStars: stats.totalHomeStars,
                    totalEconomy: stats.totalEconomy,
                    totalIndustry: stats.totalIndustry,
                    totalScience: stats.totalScience,
                    totalShips: stats.totalShips,
                    totalCarriers: stats.totalCarriers,
                    totalSpecialists: stats.totalSpecialists,
                    totalStarSpecialists: stats.totalStarSpecialists,
                    totalCarrierSpecialists: stats.totalCarrierSpecialists,
                    newShips: stats.newShips,
                    warpgates: stats.warpgates
                },
                alias: player.alias,
                avatar: player.avatar,
                researchingNow: player.researchingNow,
                researchingNext: player.researchingNext,
                credits: player.credits,
                creditsSpecialists: player.creditsSpecialists,
                isOpenSlot: player.isOpenSlot,
                defeated: player.defeated,
                defeatedDate: player.defeatedDate,
                afk: player.afk,
                ready: player.ready,
                readyToQuit: player.readyToQuit || false,
                research: player.research,
                scheduledActions: player.scheduledActions
            };
        });

        // Note: We save the star and carrier data in the history for galaxy masking.
        
        history.stars = game.galaxy.stars.map(s => {
            return {
                starId: s._id,
                ownedByPlayerId: s.ownedByPlayerId,
                naturalResources: s.naturalResources,
                ships: s.ships!,
                shipsActual: s.shipsActual!,
                specialistId: s.specialistId,
                homeStar: s.homeStar,
                warpGate: s.warpGate,
                ignoreBulkUpgrade: s.ignoreBulkUpgrade!,
                infrastructure: s.infrastructure,
                location: s.location,
                wormHoleToStarId: s.wormHoleToStarId,
            };
        });

        history.carriers = game.galaxy.carriers.map(c => {
            // todo fix this properly
            if (!c.name) {
                c.name = 'Carrier';
            }

            let x: GameHistoryCarrier = {
                carrierId: c._id,
                ownedByPlayerId: c.ownedByPlayerId!,
                name: c.name,
                orbiting: c.orbiting,
                ships: c.ships!,
                specialistId: c.specialistId,
                isGift: c.isGift,
                location: c.location,
                waypoints: []
            };

            // Trim off unwanted waypoints, we only care about the first one.
            if (c.waypoints.length) {
                x.waypoints = [c.waypoints[0]];
            }

            return x;
        });

        await this.historyRepo.insertOne(history);

        // We don't want to clean the first (0th) tick directly after saving it
        if (game.state.tick !== 0) {
            await this.cleanupTimeMachineHistory(game);
        }
    }

    async cleanupTimeMachineHistory(game: Game) {
        let maxTick;

        const MIN_HISTORY_TICK_OFFSET = null; // Decide how many ticks to store.

        // For games where the time machine is disabled, clear out the all previous tick
        // data to save space as we only need the current tick data for masking.
        // Otherwise limit normal games to MIN_HISTORY_TICK_OFFSET ticks ago to save space.
        if (game.settings.general.timeMachine === 'disabled') {
            maxTick = game.state.tick;
        } 
        else if (MIN_HISTORY_TICK_OFFSET) {
            maxTick = Math.max(0, game.state.tick - MIN_HISTORY_TICK_OFFSET);
        }

        await this.historyRepo.updateMany({
            gameId: game._id,
            tick: {
                $lt: maxTick
            },
            stars: {
                $exists: true,
                $not: { $size: 0 }
            }
        }, {
            $unset: {
                'players.$[].alias': '',
                'players.$[].avatar': '',
                'players.$[].researchingNow': '',
                'players.$[].researchingNext': '',
                'players.$[].credits': '',
                'players.$[].creditsSpecialists': '',
                'players.$[].defeated': '',
                'players.$[].defeatedDate': '',
                'players.$[].afk': '',
                'players.$[].ready': '',
                'players.$[].readyToQuit': '',
                'stars': '',
                'carriers': ''
            }
        });
    }

    async getHistoryByTick(gameId: DBObjectId, tick: number | null) {
        return await this.historyRepo.findOne({
            gameId,
            tick
        });
    }

    async deleteByGameId(gameId: DBObjectId) {
        await this.historyRepo.deleteMany({
            gameId
        });
    }

    async getHistoryMinimumTick(gameId: DBObjectId): Promise<number | null> {
        return (await this.historyRepo.findOne({
            gameId: gameId, stars: { $ne: null }, carriers: { $ne: null }
        }, null, { sort: { tick: 1 } }))?.tick ?? null;
    }
};
