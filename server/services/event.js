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
        PLAYER_COMBAT_CARRIER: 'playerCombatCarrier',
        PLAYER_COMBAT_STAR: 'playerCombatStar',
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
    }

    constructor(eventModel) {
        this.eventModel = eventModel;
    }

    async createGameEvent(game, player, type, data) {
        let event = new this.eventModel({
            gameId: game._id,
            playerId: null,
            tick: game.state.tick,
            type,
            data
        });

        await event.save();
    }

    async createPlayerEvent(game, player, type, data) {
        let event = new this.eventModel({
            gameId: game._id,
            playerId: player._id,
            tick: game.state.tick,
            type,
            data
        });

        await event.save();
    }

    async getPlayerEvents(game, player) {
        return this.eventModel.find({
            gameId: game._id,
            playerId: {
                $in: [
                    player._id,
                    null
                ]
            }
        })
        .sort({
            tick: -1 // Sort by tick descending
        })
        .exec();
    }

    /* GLOBAL EVENTS */

    async createPlayerJoinedEvent(game, player) {
        let data = {
            playerId: player._id,
            alias: player.alias
        };

        return await this.createGameEvent(game, player, this.EVENT_TYPES.GAME_PLAYER_JOINED, data);
    }

    async createPlayerQuitEvent(game, player, alias) {
        let data = {
            playerId: player._id,
            alias
        };

        return await this.createGameEvent(game, player, this.EVENT_TYPES.GAME_PLAYER_QUIT, data);
    }

    async createPlayerDefeatedEvent(game, player) {
        let data = {
            playerId: player._id
        };

        return await this.createGameEvent(game, player, this.EVENT_TYPES.GAME_PLAYER_DEFEATED, data);
    }

    async createPlayerAfkEvent(game, player) {
        let data = {
            playerId: player._id
        };

        return await this.createGameEvent(game, player, this.EVENT_TYPES.GAME_PLAYER_AFK, data);
    }

    async createGameStartedEvent(game) {
        let data = {};

        return await this.createGameEvent(game, player, this.EVENT_TYPES.GAME_STARTED, data);
    }

    async createGameEndedEvent(game) {
        let data = {};

        return await this.createGameEvent(game, player, this.EVENT_TYPES.GAME_ENDED, data);
    }

    async createGamePausedEvent(game) {
        let data = {};

        return await this.createGameEvent(game, player, this.EVENT_TYPES.GAME_PAUSED, data);
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

        return await this.createPlayerEvent(game, player, this.EVENT_TYPES.PLAYER_GALACTIC_CYCLE_COMPLETE, data);
    }

    async createPlayerCombatStarEvent(game, defender, attacker, defenderStar, attackerCarrier, combatResult) {
        let data = {
            playerIdDefender: defender._id,
            playerIdAttacker: attacker._id,
            defenderStarId: defenderStar._id,
            attackerCarrierId: attackerCarrier._id,
            attackerCarrierName: attackerCarrier.name,
            combatResult
        };

        await this.createPlayerEvent(game, defender, this.EVENT_TYPES.PLAYER_COMBAT_STAR, data);
        await this.createPlayerEvent(game, attacker, this.EVENT_TYPES.PLAYER_COMBAT_STAR, data);
    }

    async createPlayerCombatCarrierEvent(game, defender, attacker, defenderStar, defenderCarrier, attackerCarrier, combatResult) {
        let data = {
            playerIdDefender: defender._id,
            playerIdAttacker: attacker._id,
            defenderStarId: defenderStar._id,
            defenderCarrierId: defenderCarrier._id,
            defenderCarrierName: defenderCarrier.name,
            attackerCarrierId: attackerCarrier._id,
            attackerCarrierName: attackerCarrier.name,
            combatResult
        };

        await this.createPlayerEvent(game, defender, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, data);
        await this.createPlayerEvent(game, attacker, this.EVENT_TYPES.PLAYER_COMBAT_CARRIER, data);
    }

    async createResearchCompleteEvent(game, player, technology) {
        let data = {
            technology
        };

        return await this.createPlayerEvent(game, player, this.EVENT_TYPES.PLAYER_RESEARCH_COMPLETE, data);
    }

    async createWarpGateBuiltEvent(game, player, star) {
        let data = {
            starId: star._id
        };

        return await this.createPlayerEvent(game, player, this.EVENT_TYPES.PLAYER_STAR_WARP_GATE_BUILT, data);
    }

    async createWarpGateDestroyedEvent(game, player, star) {
        let data = {
            starId: star._id
        };

        return await this.createPlayerEvent(game, player, this.EVENT_TYPES.PLAYER_STAR_WARP_GATE_DESTROYED, data);
    }

    async createTechnologyReceivedEvent(game, fromPlayer, toPlayer, technology) {
        let data = {
            fromPlayerId: fromPlayer._id,
            technology
        };

        return await this.createPlayerEvent(game, toPlayer, this.EVENT_TYPES.PLAYER_TECHNOLOGY_RECEIVED, data);
    }

    async createTechnologySentEvent(game, fromPlayer, toPlayer, technology) {
        let data = {
            toPlayerId: toPlayer._id,
            technology
        };

        return await this.createPlayerEvent(game, fromPlayer, this.EVENT_TYPES.PLAYER_TECHNOLOGY_SENT, data);
    }

    async createCreditsReceivedEvent(game, fromPlayer, toPlayer, credits) {
        let data = {
            fromPlayerId: fromPlayer._id,
            credits
        };

        return await this.createPlayerEvent(game, toPlayer, this.EVENT_TYPES.PLAYER_CREDITS_RECEIVED, data);
    }

    async createCreditsSentEvent(game, fromPlayer, toPlayer, credits) {
        let data = {
            toPlayerId: toPlayer._id,
            credits
        };

        return await this.createPlayerEvent(game, fromPlayer, this.EVENT_TYPES.PLAYER_CREDITS_SENT, data);
    }

    async createRenownReceivedEvent(game, fromPlayer, toPlayer, renown) {
        let data = {
            fromPlayerId: fromPlayer._id,
            renown
        };

        return await this.createPlayerEvent(game, toPlayer, this.EVENT_TYPES.PLAYER_RENOWN_RECEIVED, data);
    }

    async createRenownSentEvent(game, fromPlayer, toPlayer, renown) {
        let data = {
            toPlayerId: toPlayer._id,
            renown
        };

        return await this.createPlayerEvent(game, fromPlayer, this.EVENT_TYPES.PLAYER_RENOWN_SENT, data);
    }

    async createStarAbandonedEvent(game, player, star) {
        let data = {
            starId: star._id
        };

        return await this.createPlayerEvent(game, player, this.EVENT_TYPES.PLAYER_STAR_ABANDONED, data);
    }

    async createStarCapturedEvent(game, player, star, creditsReward) {
        let data = {
            starId: star._id,
            creditsReward
        };

        return await this.createPlayerEvent(game, player, this.EVENT_TYPES.PLAYER_STAR_CAPTURED, data);
    }

    async createCarrierBuiltEvent(game, player, star, carrier) {
        let data = {
            starId: star._id,
            carrierId: carrier._id,
            carrierName: carrier.name
        };

        return await this.createPlayerEvent(game, player, this.EVENT_TYPES.PLAYER_CARRIER_BUILT, data);
    }

    async createInfrastructureBulkUpgraded(game, player, upgradeReport) {
        let data = {
            upgradeReport
        };

        return await this.createPlayerEvent(game, player, this.EVENT_TYPES.PLAYER_BULK_INFRASTRUCTURE_UPGRADED, data);
    }

};
