import {BaseGameEvent, LedgerType} from 'solaris-common';
import { ValidationError } from "solaris-common";
import BadgeService, { BadgeServiceEvents } from "./badge";
import BroadcastService from "./broadcast";
import CarrierGiftService, { CarrierGiftServiceEvents } from "./carrierGift";
import CombatService, { CombatServiceEvents } from "./combat";
import ConversationService, { ConversationServiceEvents } from "./conversation";
import DiplomacyService, { DiplomacyServiceEvents } from "./diplomacy";
import GameService, { GameServiceEvents } from "./game";
import GameJoinService, { GameJoinServiceEvents } from "./gameJoin";
import GameTickService, { GameTickServiceEvents } from "./gameTick";
import LedgerService, { LedgerServiceEvents } from "./ledger";
import Repository from "./repository";
import ResearchService, { ResearchServiceEvents } from "./research";
import SpecialistService from "./specialist";
import StarService, { StarServiceEvents } from "./star";
import StarUpgradeService, { StarUpgradeServiceEvents } from "./starUpgrade";
import TradeService, { TradeServiceEvents } from "./trade";
import { Carrier } from "./types/Carrier";
import { CombatResult } from "./types/Combat";
import { Conversation } from "./types/Conversation";
import { DBObjectId } from "./types/DBObjectId";
import { DiplomaticStatus } from "solaris-common";
import { Game } from "./types/Game";
import { BulkUpgradeReport } from "./types/InfrastructureUpgrade";
import { Player } from "./types/Player";
import { Specialist } from 'solaris-common';
import { Star, StarCaptureResult } from "./types/Star";
import { InternalGameEvent } from "./types/internalEvents/InternalGameEvent";
import InternalGameDiplomacyPeaceDeclaredEvent from "./types/internalEvents/GameDiplomacyPeaceDeclared";
import InternalGameDiplomacyWarDeclaredEvent from "./types/internalEvents/GameDiplomacyWarDeclared";
import InternalGameEndedEvent from "./types/internalEvents/GameEnded";
import InternalGamePlayerAFKEvent from "./types/internalEvents/GamePlayerAFK";
import InternalGamePlayerBadgePurchasedEvent from "./types/internalEvents/GamePlayerBadgePurchased";
import InternalGamePlayerDefeatedEvent from "./types/internalEvents/GamePlayerDefeated";
import InternalGamePlayerJoinedEvent from "./types/internalEvents/GamePlayerJoined";
import InternalGamePlayerQuitEvent from "./types/internalEvents/GamePlayerQuit";
import InternalPlayerGalacticCycleCompletedEvent from './types/internalEvents/PlayerGalacticCycleComplete';

import moment from "moment";

export default class EventService {

    EVENT_TYPES = {
        GAME_PLAYER_JOINED: 'gamePlayerJoined',
        GAME_PLAYER_QUIT: 'gamePlayerQuit',
        GAME_PLAYER_DEFEATED: 'gamePlayerDefeated',
        GAME_PLAYER_AFK: 'gamePlayerAFK',
        GAME_STARTED: 'gameStarted',
        GAME_ENDED: 'gameEnded',
        GAME_PLAYER_BADGE_PURCHASED: 'gamePlayerBadgePurchased',
        GAME_DIPLOMACY_PEACE_DECLARED: 'gameDiplomacyPeaceDeclared',
        GAME_DIPLOMACY_WAR_DECLARED: 'gameDiplomacyWarDeclared',

        // TODO: Need event types for the ones below, see ./types/events directory
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
        PLAYER_STAR_DIED: 'playerStarDied',
        PLAYER_STAR_REIGNITED: 'playerStarReignited',
        PLAYER_BULK_INFRASTRUCTURE_UPGRADED: 'playerBulkInfrastructureUpgraded',
        PLAYER_DEBT_SETTLED: 'playerDebtSettled',
        PLAYER_DEBT_FORGIVEN: 'playerDebtForgiven',
        PLAYER_STAR_SPECIALIST_HIRED: 'playerStarSpecialistHired',
        PLAYER_CARRIER_SPECIALIST_HIRED: 'playerCarrierSpecialistHired',
        PLAYER_CONVERSATION_CREATED: 'playerConversationCreated',
        PLAYER_CONVERSATION_INVITED: 'playerConversationInvited',
        PLAYER_CONVERSATION_LEFT: 'playerConversationLeft',
        PLAYER_DIPLOMACY_STATUS_CHANGED: 'playerDiplomacyStatusChanged',
    }
    
    eventModel;
    eventRepo: Repository<BaseGameEvent<DBObjectId>>;
    broadcastService: BroadcastService;
    gameService: GameService;
    gameJoinService: GameJoinService;
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
    carrierGiftService: CarrierGiftService;
    diplomacyService: DiplomacyService;

    constructor(
        eventModel,
        eventRepo: Repository<BaseGameEvent<DBObjectId>>,
        broadcastService: BroadcastService,
        gameService: GameService,
        gameJoinService: GameJoinService,
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
        carrierGiftService: CarrierGiftService,
        diplomacyService: DiplomacyService
    ) {
        this.eventModel = eventModel;
        this.eventRepo = eventRepo;
        this.broadcastService = broadcastService;
        this.gameService = gameService;
        this.gameJoinService = gameJoinService;
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
        this.carrierGiftService = carrierGiftService;
        this.diplomacyService = diplomacyService;

        this.gameJoinService.on(GameJoinServiceEvents.onPlayerJoined, (args) => this.createPlayerJoinedEvent(args));
        this.gameJoinService.on(GameJoinServiceEvents.onGameStarted, (args) => this.createGameStartedEvent(args));
        
        this.gameService.on(GameServiceEvents.onGameDeleted, (args) => this.deleteByGameId(args.gameId));
        this.gameService.on(GameServiceEvents.onPlayerQuit, (args) => this.createPlayerQuitEvent(args));
        this.gameService.on(GameServiceEvents.onPlayerDefeated, (args) => this.createPlayerDefeatedEvent(args));
        
        this.combatService.on(CombatServiceEvents.onPlayerCombatStar, (args) => this.createPlayerCombatStarEvent(
            args.gameId, args.gameTick, args.owner, args.defenders, args.attackers, args.star, args.combatResult, args.captureResult));
        this.combatService.on(CombatServiceEvents.onPlayerCombatCarrier, (args) => this.createPlayerCombatCarrierEvent(
            args.gameId, args.gameTick, args.defenders, args.attackers, args.combatResult));
        
        this.gameTickService.on(GameTickServiceEvents.onPlayerGalacticCycleCompleted, (args) => this.createPlayerGalacticCycleCompleteEvent(args));
        this.gameTickService.on(GameTickServiceEvents.onPlayerAfk, (args) => this.createPlayerAfkEvent(args));
        this.gameTickService.on(GameTickServiceEvents.onPlayerDefeated, (args) => this.createPlayerDefeatedEvent(args));
        this.gameTickService.on(GameTickServiceEvents.onGameEnded, (args) => this.createGameEndedEvent(args));

        this.researchService.on(ResearchServiceEvents.onPlayerResearchCompleted, (args) => this.createResearchCompleteEvent(args.gameId, args.gameTick, args.playerId, args.technologyKey, args.technologyLevel, args.technologyKeyNext, args.technologyLevelNext));

        this.starService.on(StarServiceEvents.onPlayerStarAbandoned, (args) => this.createStarAbandonedEvent(args.gameId, args.gameTick, args.player, args.star));
        this.starService.on(StarServiceEvents.onPlayerStarDied, (args) => this.createStarDiedEvent(args.gameId, args.gameTick, args.playerId, args.starId, args.starName));
        this.starService.on(StarServiceEvents.onPlayerStarReignited, (args) => this.createStarReignitedEvent(args.gameId, args.gameTick, args.playerId, args.starId, args.starName));
        
        this.starUpgradeService.on(StarUpgradeServiceEvents.onPlayerInfrastructureBulkUpgraded, (args) => this.createInfrastructureBulkUpgraded(args.gameId, args.gameTick, args.player, args.upgradeSummary));

        this.tradeService.on(TradeServiceEvents.onPlayerCreditsReceived, (args) => this.createCreditsReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on(TradeServiceEvents.onPlayerCreditsSent, (args) => this.createCreditsSentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on(TradeServiceEvents.onPlayerCreditsSpecialistsReceived, (args) => this.createCreditsSpecialistsReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on(TradeServiceEvents.onPlayerCreditsSpecialistsSent, (args) => this.createCreditsSpecialistsSentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on(TradeServiceEvents.onPlayerRenownReceived, (args) => this.createRenownReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on(TradeServiceEvents.onPlayerRenownSent, (args) => this.createRenownSentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on(TradeServiceEvents.onPlayerTechnologyReceived, (args) => this.createTechnologyReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.technology));
        this.tradeService.on(TradeServiceEvents.onPlayerTechnologySent, (args) => this.createTechnologySentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.technology));

        this.carrierGiftService.on(CarrierGiftServiceEvents.onPlayerGiftReceived, (args) => this.createGiftReceivedEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.carrier, args.star));
        this.carrierGiftService.on(CarrierGiftServiceEvents.onPlayerGiftSent, (args) => this.createGiftSentEvent(args.gameId, args.gameTick, args.fromPlayer, args.toPlayer, args.carrier, args.star));

        this.ledgerService.on(LedgerServiceEvents.onDebtAdded, (args) => this.createDebtAddedEvent(args.gameId, args.gameTick, args.debtor, args.creditor, args.amount, args.ledgerType));
        this.ledgerService.on(LedgerServiceEvents.onDebtSettled, (args) => this.createDebtSettledEvent(args.gameId, args.gameTick, args.debtor, args.creditor, args.amount, args.ledgerType));
        this.ledgerService.on(LedgerServiceEvents.onDebtForgiven, (args) => this.createDebtForgivenEvent(args.gameId, args.gameTick, args.debtor, args.creditor, args.amount, args.ledgerType));

        this.conversationService.on(ConversationServiceEvents.onConversationCreated, (args) => this.createPlayerConversationCreated(args.gameId, args.gameTick, args.convo));
        this.conversationService.on(ConversationServiceEvents.onConversationInvited, (args) => this.createPlayerConversationInvited(args.gameId, args.gameTick, args.convo, args.playerId));
        this.conversationService.on(ConversationServiceEvents.onConversationLeft, (args) => this.createPlayerConversationLeft(args.gameId, args.gameTick, args.convo, args.playerId));

        this.badgeService.on(BadgeServiceEvents.onGamePlayerBadgePurchased, (args) => this.createGamePlayerBadgePurchased(args));

        this.diplomacyService.on(DiplomacyServiceEvents.onDiplomacyPeaceDeclared, (args) => this.createGameDiplomacyPeaceDeclared(args));
        this.diplomacyService.on(DiplomacyServiceEvents.onDiplomacyWarDeclared, (args) => this.createGameDiplomacyWarDeclared(args));
        this.diplomacyService.on(DiplomacyServiceEvents.onDiplomacyStatusChanged, (args) => this.createPlayerDiplomacyStatusChanged(args.gameId, args.gameTick, args.status));
    }

    async deleteByGameId(gameId: DBObjectId) {
        await this.eventRepo.deleteMany({
            gameId
        });
    }

    async createGameEvent(gameId: DBObjectId, gameTick: number, type: string, data) {
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

    async createPlayerEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, type: string, data, isRead: boolean = false) {
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

    async getPlayerEvents(gameId: DBObjectId, player: Player, page: number, pageSize: number, category: string | null) {
        const query = {
            gameId: gameId,
            playerId: {
                $in: [
                    player._id,
                    null
                ]
            }
        };

        if (category != null && category !== 'all') {
            const categories = {
                gameEvents: [
                    'gamePlayerJoined',
                    'gamePlayerQuit',
                    'gamePlayerDefeated',
                    'gamePlayerAFK',
                    'gameStarted',
                    'gameEnded',
                    'gamePaused',
                    'gamePlayerBadgePurchased',
                    'playerRenownReceived',
                    'playerRenownSent'
                ],
                trade: [
                    'playerTechnologyReceived',
                    'playerTechnologySent',
                    'playerCreditsReceived',
                    'playerCreditsSent',
                    'playerCreditsSpecialistsReceived',
                    'playerCreditsSpecialistsSent',
                    'playerGiftReceived',
                    'playerGiftSent',
                    'playerDebtSettled',
                    'playerDebtForgiven'
                ],
                combat: [
                    'playerCombatStar',
                    'playerCombatCarrier',
                    'playerStarAbandoned'
                ],
                galacticCycles: [
                    'playerGalacticCycleComplete'
                ],
                research: [
                    'playerResearchComplete'
                ],
                specialists: [
                    'playerStarSpecialistHired',
                    'playerCarrierSpecialistHired'
                ],
                conversations: [
                    'playerConversationCreated',
                    'playerConversationInvited',
                    'playerConversationLeft'
                ],
                diplomacy: [
                    'playerDiplomacyStatusChanged',
                    'gameDiplomacyPeaceDeclared',
                    'gameDiplomacyWarDeclared',
                    'gameDiplomacyAllianceDeclared'
                ]
            };

            const categoryFilter = categories[category!];

            if (!categoryFilter) {
                throw new ValidationError(`Unsupported category: ${category}`);
            }

            query['type'] = {
                $in: categoryFilter
            };
        }

        const count = await this.eventRepo.count(query)

        const events = await this.eventRepo.find(query,
            null, // All fields
            {
                tick: -1, // Sort by tick descending
                _id: -1
            },
            pageSize,
            page * pageSize);

        return {
            count,
            events
        };
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

    async createPlayerJoinedEvent(args: InternalGamePlayerJoinedEvent) {
        let data = {
            playerId: args.playerId,
            alias: args.playerAlias
        };

        return await this.createGameEvent(args.gameId, args.gameTick, this.EVENT_TYPES.GAME_PLAYER_JOINED, data);
    }

    async createPlayerQuitEvent(args: InternalGamePlayerQuitEvent) {
        let data = {
            playerId: args.playerId,
            alias: args.playerAlias
        };

        return await this.createGameEvent(args.gameId, args.gameTick, this.EVENT_TYPES.GAME_PLAYER_QUIT, data);
    }

    async createPlayerDefeatedEvent(args: InternalGamePlayerDefeatedEvent) {
        let data = {
            playerId: args.playerId,
            alias: args.playerAlias,
            openSlot: args.openSlot
        };

        return await this.createGameEvent(args.gameId, args.gameTick, this.EVENT_TYPES.GAME_PLAYER_DEFEATED, data);
    }

    async createPlayerAfkEvent(args: InternalGamePlayerAFKEvent) {
        let data = {
            playerId: args.playerId,
            alias: args.playerAlias
        };

        return await this.createGameEvent(args.gameId, args.gameTick, this.EVENT_TYPES.GAME_PLAYER_AFK, data);
    }

    async createGameStartedEvent(args: InternalGameEvent) {
        let data = {};

        return await this.createGameEvent(args.gameId, args.gameTick, this.EVENT_TYPES.GAME_STARTED, data);
    }

    async createGameEndedEvent(args: InternalGameEndedEvent) {
        let data = {
            rankingResult: args.rankingResult
        };

        return await this.createGameEvent(args.gameId, args.gameTick, this.EVENT_TYPES.GAME_ENDED, data);
    }

    /* PLAYER EVENTS */

    async createPlayerGalacticCycleCompleteEvent(data: InternalPlayerGalacticCycleCompletedEvent) {
        return await this.createPlayerEvent(data.gameId, data.gameTick, data.playerId!, this.EVENT_TYPES.PLAYER_GALACTIC_CYCLE_COMPLETE, data);
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
            let defenderCombatResult: CombatResult = this.combatService.sanitiseCombatResult(combatResult, defender);

            await this.createPlayerEvent(gameId, gameTick, defender._id, this.EVENT_TYPES.PLAYER_COMBAT_STAR, { ...data, combatResult: defenderCombatResult });
        }

        for (let attacker of attackers) {
            let attackerCombatResult: CombatResult = this.combatService.sanitiseCombatResult(combatResult, attacker);

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
            let defenderCombatResult: CombatResult = this.combatService.sanitiseCombatResult(combatResult, defender);
            
            await this.createPlayerEvent(gameId, gameTick, defender._id, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, { ...data, combatResult: defenderCombatResult });
        }

        for (let attacker of attackers) {
            let attackerCombatResult: CombatResult = this.combatService.sanitiseCombatResult(combatResult, attacker);

            await this.createPlayerEvent(gameId, gameTick, attacker._id, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, { ...data, combatResult: attackerCombatResult });
        }
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

    async createStarDiedEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, starId: DBObjectId, starName: string) {
        let data = {
            starId,
            starName
        };

        await this.createPlayerEvent(gameId, gameTick, playerId, this.EVENT_TYPES.PLAYER_STAR_DIED, data);
    }

    async createStarReignitedEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, starId: DBObjectId, starName: string) {
        let data = {
            starId,
            starName
        };

        await this.createPlayerEvent(gameId, gameTick, playerId, this.EVENT_TYPES.PLAYER_STAR_REIGNITED, data);
    }

    async createInfrastructureBulkUpgraded(gameId: DBObjectId, gameTick: number, player: Player, upgradeReport: BulkUpgradeReport) {
        let data = {
            upgradeReport
        };

        return await this.createPlayerEvent(gameId, gameTick, player._id, this.EVENT_TYPES.PLAYER_BULK_INFRASTRUCTURE_UPGRADED, data, true);
    }

    async createDebtAddedEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        // Debt added event is superfluous as we already have other events for when trades occur.
        // Just broadcast the event instead.

        this.broadcastService.gamePlayerDebtAdded(debtorPlayerId, creditorPlayerId, amount, ledgerType);
    }

    async createDebtSettledEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount,
            ledgerType
        };

        await this.createPlayerEvent(gameId, gameTick, debtorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_SETTLED, data, true);
        await this.createPlayerEvent(gameId, gameTick, creditorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_SETTLED, data, false);

        this.broadcastService.gamePlayerDebtSettled(debtorPlayerId, creditorPlayerId, amount, ledgerType);
    }

    async createDebtForgivenEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount,
            ledgerType
        };

        await this.createPlayerEvent(gameId, gameTick, debtorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_FORGIVEN, data, false);
        await this.createPlayerEvent(gameId, gameTick, creditorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_FORGIVEN, data, true);

        this.broadcastService.gamePlayerDebtForgiven(debtorPlayerId, creditorPlayerId, amount, ledgerType);
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

    async createGamePlayerBadgePurchased(args: InternalGamePlayerBadgePurchasedEvent) {
        let data = {
            purchasedByPlayerId: args.purchasedByPlayerId,
            purchasedByPlayerAlias: args.purchasedByPlayerAlias,
            purchasedForPlayerId: args.purchasedForPlayerId,
            purchasedForPlayerAlias: args.purchasedForPlayerAlias,
            badgeKey: args.badgeKey,
            badgeName: args.badgeName
        };

        return await this.createGameEvent(args.gameId, args.gameTick, this.EVENT_TYPES.GAME_PLAYER_BADGE_PURCHASED, data);
    }

    async _deleteGameDiplomacyDeclarationsInTick(gameId: DBObjectId, gameTick: number, status: DiplomaticStatus<DBObjectId>) {
        await this.eventRepo.deleteMany({
            gameId,
            tick: gameTick,
            type: {
                $in: [
                    this.EVENT_TYPES.GAME_DIPLOMACY_PEACE_DECLARED, 
                    this.EVENT_TYPES.GAME_DIPLOMACY_WAR_DECLARED
                ]
            },
            $or: [
                { 
                    'data.playerIdFrom': status.playerIdFrom,
                    'data.playerIdTo': status.playerIdTo
                },
                { 
                    'data.playerIdFrom': status.playerIdTo,
                    'data.playerIdTo': status.playerIdFrom
                }
            ]
        });
    }

    async createGameDiplomacyPeaceDeclared(args: InternalGameDiplomacyPeaceDeclaredEvent) {
        let data = args.status;

        return await this.createGameEvent(args.gameId, args.gameTick, this.EVENT_TYPES.GAME_DIPLOMACY_PEACE_DECLARED, data);
    }

    async createGameDiplomacyWarDeclared(args: InternalGameDiplomacyWarDeclaredEvent) {
        let data = args.status;

        return await this.createGameEvent(args.gameId, args.gameTick, this.EVENT_TYPES.GAME_DIPLOMACY_WAR_DECLARED, data);
    }

    async createPlayerDiplomacyStatusChanged(gameId: DBObjectId, gameTick: number, status: DiplomaticStatus<DBObjectId>) {
        const data = status;

        await this.createPlayerEvent(gameId, gameTick, status.playerIdFrom, this.EVENT_TYPES.PLAYER_DIPLOMACY_STATUS_CHANGED, data);
        await this.createPlayerEvent(gameId, gameTick, status.playerIdTo, this.EVENT_TYPES.PLAYER_DIPLOMACY_STATUS_CHANGED, data);
    }

};
