const moment = require('moment');

module.exports = class EventService {

    EVENT_TYPES = {
        GAME_PLAYER_JOINED: 'gamePlayerJoined',
        GAME_PLAYER_QUIT: 'gamePlayerQuit',
        GAME_PLAYER_DEFEATED: 'gamePlayerDefeated',
        GAME_PLAYER_AFK: 'gamePlayerAFK',
        GAME_STARTED: 'gameStarted',
        GAME_ENDED: 'gameEnded',
        GAME_PAUSED: 'gamePaused',

        PLAYER_GALACTIC_CYCLE_COMPLETE: 'playerGalacticCycleComplete',
        PLAYER_COMBAT_STAR: 'playerCombatStar',
        PLAYER_COMBAT_CARRIER: 'playerCombatCarrier',
        PLAYER_RESEARCH_COMPLETE: 'playerResearchComplete',
        PLAYER_STAR_WARP_GATE_BUILT: 'playerStarWarpGateBuilt',
        PLAYER_STAR_WARP_GATE_DESTROYED: 'playerStarWarpGateDestroyed',
        PLAYER_TECHNOLOGY_RECEIVED: 'playerTechnologyReceived',
        PLAYER_TECHNOLOGY_SENT: 'playerTechnologySent',
        PLAYER_CREDITS_RECEIVED: 'playerCreditsReceived',
        PLAYER_CREDITS_SENT: 'playerCreditsSent',
        PLAYER_RENOWN_RECEIVED: 'playerRenownReceived',
        PLAYER_RENOWN_SENT: 'playerRenownSent',
        PLAYER_STAR_ABANDONED: 'playerStarAbandoned',
        PLAYER_STAR_CAPTURED: 'playerStarCaptured',
        PLAYER_CARRIER_BUILT: 'playerCarrierBuilt',
        PLAYER_BULK_INFRASTRUCTURE_UPGRADED: 'playerBulkInfrastructureUpgraded',
        PLAYER_DEBT_SETTLED: 'playerDebtSettled',
        PLAYER_DEBT_FORGIVEN: 'playerDebtForgiven',
        PLAYER_STAR_SPECIALIST_HIRED: 'playerStarSpecialistHired',
        PLAYER_CARRIER_SPECIALIST_HIRED: 'playerCarrierSpecialistHired',
        PLAYER_CONVERSATION_CREATED: 'playerConversationCreated',
        PLAYER_CONVERSATION_INVITED: 'playerConversationInvited',
        PLAYER_CONVERSATION_LEFT: 'playerConversationLeft'
    }

    constructor(eventModel, broadcastService,
        gameService, gameTickService, researchService, starService, starUpgradeService, tradeService,
        ledgerService, conversationService) {
        this.eventModel = eventModel;
        this.broadcastService = broadcastService;
        this.gameService = gameService;
        this.gameTickService = gameTickService;
        this.researchService = researchService;
        this.starService = starService;
        this.starUpgradeService = starUpgradeService;
        this.tradeService = tradeService;
        this.ledgerService = ledgerService;
        this.conversationService = conversationService;

        this.gameService.on('onPlayerJoined', (args) => this.createPlayerJoinedEvent(args.game, args.player));
        this.gameService.on('onGameStarted', (args) => this.createGameStartedEvent(args.game));
        this.gameService.on('onPlayerQuit', (args) => this.createPlayerQuitEvent(args.game, args.player, args.alias));
        this.gameService.on('onGameEnded', (args) => this.createGameEndedEvent(args.game));
        this.gameService.on('onPlayerDefeated', (args) => this.createPlayerDefeatedEvent(args.game, args.player));
        
        this.gameTickService.on('onPlayerCombatStar', (args) => this.createPlayerCombatStarEvent(
            args.game, args.defender, args.attackers, args.star, args.combatResult));
        this.gameTickService.on('onPlayerCombatCarrier', (args) => this.createPlayerCombatCarrierEvent(
            args.game, args.defender, args.attackers, args.combatResult));
        this.gameTickService.on('onStarCaptured', (args) => this.createStarCapturedEvent(args.game, args.player, args.star, args.capturedBy, args.captureReward));
        this.gameTickService.on('onPlayerGalacticCycleCompleted', (args) => this.createPlayerGalacticCycleCompleteEvent(
            args.game, args.player, args.creditsEconomy, args.creditsBanking, args.experimentTechnology, args.experimentAmount));
            
        this.gameTickService.on('onPlayerAfk', (args) => this.createPlayerAfkEvent(args.game, args.player));
        this.gameTickService.on('onPlayerDefeated', (args) => this.createPlayerDefeatedEvent(args.game, args.player));
        this.gameTickService.on('onGameEnded', (args) => this.createGameEndedEvent(args.game));
        
        this.gameTickService.on('onPlayerResearchCompleted', (args) => this.createResearchCompleteEvent(args.game, args.player, args.technology));

        this.starService.on('onPlayerStarAbandoned', (args) => this.createStarAbandonedEvent(args.game, args.player, args.star));
        
        this.starUpgradeService.on('onPlayerWarpGateBuilt', (args) => this.createWarpGateBuiltEvent(args.game, args.player, args.star));
        this.starUpgradeService.on('onPlayerWarpGateDestroyed', (args) => this.createWarpGateDestroyedEvent(args.game, args.player, args.star));
        this.starUpgradeService.on('onPlayerCarrierBuilt', (args) => this.createCarrierBuiltEvent(args.game, args.player, args.star, args.carrier));
        this.starUpgradeService.on('onPlayerInfrastructureBulkUpgraded', (args) => this.createInfrastructureBulkUpgraded(args.game, args.player, args.upgradeSummary));

        this.tradeService.on('onPlayerCreditsReceived', (args) => this.createCreditsReceivedEvent(args.game, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerCreditsSent', (args) => this.createCreditsSentEvent(args.game, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerRenownReceived', (args) => this.createRenownReceivedEvent(args.game, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerRenownSent', (args) => this.createRenownSentEvent(args.game, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerTechnologyReceived', (args) => this.createTechnologyReceivedEvent(args.game, args.fromPlayer, args.toPlayer, args.technology));
        this.tradeService.on('onPlayerTechnologySent', (args) => this.createTechnologySentEvent(args.game, args.fromPlayer, args.toPlayer, args.technology));

        this.ledgerService.on('onDebtAdded', (args) => this.createDebtAddedEvent(args.game, args.debtor, args.creditor, args.amount));
        this.ledgerService.on('onDebtSettled', (args) => this.createDebtSettledEvent(args.game, args.debtor, args.creditor, args.amount));
        this.ledgerService.on('onDebtForgiven', (args) => this.createDebtForgivenEvent(args.game, args.debtor, args.creditor, args.amount));

        this.conversationService.on('onConversationCreated', (args) => this.createPlayerConversationCreated(args.game, args.convo));
        this.conversationService.on('onConversationInvited', (args) => this.createPlayerConversationInvited(args.game, args.convo, args.playerId));
        this.conversationService.on('onConversationLeft', (args) => this.createPlayerConversationLeft(args.game, args.convo, args.playerId));
    }

    async createGameEvent(game, type, data) {
        let event = new this.eventModel({
            gameId: game._id,
            playerId: null,
            tick: game.state.tick,
            type,
            data
        });

        await event.save();
    }

    async createPlayerEvent(game, playerId, type, data) {
        let event = new this.eventModel({
            gameId: game._id,
            playerId,
            tick: game.state.tick,
            type,
            data
        });

        await event.save();
    }

    async getPlayerEvents(game, player, startTick = 0) {
        return this.eventModel.find({
            gameId: game._id,
            tick: { $gte: startTick },
            playerId: {
                $in: [
                    player._id,
                    null
                ]
            }
        })
        .sort({
            tick: -1, // Sort by tick descending
            _id: -1
        })
        .lean({ defaults: true })
        .exec();
    }

    async getPlayerTradeEvents(game, player, startTick = 0) {
        let tradeEvents = await this.eventModel.find({
            gameId: game._id,
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
                    this.EVENT_TYPES.PLAYER_RENOWN_SENT,
                    this.EVENT_TYPES.PLAYER_RENOWN_RECEIVED
                ]
            }
        })
        .sort({
            tick: -1, // Sort by tick descending
            _id: -1
        })
        .lean({ defaults: true })
        .exec();

        // Calculate when the event was created.
        // TODO: Is this more efficient than storing the UTC in the document itself?
        tradeEvents.forEach(t => {
            t.date = moment(t._id.getTimestamp())
        });

        return tradeEvents;
    }

    /* GLOBAL EVENTS */

    async createPlayerJoinedEvent(game, player) {
        let data = {
            playerId: player._id,
            alias: player.alias
        };

        return await this.createGameEvent(game, this.EVENT_TYPES.GAME_PLAYER_JOINED, data);
    }

    async createPlayerQuitEvent(game, player, alias) {
        let data = {
            playerId: player._id,
            alias
        };

        return await this.createGameEvent(game, this.EVENT_TYPES.GAME_PLAYER_QUIT, data);
    }

    async createPlayerDefeatedEvent(game, player) {
        let data = {
            playerId: player._id
        };

        return await this.createGameEvent(game, this.EVENT_TYPES.GAME_PLAYER_DEFEATED, data);
    }

    async createPlayerAfkEvent(game, player) {
        let data = {
            playerId: player._id
        };

        return await this.createGameEvent(game, this.EVENT_TYPES.GAME_PLAYER_AFK, data);
    }

    async createGameStartedEvent(game) {
        let data = {};

        return await this.createGameEvent(game, this.EVENT_TYPES.GAME_STARTED, data);
    }

    async createGameEndedEvent(game) {
        let data = {};

        return await this.createGameEvent(game, this.EVENT_TYPES.GAME_ENDED, data);
    }

    async createGamePausedEvent(game) {
        let data = {};

        return await this.createGameEvent(game, this.EVENT_TYPES.GAME_PAUSED, data);
    }

    /* PLAYER EVENTS */

    async createPlayerGalacticCycleCompleteEvent(game, player, 
        creditsEconomy, creditsBanking, experimentTechnology, experimentAmount) {
        let data = {
            creditsEconomy,
            creditsBanking,
            experimentTechnology,
            experimentAmount
        };

        return await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_GALACTIC_CYCLE_COMPLETE, data);
    }

    async createPlayerCombatStarEvent(game, defender, attackers, star, combatResult) {
        let data = {
            playerIdDefender: defender._id,
            playerIdAttackers: attackers.map(p => p._id),
            starId: star._id,
            combatResult
        };

        await this.createPlayerEvent(game, defender._id, this.EVENT_TYPES.PLAYER_COMBAT_STAR, data);

        for (let attacker of attackers) {
            await this.createPlayerEvent(game, attacker._id, this.EVENT_TYPES.PLAYER_COMBAT_STAR, data);
        }
    }

    async createPlayerCombatCarrierEvent(game, defender, attackers, combatResult) {
        let data = {
            playerIdDefender: defender._id,
            playerIdAttackers: attackers.map(p => p._id),
            combatResult
        };

        await this.createPlayerEvent(game, defender._id, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, data);

        for (let attacker of attackers) {
            await this.createPlayerEvent(game, attacker._id, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, data);
        }
    }

    async createResearchCompleteEvent(game, player, technology) {
        let data = {
            technology
        };

        return await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_RESEARCH_COMPLETE, data);
    }

    async createWarpGateBuiltEvent(game, player, star) {
        let data = {
            starId: star._id
        };

        return await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_STAR_WARP_GATE_BUILT, data);
    }

    async createWarpGateDestroyedEvent(game, player, star) {
        let data = {
            starId: star._id
        };

        return await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_STAR_WARP_GATE_DESTROYED, data);
    }

    async createTechnologyReceivedEvent(game, fromPlayer, toPlayer, technology) {
        let data = {
            fromPlayerId: fromPlayer._id,
            technology
        };

        return await this.createPlayerEvent(game, toPlayer._id, this.EVENT_TYPES.PLAYER_TECHNOLOGY_RECEIVED, data);
    }

    async createTechnologySentEvent(game, fromPlayer, toPlayer, technology) {
        let data = {
            toPlayerId: toPlayer._id,
            technology
        };

        return await this.createPlayerEvent(game, fromPlayer._id, this.EVENT_TYPES.PLAYER_TECHNOLOGY_SENT, data);
    }

    async createCreditsReceivedEvent(game, fromPlayer, toPlayer, credits) {
        let data = {
            fromPlayerId: fromPlayer._id,
            credits
        };

        return await this.createPlayerEvent(game, toPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_RECEIVED, data);
    }

    async createCreditsSentEvent(game, fromPlayer, toPlayer, credits) {
        let data = {
            toPlayerId: toPlayer._id,
            credits
        };

        return await this.createPlayerEvent(game, fromPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_SENT, data);
    }

    async createRenownReceivedEvent(game, fromPlayer, toPlayer, renown) {
        let data = {
            fromPlayerId: fromPlayer._id,
            renown
        };

        return await this.createPlayerEvent(game, toPlayer._id, this.EVENT_TYPES.PLAYER_RENOWN_RECEIVED, data);
    }

    async createRenownSentEvent(game, fromPlayer, toPlayer, renown) {
        let data = {
            toPlayerId: toPlayer._id,
            renown
        };

        return await this.createPlayerEvent(game, fromPlayer._id, this.EVENT_TYPES.PLAYER_RENOWN_SENT, data);
    }

    async createStarAbandonedEvent(game, player, star) {
        let data = {
            starId: star._id
        };

        return await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_STAR_ABANDONED, data);
    }

    async createStarCapturedEvent(game, player, star, capturedBy, creditsReward) {
        let data = {
            starId: star._id,
            capturedBy: capturedBy._id,
            creditsReward
        };

        return await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_STAR_CAPTURED, data);
    }

    async createCarrierBuiltEvent(game, player, star, carrier) {
        let data = {
            starId: star._id,
            carrierId: carrier._id,
            carrierName: carrier.name
        };

        return await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_CARRIER_BUILT, data);
    }

    async createInfrastructureBulkUpgraded(game, player, upgradeReport) {
        let data = {
            upgradeReport
        };

        return await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_BULK_INFRASTRUCTURE_UPGRADED, data);
    }

    async createDebtAddedEvent(game, debtorPlayerId, creditorPlayerId, amount) {
        // Debt added event is superfluous as we already have other events for when trades occur.
        // Just broadcast the event instead.

        this.broadcastService.gamePlayerDebtAdded(game, debtorPlayerId, creditorPlayerId, amount);
    }

    async createDebtSettledEvent(game, debtorPlayerId, creditorPlayerId, amount) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        await this.createPlayerEvent(game, debtorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_SETTLED, data);
        await this.createPlayerEvent(game, creditorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_SETTLED, data);

        this.broadcastService.gamePlayerDebtSettled(game, debtorPlayerId, creditorPlayerId, amount);
    }

    async createDebtForgivenEvent(game, debtorPlayerId, creditorPlayerId, amount) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        await this.createPlayerEvent(game, debtorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_FORGIVEN, data);
        await this.createPlayerEvent(game, creditorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_FORGIVEN, data);

        this.broadcastService.gamePlayerDebtForgiven(game, debtorPlayerId, creditorPlayerId, amount);
    }

    async createPlayerStarSpecialistHired(game, player, star, specialist) {
        let data = {
            starId: star._id,
            specialistId: specialist.id,
            // Need to keep these values just in case specs are changed in future.
            specialistName: specialist.name,
            specialistDescription: specialist.description
        }

        await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_STAR_SPECIALIST_HIRED, data);
    }

    async createPlayerCarrierSpecialistHired(game, player, carrier, specialist) {
        let data = {
            carrierId: carrier._id,
            carrierName: carrier.name, // Carriers may be destroyed so we need to keep track of the name separately
            specialistId: specialist.id,
            // Need to keep these values just in case specs are changed in future.
            specialistName: specialist.name,
            specialistDescription: specialist.description
        }

        await this.createPlayerEvent(game, player._id, this.EVENT_TYPES.PLAYER_CARRIER_SPECIALIST_HIRED, data);
    }

    async createPlayerConversationCreated(game, convo) {
        let data = {
            conversationId: convo._id,
            createdBy: convo.createdBy,
            name: convo.name,
            participants: convo.participants
        };

        await this.createPlayerEvent(game, convo.createdBy, this.EVENT_TYPES.PLAYER_CONVERSATION_CREATED, data);
    }

    async createPlayerConversationInvited(game, convo, playerId) {
        let data = {
            conversationId: convo._id,
            name: convo.name,
            playerId
        };

        await this.createPlayerEvent(game, playerId, this.EVENT_TYPES.PLAYER_CONVERSATION_INVITED, data);
    }

    async createPlayerConversationLeft(game, convo, playerId) {
        let data = {
            conversationId: convo._id,
            name: convo.name,
            playerId
        };

        await this.createPlayerEvent(game, playerId, this.EVENT_TYPES.PLAYER_CONVERSATION_LEFT, data);
    }

};
