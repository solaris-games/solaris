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
        PLAYER_TECHNOLOGY_RECEIVED: 'playerTechnologyReceived',
        PLAYER_TECHNOLOGY_SENT: 'playerTechnologySent',
        PLAYER_CREDITS_RECEIVED: 'playerCreditsReceived',
        PLAYER_CREDITS_SENT: 'playerCreditsSent',
        PLAYER_CREDITS_SPECIALISTS_RECEIVED: 'playerCreditsSpecialistsReceived',
        PLAYER_CREDITS_SPECIALISTS_SENT: 'playerCreditsSpecialistsSent',
        PLAYER_RENOWN_RECEIVED: 'playerRenownReceived',
        PLAYER_RENOWN_SENT: 'playerRenownSent',
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

    constructor(eventModel, eventRepo, broadcastService,
        gameService, gameTickService, researchService, starService, starUpgradeService, tradeService,
        ledgerService, conversationService, combatService) {
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

        this.gameService.on('onPlayerJoined', (args) => this.createPlayerJoinedEvent(args.gameId, args.gameTick, args.player));
        this.gameService.on('onGameStarted', (args) => this.createGameStartedEvent(args.gameId, args.gameTick));
        this.gameService.on('onPlayerQuit', (args) => this.createPlayerQuitEvent(args.gameId, args.gameTick, args.player, args.alias));
        this.gameService.on('onPlayerDefeated', (args) => this.createPlayerDefeatedEvent(args.gameId, args.gameTick, args.player));
        
        this.combatService.on('onPlayerCombatStar', (args) => this.createPlayerCombatStarEvent(
            args.gameId, args.gameTick, args.owner, args.defenders, args.attackers, args.star, args.combatResult, args.captureResult));
        this.combatService.on('onPlayerCombatCarrier', (args) => this.createPlayerCombatCarrierEvent(
            args.gameId, args.gameTick, args.defenders, args.attackers, args.combatResult));
        
        this.gameTickService.on('onPlayerGalacticCycleCompleted', (args) => this.createPlayerGalacticCycleCompleteEvent(
            args.gameId, args.gameTick, args.player, args.creditsEconomy, args.creditsBanking, args.creditsSpecialists, args.experimentTechnology, args.experimentAmount, args.carrierUpkeep));
            
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

        this.ledgerService.on('onDebtAdded', (args) => this.createDebtAddedEvent(args.gameId, args.gameTick, args.debtor, args.creditor, args.amount));
        this.ledgerService.on('onDebtSettled', (args) => this.createDebtSettledEvent(args.gameId, args.gameTick, args.debtor, args.creditor, args.amount));
        this.ledgerService.on('onDebtForgiven', (args) => this.createDebtForgivenEvent(args.gameId, args.gameTick, args.debtor, args.creditor, args.amount));

        this.conversationService.on('onConversationCreated', (args) => this.createPlayerConversationCreated(args.gameId, args.gameTick, args.convo));
        this.conversationService.on('onConversationInvited', (args) => this.createPlayerConversationInvited(args.gameId, args.gameTick, args.convo, args.playerId));
        this.conversationService.on('onConversationLeft', (args) => this.createPlayerConversationLeft(args.gameId, args.gameTick, args.convo, args.playerId));
    }

    async deleteByGameId(gameId) {
        await this.eventRepo.deleteMany({
            gameId
        });
    }

    async createGameEvent(gameId, gameTick, type, data) {
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

    async createPlayerEvent(gameId, gameTick, playerId, type, data, isRead = false) {
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

    async getPlayerEvents(gameId, player, startTick = 0) {
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

    async getPlayerTradeEvents(gameId, gameTick, player, startTick = 0) {
        let tradeEvents = await this.eventRepo.find({
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
                    this.EVENT_TYPES.PLAYER_RENOWN_RECEIVED
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

    async markAllEventsAsRead(game, playerId) {
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

    async markEventAsRead(game, playerId, eventId) {
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

    async getUnreadCount(game, playerId) {
        return await this.eventRepo.count({
            gameId: game._id,
            playerId: playerId,
            read: false
        });
    }

    /* GLOBAL EVENTS */

    async createPlayerJoinedEvent(gameId, gameTick, player) {
        let data = {
            playerId: player._id,
            alias: player.alias
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PLAYER_JOINED, data);
    }

    async createPlayerQuitEvent(gameId, gameTick, player, alias) {
        let data = {
            playerId: player._id,
            alias
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PLAYER_QUIT, data);
    }

    async createPlayerDefeatedEvent(gameId, gameTick, player) {
        let data = {
            playerId: player._id,
            alias: player.alias
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PLAYER_DEFEATED, data);
    }

    async createPlayerAfkEvent(gameId, gameTick, player) {
        let data = {
            playerId: player._id,
            alias: player.alias
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PLAYER_AFK, data);
    }

    async createGameStartedEvent(gameId, gameTick) {
        let data = {};

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_STARTED, data);
    }

    async createGameEndedEvent(gameId, gameTick, rankingResult) {
        let data = {
            rankingResult
        };

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_ENDED, data);
    }

    async createGamePausedEvent(gameId, gameTick) {
        let data = {};

        return await this.createGameEvent(gameId, gameTick, this.EVENT_TYPES.GAME_PAUSED, data);
    }

    /* PLAYER EVENTS */

    async createPlayerGalacticCycleCompleteEvent(gameId, gameTick, player, 
        creditsEconomy, creditsBanking, creditsSpecialists, experimentTechnology, experimentAmount, carrierUpkeep) {
        let data = {
            creditsEconomy,
            creditsBanking,
            creditsSpecialists,
            experimentTechnology,
            experimentAmount,
            carrierUpkeep
        };

        return await this.createPlayerEvent(gameId, gameTick, player._id, this.EVENT_TYPES.PLAYER_GALACTIC_CYCLE_COMPLETE, data);
    }

    async createPlayerCombatStarEvent(gameId, gameTick, owner, defenders, attackers, star, combatResult, captureResult) {
        let data = {
            playerIdOwner: owner._id,
            playerIdDefenders: defenders.map(p => p._id),
            playerIdAttackers: attackers.map(p => p._id),
            starId: star._id,
            starName: star.name,
            captureResult
        };

        for (let defender of defenders) {
            let defenderCombatResult = combatResult
            defenderCombatResult.carriers = combatResult.carriers.map(c => {
                if (c.specialist && c.specialist.name === 'Scrambler' && (defender._id !== c.ownedByPlayerId.toString()) && c.after !== 0) {
                    return { ...c, before: '???', after: '???' }
                }
                return c
            })
            await this.createPlayerEvent(gameId, gameTick, defender._id, this.EVENT_TYPES.PLAYER_COMBAT_STAR, { ...data, combatResult: defenderCombatResult });
        }

        for (let attacker of attackers) {
            let attackerCombatResult = combatResult
            let bool = attackerCombatResult.star.specialist && attackerCombatResult.star.specialist.name === 'Scrambler' && attackerCombatResult.star.after !== 0
            attackerCombatResult.star = { ...combatResult.star, before: bool ? '???' : combatResult.star.before, after: bool ? '???' : combatResult.star.after }
            attackerCombatResult.carriers = combatResult.carriers.map(c => {
                if (c.specialist && c.specialist.name === 'Scrambler' && (attacker._id !== c.ownedByPlayerId.toString()) && c.after !== 0) {
                    return { ...c, before: '???', after: '???' }
                }
                return c
            })
            await this.createPlayerEvent(gameId, gameTick, attacker._id, this.EVENT_TYPES.PLAYER_COMBAT_STAR, { ...data, combatResult: attackerCombatResult });
        }
    }

    async createPlayerCombatCarrierEvent(gameId, gameTick, defenders, attackers, combatResult) {
        let data = {
            playerIdDefenders: defenders.map(p => p._id),
            playerIdAttackers: attackers.map(p => p._id),
            combatResult
        };

        for (let defender of defenders) {
            let defenderCombatResult = combatResult
            defenderCombatResult.carriers = combatResult.carriers.map(c => {
                if (c.specialist && c.specialist.name === 'Scrambler' && (defender._id !== c.ownedByPlayerId.toString()) && c.after !== 0) {
                    return { ...c, before: '???', after: '???' }
                }
                return c
            })
            await this.createPlayerEvent(gameId, gameTick, defender._id, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, { ...data, combatResult: defenderCombatResult });
        }

        for (let attacker of attackers) {
            let attackerCombatResult = combatResult
            attackerCombatResult.carriers = combatResult.carriers.map(c => {
                if (c.specialist && c.specialist.name === 'Scrambler' && (attacker._id !== c.ownedByPlayerId.toString()) && c.after !== 0) {
                    return { ...c, before: '???', after: '???' }
                }
                return c
            })
            await this.createPlayerEvent(gameId, gameTick, attacker._id, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, { ...data, combatResult: attackerCombatResult });
        }
    }

    async createResearchCompleteEvent(gameId, gameTick, playerId, technologyKey, technologyLevel, technologyKeyNext, technologyLevelNext) {
        let data = {
            technologyKey,
            technologyLevel,
            technologyKeyNext,
            technologyLevelNext
        };

        return await this.createPlayerEvent(gameId, gameTick, playerId, this.EVENT_TYPES.PLAYER_RESEARCH_COMPLETE, data);
    }

    async createTechnologyReceivedEvent(gameId, gameTick, fromPlayer, toPlayer, technology) {
        let data = {
            fromPlayerId: fromPlayer._id,
            technology
        };

        return await this.createPlayerEvent(gameId, gameTick, toPlayer._id, this.EVENT_TYPES.PLAYER_TECHNOLOGY_RECEIVED, data);
    }

    async createTechnologySentEvent(gameId, gameTick, fromPlayer, toPlayer, technology) {
        let data = {
            toPlayerId: toPlayer._id,
            technology
        };

        return await this.createPlayerEvent(gameId, gameTick, fromPlayer._id, this.EVENT_TYPES.PLAYER_TECHNOLOGY_SENT, data, true);
    }

    async createCreditsReceivedEvent(gameId, gameTick, fromPlayer, toPlayer, credits) {
        let data = {
            fromPlayerId: fromPlayer._id,
            credits
        };

        return await this.createPlayerEvent(gameId, gameTick, toPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_RECEIVED, data);
    }

    async createCreditsSentEvent(gameId, gameTick, fromPlayer, toPlayer, credits) {
        let data = {
            toPlayerId: toPlayer._id,
            credits
        };

        return await this.createPlayerEvent(gameId, gameTick, fromPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_SENT, data, true);
    }

    async createCreditsSpecialistsReceivedEvent(gameId, gameTick, fromPlayer, toPlayer, creditsSpecialists) {
        let data = {
            fromPlayerId: fromPlayer._id,
            creditsSpecialists
        };

        return await this.createPlayerEvent(gameId, gameTick, toPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_SPECIALISTS_RECEIVED, data);
    }

    async createCreditsSpecialistsSentEvent(gameId, gameTick, fromPlayer, toPlayer, creditsSpecialists) {
        let data = {
            toPlayerId: toPlayer._id,
            creditsSpecialists
        };

        return await this.createPlayerEvent(gameId, gameTick, fromPlayer._id, this.EVENT_TYPES.PLAYER_CREDITS_SPECIALISTS_SENT, data, true);
    }

    async createRenownReceivedEvent(gameId, gameTick, fromPlayer, toPlayer, renown) {
        let data = {
            fromPlayerId: fromPlayer._id,
            renown
        };

        return await this.createPlayerEvent(gameId, gameTick, toPlayer._id, this.EVENT_TYPES.PLAYER_RENOWN_RECEIVED, data);
    }

    async createRenownSentEvent(gameId, gameTick, fromPlayer, toPlayer, renown) {
        let data = {
            toPlayerId: toPlayer._id,
            renown
        };

        return await this.createPlayerEvent(gameId, gameTick, fromPlayer._id, this.EVENT_TYPES.PLAYER_RENOWN_SENT, data, true);
    }

    async createStarAbandonedEvent(gameId, gameTick, player, star) {
        let data = {
            starId: star._id,
            starName: star.name
        };

        return await this.createPlayerEvent(gameId, gameTick, player._id, this.EVENT_TYPES.PLAYER_STAR_ABANDONED, data, true);
    }

    async createInfrastructureBulkUpgraded(gameId, gameTick, player, upgradeReport) {
        let data = {
            upgradeReport
        };

        return await this.createPlayerEvent(gameId, gameTick, player._id, this.EVENT_TYPES.PLAYER_BULK_INFRASTRUCTURE_UPGRADED, data, true);
    }

    async createDebtAddedEvent(gameId, gameTick, debtorPlayerId, creditorPlayerId, amount) {
        // Debt added event is superfluous as we already have other events for when trades occur.
        // Just broadcast the event instead.

        this.broadcastService.gamePlayerDebtAdded(debtorPlayerId, creditorPlayerId, amount);
    }

    async createDebtSettledEvent(gameId, gameTick, debtorPlayerId, creditorPlayerId, amount) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        await this.createPlayerEvent(gameId, gameTick, debtorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_SETTLED, data, true);
        await this.createPlayerEvent(gameId, gameTick, creditorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_SETTLED, data, false);

        this.broadcastService.gamePlayerDebtSettled(debtorPlayerId, creditorPlayerId, amount);
    }

    async createDebtForgivenEvent(gameId, gameTick, debtorPlayerId, creditorPlayerId, amount) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        await this.createPlayerEvent(gameId, gameTick, debtorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_FORGIVEN, data, false);
        await this.createPlayerEvent(gameId, gameTick, creditorPlayerId, this.EVENT_TYPES.PLAYER_DEBT_FORGIVEN, data, true);

        this.broadcastService.gamePlayerDebtForgiven(debtorPlayerId, creditorPlayerId, amount);
    }

    async createPlayerStarSpecialistHired(gameId, gameTick, player, star, specialist) {
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

    async createPlayerCarrierSpecialistHired(gameId, gameTick, player, carrier, specialist) {
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

    async createPlayerConversationCreated(gameId, gameTick, convo) {
        let data = {
            conversationId: convo._id,
            createdBy: convo.createdBy,
            name: convo.name,
            participants: convo.participants
        };

        await this.createPlayerEvent(gameId, gameTick, convo.createdBy, this.EVENT_TYPES.PLAYER_CONVERSATION_CREATED, data, true);
    }

    async createPlayerConversationInvited(gameId, gameTick, convo, playerId) {
        let data = {
            conversationId: convo._id,
            name: convo.name,
            playerId
        };

        await this.createPlayerEvent(gameId, gameTick, playerId, this.EVENT_TYPES.PLAYER_CONVERSATION_INVITED, data);
    }

    async createPlayerConversationLeft(gameId, gameTick, convo, playerId) {
        let data = {
            conversationId: convo._id,
            name: convo.name,
            playerId
        };

        await this.createPlayerEvent(gameId, gameTick, playerId, this.EVENT_TYPES.PLAYER_CONVERSATION_LEFT, data, true);
    }

};
