import { Game } from "../types/Game";

const moment = require('moment');
const fluxes = require('../config/game/flux.json');

export default class GameFluxService {

    FLUX = [
        this.applyJanFlux,
        this.applyFebFlux,
        this.applyMarFlux,
        this.applyAprFlux,
        this.applyMayFlux,
        this.applyJunFlux,
        this.applyJulFlux,
        this.applyAugFlux,
        this.applySepFlux,
        this.applyOctFlux,
        this.applyNovFlux,
        this.applyDecFlux
    ];

    getCurrentFlux() {
        return this.getFluxById(moment().utc().month() + 1);
    }

    getFluxById(fluxId: number | null) {
        if (fluxId == null) {
            return null;
        }

        return fluxes.find(f => f.id === fluxId);
    }

    applyCurrentFlux(game: Game) {
        const fluxId = moment().utc().month();
        const applyFlux = this.FLUX[fluxId];

        applyFlux(game);

        game.settings.general.fluxId = fluxId + 1;
    }

    applyJanFlux(game: Game) {
        // Banking rewards are increased.
        game.constants.player.bankingCycleRewardMultiplier = 50;
    }

    applyFebFlux(game: Game) {
        // Capture rewards are increased.
        game.constants.star.captureRewardMultiplier = 25;
    }

    applyMarFlux(game: Game) {
        // Research contribution of stars is increased
        game.constants.research.sciencePointMultiplier = 2;
    }

    applyAprFlux(game: Game) {
        // Capital stars have additional defender bonus
        game.constants.star.homeStarDefenderBonusMultiplier = 2;
    }

    applyMayFlux(game: Game) {
        // Experimentation rewards are increased
        game.constants.research.experimentationMultiplier = 2;
    }

    applyJunFlux(game: Game) {
        // Increased trade cost
        game.settings.player.tradeCost = 50;
    }

    applyJulFlux(game: Game) {
        // Fixed weapons level
        game.settings.technology.startingTechnologyLevel.weapons = 7;
        game.settings.technology.researchCosts.weapons = 'none';
    }

    applyAugFlux(game: Game) {
        // Disabled defender bonus
        game.settings.specialGalaxy.defenderBonus = 'disabled';
    }

    applySepFlux(game: Game) {
        // Faster production cycles
        game.settings.galaxy.productionTicks -= Math.max(14, game.settings.galaxy.productionTicks - 6);
    }

    applyOctFlux(game: Game) {
        // Increased spec bans
        game.constants.specialists.monthlyBanAmount = 6;
    }

    applyNovFlux(game: Game) {
        // Increased starting credits/tech
        game.settings.player.startingCredits = Math.min(3000, game.settings.player.startingCredits * 2);
        game.settings.player.startingCreditsSpecialists = Math.min(100, game.settings.player.startingCreditsSpecialists * 2);
    }

    applyDecFlux(game: Game) {
        // Increased rank from finishing games
        game.constants.player.rankRewardMultiplier = 2;
    }
}
