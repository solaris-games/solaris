import { Game as CGame } from "solaris-common/src/api/types/common/game";
import { Player as CPlayer } from "solaris-common/src/api/types/common/player";
import { Star as CStar } from "solaris-common/src/api/types/common/star";
import { Carrier as CCarrier } from "solaris-common/src/api/types/common/carrier";

export type Game = CGame<string>;

export type Player = CPlayer<string>;

export type Star = CStar<string>;

export type Carrier = CCarrier<string>;
