import {Game} from "./types/Game";
import {Player} from "./types/Player";
import StarUpgradeService from "./starUpgrade";
import {IEventService} from "./types/IEventService";
import { IStatisticsService } from './types/IStatisticsService';

const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

export default class BasicAIService {
    starUpgradeService: StarUpgradeService;
    statisticsService: IStatisticsService;

    constructor(starUpgradeService: StarUpgradeService, statisticsService: IStatisticsService) {
        this.starUpgradeService = starUpgradeService;
        this.statisticsService = statisticsService;
    }

    async _doBasicLogic(eventService: IEventService, game: Game, player: Player, isFirstTickOfCycle: boolean, isLastTickOfCycle: boolean) {
        if (isFirstTickOfCycle) {
            await this._playFirstTick(eventService, game, player);
        } else if (isLastTickOfCycle) {
            await this._playLastTick(eventService, game, player);
        }

        // TODO: Not sure if this is an issue but there was an occassion during debugging
        // where the player credits amount was less than 0, I assume its the AI spending too much somehow
        // so adding this here just in case but need to investigate.
        player.credits = Math.max(0, player.credits);
    }

    async _playFirstTick(eventService: IEventService, game: Game, player: Player) {
        if (!player.credits || player.credits < 0) {
            return
        }

        // On the first tick after production:
        // 1. Bulk upgrade X% of credits to ind and sci.
        let creditsToSpendSci = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE);
        let creditsToSpendInd = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE);

        if (creditsToSpendSci) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'science', creditsToSpendSci, false, eventService, this.statisticsService);
        }

        if (creditsToSpendInd) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'industry', creditsToSpendInd, false, eventService, this.statisticsService);
        }
    }

    async _playLastTick(eventService: IEventService, game: Game, player: Player) {
        if (!player.credits || player.credits <= 0) {
            return
        }

        // On the last tick of the cycle:
        // 1. Spend remaining credits upgrading economy.
        let creditsToSpendEco = Math.floor(player.credits / 100 * LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE);

        if (creditsToSpendEco) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'economy', creditsToSpendEco, false, eventService, this.statisticsService);
        }
    }
}