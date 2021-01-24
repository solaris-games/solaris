const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

module.exports = class AIService {

    constructor(starUpgradeService) {
        this.starUpgradeService = starUpgradeService;
    }

    async play(game, player) {
        if (!player.defeated) {
            throw new Error('The player is not under AI control.');
        }

        let isFirstTick = game.state.tick % game.settings.galaxy.productionTicks === 1;
        let isLastTick = game.state.tick % game.settings.galaxy.productionTicks === game.settings.galaxy.productionTicks - 1;

        if (isFirstTick) {
            await this._playFirstTick(game, player);
        } else if (isLastTick) {
            await this._playLastTick(game, player);
        }
    }

    async _playFirstTick(game, player) {
        // On the first tick after production:
        // 1. Bulk upgrade X% of credits to ind and sci.
        let creditsToSpendSci = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE);
        let creditsToSpendInd = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE);

        await this.starUpgradeService.upgradeBulk(game, player, 'science', creditsToSpendSci, false);
        await this.starUpgradeService.upgradeBulk(game, player, 'industry', creditsToSpendInd, false);
    }

    async _playLastTick(game, player) {
        // On the last tick of the cycle:
        // 1. Spend remaining credits upgrading economy.
        let creditsToSpendEco = Math.floor(player.credits / 100 * LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE);

        await this.starUpgradeService.upgradeBulk(game, player, 'economy', creditsToSpendEco, false);
    }

};
