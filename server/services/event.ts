import { DBObjectId } from "../types/DBObjectId";
import DatabaseRepository from "../models/DatabaseRepository";
import { BulkUpgradeReport } from "../types/InfrastructureUpgrade";
import { Carrier } from "../types/Carrier";
import { CombatCarrier, CombatResult, CombatStar } from "../types/Combat";
import { Conversation } from "../types/Conversation";
import { Game } from "../types/Game";
import { Player } from "../types/Player";
import { GameRankingResult } from "../types/Rating";
import { Specialist } from "../types/Specialist";
import { Star, StarCaptureResult } from "../types/Star";
import BadgeService from "./badge";
import BroadcastService from "./broadcast";
import CarrierService from "./carrier";
import CombatService from "./combat";
import ConversationService from "./conversation";
import GameService from "./game";
import GameTickService from "./gameTick";
import LedgerService from "./ledger";
import ResearchService from "./research";
import SpecialistService from "./specialist";
import StarService from "./star";
import StarUpgradeService from "./starUpgrade";
import TradeService from "./trade";
import { GameEvent } from "../types/GameEvent";

const moment = require('moment');

export default class EventService {

    EVENT_TYPES = {
        GAME_PLAYER_JOINED: 'gamePlayerJoined',
        GAME_PLAYER_QUIT: 'gamePlayerQuit',
        GAME_PLAYER_DEFEATED: 'gamePlayerDefeated',
        GAME_PLAYER_AFK: 'gamePlayerAFK',
        GAME_STARTED: 'gameStarted',
        GAME_ENDED: 'gameEnded',
        GAME_PAUSED: 'gamePaused',
        GAME_PLAYER_BADGE_PURCHASED: 'gamePlayerBadgePurchased',

        PLAYER_GALACTIC_CYCLE_COMPLETE: 'playerGalacticCycleComplete',
        PLAYER_COMBAT_STAR: 'playerCombatStar',
        PLAYER_COMBAT_CARRIER: 'playerCombatCarrier',
        PLAYER_RESEARCH_COMPLETE: 'playerResearchComplete',
        PLAYER_TECHNOLOGY_RECEIVED: 'playerTechnologyReceived',
        PLAYER_TECHNOLOGY_SENT: 'playerTechnologySent',
        PLAYER_CREDITS_RECEIVED: 'playerCreditsReceived',
        PLAYER_CREDITS_SENT: 'playerCreditsSent',
        PLAYER_CREDITS_SPECIALISTS_RECEIVED: 'playerCreditsSpecialistsReceived',
        PLAYER_CREDITS_SPECIALISTS_SENT: 'playerCreditsSpecialistsSent',
        PLAYER_RENOWN_RECEIVED: 'playerRenownReceived',
        PLAYER_RENOWN_SENT: 'playerRenownSent',
        PLAYER_GIFT_RECEIVED: 'playerGiftReceived',
        PLAYER_GIFT_SENT: 'playerGiftSent',
        PLAYER_STAR_ABANDONED: 'playerStarAbandoned',
        PLAYER_BULK_INFRASTRUCTURE_UPGRADED: 'playerBulkInfrastructureUpgraded',
        PLAYER_DEBT_SETTLED: 'playerDebtSettled',
        PLAYER_DEBT_FORGIVEN: 'playerDebtForgiven',
        PLAYER_STAR_SPECIALIST_HIRED: 'playerStarSpecialistHired',
        PLAYER_CARRIER_SPECIALIST_HIRED: 'playerCarrierSpecialistHired',
        PLAYER_CONVERSATION_CREATED: 'playerConversationCreated',
        PLAYER_CONVERSATION_INVITED: 'playerConversationInvited',
        PLAYER_CONVERSATION_LEFT: 'playerConversationLeft'
    }
    
    eventModel: any;
    eventRepo: DatabaseRepository<GameEvent>;
    broadcastService: BroadcastService;
    gameService: GameService;
    gameTickService: GameTickService;
    researchService: ResearchService;
    starService: StarService;
    starUpgradeService: StarUpgradeService;
    tradeService: TradeService;
    ledgerService: LedgerService;
    conversationService: ConversationService;
    combatService: CombatService;
    specialistService: SpecialistService
    badgeService: BadgeService;
    carrierService: CarrierService;

    constructor(
        eventModel: any,
        eventRepo: DatabaseRepository<GameEvent>,
        broadcastService: BroadcastService,
        gameService: GameService,
        gameTickService: GameTickService,
        researchService: ResearchService,
        starService: StarService,
        starUpgradeService: StarUpgradeService,
        tradeService: TradeService,
        ledgerService: LedgerService,
        conversationService: ConversationService,
        combatService: CombatService,
        specialistService: SpecialistService,
        badgeService: BadgeService,
        carrierService: CarrierService
    ) {
        this.eventModel = eventModel;
        this.eventRepo = eventRepo;
        this.broadcastService = broadcastService;
        this.gameService = gameService;
        this.gameTickService = gameTickService;
        this.researchService = researchService;
        this.starService = starService;
        this.starUpgradeService = starUpgradeService;
        this.tradeService = tradeService;
        this.ledgerService = ledgerService;
        this.conversationService = conversationService;
        this.combatService = combatService;
        this.specialistService = specialistService;
        this.badgeService = badgeService;
        this.carrierService = carrierService;

        this.gameService.on('onGameDeleted', (args) => this.deleteByGameId(args.gameId));
        this.gameService.on('onPlayerJoined', (args) => this.createPlayerJoinedEvent(args.gameId, args.gameTick, args.player));
        this.gameService.on('onGameStarted', (args) => this.createGameStartedEvent(args.gameId, args.gameTick));
        this.gameService.on('onPlayerQuit', (args) => this.createPlayerQuitEvent(args.gameId, args.gameTick, args.player, args.alias));
        this.gameService.on('onPlayerDefeated', (args) => this.createPlayerDefeatedEvent(args.gameId, args.gameTick, args.player));
        
        this.combatService.on('onPlayerCombatStar', (args) => this.createPlayerCombatStarEvent(
            args.gameId, args.gameTick, args.owner, args.defenders, args.attackers, args.star, args.combatResult, args.captureResult));
        this.combatService.on('onPlayerCombatCarrier', (args) => this.createPlayerCombatCarrierEvent(
            args.gameId, args.gameTick, args.defenders, args.attackers, args.combatResult));
        
        this.gameTickService.on('onPlayerGalacticCycleCompleted', (args) => this.createPlayerGalacticCycleCompleteEvent(
            args.gameId, args.gameTick, args.player, 
            args.creditsEconomy, args.creditsBanking, args.creditsSpecialists, 
            args.experimentTechnology, args.experimentAmount, args.experimentLevelUp, args.experimentResearchingNext,
            args.carrierUpkeep));
            
        this.gameTickService.on('onPlayerAfk', (args) => this.createPlayerAfkEvent(args.gameId, args.gameTick, args.player));
        this.gameTickService.on('onPlayerDefeated', (args) => this.createPlayerDefeatedEvent(args.gameId, args.gameTick, args.player));
        this.gameTickService.on('onGameEnded', (args) => this.createGameEndedEvent(args.gameId, args.gameTick, args.rankingResult));
        
        this.researchService.on('onPlayerResearchCompleted', (args) => this.createResearchCompleteEvent(args.gameId, args.gameTick, args.playerId, args.technologyKey, args.technologyLevel, args.technologyKeyNext, args.technologyLevelNext));

        this.starService.on('onPlayerStarAbandoned', (args) => this.createStarAbandonedEvent(args.gameId, args.gameTick, args.player, args.star));
        
        this.starUpgradeService.on('onPlayerInfrastructureBulkUpgraded', (args) => this.createInfrastructureBulkUpgraded(args.gameId, args.gameTick, args.player, args.upgradeSummary));

        this.tradeService.on('onPlayerCreditsReceived', (args) => this.createCreditsReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerCreditsSent', (args) => this.createCreditsSentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerCreditsSpecialistsReceived', (args) => this.createCreditsSpecialistsReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerCreditsSpecialistsSent', (args) => this.createCreditsSpecialistsSentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerRenownReceived', (args) => this.createRenownReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerRenownSent', (args) => this.createRenownSentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerTechnologyReceived', (args) => this.createTechnologyReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.technology));
        this.tradeService.on('onPlayerTechnologySent', (args) => this.createTechnologySentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.technology));

        this.carrierService.on('onPlayerGiftReceived', (args) => this.createGiftReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.carrier, args.star));
        this.carrierService.on('onPlayerGiftSent', (args) => this.createGiftSentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.carrier, args.star));

        this.ledgerService.on('onDebtAdded', (args) => this.createDebtAddedEvent(args.gameId, args.gameTick, args.debtor, args.creditor, args.amount));
        this.ledgerService.on('onDebtSettled', (args) => this.createDebtSettledEvent(args.gameId, args.gameTick, args.debtor, args.creditor, args.amount));
        this.ledgerService.on('onDebtForgiven', (args) => this.createDebtForgivenEvent(args.gameId, args.gameTick, args.debtor, args.creditor, args.amount));

        this.conversationService.on('onConversationCreated', (args) => this.createPlayerConversationCreated(args.gameId, args.gameTick, args.convo));
        this.conversationService.on('onConversationInvited', (args) => this.createPlayerConversationInvited(args.gameId, args.gameTick, args.convo, args.playerId));
        this.conversationService.on('onConversationLeft', (args) => this.createPlayerConversationLeft(args.gameId, args.gameTick, args.convo, args.playerId));

        this.badgeService.on('onGamePlayerBadgePurchased', (args) => this.createGamePlayerBadgePurchased(args.gameId, args.gameTick, args.purchasedByPlayerId, args.purchasedByPlayerAlias, args.purchasedForPlayerId, args.purchasedForPlayerAlias, args.badgeKey, args.badgeName));
    }

    async deleteByGameId(gameId: DBObjectId) {
        await this.eventRepo.deleteMany({
            gameId
        });
    }

    async createGameEvent(gameId: DBObjectId, gameTick: number, type: string, data: any) {
        let event = new this.eventModel({
            gameId,
            playerId: null,
            tick: gameTick,
            type,
            data,
            read: null
        });

        await event.save();
    }

    async createPlayerEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, type: string, data: any, isRead: boolean = false) {
        let event = new this.eventModel({
            gameId,
            playerId,
            tick: gameTick,
            type,
            data,
            read: isRead
        });

        await event.save();
    }

    async getPlayerEvents(gameId: DBObjectId, player: Player, startTick: number = 0) {
        let events = await this.eventRepo.find({
            gameId: gameId,
            tick: { $gte: startTick },
            playerId: {
                $in: [
                    player._id,
                    null
                ]
            }
        },
        null, // All fields
        {
            tick: -1, // Sort by tick descending
            _id: -1
        });

        return events;
    }

    async getPlayerTradeEvents(gameId: DBObjectId, player: Player, startTick: number = 0) {
        let tradeEvents: GameEvent[] = await this.eventRepo.find({
            gameId: gameId,
            tick: { $gte: startTick },
            playerId: {
                $in: [
                    player._id,
                    null
                ]
            },
            type: {
                $in: [
                    this.EVENT_TYPES.PLAYER_TECHNOLOGY_SENT,
                    this.EVENT_TYPES.PLAYER_TECHNOLOGY_RECEIVED,
                    this.EVENT_TYPES.PLAYER_CREDITS_SENT,
                    this.EVENT_TYPES.PLAYER_CREDITS_RECEIVED,
                    this.EVENT_TYPES.PLAYER_CREDITS_SPECIALISTS_SENT,
                    this.EVENT_TYPES.PLAYER_CREDITS_SPECIALISTS_RECEIVED,
                    this.EVENT_TYPES.PLAYER_RENOWN_SENT,
                    this.EVENT_TYPES.PLAYER_RENOWN_RECEIVED,
                    this.EVENT_TYPES.PLAYER_GIFT_SENT,
                    this.EVENT_TYPES.PLAYER_GIFT_RECEIVED
                ]
            }
        },
        null, // All fields
        {
            tick: -1, // Sort by tick descending
            _id: -1
        });

        // Calculate when the event was created.
        // TODO: Is this more efficient than storing the UTC in the document itself?
        tradeEvents.forEach(t => {
            t.date = moment(t._id.getTimestamp())
        });

        return tradeEvents;
    }

    async markAllEventsAsRead(game: Game, playerId: DBObjectId) {
        await this.eventRepo.updateMany({
            gameId: game._id,
            playerId: playerId,
            read: false
        }, {
            $set: {
                read: true
            }
        });

        this.broadcastService.playerAllEventsRead(game, playerId);
    }

    async markEventAsRead(game: Game, playerId: DBObjectId, eventId: DBObjectId) {
        await this.eventRepo.updateOne({
            _id: eventId,
            gameId: game._id,
            playerId: playerId,
            read: false
        }, {
            $set: {
                read: true
            }
        });

        this.broadcastService.playerEventRead(game, playerId, eventId);
    }

    async getUnreadCount(game: Game, playerId: DBObjectId) {
        return await this.eventRepo.count({
            gameId: game._id,
            playerId: playerId,
            read: false
        });
    }

    /* GLOBAL EVENTS */

    async createPlayerJoinedEvent(gameId: DBObjectId, gameTick: number, player: Player) {
        let data = {
            playerId: player._id,
            alias: player.alias
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PLAYER_JOINED, data);
    }

    async createPlayerQuitEvent(gameId: DBObjectId, gameTick: number, player: Player, alias: string) {
        let data = {
            playerId: player._id,
            alias
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PLAYER_QUIT, data);
    }

    async createPlayerDefeatedEvent(gameId: DBObjectId, gameTick: number, player: Player) {
        let data = {
            playerId: player._id,
            alias: player.alias
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PLAYER_DEFEATED, data);
    }

    async createPlayerAfkEvent(gameId: DBObjectId, gameTick: number, player: Player) {
        let data = {
            playerId: player._id,
            alias: player.alias
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PLAYER_AFK, data);
    }

    async createGameStartedEvent(gameId: DBObjectId, gameTick: number) {
        let data = {};

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_STARTED, data);
    }

    async createGameEndedEvent(gameId: DBObjectId, gameTick: number, rankingResult: GameRankingResult) {
        let data = {
            rankingResult
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_ENDED, data);
    }

    async createGamePausedEvent(gameId: DBObjectId, gameTick: number) {
        let data = {};

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PAUSED, data);
    }

    /* PLAYER EVENTS */

    async createPlayerGalacticCycleCompleteEvent(gameId: DBObjectId, gameTick: number, player: Player, 
        creditsEconomy: number, creditsBanking: number, creditsSpecialists: number, experimentTechnology: string, experimentAmount: number, experimentLevelUp: boolean, experimentResearchingNext: string, carrierUpkeep: number) {
        let data = {
            creditsEconomy,
            creditsBanking,
            creditsSpecialists,
            experimentTechnology,
            experimentAmount,
            experimentLevelUp,
            experimentResearchingNext,
            carrierUpkeep
        };

        return await this.createPlayerEvent(gameId, gameTick, player._id, this.EVENT_TYPES.PLAYER_GALACTIC_CYCLE_COMPLETE, data);
    }

    async createPlayerCombatStarEvent(gameId: DBObjectId, gameTick: number, owner: Player, defenders: Player[], attackers: Player[], star: Star, combatResult: CombatResult, captureResult: StarCaptureResult) {
        let data = {
            playerIdOwner: owner._id,
            playerIdDefenders: defenders.map(p => p._id),
            playerIdAttackers: attackers.map(p => p._id),
            starId: star._id,
            starName: star.name,
            captureResult
        };

        for (let defender of defenders) {
            let defenderCombatResult: CombatResult = Object.assign({}, combatResult);

            defenderCombatResult.star = this.tryMaskObjectShips(combatResult.star, defender) as CombatStar;
            defenderCombatResult.carriers = combatResult.carriers.map(c => this.tryMaskObjectShips(c, defender)) as CombatCarrier[];

            await this.createPlayerEvent(gameId, gameTick, defender._id, this.EVENT_TYPES.PLAYER_COMBAT_STAR, { ...data, combatResult: defenderCombatResult });
        }

        for (let attacker of attackers) {
            let attackerCombatResult = Object.assign({}, combatResult);

            attackerCombatResult.star = this.tryMaskObjectShips(combatResult.star, attacker) as CombatStar;
            attackerCombatResult.carriers = combatResult.carriers.map(c => this.tryMaskObjectShips(c, attacker)) as CombatCarrier[];

            await this.createPlayerEvent(gameId, gameTick, attacker._id, this.EVENT_TYPES.PLAYER_COMBAT_STAR, { ...data, combatResult: attackerCombatResult });
        }
    }

    async createPlayerCombatCarrierEvent(gameId: DBObjectId, gameTick: number, defenders: Player[], attackers: Player[], combatResult: CombatResult) {
        let data = {
            playerIdDefenders: defenders.map(p => p._id),
            playerIdAttackers: attackers.map(p => p._id),
            combatResult
        };

        for (let defender of defenders) {
            let defenderCombatResult = Object.assign({}, combatResult);

            defenderCombatResult.carriers = combatResult.carriers.map(c => this.tryMaskObjectShips(c, defender)) as CombatCarrier[];

            await this.createPlayerEvent(gameId, gameTick, defender._id, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, { ...data, combatResult: defenderCombatResult });
        }

        for (let attacker of attackers) {
            let attackerCombatResult = Object.assign({}, combatResult);

            attackerCombatResult.carriers = combatResult.carriers.map(c => this.tryMaskObjectShips(c, attacker)) as CombatCarrier[];

            await this.createPlayerEvent(gameId, gameTick, attacker._id, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, { ...data, combatResult: attackerCombatResult });
        }
    }

    tryMaskObjectShips(carrierOrStar: CombatStar | CombatCarrier | null, player: Player) {
        if (!carrierOrStar) {
            return carrierOrStar;
        }

        // If the player doesn't own the object and the object is a scrambler then we need
        // to mask the before and lost amounts.
        if (carrierOrStar.ownedByPlayerId && player._id.toString() !== carrierOrStar.ownedByPlayerId.toString() && this.specialistService.getCarrierOrStarHideShips(carrierOrStar)) {
            let clone: CombatStar | CombatCarrier = Object.assign({}, carrierOrStar);

            clone.before = '???';
            clone.lost = '???';

            // If the object lost ships and is now dead, then we need to mask the after value too.
            // Note: Stars can have a 0 ship garrison and be a scrambler so we want to ensure that the 0 ships is still scrambled.
            if (carrierOrStar.before === 0 || carrierOrStar.after > 0) {
                clone.after = '???';
            }

            return clone;
        }

        return carrierOrStar;
    }

    async createResearchCompleteEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, technologyKey: string, technologyLevel: number, technologyKeyNext: string, technologyLevelNext: number) {
        let data = {
            technologyKey,
            technologyLevel,
            technologyKeyNext,
            technologyLevelNext
        };

        return await this.createPlayerEvent(gameId, gameTick, playerId, this.EVENT_TYPES.PLAYER_RESEARCH_COMPLETE, data);
    }

    async createTechnologyReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, technology: string) {
        let data = {
            fromPlayerId: fromPlayer._id,
            technology
        };

        return await this.createPlayerEvent(gameId, gameTick, toPlayer._id, this.EVENT_TYPES.PLAYER_TECHNOLOGY_RECEIVED, data);
    }

    async createTechnologySentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, technology: string) {
        let data = {
            toPlayerId: toPlayer._id,
            technology
        };

        return await this.createPlayerEvent(gameId, gameTick, fromPlayer._id, this.EVENT_TYPES.PLAYER_TECHNOLOGY_SENT, data, true);
    }

    async createCreditsReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, credits: number) {
        let data = {
            fromPlayerId: fromPlayer._id,
            credits
        };

        return await this.createPlayerEvent(gameId, gameTick, toPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_RECEIVED, data);
    }

    async createCreditsSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, credits: number) {
        let data = {
            toPlayerId: toPlayer._id,
            credits
        };

        return await this.createPlayerEvent(gameId, gameTick, fromPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_SENT, data, true);
    }

    async createCreditsSpecialistsReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, creditsSpecialists: number) {
        let data = {
            fromPlayerId: fromPlayer._id,
            creditsSpecialists
        };

        return await this.createPlayerEvent(gameId, gameTick, toPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_SPECIALISTS_RECEIVED, data);
    }

    async createCreditsSpecialistsSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, creditsSpecialists: number) {
        let data = {
            toPlayerId: toPlayer._id,
            creditsSpecialists
        };

        return await this.createPlayerEvent(gameId, gameTick, fromPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_SPECIALISTS_SENT, data, true);
    }

    async createRenownReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, renown: number) {
        let data = {
            fromPlayerId: fromPlayer._id,
            renown
        };

        return await this.createPlayerEvent(gameId, gameTick, toPlayer._id, this.EVENT_TYPES.PLAYER_RENOWN_RECEIVED, data);
    }

    async createRenownSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, renown: number) {
        let data = {
            toPlayerId: toPlayer._id,
            renown
        };

        return await this.createPlayerEvent(gameId, gameTick, fromPlayer._id, this.EVENT_TYPES.PLAYER_RENOWN_SENT, data, true);
    }

    async createGiftReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, carrier: Carrier, star: Star) {
        let data = {
            fromPlayerId: fromPlayer._id,
            carrierId: carrier._id,
            carrierName: carrier.name,
            carrierShips: carrier.ships,
            starId: star._id,
            starName: star.name
        };

        return await this.createPlayerEvent(gameId, gameTick, toPlayer._id, this.EVENT_TYPES.PLAYER_GIFT_RECEIVED, data);
    }

    async createGiftSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, carrier: Carrier, star: Star) {
        let data = {
            toPlayerId: toPlayer._id,
            carrierId: carrier._id,
            carrierName: carrier.name,
            carrierShips: carrier.ships,
            starId: star._id,
            starName: star.name
        };

        return await this.createPlayerEvent(gameId, gameTick, fromPlayer._id, this.EVENT_TYPES.PLAYER_GIFT_SENT, data, true);
    }

    async createStarAbandonedEvent(gameId: DBObjectId, gameTick: number, player: Player, star: Star) {
        let data = {
            starId: star._id,
            starName: star.name
        };

        return await this.createPlayerEvent(gameId, gameTick, player._id, this.EVENT_TYPES.PLAYER_STAR_ABANDONED, data, true);
    }

    async createInfrastructureBulkUpgraded(gameId: DBObjectId, gameTick: number, player: Player, upgradeReport: BulkUpgradeReport) {
        let data = {
            upgradeReport
        };

        return await this.createPlayerEvent(gameId, gameTick, player._id, this.EVENT_TYPES.PLAYER_BULK_INFRASTRUCTURE_UPGRADED, data, true);
    }

    async createDebtAddedEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number) {
        // Debt added event is superfluous as we already have other events for when trades occur.
        // Just broadcast the event instead.

        this.broadcastService.gamePlayerDebtAdded(debtorPlayerId, creditorPlayerId, amount);
    }

    async createDebtSettledEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        await this.createPlayerEvent(gameId, gameTick, debtorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_SETTLED, data, true);
        await this.createPlayerEvent(gameId, gameTick, creditorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_SETTLED, data, false);

        this.broadcastService.gamePlayerDebtSettled(debtorPlayerId, creditorPlayerId, amount);
    }

    async createDebtForgivenEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        await this.createPlayerEvent(gameId, gameTick, debtorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_FORGIVEN, data, false);
        await this.createPlayerEvent(gameId, gameTick, creditorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_FORGIVEN, data, true);

        this.broadcastService.gamePlayerDebtForgiven(debtorPlayerId, creditorPlayerId, amount);
    }

    async createPlayerStarSpecialistHired(gameId: DBObjectId, gameTick: number, player: Player, star: Star, specialist: Specialist) {
        let data = {
            starId: star._id,
            starName: star.name,
            specialistId: specialist.id,
            // Need to keep these values just in case specs are changed in future.
            specialistName: specialist.name,
            specialistDescription: specialist.description
        }

        await this.createPlayerEvent(gameId, gameTick, player._id, this.EVENT_TYPES.PLAYER_STAR_SPECIALIST_HIRED, data, true);
    }

    async createPlayerCarrierSpecialistHired(gameId: DBObjectId, gameTick: number, player: Player, carrier: Carrier, specialist: Specialist) {
        let data = {
            carrierId: carrier._id,
            carrierName: carrier.name, // Carriers may be destroyed so we need to keep track of the name separately
            specialistId: specialist.id,
            // Need to keep these values just in case specs are changed in future.
            specialistName: specialist.name,
            specialistDescription: specialist.description
        }

        await this.createPlayerEvent(gameId, gameTick, player._id, this.EVENT_TYPES.PLAYER_CARRIER_SPECIALIST_HIRED, data, true);
    }

    async createPlayerConversationCreated(gameId: DBObjectId, gameTick: number, convo: Conversation) {
        let data = {
            conversationId: convo._id,
            createdBy: convo.createdBy,
            name: convo.name,
            participants: convo.participants
        };

        await this.createPlayerEvent(gameId, gameTick, convo.createdBy!, this.EVENT_TYPES.PLAYER_CONVERSATION_CREATED, data, true);
    }

    async createPlayerConversationInvited(gameId: DBObjectId, gameTick: number, convo: Conversation, playerId: DBObjectId) {
        let data = {
            conversationId: convo._id,
            name: convo.name,
            playerId
        };

        await this.createPlayerEvent(gameId, gameTick, playerId, this.EVENT_TYPES.PLAYER_CONVERSATION_INVITED, data);
    }

    async createPlayerConversationLeft(gameId: DBObjectId, gameTick: number, convo: Conversation, playerId: DBObjectId) {
        let data = {
            conversationId: convo._id,
            name: convo.name,
            playerId
        };

        await this.createPlayerEvent(gameId, gameTick, playerId, this.EVENT_TYPES.PLAYER_CONVERSATION_LEFT, data, true);
    }

    async createGamePlayerBadgePurchased(gameId: DBObjectId, gameTick: number, purchasedByPlayerId: DBObjectId, purchasedByPlayerAlias: string, purchasedForPlayerId: DBObjectId, purchasedForPlayerAlias: string, badgeKey: string, badgeName: string) {
        let data = {
            purchasedByPlayerId,
            purchasedByPlayerAlias,
            purchasedForPlayerId,
            purchasedForPlayerAlias,
            badgeKey,
            badgeName
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PLAYER_BADGE_PURCHASED, data);
    }

};
