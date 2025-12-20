import type { StarCaptureResult } from "../star";
import type { CombatResult } from "../combat";
import type {BulkUpgradeReport} from "../infrastructureUpgrade";

export interface BaseGameEvent<ID> {
    _id: ID;
    gameId: ID;
    playerId: ID | null;
    tick: number;
    type: string;
    read: boolean;
    date?: Date;
};

export interface PlayerCombatStarEvent<ID> extends BaseGameEvent<ID> {
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

export interface PlayerBulkInfrastructureUpgradedEvent<ID> extends BaseGameEvent<ID> {
    type: 'playerBulkInfrastructureUpgraded',
    data: {
        upgradeReport: BulkUpgradeReport<ID>,
    }
}

