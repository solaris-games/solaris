import type {
    Game as CGame,
    Player as CPlayer,
    Star as CStar,
    Carrier as CCarrier,
} from "@solaris/common";

export type Game = CGame<string>;
export type Player = CPlayer<string>;
export type Star = CStar<string>;
export type Carrier = CCarrier<string>;
