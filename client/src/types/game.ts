import type { Game as CGame } from "solaris-common/src/api/types/common/game";
import type { Player as CPlayer } from "solaris-common/src/api/types/common/player";
import type { Star as CStar } from "solaris-common/src/api/types/common/star";
import type { Carrier as CCarrier } from "solaris-common/src/api/types/common/carrier";

export type Game = CGame<string>;

export type Player = CPlayer<string>;

export type Star = CStar<string>;

export type Carrier = CCarrier<string>;
