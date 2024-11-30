import type { ResearchTypeNotRandom } from "./player";

export interface TradeTechnology {
    name: ResearchTypeNotRandom;
    level: number;
    cost: number;
};

export interface TradeEvent<ID> {
    playerId: ID;
    type: string;
    data: any;
    sentDate: Date;
    sentTick: number;
};

export interface TradeEventTechnology {
    name: string;
    level: number;
    difference: number;
};
