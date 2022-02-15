import { DBObjectId } from "./DBObjectId";
import { ResearchType } from "./Player";

export interface TradeTechnology {
    name: ResearchType;
    level: number;
    cost: number;
};

export interface TradeEvent {
    playerId: DBObjectId;
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
