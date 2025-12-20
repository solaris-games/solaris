import type { StarCaptureResult } from "../star";
import type { CombatResult } from "../combat";
import type {BulkUpgradeReport} from "../infrastructureUpgrade";
import type {BaseGameEvent} from "./game";

export interface BasePlayerEvent<ID> extends BaseGameEvent<ID> {
    playerId: ID;
}

export interface PlayerCombatStarEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCombatStar';
    data: {
        playerIdOwner: ID;
        playerIdDefenders: ID[];
        playerIdAttackers: ID[];
        starId: ID;
        starName: string;
        captureResult: StarCaptureResult<ID>;
        combatResult: CombatResult<ID>;
    };
}

export interface PlayerBulkInfrastructureUpgradedEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerBulkInfrastructureUpgraded',
    data: {
        upgradeReport: BulkUpgradeReport<ID>,
    }
}