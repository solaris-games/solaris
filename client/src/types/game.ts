import { Game as CGame } from "solaris-common/src/api/types/common/game";
import { Player as CPlayer } from "solaris-common/src/api/types/common/player";
import { Star as CStar } from "solaris-common/src/api/types/common/star";

export type Game = CGame<string>;

export type Player = CPlayer<string>;

export type Star = CStar<string>;
