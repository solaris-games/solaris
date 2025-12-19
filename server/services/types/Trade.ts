import { DBObjectId } from "./DBObjectId";
import { ResearchTypeNotRandom } from "solaris-common";

export interface TradeTechnology {
    name: ResearchTypeNotRandom;
    level: number;
    cost: number;
};

export interface TradeEvent {
    playerId: DBObjectId;
    type: string;
    data: any; // todo
    sentDate: Date;
    sentTick: number;
};

export interface TradeEventTechnology {
    name: string;
    level: number;
    difference: number;
};
