import {
    BaseGameEvent,
    EVENT_TYPES, GameDiplomacyPeaceDeclaredEvent, GameDiplomacyWarDeclaredEvent,
    GameEndedEvent,
    GameEvent,
    GamePlayerAfkEvent, GamePlayerBadgePurchasedEvent,
    GamePlayerDefeatedEvent,
    GamePlayerJoinedEvent,
    GamePlayerQuitEvent,
    GameStartedEvent,
    LedgerType,
    PlayerBulkInfrastructureUpgradedEvent, PlayerCarrierSpecialistHiredEvent,
    PlayerCombatCarrierEvent,
    PlayerCombatStarEvent, PlayerConversationCreatedEvent, PlayerConversationInvitedEvent, PlayerConversationLeftEvent,
    PlayerCreditsReceivedEvent,
    PlayerCreditsSentEvent, PlayerDebtForgivenEvent, PlayerDebtSettledEvent, PlayerDiplomacyStatusChangedEvent,
    PlayerEvent,
    PlayerGalacticCycleCompleteEvent,
    PlayerGiftReceivedEvent,
    PlayerGiftSentEvent,
    PlayerRenownReceivedEvent,
    PlayerRenownSentEvent,
    PlayerResearchCompleteEvent,
    PlayerSpecialistTokensReceivedEvent,
    PlayerSpecialistTokensSentEvent,
    PlayerStarAbandonedEvent,
    PlayerStarDiedEvent,
    PlayerStarReignitedEvent, PlayerStarSpecialistHiredEvent,
    PlayerTechnologyReceivedEvent,
    PlayerTechnologySentEvent, TradeEventTechnology
} from 'solaris-common';
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
import { Model } from "mongoose";

export default class EventService {
    eventModel: Model<GameEvent<DBObjectId>>;
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
            gameId,
        });
    }

    async createGameEvent<Ev extends GameEvent<DBObjectId>>(gameId: DBObjectId, gameTick: number, type: Ev['type'], data: Ev['data']) {
        const event = new this.eventModel({
            gameId,
            playerId: null,
            tick: gameTick,
            type,
            data,
            read: null
        });

        await event.save();
    }

    async createPlayerEvent<Ev extends PlayerEvent<DBObjectId>>(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, type: Ev['type'], data: Ev['data'], isRead: boolean = false) {
        const event = new this.eventModel({
            gameId,
            playerId,
            tick: gameTick,
            type,
            data,
            read: isRead
        });

        await event.save();
    }

    async getPlayerEvents(gameId: DBObjectId, player: Player, page: number, pageSize: number, category: string | null): Promise<{ count: number, events: BaseGameEvent<DBObjectId>[] }> {
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
        const data = {
            playerId: args.playerId,
            alias: args.playerAlias
        };

        return await this.createGameEvent<GamePlayerJoinedEvent<DBObjectId>>(args.gameId, args.gameTick, 'gamePlayerJoined', data);
    }

    async createPlayerQuitEvent(args: InternalGamePlayerQuitEvent) {
        const data = {
            playerId: args.playerId,
            alias: args.playerAlias
        };

        return await this.createGameEvent<GamePlayerQuitEvent<DBObjectId>>(args.gameId, args.gameTick, 'gamePlayerQuit', data);
    }

    async createPlayerDefeatedEvent(args: InternalGamePlayerDefeatedEvent) {
        const data = {
            playerId: args.playerId,
            alias: args.playerAlias,
            openSlot: args.openSlot
        };

        return await this.createGameEvent<GamePlayerDefeatedEvent<DBObjectId>>(args.gameId, args.gameTick, 'gamePlayerDefeated', data);
    }

    async createPlayerAfkEvent(args: InternalGamePlayerAFKEvent) {
        const data = {
            playerId: args.playerId,
            alias: args.playerAlias
        };

        return await this.createGameEvent<GamePlayerAfkEvent<DBObjectId>>(args.gameId, args.gameTick, 'gamePlayerAFK', data);
    }

    async createGameStartedEvent(args: InternalGameEvent) {
        return await this.createGameEvent<GameStartedEvent<DBObjectId>>(args.gameId, args.gameTick, 'gameStarted', {});
    }

    async createGameEndedEvent(args: InternalGameEndedEvent) {
        const data = {
            rankingResult: args.rankingResult
        };

        return await this.createGameEvent<GameEndedEvent<DBObjectId>>(args.gameId, args.gameTick, 'gameEnded', data);
    }

    /* PLAYER EVENTS */

    async createPlayerGalacticCycleCompleteEvent(data: InternalPlayerGalacticCycleCompletedEvent) {
        return await this.createPlayerEvent<PlayerGalacticCycleCompleteEvent<DBObjectId>>(data.gameId, data.gameTick, data.playerId, 'playerGalacticCycleComplete', data);
    }

    async createPlayerCombatStarEvent(gameId: DBObjectId, gameTick: number, owner: Player, defenders: Player[], attackers: Player[], star: Star, combatResult: CombatResult, captureResult: StarCaptureResult) {
        const data = {
            playerIdOwner: owner._id,
            playerIdDefenders: defenders.map(p => p._id),
            playerIdAttackers: attackers.map(p => p._id),
            starId: star._id,
            starName: star.name,
            captureResult
        };

        for (let defender of defenders) {
            const defenderCombatResult: CombatResult = this.combatService.sanitiseCombatResult(combatResult, defender);

            await this.createPlayerEvent<PlayerCombatStarEvent<DBObjectId>>(gameId, gameTick, defender._id, 'playerCombatStar', { ...data, combatResult: defenderCombatResult });
        }

        for (let attacker of attackers) {
            const attackerCombatResult: CombatResult = this.combatService.sanitiseCombatResult(combatResult, attacker);

            await this.createPlayerEvent<PlayerCombatStarEvent<DBObjectId>>(gameId, gameTick, attacker._id, 'playerCombatStar', { ...data, combatResult: attackerCombatResult });
        }
    }

    async createPlayerCombatCarrierEvent(gameId: DBObjectId, gameTick: number, defenders: Player[], attackers: Player[], combatResult: CombatResult) {
        const data = {
            playerIdDefenders: defenders.map(p => p._id),
            playerIdAttackers: attackers.map(p => p._id),
            combatResult
        };

        for (let defender of defenders) {
            const defenderCombatResult: CombatResult = this.combatService.sanitiseCombatResult(combatResult, defender);
            
            await this.createPlayerEvent<PlayerCombatCarrierEvent<DBObjectId>>(gameId, gameTick, defender._id, 'playerCombatCarrier', { ...data, combatResult: defenderCombatResult });
        }

        for (let attacker of attackers) {
            const attackerCombatResult: CombatResult = this.combatService.sanitiseCombatResult(combatResult, attacker);

            await this.createPlayerEvent<PlayerCombatCarrierEvent<DBObjectId>>(gameId, gameTick, attacker._id, 'playerCombatCarrier', { ...data, combatResult: attackerCombatResult });
        }
    }

    async createResearchCompleteEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, technologyKey: string, technologyLevel: number, technologyKeyNext: string, technologyLevelNext: number) {
        const data = {
            technologyKey,
            technologyLevel,
            technologyKeyNext,
            technologyLevelNext
        };

        return await this.createPlayerEvent<PlayerResearchCompleteEvent<DBObjectId>>(gameId, gameTick, playerId, 'playerResearchComplete', data);
    }

    async createTechnologyReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, technology: TradeEventTechnology) {
        const data = {
            fromPlayerId: fromPlayer._id,
            technology
        };

        return await this.createPlayerEvent<PlayerTechnologyReceivedEvent<DBObjectId>>(gameId, gameTick, toPlayer._id, 'playerTechnologyReceived', data);
    }

    async createTechnologySentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, technology: TradeEventTechnology) {
        const data = {
            toPlayerId: toPlayer._id,
            technology
        };

        return await this.createPlayerEvent<PlayerTechnologySentEvent<DBObjectId>>(gameId, gameTick, fromPlayer._id, 'playerTechnologySent', data, true);
    }

    async createCreditsReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, credits: number) {
        const data = {
            fromPlayerId: fromPlayer._id,
            credits
        };

        return await this.createPlayerEvent<PlayerCreditsReceivedEvent<DBObjectId>>(gameId, gameTick, toPlayer._id, 'playerCreditsReceived', data);
    }

    async createCreditsSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, credits: number) {
        const data = {
            toPlayerId: toPlayer._id,
            credits
        };

        return await this.createPlayerEvent<PlayerCreditsSentEvent<DBObjectId>>(gameId, gameTick, fromPlayer._id, 'playerCreditsSent', data, true);
    }

    async createCreditsSpecialistsReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, creditsSpecialists: number) {
        const data = {
            fromPlayerId: fromPlayer._id,
            creditsSpecialists
        };

        return await this.createPlayerEvent<PlayerSpecialistTokensReceivedEvent<DBObjectId>>(gameId, gameTick, toPlayer._id, 'playerCreditsSpecialistsReceived', data);
    }

    async createCreditsSpecialistsSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, creditsSpecialists: number) {
        const data = {
            toPlayerId: toPlayer._id,
            creditsSpecialists
        };

        return await this.createPlayerEvent<PlayerSpecialistTokensSentEvent<DBObjectId>>(gameId, gameTick, fromPlayer._id, 'playerCreditsSpecialistsSent', data, true);
    }

    async createRenownReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, renown: number) {
        const data = {
            fromPlayerId: fromPlayer._id,
            renown
        };

        return await this.createPlayerEvent<PlayerRenownReceivedEvent<DBObjectId>>(gameId, gameTick, toPlayer._id, 'playerRenownReceived', data);
    }

    async createRenownSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, renown: number) {
        const data = {
            toPlayerId: toPlayer._id,
            renown
        };

        return await this.createPlayerEvent<PlayerRenownSentEvent<DBObjectId>>(gameId, gameTick, fromPlayer._id, 'playerRenownSent', data, true);
    }

    async createGiftReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, carrier: Carrier, star: Star) {
        const data = {
            fromPlayerId: fromPlayer._id,
            carrierId: carrier._id,
            carrierName: carrier.name,
            carrierShips: carrier.ships || 0,
            starId: star._id,
            starName: star.name
        };

        return await this.createPlayerEvent<PlayerGiftReceivedEvent<DBObjectId>>(gameId, gameTick, toPlayer._id, 'playerGiftReceived', data);
    }

    async createGiftSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, carrier: Carrier, star: Star) {
        const data = {
            toPlayerId: toPlayer._id,
            carrierId: carrier._id,
            carrierName: carrier.name,
            carrierShips: carrier.ships || 0,
            starId: star._id,
            starName: star.name
        };

        return await this.createPlayerEvent<PlayerGiftSentEvent<DBObjectId>>(gameId, gameTick, fromPlayer._id, 'playerGiftSent', data, true);
    }

    async createStarAbandonedEvent(gameId: DBObjectId, gameTick: number, player: Player, star: Star) {
        const data = {
            starId: star._id,
            starName: star.name
        };

        return await this.createPlayerEvent<PlayerStarAbandonedEvent<DBObjectId>>(gameId, gameTick, player._id, 'playerStarAbandoned', data, true);
    }

    async createStarDiedEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, starId: DBObjectId, starName: string) {
        const data = {
            starId,
            starName
        };

        await this.createPlayerEvent<PlayerStarDiedEvent<DBObjectId>>(gameId, gameTick, playerId, 'playerStarDied', data);
    }

    async createStarReignitedEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, starId: DBObjectId, starName: string) {
        const data = {
            starId,
            starName
        };

        await this.createPlayerEvent<PlayerStarReignitedEvent<DBObjectId>>(gameId, gameTick, playerId, 'playerStarReignited', data);
    }

    async createInfrastructureBulkUpgraded(gameId: DBObjectId, gameTick: number, player: Player, upgradeReport: BulkUpgradeReport) {
        const data = {
            upgradeReport
        };

        return await this.createPlayerEvent<PlayerBulkInfrastructureUpgradedEvent<DBObjectId>>(gameId, gameTick, player._id, 'playerBulkInfrastructureUpgraded', data, true);
    }

    async createDebtAddedEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        // Debt added event is superfluous as we already have other events for when trades occur.
        // Just broadcast the event instead.

        this.broadcastService.gamePlayerDebtAdded(debtorPlayerId, creditorPlayerId, amount, ledgerType);
    }

    async createDebtSettledEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        const data = {
            debtorPlayerId,
            creditorPlayerId,
            amount,
            ledgerType
        };

        await this.createPlayerEvent<PlayerDebtSettledEvent<DBObjectId>>(gameId, gameTick, debtorPlayerId, 'playerDebtSettled', data, true);
        await this.createPlayerEvent<PlayerDebtSettledEvent<DBObjectId>>(gameId, gameTick, creditorPlayerId, 'playerDebtSettled', data, false);

        this.broadcastService.gamePlayerDebtSettled(debtorPlayerId, creditorPlayerId, amount, ledgerType);
    }

    async createDebtForgivenEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        const data = {
            debtorPlayerId,
            creditorPlayerId,
            amount,
            ledgerType
        };

        await this.createPlayerEvent<PlayerDebtForgivenEvent<DBObjectId>>(gameId, gameTick, debtorPlayerId, 'playerDebtForgiven', data, false);
        await this.createPlayerEvent<PlayerDebtForgivenEvent<DBObjectId>>(gameId, gameTick, creditorPlayerId, 'playerDebtForgiven', data, true);

        this.broadcastService.gamePlayerDebtForgiven(debtorPlayerId, creditorPlayerId, amount, ledgerType);
    }

    async createPlayerStarSpecialistHired(gameId: DBObjectId, gameTick: number, player: Player, star: Star, specialist: Specialist) {
        const data = {
            starId: star._id,
            starName: star.name,
            specialistId: specialist.id,
            // Need to keep these values just in case specs are changed in future.
            specialistName: specialist.name,
            specialistDescription: specialist.description
        }

        await this.createPlayerEvent<PlayerStarSpecialistHiredEvent<DBObjectId>>(gameId, gameTick, player._id, 'playerStarSpecialistHired', data, true);
    }

    async createPlayerCarrierSpecialistHired(gameId: DBObjectId, gameTick: number, player: Player, carrier: Carrier, specialist: Specialist) {
        const data = {
            carrierId: carrier._id,
            carrierName: carrier.name, // Carriers may be destroyed so we need to keep track of the name separately
            specialistId: specialist.id,
            // Need to keep these values just in case specs are changed in future.
            specialistName: specialist.name,
            specialistDescription: specialist.description
        }

        await this.createPlayerEvent<PlayerCarrierSpecialistHiredEvent<DBObjectId>>(gameId, gameTick, player._id, 'playerCarrierSpecialistHired', data, true);
    }

    async createPlayerConversationCreated(gameId: DBObjectId, gameTick: number, convo: Conversation) {
        const data = {
            conversationId: convo._id,
            createdBy: convo.createdBy!,
            name: convo.name,
            participants: convo.participants
        };

        await this.createPlayerEvent<PlayerConversationCreatedEvent<DBObjectId>>(gameId, gameTick, convo.createdBy!, 'playerConversationCreated', data, true);
    }

    async createPlayerConversationInvited(gameId: DBObjectId, gameTick: number, convo: Conversation, playerId: DBObjectId) {
        const data = {
            conversationId: convo._id,
            name: convo.name,
            playerId
        };

        await this.createPlayerEvent<PlayerConversationInvitedEvent<DBObjectId>>(gameId, gameTick, playerId, 'playerConversationInvited', data);
    }

    async createPlayerConversationLeft(gameId: DBObjectId, gameTick: number, convo: Conversation, playerId: DBObjectId) {
        const data = {
            conversationId: convo._id,
            name: convo.name,
            playerId
        };

        await this.createPlayerEvent<PlayerConversationLeftEvent<DBObjectId>>(gameId, gameTick, playerId, 'playerConversationLeft', data, true);
    }

    async createGamePlayerBadgePurchased(args: InternalGamePlayerBadgePurchasedEvent) {
        const data = {
            purchasedByPlayerId: args.purchasedByPlayerId,
            purchasedByPlayerAlias: args.purchasedByPlayerAlias,
            purchasedForPlayerId: args.purchasedForPlayerId,
            purchasedForPlayerAlias: args.purchasedForPlayerAlias,
            badgeKey: args.badgeKey,
            badgeName: args.badgeName
        };

        return await this.createGameEvent<GamePlayerBadgePurchasedEvent<DBObjectId>>(args.gameId, args.gameTick, 'gamePlayerBadgePurchased', data);
    }

    async _deleteGameDiplomacyDeclarationsInTick(gameId: DBObjectId, gameTick: number, status: DiplomaticStatus<DBObjectId>) {
        await this.eventRepo.deleteMany({
            gameId,
            tick: gameTick,
            type: {
                $in: [
                    EVENT_TYPES.GAME_DIPLOMACY_PEACE_DECLARED, 
                    EVENT_TYPES.GAME_DIPLOMACY_WAR_DECLARED
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
        const data = args.status;

        return await this.createGameEvent<GameDiplomacyPeaceDeclaredEvent<DBObjectId>>(args.gameId, args.gameTick, 'gameDiplomacyPeaceDeclared', data);
    }

    async createGameDiplomacyWarDeclared(args: InternalGameDiplomacyWarDeclaredEvent) {
        const data = args.status;

        return await this.createGameEvent<GameDiplomacyWarDeclaredEvent<DBObjectId>>(args.gameId, args.gameTick, 'gameDiplomacyWarDeclared', data);
    }

    async createPlayerDiplomacyStatusChanged(gameId: DBObjectId, gameTick: number, status: DiplomaticStatus<DBObjectId>) {
        const data = status;

        await this.createPlayerEvent<PlayerDiplomacyStatusChangedEvent<DBObjectId>>(gameId, gameTick, status.playerIdFrom, 'playerDiplomacyStatusChanged', data);
        await this.createPlayerEvent<PlayerDiplomacyStatusChangedEvent<DBObjectId>>(gameId, gameTick, status.playerIdTo, 'playerDiplomacyStatusChanged', data);
    }
};
