import { DBObjectId } from "../../services/types/DBObjectId";
import { InfrastructureType } from "../../services/types/Star";
import {boolean, numberAdv, object, objectId, string, stringEnumeration, Validator} from "../validate";

export interface StarUpgradeInfrastructureRequest {
    starId: DBObjectId;
}

export const parseStarUpgradeInfrastructureRequest = object({
   starId: objectId,
});

export interface StarUpgradeInfrastructureBulkRequest {
    upgradeStrategy: string;
    infrastructure: InfrastructureType;
    amount: number;
};

const infrastructureValidator = stringEnumeration<InfrastructureType, InfrastructureType[]>(['economy', 'industry', 'science']);

export const parseStarUpgradeInfrastructureBulkRequest: Validator<StarUpgradeInfrastructureBulkRequest> = object({
    infrastructure: infrastructureValidator,
    upgradeStrategy: string,
    amount: numberAdv({
        integer: true,
        sign: 'positive',
    }),
});

export interface ScheduledStarUpgradeInfrastructureBulkRequest {
    infrastructureType: InfrastructureType;
    buyType: string;
    amount: number;
    repeat: boolean;
    tick: number;
};

export const parseScheduledStarUpgradeInfrastructureBulkRequest: Validator<ScheduledStarUpgradeInfrastructureBulkRequest> = object({
    infrastructureType: infrastructureValidator,
    buyType: string,
    amount: numberAdv({
        integer: true,
        sign: 'positive',
    }),
    repeat: boolean,
    tick: numberAdv({
        integer: true,
        sign: 'positive',
    }),
});

export type ScheduledStarUpgradeToggleRepeat = {
    actionId: DBObjectId;
};

export const parseScheduledStarUpgradeToggleRepeat: Validator<ScheduledStarUpgradeToggleRepeat> = object({
    actionId: objectId
});

export interface ScheduledStarUpgradeTrash {
    actionId: DBObjectId;
}

export const parseScheduledStarUpgradeTrashRepeat: Validator<ScheduledStarUpgradeTrash> = object({
    actionId: objectId
});

export interface StarDestroyInfrastructureRequest {
    starId: DBObjectId;
};

export const parseStarDestroyInfrastructureRequest: Validator<StarDestroyInfrastructureRequest> = object({
    starId: objectId,
});

export interface StarBuildCarrierRequest {
    starId: DBObjectId;
    ships: number;
};

export const parseStarBuildCarrierRequest: Validator<StarBuildCarrierRequest> = object({
    starId: objectId,
    ships: numberAdv({
        integer: true,
        sign: 'positive',
        range: {
            from: 1,
        },
    }),
});

export interface StarAbandonStarRequest {
    starId: DBObjectId;
};

export const parseStarAbandonStarRequest: Validator<StarAbandonStarRequest> = object({
    starId: objectId,
});

export interface StarToggleBulkIgnoreStatusRequest {
    starId: DBObjectId;
    infrastructureType: InfrastructureType;
};

export const parseStarToggleBulkIgnoreStatusRequest: Validator<StarToggleBulkIgnoreStatusRequest> = object({
    starId: objectId,
    infrastructureType: infrastructureValidator,
});

export interface StarSetBulkIgnoreAllStatusRequest {
    starId: DBObjectId;
    ignoreStatus: boolean;
};

export const parseStarSetBulkIgnoreAllStatusRequest: Validator<StarSetBulkIgnoreAllStatusRequest> = object({
    starId: objectId,
    ignoreStatus: boolean,
});

